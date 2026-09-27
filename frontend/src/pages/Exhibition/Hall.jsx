// Sảnh Hội trường triển lãm: lịch vòng tuần này, 4 phòng tranh, tranh được yêu thích nhất tuần trước, nội quy.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { formatVnTime } from '../../lib/format';
import { BOARDS } from '../../lib/exhibition';
import { EntryModal, FramedArtwork, RulesButton } from '../../components/Exhibition';

export function ScheduleBanner({ schedule, compact = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const weekEnd = new Date(Date.parse(schedule.lockAt));
  return (
    <div className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-2'}`} data-testid="exhibit-schedule">
      <div className="rounded-2xl bg-white/85 p-3 shadow-soft">
        <div className="text-xs font-extrabold uppercase text-muted">{t('exhibition.thisWeek', { from: formatVnTime(`${schedule.current}T12:00:00Z`, lang, { time: false }), to: formatVnTime(weekEnd.toISOString(), lang, { time: false }) })}</div>
        <div className="font-bold">{schedule.reactionsOpen ? t('exhibition.reactUntil', { date: formatVnTime(schedule.lockAt, lang) }) : t('exhibition.judging', { date: formatVnTime(schedule.nextRoundStart, lang) })}</div>
      </div>
      <div className={`rounded-2xl p-3 shadow-soft ${schedule.submitOpen ? 'bg-mint/20' : 'bg-white/85'}`}>
        <div className="text-xs font-extrabold uppercase text-muted">{t('exhibition.submitGate')}</div>
        <div className="font-bold">
          {schedule.submitOpen ? t('exhibition.submitOpenUntil', { date: formatVnTime(schedule.submitClosesAt, lang) }) : t('exhibition.submitOpensAt', { date: formatVnTime(schedule.submitOpensAt, lang) })}
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
      {/* Sảnh chính */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FFF3D6] via-[#FFF9EE] to-[#EAF6FF] p-5 shadow-soft sm:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around opacity-60" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="h-10 w-3 rounded-b-full bg-[#E0A800]/30" />
          ))}
        </div>
        <div className="relative flex flex-wrap items-center gap-4">
          <img src="/mascots/gau.svg" alt="" className="h-24 w-24 drop-shadow" />
          <div className="min-w-0 flex-1">
            <h1 className="page-title">🏛️ {t('exhibition.title')}</h1>
            <p className="text-muted">{t('exhibition.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RulesButton className="btn-ghost bg-white" />
            <Link to="/collection?tab=artworks" className="btn-coral" data-testid="go-submit">
              🖼️ {t('exhibition.submitCta')}
            </Link>
            {user?.role === 'admin' && (
              <Link to="/exhibition/review" className="btn-ghost bg-white">
                🛡️ {t('exhibition.review.title')}
              </Link>
            )}
          </div>
        </div>
        <div className="relative mt-4">
          <ScheduleBanner schedule={d.schedule} />
        </div>
      </section>

      {/* 4 phòng tranh */}
      <section>
        <h2 className="mb-3 font-display text-2xl font-bold">{t('exhibition.rooms')}</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {BOARDS.map((b) => (
            <Link
              key={b.key}
              to={`/exhibition/${b.key}`}
              className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-t-[80px] rounded-b-3xl border-4 p-5 pt-8 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-pop"
              style={{ borderColor: b.frame, background: `linear-gradient(180deg, ${b.frameLight}, ${b.wall})` }}
              data-testid={`room-${b.key}`}
            >
              <span className="text-5xl transition group-hover:scale-110">{b.icon}</span>
              <span className="font-display text-xl font-extrabold leading-tight">{t(`exhibition.boards.${b.key}`)}</span>
              <span className="rounded-full bg-white px-3 py-0.5 text-sm font-bold" style={{ color: b.frame }}>
                {t('exhibition.pictures', { count: d.counts[b.key] || 0 })}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Vinh danh tuần trước */}
      <section className="card p-5">
        <h2 className="mb-1 font-display text-2xl font-bold">🏆 {t('exhibition.winnersTitle')}</h2>
        {d.winners.length ? (
          <>
            <p className="mb-4 text-sm text-muted">{t('exhibition.winnersWeek', { date: formatVnTime(`${d.lastRound}T12:00:00Z`, i18n.language, { time: false }) })}</p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {d.winners.map((w) => (
                <div key={w.id} className="space-y-4">
                  <div className="text-center text-xs font-extrabold text-muted">{t(`exhibition.boards.${w.board}`)}</div>
                  <FramedArtwork entry={w} picture={d.pictures[w.pictureId]} onClick={() => setOpen(w)} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted">{t('exhibition.noWinners')}</p>
        )}
      </section>

      {open && <EntryModal entry={{ ...open, final: true }} picture={d.pictures[open.pictureId]} reactionsOpen={false} onClose={() => setOpen(null)} />}
    </div>
  );
}
