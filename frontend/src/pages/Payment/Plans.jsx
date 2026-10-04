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

/** Giao diện riêng cho từng gói: màu thẻ, nhãn, nút và hình minh hoạ góc phải. */
const THEMES = {
  free: {
    card: 'border-[#BFEBD0] bg-gradient-to-b from-[#ECFBF2] to-white',
    title: 'text-[#178A4A]',
    price: 'text-[#178A4A]',
    pill: 'bg-[#DDF6E7] text-[#178A4A]',
    art: '🎨',
    btn: 'border-2 border-[#4CD787] bg-white text-[#178A4A]',
  },
  month: {
    card: 'border-[#CFE6FA] bg-gradient-to-b from-[#EAF6FF] to-white',
    title: 'text-primary-dark',
    price: 'text-primary-dark',
    pill: 'bg-[#DCEEFD] text-primary-dark',
    art: 'calendar',
    box: 'bg-[#EAF6FF] text-primary-dark',
    btn: 'bg-primary text-white hover:bg-primary-dark',
  },
  year: {
    card: 'border-[#FFC94D] bg-gradient-to-b from-[#FFF6DD] to-white ring-4 ring-[#FFE7A3]',
    title: 'text-[#7A4A00]',
    price: 'text-[#7A4A00]',
    pill: 'bg-[#FFEDB8] text-[#7A4A00]',
    art: '👑',
    box: 'bg-[#FFF2CC] text-[#7A4A00]',
    btn: 'bg-[#F59E0B] text-white hover:brightness-95',
  },
};

/** Lịch có ngôi sao (emoji 📅 hiện ngày tháng tuỳ máy nên tự vẽ). */
function CalendarArt() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="inline-block" aria-hidden="true">
      <rect x="6" y="12" width="52" height="46" rx="10" fill="#fff" stroke="#2B6CB0" strokeWidth="3.5" />
      <path d="M6 22a10 10 0 0110-10h32a10 10 0 0110 10v4H6z" fill="#9F8CFF" stroke="#2B6CB0" strokeWidth="3.5" />
      <rect x="18" y="5" width="7" height="14" rx="3.5" fill="#fff" stroke="#2B6CB0" strokeWidth="3" />
      <rect x="39" y="5" width="7" height="14" rx="3.5" fill="#fff" stroke="#2B6CB0" strokeWidth="3" />
      <path d="M32 31l3.6 7.3 8 1.2-5.8 5.6 1.4 8L32 49.3 24.8 53l1.4-8-5.8-5.6 8-1.2z" fill="#FFC94D" stroke="#E5A100" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function Perk({ p }) {
  return (
    <li className="flex items-start gap-3">
      <Icon name="check" size={20} className="mt-0.5 shrink-0 text-mint" />
      <span className="w-6 shrink-0 text-center text-lg leading-6" aria-hidden="true">{p.i}</span>
      <span className="flex-1 leading-6">
        {p.t}
        {p.help && (
          <span
            title={p.help}
            aria-label={p.help}
            className="ml-2 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-[#D5DEE5] align-middle text-xs font-extrabold text-white"
          >
            ?
          </span>
        )}
      </span>
    </li>
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
    { key: 'free', price: formatVnd(0) },
    { key: 'month', price: formatVnd(plans.month.priceVnd) },
    { key: 'year', price: formatVnd(plans.year.priceVnd), best: true },
  ];
  return (
    <div className="page">
      <div className="mb-10 text-center">
        <h1 className="page-title">{t('plans.title')}</h1>
        <p className="mt-1 text-muted">{t('plans.subtitle')}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c) => {
          const th = THEMES[c.key];
          return (
            <div key={c.key} className={`relative flex flex-col rounded-[28px] border-2 p-6 shadow-soft ${th.card}`} data-testid={`plan-${c.key}`}>
              {c.best && (
                <span className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F59E0B] px-5 py-1.5 font-extrabold text-white shadow-soft">
                  <span aria-hidden="true">👑</span> {t('plans.best')}
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={`font-display text-2xl font-extrabold ${th.title}`}>{t(`plans.${c.key}.name`)}</h2>
                  <div className={`mt-1 font-display text-4xl font-extrabold ${th.price}`}>
                    {c.price}
                    <span className="text-base font-bold text-muted">{t(`plans.${c.key}.per`)}</span>
                  </div>
                </div>
                <div className="relative shrink-0 select-none text-6xl leading-none" aria-hidden="true">
                  {th.art === 'calendar' ? <CalendarArt /> : th.art}
                  <span className="absolute -bottom-1 -right-2 text-xl">✨</span>
                </div>
              </div>
              <span className={`mt-3 inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 font-extrabold ${th.pill}`}>
                {c.key === 'year' && <span aria-hidden="true">∞</span>}
                {t(`plans.${c.key}.limit`)}
              </span>
              <div className="mt-5 flex-1 rounded-3xl bg-white/80 p-4">
                {th.box && (
                  <div className={`mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 font-extrabold ${th.box}`}>
                    <span className="text-2xl" aria-hidden="true">🎁</span> {t(`plans.allOf.${c.key}`)}
                  </div>
                )}
                <ul className="space-y-3 text-[15px]">
                  {t(`plans.${c.key}.perks`, { returnObjects: true }).map((p) => (
                    <Perk key={p.t} p={p} />
                  ))}
                </ul>
              </div>
              <div className="mt-5">
                {c.key === 'free' ? (
                  <span className={`btn pointer-events-none w-full ${th.btn}`}>{current?.plan === 'free' ? t('plans.current') : t('plans.included')}</span>
                ) : user ? (
                  <button type="button" className={`btn w-full shadow-soft ${th.btn}`} onClick={() => setBuy(c.key)} data-testid={`buy-${c.key}`}>
                    {current?.plan === c.key ? t('plans.renew') : t(c.key === 'month' ? 'plans.chooseMonth' : 'plans.chooseYear')}
                  </button>
                ) : (
                  <Link to="/register" className={`btn w-full shadow-soft ${th.btn}`}>{t('landing.cta')}</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mx-auto mt-8 flex max-w-xl items-start justify-center gap-2 text-center text-sm text-muted">
        <Icon name="lock" size={16} className="mt-0.5 shrink-0" /> {t('plans.note')}
      </p>
      <PaymentModal open={!!buy} plan={buy} onClose={() => setBuy(null)} />
    </div>
  );
}
