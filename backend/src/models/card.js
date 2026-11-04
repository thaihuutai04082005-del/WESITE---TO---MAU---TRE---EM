import { getDb } from '../config/db.js';

/** Bộ sưu tập thẻ của 1 người: mỗi dòng là 1 bản thẻ (có thể trùng tranh). */
export async function listByUser(userId) {
  return (
    await getDb()
      .prepare(
        `SELECT uc.id, uc.picture_id, uc.source, uc.obtained_at, p.rarity, p.name_vi, p.name_en, p.slug,
        (SELECT COUNT(*) FROM trades t WHERE t.status = 'pending' AND (t.offer_card_id = uc.id OR t.request_card_id = uc.id)) AS locked
       FROM user_cards uc JOIN pictures p ON p.id = uc.picture_id WHERE uc.user_id = ?
       ORDER BY CASE p.rarity WHEN 'S' THEN 0 WHEN 'A' THEN 1 WHEN 'B' THEN 2 ELSE 3 END, uc.obtained_at DESC`,
      )
      .all(userId)
  ).map((c) => ({
    id: c.id,
    pictureId: c.picture_id,
    rarity: c.rarity,
    name: { vi: c.name_vi, en: c.name_en },
    source: c.source,
    obtainedAt: c.obtained_at,
    locked: c.locked > 0,
  }));
}

export const findById = async (id) => await getDb().prepare('SELECT * FROM user_cards WHERE id = ?').get(id);

export async function add(userId, pictureId, source) {
  const r = await getDb().prepare('INSERT INTO user_cards (user_id, picture_id, source) VALUES (?, ?, ?)').run(userId, pictureId, source);
  return Number(r.lastInsertRowid);
}

/** A multi-card reveal stays in its caller's transaction and keeps one ID per copy. */
export async function addMany(userId, pictureIds, source) {
  if (!pictureIds.length) return [];
  const rows = await getDb().prepare(`INSERT INTO user_cards (user_id, picture_id, source)
    VALUES ${pictureIds.map(() => '(?, ?, ?)').join(',')}
    RETURNING id, picture_id`).all(...pictureIds.flatMap(id => [userId, id, source]));
  const copies = new Map();
  for (const row of rows.sort((a, b) => a.id - b.id)) {
    if (!copies.has(row.picture_id)) copies.set(row.picture_id, []);
    copies.get(row.picture_id).push(row.id);
  }
  return pictureIds.map(id => copies.get(id).shift());
}
