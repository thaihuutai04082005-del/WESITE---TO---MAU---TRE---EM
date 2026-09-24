// Mục 10.3: kết bạn chỉ qua mã mời riêng; tặng/đổi thẻ giới hạn 3 lượt/ngày, xác nhận 2 chiều.
import { getDb, tx } from '../config/db.js';
import { TRADE_DAILY_LIMIT } from '../config/constants.js';
import * as User from '../models/user.js';
import * as Card from '../models/card.js';
import * as progression from '../services/progression.js';
import { notify } from '../services/notifications.js';
import { emitToUser } from '../services/realtime.js';
import { vnDayStart } from '../utils/time.js';
import { badRequest, conflict, forbidden, notFound, str } from '../utils/http.js';

export function areFriends(a, b) {
  return !!getDb()
    .prepare(
      "SELECT 1 FROM friendships WHERE status = 'accepted' AND ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))",
    )
    .get(a, b, b, a);
}

export function friends(req, res) {
  const me = req.user.id;
  const rows = getDb().prepare('SELECT * FROM friendships WHERE requester_id = ? OR addressee_id = ? ORDER BY created_at DESC').all(me, me);
  const out = { friends: [], incoming: [], outgoing: [], myCode: req.user.friend_code };
  for (const f of rows) {
    const otherId = f.requester_id === me ? f.addressee_id : f.requester_id;
    const entry = { friendshipId: f.id, user: User.publicProfile(User.findById(otherId)), since: f.created_at };
    if (f.status === 'accepted') out.friends.push(entry);
    else if (f.addressee_id === me) out.incoming.push(entry);
    else out.outgoing.push(entry);
  }
  res.json(out);
}

export function addFriend(req, res) {
  const code = str(req.body?.code, { min: 4, max: 12, name: 'code' }).toUpperCase();
  const other = User.findByFriendCode(code);
  if (!other) throw notFound('friend_code_not_found');
  if (other.id === req.user.id) throw badRequest('cannot_friend_self');
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM friendships WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)')
    .get(req.user.id, other.id, other.id, req.user.id);
  if (existing?.status === 'accepted') throw conflict('already_friends');
  if (existing && existing.requester_id === other.id) {
    // Bạn kia đã gửi lời mời cho mình trước → nhập mã của nhau = đồng ý luôn.
    return acceptFriendship(req, res, existing);
  }
  if (existing) throw conflict('request_already_sent');
  db.prepare('INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)').run(req.user.id, other.id);
  notify(other.id, 'friend_request', { from: User.publicProfile(req.user) });
  res.status(201).json({ ok: true, status: 'pending', user: User.publicProfile(other) });
}

function acceptFriendship(req, res, f) {
  getDb().prepare("UPDATE friendships SET status = 'accepted' WHERE id = ?").run(f.id);
  const other = f.requester_id === req.user.id ? f.addressee_id : f.requester_id;
  notify(other, 'friend_accepted', { by: User.publicProfile(req.user) });
  progression.record(other, 'friend_add');
  const events = progression.record(req.user.id, 'friend_add');
  res.json({ ok: true, status: 'accepted', events });
}

export function acceptFriend(req, res) {
  const f = getDb().prepare("SELECT * FROM friendships WHERE id = ? AND addressee_id = ? AND status = 'pending'").get(Number(req.params.id), req.user.id);
  if (!f) throw notFound();
  acceptFriendship(req, res, f);
}

export function removeFriend(req, res) {
  const f = getDb().prepare('SELECT * FROM friendships WHERE id = ? AND (requester_id = ? OR addressee_id = ?)').get(Number(req.params.id), req.user.id, req.user.id);
  if (!f) throw notFound();
  getDb().prepare('DELETE FROM friendships WHERE id = ?').run(f.id);
  getDb()
    .prepare("UPDATE trades SET status = 'cancelled', resolved_at = ? WHERE status = 'pending' AND ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?))")
    .run(new Date().toISOString(), f.requester_id, f.addressee_id, f.addressee_id, f.requester_id);
  res.json({ ok: true });
}

export function friendCards(req, res) {
  const other = Number(req.params.userId);
  if (!areFriends(req.user.id, other)) throw forbidden('not_friends');
  res.json({ cards: Card.listByUser(other).filter((c) => !c.locked) });
}

// ---------------- Trading ----------------

const tradesToday = (userId) =>
  getDb()
    .prepare("SELECT COUNT(*) AS c FROM trades WHERE from_user = ? AND created_at >= ? AND status IN ('pending', 'accepted')")
    .get(userId, vnDayStart()).c;

function tradeView(t) {
  const card = (id) => {
    if (!id) return null;
    const c = getDb().prepare('SELECT uc.id, uc.picture_id, p.rarity, p.name_vi, p.name_en FROM user_cards uc JOIN pictures p ON p.id = uc.picture_id WHERE uc.id = ?').get(id);
    return c && { id: c.id, pictureId: c.picture_id, rarity: c.rarity, name: { vi: c.name_vi, en: c.name_en } };
  };
  return {
    id: t.id,
    from: User.publicProfile(User.findById(t.from_user)),
    to: User.publicProfile(User.findById(t.to_user)),
    offer: card(t.offer_card_id),
    request: card(t.request_card_id),
    kind: t.request_card_id ? 'exchange' : 'gift',
    status: t.status,
    createdAt: t.created_at,
    resolvedAt: t.resolved_at,
  };
}

