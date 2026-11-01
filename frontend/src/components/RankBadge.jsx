// Huy hiệu Rank: huy chương đổi màu theo bậc + tên bậc + Điểm Rank hiện có.
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const RANK_STYLE = {
  bronze: { fill: '#D9A066', ring: '#B08D57', bg: '#FBEBDC', text: '#8A5A2B' },
  silver: { fill: '#D7DEE6', ring: '#9AA6B2', bg: '#EEF2F6', text: '#5E6B78' },
  gold: { fill: '#FFD54F', ring: '#E6A817', bg: '#FFF4CC', text: '#9A6A00' },
  platinum: { fill: '#B9F2FF', ring: '#5FB8CC', bg: '#E3F9FF', text: '#2F7E91' },
  diamond: { fill: '#7DE2FF', ring: '#2B9BF4', bg: '#DDF3FF', text: '#0B6FB8' },
  master: { fill: '#FF7AA2', ring: '#D6336C', bg: '#FFE6EE', text: '#B0245A' },
};

/** Huy hiệu hạng: khiên + vương miện + nhánh nguyệt quế, đổi theo bậc (ảnh /public/ranks). */
export function RankMedal({ rank = 'bronze', size = 28, className = '' }) {
  return <img src={`/ranks/${RANK_STYLE[rank] ? rank : 'bronze'}.webp`} alt="" width={size} height={size} className={`object-contain ${className}`} draggable={false} />;
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
