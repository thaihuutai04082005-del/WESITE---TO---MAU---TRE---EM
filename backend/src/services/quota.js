// Gói dịch vụ & giới hạn lượt tô (Mục 6). Chỉ tính 1 lượt khi bé thực sự bắt đầu tô (thao tác đầu tiên).
import { getDb, tx } from '../config/db.js';
import { PLANS } from '../config/constants.js';
import { vnDayStart, addDays } from '../utils/time.js';
import { HttpError, forbidden } from '../utils/http.js';
import { freeThemeIds } from '../../../shared/themeAccess.mjs';

export async function activeSubscription(userId, at = new Date()) {
  const iso = at.toISOString();
  return await getDb()
    .prepare(
      `SELECT * FROM subscriptions WHERE user_id = ? AND starts_at <= ? AND ends_at > ?
       ORDER BY CASE plan WHEN 'year' THEN 0 ELSE 1 END, ends_at DESC LIMIT 1`,
    )
    .get(userId, iso, iso);
}

export const isVip = async (userId) => !!(await activeSubscription(userId));

/** Free opens the first five active themes in each age group, using the library's display order. */
export async function themeAccess(userId, at = new Date(), themes = null) {
  if (userId && await activeSubscription(userId, at)) return { vip: true, allowedIds: null };
  const rows = themes ?? await getDb().prepare('SELECT id, age_group FROM themes WHERE active = 1 ORDER BY sort, id').all();
  return { vip: false, allowedIds: freeThemeIds(rows, PLANS.free.themesPerAge) };
}

export async function canAccessTheme(userId, themeId) {
  const iso = new Date().toISOString();
  // The same per-age display order as freeThemeIds, without a second network trip.
  const row = await getDb().prepare(`SELECT (
    EXISTS (SELECT 1 FROM subscriptions WHERE user_id = ? AND starts_at <= ? AND ends_at > ?)
    OR EXISTS (SELECT 1 FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY COALESCE(age_group, '6-8') ORDER BY sort, id) AS position
      FROM themes WHERE active = 1
    ) allowed WHERE id = ? AND position <= ?)
  ) AS allowed`).get(userId ?? null, iso, iso, themeId, PLANS.free.themesPerAge);
  return !!row.allowed;
}

export async function assertThemeAccess(userId, themeId) {
  if (!await canAccessTheme(userId, themeId)) throw forbidden('theme_vip_required');
}

export async function planStatus(userId, at = new Date()) {
  const iso = at.toISOString();
  const from = vnDayStart(at);
  const row = await getDb().prepare(`SELECT s.plan, s.starts_at, s.ends_at,
    (SELECT COUNT(*) FROM usage_log WHERE user_id = ? AND used_at >= COALESCE(s.starts_at, ?)) AS used
    FROM (SELECT 1 AS singleton) base LEFT JOIN (
      SELECT plan, starts_at, ends_at FROM subscriptions WHERE user_id = ? AND starts_at <= ? AND ends_at > ?
      ORDER BY CASE plan WHEN 'year' THEN 0 ELSE 1 END, ends_at DESC LIMIT 1
    ) s ON 1 = 1`).get(userId, from, userId, iso, iso);
  if (!row.plan) {
    const used = row.used;
    return {
      plan: 'free',
      vip: false,
      limit: PLANS.free.limit.count,
      used,
      remaining: Math.max(0, PLANS.free.limit.count - used),
      resetsAt: addDays(from, 1).toISOString(),
      endsAt: null,
    };
  }
  // VIP (Tháng hoặc Năm): tô không giới hạn.
  return {
    plan: row.plan,
    vip: true,
    limit: null,
    used: row.used,
    remaining: null,
    resetsAt: null,
    endsAt: row.ends_at,
  };
}

/** Các chế độ tính lượt: tô cá nhân (Theo mẫu, Sáng tạo). Đấu trường & tô cùng nhau không tính. */
export const COUNTED_MODES = new Set(['template', 'free']);

/** Tính 1 lượt cho artwork (idempotent). Hết lượt → lỗi 402 để client hiện màn hình mời nâng cấp. */
export async function consume(userId, artwork) {
  return tx(async () => {
    const fresh = await getDb().prepare('SELECT counted FROM artworks WHERE id = ? AND user_id = ?').get(artwork.id, userId);
    if (!fresh) throw new HttpError(404, 'artwork_not_found');
    // Recheck even already-counted drafts: an expired subscription cannot keep editing VIP themes.
    const picture = await getDb().prepare('SELECT p.is_card, o.theme_id FROM pictures p JOIN objects o ON o.id = p.object_id WHERE p.id = ?').get(artwork.picture_id);
    if (picture && !picture.is_card) await assertThemeAccess(userId, picture.theme_id);
    if (fresh.counted || !COUNTED_MODES.has(artwork.mode)) return await planStatus(userId);
    const status = await planStatus(userId);
    if (status.remaining !== null && status.remaining <= 0) {
      throw new HttpError(402, 'quota_exceeded', 'Đã hết lượt tô', { plan: status });
    }
    await getDb().prepare('INSERT INTO usage_log (user_id, artwork_id) VALUES (?, ?)').run(userId, artwork.id);
    await getDb().prepare('UPDATE artworks SET counted = 1 WHERE id = ?').run(artwork.id);
    return await planStatus(userId);
  });
}

/** Kích hoạt / gia hạn gói sau khi thanh toán thành công. */
export async function activatePlan(userId, plan, paymentId) {
  const days = PLANS[plan].days;
  const now = new Date();
  const current = await getDb()
    .prepare('SELECT * FROM subscriptions WHERE user_id = ? AND plan = ? AND ends_at > ? ORDER BY ends_at DESC LIMIT 1')
    .get(userId, plan, now.toISOString());
  if (current && plan === 'year') {
    // Gia hạn gói năm: nối tiếp thời hạn.
    const ends = addDays(current.ends_at, days).toISOString();
    await getDb().prepare('UPDATE subscriptions SET ends_at = ? WHERE id = ?').run(ends, current.id);
    return { plan, endsAt: ends };
  }
  // Gia hạn gói tháng khi còn hạn: kỳ mới xếp nối tiếp kỳ hiện tại (không mất ngày đã mua).
  // Gói mới khác (hoặc lần đầu) bắt đầu ngay; gói năm được ưu tiên hơn gói tháng khi cùng còn hạn.
  const starts = current ? new Date(current.ends_at) : now;
  const ends = addDays(starts, days).toISOString();
  await getDb()
    .prepare('INSERT INTO subscriptions (user_id, plan, starts_at, ends_at, payment_id) VALUES (?, ?, ?, ?, ?)')
    .run(userId, plan, starts.toISOString(), ends, paymentId);
  return { plan, endsAt: ends };
}
