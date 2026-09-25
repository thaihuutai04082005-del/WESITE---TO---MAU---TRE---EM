// Huy hiệu Rank: huy chương đổi màu theo bậc + tên bậc + Điểm Rank hiện có.
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const RANK_STYLE = {
  bronze: { fill: '#D9A066', ring: '#B08D57', bg: '#FBEBDC', text: '#8A5A2B' },
  silver: { fill: '#D7DEE6', ring: '#9AA6B2', bg: '#EEF2F6', text: '#5E6B78' },
  gold: { fill: '#FFD54F', ring: '#E6A817', bg: '#FFF4CC', text: '#9A6A00' },
  platinum: { fill: '#B9F2FF', ring: '#5FB8CC', bg: '#E3F9FF', text: '#2F7E91' },
  diamond: { fill: '#7DE2FF', ring: '#2B9BF4', bg: '#DDF3FF', text: '#0B6FB8' },
};

export function RankMedal({ rank = 'bronze', size = 28 }) {
  const s = RANK_STYLE[rank] || RANK_STYLE.bronze;
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path d="M12 2 L18 16 L13 18 L7 4 Z" fill="#FF5F7E" stroke="#1B2A38" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M28 2 L22 16 L27 18 L33 4 Z" fill="#4FA3E0" stroke="#1B2A38" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="20" cy="25" r="12" fill={s.fill} stroke={s.ring} strokeWidth="3" />
      <circle cx="20" cy="25" r="12" fill="none" stroke="#1B2A38" strokeWidth="1.2" opacity="0.5" />
      <polygon points="20,18 22,23 27.5,23.3 23.2,26.6 24.7,32 20,29 15.3,32 16.8,26.6 12.5,23.3 18,23" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

/** Dạng gọn cho thanh điều hướng: huy chương + bậc + điểm. */
export default function RankBadge({ rank = 'bronze', points = 0, compact = false }) {
  const { t } = useTranslation();
  const s = RANK_STYLE[rank] || RANK_STYLE.bronze;
  return (
    <Link
      to="/missions"
      className="flex min-h-11 items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 font-bold transition hover:brightness-95"
      style={{ background: s.bg, color: s.text }}
      title={`${t('home.rank')}: ${t(`rank.${rank}`)} · ${points} ${t('rank.points')}`}
      data-testid="rank-badge"
    >
      <RankMedal rank={rank} size={30} />
      <span className="flex flex-col leading-none">
        {!compact && <span className="text-[11px] font-extrabold uppercase tracking-wide opacity-80">{t(`rank.${rank}`)}</span>}
        <span className="text-sm font-extrabold">
          {points}
          <span className="ml-0.5 text-[11px] font-bold opacity-80">{t('rank.pts')}</span>
        </span>
      </span>
    </Link>
  );
}
