// Điều phối thanh toán (Mục 6.3):
//  • PayPal (USD) — thuê bao tự gia hạn như các ứng dụng AI: PayPal tự trừ tiền mỗi kỳ, người dùng huỷ được bất cứ lúc nào.
//  • Chuyển khoản VietQR (VND) vào tài khoản ngân hàng — quét bằng app ngân hàng hoặc MoMo; SePay báo về khi tiền vào.
//  • MoMo (cổng chính thức) — giữ lại, chỉ dùng khi đã có mã doanh nghiệp.
// Mọi ghi nhận tiền đều idempotent (payments.txn_ref UNIQUE).
import { getDb, tx } from '../../config/db.js';
import { env } from '../../config/env.js';
import { PLANS } from '../../config/constants.js';
import { randomCode, uuid } from '../../utils/ids.js';
import { badRequest, conflict, HttpError, notFound } from '../../utils/http.js';
import { activatePlan, activeSubscription } from '../quota.js';
import { notify } from '../notifications.js';
import * as paypal from './paypal.js';
import * as momo from './momo.js';
import { BANK_BIN, vietQrPayload } from './vietqr.js';

const bank = { isConfigured: () => !!env.sepay.apiKey };
export const providers = { paypal, momo, bank };

export function providerStatus() {
  return {
    paypal: { configured: paypal.isConfigured() },
    bank: { configured: bank.isConfigured() },
    momo: { configured: momo.isConfigured() },
    mockAllowed: env.paymentMock,
  };
}

