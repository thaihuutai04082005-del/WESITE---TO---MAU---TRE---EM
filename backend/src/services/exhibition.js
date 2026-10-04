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
import { coverageScore, spillRatio } from './scoringEngine.js';
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
export const shiftKey = (key, weeks) => at(key, 7 * weeks, 7).toISOString().slice(0, 10);

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

export const activeEntryFor = (artworkId) =>
  getDb().prepare(`SELECT * FROM exhibition_entries WHERE artwork_id = ? AND status IN ${ACTIVE}`).get(artworkId);

/** Bảng xét của tranh: thẻ hiếm S/A/B theo hạng thẻ, còn lại là bảng Sáng tạo. null = không đúng loại (điều 3). */
function boardOf(artwork, picture) {
  if (artwork.mode !== 'free') return null;
  if (picture.is_card) return ['S', 'A', 'B'].includes(picture.rarity) ? picture.rarity : null;
  return 'free';
}

function startedAt(artwork) {
  const u = getDb().prepare('SELECT MIN(used_at) AS t FROM usage_log WHERE artwork_id = ?').get(artwork.id);
  return Date.parse(u?.t || artwork.created_at);
}

/**
 * Kiểm tra nội quy phần máy tự làm (điều 1, 2, 3, 4, 5, 8).
 * @returns {{ board: string|null, failures: number[] }}
 */
export function checkArtwork(artwork) {
  const picture = Picture.findPicture(artwork.picture_id);
  const manifest = Picture.manifestOf(picture);
  const data = parseJson(artwork.data, {});
  const failures = [];
  const board = boardOf(artwork, picture);
  if (!data.signature) failures.push(1);
  const coverage = coverageScore(manifest, data.fills || {});
  if (artwork.status !== 'completed' || coverage < EXHIBITION.minCoverage) failures.push(2);
  if (!board) failures.push(3);
  if (activeEntryFor(artwork.id)) failures.push(4);
  if (spillRatio(manifest, data.strokes || []) > EXHIBITION.maxSpill) failures.push(5);
  const filled = Object.keys(data.fills || {}).length;
  const elapsed = Date.parse(artwork.completed_at || artwork.updated_at) - startedAt(artwork);
  if (elapsed < Math.max(EXHIBITION.minMs, filled * EXHIBITION.msPerRegion)) failures.push(8);
  return { board, failures, picture, data };
}

const perRound = (userId) => EXHIBITION.perRound[activeSubscription(userId)?.plan] ?? EXHIBITION.perRound.free;
const usedInRound = (userId, key) =>
  getDb().prepare("SELECT COUNT(*) AS c FROM exhibition_entries WHERE user_id = ? AND round_key = ? AND status IN ('pending', 'approved')").get(userId, key).c;

/** Tự duyệt: tranh gần như không có nét cọ tự do, hoặc bé "ngoan" (3 tranh liên tiếp được duyệt, chưa vi phạm điều 6–7). */
function autoApprove(userId, data) {
  const brush = (data.strokes || []).filter((s) => s.tool === 'brush');
  const points = brush.reduce((n, s) => n + (s.points?.length || 0), 0);
  if (brush.length <= EXHIBITION.autoBrushStrokes && points <= EXHIBITION.autoBrushPoints) return true;
  const db = getDb();
  if (db.prepare("SELECT 1 FROM exhibition_entries WHERE user_id = ? AND reject_rule IN (6, 7)").get(userId)) return false;
  const last = db
    .prepare("SELECT status FROM exhibition_entries WHERE user_id = ? AND status IN ('approved', 'rejected', 'removed') ORDER BY COALESCE(reviewed_at, submitted_at) DESC LIMIT ?")
    .all(userId, EXHIBITION.trustedStreak);
  return last.length === EXHIBITION.trustedStreak && last.every((e) => e.status === 'approved');
}

// ---------------- Gửi / rút tranh ----------------
export function status(userId) {
  maintain();
  const s = schedule();
  return { schedule: s, limit: perRound(userId), used: usedInRound(userId, s.nextRound) };
}

