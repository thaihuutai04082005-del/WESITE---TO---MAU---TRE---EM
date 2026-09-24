// Thanh toán gói (Mục 6.3): MoMo (chính ở Việt Nam) và PayPal (quốc tế).
// Khi cổng chưa cấu hình ở môi trường dev → giao dịch giả lập, có ghi chú rõ ràng.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { formatVnd } from '../../lib/format';

function loadPaypal(clientId) {
  const id = 'paypal-sdk';
  if (window.paypal) return Promise.resolve(window.paypal);
  return new Promise((resolve, reject) => {
    let s = document.getElementById(id);
    if (!s) {
      s = document.createElement('script');
      s.id = id;
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD`;
      document.body.appendChild(s);
    }
    s.addEventListener('load', () => resolve(window.paypal));
    s.addEventListener('error', reject);
  });
}

export default function PaymentModal({ open, plan, onClose }) {
  const { t } = useTranslation();
  const meta = useAuth((s) => s.meta);
  const setPlan = useAuth((s) => s.setPlan);
  const toast = useUi((s) => s.toast);
  const [provider, setProvider] = useState('momo');
  const [step, setStep] = useState('choose');
  const [payment, setPayment] = useState(null);
  const [busy, setBusy] = useState(false);
  const paypalRef = useRef(null);
  const planInfo = meta?.plans?.[plan];
  const providers = meta?.payments || {};

  useEffect(() => {
    if (open) {
      setStep('choose');
      setPayment(null);
    }
  }, [open, plan]);

  // Nút PayPal thật (khi đã cấu hình client id).
  useEffect(() => {
    if (step !== 'paypal' || !providers.paypal?.clientId || !paypalRef.current) return;
    let cancelled = false;
    let current = null;
    loadPaypal(providers.paypal.clientId)
      .then((paypal) => {
        if (cancelled) return;
        paypal
          .Buttons({
            createOrder: async () => {
              const p = await api.post('/payments', { plan, provider: 'paypal' });
              current = p;
              return p.orderId;
            },
            onApprove: async () => {
              const r = await api.post(`/payments/${current.paymentId}/paypal/capture`);
              setPlan(r.plan);
              setStep('success');
            },
            onError: () => toast(t('errors.payment_failed'), 'error'),
          })
          .render(paypalRef.current);
      })
      .catch(() => toast(t('errors.network_error'), 'error'));
    return () => {
      cancelled = true;
    };
  }, [step, plan, providers.paypal?.clientId, setPlan, toast, t]);

  async function start() {
    setBusy(true);
    try {
      if (provider === 'paypal' && providers.paypal?.configured) {
        setStep('paypal');
        return;
      }
      const p = await api.post('/payments', { plan, provider });
      setPayment(p);
      if (p.mock) setStep('mock');
      else if (p.payUrl) window.location.href = p.payUrl;
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

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-display text-2xl font-extrabold">{t('plans.payTitle', { plan: t(`plans.${plan}.name`) })}</h2>
      {planInfo && (
        <p className="mb-4 text-muted">
          {provider === 'paypal' ? `$${planInfo.priceUsd}` : formatVnd(planInfo.priceVnd)} · {t(`plans.${plan}.limit`)}
        </p>
      )}
      {step === 'choose' && (
        <div className="space-y-3">
          {['momo', 'paypal'].map((p) => (
            <label key={p} className={`card flex cursor-pointer items-center gap-3 p-4 ${provider === p ? 'ring-4 ring-primary/40' : ''}`}>
              <input type="radio" name="provider" checked={provider === p} onChange={() => setProvider(p)} className="h-5 w-5 accent-primary" />
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-display font-extrabold text-white ${p === 'momo' ? 'bg-[#A50064]' : 'bg-[#003087]'}`}>{p === 'momo' ? 'M' : 'P'}</span>
              <span className="flex-1 font-bold">{t(`plans.provider.${p}`)}</span>
            </label>
          ))}
          <button type="button" className="btn-coral w-full" onClick={start} disabled={busy} data-testid="pay-start">
            {t('plans.payNow')}
          </button>
        </div>
      )}
      {step === 'paypal' && <div ref={paypalRef} className="min-h-32" />}
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
