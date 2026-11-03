// Gửi OTP qua Email (SMTP) hoặc SMS (HTTP API). Chưa cấu hình → in ra console (môi trường dev).
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const TIMEOUT_MS = 15000;

// Report only a provider name/status, never response text, tokens or OTPs.
function deliveryError(provider, status = 'invalid_response') {
  const error = new Error('OTP provider did not accept the message');
  error.provider = provider;
  error.providerStatus = status;
  return error;
}

async function sendHttp(provider, url, options) {
  try {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw deliveryError(provider, response.status);
    const body = await response.json();
    return body;
  } catch (error) {
    throw deliveryError(provider, error.providerStatus || 'transport_or_response_error');
  }
}

let transporter = null;
function mailer() {
  if (!env.smtp.host) return null;
  transporter ||= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: TIMEOUT_MS,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

const TEXT = {
  register: (code) => `Ma xac nhan dang ky tai khoan to mau cho be: ${code}. Ma co hieu luc 10 phut.`,
  reset: (code) => `Ma khoi phuc mat khau tai khoan to mau cua be: ${code}. Ma co hieu luc 10 phut.`,
};

export async function sendCode({ type, target, code, purpose, language }) {
  const text = type === 'phone' && target.startsWith('+1')
    ? `Your TinyTints ${purpose === 'reset' ? 'password reset' : 'verification'} code is ${code}. It expires in 10 minutes.`
    : TEXT[purpose](code);
  if (type === 'email' && (env.brevo.apiKey || env.brevo.senderEmail)) {
    if (!env.brevo.apiKey || !env.brevo.senderEmail) throw deliveryError('brevo', 'missing_configuration');
    const english = language === 'en';
    const subject = english
      ? (purpose === 'reset' ? 'Reset your TinyTints password' : 'Your TinyTints verification code')
      : (purpose === 'reset' ? 'Đặt lại mật khẩu TinyTints' : 'Mã xác minh TinyTints');
    const textContent = english
      ? `Your TinyTints ${purpose === 'reset' ? 'password reset' : 'verification'} code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.`
      : `Mã ${purpose === 'reset' ? 'đặt lại mật khẩu' : 'xác minh'} TinyTints của bạn là ${code}. Mã có hiệu lực 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`;
    const body = await sendHttp('brevo', 'https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.brevo.apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ sender: { email: env.brevo.senderEmail, name: env.brevo.senderName }, to: [{ email: target }], subject, textContent }),
    });
    if (typeof body.messageId !== 'string' || !body.messageId) throw deliveryError('brevo');
    // Accepted by the provider; arrival in the inbox is not a delivery guarantee.
    return { delivered: true };
  }
  if (type === 'email' && mailer()) {
    const result = await mailer().sendMail({
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
    if (!result.accepted?.some((address) => String(address).toLowerCase() === target.toLowerCase())) throw deliveryError('smtp', 'recipient_rejected');
    return { delivered: true };
  }
  if (type === 'phone' && (env.twilio.accountSid || env.twilio.authToken || env.twilio.messagingServiceSid || env.twilio.from)) {
    const { accountSid, authToken, messagingServiceSid, from } = env.twilio;
    if (!/^AC[a-f0-9]{32}$/i.test(accountSid) || !authToken || (!messagingServiceSid && !from)) throw deliveryError('twilio', 'missing_configuration');
    const to = target.startsWith('0') ? `+84${target.slice(1)}` : target;
    const form = new URLSearchParams({ To: to, Body: text, ...(messagingServiceSid ? { MessagingServiceSid: messagingServiceSid } : { From: from }) });
    const body = await sendHttp('twilio', `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    if (!/^(SM|MM)[a-f0-9]{32}$/i.test(body.sid || '') || body.error_code || ['failed', 'undelivered', 'canceled'].includes(body.status)) throw deliveryError('twilio');
    return { delivered: true };
  }
  if (type === 'phone' && env.sms.url) {
    const body = await sendHttp('esms', env.sms.url, {
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
    if (String(body.CodeResult) !== '100' || !body.SMSID) throw deliveryError('esms');
    return { delivered: true };
  }
  if (!env.isProd && !env.isTest && env.exposeDevOtp) console.log(`[OTP dev] ${purpose} → ${target}: ${code}`);
  return { delivered: false };
}
