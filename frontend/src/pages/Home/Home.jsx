import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { api } from '../../services/api';
import PictureView from '../../components/PictureView/PictureView';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Icon from '../../components/Icon';
import { PlanBadge } from '../Payment/Plans';
import { RankMedal, RANK_STYLE } from '../../components/RankBadge';
import { ColorArt, TrophyArt, TogetherArt, GachaArt, BookArt, MissionArt, SunCloud } from '../../components/Illustrations';

function Landing() {
  const { t } = useTranslation();
  const [themes, setThemes] = useState([]);
  useEffect(() => {
    api.get('/themes').then((r) => setThemes(r.themes)).catch(() => {});
  }, []);
  const features = ['creative', 'arena', 'gacha', 'together', 'storybook', 'safe'];
  return (
    <div className="page">
      <section className="grid items-center gap-6 py-6 md:grid-cols-2 md:py-12">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">{t('landing.title')}</h1>
          <p className="mt-3 text-lg text-muted md:text-xl">{t('landing.subtitle')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary text-xl" data-testid="cta-register">
              {t('landing.cta')}
            </Link>
            <Link to="/login" className="btn-ghost text-xl">
              {t('auth.login')}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themes.slice(0, 5).map((th, i) => (
            <div key={th.slug} className={`card overflow-hidden p-1 ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <PictureView picture={th.cover} reveal className="rounded-2xl" />
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f} className="card p-5">
            <h3 className="font-display text-xl font-bold">{t(`landing.features.${f}.title`)}</h3>
            <p className="text-muted">{t(`landing.features.${f}.text`)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

const HOME_CARDS = [
  { to: '/color', key: 'color', icon: 'palette', Art: ColorArt, bg: 'linear-gradient(135deg,#DDEFFF 0%,#B7DCFF 100%)', accent: '#2B9BF4' },
  { to: '/arena', key: 'arena', icon: 'trophy', Art: TrophyArt, bg: 'linear-gradient(135deg,#FFE7D3 0%,#FFC8A2 100%)', accent: '#F07B2E' },
  { to: '/together', key: 'together', icon: 'heart', Art: TogetherArt, bg: 'linear-gradient(135deg,#DDF7E2 0%,#A9E8B6 100%)', accent: '#2FA65A' },
  { to: '/gacha', key: 'gacha', icon: 'gift', Art: GachaArt, bg: 'linear-gradient(135deg,#EEE7FF 0%,#D2C2FF 100%)', accent: '#7D5FFF' },
  { to: '/storybooks', key: 'storybooks', icon: 'book', Art: BookArt, bg: 'linear-gradient(135deg,#FFF5CF 0%,#FFE08F 100%)', accent: '#D99A00' },
  { to: '/missions', key: 'missions', icon: 'target', Art: MissionArt, bg: 'linear-gradient(135deg,#DDF4FF 0%,#B4E4FF 100%)', accent: '#138FA8' },
];

function HomeCard({ card }) {
  const { t } = useTranslation();
  const { Art } = card;
  return (
    <Link
      to={card.to}
      className="group relative grid min-h-44 grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-[28px] p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-pop"
      style={{ background: card.bg }}
      data-testid={`tile-${card.key}`}
    >
      <div className="relative z-10 flex flex-col justify-between gap-3">
        <span style={{ color: card.accent }}>
          <Icon name={card.icon} size={44} strokeWidth={2.6} />
        </span>
        <span className="whitespace-nowrap font-display text-[26px] font-extrabold leading-[1.1] text-ink">{t(`nav.${card.key}`)}</span>
      </div>
      <div className="relative -my-2 -mr-2">
        <div className="absolute inset-0 transition duration-300 group-hover:scale-105">
          <Art />
        </div>
      </div>
      <span className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft transition group-hover:translate-x-1" style={{ color: card.accent }}>
        <Icon name="arrow" size={22} strokeWidth={3} />
      </span>
    </Link>
  );
}

function Dashboard() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const plan = useAuth((s) => s.plan);
  const [prog, setProg] = useState(null);
  const [drafts, setDrafts] = useState([]);
  useEffect(() => {
    api.get('/progression').then(setProg).catch(() => {});
    api.get('/artworks?status=in_progress').then((r) => setDrafts(r.artworks.slice(0, 4))).catch(() => {});
  }, []);
  const done = prog ? prog.missions.filter((m) => m.completed).length : 0;
  const rank = prog?.rank;

  return (
    <div className="bg-gradient-to-b from-[#EEF7FF] via-[#F7FBFF] to-white">
      <div className="page max-w-7xl space-y-6">
        {/* Lời chào + linh vật */}
        <section className="relative flex items-center gap-3 pt-2 sm:gap-6">
          <div className="relative h-28 w-24 shrink-0 sm:h-40 sm:w-36">
            <img src="/mascots/gau.svg" alt="" className="h-full w-full object-contain drop-shadow" draggable={false} />
            <svg viewBox="0 0 60 80" className="absolute -right-3 bottom-2 h-16 w-12 sm:h-20 sm:w-14" aria-hidden="true">
              <g transform="rotate(28 30 40)" stroke="#1B2A38" strokeWidth="2.5" strokeLinejoin="round">
                <rect x="20" y="8" width="16" height="52" rx="4" fill="#2B9BF4" />
                <polygon points="20,60 36,60 28,76" fill="#F3D9B1" />
                <polygon points="25,70 31,70 28,76" fill="#1B2A38" />
                <rect x="20" y="16" width="16" height="6" fill="#FFFFFF" opacity="0.6" stroke="none" />
              </g>
            </svg>
            <svg viewBox="0 0 40 40" className="absolute -right-8 top-2 h-8 w-8 sm:-right-10 sm:h-10 sm:w-10" aria-hidden="true">
              <g stroke="#FFC94D" strokeWidth="4" strokeLinecap="round">
                <path d="M6 8 L14 14" />
                <path d="M4 22 L14 22" />
                <path d="M6 36 L14 30" />
              </g>
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-extrabold leading-none text-ink sm:text-5xl lg:text-6xl" data-testid="home-hello">
              {t('home.hello', { name: user.nickname })}
            </h1>
            <p className="mt-2 text-lg text-muted sm:text-2xl">{t('home.subtitle')}</p>
          </div>
          <div className="hidden flex-col items-end gap-2 lg:flex">
            <PlanBadge plan={plan} />
          </div>
          <SunCloud className="pointer-events-none absolute -top-2 right-0 hidden h-24 w-32 opacity-90 lg:block lg:translate-x-6 lg:-translate-y-6" />
        </section>
        <div className="lg:hidden">
          <PlanBadge plan={plan} />
        </div>

        {/* 6 thẻ chức năng */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {HOME_CARDS.map((c) => (
            <HomeCard key={c.key} card={c} />
          ))}
        </section>

        {/* Cấp độ & Rank */}
        {prog && (
          <section className="card grid gap-5 p-5 md:grid-cols-2 md:gap-8">
            <Link to="/missions" className="flex items-center gap-4" data-testid="home-level">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E4F6E8] text-[#2FA65A]">
                <Icon name="mountain" size={32} strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-extrabold">{t('home.level', { level: prog.level })}</span>
                  <span className="text-sm font-bold text-muted">
                    {done}/{prog.missions.length} {t('home.missions')}
                  </span>
                </div>
                <ProgressBar value={done} max={prog.missions.length} color="linear-gradient(90deg,#4CD787,#2FA65A)" height={12} />
              </div>
            </Link>
            <Link to="/missions" className="flex items-center gap-4" data-testid="home-rank">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: RANK_STYLE[rank.key].bg }}>
                <RankMedal rank={rank.key} size={40} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="font-display text-xl font-extrabold">
                    {t('home.rank')} {t(`rank.${rank.key}`)}
                  </span>
                  <span className="text-sm font-bold text-muted">
                    {rank.next ? `${rank.points}/${rank.next.min}` : rank.points} {t('rank.pts')}
                  </span>
                </div>
                <ProgressBar
                  value={rank.points - rank.currentMin}
                  max={rank.next ? rank.next.min - rank.currentMin : 1}
                  color={`linear-gradient(90deg,${RANK_STYLE[rank.key].fill},${RANK_STYLE[rank.key].ring})`}
                  height={12}
                />
                <div className="mt-1 text-xs font-bold text-muted">
                  {rank.next ? t('profile.toNextRank', { n: rank.next.min - rank.points, rank: t(`rank.${rank.next.key}`) }) : t('profile.maxRank')}
                </div>
              </div>
            </Link>
          </section>
        )}

        {drafts.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-2xl font-bold">{t('home.continue')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {drafts.map((a) => (
                <Link key={a.id} to={`/draw/${a.id}`} className="card p-2">
                  {a.thumbnail ? <img src={a.thumbnail} alt="" className="aspect-square w-full rounded-2xl" /> : <div className="aspect-square rounded-2xl bg-primary-light" />}
                  <div className="mt-1 truncate font-bold">{a.name[i18n.language]}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const user = useAuth((s) => s.user);
  return user ? <Dashboard /> : <Landing />;
}
