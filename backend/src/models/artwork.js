import { getDb, parseJson } from '../config/db.js';

export const findById = (id) => getDb().prepare('SELECT * FROM artworks WHERE id = ?').get(id);

export function create({ userId, pictureId, mode, data, thumbnail = null, status = 'in_progress' }) {
  const res = getDb()
    .prepare('INSERT INTO artworks (user_id, picture_id, mode, data, thumbnail, status, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(userId, pictureId, mode, JSON.stringify(data || { fills: {}, strokes: [], stickers: [] }), thumbnail, status, status === 'completed' ? new Date().toISOString() : null);
  return findById(Number(res.lastInsertRowid));
}

export function listByUser(userId, { status, mode } = {}) {
  let sql = `SELECT a.id, a.picture_id, a.mode, a.status, a.thumbnail, a.artwork_frame, a.created_at, a.updated_at, a.completed_at,
      p.name_vi, p.name_en, p.slug, p.is_card, p.rarity
    FROM artworks a JOIN pictures p ON p.id = a.picture_id WHERE a.user_id = ?`;
  const args = [userId];
  if (status) {
    sql += ' AND a.status = ?';
    args.push(status);
  }
  if (mode) {
    sql += ' AND a.mode = ?';
    args.push(mode);
  }
  sql += ' ORDER BY a.updated_at DESC LIMIT 500';
  return getDb().prepare(sql).all(...args).map(toSummary);
}

export function toSummary(a) {
  return {
    id: a.id,
    pictureId: a.picture_id,
    mode: a.mode,
    status: a.status,
    thumbnail: a.thumbnail,
    frame: a.artwork_frame,
    name: { vi: a.name_vi, en: a.name_en },
    isCard: !!a.is_card,
    rarity: a.rarity,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    completedAt: a.completed_at,
  };
}

export const dataOf = (a) => parseJson(a.data, { fills: {}, strokes: [], stickers: [], glitter: [] });
