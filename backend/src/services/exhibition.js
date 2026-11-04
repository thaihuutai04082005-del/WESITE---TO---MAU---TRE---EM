import { asyncMap } from '../utils/asyncArray.js';
// Hội trường triển lãm (Đợt 2 — docs/ke-hoach-chu-ky-trien-lam.md, Phần 2).
//
// Lịch (giờ Việt Nam, cố định 1 tuần):
//   Thứ 2 00:00 → Chủ nhật 20:00 : trưng tranh vòng K, mở thả cảm xúc
//   Thứ 7 00:00 → Chủ nhật 20:00 : mở cổng gửi tranh cho vòng K+1 (hội trường vẫn trưng vòng K)
//   Chủ nhật 20:00               : khoá cảm xúc, đóng cổng gửi, xét danh hiệu vòng K
//   Thứ 2 00:00                  : mở vòng K+1; tranh chưa duyệt kịp tự chuyển sang vòng sau
// round_key = ngày thứ Hai (giờ VN) của tuần trưng bày, dạng 'YYYY-MM-DD'.
import { getDb, parseJson, tx } from '../config/db.js';
import { EXHIBITION } from '../config/constants.js';
import * as Picture from '../models/picture.js';
import { coverageScore } from './scoringEngine.js';
import { activeSubscription } from './quota.js';
import { notify } from './notifications.js';
import { VN_OFFSET_MS } from '../utils/time.js';
import { badRequest, forbidden, notFound } from '../utils/http.js';
import { areFriends } from '../controllers/social.controller.js';

const DAY = 86400000;
const HOUR = 3600000;

// ---------------- Đồng hồ ----------------
// Ngoài production có thể lệch đồng hồ để thử lịch (EXHIBITION_CLOCK=ISO) — giống CAPTCHA_FIXED.
let testNow = null;
export function setClockForTest(d) {
  testNow = d ? new Date(d) : null;
}
export function now() {
  if (testNow) return new Date(testNow);
  const fake = process.env.NODE_ENV !== 'production' && process.env.EXHIBITION_CLOCK;
  if (fake) {
    // Đồng hồ giả chạy tiếp từ mốc đã đặt tính từ lúc server khởi động.
    return new Date(Date.parse(fake) + (Date.now() - BOOT));
  }
  return new Date();
}
const BOOT = Date.now();

// ---------------- Lịch ----------------
/** Ngày thứ Hai (giờ VN) của tuần chứa `d`. */
export function mondayKey(d) {
  const t = new Date(d.getTime() + VN_OFFSET_MS);
  const back = (t.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - back)).toISOString().slice(0, 10);
}
/** Mốc giờ VN: (ngày thứ Hai `key` + `days` ngày) lúc `hour` giờ → Date UTC. */
const at = (key, days, hour = 0) => new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY + hour * HOUR - VN_OFFSET_MS);
export const shiftKey = (key, weeks) =>
  at(key, 7 * weeks, 7)
    .toISOString()
    .slice(0, 10);

export function roundTimes(key) {
  return {
    key,
    displayStart: at(key, 0),
    lockAt: at(key, 6, 20), // Chủ nhật 20:00
    displayEnd: at(key, 7),
    submitOpen: at(key, -2), // thứ 7 tuần trước
    submitClose: at(key, -1, 20), // Chủ nhật 20:00 tuần trước
  };
}

export function schedule(t = now()) {
  const cur = roundTimes(mondayKey(t));
  const next = roundTimes(shiftKey(cur.key, 1));
  // Cổng của vòng tới đã đóng (tối Chủ nhật) → báo mốc mở của vòng sau nữa.
  const gate = t < next.submitClose ? next : roundTimes(shiftKey(cur.key, 2));
  return {
    now: t.toISOString(),
    current: cur.key,
    lockAt: cur.lockAt.toISOString(),
    reactionsOpen: t < cur.lockAt,
    nextRound: next.key,
    nextRoundStart: next.displayStart.toISOString(),
    submitOpen: t >= next.submitOpen && t < next.submitClose,
    submitOpensAt: gate.submitOpen.toISOString(),
    submitClosesAt: next.submitClose.toISOString(),
  };
}

// ---------------- Điều kiện tranh (máy tự kiểm) ----------------
const ACTIVE = "('pending', 'approved', 'removed')";

