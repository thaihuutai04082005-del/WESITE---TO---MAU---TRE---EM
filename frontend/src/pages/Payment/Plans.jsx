// Bảng giá 2 gói: Thường và VIP (VIP trả theo tháng hoặc năm, cùng quyền lợi).
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { formatVnd, formatDate } from '../../lib/format';
import Icon from '../../components/Icon';
import { api } from '../../services/api';
import { useUi } from '../../store/ui';

const PaymentModal = lazy(() => import('../../components/PaymentModal/PaymentModal')); // kèm thư viện mã QR, chỉ tải khi bé bấm mua

/** Chữ trên nhãn gói (Gói Tháng · còn 97/100 lượt…). */
function planBadgeText(plan, t, lang) {
  if (!plan) return '';
  return plan.plan === 'free'
    ? t('plans.badge.free', { n: plan.remaining, limit: plan.limit })
    : t(`plans.badge.${plan.plan}`, { date: formatDate(plan.endsAt, lang) });
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
  vip: {
    card: 'border-[#FFC94D] bg-gradient-to-b from-[#FFF6DD] to-white ring-4 ring-[#FFE7A3]',
    title: 'text-[#7A4A00]',
    price: 'text-[#7A4A00]',
    pill: 'bg-[#FFEDB8] text-[#7A4A00]',
    art: '👑',
    box: 'bg-[#FFF2CC] text-[#7A4A00]',
    btn: 'bg-[#F59E0B] text-white hover:brightness-95',
  },
};

