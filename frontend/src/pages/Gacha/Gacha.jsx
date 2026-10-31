// Gacha & Bộ sưu tập thẻ (Mục 9.4): mỗi 50 Điểm Gacha = 1 lượt bóc. Thẻ = tranh hiếm được mở khoá để tô.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import { usePicture } from '../../hooks/usePicture';
import GachaCardReveal, { RarityBadge, RARITY_COLOR } from '../../components/GachaCardReveal/GachaCardReveal';
import PictureView from '../../components/PictureView/PictureView';
import ModePicker from '../../components/ModePicker';
import Modal from '../../components/Modal/Modal';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import PlayCard, { useCardPreview } from '../../components/GachaCardReveal/PlayCard';
import Icon from '../../components/Icon';

// 7 thẻ úp trên sân khấu (4 hàng trên, 3 hàng dưới) — toạ độ theo ảnh nền 1672×941. Thẻ sáng = còn lượt bóc.
const STAGE_W = 1672;
const STAGE_H = 860;
const CARD_W = 216;
const CARD_H = 266;
const STAGE_CARDS = [[367, 232], [610, 232], [852, 232], [1095, 232], [481, 523], [728, 523], [973, 523]];
const pct = (v, total) => `${(v / total) * 100}%`;

function StageStar({ className }) {
  return (
    <svg viewBox="-24 -24 48 48" className={`gs-star ${className || ''}`} aria-hidden="true">
      <path d="M0 -20 L6 -6.5 L20 -5.5 L9.5 4 L12.5 18 L0 10.5 L-12.5 18 L-9.5 4 L-20 -5.5 L-6 -6.5 Z" fill="#FFD84D" stroke="#F3A90A" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function CardTile({ card, onClick, selected }) {
  const { i18n } = useTranslation();
  const pic = usePicture(card.pictureId);
  return (
    <button type="button" onClick={onClick} className={`card relative p-2 text-left transition hover:-translate-y-1 rarity-glow-${card.rarity} ${selected ? 'ring-4 ring-primary' : ''}`}>
      <div className="aspect-square overflow-hidden rounded-xl bg-primary-light">{pic && <PictureView picture={pic} />}</div>
      <RarityBadge rarity={card.rarity} className="absolute left-1 top-1" />
      {card.count > 1 && <span className="absolute right-1 top-1 rounded-full bg-ink px-2 text-sm font-bold text-white">×{card.count}</span>}
      <div className="mt-1 line-clamp-2 text-xs font-bold">{card.name[i18n.language]}</div>
    </button>
  );
}

export default function Gacha() {
  const { t, i18n } = useTranslation();
  const refresh = useAuth((s) => s.refresh);
  const toast = useUi((s) => s.toast);
  const [info, setInfo] = useState(null);
  const [deck, setDeck] = useState(null);
  const [theme, setTheme] = useState('all');
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('all');
  const [openCard, setOpenCard] = useState(null);
  const [colorPic, setColorPic] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get('/gacha').then(setInfo).catch(() => window.dispatchEvent(new Event('btm:page-ready')));
    api.get('/gacha/catalog').then(setDeck).catch(() => window.dispatchEvent(new Event('btm:page-ready')));
  };
  useEffect(load, []);
  // Báo cho hiệu ứng chuyển màn hình (GachaTransition) biết trang đã sẵn sàng.
  useEffect(() => {
    if (info && deck) window.dispatchEvent(new Event('btm:page-ready'));
  }, [info, deck]);

  async function pull(count) {
    setBusy(true);
    try {
      const r = await api.post('/gacha/pull', { count });
      setResults(r.results);
      setInfo((x) => ({ ...x, gachaPoints: r.gachaPoints, pullsAvailable: r.pullsAvailable }));
      refresh().catch(() => {});
    } catch (e) {
      toast(errorText(t, e), 'error');
    } finally {
      setBusy(false);
    }
  }

  // Bộ thẻ: toàn bộ thẻ trong game, lọc theo hạng và chủ đề.
  const themes = deck ? [...new Map(deck.cards.map((c) => [c.theme.slug, c.theme])).values()] : [];
  const shown = (deck?.cards || []).filter((c) => (filter === 'all' || c.rarity === filter) && (theme === 'all' || c.theme.slug === theme));

  const ready = info ? Math.min(info.pullsAvailable, STAGE_CARDS.length) : 0;

  return (
    <div>
      <div className="gs-stage" data-testid="gacha-stage">
        <Link to="/" className="gs-back" data-testid="gacha-back">
          <Icon name="back" size={20} strokeWidth={3.4} /> {t('common.back')}
        </Link>
        <span className="gs-rope gs-rope-l" />
        <span className="gs-rope gs-rope-r" />
        <div className="gs-sign">
          <StageStar className="gs-star-l" />
          <h1 className="gs-title" data-testid="gacha-title">{t('gacha.title')}</h1>
          <StageStar className="gs-star-r" />
        </div>
        <div className="gs-cards">
          {STAGE_CARDS.map(([x, y], i) => {
            const on = i < ready;
            return (
              <button
                key={i}
                type="button"
                className={`gs-card${on ? ' gs-card-on' : ' gs-card-off'}`}
                style={{ '--x': pct(x, STAGE_W), '--y': pct(y, STAGE_H), '--w': pct(CARD_W, STAGE_W), '--h': pct(CARD_H, STAGE_H) }}
                disabled={busy}
                onClick={() => (on ? pull(1) : toast(t('gacha.noPulls'), 'info'))}
                aria-label={on ? t('gacha.pull1') : t('gacha.noPulls')}
                title={on ? t('gacha.pull1') : t('gacha.noPulls')}
                data-testid={i === 0 ? 'gacha-pull' : `gacha-slot-${i}`}
              >
                <span className="gs-card-in">
                  <span className="gs-q">?</span>
                </span>
              </button>
            );
          })}
        </div>
        {info && (
          <div className="gs-pills">
            <span className="gs-pill">💎 {t('gacha.points', { n: info.gachaPoints })}</span>
            <span className="gs-pill">🎁 {t('gacha.pulls', { n: info.pullsAvailable })}</span>
            {info.pullsAvailable > 1 && (
              <button type="button" className="gs-pill gs-pill-btn" disabled={busy} onClick={() => pull(Math.min(10, info.pullsAvailable))} data-testid="gacha-pull-n">
                ✨ {t('gacha.pullN', { n: Math.min(10, info.pullsAvailable) })}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="page space-y-6">
      {info && (
        <div className="card space-y-2 p-5">
          <ProgressBar
            label={t('gacha.points', { n: info.gachaPoints })}
            sublabel={t('gacha.pulls', { n: info.pullsAvailable })}
            value={info.gachaPoints % info.cost}
            max={info.cost}
            color="#7D5FFF"
          />
          <p className="text-sm text-muted">{t('gacha.how', { cost: info.cost })}</p>
          <div className="flex flex-wrap gap-2">
            {info.rates.map((r) => (
              <span key={r.rarity} className="chip" style={{ background: `${RARITY_COLOR[r.rarity]}22`, color: RARITY_COLOR[r.rarity] }}>
                {r.rarity}: {r.weight}%
              </span>
            ))}
          </div>
        </div>
      )}

      <section id="gacha-deck">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-bold">
            {t('gacha.deck')} {deck && <span className="text-muted">({deck.owned}/{deck.total})</span>}
          </h2>
          <div className="flex flex-wrap gap-1">
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="min-h-11 rounded-2xl border-2 border-line bg-white px-3 font-bold text-primary-dark" data-testid="deck-theme">
              <option value="all">{t('gacha.allThemes')}</option>
              {themes.map((th) => (
                <option key={th.slug} value={th.slug}>{th.name[i18n.language]}</option>
              ))}
            </select>
            {['all', 'S', 'A', 'B', 'C'].map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`btn min-h-11 px-3 text-base ${filter === f ? 'bg-primary text-white' : 'bg-primary-light text-primary-dark'}`}>
                {f === 'all' ? t('common.all') : f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {shown.map((c) => (
            <PlayCard key={c.pictureId} card={c} onClick={() => setOpenCard(c)} />
          ))}
        </div>
      </section>

      <Modal open={results.length > 0} onClose={() => { setResults([]); load(); }} dismissable={false}>
        {results[0] && (
          <GachaCardReveal
            key={results[0].cardId}
            result={results[0]}
            onDone={() => {
              const rest = results.slice(1);
              setResults(rest);
              if (!rest.length) load();
            }}
          />
        )}
        {results.length > 1 && <p className="mt-2 text-center text-sm text-muted">{t('gacha.remaining', { n: results.length - 1 })}</p>}
      </Modal>

      {openCard && !colorPic && (
        <CardModal card={openCard} lang={i18n.language} onClose={() => setOpenCard(null)} onColor={(p) => setColorPic(p)} />
      )}
      {colorPic && <ModePicker picture={colorPic} onClose={() => { setColorPic(null); setOpenCard(null); }} />}
      </div>
    </div>
  );
}

function CardModal({ card, lang, onClose, onColor }) {
  const { t } = useTranslation();
  const owned = card.count > 0;
  const preview = useCardPreview(card.pictureId);
  const full = usePicture(owned ? card.pictureId : null);
  const pic = full || preview;
  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col items-center gap-3 text-center">
        <RarityBadge rarity={card.rarity} />
        <div className={`w-full max-w-xs rounded-2xl p-1 rarity-glow-${card.rarity}`}>{pic && <PictureView picture={pic} reveal className="rounded-xl" />}</div>
        <h2 className="font-display text-2xl font-extrabold">{card.name[lang]}</h2>
        <p className="text-muted">{t(`gacha.rarity.${card.rarity}`)}</p>
        {owned ? (
          <button type="button" className="btn-primary w-full" disabled={!full} onClick={() => onColor(full)} data-testid="card-color">
            {t('gacha.colorThis')}
          </button>
        ) : (
          <p className="rounded-2xl bg-primary-light px-4 py-3 font-bold text-primary-dark">{t('gacha.lockedHint')}</p>
        )}
      </div>
    </Modal>
  );
}
