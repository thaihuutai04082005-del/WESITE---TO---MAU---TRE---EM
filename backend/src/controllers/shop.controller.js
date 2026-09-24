// Mục 8.4: Shop — mua skin cọ vẽ & Khung Artwork bằng Ruby. Khung Avatar không bán (mở theo Rank).
import { getDb, tx } from '../config/db.js';
import * as User from '../models/user.js';
import * as progression from '../services/progression.js';
import { badRequest, conflict, notFound } from '../utils/http.js';

export function list(req, res) {
  const items = getDb()
    .prepare(
      `SELECT i.*, EXISTS (SELECT 1 FROM user_items ui WHERE ui.item_id = i.id AND ui.user_id = ?) AS owned
       FROM items i ORDER BY i.type, i.sort`,
    )
    .all(req.user.id)
    .map((i) => ({
      id: i.id,
      type: i.type,
      slug: i.slug,
      name: { vi: i.name_vi, en: i.name_en },
      price: i.price,
      limited: !!i.limited,
      rank: i.rank,
      owned: !!i.owned,
    }));
  const u = User.findById(req.user.id);
  res.json({ items, ruby: u.ruby, equipped: { brushSkin: u.brush_skin, avatarFrame: u.avatar_frame } });
}

export function buy(req, res) {
  const item = getDb().prepare('SELECT * FROM items WHERE slug = ?').get(req.params.slug);
  if (!item) throw notFound('item_not_found');
  if (item.price == null) throw badRequest('item_not_for_sale');
  tx((db) => {
    if (db.prepare('SELECT 1 FROM user_items WHERE user_id = ? AND item_id = ?').get(req.user.id, item.id)) throw conflict('item_already_owned');
    const r = db.prepare('UPDATE users SET ruby = ruby - ? WHERE id = ? AND ruby >= ?').run(item.price, req.user.id, item.price);
    if (!r.changes) throw badRequest('not_enough_ruby');
    db.prepare("INSERT INTO user_items (user_id, item_id, source) VALUES (?, ?, 'shop')").run(req.user.id, item.id);
  });
  const events = progression.record(req.user.id, 'shop_buy');
  res.json({ ok: true, ruby: User.findById(req.user.id).ruby, events });
}
