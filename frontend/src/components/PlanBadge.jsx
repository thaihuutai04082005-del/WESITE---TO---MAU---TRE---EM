import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../lib/format';
import Icon from './Icon';

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
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#CFE6FA] bg-white/70 px-5 py-2.5 font-bold text-primary-dark transition hover:bg-white"
    >
      <Icon name="star" size={18} /> {text}
    </Link>
  );
}
