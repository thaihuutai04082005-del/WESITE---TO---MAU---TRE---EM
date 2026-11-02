// Bộ sưu tập: 2 tab — Tranh thẻ hiếm (thẻ đã bóc) và Tranh theo chủ đề (gửi triển lãm, xem thành tích).
import { Fragment, useEffect, useState } from 'react';
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
import { artworkFrameSvg } from '../../lib/frames';

const DEFAULT_FRAME = 'khung-go';
/** Khung Artwork (SVG 700×700, cửa sổ tranh 600×600 ở giữa) phủ lên một ô vuông. */
function FrameOverlay({ slug, className = '' }) {
  const svg = artworkFrameSvg(slug || DEFAULT_FRAME);
  if (!svg) return null;
  return <span className={`frame-overlay ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg.replace('width="700" height="700"', 'width="100%" height="100%"') }} />;
}

/** Tranh đã hoàn thành kèm khung đang chọn (mặc định: khung gỗ). `inset` = lề cửa sổ tranh trong khung (50/700). */
function FramedPicture({ src, frame, dim = false, className = '' }) {
  return (
    <div className={`framed relative aspect-square w-full ${dim ? 'opacity-40' : ''} ${className}`}>
      <span className="framed-in">{src ? <img src={src} alt="" draggable={false} /> : <span className="room-slot-blank" />}</span>
      <FrameOverlay slug={frame} />
    </div>
  );
}

/** Tranh đang ở triển lãm (chờ duyệt, sắp lên hoặc đang trưng bày): mờ đi trong bộ sưu tập. Hết kỳ thì quay về, mang theo thành tích. */
const isHeld = (entry, schedule) => !!entry && (entry.status === 'pending' || (entry.status === 'approved' && entry.roundKey >= schedule.current));

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

/** Tải danh sách tranh đã hoàn thành + tình trạng đi triển lãm (dùng chung cho dạng lưới và dạng phòng). */
function useArtworksData() {
  const { t } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [items, setItems] = useState(null);
  const [ex, setEx] = useState(null);
  const load = () => {
    api.get('/artworks?status=completed&eligibility=1').then((r) => setItems(r.artworks));
    api.get('/exhibition/mine').then(setEx);
  };
  useEffect(load, []);
  /** Gửi thẳng tranh qua triển lãm (không hỏi lại); tranh chưa đạt nội quy thì báo điều nào chưa đạt. */
  async function send(a) {
    try {
      const r = await api.post('/exhibition/entries', { artworkId: a.id });
      toast(r.entry.status === 'approved' ? t('exhibition.sentApproved') : t('exhibition.sentPending'), 'success');
      load();
    } catch (e) {
      if (e.code === 'exhibit_rules') toast(t('exhibition.notYet', { rules: (e.data?.failures || []).join(', ') }), 'error');
      else toast(errorText(t, e), 'error');
    }
  }
  async function withdraw(entry) {
    try {
      await api.del(`/exhibition/entries/${entry.id}`);
      toast(t('exhibition.withdrawn'), 'success');
      load();
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }
  return { items, ex, load, withdraw, send };
}

/** Nút xanh "Gửi tranh triển lãm" — chỉ hiện khi tranh đủ điều kiện và chưa gửi. */
function SendButton({ a, s, full, onSend, className = '', testId }) {
  const { t } = useTranslation();
  const blocked = !s.submitOpen || full;
  return (
    <button
      type="button"
      className={`send-exhibit ${className}`}
      disabled={blocked}
      onClick={(e) => {
        e.stopPropagation();
        onSend(a);
      }}
      title={!s.submitOpen ? t('exhibition.submitOpensShort') : full ? t('errors.exhibit_limit') : ''}
      data-testid={testId || `submit-${a.id}`}
    >
      <Icon name="send" size={16} strokeWidth={2.6} /> {t('exhibition.sendShort')}
    </button>
  );
}

/** Nhãn tình trạng + các nút thao tác của một bức tranh (dùng trong thẻ lưới và hộp chi tiết ở phòng triển lãm). */
function ArtworkControls({ a, entry, s, full, onSend, onWithdraw, onShare }) {
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
        ) : !active && a.exhibitEligible ? (
          <SendButton a={a} s={s} full={full} onSend={onSend} className="w-full" />
        ) : null}
        {entry?.award && <CertificateButton entry={{ ...entry, artworkId: a.id }} className="btn-primary min-h-10 w-full px-2 text-sm" />}
        <button type="button" className="btn-ghost min-h-10 w-full px-2 text-sm" onClick={() => onShare({ artworkId: a.id, entry: entry?.status === 'approved' ? entry : null })} data-testid={`share-${a.id}`}>
          📤 {t('share.button')}
        </button>
      </div>
    </>
  );
}

function ArtworksDialogs({ shareFor, setShareFor }) {
  return shareFor ? <ShareDialog artworkId={shareFor.artworkId} entry={shareFor.entry} onClose={() => setShareFor(null)} /> : null;
}

/** Bảng thông tin triển lãm dùng chung cho cả 2 tab (dạng phòng): số tranh đã gửi, vào hội trường, nội quy, lịch. */
function useExhibitPills(ex, extra) {
  const { t } = useTranslation();
  const [rules, setRules] = useState(false);
  const [sched, setSched] = useState(false);
  const pills = ex && (
    <>
      <span className="room-pill" data-testid="exhibit-quota">{t('exhibition.quota', { used: ex.used, limit: ex.limit })}</span>
      <Link to="/exhibition" className="room-pill room-pill-btn">🏛️ {t('exhibition.visit')}</Link>
      <button type="button" className="room-pill room-pill-btn" onClick={() => setRules(true)} data-testid="open-rules">📜 {t('exhibition.rules.title')}</button>
      <button type="button" className="room-pill room-pill-btn" onClick={() => setSched(true)}>🗓️ {t('collection.schedule')}</button>
      {extra}
    </>
  );
  const modals = (
    <>
      <Modal open={rules} onClose={() => setRules(false)} wide>
        <h2 className="mb-3 font-display text-2xl font-extrabold">📜 {t('exhibition.rules.title')}</h2>
        <ExhibitRules />
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => setRules(false)}>{t('guide.gotIt')}</button>
      </Modal>
      <Modal open={sched} onClose={() => setSched(false)} wide>
        <h2 className="mb-3 font-display text-2xl font-extrabold">🏛️ {t('exhibition.title')}</h2>
        {ex && <ScheduleBanner schedule={ex.schedule} />}
        {ex && ex.limit === 1 && <p className="mt-3 text-sm text-muted">{t('exhibition.premiumMore')}</p>}
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => setSched(false)}>{t('guide.gotIt')}</button>
      </Modal>
    </>
  );
  return { pills, modals };
}

/** Khung thông tin triển lãm ở đầu trang (điện thoại) — hiện ở cả tab Tranh hoàn thành lẫn Thẻ hiếm. */
function ExhibitHeader({ ex, extra }) {
  const { t } = useTranslation();
  return (
    <div className="card space-y-3 bg-gradient-to-br from-[#FFF3D6] to-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 basis-full sm:basis-0 sm:flex-1 font-display text-xl font-bold">🏛️ {t('exhibition.title')}</h2>
        <span className="chip" data-testid="exhibit-quota">{t('exhibition.quota', { used: ex.used, limit: ex.limit })}</span>
        <RulesButton className="btn-ghost min-h-10 bg-white text-base" />
        <Link to="/exhibition" className="btn-ghost min-h-10 bg-white text-base">{t('exhibition.visit')}</Link>
        {extra}
      </div>
      <ScheduleBanner schedule={ex.schedule} />
      {ex.limit === 1 && <p className="text-sm text-muted">{t('exhibition.premiumMore')}</p>}
    </div>
  );
}

function ArtworksTab() {
  const { t, i18n } = useTranslation();
  const { items, ex, withdraw, send } = useArtworksData();
  const [shareFor, setShareFor] = useState(null);

  if (!items || !ex) return <div className="text-center text-muted">{t('common.loading')}</div>;
  const s = ex.schedule;
  const full = ex.used >= ex.limit;

  return (
    <div className="space-y-4">
      <ExhibitHeader ex={ex} />
      {items.length === 0 && <div className="card p-6 text-center text-muted">{t('collection.noArtworks')}</div>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((a) => {
          const entry = ex.entries[a.id];
          return (
            <div key={a.id} className="card flex flex-col gap-2 p-2.5" data-testid={`art-${a.id}`}>
              <FramedPicture src={a.thumbnail} frame={a.frame} dim={isHeld(entry, s)} />
              <div className="truncate text-sm font-bold">{a.name[i18n.language]}</div>
              <ArtworkControls a={a} entry={entry} s={s} full={full} onSend={send} onWithdraw={withdraw} onShare={setShareFor} />
            </div>
          );
        })}
      </div>
      <ArtworksDialogs shareFor={shareFor} setShareFor={setShareFor} />
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
  const [ex, setEx] = useState(null);
  useEffect(() => {
    api.get('/gacha/cards').then(setCol);
    api.get('/exhibition/mine').then(setEx);
  }, []);
  if (!col) return <div className="text-center text-muted">{t('common.loading')}</div>;
  const grouped = groupCards(col);
  const toGacha = (
    <Link to="/gacha" className="btn-ghost min-h-10 bg-white text-base">
      <Icon name="gift" /> {t('collection.toGacha')}
    </Link>
  );
  return (
    <div className="space-y-3">
      {ex ? <ExhibitHeader ex={ex} extra={toGacha} /> : <div className="flex justify-end">{toGacha}</div>}
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

const ROOM_W = 1832;
const ROOM_H = 859;
// Ô xám trong 5 khung treo tường của ảnh phòng (x1, y1, x2, y2 tính theo ảnh 1832×859), xếp theo thứ tự lấp đầy: khung giữa trước, rồi hai bên, rồi hai khung ngoài.
const ROOM_SLOTS = [
  [798, 279, 1033, 510],
  [504, 307, 661, 484],
  [1169, 307, 1326, 484],
  [247, 326, 380, 480],
  [1452, 326, 1588, 480],
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
function RoomShell({ tab, onTab, slots, pills }) {
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
        <span className="room-rope" style={{ left: `${(689 / ROOM_W) * 100}%`, height: `${(112 / ROOM_H) * 100}%` }} />
        <span className="room-rope" style={{ left: `${(1141 / ROOM_W) * 100}%`, height: `${(112 / ROOM_H) * 100}%` }} />
        <div className="room-sign" style={box(627, 101, 579, 103)}>
          <Leaf className="room-leaf room-leaf-l" />
          <h1 className="room-sign-title" data-testid="room-title">{t('collection.roomTitle')}</h1>
          <Leaf className="room-leaf room-leaf-r" />
        </div>
        <Link to="/" className="room-back" style={box(40, 30, 202, 66)} data-testid="room-back">
          <Icon name="back" size={20} strokeWidth={3} /> {t('common.back')}
        </Link>

        {ROOM_SLOTS.map(([x1, y1, x2, y2], i) => {
          const it = shown[i];
          // Cửa sổ tranh = ô vuông lớn nhất nằm trong ô xám, khung (700/600 cửa sổ) vẽ quanh nó. Ô trống vẫn treo khung gỗ rỗng.
          const side = Math.min(x2 - x1, y2 - y1);
          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2;
          const full = (side * 700) / 600;
          const geo = box(cx - full / 2, cy - full / 2, full, full);
          const body = (
            <>
              <span className="room-slot-in">{it ? it.content : <span className="room-slot-blank" />}</span>
              <FrameOverlay slug={it?.frame} />
              {it?.badge && <span className="room-slot-badge" aria-hidden="true">{it.badge}</span>}
            </>
          );
          const sendPos = it?.sendBtn ? { left: `${(cx / ROOM_W) * 100}%`, top: `${((cy + full / 2 - 6) / ROOM_H) * 100}%` } : null;
          return it ? (
            <Fragment key={it.key}>
              <button type="button" className={`room-slot${it.dim ? ' room-slot-dim' : ''}`} style={geo} onClick={it.onClick} aria-label={it.label} title={it.label} data-testid={it.testId}>
                {body}
              </button>
              {sendPos && <div className="room-send-wrap" style={sendPos}>{it.sendBtn}</div>}
            </Fragment>
          ) : (
            <div key={`empty-${i}`} className="room-slot room-slot-empty" style={geo} aria-hidden="true">{body}</div>
          );
        })}

        <div className="room-nav" style={box(330, 574, 1172, 76)}>
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

        <div className="room-pills" style={box(1196, 84, 480, 130)}>{pills}</div>
      </div>
    </div>
  );
}

function RoomArtworks({ onTab }) {
  const { t, i18n } = useTranslation();
  const { items, ex, withdraw, send } = useArtworksData();
  const [open, setOpen] = useState(null);
  const [shareFor, setShareFor] = useState(null);
  const ready = items && ex;
  const s = ex?.schedule;
  const full = ready && ex.used >= ex.limit;
  const { pills, modals } = useExhibitPills(ex);
  const slots = (items || []).map((a) => {
    const e = ready ? ex.entries[a.id] : null;
    const active = e && ['pending', 'approved', 'removed'].includes(e.status);
    return {
      key: a.id,
      label: a.name[i18n.language],
      testId: `art-${a.id}`,
      onClick: () => setOpen(a),
      badge: ready ? entryEmoji(e, s) : null,
      dim: ready && isHeld(e, s),
      frame: a.frame, // tranh treo tường dùng đúng khung bé đã chọn (mặc định: khung gỗ)
      content: a.thumbnail ? <img src={a.thumbnail} alt="" draggable={false} /> : <span className="room-slot-blank" />,
      // Đủ điều kiện triển lãm thì nút gửi hiện ngay dưới khung tranh.
      sendBtn: ready && a.exhibitEligible && !active ? <SendButton a={a} s={s} full={full} onSend={send} className="room-send" /> : null,
    };
  });
  const entry = open && ready ? ex.entries[open.id] : null;
  return (
    <>
      <RoomShell tab="artworks" onTab={onTab} slots={slots} pills={pills} />
      {modals}
      {open && ready && (
        <Modal open onClose={() => setOpen(null)}>
          <div className="flex flex-col gap-3" data-testid="room-art-dialog">
            <FramedPicture src={open.thumbnail} frame={open.frame} dim={isHeld(entry, s)} />
            <div className="font-display text-xl font-extrabold">{open.name[i18n.language]}</div>
            <ArtworkControls
              a={open}
              entry={entry}
              s={s}
              full={full}
              onSend={(a) => {
                setOpen(null);
                send(a);
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
      <ArtworksDialogs shareFor={shareFor} setShareFor={setShareFor} />
    </>
  );
}

function RoomCards({ onTab }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [col, setCol] = useState(null);
  const [ex, setEx] = useState(null);
  useEffect(() => {
    api.get('/gacha/cards').then(setCol);
    api.get('/exhibition/mine').then(setEx);
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
  const { pills, modals } = useExhibitPills(
    ex,
    <Link to="/gacha" className="room-pill room-pill-btn">🎁 {t('collection.toGacha')}</Link>,
  );
  return (
    <>
      <RoomShell tab="cards" onTab={onTab} slots={slots} pills={pills || <Link to="/gacha" className="room-pill room-pill-btn">🎁 {t('collection.toGacha')}</Link>} />
      {modals}
    </>
  );
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