export function trades(req, res) {
  const rows = getDb().prepare('SELECT * FROM trades WHERE from_user = ? OR to_user = ? ORDER BY id DESC LIMIT 100').all(req.user.id, req.user.id);
  res.json({ trades: rows.map(tradeView), usedToday: tradesToday(req.user.id), dailyLimit: TRADE_DAILY_LIMIT });
}

const isLocked = (cardId) =>
  !!getDb().prepare("SELECT 1 FROM trades WHERE status = 'pending' AND (offer_card_id = ? OR request_card_id = ?)").get(cardId, cardId);

/** Bước 1 (người gửi xác nhận): tạo đề nghị tặng hoặc đổi thẻ. */
export function createTrade(req, res) {
  const { toUserId, offerCardId, requestCardId } = req.body || {};
  const to = Number(toUserId);
  if (!areFriends(req.user.id, to)) throw forbidden('not_friends');
  if (tradesToday(req.user.id) >= TRADE_DAILY_LIMIT) throw badRequest('trade_daily_limit');
  const offer = Card.findById(Number(offerCardId));
  if (!offer || offer.user_id !== req.user.id) throw badRequest('card_not_owned');
  if (isLocked(offer.id)) throw conflict('card_in_trade');
  let request = null;
  if (requestCardId) {
    request = Card.findById(Number(requestCardId));
    if (!request || request.user_id !== to) throw badRequest('card_not_owned');
    if (isLocked(request.id)) throw conflict('card_in_trade');
  }
  const r = getDb().prepare('INSERT INTO trades (from_user, to_user, offer_card_id, request_card_id) VALUES (?, ?, ?, ?)').run(req.user.id, to, offer.id, request?.id ?? null);
  const t = getDb().prepare('SELECT * FROM trades WHERE id = ?').get(Number(r.lastInsertRowid));
  notify(to, 'trade_offer', { tradeId: t.id, from: User.publicProfile(req.user), kind: request ? 'exchange' : 'gift' });
  res.status(201).json({ trade: tradeView(t) });
}

/** Bước 2 (người nhận xác nhận): đồng ý → chuyển thẻ (kiểm tra lại quyền sở hữu trong transaction). */
export function acceptTrade(req, res) {
  const t = tx((db) => {
    const t0 = db.prepare("SELECT * FROM trades WHERE id = ? AND to_user = ? AND status = 'pending'").get(Number(req.params.id), req.user.id);
    if (!t0) throw notFound('trade_not_found');
    const offer = Card.findById(t0.offer_card_id);
    const request = t0.request_card_id ? Card.findById(t0.request_card_id) : null;
    const valid = offer?.user_id === t0.from_user && (!t0.request_card_id || request?.user_id === t0.to_user) && areFriends(t0.from_user, t0.to_user);
    const nowIso = new Date().toISOString();
    if (!valid) {
      db.prepare("UPDATE trades SET status = 'failed', resolved_at = ? WHERE id = ?").run(nowIso, t0.id);
      throw conflict('trade_invalid');
    }
    db.prepare("UPDATE user_cards SET user_id = ?, source = 'trade' WHERE id = ?").run(t0.to_user, offer.id);
    if (request) db.prepare("UPDATE user_cards SET user_id = ?, source = 'trade' WHERE id = ?").run(t0.from_user, request.id);
    db.prepare("UPDATE trades SET status = 'accepted', resolved_at = ? WHERE id = ?").run(nowIso, t0.id);
    return db.prepare('SELECT * FROM trades WHERE id = ?').get(t0.id);
  });
  notify(t.from_user, 'trade_accepted', { tradeId: t.id, by: User.publicProfile(req.user) });
  emitToUser(t.from_user, 'cards:changed', {});
  res.json({ trade: tradeView(t) });
}

export function declineTrade(req, res) {
  const t = getDb().prepare("SELECT * FROM trades WHERE id = ? AND to_user = ? AND status = 'pending'").get(Number(req.params.id), req.user.id);
  if (!t) throw notFound('trade_not_found');
  getDb().prepare("UPDATE trades SET status = 'declined', resolved_at = ? WHERE id = ?").run(new Date().toISOString(), t.id);
  notify(t.from_user, 'trade_declined', { tradeId: t.id, by: User.publicProfile(req.user) });
  res.json({ ok: true });
}

export function cancelTrade(req, res) {
  const t = getDb().prepare("SELECT * FROM trades WHERE id = ? AND from_user = ? AND status = 'pending'").get(Number(req.params.id), req.user.id);
  if (!t) throw notFound('trade_not_found');
  getDb().prepare("UPDATE trades SET status = 'cancelled', resolved_at = ? WHERE id = ?").run(new Date().toISOString(), t.id);
  res.json({ ok: true });
}