function Perk({ p }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon name="check" size={20} className="mt-0.5 shrink-0 text-mint" />
      <span className="w-6 shrink-0 text-center text-lg leading-6" aria-hidden="true">{p.i}</span>
      <span className="flex-1 leading-6 [text-wrap:balance]">
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

/** Gói đang dùng + tự gia hạn PayPal (huỷ được), giống trang quản lý thuê bao của các ứng dụng AI. */
function ManagePlan({ plan, billing, onCancelled }) {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
  if (!plan || plan.plan === 'free') return null;
  async function cancel() {
    if (!window.confirm(t('plans.manage.cancelConfirm'))) return;
    setBusy(true);
    try {
      const r = await api.post('/payments/recurring/cancel');
      onCancelled(r);
      toast(t('plans.manage.cancelled'), 'success');
    } catch (e) {
      toast(t(`errors.${e.code}`, { defaultValue: t('errors.server_error') }), 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center gap-4 rounded-3xl border-2 border-[#CFE6FA] bg-white p-5 shadow-soft" data-testid="manage-plan">
      <span className="text-4xl" aria-hidden="true">👑</span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg font-extrabold">
          {t('plans.manage.active', { plan: t(`plans.${plan.plan}.name`), date: formatDate(plan.endsAt, i18n.language) })}
        </div>
        <div className="text-sm text-muted">
          {billing?.autoRenew ? t('plans.manage.autoRenew', { period: t(`plans.manage.${billing.plan}`) }) : t('plans.manage.manual')}
        </div>
      </div>
      {billing?.autoRenew && (
        <button type="button" className="btn-ghost" onClick={cancel} disabled={busy} data-testid="cancel-recurring">
          {t('plans.manage.cancel')}
        </button>
      )}
    </div>
  );
}

export default function Plans() {
  const { t, i18n } = useTranslation();
  const meta = useAuth((s) => s.meta);
  const user = useAuth((s) => s.user);
  const current = useAuth((s) => s.plan);
  const setPlan = useAuth((s) => s.setPlan);
  const [buy, setBuy] = useState(null);
  const [period, setPeriod] = useState('year');
  const [billing, setBilling] = useState(null);
  useEffect(() => {
    if (!user) return;
    api
      .get('/subscription')
      .then((r) => setBilling(r.billing))
      .catch(() => {});
  }, [user, current?.plan, current?.endsAt]);
  const plans = meta?.plans;
  if (!plans) return null;
  const isVip = !!current?.vip;
  const en = i18n.language === 'en';
  // Tiết kiệm của gói Năm so với 12 tháng lẻ, tính theo giá USD (bản tiếng Anh hiện giá đô).
  const saveUsd = plans.month.priceUsd * 12 - plans.year.priceUsd;
  const savePct = Math.round((saveUsd / (plans.month.priceUsd * 12)) * 100);
  const cards = [
    { key: 'free', price: formatVnd(0) },
    { key: 'vip', price: en ? `$${plans[period].priceUsd}` : formatVnd(plans[period].priceVnd), best: true },
  ];
  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="mb-10 text-center">
        <h1 className="page-title">{t('plans.title')}</h1>
        <p className="mt-1 text-muted">{t('plans.subtitle')}</p>
      </div>
      {user && (
        <ManagePlan
          plan={current}
          billing={billing}
          onCancelled={(r) => {
            setBilling(r.billing);
            setPlan(r.plan);
          }}
        />
      )}
      <div className="mx-auto grid max-w-xl gap-6 md:max-w-none md:grid-cols-2">
        {cards.map((c) => {
          const th = THEMES[c.key];
          return (
            <div key={c.key} className={`relative flex flex-col rounded-[28px] border-2 p-5 shadow-soft xl:p-6 ${th.card}`} data-testid={`plan-${c.key}`}>
              {c.best && (
                <span className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F59E0B] px-5 py-1.5 font-extrabold text-white shadow-soft">
                  <span aria-hidden="true">👑</span> {t('plans.vip.ribbon')}
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={`font-display text-2xl font-extrabold ${th.title}`}>{t(c.key === 'vip' ? 'plans.vip.name' : 'plans.free.name')}</h2>
                  <div className={`mt-1 font-display text-4xl font-extrabold ${th.price}`}>
                    {c.price}
                    <span className="text-base font-bold text-muted">{t(c.key === 'vip' ? `plans.${period}.per` : 'plans.free.per')}</span>
                  </div>
                </div>
                <div className="relative shrink-0 select-none text-6xl leading-none" aria-hidden="true">
                  {th.art === 'calendar' ? <CalendarArt /> : th.art}
                  <span className="absolute -bottom-1 -right-2 text-xl">✨</span>
                </div>
              </div>
              {c.key === 'vip' && (
                <>
                  <div className="mt-3 inline-flex rounded-full bg-[#FFEDB8] p-1" role="tablist" data-testid="vip-period">
                    {['month', 'year'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        role="tab"
                        aria-selected={period === k}
                        onClick={() => setPeriod(k)}
                        data-testid={`vip-${k}`}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 font-extrabold transition ${period === k ? 'bg-white text-[#7A4A00] shadow-soft' : 'text-[#7A4A00]/70'}`}
                      >
                        {t(`plans.vip.${k}`)}
                      </button>
                    ))}
                  </div>
                  {period === 'year' && (
                    <div className="mt-1 text-sm font-extrabold text-[#B45F00]">
                      <div>{en ? t('plans.saveUsd', { amount: `$${saveUsd.toFixed(2)}`, pct: savePct }) : t('plans.save')}</div>
                    </div>
                  )}
                </>
              )}
              <span className={`mt-3 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 font-extrabold ${th.pill}`}>
                {c.key === 'vip' && <span aria-hidden="true">∞</span>}
                {t(`plans.${c.key}.limit`)}
              </span>
              <div className="mt-5 flex-1 rounded-3xl bg-white/80 p-3 xl:p-4">
                <ul className="space-y-3 text-[15px]">
                  {t(`plans.${c.key}.perks`, { returnObjects: true }).map((p) => (
                    <Perk key={p.t} p={p} />
                  ))}
                </ul>
              </div>
              <div className="mt-5">
                {c.key === 'free' ? (
                  <span className={`btn pointer-events-none w-full ${th.btn}`}>{!isVip ? t('plans.current') : t('plans.included')}</span>
                ) : user ? (
                  <button type="button" className={`btn w-full shadow-soft ${th.btn}`} onClick={() => setBuy(period)} data-testid="buy-vip">
                    {current?.plan === period ? t('plans.renew') : t(period === 'month' ? 'plans.vip.chooseMonth' : 'plans.vip.chooseYear')}
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
      {buy && (
        <Suspense fallback={null}>
          <PaymentModal open plan={buy} onClose={() => setBuy(null)} />
        </Suspense>
      )}
    </div>
  );
}
