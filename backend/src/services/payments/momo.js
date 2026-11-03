// Cổng MoMo (captureWallet, API v2). Tài liệu: https://developers.momo.vn/v3/docs/payment/api/wallet/onetime
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env.js';

export const isConfigured = () =>
  !!(
    env.momo.partnerCode &&
    env.momo.accessKey &&
    env.momo.secretKey &&
    (!env.isProd || env.momo.endpoint === 'https://payment.momo.vn/v2/gateway/api/create')
  );

const sign = (raw) => createHmac('sha256', env.momo.secretKey).update(raw).digest('hex');

export async function createPayment({ paymentId, amount, orderInfo, redirectUrl, ipnUrl }) {
  const { partnerCode, accessKey } = env.momo;
  const requestId = `${paymentId}-${Date.now()}`;
  const requestType = 'captureWallet';
  const extraData = '';
  const raw = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${paymentId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const res = await fetch(env.momo.endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId: paymentId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature: sign(raw),
      lang: 'vi',
    }),
  });
  const body = await res.json();
  if (!res.ok || body.resultCode !== 0) throw new Error(`MoMo lỗi ${body.resultCode}: ${body.message}`);
  if (!body.payUrl || new URL(body.payUrl).protocol !== 'https:') throw new Error('Invalid MoMo checkout response');
  return { payUrl: body.payUrl, requestId, raw: body };
}

/** Xác thực chữ ký IPN/redirect của MoMo. */
export function verifySignature(p) {
  if (!isConfigured() || p.partnerCode !== env.momo.partnerCode || !/^[a-f0-9]{64}$/i.test(String(p.signature || ''))) return false;
  const raw = `accessKey=${env.momo.accessKey}&amount=${p.amount}&extraData=${p.extraData ?? ''}&message=${p.message}&orderId=${p.orderId}&orderInfo=${p.orderInfo}&orderType=${p.orderType}&partnerCode=${p.partnerCode}&payType=${p.payType}&requestId=${p.requestId}&responseTime=${p.responseTime}&resultCode=${p.resultCode}&transId=${p.transId}`;
  const expected = Buffer.from(sign(raw));
  const got = Buffer.from(String(p.signature || '').toLowerCase());
  return expected.length === got.length && timingSafeEqual(expected, got);
}

/** A signed message must still match the exact checkout and a real transaction. */
export function matchesPayment(p, payment) {
  return (
    payment?.provider === 'momo' &&
    !payment.mock &&
    payment.currency === 'VND' &&
    p.requestId === payment.provider_ref &&
    Number.isSafeInteger(Number(p.amount)) &&
    Number(p.amount) === payment.amount &&
    /^\d+$/.test(String(p.resultCode)) &&
    (Number(p.resultCode) !== 0 || /^[1-9][0-9]*$/.test(String(p.transId)))
  );
}
export const isPending = (code) => [1000, 7000, 7002, 9000].includes(Number(code));
