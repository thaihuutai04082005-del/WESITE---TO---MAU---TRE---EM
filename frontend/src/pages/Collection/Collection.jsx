// Bộ sưu tập: 2 tab — Thẻ hiếm (thẻ đã bóc) và Tranh đã hoàn thành (gửi triển lãm, xem thành tích).
import { useEffect, useState } from 'react';
import PictureView from '../../components/PictureView/PictureView';
import { usePicture } from '../../hooks/usePicture';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useUi } from '../../store/ui';
import { errorText, formatVnTime } from '../../lib/format';
import { REACTIONS } from '../../lib/exhibition';
import { CardTile } from '../Gacha/Gacha';
import { ExhibitRules, RulesButton } from '../../components/Exhibition';
import { ScheduleBanner } from '../Exhibition/Hall';
import { CertificateButton, ShareDialog } from '../../components/Share';
import Modal from '../../components/Modal/Modal';
import Icon from '../../components/Icon';

const RULES_OK_KEY = 'btm.exhibitRulesOk';
const readRulesOk = () => {
  try {
    return localStorage.getItem(RULES_OK_KEY) === '1';
  } catch {
    return false;
  }
};

/** Tranh này thuộc loại được đi triển lãm không (điều 3): thẻ hiếm S/A/B hoặc tranh Sáng tạo. */
const exhibitType = (a) => a.mode === 'free' && (!a.isCard || ['S', 'A', 'B'].includes(a.rarity));

