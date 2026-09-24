// Mã OTP gửi tới SĐT/email phụ huynh: dùng cho đăng ký (Mục 5.1) và khôi phục mật khẩu (Mục 5.2).
import { createHash, timingSafeEqual } from 'node:crypto';
import { getDb, parseJson } from '../config/db.js';
import { env } from '../config/env.js';
import { numericCode, uuid } from '../utils/ids.js';
import { badRequest } from '../utils/http.js';
import { sendCode } from './messaging.js';

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const hash = (code) => createHash('sha256').update(String(code)).digest('hex');

export function normalizeContact(type, raw) {
  const v = String(raw || '').trim();
  if (type === 'email') {
    const e = v.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || e.length > 120) throw badRequest('invalid_email');
    return e;
  }
  if (type === 'phone') {
    let p = v.replace(/[\s.-]/g, '');
    if (p.startsWith('+84')) p = `0${p.slice(3)}`;
    else if (p.startsWith('84') && p.length === 11) p = `0${p.slice(2)}`;
    if (!/^0\d{9}$/.test(p)) throw badRequest('invalid_phone');
    return p;
  }
  throw badRequest('invalid_contact_type');
}

/** Tạo và gửi OTP. Trả về { otpId, devCode? } — devCode chỉ có ở môi trường dev khi chưa cấu hình kênh gửi. */
export async function issueOtp({ purpose, type, target, payload = {} }) {
  const db = getDb();
  // Chống spam: tối đa 1 mã / 45 giây cho cùng đích.
  const recent = db
    .prepare("SELECT created_at FROM otp_codes WHERE target = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1")
    .get(target, purpose);
  if (recent && Date.now() - Date.parse(recent.created_at) < 45000) throw badRequest('otp_too_frequent');

  const code = numericCode(6);
  const id = uuid();
  db.prepare('INSERT INTO otp_codes (id, purpose, target, code_hash, payload, expires_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    id,
    purpose,
    target,
    hash(code),
    JSON.stringify(payload),
    new Date(Date.now() + TTL_MS).toISOString(),
  );
  const { delivered } = await sendCode({ type, target, code, purpose });
  return { otpId: id, ...(!delivered && env.exposeDevOtp ? { devCode: code } : {}) };
}

/** Kiểm tra OTP; đúng thì đánh dấu đã dùng và trả payload. */
export function consumeOtp(otpId, code, purpose) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM otp_codes WHERE id = ? AND purpose = ?').get(otpId, purpose);
  if (!row || row.used) throw badRequest('otp_invalid');
  if (Date.parse(row.expires_at) < Date.now()) throw badRequest('otp_expired');
  if (row.attempts >= MAX_ATTEMPTS) throw badRequest('otp_too_many_attempts');
  const ok = timingSafeEqual(Buffer.from(hash(String(code || '').trim())), Buffer.from(row.code_hash));
  if (!ok) {
    db.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?').run(otpId);
    throw badRequest('otp_wrong', undefined, { attemptsLeft: MAX_ATTEMPTS - row.attempts - 1 });
  }
  db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(otpId);
  return { target: row.target, payload: parseJson(row.payload, {}) };
}
