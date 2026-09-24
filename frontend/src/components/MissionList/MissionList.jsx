import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import Icon from '../Icon';

const DIFF_COLOR = { easy: '#4CD787', medium: '#2B9BF4', hard: '#7D5FFF' };

export default function MissionList({ missions = [] }) {
  const { t, i18n } = useTranslation();
  return (
    <ul className="space-y-3" data-testid="mission-list">
      {missions.map((m) => (
        <li key={m.id} className={`card flex items-center gap-3 p-4 ${m.completed ? 'bg-mint/10' : ''}`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${m.completed ? 'bg-mint text-white' : 'bg-primary-light text-primary-dark'}`}>
            <Icon name={m.completed ? 'check' : 'target'} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold">{m.titles?.[i18n.language] || m.title}</div>
            <div className="mb-1 flex gap-2 text-xs font-bold">
              <span style={{ color: DIFF_COLOR[m.difficulty] }}>{t(`missions.difficulty.${m.difficulty}`)}</span>
              <span className="text-muted">+{m.ruby} Ruby</span>
            </div>
            <ProgressBar value={m.progress} max={m.target} color={m.completed ? '#4CD787' : '#2B9BF4'} height={10} />
          </div>
          <div className="w-12 text-right font-display font-bold">
            {m.progress}/{m.target}
          </div>
        </li>
      ))}
    </ul>
  );
}
