import { getDb } from '../config/db.js';
import { AVATARS, SIGNATURE_INKS, SIGNATURE_STYLES_FREE, SIGNATURE_STYLES_PREMIUM } from '../config/constants.js';
import * as User from '../models/user.js';
import * as Notifications from '../services/notifications.js';
import * as Signature from '../services/signature.js';
import { badRequest, forbidden, str } from '../utils/http.js';

const ownsItem = async (userId, slug, type) =>
  !!(await getDb()
    .prepare('SELECT 1 FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.user_id = ? AND i.slug = ? AND i.type = ?')
    .get(userId, slug, type));

export async function updateMe(req, res) {
  const b = req.body || {};
  const fields = {};
  if (b.nickname !== undefined) {
    const n = str(b.nickname, { min: 2, max: 20, name: 'nickname' });
    // Không cho đặt số điện thoại/email vào tên hiển thị để bảo vệ thông tin cá nhân của bé.
    if (/\d{6,}|@/.test(n)) throw badRequest('nickname_private_info');
    fields.nickname = n;
  }
  if (b.avatar !== undefined) {
    if (!AVATARS.includes(b.avatar)) throw badRequest('invalid_avatar');
    fields.avatar = b.avatar;
  }
  if (b.avatarFrame !== undefined) {
    if (b.avatarFrame !== null && !(await ownsItem(req.user.id, b.avatarFrame, 'avatar_frame'))) throw forbidden('item_not_owned');
    fields.avatar_frame = b.avatarFrame;
  }
  if (b.brushSkin !== undefined) {
    if (b.brushSkin !== null && !(await ownsItem(req.user.id, b.brushSkin, 'brush_skin'))) throw forbidden('item_not_owned');
    fields.brush_skin = b.brushSkin;
  }
  if (b.language !== undefined) {
    if (!['vi', 'en'].includes(b.language)) throw badRequest('invalid_language');
    fields.language = b.language;
  }
  const user = await User.update(req.user.id, fields);
  res.json({ user: await User.selfProfile(user) });
}

export async function notifications(req, res) {
  res.json({ notifications: await Notifications.list(req.user.id), unread: await Notifications.unreadCount(req.user.id) });
}

export async function readNotifications(req, res) {
  const ids = req.body?.ids === 'all' ? 'all' : (Array.isArray(req.body?.ids) ? req.body.ids : []).map(Number);
  await Notifications.markRead(req.user.id, ids);
  res.json({ unread: await Notifications.unreadCount(req.user.id) });
}

/** Chữ ký mặc định + danh sách mẫu (mẫu wow khoá khi không có gói tháng/năm). */
async function signatureState(user) {
  return {
    signature: await Signature.effectiveSignature(user),
    premium: await Signature.hasPremium(user.id),
    styles: { free: SIGNATURE_STYLES_FREE, premium: SIGNATURE_STYLES_PREMIUM },
    inks: SIGNATURE_INKS,
  };
}

export async function getSignature(req, res) {
  res.json(await signatureState(await User.findById(req.user.id)));
}

export async function setSignature(req, res) {
  const content = await Signature.prepareDefault(req.user.id, req.body || {});
  const user = await User.update(req.user.id, { signature: JSON.stringify(content) });
  res.json(await signatureState(user));
}