export const activeEntryFor = async (artworkId) =>
  await getDb().prepare(`SELECT * FROM exhibition_entries WHERE artwork_id = ? AND status IN ${ACTIVE}`).get(artworkId);

/** Hội trường chỉ có một bảng chung: mọi tranh tô ở chế độ Sáng tạo (kể cả thẻ hiếm, tranh chủ đề) đều được. null = không đúng loại (điều 3). */
function boardOf(artwork) {
  return artwork.mode === 'free' ? 'free' : null;
}

async function startedAt(artwork) {
  const u = await getDb().prepare('SELECT MIN(used_at) AS t FROM usage_log WHERE artwork_id = ?').get(artwork.id);
  return Date.parse(u?.t || artwork.created_at);
}

/**
 * Kiểm tra nội quy phần máy tự làm (điều 1, 2, 3, 4, 8). Điều 5 (lem) đã bỏ vì tô tay có khóa vùng.
 * @returns {{ board: string|null, failures: number[] }}
 */
export async function checkArtwork(artwork, prepared) {
  const picture = prepared ? prepared.picture : await Picture.findPicture(artwork.picture_id);
  const manifest = prepared ? prepared.manifest : Picture.manifestOf(picture);
  const data = parseJson(artwork.data, {});
  const failures = [];
  const board = boardOf(artwork);
  if (!data.signature) failures.push(1);
  const coverage = coverageScore(manifest, data.fills || {});
  if (artwork.status !== 'completed' || coverage < EXHIBITION.minCoverage) failures.push(2);
  if (!board) failures.push(3);
  if (prepared ? prepared.activeEntry : await activeEntryFor(artwork.id)) failures.push(4);
  const filled = Object.keys(data.fills || {}).length;
  const elapsed = Date.parse(artwork.completed_at || artwork.updated_at) - (prepared ? prepared.startedAt : await startedAt(artwork));
  if (elapsed < Math.max(EXHIBITION.minMs, filled * EXHIBITION.msPerRegion)) failures.push(8);
  return { board, failures, picture, data };
}

/** Build the same checks for a whole owned-artwork list with bounded database reads. */
export async function prepareArtworkChecks(artworks, pictures) {
  if (!artworks.length) return new Map();
  const ids = artworks.map(a => a.id);
  const marks = ids.map(() => '?').join(',');
  const [active, usage, source] = await Promise.all([
    getDb().prepare(`SELECT DISTINCT artwork_id FROM exhibition_entries WHERE artwork_id IN (${marks}) AND status IN ${ACTIVE}`).all(...ids),
    getDb().prepare(`SELECT artwork_id,MIN(used_at) AS t FROM usage_log WHERE artwork_id IN (${marks}) GROUP BY artwork_id`).all(...ids),
    pictures || Picture.findManifests(artworks.map(a => a.picture_id)),
  ]);
  const submitted = new Set(active.map(row => row.artwork_id));
  const times = new Map(usage.map(row => [row.artwork_id, row.t]));
  const manifests = new Map();
  for (const [id, picture] of source) {
    try { manifests.set(id, Picture.manifestOf(picture)); } catch { /* Each broken artwork remains ineligible. */ }
  }
  return new Map(artworks.map(a => [a.id, { picture:source.get(a.picture_id), manifest:manifests.get(a.picture_id),
    activeEntry:submitted.has(a.id), startedAt:Date.parse(times.get(a.id) || a.created_at) }]));
}

const perRound = async (userId) => EXHIBITION.perRound[(await activeSubscription(userId))?.plan] ?? EXHIBITION.perRound.free;
const usedInRound = async (userId, key) =>
  (
    await getDb()
      .prepare("SELECT COUNT(*) AS c FROM exhibition_entries WHERE user_id = ? AND round_key = ? AND status IN ('pending', 'approved')")
      .get(userId, key)
  ).c;

