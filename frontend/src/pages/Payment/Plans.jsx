// Bảng giá 3 gói (Mục 6.1).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { formatVnd, formatDate } from '../../lib/format';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import Icon from '../../components/Icon';

/** Chữ trên nhãn gói (Gói Tháng · còn 97/100 lượt…). */
function planBadgeText(plan, t, lang) {
  if (!plan) return '';
  return plan.plan === 'year'
    ? t('plans.badge.year', { date: formatDate(plan.endsAt, lang) })
    : plan.plan === 'month'
      ? t('plans.badge.month', { n: plan.remaining, limit: plan.limit })
      : t('plans.badge.free', { n: plan.remaining });
}

/** Nhãn gói dạng viên thuốc viền xanh — dùng chung ở mọi trang. */
export function PlanBadge({ plan }) {
  const { t, i18n } = useTranslation();
  if (!plan) return null;
  const text = planBadgeText(plan, t, i18n.language);
  return (
    <Link
      to="/plans"
      data-testid="plan-badge"
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 px-5 py-2.5 font-bold transition hover:bg-white ${plan.remaining === 0 ? 'border-coral/40 bg-coral/10 text-coral' : 'border-[#CFE6FA] bg-white/70 text-primary-dark'}`}
    >
      <Icon name="star" size={18} /> {text}
    </Link>
  );
}

export default function Plans() {
  const { t } = useTranslation();
  const meta = useAuth((s) => s.meta);
  const user = useAuth((s) => s.user);
  const current = useAuth((s) => s.plan);
  const [buy, setBuy] = useState(null);
  const plans = meta?.plans;
  if (!plans) return null;
  const cards = [
    { key: 'free', price: formatVnd(0), cls: '' },
    { key: 'month', price: formatVnd(plans.month.priceVnd), cls: '' },
    { key: 'year', price: formatVnd(plans.year.priceVnd), cls: 'ring-4 ring-coral', best: true },
  ];
  return (
    <div className="page">
      <h1 className="page-title mb-8 text-center">{t('plans.title')}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.key} className={`card relative flex flex-col p-6 ${c.cls}`}>
            {c.best && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-1 text-sm font-extrabold text-white">{t('plans.best')}</span>}
            <h2 className="font-display text-2xl font-extrabold">{t(`plans.${c.key}.name`)}</h2>
            <div className="my-2 font-display text-4xl font-extrabold text-primary-dark">
              {c.price}
              <span className="text-base font-bold text-muted">{t(`plans.${c.key}.per`)}</span>
            </div>
            <p className="mb-4 font-bold">{t(`plans.${c.key}.limit`)}</p>
            <ul className="mb-6 flex-1 space-y-2 text-sm">
              {t(`plans.${c.key}.perks`, { returnObjects: true }).map((p) => (
                <li key={p} className="flex gap-2">
                  <Icon name="check" size={18} className="shrink-0 text-mint" /> {p}
                </li>
              ))}
            </ul>
            {c.key === 'free' ? (
              <span className="btn-ghost pointer-events-none">{current?.plan === 'free' ? t('plans.current') : t('plans.included')}</span>
            ) : user ? (
              <button type="button" className={c.best ? 'btn-coral' : 'btn-primary'} onClick={() => setBuy(c.key)} data-testid={`buy-${c.key}`}>
                {current?.plan === c.key ? t('plans.renew') : t('plans.choose')}
              </button>
            ) : (
              <Link to="/register" className="btn-primary">{t('landing.cta')}</Link>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">{t('plans.note')}</p>
      <PaymentModal open={!!buy} plan={buy} onClose={() => setBuy(null)} />
    </div>
  );
}