const db = () => getDb();
export const findPayment = (id) => db().prepare('SELECT * FROM payments WHERE id = ?').get(id);
const activeRecurring = (userId) =>
  db().prepare("SELECT * FROM recurring WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(userId);

/** Thông tin chuyển khoản + nội dung mã VietQR (trình duyệt tự vẽ mã). */
export function bankInfo(payment) {
  const bin = env.bank.bin || BANK_BIN[env.bank.code.toUpperCase()];
  return {
    bank: env.bank.code,
    accountNo: env.bank.accountNo,
    accountName: env.bank.accountName,
    amount: payment.amount,
    content: payment.code,
    qrData: vietQrPayload({ bin, accountNo: env.bank.accountNo, amount: payment.amount, content: payment.code }),
  };
}

export async function createPayment(userId, plan, provider) {
  if (!['month', 'year'].includes(plan)) throw badRequest('invalid_plan');
  if (!providers[provider]) throw badRequest('invalid_provider');
  const configured = providers[provider].isConfigured();
  if (!configured && !env.paymentMock) throw new HttpError(503, 'payment_unavailable');
  if (provider === 'paypal' && activeRecurring(userId)) throw conflict('already_subscribed');

  const id = uuid();
  const p = PLANS[plan];
  const [amount, currency] = provider === 'paypal' ? [p.priceUsd, 'USD'] : [p.priceVnd, 'VND'];
  const code = provider === 'bank' ? `BTM${randomCode(6)}` : null;
  db()
    .prepare('INSERT INTO payments (id, user_id, plan, provider, amount, currency, mock, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, plan, provider, amount, currency, configured ? 0 : 1, code);
  const base = { paymentId: id, amount, currency, mock: !configured };

  if (provider === 'bank') return { ...base, bankTransfer: bankInfo(findPayment(id)) };
  if (!configured) return base;

  if (provider === 'paypal') {
    const { subscriptionId, approveUrl } = await paypal.createSubscription({
      paymentId: id,
      plan,
      returnUrl: `${env.publicUrl}/payment/result?paymentId=${id}`,
      cancelUrl: `${env.publicUrl}/plans`,
    });
    db().prepare('UPDATE payments SET provider_ref = ? WHERE id = ?').run(subscriptionId, id);
    db().prepare('INSERT INTO recurring (id, user_id, plan, payment_id) VALUES (?, ?, ?, ?)').run(subscriptionId, userId, plan, id);
    return { ...base, payUrl: approveUrl };
  }
  const description = plan === 'month' ? 'Goi Thang - Be To Mau' : 'Goi Nam - Be To Mau';
  const { payUrl } = await momo.createPayment({
    paymentId: id,
    amount,
    orderInfo: description,
    redirectUrl: `${env.publicUrl}/payment/result?paymentId=${id}`,
    ipnUrl: `${env.apiPublicUrl}/api/payments/momo/ipn`,
  });
  return { ...base, payUrl };
}

/**
 * Đánh dấu đã thanh toán và kích hoạt / gia hạn gói (mỗi payment chỉ 1 lần).
 * txnRef: mã giao dịch phía cổng — nếu đã ghi nhận trước đó thì bỏ qua (chống trùng webhook).
 */
export function markPaid(paymentId, raw, txnRef = null) {
  return tx((conn) => {
    const pay = conn.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    if (!pay) throw notFound('payment_not_found');
    if (pay.status === 'paid') return { already: true, payment: pay };
    if (txnRef && conn.prepare('SELECT 1 FROM payments WHERE txn_ref = ?').get(txnRef)) return { already: true, payment: pay };
    conn
      .prepare("UPDATE payments SET status = 'paid', paid_at = ?, raw = ?, txn_ref = COALESCE(?, txn_ref) WHERE id = ?")
      .run(new Date().toISOString(), JSON.stringify(raw ?? null), txnRef, paymentId);
    const sub = activatePlan(pay.user_id, pay.plan, paymentId);
    notify(pay.user_id, 'plan_activated', { plan: pay.plan, endsAt: sub.endsAt });
    return { already: false, payment: { ...pay, status: 'paid' }, subscription: sub };
  });
}

export function markFailed(paymentId, raw) {
  db().prepare("UPDATE payments SET status = 'failed', raw = ? WHERE id = ? AND status = 'pending'").run(JSON.stringify(raw ?? null), paymentId);
}

// ---------- PayPal: đồng bộ thuê bao ----------
const STATUS = { ACTIVE: 'active', CANCELLED: 'cancelled', SUSPENDED: 'suspended', EXPIRED: 'expired' };

/**
 * Hỏi PayPal trạng thái thuê bao rồi cập nhật: kích hoạt kỳ đầu, ghi nhận mỗi kỳ đã trừ tiền (gia hạn),
 * đổi trạng thái huỷ/tạm dừng. Không tin dữ liệu webhook gửi tới — luôn hỏi lại PayPal.
 */
export async function syncPaypal(subId) {
  const rec = db().prepare('SELECT * FROM recurring WHERE id = ?').get(subId);
  if (!rec || rec.id.startsWith('MOCK-')) return rec;
  const s = await paypal.getSubscription(subId);
  const status = STATUS[s.status] || 'pending';
  db().prepare('UPDATE recurring SET status = ? WHERE id = ?').run(status, subId);
  if (status === 'active') {
    const cycles = Math.max(1, s.cyclesCompleted);
    for (let k = 1; k <= cycles; k++) {
      const ref = `${subId}#${k}`;
      if (db().prepare('SELECT 1 FROM payments WHERE txn_ref = ?').get(ref)) continue;
      let payId = rec.payment_id;
      if (k > 1 || findPayment(payId)?.status === 'paid') {
        payId = uuid();
        db()
          .prepare("INSERT INTO payments (id, user_id, plan, provider, amount, currency, provider_ref) VALUES (?, ?, ?, 'paypal', ?, 'USD', ?)")
          .run(payId, rec.user_id, rec.plan, PLANS[rec.plan].priceUsd, subId);
      }
      markPaid(payId, { subscription: subId, cycle: k, lastPayment: s.lastPaymentTime }, ref);
    }
  } else if (status !== 'pending') {
    markFailed(rec.payment_id, { subscription: subId, status: s.status });
  }
  return db().prepare('SELECT * FROM recurring WHERE id = ?').get(subId);
}

/** Webhook PayPal: lấy id thuê bao từ sự kiện rồi đồng bộ. */
export async function handlePaypalWebhook(event) {
  const r = event?.resource || {};
  const subId = r.billing_agreement_id || (String(event?.event_type || '').startsWith('BILLING.SUBSCRIPTION') ? r.id : null);
  if (subId && db().prepare('SELECT 1 FROM recurring WHERE id = ?').get(subId)) await syncPaypal(subId);
}

/** Huỷ tự gia hạn: gói vẫn dùng đến hết kỳ đã trả. */
export async function cancelRecurring(userId) {
  const rec = activeRecurring(userId);
  if (!rec) throw notFound('no_recurring');
  if (!rec.id.startsWith('MOCK-')) await paypal.cancelSubscription(rec.id);
  db().prepare("UPDATE recurring SET status = 'cancelled', cancelled_at = ? WHERE id = ?").run(new Date().toISOString(), rec.id);
}

/** Thông tin thanh toán định kỳ cho trang Gói. */
export function billingView(userId) {
  const rec = activeRecurring(userId);
  return rec ? { provider: 'paypal', plan: rec.plan, autoRenew: true } : null;
}

/** Hoàn tất giả lập (dev). PayPal giả lập cũng tạo thuê bao giả để thử nút huỷ. */
export function completeMock(payment) {
  if (payment.provider === 'paypal') {
    db().prepare("INSERT OR IGNORE INTO recurring (id, user_id, plan, status, payment_id) VALUES (?, ?, ?, 'active', ?)").run(`MOCK-${payment.id}`, payment.user_id, payment.plan, payment.id);
  }
  return markPaid(payment.id, { mock: true });
}

// ---------- Chuyển khoản (SePay) ----------
/**
 * Webhook SePay: { id, transferType, transferAmount, content, ... }. Tìm mã BTMxxxxxx trong nội dung
 * chuyển khoản; đủ tiền thì kích hoạt gói. Trả về kết quả để ghi log.
 */
export function handleBankWebhook(b) {
  if (!b || b.transferType !== 'in') return { ignored: 'not_incoming' };
  const m = String(b.content || '').toUpperCase().match(/BTM[A-HJ-NP-Z2-9]{6}/);
  if (!m) return { ignored: 'no_code' };
  const pay = db().prepare("SELECT * FROM payments WHERE code = ? AND provider = 'bank'").get(m[0]);
  if (!pay) return { ignored: 'unknown_code' };
  if (pay.status === 'paid') return { already: true };
  if (Number(b.transferAmount) < pay.amount) {
    db().prepare('UPDATE payments SET raw = ? WHERE id = ?').run(JSON.stringify({ underpaid: b }), pay.id);
    return { ignored: 'underpaid' };
  }
  markPaid(pay.id, b, `sepay:${b.id}`);
  return { paid: pay.id };
}

// ---------- Việc định kỳ ----------
/** Nhắc gia hạn trước 3 ngày (gói trả từng lần) + đồng bộ thuê bao PayPal sắp tới kỳ trừ tiền. */
export async function runBillingJobs(now = new Date()) {
  const soon = new Date(now.getTime() + 3 * 86400000).toISOString();
  const iso = now.toISOString();
  const expiring = db()
    .prepare(
      `SELECT s.* FROM subscriptions s
       WHERE s.ends_at > ? AND s.ends_at <= ? AND s.reminded_at IS NULL
         AND NOT EXISTS (SELECT 1 FROM subscriptions s2 WHERE s2.user_id = s.user_id AND s2.ends_at > s.ends_at)
         AND NOT EXISTS (SELECT 1 FROM recurring r WHERE r.user_id = s.user_id AND r.status = 'active')`,
    )
    .all(iso, soon);
  for (const s of expiring) {
    notify(s.user_id, 'plan_expiring', { plan: s.plan, endsAt: s.ends_at });
    db().prepare('UPDATE subscriptions SET reminded_at = ? WHERE id = ?').run(iso, s.id);
  }
  let synced = 0;
  if (paypal.isConfigured()) {
    const day = new Date(now.getTime() + 86400000);
    const recs = db().prepare("SELECT * FROM recurring WHERE status IN ('active', 'pending') AND id NOT LIKE 'MOCK-%'").all();
    for (const r of recs) {
      const sub = activeSubscription(r.user_id, day);
      const stalePending = r.status === 'pending' && Date.parse(r.created_at) < now.getTime() - 10 * 60000;
      if ((r.status === 'active' && !sub) || stalePending) {
        try {
          await syncPaypal(r.id);
          synced++;
        } catch (err) {
          console.error('[billing] đồng bộ PayPal lỗi', r.id, err.message);
        }
      }
    }
  }
  return { reminded: expiring.length, synced };
}

export function scheduleBilling(intervalMs = 3600 * 1000) {
  const run = () => runBillingJobs().catch((err) => console.error('[billing] lỗi', err));
  run();
  return setInterval(run, intervalMs).unref();
}
