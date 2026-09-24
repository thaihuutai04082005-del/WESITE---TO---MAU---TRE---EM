// Bảng kết quả phòng đấu: Top 3, điểm rubric từng tiêu chí, phần thưởng.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '../Avatar/Avatar';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const CRITERIA = ['coverage', 'accuracy', 'harmony', 'creativity', 'diversity', 'time'];

export default function Leaderboard({ board = [], meId }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(meId);
  return (
    <ol className="space-y-2" data-testid="leaderboard">
      {board.map((e, i) => (
        <li key={e.user?.id ?? i} className={`card overflow-hidden ${e.user?.id === meId ? 'ring-4 ring-primary/40' : ''}`}>
          <button type="button" className="flex w-full items-center gap-3 p-3 text-left" onClick={() => setOpen(open === e.user?.id ? null : e.user?.id)}>
            <span className="w-8 text-center font-display text-2xl font-extrabold">{e.place ? MEDAL[e.place] || e.place : '–'}</span>
            <Avatar avatar={e.user?.avatar} frame={e.user?.avatarFrame} size={48} />
            {e.thumbnail && <img src={e.thumbnail} alt="" className="h-12 w-12 rounded-xl border border-line" />}
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{e.user?.nickname}</div>
              {e.flagged && <div className="text-xs font-bold text-danger">{t(`arena.flag.${e.flagReason || 'too_fast'}`)}</div>}
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-extrabold text-primary-dark">{e.scores ? e.total.toFixed(1) : '—'}</div>
              {e.reward > 0 && <div className="chip">+{e.reward} {t('arena.points')}</div>}
            </div>
          </button>
          {open === e.user?.id && e.scores && (
            <div className="grid grid-cols-2 gap-2 border-t border-line bg-primary-light/50 p-3 text-sm sm:grid-cols-3">
              {CRITERIA.map((c) => (
                <div key={c}>
                  <div className="font-bold">{t(`rubric.${c}`)}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(e.scores[c] * 100)}%` }} />
                  </div>
                  <div className="text-xs text-muted">{Math.round(e.scores[c] * 100)}%</div>
                </div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
