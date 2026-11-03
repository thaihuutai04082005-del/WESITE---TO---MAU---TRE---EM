// Điều phối thanh toán (Mục 6.3):
//  • PayPal (USD) — thuê bao tự gia hạn như các ứng dụng AI: PayPal tự trừ tiền mỗi kỳ, người dùng huỷ được bất cứ lúc nào.
//  • Chuyển khoản VietQR (VND) vào tài khoản ngân hàng — quét bằng app ngân hàng hoặc MoMo; SePay báo về khi tiền vào.
// MoMo chỉ giữ xử lý callback cho giao dịch cũ; không nhận giao dịch mới.
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

const bank = {
  isConfigured: () =>
    !!(env.sepay.apiKey && /^\d{6,30}$/.test(env.bank.accountNo) && env.bank.accountName && (env.bank.bin || BANK_BIN[env.bank.code.toUpperCase()])),
};
export const providers = { paypal, momo, bank };

export function providerStatus() {
  return {
    paypal: { configured: paypal.isConfigured() },
    bank: { configured: bank.isConfigured() },
    mockAllowed: env.paymentMock,
  };
}

const db = () => getDb();
export const findPayment = async (id) => await db().prepare('SELECT * FROM payments WHERE id = ?').get(id);
const activeRecurring = async (userId) =>
  await db().prepare("SELECT * FROM recurring WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(userId);

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
  if (!['paypal', 'bank'].includes(provider)) throw badRequest('invalid_provider');
  const configured = providers[provider].isConfigured();
  if (!configured && !env.paymentMock) throw new HttpError(503, 'payment_unavailable');
  if (provider === 'paypal' && (await activeRecurring(userId))) throw conflict('already_subscribed');

  const id = uuid();
  const p = PLANS[plan];
  const [amount, currency] = provider === 'paypal' ? [p.priceUsd, 'USD'] : [p.priceVnd, 'VND'];
  const code = provider === 'bank' ? `BTM${randomCode(6)}` : null;
  await db()
    .prepare('INSERT INTO payments (id, user_id, plan, provider, amount, currency, mock, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, plan, provider, amount, currency, configured ? 0 : 1, code);
  const base = { paymentId: id, amount, currency, mock: !configured };

  if (provider === 'bank') return !configured ? base : { ...base, bankTransfer: bankInfo(await findPayment(id)) };
  if (!configured) return base;

  if (provider === 'paypal') {
    const { subscriptionId, approveUrl, planId } = await paypal.createSubscription({
      paymentId: id,
      plan,
      returnUrl: `${env.publicUrl}/payment/result?paymentId=${id}`,
      cancelUrl: `${env.publicUrl}/plans`,
    });
    await db().prepare('UPDATE payments SET provider_ref = ? WHERE id = ?').run(subscriptionId, id);
    await db()
      .prepare('INSERT INTO recurring (id, user_id, plan, payment_id, provider_plan_id) VALUES (?, ?, ?, ?, ?)')
      .run(subscriptionId, userId, plan, id, planId);
    return { ...base, payUrl: approveUrl };
  }
  const description = plan === 'month' ? 'Goi Thang - Be To Mau' : 'Goi Nam - Be To Mau';
  const { payUrl, requestId } = await momo.createPayment({
    paymentId: id,
    amount,
    orderInfo: description,
    redirectUrl: `${env.publicUrl}/payment/result?paymentId=${id}`,
    ipnUrl: `${env.apiPublicUrl}/api/payments/momo/ipn`,
  });
  await db().prepare('UPDATE payments SET provider_ref = ? WHERE id = ?').run(requestId, id);
  return { ...base, payUrl };
}

/**
 * Đánh dấu đã thanh toán và kích hoạt / gia hạn gói (mỗi payment chỉ 1 lần).
 * txnRef: mã giao dịch phía cổng — nếu đã ghi nhận trước đó thì bỏ qua (chống trùng webhook).
 */
export async function markPaid(paymentId, raw, txnRef = null) {
  return await tx(async (conn) => {
    const pay = await conn.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    if (!pay) throw notFound('payment_not_found');
    if (pay.status === 'paid') return { already: true, payment: pay };
    if (txnRef && (await conn.prepare('SELECT 1 FROM payments WHERE txn_ref = ?').get(txnRef))) throw conflict('transaction_already_used');
    await conn
      .prepare("UPDATE payments SET status = 'paid', paid_at = ?, raw = ?, txn_ref = COALESCE(?, txn_ref) WHERE id = ?")
      .run(new Date().toISOString(), JSON.stringify(raw ?? null), txnRef, paymentId);
    const sub = await activatePlan(pay.user_id, pay.plan, paymentId);
    await notify(pay.user_id, 'plan_activated', { plan: pay.plan, endsAt: sub.endsAt });
    return { already: false, payment: { ...pay, status: 'paid' }, subscription: sub };
  });
}

export async function markFailed(paymentId, raw) {
  await db()
    .prepare("UPDATE payments SET status = 'failed', raw = ? WHERE id = ? AND status = 'pending'")
    .run(JSON.stringify(raw ?? null), paymentId);
}

// ---------- PayPal: đồng bộ thuê bao ----------
const STATUS = { ACTIVE: 'active', CANCELLED: 'cancelled', SUSPENDED: 'suspended', EXPIRED: 'expired' };

/**
 * Hỏi PayPal trạng thái thuê bao rồi cập nhật: kích hoạt kỳ đầu, ghi nhận mỗi kỳ đã trừ tiền (gia hạn),
 * đổi trạng thái huỷ/tạm dừng. Không tin dữ liệu webhook gửi tới — luôn hỏi lại PayPal.
 */
export async function syncPaypal(subId) {
  const rec = await db().prepare('SELECT * FROM recurring WHERE id = ?').get(subId);
  if (!rec || rec.id.startsWith('MOCK-')) return rec;
  const s = await paypal.getSubscription(subId);
  const original = await findPayment(rec.payment_id);
  if (
    !original ||
    original.provider !== 'paypal' ||
    original.mock ||
    s.customId !== original.id ||
    (rec.provider_plan_id && s.planId !== rec.provider_plan_id)
  )
    throw badRequest('payment_mismatch');
  const transactions = await paypal.getTransactions(subId, rec.created_at);
  const status = STATUS[s.status] || 'pending';
  await tx(async () => {
    await db().prepare('UPDATE recurring SET status = ? WHERE id = ?').run(status, subId);
    for (const item of transactions.sort((a, b) => String(a.time).localeCompare(String(b.time)))) {
      if (item.status !== 'COMPLETED') continue;
      const gross = item.amount_with_breakdown?.gross_amount;
      if (
        !item.id ||
        !Number.isFinite(Number(gross?.value)) ||
        gross?.currency_code !== original.currency ||
        Math.round(Number(gross.value) * 100) !== Math.round(original.amount * 100)
      )
        throw badRequest('payment_mismatch');
      const ref = `paypal:${item.id}`;
      if (await db().prepare('SELECT 1 FROM payments WHERE txn_ref = ?').get(ref)) continue;
      // Existing installations used cycle references. Do not credit those captures twice.
      const legacy = await db()
        .prepare("SELECT id FROM payments WHERE provider_ref = ? AND txn_ref LIKE ? AND status = 'paid' ORDER BY paid_at LIMIT 1")
        .get(subId, `${subId}#%`);
      if (legacy) {
        await db().prepare('UPDATE payments SET txn_ref = ? WHERE id = ?').run(ref, legacy.id);
        continue;
      }
      let payId = rec.payment_id;
      if ((await findPayment(payId)).status === 'paid') {
        payId = uuid();
        await db()
          .prepare("INSERT INTO payments (id, user_id, plan, provider, amount, currency, provider_ref) VALUES (?, ?, ?, 'paypal', ?, ?, ?)")
          .run(payId, rec.user_id, rec.plan, original.amount, original.currency, subId);
      }
      await markPaid(payId, { subscription: subId, transaction: item }, ref);
    }
    if (status !== 'active' && status !== 'pending') await markFailed(rec.payment_id, { subscription: subId, status: s.status });
  });
  return await db().prepare('SELECT * FROM recurring WHERE id = ?').get(subId);
}

/** Webhook PayPal: lấy id thuê bao từ sự kiện rồi đồng bộ. */
export async function handlePaypalWebhook(event) {
  const r = event?.resource || {};
  const subId = r.billing_agreement_id || (String(event?.event_type || '').startsWith('BILLING.SUBSCRIPTION') ? r.id : null);
  if (subId && (await db().prepare('SELECT 1 FROM recurring WHERE id = ?').get(subId))) await syncPaypal(subId);
}

/** Huỷ tự gia hạn: gói vẫn dùng đến hết kỳ đã trả. */
export async function cancelRecurring(userId) {
  const rec = await activeRecurring(userId);
  if (!rec) throw notFound('no_recurring');
  if (!rec.id.startsWith('MOCK-')) await paypal.cancelSubscription(rec.id);
  await db().prepare("UPDATE recurring SET status = 'cancelled', cancelled_at = ? WHERE id = ?").run(new Date().toISOString(), rec.id);
}

/** Thông tin thanh toán định kỳ cho trang Gói. */
export async function billingView(userId) {
  const rec = await activeRecurring(userId);
  return rec ? { provider: 'paypal', plan: rec.plan, autoRenew: true } : null;
}

/** Hoàn tất giả lập (dev). PayPal giả lập cũng tạo thuê bao giả để thử nút huỷ. */
export async function completeMock(payment) {
  if (payment.provider === 'paypal') {
    await db()
      .prepare("INSERT OR IGNORE INTO recurring (id, user_id, plan, status, payment_id) VALUES (?, ?, ?, 'active', ?)")
      .run(`MOCK-${payment.id}`, payment.user_id, payment.plan, payment.id);
  }
  return await markPaid(payment.id, { mock: true });
}

// ---------- Chuyển khoản (SePay) ----------
/**
 * Webhook SePay: { id, transferType, transferAmount, content, ... }. Tìm mã BTMxxxxxx trong nội dung
 * chuyển khoản; đủ tiền thì kích hoạt gói. Trả về kết quả để ghi log.
 */
export async function handleBankWebhook(b) {
  if (!b || b.transferType !== 'in') return { ignored: 'not_incoming' };
  const m = String(b.content || '')
    .toUpperCase()
    .match(/BTM[A-HJ-NP-Z2-9]{6}/);
  if (!m) return { ignored: 'no_code' };
  const pay = await db().prepare("SELECT * FROM payments WHERE code = ? AND provider = 'bank'").get(m[0]);
  if (!pay || pay.mock) return { ignored: 'unknown_code' };
  if (pay.status === 'paid') return { already: true };
  if (!Number.isSafeInteger(Number(b.id)) || Number(b.id) <= 0 || !Number.isFinite(Number(b.transferAmount)) || Number(b.transferAmount) <= 0)
    return { ignored: 'invalid_transaction' };
  if (String(b.accountNumber || '') !== env.bank.accountNo) return { ignored: 'wrong_account' };
  if (Number(b.transferAmount) < pay.amount) {
    await db()
      .prepare('UPDATE payments SET raw = ? WHERE id = ?')
      .run(JSON.stringify({ underpaid: b }), pay.id);
    return { ignored: 'underpaid' };
  }
  const result = await markPaid(pay.id, b, `sepay:${b.id}`);
  return result.already ? { already: true } : { paid: pay.id };
}

// ---------- Việc định kỳ ----------
/** Nhắc gia hạn trước 3 ngày (gói trả từng lần) + đồng bộ thuê bao PayPal sắp tới kỳ trừ tiền. */
export async function runBillingJobs(now = new Date()) {
  const soon = new Date(now.getTime() + 3 * 86400000).toISOString();
  const iso = now.toISOString();
  const expiring = await db()
    .prepare(
      `SELECT s.* FROM subscriptions s
       WHERE s.ends_at > ? AND s.ends_at <= ? AND s.reminded_at IS NULL
         AND NOT EXISTS (SELECT 1 FROM subscriptions s2 WHERE s2.user_id = s.user_id AND s2.ends_at > s.ends_at)
         AND NOT EXISTS (SELECT 1 FROM recurring r WHERE r.user_id = s.user_id AND r.status = 'active')`,
    )
    .all(iso, soon);
  for (const s of expiring) {
    await notify(s.user_id, 'plan_expiring', { plan: s.plan, endsAt: s.ends_at });
    await db().prepare('UPDATE subscriptions SET reminded_at = ? WHERE id = ?').run(iso, s.id);
  }
  let synced = 0;
  if (paypal.isConfigured()) {
    const day = new Date(now.getTime() + 86400000);
    const recs = await db().prepare("SELECT * FROM recurring WHERE status IN ('active', 'pending') AND id NOT LIKE 'MOCK-%'").all();
    for (const r of recs) {
      const sub = await activeSubscription(r.user_id, day);
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

export async function scheduleBilling(intervalMs = 3600 * 1000) {
  const run = () => runBillingJobs().catch((err) => console.error('[billing] lỗi', err));
  await run();
  return setInterval(run, intervalMs).unref();
}
