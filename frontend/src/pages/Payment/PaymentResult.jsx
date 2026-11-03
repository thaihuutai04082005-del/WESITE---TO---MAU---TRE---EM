// Quay về từ PayPal (đồng ý thuê bao) hoặc MoMo: hỏi backend xác nhận rồi hiện kết quả.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';

export default function PaymentResult() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const setPlan = useAuth((s) => s.setPlan);
  const [status, setStatus] = useState('pending');
  const [attempt, setAttempt] = useState(0);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    const id = params.get('paymentId') || params.get('orderId');
    if (!id) return setStatus('failed');
    const body = Object.fromEntries(params.entries());
    setStatus('pending');
    setWaiting(true);
    let stopped = false;
    let timer;
    let tries = 0;
    let provider = null;
    const poll = async () => {
      try {
        if (!provider) provider = (await api.get(`/payments/${id}`)).payment.provider;
        const r = provider === 'paypal' ? await api.post(`/payments/${id}/paypal/confirm`)
          : provider === 'momo' ? await api.post(`/payments/${id}/momo/return`, body)
          : await api.get(`/payments/${id}`);
        if (stopped) return;
        setPlan(r.plan);
        setStatus(r.payment.status);
        if (r.payment.status !== 'pending') { setWaiting(false); return; }
      } catch {
        // A transport error does not prove that the charge failed.
      }
      if (stopped) return;
      if (++tries >= 15) { setWaiting(false); return; }
      timer = setTimeout(poll, 2000);
    };
    poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [params, setPlan, attempt]);

  return (
    <div className="page flex justify-center">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mb-3 text-6xl">{status === 'paid' ? '🎉' : status === 'failed' ? '😢' : '⏳'}</div>
        <h1 className="font-display text-2xl font-extrabold">{t(`payment.${status}`)}</h1>
        {status === 'pending' && !waiting && (<>
          <p className="mt-3 text-sm text-muted">{t('payment.waitingHint')}</p>
          <button type="button" className="btn-primary mt-4" onClick={() => setAttempt((value) => value + 1)}>{t('payment.retry')}</button>
        </>)}
        <Link to="/" className="btn-primary mt-6">{t('common.home')}</Link>
      </div>
    </div>
  );
}
