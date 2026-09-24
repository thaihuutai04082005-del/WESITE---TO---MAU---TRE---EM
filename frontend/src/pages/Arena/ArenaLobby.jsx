// Sảnh Đấu trường sáng tạo hàng tuần (Mục 9): ghép ngẫu nhiên theo khung giờ / tạo phòng riêng mời bạn bè.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { getSocket, emitAck } from '../../services/socket';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { formatDateTime } from '../../lib/format';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon';

export default function ArenaLobby() {
  const { t, i18n } = useTranslation();
  const token = useAuth((s) => s.token);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/arena').then(setInfo);
    // Đang ở trong phòng (ví dụ tải lại trang) → quay lại phòng.
    emitAck(getSocket(token), 'arena:state').then((r) => r?.room && navigate('/arena/room')).catch(() => {});
  }, [token, navigate]);

  const go = async (event, payload) => {
    setBusy(true);
    try {
      const r = await emitAck(getSocket(token), event, payload);
      if (r?.error) return toast(t(`errors.${r.error}`, { defaultValue: t('errors.server_error') }), 'error');
      navigate('/arena/room');
    } catch {
      toast(t('errors.network_error'), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!info) return <div className="page text-muted">{t('common.loading')}</div>;
  const { slot, rules } = info;
  return (
    <div className="page space-y-6">
      <div>
        <h1 className="page-title">{t('arena.title')}</h1>
        <p className="text-muted">{t('arena.subtitle', { size: rules.roomSize, minutes: Math.round(rules.durationSec / 60) })}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3 p-5">
          <h2 className="font-display text-2xl font-bold">{t('arena.random')}</h2>
          <p className="text-sm text-muted">{t('arena.randomHint')}</p>
          <div className={`chip ${slot.open ? 'bg-mint/20 text-[#1E8A4F]' : 'bg-coral/20 text-coral'}`}>
            {slot.open ? t('arena.open') : t('arena.closed', { time: formatDateTime(slot.nextOpen, i18n.language) })}
          </div>
          {slot.slots.length > 0 && <p className="text-sm text-muted">{t('arena.slots', { slots: slot.slots.join(', ') })}</p>}
          <button type="button" className="btn-coral w-full" disabled={busy || !slot.open} onClick={() => go('arena:queue')} data-testid="arena-queue">
            <Icon name="play" /> {t('arena.findMatch')}
          </button>
        </div>
        <div className="card space-y-3 p-5">
          <h2 className="font-display text-2xl font-bold">{t('arena.private')}</h2>
          <p className="text-sm text-muted">{t('arena.privateHint')}</p>
          <button type="button" className="btn-primary w-full" disabled={busy} onClick={() => go('arena:create')} data-testid="arena-create">
            <Icon name="plus" /> {t('arena.createRoom')}
          </button>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); go('arena:join', { code }); }}>
            <input className="input font-mono uppercase" placeholder={t('arena.roomCode')} value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required aria-label={t('arena.roomCode')} data-testid="arena-code" />
            <button type="submit" className="btn-ghost" disabled={busy} data-testid="arena-join">{t('arena.join')}</button>
          </form>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-2 font-display text-2xl font-bold">{t('arena.rubricTitle')}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(rules.rubric).map(([k, w]) => (
            <div key={k} className="rounded-2xl bg-primary-light p-3">
              <div className="font-bold">{t(`rubric.${k}`)} · {Math.round(w * 100)}%</div>
              <div className="text-xs text-muted">{t(`rubric.${k}Hint`)}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{t('arena.rewardsHint', { a: rules.rewards[0], b: rules.rewards[1], c: rules.rewards[2] })}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-display text-2xl font-bold">{t('arena.weekly', { week: info.week })}</h2>
          {info.leaderboard.length === 0 && <p className="text-muted">{t('arena.noLeaders')}</p>}
          <ol className="space-y-2">
            {info.leaderboard.map((r) => (
              <li key={r.user.id} className="flex items-center gap-3">
                <span className="w-6 text-center font-display text-xl font-extrabold">{r.place}</span>
                <Avatar avatar={r.user.avatar} frame={r.user.avatarFrame} size={40} />
                <span className="flex-1 truncate font-bold">{r.user.nickname}</span>
                <span className="chip">{r.points} {t('arena.points')}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-display text-2xl font-bold">{t('arena.myHistory')}</h2>
          {info.history.length === 0 && <p className="text-muted">{t('arena.noHistory')}</p>}
          <ul className="space-y-2">
            {info.history.map((h) => (
              <li key={h.roomId} className="flex items-center gap-3">
                {h.thumbnail ? <img src={h.thumbnail} alt="" className="h-12 w-12 rounded-xl border border-line" /> : <div className="h-12 w-12 rounded-xl bg-primary-light" />}
                <div className="flex-1 text-sm">
                  <div className="font-bold">{h.place ? t('arena.placeOf', { place: h.place, n: h.players }) : h.flagged ? t(`arena.flag.${h.flagReason}`) : t('arena.noPlace')}</div>
                  <div className="text-muted">{formatDateTime(h.startedAt, i18n.language)}</div>
                </div>
                <span className="font-display text-xl font-extrabold">{h.total?.toFixed(1) ?? '—'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
