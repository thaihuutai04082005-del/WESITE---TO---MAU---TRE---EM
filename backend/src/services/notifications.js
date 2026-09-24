// Thông báo trong ứng dụng. Nội dung được frontend dịch theo `type` + `data`.
import { getDb, parseJson } from '../config/db.js';
import { emitToUser } from './realtime.js';

export function notify(userId, type, data = {}) {
  const res = getDb().prepare('INSERT INTO notifications (user_id, type, data) VALUES (?, ?, ?)').run(userId, type, JSON.stringify(data));
  const n = { id: Number(res.lastInsertRowid), type, data, read: false, createdAt: new Date().toISOString() };
  emitToUser(userId, 'notification', n);
  return n;
}

export function list(userId, limit = 50) {
  return getDb()
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT ?')
    .all(userId, limit)
    .map((n) => ({ id: n.id, type: n.type, data: parseJson(n.data, {}), read: !!n.read, createdAt: n.created_at }));
}

export function markRead(userId, ids) {
  const db = getDb();
  if (ids === 'all') db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
  else for (const id of ids) db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND id = ?').run(userId, id);
}

export const unreadCount = (userId) =>
  getDb().prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0').get(userId).c;
