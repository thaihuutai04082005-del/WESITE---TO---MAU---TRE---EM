// Mục 6: gói dịch vụ & thanh toán PayPal / MoMo.
import { PLANS } from '../config/constants.js';
import { env } from '../config/env.js';
import { planStatus } from '../services/quota.js';
import * as pay from '../services/payments/index.js';
import { badRequest, forbidden, notFound } from '../utils/http.js';

export function subscription(req, res) {
  res.json({ plan: planStatus(req.user.id), plans: PLANS, providers: pay.providerStatus() });
}

export async function create(req, res) {
  const { plan, provider } = req.body || {};
  res.status(201).json(await pay.createPayment(req.user.id, plan, provider));
}

function ownPayment(req) {
  const p = pay.findPayment(req.params.id);
  if (!p || p.user_id !== req.user.id) throw notFound('payment_not_found');
  return p;
}

export function status(req, res) {
  const p = ownPayment(req);
  res.json({ payment: { id: p.id, plan: p.plan, provider: p.provider, status: p.status, amount: p.amount, currency: p.currency }, plan: planStatus(req.user.id) });
}

export async function paypalCapture(req, res) {
  const p = ownPayment(req);
  if (p.provider !== 'paypal' || p.mock) throw badRequest('invalid_provider');
  if (p.status === 'paid') return res.json({ ok: true, plan: planStatus(req.user.id) });
  const r = await pay.providers.paypal.captureOrder(p.provider_ref);
  if (!r.completed || (r.customId && r.customId !== p.id)) {
    pay.markFailed(p.id, r.raw);
    throw badRequest('payment_failed');
  }
  pay.markPaid(p.id, r.raw);
  res.json({ ok: true, plan: planStatus(req.user.id) });
}

/** Hoàn tất giao dịch giả lập — chỉ khi cổng chưa cấu hình và PAYMENT_MOCK bật (không dùng ở production). */
export function mockComplete(req, res) {
  const p = ownPayment(req);
  if (!p.mock || !env.paymentMock) throw forbidden('mock_disabled');
  pay.markPaid(p.id, { mock: true });
  res.json({ ok: true, plan: planStatus(req.user.id) });
}

/** IPN từ máy chủ MoMo (server-to-server). Phải phản hồi 204 nhanh. */
export function momoIpn(req, res) {
  const b = req.body || {};
  if (!pay.providers.momo.verifySignature(b)) return res.status(400).json({ error: { code: 'bad_signature' } });
  const p = pay.findPayment(b.orderId);
  if (p && Number(b.amount) === p.amount) {
    if (Number(b.resultCode) === 0) pay.markPaid(p.id, b);
    else pay.markFailed(p.id, b);
  }
  res.status(204).end();
}

/** Trang kết quả sau khi quay về từ MoMo: xác minh chữ ký các tham số trả về rồi cập nhật. */
export function momoReturn(req, res) {
  const p = ownPayment(req);
  const q = req.body || {};
  if (p.status === 'pending' && q.signature && pay.providers.momo.isConfigured() && pay.providers.momo.verifySignature(q) && q.orderId === p.id) {
    if (Number(q.resultCode) === 0 && Number(q.amount) === p.amount) pay.markPaid(p.id, q);
    else pay.markFailed(p.id, q);
  }
  const fresh = pay.findPayment(p.id);
  res.json({ payment: { id: fresh.id, status: fresh.status, plan: fresh.plan }, plan: planStatus(req.user.id) });
}
