// Thành phần dùng chung của Hội trường triển lãm: ảnh tranh vẽ lại từ dữ liệu, khung tranh theo phòng,
// nội quy dành cho bé, bảng xem tranh + thả cảm xúc.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useUi } from '../store/ui';
import { errorText } from '../lib/format';
import { renderArtwork } from '../lib/exportImage';
import { REACTIONS, boardMeta } from '../lib/exhibition';
import Avatar from './Avatar/Avatar';
import Modal from './Modal/Modal';
import Icon from './Icon';

const cache = new Map();

/** Tranh vẽ lại từ dữ liệu tô (màu vùng, nét cọ, sticker, chữ ký). */
export function ArtworkImage({ cacheKey, picture, data, size = 480, className = '' }) {
  const key = `${cacheKey}:${size}`;
  const [url, setUrl] = useState(() => cache.get(key) || null);
  useEffect(() => {
    if (cache.has(key) || !picture?.svg) return;
    let alive = true;
    renderArtwork(picture, data, { size })
      .then((u) => {
        cache.set(key, u);
        if (alive) setUrl(u);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key, picture, data, size]);
  return url ? <img src={url} alt="" className={`block aspect-square w-full ${className}`} /> : <div className={`aspect-square w-full animate-pulse bg-primary-light ${className}`} />;
}

/** Khung tranh treo tường: vàng (S), bạc (A), gỗ (B), tím (Sáng tạo) + ruy băng danh hiệu. */
export function FramedArtwork({ entry, picture, onClick, size = 360 }) {
  const { t, i18n } = useTranslation();
  const b = boardMeta(entry.board);
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-2 text-left" data-testid={`entry-${entry.id}`}>
      <div className="relative w-full rounded-xl p-2.5 shadow-pop transition group-hover:-translate-y-1" style={{ background: `linear-gradient(145deg, ${b.frame}, ${b.frameLight} 45%, ${b.frame})` }}>
        <div className="rounded-md bg-white p-1.5 shadow-inner">
          <ArtworkImage cacheKey={`e${entry.id}`} picture={picture} data={entry.data} size={size} className="rounded" />
        </div>
        {entry.award && (
          <span className="absolute -right-2 -top-3 rounded-full bg-coral px-2.5 py-1 text-xs font-extrabold text-white shadow-soft" title={t('exhibition.award')}>
            🏆 {t('exhibition.awardShort')}
          </span>
        )}
      </div>
      <div className="w-full rounded-lg bg-white/90 px-2 py-1 text-center shadow-soft">
        <div className="truncate text-sm font-bold">{entry.name[i18n.language]}</div>
        <div className="truncate text-xs text-muted">{entry.author.nickname}</div>
      </div>
    </button>
  );
}

const RULES = [
  ['✍️', 1],
  ['✅', 2],
  ['🃏', 3],
  ['🔁', 4],
  ['🎨', 5],
  ['😊', 6],
  ['🔤', 7],
  ['🖍️', 8],
];

/** Nội quy triển lãm — bản dành cho bé. `highlight`: các điều đang chưa đạt. */
export function ExhibitRules({ highlight = [] }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3" data-testid="exhibit-rules">
      <p className="rounded-2xl bg-primary-light p-3 font-bold text-primary-dark">🐻 {t('exhibition.rules.intro')}</p>
      <ol className="space-y-2">
        {RULES.map(([icon, n]) => (
          <li key={n} className={`flex gap-3 rounded-2xl border-2 p-2.5 ${highlight.includes(n) ? 'border-coral bg-coral/10' : 'border-line'}`}>
            <span className="text-2xl leading-none">{icon}</span>
            <span>
              <b>
                {n}. {t(`exhibition.rules.r${n}.title`)}
              </b>{' '}
              <span className="text-muted">{t(`exhibition.rules.r${n}.text`)}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-center text-sm font-bold text-muted">📅 {t('exhibition.rules.when')}</p>
    </div>
  );
}

export function RulesButton({ className = 'btn-ghost' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} data-testid="open-rules">
        <Icon name="book" size={20} /> {t('exhibition.rules.title')}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} wide>
        <h2 className="mb-3 font-display text-2xl font-extrabold">📜 {t('exhibition.rules.title')}</h2>
        <ExhibitRules />
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => setOpen(false)}>
          {t('guide.gotIt')}
        </button>
      </Modal>
    </>
  );
}

