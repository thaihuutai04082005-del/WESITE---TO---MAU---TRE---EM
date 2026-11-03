// PayPal Subscriptions API (thuê bao tự gia hạn). Tài liệu: https://developer.paypal.com/docs/api/subscriptions/v1/
// Gói (plan) được tự tạo lần đầu và lưu id vào app_settings; hoặc đặt sẵn PAYPAL_PLAN_MONTH / PAYPAL_PLAN_YEAR.
import { env } from '../../config/env.js';
import { getDb } from '../../config/db.js';
import { PLANS } from '../../config/constants.js';

export const isConfigured = () =>
  !!(env.paypal.clientId && env.paypal.secret && env.paypal.webhookId && (!env.isProd || env.paypal.base === 'https://api-m.paypal.com'));

async function accessToken() {
  const res = await fetch(`${env.paypal.base}/v1/oauth2/token`, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.paypal.clientId}:${env.paypal.secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal OAuth lỗi ${res.status}`);
  return (await res.json()).access_token;
}

async function call(method, path, body, requestId) {
  const token = await accessToken();
  const res = await fetch(`${env.paypal.base}${path}`, {
    method,
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`PayPal API request failed (${res.status})`);
  return json;
}

const setting = async (key) => (await getDb().prepare('SELECT value FROM app_settings WHERE key = ?').get(key))?.value;
const saveSetting = async (key, value) =>
  await getDb().prepare('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);

/** Id gói PayPal cho 'month' / 'year' (tự tạo sản phẩm + gói nếu chưa có). */
export async function planId(plan) {
  const preset = plan === 'month' ? env.paypal.planMonth : env.paypal.planYear;
  if (preset) return preset;
  const price = PLANS[plan].priceUsd.toFixed(2);
  const key = `paypal:${env.paypal.base}:plan:${plan}:${price}`;
  const saved = await setting(key);
  if (saved) return saved;
  const productKey = `paypal:${env.paypal.base}:product`;
  let productId = await setting(productKey);
  if (!productId) {
    const prod = await call('POST', '/v1/catalogs/products', { name: 'TinyTints', type: 'SERVICE', category: 'SOFTWARE' });
    productId = prod.id;
    await saveSetting(productKey, productId);
  }
  const created = await call('POST', '/v1/billing/plans', {
    product_id: productId,
    name: plan === 'month' ? 'TinyTints - VIP Monthly' : 'TinyTints - VIP Yearly',
    billing_cycles: [
      {
        frequency: { interval_unit: plan === 'month' ? 'MONTH' : 'YEAR', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: price, currency_code: 'USD' } },
      },
    ],
    payment_preferences: { auto_bill_outstanding: true, payment_failure_threshold: 2 },
  });
  await saveSetting(key, created.id);
  return created.id;
}

/** Tạo thuê bao; trả về id + đường dẫn để người mua đồng ý trên PayPal. */
export async function createSubscription({ paymentId, plan, returnUrl, cancelUrl }) {
  const expectedPlanId = await planId(plan);
  const sub = await call(
    'POST',
    '/v1/billing/subscriptions',
    {
      plan_id: expectedPlanId,
      custom_id: paymentId,
      application_context: {
        brand_name: 'TinyTints',
        user_action: 'SUBSCRIBE_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    },
    paymentId,
  );
  const approve = (sub.links || []).find((l) => l.rel === 'approve')?.href;
  if (!sub.id || !approve || new URL(approve).protocol !== 'https:') throw new Error('Invalid PayPal checkout response');
  return { subscriptionId: sub.id, approveUrl: approve, planId: expectedPlanId };
}

/** Trạng thái thuê bao: { status, customId, cyclesCompleted, nextBillingTime }. */
export async function getSubscription(id) {
  const s = await call('GET', `/v1/billing/subscriptions/${encodeURIComponent(id)}`);
  const cycles = s.billing_info?.cycle_executions?.find((c) => c.tenure_type === 'REGULAR');
  return {
    status: s.status,
    customId: s.custom_id,
    planId: s.plan_id,
    cyclesCompleted: cycles?.cycles_completed ?? 0,
    lastPaymentTime: s.billing_info?.last_payment?.time || null,
    nextBillingTime: s.billing_info?.next_billing_time || null,
    raw: s,
  };
}

export async function cancelSubscription(id, reason = 'Người dùng huỷ tự gia hạn') {
  await call('POST', `/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, { reason });
}

/** Only accept events authenticated by PayPal for this exact webhook registration. */
export async function verifyWebhook(event, headers) {
  if (!isConfigured() || !event?.id) return false;
  const fields = ['paypal-auth-algo', 'paypal-cert-url', 'paypal-transmission-id', 'paypal-transmission-sig', 'paypal-transmission-time'];
  if (fields.some((name) => typeof headers[name] !== 'string' || !headers[name])) return false;
  const result = await call('POST', '/v1/notifications/verify-webhook-signature', {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: env.paypal.webhookId,
    webhook_event: event,
  });
  return result.verification_status === 'SUCCESS';
}

/** Completed captures are evidence of payment; ACTIVE alone is not. */
export async function getTransactions(id, startTime) {
  const path = `/v1/billing/subscriptions/${encodeURIComponent(id)}/transactions`;
  let next = `${path}?${new URLSearchParams({ start_time: startTime, end_time: new Date().toISOString() })}`;
  const transactions = [];
  const seen = new Set();
  while (next) {
    if (seen.has(next) || seen.size >= 100) throw new Error('Incomplete PayPal transaction history');
    seen.add(next);
    const result = await call('GET', next);
    if (!Array.isArray(result.transactions)) throw new Error('Invalid PayPal transaction history');
    transactions.push(...result.transactions);
    const link = result.links?.find((entry) => entry.rel === 'next')?.href;
    if (!link) {
      if (result.total_pages > seen.size) throw new Error('Incomplete PayPal transaction history');
      break;
    }
    const url = new URL(link, env.paypal.base);
    if (url.origin !== new URL(env.paypal.base).origin || url.pathname !== path) throw new Error('Invalid PayPal pagination link');
    next = url.pathname + url.search;
  }
  return transactions;
}
