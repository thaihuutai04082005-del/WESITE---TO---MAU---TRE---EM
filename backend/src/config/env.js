// Biến môi trường — xem backend/.env.example để biết đầy đủ các khoá.
import dotenv from 'dotenv';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ quiet: true });

const here = dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = resolve(here, '..', '..');
export const REPO_ROOT = resolve(BACKEND_ROOT, '..');

const bool = (v, d = false) => (v === undefined || v === '' ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

const isProd = process.env.NODE_ENV === 'production';

export const env = {
  isProd,
  isTest: process.env.NODE_ENV === 'test',
  port: num(process.env.PORT, 4000),
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:5173',
  apiPublicUrl: process.env.API_PUBLIC_URL || `http://localhost:${num(process.env.PORT, 4000)}`,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()),
  dbFile: process.env.DB_FILE || join(BACKEND_ROOT, 'data', 'app.db'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpires: process.env.JWT_EXPIRES || '30d',
  // Trả mã OTP trong response khi chưa cấu hình SMTP/SMS (chỉ môi trường dev).
  exposeDevOtp: bool(process.env.EXPOSE_DEV_OTP, !isProd),
  smtp: {
    host: process.env.SMTP_HOST,
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'Bé Tô Màu <no-reply@betomau.vn>',
  },
  sms: {
    // Nhà cung cấp SMS dạng HTTP (ví dụ eSMS.vn). Để trống = chế độ dev (log ra console).
    url: process.env.SMS_API_URL,
    apiKey: process.env.SMS_API_KEY,
    secretKey: process.env.SMS_SECRET_KEY,
    brandname: process.env.SMS_BRANDNAME,
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    secret: process.env.PAYPAL_CLIENT_SECRET || '',
    base: process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com',
  },
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || '',
    accessKey: process.env.MOMO_ACCESS_KEY || '',
    secretKey: process.env.MOMO_SECRET_KEY || '',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  },
  // Cho phép hoàn tất thanh toán giả lập khi cổng chưa cấu hình (KHÔNG bật ở production).
  paymentMock: bool(process.env.PAYMENT_MOCK, !isProd),
  arena: {
    durationSec: num(process.env.ARENA_DURATION_SEC, 600),
    lobbyWaitSec: num(process.env.ARENA_LOBBY_WAIT_SEC, 60),
    minPlayers: num(process.env.ARENA_MIN_PLAYERS, 2),
    // Khung giờ ghép ngẫu nhiên công khai (giờ Việt Nam), ví dụ "08:00-11:00,14:00-21:00". Trống = luôn mở.
    slots: process.env.ARENA_SLOTS || '',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '',
  },
};

if (isProd && env.jwtSecret === 'dev-secret-change-me') {
  throw new Error('JWT_SECRET phải được đặt ở môi trường production');
}
