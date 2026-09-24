import { getDb } from '../config/db.js';
import { AVATARS } from '../config/constants.js';
import * as User from '../models/user.js';
import * as Notifications from '../services/notifications.js';
import { badRequest, forbidden, str } from '../utils/http.js';

const ownsItem = (userId, slug, type) =>
  !!getDb()
    .prepare('SELECT 1 FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.user_id = ? AND i.slug = ? AND i.type = ?')
    .get(userId, slug, type);

export function updateMe(req, res) {
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
    if (b.avatarFrame !== null && !ownsItem(req.user.id, b.avatarFrame, 'avatar_frame')) throw forbidden('item_not_owned');
    fields.avatar_frame = b.avatarFrame;
  }
  if (b.brushSkin !== undefined) {
    if (b.brushSkin !== null && !ownsItem(req.user.id, b.brushSkin, 'brush_skin')) throw forbidden('item_not_owned');
    fields.brush_skin = b.brushSkin;
  }
  if (b.language !== undefined) {
    if (!['vi', 'en'].includes(b.language)) throw badRequest('invalid_language');
    fields.language = b.language;
  }
  const user = User.update(req.user.id, fields);
  res.json({ user: User.selfProfile(user) });
}

export function notifications(req, res) {
  res.json({ notifications: Notifications.list(req.user.id), unread: Notifications.unreadCount(req.user.id) });
}

export function readNotifications(req, res) {
  const ids = req.body?.ids === 'all' ? 'all' : (Array.isArray(req.body?.ids) ? req.body.ids : []).map(Number);
  Notifications.markRead(req.user.id, ids);
  res.json({ unread: Notifications.unreadCount(req.user.id) });
}