function EntryBadge({ entry, schedule }) {
  const { t, i18n } = useTranslation();
  if (!entry || entry.status === 'withdrawn') return null;
  const done = entry.status === 'approved' && entry.roundKey < schedule.current;
  const showing = entry.status === 'approved' && entry.roundKey === schedule.current;
  const [cls, text] =
    entry.status === 'pending'
      ? ['bg-sun/30 text-ink', `⏳ ${t('exhibition.status.pending')}`]
      : entry.status === 'rejected'
        ? ['bg-coral/20 text-ink', `🙈 ${t('exhibition.status.rejected', { rule: entry.rejectRule })}`]
        : entry.status === 'removed'
          ? ['bg-line text-muted', t('exhibition.status.removed')]
          : showing
            ? ['bg-mint/25 text-ink', `🏛️ ${t('exhibition.status.showing')}`]
            : done
              ? ['bg-primary-light text-primary-dark', `🏅 ${t('exhibition.status.done')}`]
              : ['bg-mint/25 text-ink', `✅ ${t('exhibition.status.approved', { date: formatVnTime(`${entry.roundKey}T12:00:00Z`, i18n.language, { time: false }) })}`];
  return (
    <div className="space-y-1">
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-extrabold ${cls}`} data-testid={`badge-${entry.artworkId}`}>
        {text}
      </span>
      {entry.award && <span className="ml-1 inline-block rounded-full bg-coral px-2 py-0.5 text-xs font-extrabold text-white">🏆 {t('exhibition.awardShort')}</span>}
      {(showing || done) && (
        <div className="flex flex-wrap gap-1 text-xs font-bold">
          {REACTIONS.filter((r) => entry.reactions[r.key]).map((r) => (
            <span key={r.key}>
              {r.emoji}
              {entry.reactions[r.key]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SubmitDialog({ artwork, schedule, onClose, onDone }) {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [agree, setAgree] = useState(readRulesOk());
  const [failures, setFailures] = useState([]);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const r = await api.post('/exhibition/entries', { artworkId: artwork.id });
      try {
        localStorage.setItem(RULES_OK_KEY, '1');
      } catch {
        // bỏ qua
      }
      toast(r.entry.status === 'approved' ? t('exhibition.sentApproved') : t('exhibition.sentPending'), 'success');
      onDone();
    } catch (e) {
      if (e.code === 'exhibit_rules') setFailures(e.data?.failures || []);
      else toast(errorText(t, e), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} wide>
      <div className="space-y-4" data-testid="submit-dialog">
        <div className="flex items-center gap-3">
          {artwork.thumbnail && <img src={artwork.thumbnail} alt="" className="h-20 w-20 rounded-2xl border-2 border-line" />}
          <div>
            <h2 className="font-display text-2xl font-extrabold">🏛️ {t('exhibition.submitTitle')}</h2>
            <p className="font-bold">{artwork.name[i18n.language]}</p>
          </div>
        </div>
        {failures.length > 0 ? (
          <p className="rounded-2xl bg-coral/15 p-3 font-bold" data-testid="submit-failures">
            🐻 {t('exhibition.notYet', { rules: failures.join(', ') })}
          </p>
        ) : (
          <p className="rounded-2xl bg-primary-light p-3 text-sm font-bold text-primary-dark">
            {t('exhibition.submitNote', { date: formatVnTime(schedule.nextRoundStart, i18n.language, { time: false }) })}
          </p>
        )}
        <ExhibitRules highlight={failures} />
        {!readRulesOk() && (
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" className="h-5 w-5 accent-primary" checked={agree} onChange={(e) => setAgree(e.target.checked)} data-testid="rules-agree" />
            {t('exhibition.readRules')}
          </label>
        )}
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn-coral flex-1" disabled={!agree || busy} onClick={send} data-testid="submit-send">
            🏛️ {t('exhibition.send')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Tải danh sách tranh đã hoàn thành + tình trạng đi triển lãm (dùng chung cho dạng lưới và dạng phòng). */
function useArtworksData() {
  const { t } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [items, setItems] = useState(null);
  const [ex, setEx] = useState(null);
  const load = () => {
    api.get('/artworks?status=completed').then((r) => setItems(r.artworks));
    api.get('/exhibition/mine').then(setEx);
  };
  useEffect(load, []);
  async function withdraw(entry) {
    try {
      await api.del(`/exhibition/entries/${entry.id}`);
      toast(t('exhibition.withdrawn'), 'success');
      load();
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }
  return { items, ex, load, withdraw };
}

/** Nhãn tình trạng + các nút thao tác của một bức tranh (dùng trong thẻ lưới và hộp chi tiết ở phòng triển lãm). */
function ArtworkControls({ a, entry, s, full, onSubmit, onWithdraw, onShare }) {
  const { t } = useTranslation();
  const active = entry && ['pending', 'approved', 'removed'].includes(entry.status);
  const canWithdraw = entry && ['pending', 'approved'].includes(entry.status) && entry.roundKey === s.nextRound && s.submitOpen;
  return (
    <>
      <EntryBadge entry={entry} schedule={s} />
      <div className="mt-auto space-y-1.5">
        {canWithdraw ? (
          <button type="button" className="btn-ghost min-h-10 w-full text-sm" onClick={() => onWithdraw(entry)} data-testid={`withdraw-${a.id}`}>
            {t('exhibition.withdraw')}
          </button>
        ) : active ? null : exhibitType(a) ? (
          <button
            type="button"
            className="btn-coral min-h-10 w-full px-2 text-sm"
            disabled={!s.submitOpen || full}
            onClick={() => onSubmit(a)}
            title={!s.submitOpen ? t('exhibition.submitOpensShort') : full ? t('errors.exhibit_limit') : ''}
            data-testid={`submit-${a.id}`}
          >
            🏛️ {!s.submitOpen ? t('exhibition.submitOpensShort') : full ? t('exhibition.full') : t('exhibition.send')}
          </button>
        ) : (
          <p className="text-center text-xs text-muted">{t('exhibition.notType')}</p>
        )}
        {entry?.award && <CertificateButton entry={{ ...entry, artworkId: a.id }} className="btn-primary min-h-10 w-full px-2 text-sm" />}
        <button type="button" className="btn-ghost min-h-10 w-full px-2 text-sm" onClick={() => onShare({ artworkId: a.id, entry: entry?.status === 'approved' ? entry : null })} data-testid={`share-${a.id}`}>
          📤 {t('share.button')}
        </button>
      </div>
    </>
  );
}

function ArtworksDialogs({ ex, load, submitFor, setSubmitFor, shareFor, setShareFor }) {
  return (
    <>
      {shareFor && <ShareDialog artworkId={shareFor.artworkId} entry={shareFor.entry} onClose={() => setShareFor(null)} />}
      {submitFor && (
        <SubmitDialog
          artwork={submitFor}
          schedule={ex.schedule}
          onClose={() => setSubmitFor(null)}
          onDone={() => {
            setSubmitFor(null);
            load();
          }}
        />
      )}
    </>
  );
}

function ArtworksTab() {
  const { t, i18n } = useTranslation();
  const { items, ex, load, withdraw } = useArtworksData();
  const [submitFor, setSubmitFor] = useState(null);
  const [shareFor, setShareFor] = useState(null);

  if (!items || !ex) return <div className="text-center text-muted">{t('common.loading')}</div>;
  const s = ex.schedule;
  const full = ex.used >= ex.limit;

  return (
    <div className="space-y-4">
      <div className="card space-y-3 bg-gradient-to-br from-[#FFF3D6] to-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 flex-1 font-display text-xl font-bold">🏛️ {t('exhibition.title')}</h2>
          <span className="chip" data-testid="exhibit-quota">{t('exhibition.quota', { used: ex.used, limit: ex.limit })}</span>
          <RulesButton className="btn-ghost min-h-10 bg-white text-base" />
          <Link to="/exhibition" className="btn-ghost min-h-10 bg-white text-base">{t('exhibition.visit')}</Link>
        </div>
        <ScheduleBanner schedule={s} />
        {ex.limit === 1 && <p className="text-sm text-muted">{t('exhibition.premiumMore')}</p>}
      </div>

      {items.length === 0 && <div className="card p-6 text-center text-muted">{t('collection.noArtworks')}</div>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((a) => {
          const entry = ex.entries[a.id];
          return (
            <div key={a.id} className="card flex flex-col gap-2 p-2.5" data-testid={`art-${a.id}`}>
              {a.thumbnail ? <img src={a.thumbnail} alt="" className="aspect-square w-full rounded-2xl border border-line" /> : <div className="aspect-square rounded-2xl bg-primary-light" />}
              <div className="truncate text-sm font-bold">{a.name[i18n.language]}</div>
              <ArtworkControls a={a} entry={entry} s={s} full={full} onSubmit={setSubmitFor} onWithdraw={withdraw} onShare={setShareFor} />
            </div>
          );
        })}
      </div>
      <ArtworksDialogs ex={ex} load={load} submitFor={submitFor} setSubmitFor={setSubmitFor} shareFor={shareFor} setShareFor={setShareFor} />
    </div>
  );
}

function groupCards(col) {
  return Object.values(
    col.cards.reduce((acc, c) => {
      acc[c.pictureId] ||= { ...c, count: 0 };
      acc[c.pictureId].count++;
      return acc;
    }, {}),
  );
}

function CardsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [col, setCol] = useState(null);
  useEffect(() => {
    api.get('/gacha/cards').then(setCol);
  }, []);
  if (!col) return <div className="text-center text-muted">{t('common.loading')}</div>;
  const grouped = groupCards(col);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-muted">
          {col.distinct}/{col.total}
        </p>
        <Link to="/gacha" className="btn-ghost min-h-10 text-base">
          <Icon name="gift" /> {t('collection.toGacha')}
        </Link>
      </div>
      {grouped.length === 0 && <div className="card p-6 text-center text-muted">{t('gacha.empty')}</div>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {grouped.map((c) => (
          <CardTile key={c.pictureId} card={c} onClick={() => navigate('/gacha')} />
        ))}
      </div>
    </div>
  );
}

/* ===================== Phòng triển lãm hiện đại (màn hình rộng) ===================== */

const ROOM_W = 1828;
const ROOM_H = 860;
// Ô xám trong 8 khung treo tường của ảnh phòng (x1, y1, x2, y2 tính theo ảnh 1828×860), xếp theo thứ tự lấp đầy: khung giữa trước.
const ROOM_SLOTS = [
  [799, 316, 1051, 530],
  [530, 262, 646, 398],
  [1207, 270, 1324, 411],
  [273, 406, 412, 535],
  [1470, 225, 1592, 358],
  [534, 497, 675, 596],
  [1415, 443, 1523, 578],
  [298, 229, 373, 315],
];
const SLOT_PAD = 10;
const box = (x, y, w, h) => ({ left: `${(x / ROOM_W) * 100}%`, top: `${(y / ROOM_H) * 100}%`, width: `${(w / ROOM_W) * 100}%`, height: `${(h / ROOM_H) * 100}%` });

function useWide() {
  const q = '(min-width: 900px)';
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}

function Leaf({ className }) {
  return (
    <svg viewBox="0 0 40 34" className={className} aria-hidden="true">
      <path d="M20 32 C8 30 2 20 4 6 C16 6 24 12 24 24 Z" fill="#5DB846" stroke="#2F7A27" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M22 32 C20 20 26 10 38 6 C40 20 34 30 22 32 Z" fill="#7BCB54" stroke="#2F7A27" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Biểu tượng nhỏ ở góc khung cho biết tranh đang ở đâu trong hành trình triển lãm. */
function entryEmoji(entry, schedule) {
  if (!entry || ['withdrawn', 'removed', 'rejected'].includes(entry.status)) return null;
  if (entry.status === 'pending') return '⏳';
  if (entry.roundKey < schedule.current) return '🏅';
  return entry.roundKey === schedule.current ? '🏛️' : '✅';
}

function CardInSlot({ card }) {
  const pic = usePicture(card.pictureId);
  return (
    <>
      {pic && <PictureView picture={pic} className="h-full w-full" />}
      {card.count > 1 && <span className="room-slot-count">×{card.count}</span>}
    </>
  );
}

/** Khung cảnh phòng: nền ảnh, biển treo, nút Quay lại, hai tab, phân trang và 8 khung tranh. */
function RoomShell({ tab, onTab, slots, pills, loading, emptyText }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const per = ROOM_SLOTS.length;
  const pages = Math.max(1, Math.ceil(slots.length / per));
  useEffect(() => setPage(0), [tab]);
  const cur = Math.min(page, pages - 1);
  const shown = slots.slice(cur * per, cur * per + per);
  const tabs = [
    ['cards', '🃏', t('collection.cards')],
    ['artworks', '🖼️', t('collection.artworks')],
  ];
  return (
    <div className="room" data-testid="collection-room">
      <div className="room-stage">
        <span className="room-rope" style={{ left: `${(700 / ROOM_W) * 100}%`, height: `${(100 / ROOM_H) * 100}%` }} />
        <span className="room-rope" style={{ left: `${(1141 / ROOM_W) * 100}%`, height: `${(100 / ROOM_H) * 100}%` }} />
        <div className="room-sign" style={box(612, 92, 645, 111)}>
          <Leaf className="room-leaf room-leaf-l" />
          <h1 className="room-sign-title" data-testid="room-title">{t('collection.roomTitle')}</h1>
          <Leaf className="room-leaf room-leaf-r" />
        </div>
        <Link to="/" className="room-back" style={box(27, 25, 205, 67)} data-testid="room-back">
          <Icon name="back" size={20} strokeWidth={3} /> {t('common.back')}
          <Leaf className="room-leaf room-back-leaf" />
        </Link>

        {ROOM_SLOTS.map(([x1, y1, x2, y2], i) => {
          const it = shown[i];
          const geo = box(x1 - SLOT_PAD, y1 - SLOT_PAD, x2 - x1 + 2 * SLOT_PAD, y2 - y1 + 2 * SLOT_PAD);
          return it ? (
            <button key={it.key} type="button" className="room-slot" style={geo} onClick={it.onClick} aria-label={it.label} title={it.label} data-testid={it.testId}>
              <span className="room-slot-in">{it.content}</span>
              {it.badge && <span className="room-slot-badge" aria-hidden="true">{it.badge}</span>}
            </button>
          ) : null;
        })}
        {!loading && slots.length === 0 && <p className="room-empty" style={box(520, 560, 780, 70)}>{emptyText}</p>}

        <div className="room-nav" style={box(300, 618, 1210, 74)}>
          <button type="button" className="room-arrow" disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label={t('common.back')} data-testid="room-prev">
            <Icon name="back" size={22} strokeWidth={3.4} />
          </button>
          <div className="room-tabs" role="tablist">
            {tabs.map(([k, icon, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={`room-tab${tab === k ? ' room-tab-on' : ''}`} onClick={() => onTab(k)} data-testid={`col-tab-${k}`}>
                <span aria-hidden="true">{icon}</span> {label}
              </button>
            ))}
          </div>
          <button type="button" className="room-arrow" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} aria-label={t('common.next', { defaultValue: 'Tiếp' })} data-testid="room-next">
            <Icon name="chevronRight" size={22} strokeWidth={3.4} />
          </button>
          {pages > 1 && <span className="room-page" data-testid="room-page">{cur + 1}/{pages}</span>}
        </div>

        <div className="room-pills" style={box(1230, 92, 470, 100)}>{pills}</div>
      </div>
    </div>
  );
}

function RoomArtworks({ onTab }) {
  const { t, i18n } = useTranslation();
  const { items, ex, load, withdraw } = useArtworksData();
  const [open, setOpen] = useState(null);
  const [submitFor, setSubmitFor] = useState(null);
  const [shareFor, setShareFor] = useState(null);
  const [rules, setRules] = useState(false);
  const [sched, setSched] = useState(false);
  const ready = items && ex;
  const s = ex?.schedule;
  const full = ready && ex.used >= ex.limit;
  const slots = (items || []).map((a) => ({
    key: a.id,
    label: a.name[i18n.language],
    testId: `art-${a.id}`,
    onClick: () => setOpen(a),
    badge: ready ? entryEmoji(ex.entries[a.id], s) : null,
    content: a.thumbnail ? <img src={a.thumbnail} alt="" draggable={false} /> : <span className="room-slot-blank" />,
  }));
  const pills = ready && (
    <>
      <span className="room-pill" data-testid="exhibit-quota">{t('exhibition.quota', { used: ex.used, limit: ex.limit })}</span>
      <Link to="/exhibition" className="room-pill room-pill-btn">🏛️ {t('exhibition.visit')}</Link>
      <button type="button" className="room-pill room-pill-btn" onClick={() => setRules(true)} data-testid="open-rules">📜 {t('exhibition.rules.title')}</button>
      <button type="button" className="room-pill room-pill-btn" onClick={() => setSched(true)}>🗓️ {t('collection.schedule')}</button>
    </>
  );
  const entry = open && ready ? ex.entries[open.id] : null;
  return (
    <>
      <RoomShell tab="artworks" onTab={onTab} slots={slots} pills={pills} loading={!ready} emptyText={t('collection.noArtworks')} />
      <Modal open={rules} onClose={() => setRules(false)} wide>
        <h2 className="mb-3 font-display text-2xl font-extrabold">📜 {t('exhibition.rules.title')}</h2>
        <ExhibitRules />
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => setRules(false)}>{t('guide.gotIt')}</button>
      </Modal>
      <Modal open={sched} onClose={() => setSched(false)} wide>
        <h2 className="mb-3 font-display text-2xl font-extrabold">🏛️ {t('exhibition.title')}</h2>
        {ready && <ScheduleBanner schedule={s} />}
        {ready && ex.limit === 1 && <p className="mt-3 text-sm text-muted">{t('exhibition.premiumMore')}</p>}
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => setSched(false)}>{t('guide.gotIt')}</button>
      </Modal>
      {open && ready && (
        <Modal open onClose={() => setOpen(null)}>
          <div className="flex flex-col gap-3" data-testid="room-art-dialog">
            {open.thumbnail ? <img src={open.thumbnail} alt="" className="aspect-square w-full rounded-2xl border border-line" /> : <div className="aspect-square rounded-2xl bg-primary-light" />}
            <div className="font-display text-xl font-extrabold">{open.name[i18n.language]}</div>
            <ArtworkControls
              a={open}
              entry={entry}
              s={s}
              full={full}
              onSubmit={(a) => {
                setOpen(null);
                setSubmitFor(a);
              }}
              onWithdraw={async (e) => {
                await withdraw(e);
                setOpen(null);
              }}
              onShare={(v) => {
                setOpen(null);
                setShareFor(v);
              }}
            />
            <button type="button" className="btn-ghost min-h-10 w-full text-sm" onClick={() => setOpen(null)}>{t('common.close', { defaultValue: 'Đóng' })}</button>
          </div>
        </Modal>
      )}
      {ready && <ArtworksDialogs ex={ex} load={load} submitFor={submitFor} setSubmitFor={setSubmitFor} shareFor={shareFor} setShareFor={setShareFor} />}
    </>
  );
}

function RoomCards({ onTab }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [col, setCol] = useState(null);
  useEffect(() => {
    api.get('/gacha/cards').then(setCol);
  }, []);
  const grouped = col ? groupCards(col) : [];
  const slots = grouped.map((c) => ({
    key: c.pictureId,
    label: c.name[i18n.language],
    testId: `card-${c.pictureId}`,
    onClick: () => navigate('/gacha'),
    badge: c.rarity,
    content: <CardInSlot card={c} />,
  }));
  const pills = col && (
    <>
      <span className="room-pill">{col.distinct}/{col.total}</span>
      <Link to="/gacha" className="room-pill room-pill-btn">🎁 {t('collection.toGacha')}</Link>
    </>
  );
  return <RoomShell tab="cards" onTab={onTab} slots={slots} pills={pills} loading={!col} emptyText={t('gacha.empty')} />;
}

export default function Collection() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const wide = useWide();
  const tab = params.get('tab') === 'artworks' ? 'artworks' : 'cards';
  if (wide) return tab === 'cards' ? <RoomCards onTab={(k) => setParams({ tab: k })} /> : <RoomArtworks onTab={(k) => setParams({ tab: k })} />;
  return (
    <div className="page space-y-5">
      <h1 className="page-title">{t('collection.title')}</h1>
      <div className="flex gap-2 rounded-2xl bg-primary-light p-1">
        {[
          ['cards', `🃏 ${t('collection.cards')}`],
          ['artworks', `🖼️ ${t('collection.artworks')}`],
        ].map(([k, label]) => (
          <button key={k} type="button" onClick={() => setParams({ tab: k })} className={`flex-1 rounded-xl px-3 py-2 font-display text-lg font-bold transition ${tab === k ? 'bg-white text-primary-dark shadow-soft' : 'text-primary-dark/70'}`} data-testid={`col-tab-${k}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'cards' ? <CardsTab /> : <ArtworksTab />}
    </div>
  );
}
