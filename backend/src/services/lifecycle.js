// Vòng đời Lịch sử tô (Mục 7): tranh đã hoàn thành lưu vĩnh viễn; tranh dở không đụng tới 30 ngày
// thì tự xoá, có thông báo trước 5 ngày.
import { getDb } from '../config/db.js';
import { DRAFT_RETENTION_DAYS, DRAFT_WARNING_DAYS } from '../config/constants.js';
import { notify } from './notifications.js';

export function runCleanup(now = new Date()) {
  const db = getDb();
  const day = 86400000;
  const warnBefore = new Date(now.getTime() - DRAFT_WARNING_DAYS * day).toISOString();
  const deleteBefore = new Date(now.getTime() - DRAFT_RETENTION_DAYS * day).toISOString();

  const toWarn = db
    .prepare(
      `SELECT a.id, a.user_id, a.updated_at, p.name_vi, p.name_en FROM artworks a JOIN pictures p ON p.id = a.picture_id
       WHERE a.status = 'in_progress' AND a.updated_at < ? AND a.warned_at IS NULL`,
    )
    .all(warnBefore);
  for (const a of toWarn) {
    const deleteAt = new Date(Date.parse(a.updated_at) + DRAFT_RETENTION_DAYS * day).toISOString();
    notify(a.user_id, 'draft_expiring', { artworkId: a.id, name: { vi: a.name_vi, en: a.name_en }, deleteAt });
    db.prepare('UPDATE artworks SET warned_at = ? WHERE id = ?').run(now.toISOString(), a.id);
  }
  const res = db.prepare("DELETE FROM artworks WHERE status = 'in_progress' AND updated_at < ?").run(deleteBefore);
  // Dọn OTP hết hạn quá 1 ngày.
  db.prepare('DELETE FROM otp_codes WHERE expires_at < ?').run(new Date(now.getTime() - day).toISOString());
  return { warned: toWarn.length, deleted: Number(res.changes) };
}

export function scheduleCleanup(intervalMs = 3600 * 1000) {
  const run = () => {
    try {
      const r = runCleanup();
      if (r.warned || r.deleted) console.log(`[lifecycle] cảnh báo ${r.warned}, xoá ${r.deleted} tranh dở`);
    } catch (err) {
      console.error('[lifecycle] lỗi', err);
    }
  };
  run();
  return setInterval(run, intervalMs).unref();
}
