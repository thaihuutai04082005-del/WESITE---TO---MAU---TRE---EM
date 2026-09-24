import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { api } from '../../services/api';
import PictureView from '../../components/PictureView/PictureView';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Icon from '../../components/Icon';
import { PlanBadge } from '../Payment/Plans';

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
  const tiles = [
    { to: '/color', icon: 'palette', key: 'color', cls: 'bg-primary text-white' },
    { to: '/arena', icon: 'trophy', key: 'arena', cls: 'bg-coral text-white' },
    { to: '/together', icon: 'heart', key: 'together', cls: 'bg-mint text-white' },
    { to: '/gacha', icon: 'gift', key: 'gacha', cls: 'bg-[#7D5FFF] text-white' },
    { to: '/storybooks', icon: 'book', key: 'storybooks', cls: 'bg-sun text-ink' },
    { to: '/missions', icon: 'target', key: 'missions', cls: 'bg-primary-light text-primary-dark' },
  ];
  return (
    <div className="page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">{t('home.hello', { name: user.nickname })}</h1>
        <PlanBadge plan={plan} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((x) => (
          <Link key={x.to} to={x.to} className={`flex min-h-28 flex-col justify-between rounded-3xl p-4 shadow-soft transition hover:-translate-y-1 ${x.cls}`} data-testid={`tile-${x.key}`}>
            <Icon name={x.icon} size={32} />
            <span className="font-display text-xl font-extrabold">{t(`nav.${x.key}`)}</span>
          </Link>
        ))}
      </div>
      {prog && (
        <div className="card grid gap-4 p-5 md:grid-cols-2">
          <ProgressBar
            label={t('home.level', { level: prog.level })}
            sublabel={`${prog.missions.filter((m) => m.completed).length}/${prog.missions.length} ${t('home.missions')}`}
            value={prog.missions.filter((m) => m.completed).length}
            max={prog.missions.length}
          />
          <ProgressBar
            label={`${t('home.rank')}: ${t(`rank.${prog.rank.key}`)}`}
            sublabel={prog.rank.next ? `${prog.rank.points}/${prog.rank.next.min}` : `${prog.rank.points}`}
            value={prog.rank.points - prog.rank.currentMin}
            max={prog.rank.next ? prog.rank.next.min - prog.rank.currentMin : 1}
            color="#FFC94D"
          />
        </div>
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
  );
}

export default function Home() {
  const user = useAuth((s) => s.user);
  return user ? <Dashboard /> : <Landing />;
}
