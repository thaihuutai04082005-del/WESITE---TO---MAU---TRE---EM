// Mục 9.4: bóc thẻ — mỗi 50 Điểm Gacha = 1 lượt, điểm dư giữ lại. Không liên quan tiền thật.
import { getDb, tx } from '../config/db.js';
import { GACHA_COST, GACHA_RATES } from '../config/constants.js';
import * as User from '../models/user.js';
import * as Card from '../models/card.js';
import * as Picture from '../models/picture.js';
import { pullCard } from '../services/gachaWeightedRandom.js';
import { badRequest, forbidden, notFound, int } from '../utils/http.js';
import { env } from '../config/env.js';

export function info(req, res) {
  const u = User.findById(req.user.id);
  const total = getDb().prepare(`SELECT p.rarity, COUNT(*) AS c FROM pictures p WHERE p.is_card = 1 AND ${Picture.ACTIVE_PICTURE} GROUP BY p.rarity`).all();
  res.json({
    gachaPoints: u.gacha_points,
    cost: GACHA_COST,
    pullsAvailable: Math.floor(u.gacha_points / GACHA_COST),
    rates: GACHA_RATES,
    poolSize: Object.fromEntries(total.map((r) => [r.rarity, r.c])),
  });
}

export function pull(req, res) {
  const count = int(req.body?.count ?? 1, { min: 1, max: 10, name: 'count' });
  const results = tx(() => {
    const u = User.findById(req.user.id);
    if (u.gacha_points < GACHA_COST * count) throw badRequest('not_enough_gacha_points');
    const pool = Picture.cardPool();
    const out = [];
    for (let i = 0; i < count; i++) {
      const { rarity, pictureId } = pullCard(pool);
      const cardId = Card.add(u.id, pictureId, 'gacha');
      getDb().prepare('INSERT INTO gacha_pulls (user_id, picture_id, rarity) VALUES (?, ?, ?)').run(u.id, pictureId, rarity);
      const p = Picture.findPicture(pictureId);
      out.push({ cardId, rarity, picture: Picture.toClient(p) });
    }
    getDb().prepare('UPDATE users SET gacha_points = gacha_points - ? WHERE id = ?').run(GACHA_COST * count, u.id);
    return out;
  });
  const u = User.findById(req.user.id);
  res.json({ results, gachaPoints: u.gacha_points, pullsAvailable: Math.floor(u.gacha_points / GACHA_COST) });
}

export function collection(req, res) {
  const cards = Card.listByUser(req.user.id);
  const total = getDb().prepare(`SELECT COUNT(*) AS c FROM pictures p WHERE p.is_card = 1 AND ${Picture.ACTIVE_PICTURE}`).get().c;
  const distinct = new Set(cards.map((c) => c.pictureId)).size;
  res.json({ cards, distinct, total });
}

/** Xem trước tranh của 1 thẻ mình sở hữu (để hiển thị trong bộ sưu tập). */
export function cardPicture(req, res) {
  const card = Card.findById(Number(req.params.id));
  if (!card || card.user_id !== req.user.id) throw badRequest('card_not_owned');
  res.json({ picture: Picture.toClient(Picture.findPicture(card.picture_id)) });
}

/** Toàn bộ thẻ đang có trong game (theo chủ đề → đối tượng → hạng), kèm số bản bé đang có. */
export function catalog(req, res) {
  const owned = new Map(
    getDb()
      .prepare('SELECT picture_id, COUNT(*) AS c FROM user_cards WHERE user_id = ? GROUP BY picture_id')
      .all(req.user.id)
      .map((r) => [r.picture_id, r.c]),
  );
  const rows = getDb()
    .prepare(
      `SELECT p.id, p.rarity, p.name_vi, p.name_en, t.slug AS theme, t.name_vi AS theme_vi, t.name_en AS theme_en
       FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
       WHERE p.is_card = 1 AND t.active = 1
       ORDER BY p.sort, p.id`, // thẻ vẽ tay: sort = thứ tự chủ web gửi
    )
    .all();
  const cards = rows.map((r) => ({
    pictureId: r.id,
    rarity: r.rarity,
    name: { vi: r.name_vi, en: r.name_en },
    theme: { slug: r.theme, name: { vi: r.theme_vi, en: r.theme_en } },
    count: owned.get(r.id) || 0,
  }));
  res.json({ preview: env.gachaPreview, cards, owned: owned.size, total: cards.length });
}

/** Ảnh 1 thẻ để xem: thẻ đã có, hoặc mọi thẻ khi đang bật xem trước (GACHA_PREVIEW). Chỉ để xem, không mở khoá tô. */
export function catalogPicture(req, res) {
  const p = Picture.findPicture(Number(req.params.id));
  if (!p || !p.is_card) throw notFound();
  const own = getDb().prepare('SELECT 1 FROM user_cards WHERE user_id = ? AND picture_id = ?').get(req.user.id, p.id);
  if (!own && !env.gachaPreview && req.user.role !== 'admin') throw forbidden('card_not_owned');
  res.json({ picture: Picture.toClient(p) });
}
