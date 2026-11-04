import { DEFAULT_ARTWORK_FRAME } from '../config/constants.js';
import { getDb, parseJson } from '../config/db.js';

export const findById = async (id) => await getDb().prepare('SELECT * FROM artworks WHERE id = ?').get(id);

export async function create({ userId, pictureId, mode, data, thumbnail = null, status = 'in_progress' }) {
  return getDb()
    .prepare('INSERT INTO artworks (user_id, picture_id, mode, data, thumbnail, status, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *')
    .get(
      userId,
      pictureId,
      mode,
      JSON.stringify(data || { fills: {}, strokes: [], stickers: [] }),
      thumbnail,
      status,
      status === 'completed' ? new Date().toISOString() : null,
    );
}

export async function listRowsByUser(userId, { status, mode, withData = false, thumbnails = true, initialThumbnails = 0 } = {}) {
  let sql = `SELECT a.id, a.picture_id, a.mode, a.status,
      ${thumbnails ? 'a.thumbnail' : `${initialThumbnails ? 'CASE WHEN ROW_NUMBER() OVER (ORDER BY a.updated_at DESC,a.id DESC)<=? THEN a.thumbnail ELSE NULL END' : 'NULL'} AS thumbnail,
        CASE WHEN a.thumbnail IS NULL OR a.thumbnail='' THEN 0 ELSE 1 END AS has_thumbnail`},
      a.artwork_frame, a.created_at, a.updated_at, a.completed_at,
      ${withData ? `${withData === 'drafts' ? "CASE WHEN a.status='in_progress' THEN a.data ELSE NULL END" : 'a.data'} AS data, a.user_id,` : ''} p.name_vi, p.name_en, p.slug, p.is_card, p.rarity
    FROM artworks a JOIN pictures p ON p.id = a.picture_id WHERE a.user_id = ?`;
  const args = !thumbnails && initialThumbnails ? [initialThumbnails,userId] : [userId];
  if (status) {
    sql += ' AND a.status = ?';
    args.push(status);
  }
  if (mode) {
    sql += ' AND a.mode = ?';
    args.push(mode);
  }
  sql += ' ORDER BY a.updated_at DESC,a.id DESC LIMIT 500';
  return getDb().prepare(sql).all(...args);
}

export async function listByUser(userId, options) {
  return (await listRowsByUser(userId, options)).map(toSummary);
}

export function toSummary(a) {
  return {
    id: a.id,
    pictureId: a.picture_id,
    mode: a.mode,
    status: a.status,
    thumbnail: a.thumbnail,
    // Chưa chọn khung (null) → tranh hoàn thành dùng khung gỗ mặc định; '' = bé chủ động bỏ khung.
    frame: a.artwork_frame === '' ? null : a.artwork_frame || (a.status === 'completed' ? DEFAULT_ARTWORK_FRAME : null),
    name: { vi: a.name_vi, en: a.name_en },
    isCard: !!a.is_card,
    rarity: a.rarity,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    completedAt: a.completed_at,
  };
}

export const dataOf = (a) => parseJson(a.data, { fills: {}, strokes: [], stickers: [], glitter: [] });