/** Tự duyệt: tranh gần như không có nét cọ tự do, hoặc bé "ngoan" (3 tranh liên tiếp được duyệt, chưa vi phạm điều 6–7). */
async function autoApprove(userId, data) {
  // Nét tô tay đã khóa vùng (có `region`) không thể vẽ hình tự do nên không tính vào "nét cọ tự do".
  const brush = (data.strokes || []).filter((s) => s.tool === 'brush' && !s.region);
  const points = brush.reduce((n, s) => n + (s.points?.length || 0), 0);
  if (brush.length <= EXHIBITION.autoBrushStrokes && points <= EXHIBITION.autoBrushPoints) return true;
  const db = getDb();
  if (await db.prepare('SELECT 1 FROM exhibition_entries WHERE user_id = ? AND reject_rule IN (6, 7)').get(userId)) return false;
  const last = await db
    .prepare(
      "SELECT status FROM exhibition_entries WHERE user_id = ? AND status IN ('approved', 'rejected', 'removed') ORDER BY COALESCE(reviewed_at, submitted_at) DESC LIMIT ?",
    )
    .all(userId, EXHIBITION.trustedStreak);
  return last.length === EXHIBITION.trustedStreak && last.every((e) => e.status === 'approved');
}

// ---------------- Gửi / rút tranh ----------------
export async function status(userId) {
  await maintain();
  const s = schedule();
  return { schedule: s, limit: await perRound(userId), used: await usedInRound(userId, s.nextRound) };
}

