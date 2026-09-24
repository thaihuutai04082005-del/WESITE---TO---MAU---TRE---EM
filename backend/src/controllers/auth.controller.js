// Mục 5: Đăng ký thường (tên đăng nhập + mật khẩu + CAPTCHA + OTP phụ huynh), đăng nhập Google (≥13 tuổi),
// khôi phục mật khẩu qua SĐT/email phụ huynh đã xác minh.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as User from '../models/user.js';
import { createCaptcha, verifyCaptcha } from '../services/captcha.js';
import { issueOtp, consumeOtp, normalizeContact } from '../services/otp.js';
import { signToken } from '../middlewares/auth.js';
import { touchLogin, grantAvatarFrame } from '../services/progression.js';
import { planStatus } from '../services/quota.js';
import { unreadCount } from '../services/notifications.js';
import { vnDateKey } from '../utils/time.js';
import { badRequest, conflict, unauthorized, str } from '../utils/http.js';

const USERNAME_RE = /^[a-zA-Z0-9_.]{4,20}$/;

function checkPassword(pw) {
  const p = str(pw, { min: 6, max: 64, name: 'password' });
  if (!/[a-zA-Z]/.test(p) || !/\d/.test(p)) throw badRequest('weak_password');
  return p;
}

export function captcha(_req, res) {
  res.json(createCaptcha());
}

export async function registerStart(req, res) {
  const { username, password, captchaId, captchaText, contactType, contact } = req.body || {};
  if (!verifyCaptcha(captchaId, captchaText)) throw badRequest('captcha_wrong');
  const uname = str(username, { min: 4, max: 20, name: 'username' });
  if (!USERNAME_RE.test(uname)) throw badRequest('invalid_username');
  const pw = checkPassword(password);
  if (User.findByUsername(uname)) throw conflict('username_taken');
  const target = normalizeContact(contactType, contact);
  const passwordHash = await bcrypt.hash(pw, 10);
  const otp = await issueOtp({ purpose: 'register', type: contactType, target, payload: { username: uname, passwordHash, contactType } });
  res.json({ registrationId: otp.otpId, sentTo: User.maskContact(target), ...(otp.devCode ? { devCode: otp.devCode } : {}) });
}

export function registerVerify(req, res) {
  const { registrationId, code } = req.body || {};
  const { target, payload } = consumeOtp(registrationId, code, 'register');
  if (User.findByUsername(payload.username)) throw conflict('username_taken');
  const user = User.create({
    username: payload.username,
    password_hash: payload.passwordHash,
    guardian_contact: target,
    guardian_type: payload.contactType,
    avatar_frame: 'avatar-dong',
  });
  grantStarterFrame(user.id);
  res.status(201).json({ ok: true, username: user.username });
}

// Bậc Đồng là bậc khởi điểm: ai cũng có Khung Avatar Đồng.
const grantStarterFrame = (userId) => grantAvatarFrame(userId, 'avatar-dong');

function session(user) {
  const events = touchLogin(user.id, vnDateKey());
  const fresh = User.findById(user.id);
  return {
    token: signToken(fresh),
    user: User.selfProfile(fresh),
    plan: planStatus(fresh.id),
    unread: unreadCount(fresh.id),
    events,
  };
}

export async function login(req, res) {
  const { username, password } = req.body || {};
  const user = User.findByUsername(String(username || '').trim());
  const ok = user?.password_hash && (await bcrypt.compare(String(password || ''), user.password_hash));
  if (!ok) throw unauthorized('invalid_credentials');
  res.json(session(user));
}

/** Xác minh ID token Google qua endpoint tokeninfo và kiểm tra audience. */
async function verifyGoogleIdToken(idToken) {
  if (!env.googleClientId) throw badRequest('google_not_configured');
  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!r.ok) throw unauthorized('google_token_invalid');
  const info = await r.json();
  if (info.aud !== env.googleClientId) throw unauthorized('google_token_invalid');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(info.iss)) throw unauthorized('google_token_invalid');
  if (Number(info.exp) * 1000 < Date.now()) throw unauthorized('google_token_expired');
  return info;
}

export async function google(req, res) {
  const { credential, confirmAge13 } = req.body || {};
  if (!confirmAge13) throw badRequest('age_confirmation_required');
  const info = await verifyGoogleIdToken(credential);
  let user = User.findByGoogleSub(info.sub);
  if (!user) {
    user = User.create({ google_sub: info.sub, google_email: info.email || null, avatar_frame: 'avatar-dong' });
    grantStarterFrame(user.id);
  }
  res.json(session(user));
}

export async function forgotStart(req, res) {
  const { contactType, contact } = req.body || {};
  const target = normalizeContact(contactType, contact);
  const accounts = User.findByGuardian(target);
  // Luôn trả cùng một thông điệp để không lộ việc liên hệ này có tồn tại hay không.
  if (!accounts.length) return res.json({ resetId: null, sentTo: User.maskContact(target) });
  const otp = await issueOtp({ purpose: 'reset', type: contactType, target });
  res.json({ resetId: otp.otpId, sentTo: User.maskContact(target), ...(otp.devCode ? { devCode: otp.devCode } : {}) });
}

export function forgotVerify(req, res) {
  const { resetId, code } = req.body || {};
  if (!resetId) throw badRequest('otp_invalid');
  const { target } = consumeOtp(resetId, code, 'reset');
  const accounts = User.findByGuardian(target);
  const resetToken = jwt.sign({ purpose: 'reset', target }, env.jwtSecret, { expiresIn: '15m' });
  res.json({ resetToken, accounts: accounts.map((a) => ({ username: a.username, nickname: a.nickname })) });
}

export async function forgotReset(req, res) {
  const { resetToken, username, newPassword } = req.body || {};
  let claims;
  try {
    claims = jwt.verify(String(resetToken || ''), env.jwtSecret);
  } catch {
    throw badRequest('reset_token_invalid');
  }
  if (claims.purpose !== 'reset') throw badRequest('reset_token_invalid');
  const user = User.findByUsername(String(username || ''));
  if (!user || user.guardian_contact !== claims.target) throw badRequest('reset_token_invalid');
  const pw = checkPassword(newPassword);
  User.update(user.id, { password_hash: await bcrypt.hash(pw, 10) });
  res.json({ ok: true });
}

export function me(req, res) {
  res.json(session(req.user));
}