/** Xem tranh phóng to + thả cảm xúc + báo cho Gấu. */
export function EntryModal({ entry, picture, reactionsOpen, onClose, onChange }) {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const [confirmReport, setConfirmReport] = useState(false);
  if (!entry) return null;
  const b = boardMeta(entry.board);
  const canReact = reactionsOpen && !entry.own && !entry.final;

  async function react(key) {
    if (!canReact || busy) return;
    setBusy(true);
    try {
      const r = await api.put(`/exhibition/entries/${entry.id}/reaction`, { emoji: entry.mine === key ? null : key });
      onChange?.({ ...entry, reactions: r.counts, mine: r.mine, total: Object.values(r.counts).reduce((a, c) => a + c, 0) });
    } catch (e) {
      toast(errorText(t, e), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    try {
      await api.post(`/exhibition/entries/${entry.id}/report`);
      toast(t('exhibition.reported'), 'success');
      setConfirmReport(false);
    } catch (e) {
      toast(errorText(t, e), 'error');
    }
  }

  return (
    <Modal open onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]" data-testid="entry-modal">
        <div className="rounded-2xl p-3" style={{ background: `linear-gradient(145deg, ${b.frame}, ${b.frameLight} 45%, ${b.frame})` }}>
          <div className="rounded-lg bg-white p-2">
            <ArtworkImage cacheKey={`e${entry.id}`} picture={picture} data={entry.data} size={720} className="rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-sm font-bold" style={{ color: b.frame }}>
              {b.icon} {t(`exhibition.boards.${entry.board}`)}
            </div>
            <h2 className="font-display text-2xl font-extrabold leading-tight">{entry.name[i18n.language]}</h2>
            {entry.award && <div className="mt-1 inline-block rounded-full bg-coral px-3 py-1 text-sm font-extrabold text-white">🏆 {t('exhibition.award')}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Avatar avatar={entry.author.avatar} frame={entry.author.avatarFrame} size={44} />
            <div>
              <div className="text-xs text-muted">{t('exhibition.by')}</div>
              <div className="font-bold">{entry.author.nickname}</div>
            </div>
          </div>
          {/* Không bao giờ hiện "0 cảm xúc": Gấu luôn khen trước. */}
          {entry.total === 0 && <p className="rounded-2xl bg-primary-light p-2.5 text-sm font-bold text-primary-dark">🐻 {t('exhibition.mascotPraise')}</p>}
          <div className="grid grid-cols-5 gap-1.5">
            {REACTIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => react(r.key)}
                disabled={!canReact || busy}
                aria-pressed={entry.mine === r.key}
                title={t(`exhibition.reactions.${r.key}`)}
                data-testid={`react-${r.key}`}
                className={`flex flex-col items-center rounded-2xl border-2 px-1 py-1.5 transition enabled:hover:-translate-y-0.5 ${entry.mine === r.key ? 'border-primary bg-primary-light' : 'border-line bg-white'} disabled:cursor-default`}
              >
                <span className="text-2xl leading-none">{r.emoji}</span>
                <span className="text-xs font-extrabold">{entry.reactions[r.key] || ''}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs font-bold text-muted">
            {entry.own ? t('exhibition.ownHint') : !reactionsOpen || entry.final ? t('exhibition.lockedHint') : entry.mine ? t('exhibition.changeHint') : t('exhibition.reactHint')}
          </p>
          {!entry.own && reactionsOpen && !entry.final && (
            <div className="mt-auto text-center">
              {confirmReport ? (
                <div className="space-y-2 rounded-2xl bg-line/40 p-2 text-sm">
                  <p>{t('exhibition.reportConfirm')}</p>
                  <div className="flex gap-2">
                    <button type="button" className="btn-ghost flex-1 min-h-10 text-sm" onClick={() => setConfirmReport(false)}>{t('common.cancel')}</button>
                    <button type="button" className="btn-danger flex-1 min-h-10 text-sm" onClick={report}>{t('exhibition.report')}</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="text-xs font-bold text-muted underline" onClick={() => setConfirmReport(true)} data-testid="report">
                  🚩 {t('exhibition.report')}
                </button>
              )}
            </div>
          )}
          <button type="button" className="btn-ghost" onClick={onClose}>
            <Icon name="close" /> {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
