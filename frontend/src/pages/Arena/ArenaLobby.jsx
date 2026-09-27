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
import { RankMedal } from '../../components/RankBadge';
import { BearCloudArt, CrownCloudArt, GrandTrophy } from '../../components/Illustrations';

// Mỗi tiêu chí chấm điểm một biểu tượng + màu riêng.
const RUBRIC_ICON = {
  coverage: ['palette', '#2B9BF4', '#EAF6FF'],
  accuracy: ['star', '#E6A817', '#FFF6D8'],
  harmony: ['sun', '#F59E0B', '#FFF1DC'],
  creativity: ['heart', '#FF5F7E', '#FFE9EE'],
  diversity: ['sparkle', '#7D5FFF', '#F0EBFF'],
  time: ['hourglass', '#138FA8', '#E3F6F9'],
};

function IconBubble({ name, color, bg, size = 48 }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full shadow-soft" style={{ width: size, height: size, background: bg, color }}>
      <Icon name={name} size={size * 0.55} strokeWidth={2.4} />
    </span>
  );
}

export default function ArenaLobby() {
  const { t, i18n } = useTranslation();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
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
    <div className="page space-y-5">
      {/* Đầu trang */}
      <section className="relative flex flex-wrap items-center gap-3 sm:gap-5">
        <div className="h-24 w-24 shrink-0 sm:h-32 sm:w-32">
          <GrandTrophy />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-[#16324F] sm:text-5xl">
            {t('arena.title')}
          </h1>
          <p className="mt-1 text-muted">{t('arena.subtitle', { size: rules.roomSize, minutes: Math.round(rules.durationSec / 60) })}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2.5 shadow-soft" data-testid="arena-me">
          <RankMedal rank={user?.rank} size={30} />
          <span className="font-bold">
            {t('home.rank')}: {t(`rank.${user?.rank || 'bronze'}`)}
          </span>
          <span className="h-6 w-px bg-line" />
          <span className="flex items-center gap-1.5 font-bold text-primary-dark">
            <Icon name="star" size={22} className="text-[#2B9BF4]" /> {user?.rankPoints ?? 0} {t('rank.pts')}
          </span>
        </div>
      </section>

      {/* 2 cách vào trận */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFF1DC] to-[#FFF8EE] p-5 shadow-soft">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 ">
            <IconBubble name="trophy" color="#FFFFFF" bg="#FF9F43" size={56} />
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold">{t('arena.random')}</h2>
                <p className="text-sm text-muted">{t('arena.randomHint')}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${slot.open ? 'bg-mint/25 text-[#1E8A4F]' : 'bg-coral/20 text-[#C0522E]'}`}>
                <span className={`h-2 w-2 rounded-full ${slot.open ? 'bg-[#2FA65A]' : 'bg-coral'}`} />
                {slot.open ? t('arena.open') : t('arena.closed', { time: formatDateTime(slot.nextOpen, i18n.language) })}
              </span>
              {slot.slots.length > 0 && <p className="text-xs text-muted">{t('arena.slots', { slots: slot.slots.join(', ') })}</p>}
              <button type="button" className="btn-coral w-full text-xl" disabled={busy || !slot.open} onClick={() => go('arena:queue')} data-testid="arena-queue">
                <Icon name="play" /> {t('arena.findMatch')}
              </button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#E6F3FF] to-[#F4FAFF] p-5 shadow-soft">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 ">
            <IconBubble name="users" color="#FFFFFF" bg="#2B9BF4" size={56} />
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold">{t('arena.private')}</h2>
                <p className="text-sm text-muted">{t('arena.privateHint')}</p>
              </div>
              <button type="button" className="btn-primary w-full" disabled={busy} onClick={() => go('arena:create')} data-testid="arena-create">
                <Icon name="plus" /> {t('arena.createRoom')}
              </button>
              <form className="flex gap-2 rounded-2xl bg-white/70 p-1.5" onSubmit={(e) => { e.preventDefault(); go('arena:join', { code }); }}>
                <input className="input min-w-0 border-0 bg-white font-mono uppercase placeholder:font-sans placeholder:normal-case" placeholder={t('arena.roomCode')} value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required aria-label={t('arena.roomCode')} data-testid="arena-code" />
                <button type="submit" className="btn-ghost shrink-0 bg-white px-4 text-base text-primary-dark" disabled={busy} data-testid="arena-join">{t('arena.join')}</button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Cách chấm điểm */}
      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-extrabold">
          <IconBubble name="clipboard" color="#FFFFFF" bg="linear-gradient(135deg,#FFA36C,#FF6F61)" size={38} /> {t('arena.rubricTitle')}
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(rules.rubric).map(([k, w]) => {
            const [icon, color, bg] = RUBRIC_ICON[k] || ['star', '#2B9BF4', '#EAF6FF'];
            return (
              <div key={k} className="flex items-center gap-3 rounded-2xl bg-[#F5F9FD] p-3">
                <IconBubble name={icon} color={color} bg={bg} size={42} />
                <div className="min-w-0">
                  <div className="font-bold">
                    {t(`rubric.${k}`)} · {Math.round(w * 100)}%
                  </div>
                  <div className="text-xs text-muted">{t(`rubric.${k}Hint`)}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">{t('arena.rewardsHint', { a: rules.rewards[0], b: rules.rewards[1], c: rules.rewards[2] })}</p>
      </section>

      {/* Bảng vàng tuần + Các trận của bé: nền pastel rất nhạt, biểu tượng đặc màu, hình nhỏ bên phải */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[28px] border border-white bg-gradient-to-r from-[#F1EEFF] to-[#F8F7FF] p-4 shadow-soft sm:p-5">
          <div className="flex items-center gap-3">
            <IconBubble name="calendar" color="#FFFFFF" bg="#8B7CF6" size={44} />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-extrabold text-[#5B4FD6]">{t('arena.weekly', { week: info.week })}</h2>
              {info.leaderboard.length === 0 && <p className="text-sm text-muted">{t('arena.noLeaders')}</p>}
            </div>
            <div className="pointer-events-none h-14 w-24 shrink-0 sm:h-16 sm:w-28">
              <CrownCloudArt />
            </div>
          </div>
          {info.leaderboard.length > 0 && (
            <ol className="mt-3 space-y-2">
              {info.leaderboard.map((r) => (
                <li key={r.user.id} className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2">
                  <span className="w-6 text-center font-display text-xl font-extrabold text-[#5B4FD6]">{r.place}</span>
                  <Avatar avatar={r.user.avatar} frame={r.user.avatarFrame} size={40} />
                  <span className="flex-1 truncate font-bold">{r.user.nickname}</span>
                  <span className="chip">
                    {r.points} {t('arena.points')}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-[28px] border border-white bg-gradient-to-r from-[#FFEFF3] to-[#FFF7F9] p-4 shadow-soft sm:p-5">
          <div className="flex items-center gap-3">
            <IconBubble name="heart" color="#FFFFFF" bg="#FF7AA2" size={44} />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-extrabold text-[#E0457B]">{t('arena.myHistory')}</h2>
              {info.history.length === 0 && <p className="text-sm text-muted">{t('arena.noHistory')}</p>}
            </div>
            <div className="pointer-events-none h-14 w-24 shrink-0 sm:h-16 sm:w-28">
              <BearCloudArt />
            </div>
          </div>
          {info.history.length > 0 && (
            <ul className="mt-3 space-y-2">
              {info.history.map((h) => (
                <li key={h.roomId} className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2">
                  {h.thumbnail ? <img src={h.thumbnail} alt="" className="h-12 w-12 rounded-xl border border-line" /> : <div className="h-12 w-12 rounded-xl bg-primary-light" />}
                  <div className="flex-1 text-sm">
                    <div className="font-bold">{h.place ? t('arena.placeOf', { place: h.place, n: h.players }) : h.flagged ? t(`arena.flag.${h.flagReason}`) : t('arena.noPlace')}</div>
                    <div className="text-muted">{formatDateTime(h.startedAt, i18n.language)}</div>
                  </div>
                  <span className="font-display text-xl font-extrabold">{h.total?.toFixed(1) ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
