// Sảnh Hội trường triển lãm: lịch vòng tuần này, 4 phòng tranh, tranh được yêu thích nhất tuần trước, nội quy.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { formatVnTime } from '../../lib/format';
import { BOARDS } from '../../lib/exhibition';
import { EntryModal, FramedArtwork, RulesButton } from '../../components/Exhibition';
import Icon from '../../components/Icon';

/** Màu thẻ phòng ở sảnh (pastel theo tông web): nền chuyển màu + màu nhấn cho chip & nút. */
const ROOM_STYLE = {
  S: { from: '#FFF6D6', to: '#FFE9A8', accent: '#E0A800', text: '#9A6A00' },
  A: { from: '#EAF6FF', to: '#CFE8FF', accent: '#2B9BF4', text: '#1769B5' },
  B: { from: '#FFEFE6', to: '#FFD9C7', accent: '#F07B4F', text: '#B8532C' },
  free: { from: '#F3EFFF', to: '#E2D9FF', accent: '#7D5FFF', text: '#5B3FD6' },
};

/** Biểu tượng từng phòng: vương miện / kim cương / ngôi sao / bảng màu. */
function RoomIcon({ board }) {
  const ink = '#1B2A38';
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
      <g stroke={ink} strokeWidth="2.5" strokeLinejoin="round">
        {board === 'S' && (
          <>
            <path d="M10 46 L8 20 L22 32 L32 12 L42 32 L56 20 L54 46 Z" fill="#FFD54F" />
            <rect x="10" y="46" width="44" height="8" rx="3" fill="#FFC21A" />
            <circle cx="32" cy="36" r="4.5" fill="#FF5F7E" strokeWidth="2" />
          </>
        )}
        {board === 'A' && (
          <>
            <path d="M12 24 L22 12 H42 L52 24 L32 54 Z" fill="#7DC4FF" />
            <path d="M12 24 H52 M22 12 L28 24 L32 54 M42 12 L36 24 L32 54 M28 24 L32 12 L36 24" fill="none" strokeWidth="2" />
          </>
        )}
        {board === 'B' && <polygon points="32,8 39,24 56,25 43,37 47,54 32,45 17,54 21,37 8,25 25,24" fill="#FFC94D" />}
        {board === 'free' && (
          <>
            <path d="M32 8C18 8 8 18 8 30c0 11 9 20 20 20 3 0 5-2 5-5 0-2-1-3-1-5 0-2 2-4 4-4h6c8 0 14-5 14-13C56 14 45 8 32 8z" fill="#FFF3D6" />
            <circle cx="20" cy="28" r="4.5" fill="#FF5F7E" strokeWidth="2" />
            <circle cx="26" cy="17" r="4.5" fill="#FFC94D" strokeWidth="2" />
            <circle cx="39" cy="16" r="4.5" fill="#4FA3E0" strokeWidth="2" />
            <circle cx="47" cy="26" r="4.5" fill="#4CD787" strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
}

function IconBubble({ name, bg, color }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: bg, color }}>
      <Icon name={name} size={24} strokeWidth={2.4} />
    </span>
  );
}

/** Cuốn lịch đỏ – trắng: gáy đỏ có 2 khoen, thân trắng kẻ ô ngày màu xám. */
function CalendarArt() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
      <g stroke="#1B2A38" strokeWidth="2" strokeLinejoin="round">
        <rect x="6" y="9" width="36" height="33" rx="6" fill="#FFFFFF" />
        <path d="M6 15a6 6 0 016-6h24a6 6 0 016 6v5H6z" fill="#FF5F5F" />
        <rect x="14" y="4" width="4" height="10" rx="2" fill="#FFFFFF" />
        <rect x="30" y="4" width="4" height="10" rx="2" fill="#FFFFFF" />
      </g>
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
        <rect key={`${r}${c}`} x={11 + c * 7.5} y={24 + r * 5.5} width="4" height="3" rx="1" fill="#C9D4DE" />
      )))}
    </svg>
  );
}

