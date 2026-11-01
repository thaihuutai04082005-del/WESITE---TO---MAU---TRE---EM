// Gacha & Bộ sưu tập thẻ (Mục 9.4): mỗi 50 Điểm Gacha = 1 lượt bóc. Thẻ = tranh hiếm được mở khoá để tô.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { errorText } from '../../lib/format';
import { usePicture } from '../../hooks/usePicture';
import { RarityBadge, RARITY_COLOR } from '../../components/GachaCardReveal/GachaCardReveal';
import Confetti from '../../components/Confetti';
import PictureView from '../../components/PictureView/PictureView';
import Icon from '../../components/Icon';

// 7 thẻ úp trên sân khấu (4 hàng trên, 3 hàng dưới) — toạ độ theo ảnh nền 1672×941 (cắt còn 1672×860). Thẻ sáng = còn lượt bóc.
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
  const [flips, setFlips] = useState({}); // slot → kết quả bóc, lật ngay trên sân khấu
  const [flipped, setFlipped] = useState(false);
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

  // count = 1: lật đúng thẻ vừa bấm (slot); nhiều thẻ: lật từ thẻ đầu. Thẻ rung rồi lật lên ngay trên sân khấu.
  async function pull(count, slot = 0) {
    if (!deck) return;
    setBusy(true);
    try {
      const ids = deck.cards.slice(count === 1 ? slot : 0, count === 1 ? slot + 1 : count).map((c) => c.pictureId);
      const r = await api.post('/gacha/pull', { pictureIds: ids });
      const m = {};
      r.results.forEach((res, k) => {
        m[count === 1 ? slot : k] = res;
      });
      setFlips(m);
      setFlipped(false);
      setTimeout(() => setFlipped(true), 700);
      setInfo((x) => ({ ...x, gachaPoints: r.gachaPoints, pullsAvailable: r.pullsAvailable }));
      refresh().catch(() => {});
    } catch (e) {
      toast(errorText(t, e), 'error');
    } finally {
      setBusy(false);
    }
  }

  function doneFlip() {
    setFlips({});
    setFlipped(false);
    load();
  }

  const ready = info ? Math.min(info.pullsAvailable, STAGE_CARDS.length) : 0;
  const locked = Object.keys(flips).length > 0;
  const best = Object.values(flips).some((x) => x.rarity === 'S') ? 90 : Object.values(flips).some((x) => x.rarity === 'A') ? 40 : 0;

  return (
    <div className="gs-root">
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
            const res = flips[i];
            const on = !res && !locked && i < ready;
            const rc = res ? RARITY_COLOR[res.rarity] : null;
            return (
              <button
                key={i}
                type="button"
                className={`gs-card${on ? ' gs-card-on' : ''}${!res && !on ? ' gs-card-off' : ''}${res && flipped ? ' gs-flipped' : ''}${res && !flipped ? ' gs-shake' : ''}`}
                style={{ '--x': pct(x, STAGE_W), '--y': pct(y, STAGE_H), '--w': pct(CARD_W, STAGE_W), '--h': pct(CARD_H, STAGE_H) }}
                disabled={busy || !!res || locked}
                onClick={() => (on ? pull(1, i) : toast(t('gacha.noPulls'), 'info'))}
                aria-label={res ? res.picture.name[i18n.language] : on ? t('gacha.pull1') : t('gacha.noPulls')}
                title={res ? res.picture.name[i18n.language] : on ? t('gacha.pull1') : t('gacha.noPulls')}
                data-testid={i === 0 ? 'gacha-pull' : `gacha-slot-${i}`}
              >
                <span className="gs-flip">
                  <span className="gs-face gs-face-f">
                    <span className="gs-card-in">
                      <span className="gs-q">?</span>
                    </span>
                  </span>
                  <span
                    className={`gs-face gs-face-b${res ? ` rarity-glow-${res.rarity}` : ''}`}
                    style={res ? { '--rc': res.rarity === 'S' ? 'linear-gradient(135deg,#FF5F7E,#FFB84D 50%,#FF5F7E)' : rc } : undefined}
                  >
                    {res && (
                      <span className="gs-bk-in">
                        <span className="gs-bk-top">
                          <span className="gs-badge" style={res.rarity === 'S' ? undefined : { background: rc }} data-s={res.rarity === 'S' ? '1' : undefined}>{res.rarity}</span>
                          <span className="gs-bk-rar">{t(`gacha.rarity.${res.rarity}`)}</span>
                        </span>
                        <span className="gs-bk-pic"><PictureView picture={res.picture} /></span>
                        <span className="gs-bk-name">{res.picture.name[i18n.language]}</span>
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {info && (
          <div className="gs-pills">
            <span className="gs-pill">💎 {t('gacha.points', { n: info.gachaPoints })}</span>
            <span className="gs-pill">🎁 {t('gacha.pulls', { n: info.pullsAvailable })}</span>
            {!locked && info.pullsAvailable > 1 && (
              <button type="button" className="gs-pill gs-pill-btn" disabled={busy} onClick={() => pull(Math.min(STAGE_CARDS.length, info.pullsAvailable))} data-testid="gacha-pull-n">
                ✨ {t('gacha.pullN', { n: Math.min(STAGE_CARDS.length, info.pullsAvailable) })}
              </button>
            )}
            {locked && flipped && (
              <button type="button" className="gs-pill gs-pill-btn gs-pill-go" onClick={doneFlip} data-testid="gacha-continue">
                🎉 {t('common.next')}
              </button>
            )}
          </div>
        )}
      </div>

      {locked && flipped && best > 0 && <Confetti count={best} />}
    </div>
  );
}
