// Gói dịch vụ & giới hạn lượt tô (Mục 6). Chỉ tính 1 lượt khi bé thực sự bắt đầu tô (thao tác đầu tiên).
import { getDb } from '../config/db.js';
import { PLANS } from '../config/constants.js';
import { vnDayStart, addDays } from '../utils/time.js';
import { HttpError } from '../utils/http.js';

export function activeSubscription(userId, at = new Date()) {
  const iso = at.toISOString();
  return getDb()
    .prepare(
      `SELECT * FROM subscriptions WHERE user_id = ? AND starts_at <= ? AND ends_at > ?
       ORDER BY CASE plan WHEN 'year' THEN 0 ELSE 1 END, ends_at DESC LIMIT 1`,
    )
    .get(userId, iso, iso);
}

const usedSince = (userId, fromIso) =>
  getDb().prepare('SELECT COUNT(*) AS c FROM usage_log WHERE user_id = ? AND used_at >= ?').get(userId, fromIso).c;

export function planStatus(userId, at = new Date()) {
  const sub = activeSubscription(userId, at);
  if (!sub) {
    const from = vnDayStart(at);
    const used = usedSince(userId, from);
    return {
      plan: 'free',
      limit: PLANS.free.limit.count,
      used,
      remaining: Math.max(0, PLANS.free.limit.count - used),
      resetsAt: addDays(from, 1).toISOString(),
      endsAt: null,
    };
  }
  if (sub.plan === 'year') return { plan: 'year', limit: null, used: usedSince(userId, sub.starts_at), remaining: null, resetsAt: null, endsAt: sub.ends_at };
  const used = usedSince(userId, sub.starts_at);
  const limit = PLANS.month.limit.count;
  return { plan: 'month', limit, used, remaining: Math.max(0, limit - used), resetsAt: sub.ends_at, endsAt: sub.ends_at };
}

/** Các chế độ tính lượt: tô cá nhân (Theo mẫu, Sáng tạo). Đấu trường & tô cùng nhau không tính. */
export const COUNTED_MODES = new Set(['template', 'free']);

/** Tính 1 lượt cho artwork (idempotent). Hết lượt → lỗi 402 để client hiện màn hình mời nâng cấp. */
export function consume(userId, artwork) {
  if (artwork.counted || !COUNTED_MODES.has(artwork.mode)) return planStatus(userId);
  const status = planStatus(userId);
  if (status.remaining !== null && status.remaining <= 0) {
    throw new HttpError(402, 'quota_exceeded', 'Đã hết lượt tô', { plan: status });
  }
  getDb().prepare('INSERT INTO usage_log (user_id, artwork_id) VALUES (?, ?)').run(userId, artwork.id);
  getDb().prepare('UPDATE artworks SET counted = 1 WHERE id = ?').run(artwork.id);
  return planStatus(userId);
}

/** Kích hoạt / gia hạn gói sau khi thanh toán thành công. */
export function activatePlan(userId, plan, paymentId) {
  const days = PLANS[plan].days;
  const now = new Date();
  const current = getDb()
    .prepare('SELECT * FROM subscriptions WHERE user_id = ? AND plan = ? AND ends_at > ? ORDER BY ends_at DESC LIMIT 1')
    .get(userId, plan, now.toISOString());
  if (current && plan === 'year') {
    // Gia hạn gói năm: nối tiếp thời hạn.
    const ends = addDays(current.ends_at, days).toISOString();
    getDb().prepare('UPDATE subscriptions SET ends_at = ? WHERE id = ?').run(ends, current.id);
    return { plan, endsAt: ends };
  }
  // Gia hạn gói tháng khi còn hạn: kỳ mới xếp nối tiếp kỳ hiện tại (không mất ngày đã mua).
  // Gói mới khác (hoặc lần đầu) bắt đầu ngay; gói năm được ưu tiên hơn gói tháng khi cùng còn hạn.
  const starts = current ? new Date(current.ends_at) : now;
  const ends = addDays(starts, days).toISOString();
  getDb()
    .prepare('INSERT INTO subscriptions (user_id, plan, starts_at, ends_at, payment_id) VALUES (?, ?, ?, ?, ?)')
    .run(userId, plan, starts.toISOString(), ends, paymentId);
  return { plan, endsAt: ends };
}
