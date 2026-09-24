// Gửi OTP qua Email (SMTP) hoặc SMS (HTTP API). Chưa cấu hình → in ra console (môi trường dev).
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;
function mailer() {
  if (!env.smtp.host) return null;
  transporter ||= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

const TEXT = {
  register: (code) => `Ma xac nhan dang ky tai khoan to mau cho be: ${code}. Ma co hieu luc 10 phut.`,
  reset: (code) => `Ma khoi phuc mat khau tai khoan to mau cua be: ${code}. Ma co hieu luc 10 phut.`,
};

export async function sendCode({ type, target, code, purpose }) {
  const text = TEXT[purpose](code);
  if (type === 'email' && mailer()) {
    await mailer().sendMail({
      from: env.smtp.from,
      to: target,
      subject: purpose === 'register' ? 'Mã xác nhận đăng ký cho bé' : 'Mã khôi phục mật khẩu',
      text,
      html: `<div style="font-family:Arial,sans-serif;font-size:16px;color:#1B2A38">
        <p>Xin chào phụ huynh,</p>
        <p>${purpose === 'register' ? 'Bé vừa đăng ký tài khoản tô màu và nhập email của bạn để khôi phục mật khẩu.' : 'Có yêu cầu khôi phục mật khẩu cho tài khoản của bé.'}</p>
        <p>Mã xác nhận: <b style="font-size:24px;letter-spacing:4px;color:#2B9BF4">${code}</b></p>
        <p>Mã có hiệu lực trong 10 phút. Nếu không phải bạn, hãy bỏ qua email này.</p></div>`,
    });
    return { delivered: true };
  }
  if (type === 'phone' && env.sms.url) {
    const res = await fetch(env.sms.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ApiKey: env.sms.apiKey,
        SecretKey: env.sms.secretKey,
        Brandname: env.sms.brandname,
        Phone: target,
        Content: text,
        SmsType: 2,
      }),
    });
    if (!res.ok) throw new Error(`SMS lỗi HTTP ${res.status}`);
    return { delivered: true };
  }
  if (!env.isTest) console.log(`[OTP dev] ${purpose} → ${target}: ${code}`);
  return { delivered: false };
}
