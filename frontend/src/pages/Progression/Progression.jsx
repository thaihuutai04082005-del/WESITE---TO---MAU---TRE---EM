// Nhiệm vụ & Thành tích (Mục 8): Cấp độ + nhiệm vụ của cấp, Hạng Đấu trường với 7 bậc (tới Bậc Thầy Hội Họa).
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon';
import { RankMedal, RANK_STYLE } from '../../components/RankBadge';
import { MissionArt } from '../../components/Illustrations';

function Bar({ value, max, color, height = 8 }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className="w-full overflow-hidden rounded-full bg-[#E4EEF8]" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/** Biểu tượng đầu trang: tấm bia mục tiêu có mũi tên (đầu nhọn + đuôi lông vũ) cắm trúng hồng tâm. */
function TargetBadge() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <circle cx="30" cy="34" r="26" fill="#FFFFFF" stroke="#1B2A38" strokeWidth="2.5" />
      <circle cx="30" cy="34" r="19" fill="#FF7AA2" />
      <circle cx="30" cy="34" r="12" fill="#FFFFFF" />
      <circle cx="30" cy="34" r="6" fill="#FF5F7E" />
      <g stroke="#1B2A38" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M33 31 L53 11" stroke="#8B5A2B" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M46 18 L41 15 L49 5 L54 10 Z" fill="#2B9BF4" />
        <path d="M46 18 L49 23 L59 15 L54 10 Z" fill="#4FA3E0" />
        <path d="M27 37 L30 28 L36 34 Z" fill="#C9D4DE" />
      </g>
      <path d="M6 12 l3 -6 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 Z" fill="#FFD54F" />
    </svg>
  );
}

const STATS = [
  ['mountain', '#FF5F7E', '#FFE8EE'],
  ['medal', '#F07B2E', '#FFE7D3'],
  ['gift', '#7D5FFF', '#F0EBFF'],
  ['ruby', '#2B9BF4', '#EAF6FF'],
];

export default function Progression() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const [p, setP] = useState(null);
  useEffect(() => {
    api.get('/progression').then(setP);
  }, []);
  if (!p) return <div className="page text-muted">{t('common.loading')}</div>;
  const done = p.missions.filter((m) => m.completed).length;
  const ladder = p.tiers;
  const rankIdx = ladder.findIndex((x) => x.key === p.rank.key);
  const values = [`${p.level}/${p.maxLevel}`, t(`rank.${p.rank.key}`), p.gachaPoints, p.ruby];
  const labels = [t('missions.cards.level'), t('missions.cards.rank'), t('missions.cards.gacha'), 'Ruby'];

  return (
    <div className="page space-y-5">
      {/* Đầu trang */}
      <section className="flex items-center gap-3 sm:gap-5">
        <div className="h-16 w-16 shrink-0 sm:h-20 sm:w-20">
          <TargetBadge />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-[#16324F] sm:text-4xl">{t('missions.title')}</h1>
          <p className="text-muted">{t('missions.subtitle')}</p>
        </div>
        <div className="hidden h-28 w-40 shrink-0 md:block">
          <MissionArt />
        </div>
      </section>

      {/* 4 chỉ số */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map(([icon, color, bg], i) => (
          <div key={icon} className="flex items-center gap-3 rounded-[22px] border border-white bg-white/90 p-3.5 shadow-soft">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: bg, color }}>
              {icon === 'medal' ? <RankMedal rank={p.rank.key} size={34} /> : <Icon name={icon} size={26} strokeWidth={2.4} />}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-muted">{labels[i]}</div>
              <div className={`font-display font-extrabold leading-tight ${icon === 'medal' ? 'text-lg' : 'truncate text-2xl'}`}>{values[i]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Nhiệm vụ của cấp */}
      <section className="space-y-2.5">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-extrabold">{t('missions.levelMissions', { level: p.level })}</h2>
          <span className="font-bold text-muted">
            {done}/{p.missions.length}
          </span>
        </div>
        {p.maxed ? (
          <div className="rounded-[22px] bg-white p-5 text-center font-bold shadow-soft">{t('missions.maxed')}</div>
        ) : (
          <ul className="space-y-2.5" data-testid="mission-list">
            {p.missions.map((m) => (
              <li key={m.id} className={`flex items-center gap-3 rounded-[22px] border p-3.5 shadow-soft ${m.completed ? 'border-[#BFEBCB] bg-[#EAF9EF]' : 'border-white bg-white'}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${m.completed ? 'bg-[#2FA65A] text-white' : 'bg-primary-light text-primary-dark'}`}>
                  <Icon name={m.completed ? 'check' : 'target'} size={24} strokeWidth={2.6} />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-bold">{m.titles?.[i18n.language] || m.title}</div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#2FA65A]">
                    <Icon name="ruby" size={13} className="text-[#2B9BF4]" /> +{m.ruby} Ruby
                  </div>
                  <Bar value={m.progress} max={m.target} color={m.completed ? '#2FA65A' : '#2B9BF4'} />
                </div>
                <div className={`w-10 text-right font-display font-extrabold ${m.completed ? 'text-[#2FA65A]' : 'text-muted'}`}>
                  {m.progress}/{m.target}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Icon name="bulb" size={16} className="text-[#E6A817]" /> {t('missions.hint')}
        </p>
      </section>

      {/* Hạng Đấu trường */}
      <section className="space-y-4 rounded-[28px] bg-gradient-to-br from-[#EAF4FF] to-[#F6FAFF] p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <Avatar avatar={user.avatar} frame={user.avatarFrame} size={72} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl font-extrabold">{t('missions.rankTitle')}</h2>
              <span className="font-bold text-muted">{p.rank.next ? `${p.rank.points}/${p.rank.next.min}` : p.rank.points}</span>
            </div>
            <p className="text-sm text-muted">{t('missions.rankHint')}</p>
            <Bar value={p.rank.points - p.rank.currentMin} max={p.rank.next ? p.rank.next.min - p.rank.currentMin : 1} color="linear-gradient(90deg,#FFD54F,#FF9F43)" height={10} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-y-3 rounded-[22px] bg-white/85 px-2 py-3 sm:flex sm:items-start sm:justify-between sm:gap-1" data-testid="rank-ladder">
          {ladder.map((tier, i) => {
            const reached = p.rank.points >= tier.min;
            const current = i === rankIdx;
            return (
              <Fragment key={tier.key}>
                {i > 0 && <span className={`mt-7 hidden h-0.5 min-w-3 flex-1 rounded sm:block ${reached ? 'bg-[#FFC94D]' : 'bg-line'}`} />}
                <div className={`mx-auto flex w-full shrink-0 flex-col items-center px-0.5 text-center sm:w-20 sm:px-0 ${reached ? '' : 'opacity-45'}`}>
                  <Avatar avatar={user.avatar} frame={tier.frame} size={52} />
                  <div className="mt-1 text-xs font-extrabold leading-tight" style={{ color: RANK_STYLE[tier.key]?.text }}>
                    {t(`rank.${tier.key}`)}
                  </div>
                  <div className="text-[11px] text-muted">{tier.min}+</div>
                  {current && <span className="mt-1 h-1 w-8 rounded-full bg-[#2B9BF4]" />}
                </div>
              </Fragment>
            );
          })}
        </div>
      </section>
    </div>
  );
}