export function ScheduleBanner({ schedule, compact = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const weekEnd = new Date(Date.parse(schedule.lockAt));
  return (
    <div className={`grid gap-3 rounded-[24px] bg-white p-4 shadow-soft ${compact ? '' : 'sm:grid-cols-2 sm:divide-x sm:divide-line'}`} data-testid="exhibit-schedule">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFECEC]">
          <CalendarArt />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-bold text-muted">{t('exhibition.thisWeek', { from: formatVnTime(`${schedule.current}T12:00:00Z`, lang, { time: false }), to: formatVnTime(weekEnd.toISOString(), lang, { time: false }) })}</div>
          <div className="font-bold">{schedule.reactionsOpen ? t('exhibition.reactUntil', { date: formatVnTime(schedule.lockAt, lang) }) : t('exhibition.judging', { date: formatVnTime(schedule.nextRoundStart, lang) })}</div>
        </div>
      </div>
      <div className={`flex items-center gap-3 ${compact ? '' : 'sm:pl-4'}`}>
        <IconBubble name="hourglass" bg="#E4F6E8" color="#2FA65A" />
        <div className="min-w-0">
          <div className="text-xs font-bold text-muted">{t('exhibition.submitGate')}</div>
          <div className="font-bold">
            {schedule.submitOpen ? t('exhibition.submitOpenUntil', { date: formatVnTime(schedule.submitClosesAt, lang) }) : t('exhibition.submitOpensAt', { date: formatVnTime(schedule.submitOpensAt, lang) })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hall() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get('/exhibition').then(setD).catch(() => setD({ error: true }));
  }, []);

  if (!d) return <div className="page text-center text-muted">{t('common.loading')}</div>;
  if (d.error) return <div className="page text-center text-muted">{t('errors.server_error')}</div>;

  return (
    <div className="page space-y-6">
      {/* Đầu trang: biểu tượng bảo tàng + tên + 2 nút */}
      <section className="flex flex-wrap items-center gap-3 sm:gap-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FFD54F] text-[#1F3A6B] shadow-soft sm:h-20 sm:w-20">
          <Icon name="museum" size={38} strokeWidth={2.3} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-extrabold leading-tight text-[#16324F] sm:text-4xl">{t('exhibition.title')}</h1>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <RulesButton className="btn-ghost flex-1 whitespace-nowrap bg-white px-3 sm:flex-none sm:px-6" />
          <Link to="/collection?tab=artworks" className="btn-primary flex-[1.6] whitespace-nowrap px-3 sm:flex-none sm:px-6" data-testid="go-submit">
            <Icon name="send" size={20} /> {t('exhibition.submitCta')}
          </Link>
          {user?.role === 'admin' && (
            <Link to="/exhibition/review" className="btn-ghost bg-white">
              <Icon name="shield" size={20} /> {t('exhibition.review.title')}
            </Link>
          )}
        </div>
      </section>

      <ScheduleBanner schedule={d.schedule} />

      {/* 4 phòng tranh: khung vòm pastel, biểu tượng giữa, chip số tranh + nút mũi tên */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-extrabold">
          <Icon name="palette" size={26} className="text-primary" /> {t('exhibition.rooms')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {BOARDS.map((b) => {
            const st = ROOM_STYLE[b.key];
            return (
              <Link
                key={b.key}
                to={`/exhibition/${b.key}`}
                className="group rounded-[28px] p-2.5 shadow-soft transition hover:-translate-y-1 hover:shadow-pop"
                style={{ background: `linear-gradient(180deg, ${st.from}, ${st.to})` }}
                data-testid={`room-${b.key}`}
              >
                <div className="flex h-full flex-col items-center gap-2 rounded-t-[80px] rounded-b-[20px] bg-white/60 px-3 pb-3 pt-5 text-center">
                  <span className="transition group-hover:scale-110">
                    <RoomIcon board={b.key} />
                  </span>
                  <span className="font-display text-lg font-extrabold leading-tight sm:text-xl">{t(`exhibition.boards.${b.key}`)}</span>
                  <div className="mt-auto flex w-full items-center justify-center gap-2 pt-1">
                    <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-soft sm:px-3 sm:text-sm" style={{ color: st.text }}>
                      {t('exhibition.pictures', { count: d.counts[b.key] || 0 })}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white sm:h-8 sm:w-8 transition group-hover:translate-x-0.5" style={{ background: st.accent }}>
                      <Icon name="arrow" size={18} strokeWidth={3} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Vinh danh vòng vừa rồi */}
      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <IconBubble name="trophy" bg="#FFF4CC" color="#E0A800" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-extrabold leading-tight sm:text-2xl">{t('exhibition.winnersTitle')}</h2>
            <p className="text-sm text-muted">
              {d.winners.length ? t('exhibition.winnersWeek', { date: formatVnTime(`${d.lastRound}T12:00:00Z`, i18n.language, { time: false }) }) : t('exhibition.noWinners')}
            </p>
          </div>
        </div>
        {d.winners.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {d.winners.map((w) => (
              <div key={w.id} className="space-y-4">
                <div className="text-center text-xs font-extrabold text-muted">{t(`exhibition.boards.${w.board}`)}</div>
                <FramedArtwork entry={w} picture={d.pictures[w.pictureId]} onClick={() => setOpen(w)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {open && <EntryModal entry={{ ...open, final: true }} picture={d.pictures[open.pictureId]} reactionsOpen={false} onClose={() => setOpen(null)} />}
    </div>
  );
}
