// Gacha & Bộ sưu tập thẻ (Mục 9.4): mỗi 50 Điểm Gacha = 1 lượt bóc. Thẻ = tranh hiếm được mở khoá để tô.
import { useEffect, useState } from 'react';
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
  const [col, setCol] = useState(null);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('all');
  const [openCard, setOpenCard] = useState(null);
  const [colorPic, setColorPic] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get('/gacha').then(setInfo);
    api.get('/gacha/cards').then(setCol);
  };
  useEffect(load, []);

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

  // Gộp các bản trùng tranh để hiển thị ×N.
  const grouped = Object.values(
    (col?.cards || []).reduce((acc, c) => {
      acc[c.pictureId] ||= { ...c, count: 0 };
      acc[c.pictureId].count++;
      return acc;
    }, {}),
  ).filter((c) => filter === 'all' || c.rarity === filter);

  return (
    <div className="page space-y-6">
      <h1 className="page-title">{t('gacha.title')}</h1>
      {info && (
        <div className="card grid gap-4 p-5 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
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
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-primary" disabled={busy || info.pullsAvailable < 1} onClick={() => pull(1)} data-testid="gacha-pull">
              {t('gacha.pull1')}
            </button>
            {info.pullsAvailable > 1 && (
              <button type="button" className="btn-coral" disabled={busy} onClick={() => pull(Math.min(10, info.pullsAvailable))}>
                {t('gacha.pullN', { n: Math.min(10, info.pullsAvailable) })}
              </button>
            )}
          </div>
        </div>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-bold">
            {t('gacha.collection')} {col && <span className="text-muted">({col.distinct}/{col.total})</span>}
          </h2>
          <div className="flex gap-1">
            {['all', 'S', 'A', 'B', 'C'].map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`btn min-h-11 px-3 text-base ${filter === f ? 'bg-primary text-white' : 'bg-primary-light text-primary-dark'}`}>
                {f === 'all' ? t('common.all') : f}
              </button>
            ))}
          </div>
        </div>
        {col && grouped.length === 0 && <div className="card p-6 text-center text-muted">{t('gacha.empty')}</div>}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {grouped.map((c) => <CardTile key={c.pictureId} card={c} onClick={() => setOpenCard(c)} />)}
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
  );
}

function CardModal({ card, lang, onClose, onColor }) {
  const { t } = useTranslation();
  const pic = usePicture(card.pictureId);
  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col items-center gap-3 text-center">
        <RarityBadge rarity={card.rarity} />
        <div className={`w-full max-w-xs rounded-2xl p-1 rarity-glow-${card.rarity}`}>{pic && <PictureView picture={pic} reveal className="rounded-xl" />}</div>
        <h2 className="font-display text-2xl font-extrabold">{card.name[lang]}</h2>
        <p className="text-muted">{t(`gacha.rarity.${card.rarity}`)}</p>
        <button type="button" className="btn-primary w-full" disabled={!pic} onClick={() => onColor(pic)} data-testid="card-color">
          {t('gacha.colorThis')}
        </button>
      </div>
    </Modal>
  );
}
