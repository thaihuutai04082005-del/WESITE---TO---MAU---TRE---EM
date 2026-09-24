// Quay về từ MoMo: xác minh kết quả với backend (chữ ký được kiểm tra ở server).
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

  useEffect(() => {
    const id = params.get('paymentId') || params.get('orderId');
    if (!id) return setStatus('failed');
    const body = Object.fromEntries(params.entries());
    let tries = 0;
    const poll = async () => {
      try {
        const r = await api.post(`/payments/${id}/momo/return`, body);
        setPlan(r.plan);
        if (r.payment.status !== 'pending' || ++tries > 10) return setStatus(r.payment.status);
        setTimeout(poll, 2000);
      } catch {
        setStatus('failed');
      }
    };
    poll();
  }, [params, setPlan]);

  return (
    <div className="page flex justify-center">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mb-3 text-6xl">{status === 'paid' ? '🎉' : status === 'failed' ? '😢' : '⏳'}</div>
        <h1 className="font-display text-2xl font-extrabold">{t(`payment.${status}`)}</h1>
        <Link to="/" className="btn-primary mt-6">{t('common.home')}</Link>
      </div>
    </div>
  );
}
