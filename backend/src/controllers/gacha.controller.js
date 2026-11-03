// Mục 9.4: bóc thẻ — mỗi 50 Điểm Gacha = 1 lượt, điểm dư giữ lại. Không liên quan tiền thật.
import { getDb, tx } from '../config/db.js';
import { GACHA_COST, GACHA_RATES } from '../config/constants.js';
import * as User from '../models/user.js';
import * as Card from '../models/card.js';
import * as Picture from '../models/picture.js';
import { pullCard } from '../services/gachaWeightedRandom.js';
import { badRequest, forbidden, notFound, int } from '../utils/http.js';
import { env } from '../config/env.js';

export async function info(req, res) {
  const u = await User.findById(req.user.id);
  const total = await getDb()
    .prepare(`SELECT p.rarity, COUNT(*) AS c FROM pictures p WHERE p.is_card = 1 AND p.hidden = 0 AND ${Picture.ACTIVE_PICTURE} GROUP BY p.rarity`)
    .all();
  res.json({
    gachaPoints: u.gacha_points,
    cost: GACHA_COST,
    pullsAvailable: Math.floor(u.gacha_points / GACHA_COST),
    rates: GACHA_RATES,
    poolSize: Object.fromEntries(total.map((r) => [r.rarity, r.c])),
  });
}

export async function pull(req, res) {
  // Sân khấu có 7 thẻ úp, mỗi thẻ là một thẻ cố định: client gửi `pictureIds` để lật đúng thẻ đã chọn (không gửi = ngẫu nhiên).
  const picked = Array.isArray(req.body?.pictureIds) ? req.body.pictureIds.map(Number) : null;
  const count = picked ? picked.length : int(req.body?.count ?? 1, { min: 1, max: 10, name: 'count' });
  if (picked && (count < 1 || count > 10)) throw badRequest('invalid_count');
  const results = await tx(async () => {
    const u = await User.findById(req.user.id);
    if (u.gacha_points < GACHA_COST * count) throw badRequest('not_enough_gacha_points');
    const pool = await Picture.cardPool();
    const out = [];
    for (let i = 0; i < count; i++) {
      let rarity;
      let pictureId;
      if (picked) {
        pictureId = picked[i];
        rarity = ['S', 'A', 'B', 'C'].find((r) => pool[r].includes(pictureId));
        if (!rarity) throw badRequest('invalid_card');
      } else ({ rarity, pictureId } = pullCard(pool));
      const cardId = await Card.add(u.id, pictureId, 'gacha');
      await getDb().prepare('INSERT INTO gacha_pulls (user_id, picture_id, rarity) VALUES (?, ?, ?)').run(u.id, pictureId, rarity);
      const p = await Picture.findPicture(pictureId);
      out.push({ cardId, rarity, picture: req.body?.preview === true ? Picture.toPreview(p) : Picture.toClient(p) });
    }
    await getDb()
      .prepare('UPDATE users SET gacha_points = gacha_points - ? WHERE id = ?')
      .run(GACHA_COST * count, u.id);
    return out;
  });
  const u = await User.findById(req.user.id);
  res.json({ results, gachaPoints: u.gacha_points, pullsAvailable: Math.floor(u.gacha_points / GACHA_COST) });
}

export async function collection(req, res) {
  const cards = await Card.listByUser(req.user.id);
  const total = (await getDb().prepare(`SELECT COUNT(*) AS c FROM pictures p WHERE p.is_card = 1 AND p.hidden = 0 AND ${Picture.ACTIVE_PICTURE}`).get()).c;
  const distinct = new Set(cards.map((c) => c.pictureId)).size;
  res.json({ cards, distinct, total });
}

/** Xem trước tranh của 1 thẻ mình sở hữu (để hiển thị trong bộ sưu tập). */
export async function cardPicture(req, res) {
  const card = await Card.findById(Number(req.params.id));
  if (!card || card.user_id !== req.user.id) throw badRequest('card_not_owned');
  res.json({ picture: Picture.toClient(await Picture.findPicture(card.picture_id)) });
}

/** Toàn bộ thẻ đang có trong game (theo chủ đề → đối tượng → hạng), kèm số bản bé đang có. */
export async function catalog(req, res) {
  const owned = new Map(
    (await getDb().prepare('SELECT picture_id, COUNT(*) AS c FROM user_cards WHERE user_id = ? GROUP BY picture_id').all(req.user.id)).map((r) => [
      r.picture_id,
      r.c,
    ]),
  );
  const rows = await getDb()
    .prepare(
      `SELECT p.id, p.rarity, p.name_vi, p.name_en, t.slug AS theme, t.name_vi AS theme_vi, t.name_en AS theme_en
       FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
       WHERE p.is_card = 1 AND p.hidden = 0 AND t.active = 1
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
export async function catalogPicture(req, res) {
  const p = await Picture.findPicture(Number(req.params.id));
  if (!p || !p.is_card || p.hidden || !await Picture.findActiveTheme(p.theme_slug)) throw notFound();
  const own = await getDb().prepare('SELECT 1 FROM user_cards WHERE user_id = ? AND picture_id = ?').get(req.user.id, p.id);
  if (!own && !env.gachaPreview && req.user.role !== 'admin') throw forbidden('card_not_owned');
  res.json({ picture: req.query.preview === '1' ? Picture.toPreview(p) : Picture.toClient(p) });
}
