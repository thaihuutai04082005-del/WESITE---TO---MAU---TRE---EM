// Level & Nhiệm vụ + Rank (Mục 8): 4 hệ thống độc lập.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import MissionList from '../../components/MissionList/MissionList';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon';

export default function Progression() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const [p, setP] = useState(null);
  useEffect(() => {
    api.get('/progression').then(setP);
  }, []);
  if (!p) return <div className="page text-muted">{t('common.loading')}</div>;
  const done = p.missions.filter((m) => m.completed).length;
  return (
    <div className="page space-y-6">
      <h1 className="page-title">{t('missions.title')}</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['star', t('missions.cards.level'), `${p.level}/${p.maxLevel}`],
          ['trophy', t('missions.cards.rank'), t(`rank.${p.rank.key}`)],
          ['gift', t('missions.cards.gacha'), p.gachaPoints],
          ['ruby', 'Ruby', p.ruby],
        ].map(([icon, label, value]) => (
          <div key={label} className="card flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
              <Icon name={icon} />
            </div>
            <div>
              <div className="text-sm font-bold text-muted">{label}</div>
              <div className="font-display text-2xl font-extrabold">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">{t('missions.levelMissions', { level: p.level })}</h2>
          <span className="font-bold text-muted">{done}/{p.missions.length}</span>
        </div>
        {p.maxed ? <div className="card p-5 text-center font-bold">{t('missions.maxed')}</div> : <MissionList missions={p.missions} />}
        <p className="text-sm text-muted">{t('missions.hint')}</p>
      </section>

      <section className="card space-y-4 p-5">
        <div className="flex items-center gap-4">
          <Avatar avatar={user.avatar} frame={user.avatarFrame} size={80} />
          <div>
            <h2 className="font-display text-2xl font-bold">{t('missions.rankTitle')}</h2>
            <p className="text-muted">{t('missions.rankHint')}</p>
          </div>
        </div>
        <ProgressBar
          label={t(`rank.${p.rank.key}`)}
          sublabel={p.rank.next ? `${p.rank.points}/${p.rank.next.min}` : `${p.rank.points}`}
          value={p.rank.points - p.rank.currentMin}
          max={p.rank.next ? p.rank.next.min - p.rank.currentMin : 1}
          color="#FFC94D"
        />
        <div className="grid grid-cols-5 gap-2 text-center">
          {p.tiers.map((tier) => (
            <div key={tier.key} className={`rounded-2xl p-2 ${p.rank.points >= tier.min ? '' : 'opacity-40'}`}>
              <Avatar avatar={user.avatar} frame={tier.frame} size={56} className="mx-auto" />
              <div className="text-xs font-bold">{t(`rank.${tier.key}`)}</div>
              <div className="text-xs text-muted">{tier.min}+</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
