// Sảnh Hội trường triển lãm: cảnh phòng tranh phủ kín màn hình (máy tính tự thu phóng để thấy trọn phòng, không phải cuộn), 5 khung tranh được yêu thích nhất vòng vừa rồi, nội quy, lịch triển lãm.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { formatVnTime } from '../../lib/format';
import { EntryModal, RulesButton } from '../../components/Exhibition';
import { HallArrow, HallFrame, Plant, RopeLine } from '../../components/HallScene';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import Icon from '../../components/Icon';

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

const PAGE = 5;          // số tranh mỗi trang trên tường
const SLIDE_MS = 600;    // thời gian lướt sang trang khác

/** Nút đồng hồ trên thanh tiêu đề: chấm đỏ khi cổng/thả cảm xúc đang mở; bấm ra bảng lịch triển lãm. */
function ScheduleMenu({ schedule }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const live = schedule.reactionsOpen || schedule.submitOpen;
  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#FBEFD8] text-[#16324F] transition hover:scale-105 sm:h-14 sm:w-14"
        aria-label={t('exhibition.scheduleBtn')}
        aria-expanded={open}
        data-testid="exhibit-schedule-btn"
      >
        <Icon name="clock" size={28} strokeWidth={2.6} />
        {live && <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-[#FF4D3D]" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 space-y-3 rounded-2xl bg-white p-4 text-left shadow-pop" data-testid="exhibit-schedule">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[#16324F]"><Icon name="calendar" size={22} strokeWidth={2.4} /></span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#16324F]">{t('exhibition.reactSchedule')}</div>
              <div className="text-xs font-bold text-muted">{schedule.reactionsOpen ? t('exhibition.reactUntil', { date: formatVnTime(schedule.lockAt, lang) }) : t('exhibition.judging', { date: formatVnTime(schedule.nextRoundStart, lang) })}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[#16324F]"><Icon name="hourglass" size={22} strokeWidth={2.4} /></span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#16324F]">{t('exhibition.gateTime')}</div>
              <div className="text-xs font-bold text-muted">{schedule.submitOpen ? t('exhibition.submitOpenUntil', { date: formatVnTime(schedule.submitClosesAt, lang) }) : t('exhibition.submitOpensAt', { date: formatVnTime(schedule.submitOpensAt, lang) })}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Máy tính: thu phóng cả cảnh (CSS zoom) cho vừa đúng chiều cao còn lại của màn hình, nên thấy trọn phòng mà không phải cuộn. */
function useFitHall(ready) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!ready || !el) return undefined;
    const fit = () => {
      if (window.innerWidth < 1024) {
        el.style.zoom = '';
        return;
      }
      el.style.zoom = '1';
      const natural = el.offsetHeight;
      const top = document.querySelector('header')?.offsetHeight || 73;
      const avail = window.innerHeight - top;
      const s = Math.min(1.3, Math.max(0.4, avail / natural));
      el.style.zoom = String(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [ready]);
  return ref;
}

export default function Hall() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(null);
  const [pages, setPages] = useState({});     // {số trang: {entries, pictures}} — tải dần, nhớ lại để lướt qua lại không phải tải lại
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [slide, setSlide] = useState(null);   // {dir: 'next'|'prev', to}
  const loading = useRef({});
  const zoomRef = useFitHall(!!d && !d.error);

  const loadPage = (p) => {
    if (loading.current[p]) return loading.current[p];
    loading.current[p] = api
      .get(`/exhibition/wall?offset=${p * PAGE}&limit=${PAGE}`)
      .then((r) => {
        setPages((x) => ({ ...x, [p]: r }));
        setTotal(r.total);
        return r;
      })
      .catch(() => {
        delete loading.current[p];
        return null;
      });
    return loading.current[p];
  };

  useEffect(() => {
    api.get('/exhibition').then(setD).catch(() => setD({ error: true }));
    loadPage(0).then((r) => {
      if (r && r.total > PAGE) loadPage(1);   // tải sẵn trang kế để lướt mượt
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!d) return <div className="page text-center text-muted">{t('common.loading')}</div>;
  if (d.error) return <div className="page text-center text-muted">{t('errors.server_error')}</div>;

  const lang = i18n.language;
  const hasNext = (page + 1) * PAGE < total;
  const hasPrev = page > 0;

  async function go(dir) {
    if (slide) return;
    const to = page + (dir === 'next' ? 1 : -1);
    if (to < 0 || to * PAGE >= total) return;
    const r = await loadPage(to);
    if (!r) return;
    setSlide({ dir, to });
    setTimeout(() => {
      setPage(to);
      setSlide(null);
      if ((to + 1) * PAGE < r.total) loadPage(to + 1);
    }, SLIDE_MS);
  }

  const updateEntry = (e) => {
    setPages((x) => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, { ...v, entries: v.entries.map((y) => (y.id === e.id ? { ...y, ...e } : y)) }])));
    setOpen((o) => (o && o.id === e.id ? { ...o, ...e } : o));
  };

  async function react(entry, key) {
    try {
      const r = await api.put(`/exhibition/entries/${entry.id}/reaction`, { emoji: entry.mine === key ? null : key });
      updateEntry({ id: entry.id, reactions: r.counts, mine: r.mine, total: Object.values(r.counts).reduce((a, c) => a + c, 0) });
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }

  const renderRow = (p, extra) => {
    const data = pages[p];
    return (
      <div className={`grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5 lg:gap-x-8 ${extra}`}>
        {Array.from({ length: PAGE }, (_, i) => {
          const w = data?.entries[i] || null;
          return (
            <HallFrame
              key={w ? w.id : `empty${p}-${i}`}
              entry={w}
              picture={w ? data.pictures[w.pictureId] : null}
              onOpen={() => setOpen(w)}
              lang={lang}
              reactionsOpen={d.schedule.reactionsOpen}
              onReact={react}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="hall-scene" data-testid="exhibit-hall">
       <div ref={zoomRef} className="hall-zoom">
        {/* Trần xanh + đèn tròn */}
        <div className="hall-ceiling">
          <span /><span /><span /><span />
        </div>

        {/* Tường: thanh tiêu đề, thanh gỗ, đèn + khung tranh, hàng cột ruy băng */}
        <div className="hall-wall">
          <header className="relative z-20 mx-auto flex max-w-[1180px] 2xl:max-w-[1500px] flex-wrap items-center gap-3 rounded-[28px] bg-white px-4 py-2 shadow-soft sm:gap-4 sm:px-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFD54F] text-[#1F3A6B] sm:h-14 sm:w-14">
              <Icon name="museum" size={34} strokeWidth={2.3} />
            </span>
            <h1 className="min-w-0 flex-1 font-display text-2xl font-extrabold leading-tight text-[#16324F] sm:text-4xl">{t('exhibition.title')}</h1>
            <div className="flex w-full flex-nowrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
              <RulesButton className="btn-ghost whitespace-nowrap bg-white px-3 text-sm sm:px-6 sm:text-base [&_svg]:shrink-0" />
              <Link to="/collection?tab=artworks" className="btn-primary whitespace-nowrap px-3 text-sm sm:px-6 sm:text-base [&_svg]:shrink-0" data-testid="go-submit">
                <Icon name="send" size={20} /> {t('exhibition.submitCta')}
              </Link>
              {user?.role === 'admin' && (
                <Link to="/exhibition/review" className="btn-ghost bg-white" aria-label={t('exhibition.review.title')} title={t('exhibition.review.title')}>
                  <Icon name="shield" size={20} />
                </Link>
              )}
              <ScheduleMenu schedule={d.schedule} />
            </div>
          </header>

          <div className="hall-rail" />

          <section className="relative mx-auto my-auto w-full max-w-[1180px] px-2 py-3 lg:max-w-[1420px] lg:px-24 2xl:max-w-[1660px]" data-testid="hall-wall">
            <div className="hall-gallery">
              {renderRow(page, slide ? `hall-out-${slide.dir}` : '')}
              {slide && <div className="hall-row-in">{renderRow(slide.to, `hall-in-${slide.dir}`)}</div>}
            </div>
            {hasPrev && <HallArrow dir="prev" onClick={() => go('prev')} label={t('exhibition.prevPictures')} />}
            {hasNext && <HallArrow dir="next" onClick={() => go('next')} label={t('exhibition.nextPictures')} />}
          </section>

          <div className="relative mx-auto mt-2 w-full max-w-[900px] px-2">
            <RopeLine />
          </div>
          <Plant className="absolute bottom-0 left-2 hidden h-32 w-28 lg:block xl:h-44 xl:w-40" />
          <Plant flip className="absolute bottom-0 right-2 hidden h-32 w-28 lg:block xl:h-44 xl:w-40" />
        </div>

        {/* Sàn gạch */}
        <div className="hall-floor" aria-hidden="true" />
       </div>
        {/* Phần sàn kéo dài xuống đáy khi màn hình cao hơn cảnh */}
        <div className="hall-floor hall-floor-fill" aria-hidden="true" />
      </div>

      {open && <EntryModal entry={open} picture={Object.values(pages).map((v) => v.pictures[open.pictureId]).find(Boolean)} reactionsOpen={d.schedule.reactionsOpen} onClose={() => setOpen(null)} onChange={updateEntry} />}
    </div>
  );
}
