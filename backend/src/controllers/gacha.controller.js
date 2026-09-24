// Mục 9.4: bóc thẻ — mỗi 50 Điểm Gacha = 1 lượt, điểm dư giữ lại. Không liên quan tiền thật.
import { getDb, tx } from '../config/db.js';
import { GACHA_COST, GACHA_RATES } from '../config/constants.js';
import * as User from '../models/user.js';
import * as Card from '../models/card.js';
import * as Picture from '../models/picture.js';
import { pullCard } from '../services/gachaWeightedRandom.js';
import { badRequest, int } from '../utils/http.js';

export function info(req, res) {
  const u = User.findById(req.user.id);
  const total = getDb().prepare('SELECT rarity, COUNT(*) AS c FROM pictures WHERE is_card = 1 GROUP BY rarity').all();
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
  const total = getDb().prepare('SELECT COUNT(*) AS c FROM pictures WHERE is_card = 1').get().c;
  const distinct = new Set(cards.map((c) => c.pictureId)).size;
  res.json({ cards, distinct, total });
}

/** Xem trước tranh của 1 thẻ mình sở hữu (để hiển thị trong bộ sưu tập). */
export function cardPicture(req, res) {
  const card = Card.findById(Number(req.params.id));
  if (!card || card.user_id !== req.user.id) throw badRequest('card_not_owned');
  res.json({ picture: Picture.toClient(Picture.findPicture(card.picture_id)) });
}
