// Điều phối thanh toán: tạo giao dịch, xác nhận, kích hoạt gói. Idempotent theo payment id.
import { getDb, tx } from '../../config/db.js';
import { env } from '../../config/env.js';
import { PLANS } from '../../config/constants.js';
import { uuid } from '../../utils/ids.js';
import { badRequest, HttpError, notFound } from '../../utils/http.js';
import { activatePlan } from '../quota.js';
import { notify } from '../notifications.js';
import * as paypal from './paypal.js';
import * as momo from './momo.js';

export const providers = { paypal, momo };

export function providerStatus() {
  return {
    paypal: { configured: paypal.isConfigured(), clientId: env.paypal.clientId || null },
    momo: { configured: momo.isConfigured() },
    mockAllowed: env.paymentMock,
  };
}

export async function createPayment(userId, plan, provider) {
  if (!['month', 'year'].includes(plan)) throw badRequest('invalid_plan');
  if (!providers[provider]) throw badRequest('invalid_provider');
  const configured = providers[provider].isConfigured();
  if (!configured && !env.paymentMock) throw new HttpError(503, 'payment_unavailable');

  const id = uuid();
  const p = PLANS[plan];
  const [amount, currency] = provider === 'paypal' ? [p.priceUsd, 'USD'] : [p.priceVnd, 'VND'];
  getDb()
    .prepare('INSERT INTO payments (id, user_id, plan, provider, amount, currency, mock) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, plan, provider, amount, currency, configured ? 0 : 1);

  if (!configured) return { paymentId: id, mock: true, amount, currency };

  const description = plan === 'month' ? 'Goi Thang - Web to mau' : 'Goi Nam - Web to mau';
  if (provider === 'paypal') {
    const { orderId } = await paypal.createOrder({ paymentId: id, amountUsd: amount, description });
    getDb().prepare('UPDATE payments SET provider_ref = ? WHERE id = ?').run(orderId, id);
    return { paymentId: id, orderId, amount, currency };
  }
  const { payUrl } = await momo.createPayment({
    paymentId: id,
    amount,
    orderInfo: description,
    redirectUrl: `${env.publicUrl}/payment/result?paymentId=${id}`,
    ipnUrl: `${env.apiPublicUrl}/api/payments/momo/ipn`,
  });
  return { paymentId: id, payUrl, amount, currency };
}

/** Đánh dấu đã thanh toán và kích hoạt gói (chỉ chạy 1 lần cho mỗi payment). */
export function markPaid(paymentId, raw) {
  return tx((db) => {
    const pay = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    if (!pay) throw notFound('payment_not_found');
    if (pay.status === 'paid') return { already: true, payment: pay };
    db.prepare("UPDATE payments SET status = 'paid', paid_at = ?, raw = ? WHERE id = ?").run(new Date().toISOString(), JSON.stringify(raw ?? null), paymentId);
    const sub = activatePlan(pay.user_id, pay.plan, paymentId);
    notify(pay.user_id, 'plan_activated', { plan: pay.plan, endsAt: sub.endsAt });
    return { already: false, payment: { ...pay, status: 'paid' }, subscription: sub };
  });
}

export function markFailed(paymentId, raw) {
  getDb().prepare("UPDATE payments SET status = 'failed', raw = ? WHERE id = ? AND status = 'pending'").run(JSON.stringify(raw ?? null), paymentId);
}

export const findPayment = (id) => getDb().prepare('SELECT * FROM payments WHERE id = ?').get(id);