export async function submit(user, artworkId) {
  await maintain();
  const s = schedule();
  if (!s.submitOpen) throw badRequest('exhibit_closed');
  const artwork = await getDb().prepare('SELECT * FROM artworks WHERE id = ?').get(artworkId);
  if (!artwork || artwork.user_id !== user.id) throw notFound('artwork_not_found');
  const { board, failures, data } = await checkArtwork(artwork);
  if (failures.length) throw badRequest('exhibit_rules', null, { failures });
  if ((await usedInRound(user.id, s.nextRound)) >= (await perRound(user.id))) throw forbidden('exhibit_limit');
  const auto = await autoApprove(user.id, data);
  const res = await getDb()
    .prepare(
      'INSERT INTO exhibition_entries (artwork_id, user_id, round_key, board, status, auto_approved, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(artwork.id, user.id, s.nextRound, board, auto ? 'approved' : 'pending', auto ? 1 : 0, auto ? now().toISOString() : null);
  return await findEntry(Number(res.lastInsertRowid));
}

export async function withdraw(user, entryId) {
  await maintain();
  const e = await findEntry(entryId);
  if (!e || e.user_id !== user.id) throw notFound('entry_not_found');
  const t = roundTimes(e.round_key);
  if (!['pending', 'approved'].includes(e.status) || now() >= t.submitClose) throw badRequest('exhibit_cannot_withdraw');
  await getDb().prepare("UPDATE exhibition_entries SET status = 'withdrawn' WHERE id = ?").run(e.id);
  return await findEntry(e.id);
}

/** Tranh đang chờ / đang hoặc đã đi triển lãm thì không sửa được (chữ ký và nội dung bị khoá). */
export async function assertEditable(artworkId) {
  const e = await activeEntryFor(artworkId);
  if (e) throw forbidden('artwork_exhibited');
}

/** Xoá tranh: chặn khi đang chờ duyệt hoặc đang trưng. */
export async function assertDeletable(artworkId) {
  const e = await activeEntryFor(artworkId);
  if (e && (e.status === 'pending' || now() < roundTimes(e.round_key).displayEnd)) throw forbidden('artwork_exhibited');
}

// ---------------- Cảm xúc & báo cáo ----------------
const verified = (user) => !!(user.guardian_contact || user.google_sub);

async function visibleEntry(entryId) {
  const e = await findEntry(entryId);
  const s = schedule();
  if (!e || e.status !== 'approved' || e.hidden || e.round_key !== s.current) throw notFound('entry_not_found');
  return { e, s };
}

export async function react(user, entryId, emoji) {
  await maintain();
  const { e, s } = await visibleEntry(entryId);
  if (!s.reactionsOpen) throw badRequest('exhibit_locked');
  if (e.user_id === user.id) throw forbidden('exhibit_own');
  if (!verified(user)) throw forbidden('exhibit_unverified');
  const db = getDb();
  if (emoji == null) await db.prepare('DELETE FROM exhibition_reactions WHERE entry_id = ? AND user_id = ?').run(e.id, user.id);
  else {
    if (!EXHIBITION.reactions.includes(emoji)) throw badRequest('invalid_input');
    await db
      .prepare(
        'INSERT INTO exhibition_reactions (entry_id, user_id, emoji) VALUES (?, ?, ?) ON CONFLICT (entry_id, user_id) DO UPDATE SET emoji = excluded.emoji',
      )
      .run(e.id, user.id, emoji);
  }
  return { counts: await reactionCounts(e.id), mine: emoji ?? null };
}

export async function report(user, entryId) {
  await maintain();
  const { e } = await visibleEntry(entryId);
  if (e.user_id === user.id) throw forbidden('exhibit_own');
  if (!verified(user)) throw forbidden('exhibit_unverified');
  const db = getDb();
  const r = await db.prepare('INSERT OR IGNORE INTO exhibition_reports (entry_id, user_id) VALUES (?, ?)').run(e.id, user.id);
  if (r.changes) {
    await db.prepare('UPDATE exhibition_entries SET reports = reports + 1 WHERE id = ?').run(e.id);
    await db.prepare('UPDATE exhibition_entries SET hidden = 1 WHERE id = ? AND reports >= ?').run(e.id, EXHIBITION.hideAfterReports);
  }
  return { ok: true };
}

export async function reactionCounts(entryId) {
  const counts = Object.fromEntries(EXHIBITION.reactions.map((k) => [k, 0]));
  for (const r of await getDb().prepare('SELECT emoji, COUNT(*) AS c FROM exhibition_reactions WHERE entry_id = ? GROUP BY emoji').all(entryId))
    counts[r.emoji] = r.c;
  return counts;
}
const total = (counts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

// ---------------- Xét danh hiệu & việc định kỳ ----------------
const BOARD_NAMES = { free: { vi: 'Sáng tạo', en: 'Creative' } };

async function judge(key) {
  const db = getDb();
  const entries = await db
    .prepare(
      "SELECT e.*, p.name_vi, p.name_en FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN pictures p ON p.id = a.picture_id WHERE e.round_key = ? AND e.status = 'approved'",
    )
    .all(key);
  const scored = await asyncMap(entries, async (e) => ({ e, counts: await reactionCounts(e.id) }));
  for (const board of EXHIBITION.boards) {
    const inBoard = scored.filter((x) => x.e.board === board && !x.e.hidden);
    const best = Math.max(0, ...inBoard.map((x) => total(x.counts)));
    for (const x of inBoard) if (best > 0 && total(x.counts) === best) x.award = 1;
  }
  for (const x of scored) {
    await db.prepare('UPDATE exhibition_entries SET final_reactions = ?, award = ? WHERE id = ?').run(JSON.stringify(x.counts), x.award || 0, x.e.id);
    const name = { vi: x.e.name_vi, en: x.e.name_en };
    if (x.award) await notify(x.e.user_id, 'exhibit_award', { name, board: x.e.board, boardName: BOARD_NAMES[x.e.board], entryId: x.e.id });
    else if (!x.e.hidden) await notify(x.e.user_id, 'exhibit_done', { name, n: total(x.counts), entryId: x.e.id });
  }
  await db.prepare('INSERT OR IGNORE INTO exhibition_rounds (round_key, judged_at) VALUES (?, ?)').run(key, now().toISOString());
}

/** Việc theo lịch — gọi ở mỗi yêu cầu triển lãm và định kỳ (không phụ thuộc giờ chạy chính xác). */
export async function maintain(t = now()) {
  const db = getDb();
  const s = schedule(t);
  await tx(async () => {
    // 1) Xét danh hiệu các vòng đã tới 20:00 Chủ nhật.
    const keys = await db
      .prepare(
        "SELECT DISTINCT round_key FROM exhibition_entries WHERE status = 'approved' AND round_key NOT IN (SELECT round_key FROM exhibition_rounds)",
      )
      .all();
    for (const { round_key: key } of keys) if (t >= roundTimes(key).lockAt) await judge(key);
    // 2) Tranh chưa duyệt kịp khi vòng đã mở → chuyển sang vòng sắp tới, giữ nguyên lượt.
    await db.prepare("UPDATE exhibition_entries SET round_key = ? WHERE status = 'pending' AND round_key <= ?").run(s.nextRound, s.current);
    // 3) Báo cảm xúc mới cho tác giả: gom mỗi ngày 1 lần, sau 18:00.
    const vnHour = new Date(t.getTime() + 7 * HOUR).getUTCHours();
    const today = new Date(t.getTime() + 7 * HOUR).toISOString().slice(0, 10);
    if (vnHour >= 18 && s.reactionsOpen) {
      const rows = await db
        .prepare(
          `SELECT e.id, e.user_id, e.notified_count, p.name_vi, p.name_en, (SELECT COUNT(*) FROM exhibition_reactions r WHERE r.entry_id = e.id) AS n
           FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN pictures p ON p.id = a.picture_id
           WHERE e.round_key = ? AND e.status = 'approved' AND e.hidden = 0 AND (e.notified_date IS NULL OR e.notified_date < ?)`,
        )
        .all(s.current, today);
      for (const r of rows) {
        if (r.n > r.notified_count)
          await notify(r.user_id, 'exhibit_reactions', { name: { vi: r.name_vi, en: r.name_en }, n: r.n - r.notified_count, entryId: r.id });
        await db.prepare('UPDATE exhibition_entries SET notified_count = ?, notified_date = ? WHERE id = ?').run(r.n, today, r.id);
      }
    }
  });
}

export async function scheduleExhibition(intervalMs = 5 * 60 * 1000) {
  const run = async () => {
    try {
      await maintain();
    } catch (err) {
      console.error('[exhibition] lỗi', err);
    }
  };
  await run();
  return setInterval(run, intervalMs).unref();
}

// ---------------- Đọc dữ liệu cho giao diện ----------------
export const findEntry = async (id) => await getDb().prepare('SELECT * FROM exhibition_entries WHERE id = ?').get(id);

const entrySql = withData => `SELECT e.*, ${withData ? 'a.data,' : ''} a.picture_id, u.nickname, u.username, u.avatar, u.avatar_frame, p.name_vi, p.name_en, p.rarity, p.is_card
  FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN users u ON u.id = e.user_id JOIN pictures p ON p.id = a.picture_id`;
const ENTRY_SQL = entrySql(true);
const ENTRY_SQL_LIGHT = entrySql(false);

async function toClient(row, viewerId, { withData = true, prepared } = {}) {
  const counts = row.final_reactions ? parseJson(row.final_reactions, {}) : prepared ? prepared.counts.get(row.id) : await reactionCounts(row.id);
  const mine = viewerId
    ? prepared ? prepared.mine.get(row.id) || null : (await getDb().prepare('SELECT emoji FROM exhibition_reactions WHERE entry_id = ? AND user_id = ?').get(row.id, viewerId))?.emoji || null
    : null;
  return {
    id: row.id,
    artworkId: row.artwork_id,
    roundKey: row.round_key,
    board: row.board,
    status: row.status,
    rejectRule: row.reject_rule,
    award: !!row.award,
    hidden: !!row.hidden,
    reports: row.reports,
    author: { id: row.user_id, nickname: row.nickname || row.username || 'Bé', avatar: row.avatar, avatarFrame: row.avatar_frame },
    pictureId: row.picture_id,
    name: { vi: row.name_vi, en: row.name_en },
    reactions: counts,
    total: total(counts),
    mine,
    own: row.user_id === viewerId,
    ...(withData ? { data: parseJson(row.data, {}) } : {}),
  };
}

async function clientsFor(rows, viewerId, options = {}) {
  if (!rows.length) return [];
  const liveIds = rows.filter(row => !row.final_reactions).map(row => row.id);
  const ids = rows.map(row => row.id);
  const [grouped, mineRows] = await Promise.all([
    liveIds.length ? getDb().prepare(`SELECT entry_id,emoji,COUNT(*) AS c FROM exhibition_reactions
      WHERE entry_id IN (${liveIds.map(() => '?').join(',')}) GROUP BY entry_id,emoji`).all(...liveIds) : [],
    viewerId ? getDb().prepare(`SELECT entry_id,emoji FROM exhibition_reactions WHERE user_id=?
      AND entry_id IN (${ids.map(() => '?').join(',')})`).all(viewerId,...ids) : [],
  ]);
  const counts = new Map(liveIds.map(id => [id,Object.fromEntries(EXHIBITION.reactions.map(key => [key,0]))]));
  for (const row of grouped) counts.get(row.entry_id)[row.emoji] = row.c;
  const prepared = { counts, mine:new Map(mineRows.map(row => [row.entry_id,row.emoji])) };
  return Promise.all(rows.map(row => toClient(row,viewerId,{...options,prepared})));
}

/** SVG các tranh (gom trùng) để trình duyệt tự vẽ lại tranh từ dữ liệu tô — không tin ảnh gửi lên. */
async function picturesFor(rows) {
  const out = {};
  const pictures = await Picture.findSvgs(rows.map(row => row.picture_id));
  for (const [id,p] of pictures) {
    out[id] = { id, svg: p.svg };
  }
  return out;
}

export async function hall(viewerId) {
  await maintain();
  const s = schedule();
  const db = getDb();
  const counts = Object.fromEntries(EXHIBITION.boards.map((b) => [b, 0]));
  for (const r of await db
    .prepare("SELECT board, COUNT(*) AS c FROM exhibition_entries WHERE round_key = ? AND status = 'approved' AND hidden = 0 GROUP BY board")
    .all(s.current))
    counts[r.board] = r.c;
  const last = await db.prepare('SELECT round_key FROM exhibition_rounds ORDER BY round_key DESC LIMIT 1').get();
  const winners = last ? await db.prepare(`${ENTRY_SQL} WHERE e.round_key = ? AND e.award = 1 ORDER BY e.board`).all(last.round_key) : [];
  return {
    schedule: s,
    counts,
    lastRound: last?.round_key || null,
    winners: await clientsFor(winners, viewerId),
    pictures: await picturesFor(winners),
  };
}

/**
 * Tường tranh ở sảnh, phân trang theo trang 5 tranh: tranh thắng giải vòng vừa rồi đứng đầu (đã chốt, không thả thêm cảm xúc),
 * rồi tới các tranh đã duyệt của vòng hiện tại (mới nhất trước) để bé thả cảm xúc.
 */
export async function wall(viewerId, offset = 0, limit = 5) {
  await maintain();
  const s = schedule();
  const db = getDb();
  const start = Math.max(0, Math.floor(offset) || 0);
  const size = Math.min(10, Math.max(1, Math.floor(limit) || 5));
  const last = await db.prepare('SELECT round_key FROM exhibition_rounds ORDER BY round_key DESC LIMIT 1').get();
  const previous = last?.round_key !== s.current ? last?.round_key ?? null : null;
  // Page in SQL: do not download every submitted artwork just to display five of them.
  const [count, page] = await Promise.all([
    db.prepare(`SELECT
      (SELECT COUNT(*) FROM exhibition_entries WHERE round_key=? AND award=1 AND hidden=0) +
      (SELECT COUNT(*) FROM exhibition_entries WHERE round_key=? AND status='approved' AND hidden=0) AS c`).get(previous, s.current),
    db.prepare(`${ENTRY_SQL}
      WHERE (e.round_key=? AND e.award=1 AND e.hidden=0)
         OR (e.round_key=? AND e.status='approved' AND e.hidden=0)
      ORDER BY CASE WHEN e.round_key=? THEN 0 ELSE 1 END,
        CASE WHEN e.round_key=? THEN e.board ELSE NULL END,
        CASE WHEN e.round_key=? THEN e.id ELSE NULL END,
        CASE WHEN e.round_key=? THEN e.id ELSE NULL END DESC
      LIMIT ? OFFSET ?`).all(previous, s.current, previous, previous, previous, s.current, size, start),
  ]);
  const [entries, pictures] = await Promise.all([clientsFor(page, viewerId), picturesFor(page)]);
  return {
    schedule: s,
    total: count.c,
    offset: start,
    entries: entries.map((entry, index) => ({ ...entry, final: page[index].round_key !== s.current })),
    pictures,
  };
}

/** Các lần gửi của chính bé (mới nhất theo từng tranh). */
export async function mine(userId) {
  await maintain();
  const rows = await getDb().prepare(`${ENTRY_SQL_LIGHT} WHERE e.user_id = ? ORDER BY e.id DESC LIMIT 300`).all(userId);
  const byArtwork = {};
  const seen = new Set();
  const latest = rows.filter(row => {
    if (seen.has(row.artwork_id)) return false;
    seen.add(row.artwork_id);
    return true;
  });
  for (const entry of await clientsFor(latest,userId,{withData:false})) byArtwork[entry.artworkId] = entry;
  return byArtwork;
}

// ---------------- Quản trị ----------------
export async function reviewQueue() {
  await maintain();
  const rows = await getDb()
    .prepare(`${ENTRY_SQL} WHERE e.status = 'pending' OR (e.status = 'approved' AND e.hidden = 1) ORDER BY e.submitted_at`)
    .all();
  return { entries: await clientsFor(rows, null), pictures: await picturesFor(rows) };
}

async function nameOf(entryId) {
  const r = await getDb()
    .prepare(
      'SELECT p.name_vi, p.name_en FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN pictures p ON p.id = a.picture_id WHERE e.id = ?',
    )
    .get(entryId);
  return { vi: r.name_vi, en: r.name_en };
}

export async function approve(adminId, ids) {
  const db = getDb();
  let n = 0;
  await tx(async () => {
    for (const id of ids) {
      const e = await findEntry(Number(id));
      if (!e) continue;
      if (e.status === 'pending') {
        await db
          .prepare("UPDATE exhibition_entries SET status = 'approved', reviewed_at = ?, reviewed_by = ? WHERE id = ?")
          .run(now().toISOString(), adminId, e.id);
        await notify(e.user_id, 'exhibit_approved', { name: await nameOf(e.id), entryId: e.id });
        n++;
      } else if (e.status === 'approved' && e.hidden) {
        // Bị báo nhầm → trưng lại.
        await db.prepare('UPDATE exhibition_entries SET hidden = 0, reports = 0 WHERE id = ?').run(e.id);
        await db.prepare('DELETE FROM exhibition_reports WHERE entry_id = ?').run(e.id);
        n++;
      }
    }
  });
  return { updated: n };
}

export async function reject(adminId, id, rule) {
  const r = Number(rule);
  if (!Number.isInteger(r) || r < 1 || r > 8) throw badRequest('invalid_input');
  const e = await findEntry(Number(id));
  if (!e) throw notFound('entry_not_found');
  let next;
  if (e.status === 'pending') next = 'rejected';
  else if (e.status === 'approved') next = 'removed';
  else throw badRequest('invalid_input');
  await getDb()
    .prepare('UPDATE exhibition_entries SET status = ?, reject_rule = ?, hidden = 0, award = 0, reviewed_at = ?, reviewed_by = ? WHERE id = ?')
    .run(next, r, now().toISOString(), adminId, e.id);
  await notify(e.user_id, 'exhibit_rejected', { name: await nameOf(e.id), rule: r, entryId: e.id });
  return { status: next };
}

// ---------------- Khoe & chia sẻ (Đợt 3) ----------------
/** Tủ kính thành tích: tranh đã lên hội trường của 1 bé. Chỉ chính chủ và bạn bè xem được. */
export async function showcase(ownerId, viewerId) {
  if (ownerId !== viewerId && !(await areFriends(ownerId, viewerId))) throw forbidden('not_friends');
  await maintain();
  const s = schedule();
  const rows = await getDb()
    .prepare(
      `${ENTRY_SQL} WHERE e.user_id = ? AND e.status = 'approved' AND e.hidden = 0 AND e.round_key <= ? ORDER BY e.award DESC, e.round_key DESC, e.id DESC`,
    )
    .all(ownerId, s.current);
  const u = await getDb().prepare('SELECT id, nickname, username, avatar, avatar_frame FROM users WHERE id = ?').get(ownerId);
  if (!u) throw notFound();
  return {
    owner: { id: u.id, nickname: u.nickname || u.username || 'Bé', avatar: u.avatar, avatarFrame: u.avatar_frame },
    current: s.current,
    entries: (await clientsFor(rows, viewerId)).map((entry, index) => ({ ...entry, onShow: rows[index].round_key === s.current })),
    pictures: await picturesFor(rows),
  };
}

/** Dữ liệu cho giấy khen: chỉ tranh của chính bé, đã nhận danh hiệu. */
export async function awardedEntry(userId, entryId) {
  const row = await getDb().prepare(`${ENTRY_SQL_LIGHT} WHERE e.id = ?`).get(entryId);
  if (!row || row.user_id !== userId) throw notFound('entry_not_found');
  if (!row.award) throw forbidden('no_award');
  return await toClient(row, userId, { withData: false });
}
