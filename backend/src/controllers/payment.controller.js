// Mục 6: gói dịch vụ & thanh toán PayPal / MoMo.
import { PLANS } from '../config/constants.js';
import { env } from '../config/env.js';
import { planStatus } from '../services/quota.js';
import * as pay from '../services/payments/index.js';
import { badRequest, forbidden, notFound } from '../utils/http.js';

export async function subscription(req, res) {
  res.json({ plan: await planStatus(req.user.id), plans: PLANS, providers: pay.providerStatus(), billing: await pay.billingView(req.user.id) });
}

/** Huỷ tự gia hạn PayPal (gói vẫn dùng đến hết kỳ đã trả). */
export async function cancelRecurring(req, res) {
  await pay.cancelRecurring(req.user.id);
  res.json({ ok: true, plan: await planStatus(req.user.id), billing: await pay.billingView(req.user.id) });
}

export async function create(req, res) {
  const { plan, provider } = req.body || {};
  res.status(201).json(await pay.createPayment(req.user.id, plan, provider));
}

async function ownPayment(req) {
  const p = await pay.findPayment(req.params.id);
  if (!p || p.user_id !== req.user.id) throw notFound('payment_not_found');
  return p;
}

const paymentView = (p) => ({ id: p.id, plan: p.plan, provider: p.provider, status: p.status, amount: p.amount, currency: p.currency });

export async function status(req, res) {
  const p = await ownPayment(req);
  res.json({ payment: paymentView(p), plan: await planStatus(req.user.id) });
}

/** Quay về từ PayPal sau khi đồng ý thuê bao: hỏi lại PayPal rồi kích hoạt. */
export async function paypalConfirm(req, res) {
  const p = await ownPayment(req);
  if (p.provider !== 'paypal' || p.mock) throw badRequest('invalid_provider');
  if (p.status === 'pending' && p.provider_ref) await pay.syncPaypal(p.provider_ref);
  res.json({ payment: paymentView(await pay.findPayment(p.id)), plan: await planStatus(req.user.id) });
}

/** Reject unauthenticated events; propagate provider failures so PayPal retries. */
export async function paypalWebhook(req, res) {
  if (!(await pay.providers.paypal.verifyWebhook(req.body, req.headers))) throw forbidden('bad_signature');
  await pay.handlePaypalWebhook(req.body);
  res.status(200).json({ ok: true });
}

/** Webhook SePay: báo có tiền chuyển vào tài khoản ngân hàng. Xác thực bằng API Key. */
export async function sepayWebhook(req, res) {
  const key = env.sepay.apiKey;
  const auth = String(req.get('authorization') || '');
  if (!key || auth.replace(/^Apikey\s+/i, '').trim() !== key) return res.status(401).json({ success: false });
  await pay.handleBankWebhook(req.body);
  res.json({ success: true });
}

/** Hoàn tất giao dịch giả lập — chỉ khi cổng chưa cấu hình và PAYMENT_MOCK bật (không dùng ở production). */
export async function mockComplete(req, res) {
  const p = await ownPayment(req);
  if (!p.mock || !env.paymentMock) throw forbidden('mock_disabled');
  await pay.completeMock(p);
  res.json({ ok: true, plan: await planStatus(req.user.id) });
}

/** IPN từ máy chủ MoMo (server-to-server). Phải phản hồi 204 nhanh. */
export async function momoIpn(req, res) {
  const b = req.body || {};
  if (!pay.providers.momo.verifySignature(b)) return res.status(400).json({ error: { code: 'bad_signature' } });
  const p = await pay.findPayment(b.orderId);
  if (p) {
    if (!pay.providers.momo.matchesPayment(b, p)) throw badRequest('payment_mismatch');
    if (Number(b.resultCode) === 0) await pay.markPaid(p.id, b, `momo:${b.transId}`);
    else if (!pay.providers.momo.isPending(b.resultCode)) await pay.markFailed(p.id, b);
  }
  res.status(204).end();
}

/** Trang kết quả sau khi quay về từ MoMo: xác minh chữ ký các tham số trả về rồi cập nhật. */
export async function momoReturn(req, res) {
  const p = await ownPayment(req);
  if (p.provider !== 'momo' || p.mock) throw badRequest('invalid_provider');
  const q = req.body || {};
  if (p.status === 'pending' && q.signature && pay.providers.momo.isConfigured() && pay.providers.momo.verifySignature(q) && q.orderId === p.id) {
    if (!pay.providers.momo.matchesPayment(q, p)) throw badRequest('payment_mismatch');
    if (Number(q.resultCode) === 0) await pay.markPaid(p.id, q, `momo:${q.transId}`);
    else if (!pay.providers.momo.isPending(q.resultCode)) await pay.markFailed(p.id, q);
  }
  const fresh = await pay.findPayment(p.id);
  res.json({ payment: { id: fresh.id, status: fresh.status, plan: fresh.plan }, plan: await planStatus(req.user.id) });
}
