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
  apiPublicUrl: process.env.API_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${num(process.env.PORT, 4000)}`,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()),
  databasePassword: process.env.PGPASSWORD || '',
  databaseUrl: process.env.NODE_ENV === 'test' ? '' : process.env.DATABASE_URL || '',
  dbFile: process.env.DB_FILE || join(BACKEND_ROOT, 'data', 'app.db'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpires: process.env.JWT_EXPIRES || '30d',
  // Trả mã OTP trong response khi chưa cấu hình SMTP/SMS (chỉ môi trường dev).
  exposeDevOtp: !isProd && bool(process.env.EXPOSE_DEV_OTP, true),
  // Temporarily use email verification only. Enable SMS explicitly after configuring delivery.
  phoneOtpEnabled: bool(process.env.PHONE_OTP_ENABLED, false),
  // Trang Bóc thẻ: lật sẵn (xem trước) toàn bộ thẻ trong lúc đang hoàn thiện bộ thẻ. Đặt GACHA_PREVIEW=false để ẩn thẻ chưa có.
  gachaPreview: bool(process.env.GACHA_PREVIEW, true),
  smtp: {
    host: process.env.SMTP_HOST,
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'TinyTints <no-reply@example.com>',
  },
  sms: {
    // Nhà cung cấp SMS dạng HTTP (ví dụ eSMS.vn). Để trống = chế độ dev (log ra console).
    url: process.env.SMS_API_URL,
    apiKey: process.env.SMS_API_KEY,
    secretKey: process.env.SMS_SECRET_KEY,
    brandname: process.env.SMS_BRANDNAME,
  },
  // HTTPS email/SMS providers work on hosts that restrict SMTP ports.
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || '',
    senderName: process.env.BREVO_SENDER_NAME || 'TinyTints',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
    from: process.env.TWILIO_PHONE_NUMBER || '',
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    secret: process.env.PAYPAL_CLIENT_SECRET || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    base: process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com',
    // Tuỳ chọn: id gói đã tạo sẵn trên PayPal (P-…). Để trống = web tự tạo gói lần đầu.
    planMonth: process.env.PAYPAL_PLAN_MONTH || '',
    planYear: process.env.PAYPAL_PLAN_YEAR || '',
  },
  // Chuyển khoản VietQR vào tài khoản ngân hàng; SePay báo về webhook khi tiền vào để tự mở gói.
  bank: {
    code: process.env.BANK_CODE || 'ACB',
    // Mã BIN NAPAS của ngân hàng (tự suy ra từ BANK_CODE với các ngân hàng phổ biến; ACB = 970416).
    bin: process.env.BANK_BIN || '',
    accountNo: process.env.BANK_ACCOUNT_NO || '',
    accountName: process.env.BANK_ACCOUNT_NAME || '',
  },
  sepay: {
    // API Key đặt trong cấu hình webhook của SePay (SePay gửi kèm header "Authorization: Apikey <key>").
    apiKey: process.env.SEPAY_API_KEY || '',
  },
  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || '',
    accessKey: process.env.MOMO_ACCESS_KEY || '',
    secretKey: process.env.MOMO_SECRET_KEY || '',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  },
  // Cho phép hoàn tất thanh toán giả lập khi cổng chưa cấu hình (KHÔNG bật ở production).
  paymentMock: !isProd && bool(process.env.PAYMENT_MOCK, true),
  arena: {
    durationSec: num(process.env.ARENA_DURATION_SEC, 600),
    lobbyWaitSec: num(process.env.ARENA_LOBBY_WAIT_SEC, 60),
    minPlayers: num(process.env.ARENA_MIN_PLAYERS, 2),
    // Khung giờ ghép ngẫu nhiên công khai (giờ Việt Nam), ví dụ "08:00-11:00,14:00-21:00". Trống = luôn mở.
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '',
  },
};

if (isProd && env.jwtSecret === 'dev-secret-change-me') {
  throw new Error('JWT_SECRET phải được đặt ở môi trường production');
}