export function submit(user, artworkId) {
  maintain();
  const s = schedule();
  if (!s.submitOpen) throw badRequest('exhibit_closed');
  const artwork = getDb().prepare('SELECT * FROM artworks WHERE id = ?').get(artworkId);
  if (!artwork || artwork.user_id !== user.id) throw notFound('artwork_not_found');
  const { board, failures, data } = checkArtwork(artwork);
  if (failures.length) throw badRequest('exhibit_rules', null, { failures });
  if (usedInRound(user.id, s.nextRound) >= perRound(user.id)) throw forbidden('exhibit_limit');
  const auto = autoApprove(user.id, data);
  const res = getDb()
    .prepare('INSERT INTO exhibition_entries (artwork_id, user_id, round_key, board, status, auto_approved, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(artwork.id, user.id, s.nextRound, board, auto ? 'approved' : 'pending', auto ? 1 : 0, auto ? now().toISOString() : null);
  return findEntry(Number(res.lastInsertRowid));
}

export function withdraw(user, entryId) {
  maintain();
  const e = findEntry(entryId);
  if (!e || e.user_id !== user.id) throw notFound('entry_not_found');
  const t = roundTimes(e.round_key);
  if (!['pending', 'approved'].includes(e.status) || now() >= t.submitClose) throw badRequest('exhibit_cannot_withdraw');
  getDb().prepare("UPDATE exhibition_entries SET status = 'withdrawn' WHERE id = ?").run(e.id);
  return findEntry(e.id);
}

/** Tranh đang chờ / đang hoặc đã đi triển lãm thì không sửa được (chữ ký và nội dung bị khoá). */
export function assertEditable(artworkId) {
  const e = activeEntryFor(artworkId);
  if (e) throw forbidden('artwork_exhibited');
}

/** Xoá tranh: chặn khi đang chờ duyệt hoặc đang trưng. */
export function assertDeletable(artworkId) {
  const e = activeEntryFor(artworkId);
  if (e && (e.status === 'pending' || now() < roundTimes(e.round_key).displayEnd)) throw forbidden('artwork_exhibited');
}

// ---------------- Cảm xúc & báo cáo ----------------
const verified = (user) => !!(user.guardian_contact || user.google_sub);

function visibleEntry(entryId) {
  const e = findEntry(entryId);
  const s = schedule();
  if (!e || e.status !== 'approved' || e.hidden || e.round_key !== s.current) throw notFound('entry_not_found');
  return { e, s };
}

export function react(user, entryId, emoji) {
  maintain();
  const { e, s } = visibleEntry(entryId);
  if (!s.reactionsOpen) throw badRequest('exhibit_locked');
  if (e.user_id === user.id) throw forbidden('exhibit_own');
  if (!verified(user)) throw forbidden('exhibit_unverified');
  const db = getDb();
  if (emoji == null) db.prepare('DELETE FROM exhibition_reactions WHERE entry_id = ? AND user_id = ?').run(e.id, user.id);
  else {
    if (!EXHIBITION.reactions.includes(emoji)) throw badRequest('invalid_input');
    db.prepare('INSERT INTO exhibition_reactions (entry_id, user_id, emoji) VALUES (?, ?, ?) ON CONFLICT (entry_id, user_id) DO UPDATE SET emoji = excluded.emoji').run(e.id, user.id, emoji);
  }
  return { counts: reactionCounts(e.id), mine: emoji ?? null };
}

export function report(user, entryId) {
  maintain();
  const { e } = visibleEntry(entryId);
  if (e.user_id === user.id) throw forbidden('exhibit_own');
  if (!verified(user)) throw forbidden('exhibit_unverified');
  const db = getDb();
  const r = db.prepare('INSERT OR IGNORE INTO exhibition_reports (entry_id, user_id) VALUES (?, ?)').run(e.id, user.id);
  if (r.changes) {
    db.prepare('UPDATE exhibition_entries SET reports = reports + 1 WHERE id = ?').run(e.id);
    db.prepare('UPDATE exhibition_entries SET hidden = 1 WHERE id = ? AND reports >= ?').run(e.id, EXHIBITION.hideAfterReports);
  }
  return { ok: true };
}

export function reactionCounts(entryId) {
  const counts = Object.fromEntries(EXHIBITION.reactions.map((k) => [k, 0]));
  for (const r of getDb().prepare('SELECT emoji, COUNT(*) AS c FROM exhibition_reactions WHERE entry_id = ? GROUP BY emoji').all(entryId)) counts[r.emoji] = r.c;
  return counts;
}
const total = (counts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

// ---------------- Xét danh hiệu & việc định kỳ ----------------
const BOARD_NAMES = { S: { vi: 'S', en: 'S' }, A: { vi: 'A', en: 'A' }, B: { vi: 'B', en: 'B' }, free: { vi: 'Sáng tạo', en: 'Creative' } };

function judge(key) {
  const db = getDb();
  const entries = db.prepare("SELECT e.*, p.name_vi, p.name_en FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN pictures p ON p.id = a.picture_id WHERE e.round_key = ? AND e.status = 'approved'").all(key);
  const scored = entries.map((e) => ({ e, counts: reactionCounts(e.id) }));
  for (const board of EXHIBITION.boards) {
    const inBoard = scored.filter((x) => x.e.board === board && !x.e.hidden);
    const best = Math.max(0, ...inBoard.map((x) => total(x.counts)));
    for (const x of inBoard) if (best > 0 && total(x.counts) === best) x.award = 1;
  }
  for (const x of scored) {
    db.prepare('UPDATE exhibition_entries SET final_reactions = ?, award = ? WHERE id = ?').run(JSON.stringify(x.counts), x.award || 0, x.e.id);
    const name = { vi: x.e.name_vi, en: x.e.name_en };
    if (x.award) notify(x.e.user_id, 'exhibit_award', { name, board: x.e.board, boardName: BOARD_NAMES[x.e.board], entryId: x.e.id });
    else if (!x.e.hidden) notify(x.e.user_id, 'exhibit_done', { name, n: total(x.counts), entryId: x.e.id });
  }
  db.prepare('INSERT OR IGNORE INTO exhibition_rounds (round_key, judged_at) VALUES (?, ?)').run(key, now().toISOString());
}

/** Việc theo lịch — gọi ở mỗi yêu cầu triển lãm và định kỳ (không phụ thuộc giờ chạy chính xác). */
export function maintain(t = now()) {
  const db = getDb();
  const s = schedule(t);
  tx(() => {
    // 1) Xét danh hiệu các vòng đã tới 20:00 Chủ nhật.
    const keys = db.prepare("SELECT DISTINCT round_key FROM exhibition_entries WHERE status = 'approved' AND round_key NOT IN (SELECT round_key FROM exhibition_rounds)").all();
    for (const { round_key: key } of keys) if (t >= roundTimes(key).lockAt) judge(key);
    // 2) Tranh chưa duyệt kịp khi vòng đã mở → chuyển sang vòng sắp tới, giữ nguyên lượt.
    db.prepare("UPDATE exhibition_entries SET round_key = ? WHERE status = 'pending' AND round_key <= ?").run(s.nextRound, s.current);
    // 3) Báo cảm xúc mới cho tác giả: gom mỗi ngày 1 lần, sau 18:00.
    const vnHour = new Date(t.getTime() + 7 * HOUR).getUTCHours();
    const today = new Date(t.getTime() + 7 * HOUR).toISOString().slice(0, 10);
    if (vnHour >= 18 && s.reactionsOpen) {
      const rows = db
        .prepare(
          `SELECT e.id, e.user_id, e.notified_count, p.name_vi, p.name_en, (SELECT COUNT(*) FROM exhibition_reactions r WHERE r.entry_id = e.id) AS n
           FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN pictures p ON p.id = a.picture_id
           WHERE e.round_key = ? AND e.status = 'approved' AND e.hidden = 0 AND (e.notified_date IS NULL OR e.notified_date < ?)`,
        )
        .all(s.current, today);
      for (const r of rows) {
        if (r.n > r.notified_count) notify(r.user_id, 'exhibit_reactions', { name: { vi: r.name_vi, en: r.name_en }, n: r.n - r.notified_count, entryId: r.id });
        db.prepare('UPDATE exhibition_entries SET notified_count = ?, notified_date = ? WHERE id = ?').run(r.n, today, r.id);
      }
    }
  });
}

export function scheduleExhibition(intervalMs = 5 * 60 * 1000) {
  const run = () => {
    try {
      maintain();
    } catch (err) {
      console.error('[exhibition] lỗi', err);
    }
  };
  run();
  return setInterval(run, intervalMs).unref();
}

// ---------------- Đọc dữ liệu cho giao diện ----------------
export const findEntry = (id) => getDb().prepare('SELECT * FROM exhibition_entries WHERE id = ?').get(id);

const ENTRY_SQL = `SELECT e.*, a.data, a.picture_id, u.nickname, u.username, u.avatar, u.avatar_frame, p.name_vi, p.name_en, p.rarity, p.is_card
  FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN users u ON u.id = e.user_id JOIN pictures p ON p.id = a.picture_id`;

function toClient(row, viewerId, { withData = true } = {}) {
  const counts = row.final_reactions ? parseJson(row.final_reactions, {}) : reactionCounts(row.id);
  const mine = viewerId ? getDb().prepare('SELECT emoji FROM exhibition_reactions WHERE entry_id = ? AND user_id = ?').get(row.id, viewerId)?.emoji || null : null;
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

/** SVG các tranh (gom trùng) để trình duyệt tự vẽ lại tranh từ dữ liệu tô — không tin ảnh gửi lên. */
function picturesFor(rows) {
  const out = {};
  for (const id of new Set(rows.map((r) => r.picture_id))) {
    const p = Picture.findPicture(id);
    out[id] = { id, svg: p.svg };
  }
  return out;
}

export function hall(viewerId) {
  maintain();
  const s = schedule();
  const db = getDb();
  const counts = Object.fromEntries(EXHIBITION.boards.map((b) => [b, 0]));
  for (const r of db.prepare("SELECT board, COUNT(*) AS c FROM exhibition_entries WHERE round_key = ? AND status = 'approved' AND hidden = 0 GROUP BY board").all(s.current)) counts[r.board] = r.c;
  const last = db.prepare('SELECT round_key FROM exhibition_rounds ORDER BY round_key DESC LIMIT 1').get();
  const winners = last ? db.prepare(`${ENTRY_SQL} WHERE e.round_key = ? AND e.award = 1 ORDER BY e.board`).all(last.round_key) : [];
  return { schedule: s, counts, lastRound: last?.round_key || null, winners: winners.map((r) => toClient(r, viewerId)), pictures: picturesFor(winners) };
}

export function room(board, viewerId) {
  if (!EXHIBITION.boards.includes(board)) throw notFound();
  maintain();
  const s = schedule();
  const rows = getDb().prepare(`${ENTRY_SQL} WHERE e.round_key = ? AND e.board = ? AND e.status = 'approved' AND e.hidden = 0 ORDER BY e.id`).all(s.current, board);
  return { schedule: s, board, entries: rows.map((r) => toClient(r, viewerId)), pictures: picturesFor(rows) };
}

/** Các lần gửi của chính bé (mới nhất theo từng tranh). */
export function mine(userId) {
  maintain();
  const rows = getDb().prepare(`${ENTRY_SQL} WHERE e.user_id = ? ORDER BY e.id DESC LIMIT 300`).all(userId);
  const byArtwork = {};
  for (const r of rows) byArtwork[r.artwork_id] ||= toClient(r, userId, { withData: false });
  return byArtwork;
}

// ---------------- Quản trị ----------------
export function reviewQueue() {
  maintain();
  const rows = getDb().prepare(`${ENTRY_SQL} WHERE e.status = 'pending' OR (e.status = 'approved' AND e.hidden = 1) ORDER BY e.submitted_at`).all();
  return { entries: rows.map((r) => toClient(r, null)), pictures: picturesFor(rows) };
}

function nameOf(entryId) {
  const r = getDb().prepare('SELECT p.name_vi, p.name_en FROM exhibition_entries e JOIN artworks a ON a.id = e.artwork_id JOIN pictures p ON p.id = a.picture_id WHERE e.id = ?').get(entryId);
  return { vi: r.name_vi, en: r.name_en };
}

export function approve(adminId, ids) {
  const db = getDb();
  let n = 0;
  tx(() => {
    for (const id of ids) {
      const e = findEntry(Number(id));
      if (!e) continue;
      if (e.status === 'pending') {
        db.prepare("UPDATE exhibition_entries SET status = 'approved', reviewed_at = ?, reviewed_by = ? WHERE id = ?").run(now().toISOString(), adminId, e.id);
        notify(e.user_id, 'exhibit_approved', { name: nameOf(e.id), entryId: e.id });
        n++;
      } else if (e.status === 'approved' && e.hidden) {
        // Bị báo nhầm → trưng lại.
        db.prepare('UPDATE exhibition_entries SET hidden = 0, reports = 0 WHERE id = ?').run(e.id);
        db.prepare('DELETE FROM exhibition_reports WHERE entry_id = ?').run(e.id);
        n++;
      }
    }
  });
  return { updated: n };
}

export function reject(adminId, id, rule) {
  const r = Number(rule);
  if (!Number.isInteger(r) || r < 1 || r > 8) throw badRequest('invalid_input');
  const e = findEntry(Number(id));
  if (!e) throw notFound('entry_not_found');
  let next;
  if (e.status === 'pending') next = 'rejected';
  else if (e.status === 'approved') next = 'removed';
  else throw badRequest('invalid_input');
  getDb().prepare('UPDATE exhibition_entries SET status = ?, reject_rule = ?, hidden = 0, award = 0, reviewed_at = ?, reviewed_by = ? WHERE id = ?').run(next, r, now().toISOString(), adminId, e.id);
  notify(e.user_id, 'exhibit_rejected', { name: nameOf(e.id), rule: r, entryId: e.id });
  return { status: next };
}

// ---------------- Khoe & chia sẻ (Đợt 3) ----------------
/** Tủ kính thành tích: tranh đã lên hội trường của 1 bé. Chỉ chính chủ và bạn bè xem được. */
export function showcase(ownerId, viewerId) {
  if (ownerId !== viewerId && !areFriends(ownerId, viewerId)) throw forbidden('not_friends');
  maintain();
  const s = schedule();
  const rows = getDb()
    .prepare(`${ENTRY_SQL} WHERE e.user_id = ? AND e.status = 'approved' AND e.hidden = 0 AND e.round_key <= ? ORDER BY e.award DESC, e.round_key DESC, e.id DESC`)
    .all(ownerId, s.current);
  const u = getDb().prepare('SELECT id, nickname, username, avatar, avatar_frame FROM users WHERE id = ?').get(ownerId);
  if (!u) throw notFound();
  return {
    owner: { id: u.id, nickname: u.nickname || u.username || 'Bé', avatar: u.avatar, avatarFrame: u.avatar_frame },
    current: s.current,
    entries: rows.map((r) => ({ ...toClient(r, viewerId), onShow: r.round_key === s.current })),
    pictures: picturesFor(rows),
  };
}

/** Dữ liệu cho giấy khen: chỉ tranh của chính bé, đã nhận danh hiệu. */
export function awardedEntry(userId, entryId) {
  const row = getDb().prepare(`${ENTRY_SQL} WHERE e.id = ?`).get(entryId);
  if (!row || row.user_id !== userId) throw notFound('entry_not_found');
  if (!row.award) throw forbidden('no_award');
  return toClient(row, userId, { withData: false });
}
