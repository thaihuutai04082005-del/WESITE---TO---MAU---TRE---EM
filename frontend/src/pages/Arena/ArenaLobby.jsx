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
import { RankMedal, RANK_STYLE } from '../../components/RankBadge';
import Modal from '../../components/Modal/Modal';
import { BearCloudArt, CrownCloudArt } from '../../components/Illustrations';

// Mỗi tiêu chí chấm điểm một biểu tượng + màu riêng.
const RUBRIC_ICON = {
  coverage: ['palette', '#2B9BF4', '#EAF6FF'],
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

/** Biểu tượng "Cách chấm điểm": cuốn sổ kẹp giấy màu trắng trên nền tròn xanh dương đậm. */
function ClipboardBadge() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0 drop-shadow-sm" aria-hidden="true">
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3D8BFD" />
          <stop offset="1" stopColor="#1E5FD9" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#cb-bg)" />
      <rect x="11" y="10" width="18" height="22" rx="3" fill="#FFFFFF" />
      <rect x="15.5" y="7.5" width="9" height="5" rx="1.8" fill="#FFFFFF" stroke="#1E5FD9" strokeWidth="1.4" />
      <path d="M15 17.5 H25 M15 21.5 H25 M15 25.5 H21.5" stroke="#3D8BFD" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Cửa sổ "i": tất cả bậc Rank + ống điểm cho bé biết cần bao nhiêu điểm để lên bậc. */
function RankInfo({ onClose }) {
  const { t } = useTranslation();
  const [p, setP] = useState(null);
  useEffect(() => {
    api.get('/progression').then(setP).catch(() => {});
  }, []);
  const tiers = p?.tiers || [];
  const n = tiers.length || 6;
  const pts = p?.rank.points ?? 0;
  const idx = Math.max(0, tiers.findIndex((x) => x.key === p?.rank.key));
  const next = tiers[idx + 1];
  const frac = next ? Math.min(1, (pts - tiers[idx].min) / (next.min - tiers[idx].min)) : 0;
  const fill = ((idx + 0.5 + frac) / n) * 100; // ống điểm chạy từ giữa bậc này tới giữa bậc kế
  return (
    <Modal closeButton={false} open onClose={onClose} wide>
      <div className="space-y-4" data-testid="rank-info">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{t('arena.rankInfoTitle')}</h2>
            <p className="text-sm text-muted">{t('arena.rankInfoHint')}</p>
          </div>
          <button type="button" className="btn-ghost min-h-11 px-3" onClick={onClose} aria-label={t('common.close')}>
            <Icon name="close" />
          </button>
        </div>
        {p && (
          <>
            <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-6">
              {tiers.map((tier, i) => (
                <div key={tier.key} className={`flex flex-col items-center text-center ${i === idx ? '' : 'opacity-80'}`}>
                  <RankMedal rank={tier.key} size={88} />
                  <div className="mt-1 text-xs font-extrabold leading-tight" style={{ color: RANK_STYLE[tier.key]?.text }}>{t(`rank.${tier.key}`)}</div>
                  <div className="text-xs font-bold text-muted">{tier.min}+ {t('rank.pts')}</div>
                  {i === idx && <span className="mt-1 rounded-full bg-[#FF9A2E] px-2 text-[11px] font-extrabold text-white">{t('arena.youAreHere')}</span>}
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              <div className="ar-tube"><span className="ar-tube-fill" style={{ width: `${fill}%` }} /></div>
              <div className="mt-1 grid grid-cols-6 text-center text-xs font-bold text-muted">
                {tiers.map((tier) => <span key={tier.key}>{tier.min}</span>)}
              </div>
            </div>
            <div className="sm:hidden">
              <div className="ar-tube"><span className="ar-tube-fill" style={{ width: `${Math.min(100, (pts / (tiers[n - 1]?.min || 1)) * 100)}%` }} /></div>
            </div>
            <p className="text-center font-bold text-[#7A4A1A]">
              <Icon name="star" size={18} className="mr-1 inline text-[#F5A623]" />
              {t('arena.yourPoints', { n: pts })}{next ? ` · ${t('arena.toNext', { n: next.min - pts, rank: t(`rank.${next.key}`) })}` : ''}
            </p>
          </>
        )}
      </div>
    </Modal>
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
  const [rankOpen, setRankOpen] = useState(false);

  useEffect(() => {
    api.get('/arena').then(setInfo).catch(() => window.dispatchEvent(new Event('btm:page-ready')));
    // Đang ở trong phòng (ví dụ tải lại trang) → quay lại phòng.
    emitAck(getSocket(token), 'arena:state').then((r) => r?.room && navigate('/arena/room')).catch(() => {});
  }, [token, navigate]);

  // Báo cho hiệu ứng chuyển màn hình (ArenaTransition) biết trang đã có dữ liệu để dựng xong.
  useEffect(() => {
    if (info) window.dispatchEvent(new Event('btm:page-ready'));
  }, [info]);

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
    <div className="ar-stage">
    <div className="page space-y-5">
      {/* Đầu trang: dải ruy băng cam có cúp + hai cây cọ chéo nhau, thẻ hạng hiện tại bên phải */}
      <section className="ar-head">
        <div className="ar-banner">
          <img src="/arena/cup-brushes.webp" alt="" className="ar-cup" draggable={false} />
          <h1 className="ar-title">{t('arena.title')}</h1>
        </div>
        <span className="ar-sep" aria-hidden="true" />
        <div className="ar-rank" data-testid="arena-me">
          <span className="ar-rank-tag">{t('arena.currentRank')}</span>
          <button type="button" className="ar-info" onClick={() => setRankOpen(true)} aria-label={t('arena.rankInfoTitle')} data-testid="rank-info-btn">i</button>
          <RankMedal rank={user?.rank} size={84} className="ar-shield" />
          <div className="ar-rank-info">
            <div className="ar-rank-name">{t(`rank.${user?.rank || 'bronze'}`)}</div>
            <div className="ar-rank-pts">
              <Icon name="star" size={20} className="text-[#F5A623]" /> {user?.rankPoints ?? 0} {t('rank.pts')}
            </div>
          </div>
        </div>
      </section>

      {/* 2 cách vào trận — cùng một khung: đầu thẻ (biểu tượng + tên + nhãn) → nút chính → hàng phụ cao bằng nhau */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-br from-[#FFF1DC] to-[#FFF8EE] p-5 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <IconBubble name="trophy" color="#FFFFFF" bg="#FF9F43" size={52} />
            <h2 className="flex-1 whitespace-nowrap font-display text-xl font-extrabold sm:text-2xl">{t('arena.random')}</h2>
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${slot.open ? 'bg-mint/25 text-[#1E8A4F]' : 'bg-coral/20 text-[#C0522E]'}`}>
              <span className={`h-2 w-2 rounded-full ${slot.open ? 'bg-[#2FA65A]' : 'bg-coral'}`} />
              {slot.open ? t('arena.open') : t('arena.closedShort')}
            </span>
          </div>
          <button type="button" className="btn-coral w-full" disabled={busy || !slot.open} onClick={() => go('arena:queue')} data-testid="arena-queue">
            <Icon name="play" /> {t('arena.findMatch')}
          </button>
          <div className="flex min-h-[60px] items-center justify-center gap-4 rounded-2xl bg-white/70 px-3 py-2 text-sm font-bold text-muted">
            {slot.open ? (
              <>
                <span className="flex items-center gap-1.5">
                  <Icon name="hourglass" size={18} className="text-[#F07B2E]" /> {t('arena.minutes', { n: Math.round(rules.durationSec / 60) })}
                </span>
                <span className="h-5 w-px bg-line" />
                <span className="flex items-center gap-1.5">
                  <Icon name="users" size={18} className="text-[#F07B2E]" /> {t('arena.upTo', { n: rules.roomSize })}
                </span>
              </>
            ) : (
              <span>{t('arena.closed', { time: formatDateTime(slot.nextOpen, i18n.language) })}</span>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-br from-[#E6F3FF] to-[#F4FAFF] p-5 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <IconBubble name="users" color="#FFFFFF" bg="#2B9BF4" size={52} />
            <h2 className="flex-1 whitespace-nowrap font-display text-xl font-extrabold sm:text-2xl">{t('arena.private')}</h2>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-bold text-primary-dark shadow-soft">
              <Icon name="lock" size={14} /> {t('arena.friendsOnlyChip')}
            </span>
          </div>
          <button type="button" className="btn-primary w-full" disabled={busy} onClick={() => go('arena:create')} data-testid="arena-create">
            <Icon name="plus" /> {t('arena.createRoom')}
          </button>
          <form className="flex min-h-[60px] items-center gap-2 rounded-2xl bg-white/70 p-1.5" onSubmit={(e) => { e.preventDefault(); go('arena:join', { code }); }}>
            <input className="input min-w-0 border-0 bg-white font-mono uppercase placeholder:font-sans placeholder:normal-case" placeholder={t('arena.roomCode')} value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required aria-label={t('arena.roomCode')} data-testid="arena-code" />
            <button type="submit" className="btn-ghost shrink-0 bg-white px-4 text-base text-primary-dark" disabled={busy} data-testid="arena-join">{t('arena.join')}</button>
          </form>
        </section>
      </div>

      {/* Cách chấm điểm */}
      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-extrabold">
          <ClipboardBadge /> {t('arena.rubricTitle')}
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
                  <Avatar avatar={r.user.avatar} frame={r.user.avatarFrame} vip={r.user.vip} size={40} />
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
    {rankOpen && <RankInfo onClose={() => setRankOpen(false)} />}
    </div>
  );
}
