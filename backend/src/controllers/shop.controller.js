// Mục 8.4: Shop — mua màu họa tiết, bìa truyện & Khung Artwork bằng Ruby. Khung Avatar không bán (mở theo Rank).
import { getDb, tx } from '../config/db.js';
import * as User from '../models/user.js';
import * as progression from '../services/progression.js';
import { badRequest, conflict, notFound } from '../utils/http.js';

export async function list(req, res) {
  const items = (
    await getDb()
      .prepare(
        `SELECT i.*, EXISTS (SELECT 1 FROM user_items ui WHERE ui.item_id = i.id AND ui.user_id = ?) AS owned
       FROM items i WHERE i.type != 'brush_skin' ORDER BY i.type, i.sort`,
      )
      .all(req.user.id)
  ).map((i) => ({
    id: i.id,
    type: i.type,
    slug: i.slug,
    name: { vi: i.name_vi, en: i.name_en },
    price: i.price,
    limited: !!i.limited,
    rank: i.rank,
    owned: !!i.owned || i.price === 0, // price 0 = miễn phí / mặc định (VD khung gỗ)
  }));
  const u = await User.findById(req.user.id);
  res.json({ items, ruby: u.ruby, equipped: { brushSkin: u.brush_skin, avatarFrame: u.avatar_frame } });
}

export async function buy(req, res) {
  const item = await getDb().prepare('SELECT * FROM items WHERE slug = ?').get(req.params.slug);
  if (!item) throw notFound('item_not_found');
  if (item.price == null) throw badRequest('item_not_for_sale');
  if (item.price === 0) throw conflict('item_already_owned'); // vật phẩm miễn phí: ai cũng có sẵn
  await tx(async (db) => {
    if (await db.prepare('SELECT 1 FROM user_items WHERE user_id = ? AND item_id = ?').get(req.user.id, item.id))
      throw conflict('item_already_owned');
    const r = await db.prepare('UPDATE users SET ruby = ruby - ? WHERE id = ? AND ruby >= ?').run(item.price, req.user.id, item.price);
    if (!r.changes) throw badRequest('not_enough_ruby');
    await db.prepare("INSERT INTO user_items (user_id, item_id, source) VALUES (?, ?, 'shop')").run(req.user.id, item.id);
  });
  const events = await progression.record(req.user.id, 'shop_buy');
  res.json({ ok: true, ruby: (await User.findById(req.user.id)).ruby, events });
}
