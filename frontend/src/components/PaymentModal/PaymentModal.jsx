// Thanh toán gói (Mục 6.3):
//  • Chuyển khoản / quét QR (VND) — mã VietQR vào tài khoản ngân hàng; web tự mở gói khi tiền về (SePay).
//  • PayPal (USD) — thuê bao tự gia hạn, chuyển sang trang PayPal để đồng ý rồi quay về /payment/result.
// Khi cổng chưa cấu hình ở môi trường dev → giao dịch giả lập, có ghi chú rõ ràng.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { formatVnd } from '../../lib/format';
import QRCode from 'qrcode';

const PROVIDERS = [
  { key: 'bank', badge: 'QR', cls: 'bg-[#0B6FB8]' },
  { key: 'paypal', badge: 'P', cls: 'bg-[#003087]' },
];

function CopyRow({ label, value, strong }) {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className={strong ? 'font-display text-lg font-extrabold text-coral' : 'font-bold'}>{value}</span>
        <button
          type="button"
          className="rounded-lg bg-primary-light px-2 py-0.5 text-xs font-bold text-primary-dark"
          onClick={() => {
            navigator.clipboard?.writeText(String(value).replace(/[^\dA-Za-z]/g, ''));
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          }}
        >
          {done ? t('plans.qr.copied') : t('plans.qr.copy')}
        </button>
      </span>
    </div>
  );
}

export default function PaymentModal({ open, plan, onClose }) {
  const { t } = useTranslation();
  const meta = useAuth((s) => s.meta);
  const setPlan = useAuth((s) => s.setPlan);
  const toast = useUi((s) => s.toast);
  const [provider, setProvider] = useState('bank');
  const [step, setStep] = useState('choose');
  const [payment, setPayment] = useState(null);
  const [busy, setBusy] = useState(false);
  const planInfo = meta?.plans?.[plan];

  useEffect(() => {
    if (open) {
      setStep('choose');
      setPayment(null);
    }
  }, [open, plan]);

  // Chờ tiền chuyển khoản về: hỏi trạng thái mỗi 3 giây.
  useEffect(() => {
    if (step !== 'qr' || !payment || payment.mock) return undefined;
    let stop = false;
    const tick = async () => {
      try {
        const r = await api.get(`/payments/${payment.paymentId}`);
        if (stop) return;
        if (r.payment.status === 'paid') {
          setPlan(r.plan);
          setStep('success');
          return;
        }
      } catch {
        /* thử lại lần sau */
      }
      if (!stop) setTimeout(tick, 3000);
    };
    const id = setTimeout(tick, 3000);
    return () => {
      stop = true;
      clearTimeout(id);
    };
  }, [step, payment, setPlan]);

  const price = (p) => (p === 'paypal' ? `$${planInfo?.priceUsd}` : formatVnd(planInfo?.priceVnd));

  async function start() {
    setBusy(true);
    try {
      const p = await api.post('/payments', { plan, provider });
      setPayment(p);
      if (p.bankTransfer) setStep('qr');
      else if (p.mock) setStep('mock');
      else if (p.payUrl) {
        setStep('redirect');
        window.location.href = p.payUrl;
      }
    } catch (e) {
      toast(t(`errors.${e.code}`, { defaultValue: t('errors.server_error') }), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function completeMock() {
    setBusy(true);
    try {
      const r = await api.post(`/payments/${payment.paymentId}/mock-complete`);
      setPlan(r.plan);
      setStep('success');
    } catch (e) {
      toast(t(`errors.${e.code}`, { defaultValue: t('errors.server_error') }), 'error');
    } finally {
      setBusy(false);
    }
  }

  const bt = payment?.bankTransfer;
  const [qrImg, setQrImg] = useState('');
  useEffect(() => {
    if (!bt?.qrData) return;
    QRCode.toDataURL(bt.qrData, { width: 440, margin: 1, errorCorrectionLevel: 'M' }).then(setQrImg, () => setQrImg(''));
  }, [bt?.qrData]);
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-display text-2xl font-extrabold">{t('plans.payTitle', { plan: t(`plans.${plan}.name`) })}</h2>
      {planInfo && step === 'choose' && (
        <p className="mb-4 text-muted">
          {price(provider)}
          {provider === 'paypal' ? t(plan === 'month' ? 'plans.perMonthUsd' : 'plans.perYearUsd') : ''} · {t(`plans.${plan}.limit`)}
        </p>
      )}
      {step === 'choose' && (
        <div className="space-y-3">
          {PROVIDERS.map((p) => (
            <label key={p.key} className={`card flex cursor-pointer items-center gap-3 p-4 ${provider === p.key ? 'ring-4 ring-primary/40' : ''}`}>
              <input type="radio" name="provider" checked={provider === p.key} onChange={() => setProvider(p.key)} className="h-5 w-5 accent-primary" />
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-extrabold text-white ${p.cls}`}>{p.badge}</span>
              <span className="flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-bold">{t(`plans.provider.${p.key}`)}</span>
                  <span className="whitespace-nowrap font-extrabold text-primary-dark">{price(p.key)}</span>
                </span>
                <span className="block text-sm text-muted">{t(`plans.providerHint.${p.key}`)}</span>
              </span>
            </label>
          ))}
          <button type="button" className="btn-coral w-full" onClick={start} disabled={busy} data-testid="pay-start">
            {t('plans.payNow')}
          </button>
        </div>
      )}
      {step === 'qr' && bt && (
        <div className="space-y-3" data-testid="pay-qr">
          <p className="text-sm text-muted">{t('plans.qr.scan')}</p>
          <div className="flex justify-center">
            {qrImg && <img src={qrImg} alt="VietQR" className="h-56 w-56 rounded-2xl border-2 border-line bg-white object-contain p-2" data-testid="pay-qr-img" />}
          </div>
          <div className="rounded-2xl bg-white px-4">
            <CopyRow label={t('plans.qr.bank')} value={bt.bank} />
            <CopyRow label={t('plans.qr.account')} value={bt.accountNo} />
            {bt.accountName && <CopyRow label={t('plans.qr.holder')} value={bt.accountName} />}
            <CopyRow label={t('plans.qr.amount')} value={formatVnd(bt.amount)} strong />
            <CopyRow label={t('plans.qr.content')} value={bt.content} strong />
          </div>
          <p className="text-xs font-bold text-coral">{t('plans.qr.contentHint')}</p>
          {payment.mock ? (
            <>
              <div className="rounded-2xl bg-sun/20 p-3 text-sm font-bold">{t('plans.mockNotice')}</div>
              <button type="button" className="btn-primary w-full" onClick={completeMock} disabled={busy} data-testid="pay-mock-complete">
                {t('plans.mockConfirm')}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-primary-light p-3 text-sm font-bold text-primary-dark">
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {t('plans.qr.waiting')}
            </div>
          )}
        </div>
      )}
      {step === 'redirect' && <p className="py-6 text-center font-bold text-muted">{t('plans.redirecting')}</p>}
      {step === 'mock' && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-sun/20 p-3 text-sm font-bold">{t('plans.mockNotice')}</div>
          <button type="button" className="btn-primary w-full" onClick={completeMock} disabled={busy} data-testid="pay-mock-complete">
            {t('plans.mockConfirm')}
          </button>
        </div>
      )}
      {step === 'success' && (
        <div className="space-y-3 text-center">
          <div className="text-5xl">🎉</div>
          <p className="font-display text-xl font-bold">{t('plans.success')}</p>
          <button type="button" className="btn-primary w-full" onClick={onClose}>
            {t('common.ok')}
          </button>
        </div>
      )}
    </Modal>
  );
}
