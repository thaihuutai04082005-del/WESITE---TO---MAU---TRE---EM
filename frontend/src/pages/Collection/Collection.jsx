// Bộ sưu tập: 2 tab — Thẻ hiếm (thẻ đã bóc) và Tranh đã hoàn thành (gửi triển lãm, xem thành tích).
import { useEffect, useState } from 'react';
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

function ArtworksTab() {
  const { t, i18n } = useTranslation();
  const toast = useUi((s) => s.toast);
  const [items, setItems] = useState(null);
  const [ex, setEx] = useState(null);
  const [submitFor, setSubmitFor] = useState(null);
  const [shareFor, setShareFor] = useState(null);

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
          const active = entry && ['pending', 'approved', 'removed'].includes(entry.status);
          const canWithdraw = entry && ['pending', 'approved'].includes(entry.status) && entry.roundKey === s.nextRound && s.submitOpen;
          return (
            <div key={a.id} className="card flex flex-col gap-2 p-2.5" data-testid={`art-${a.id}`}>
              {a.thumbnail ? <img src={a.thumbnail} alt="" className="aspect-square w-full rounded-2xl border border-line" /> : <div className="aspect-square rounded-2xl bg-primary-light" />}
              <div className="truncate text-sm font-bold">{a.name[i18n.language]}</div>
              <EntryBadge entry={entry} schedule={s} />
              <div className="mt-auto space-y-1.5">
                {canWithdraw ? (
                  <button type="button" className="btn-ghost min-h-10 w-full text-sm" onClick={() => withdraw(entry)} data-testid={`withdraw-${a.id}`}>
                    {t('exhibition.withdraw')}
                  </button>
                ) : active ? null : exhibitType(a) ? (
                  <button
                    type="button"
                    className="btn-coral min-h-10 w-full px-2 text-sm"
                    disabled={!s.submitOpen || full}
                    onClick={() => setSubmitFor(a)}
                    title={!s.submitOpen ? t('exhibition.submitOpensShort') : full ? t('errors.exhibit_limit') : ''}
                    data-testid={`submit-${a.id}`}
                  >
                    🏛️ {!s.submitOpen ? t('exhibition.submitOpensShort') : full ? t('exhibition.full') : t('exhibition.send')}
                  </button>
                ) : (
                  <p className="text-center text-xs text-muted">{t('exhibition.notType')}</p>
                )}
                {entry?.award && <CertificateButton entry={{ ...entry, artworkId: a.id }} className="btn-primary min-h-10 w-full px-2 text-sm" />}
                <button type="button" className="btn-ghost min-h-10 w-full px-2 text-sm" onClick={() => setShareFor({ artworkId: a.id, entry: entry?.status === 'approved' ? entry : null })} data-testid={`share-${a.id}`}>
                  📤 {t('share.button')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {shareFor && <ShareDialog artworkId={shareFor.artworkId} entry={shareFor.entry} onClose={() => setShareFor(null)} />}
      {submitFor && (
        <SubmitDialog
          artwork={submitFor}
          schedule={s}
          onClose={() => setSubmitFor(null)}
          onDone={() => {
            setSubmitFor(null);
            load();
          }}
        />
      )}
    </div>
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
  const grouped = Object.values(
    col.cards.reduce((acc, c) => {
      acc[c.pictureId] ||= { ...c, count: 0 };
      acc[c.pictureId].count++;
      return acc;
    }, {}),
  );
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

export default function Collection() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'artworks' ? 'artworks' : 'cards';
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
