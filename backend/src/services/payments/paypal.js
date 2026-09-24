// PayPal Orders API v2 (REST). Tài liệu: https://developer.paypal.com/docs/api/orders/v2/
import { env } from '../../config/env.js';

export const isConfigured = () => !!(env.paypal.clientId && env.paypal.secret);

async function accessToken() {
  const res = await fetch(`${env.paypal.base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.paypal.clientId}:${env.paypal.secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal OAuth lỗi ${res.status}`);
  return (await res.json()).access_token;
}

export async function createOrder({ paymentId, amountUsd, description }) {
  const token = await accessToken();
  const res = await fetch(`${env.paypal.base}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': paymentId },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ reference_id: paymentId, custom_id: paymentId, description, amount: { currency_code: 'USD', value: amountUsd.toFixed(2) } }],
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`PayPal tạo đơn lỗi: ${body.message || res.status}`);
  return { orderId: body.id, raw: body };
}

/** Thu tiền đơn đã được người mua chấp thuận. Trả về true nếu COMPLETED. */
export async function captureOrder(orderId) {
  const token = await accessToken();
  const res = await fetch(`${env.paypal.base}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json();
  if (!res.ok && body?.details?.[0]?.issue !== 'ORDER_ALREADY_CAPTURED') throw new Error(`PayPal capture lỗi: ${body.message || res.status}`);
  const unit = body.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return { completed: body.status === 'COMPLETED' || body?.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED', customId: capture?.custom_id || unit?.reference_id, raw: body };
}
