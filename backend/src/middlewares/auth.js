// Xác thực bằng JWT (header Authorization: Bearer <token>).
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as User from '../models/user.js';
import { forbidden, unauthorized } from '../utils/http.js';

export const signToken = (user) => jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpires });
export const verifyToken = (token) => jwt.verify(String(token || ''), env.jwtSecret);

function extract(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

export async function requireAuth(req, _res, next) {
  const token = extract(req);
  if (!token) return next(unauthorized());
  try {
    const user = await User.findById(verifyToken(token).sub);
    if (!user) return next(unauthorized());
    req.user = user;
    next();
  } catch {
    next(unauthorized('token_invalid'));
  }
}

export async function optionalAuth(req, _res, next) {
  const token = extract(req);
  if (token) {
    try {
      req.user = (await User.findById(verifyToken(token).sub)) || undefined;
    } catch {
      /* bỏ qua token hỏng */
    }
  }
  next();
}

/** Public previews need a signed ID; their content query checks current account/subscription rights. */
export function optionalPreviewAuth(req, res, next) {
  if (req.query.preview !== '1' || req.query.access === '1') return optionalAuth(req, res, next);
  const token = extract(req);
  if (token) {
    try {
      const sub = verifyToken(token).sub;
      const id = typeof sub === 'number' || (typeof sub === 'string' && /^\d+$/.test(sub)) ? Number(sub) : NaN;
      if (Number.isSafeInteger(id) && id > 0) req.user = { id };
    } catch {
      // The endpoint is public: expired or invalid tokens receive anonymous previews.
    }
  }
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(forbidden('admin_only'));
  next();
}

/** Bắt buộc đã đặt tên hiển thị (lần đầu đăng nhập) trước khi dùng các tính năng chính. */
export function requireNickname(req, _res, next) {
  if (!req.user?.nickname) return next(forbidden('nickname_required'));
  next();
}
