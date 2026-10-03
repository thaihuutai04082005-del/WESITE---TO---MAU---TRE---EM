// Thẻ bài trên trang Bóc thẻ: khung màu theo hạng, tranh ở giữa, tên + sao phía dưới.
// Ảnh chỉ tải khi thẻ cuộn tới (360 thẻ không tải cùng lúc).
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import PictureView from '../PictureView/PictureView';
import { RarityBadge, RARITY_COLOR } from './GachaCardReveal';

const cache = new Map();
/** Tranh của thẻ để xem (thẻ đã có, hoặc mọi thẻ khi máy chủ bật xem trước). */
export function useCardPreview(id, enabled = true) {
  const [pic, setPic] = useState(() => cache.get(id)?.value || null);
  useEffect(() => {
    if (!id || !enabled) return undefined;
    let alive = true;
    if (!cache.has(id)) cache.set(id, { promise: api.get(`/gacha/catalog/${id}/picture`).then((r) => r.picture) });
    const entry = cache.get(id);
    entry.promise
      .then((p) => {
        entry.value = p;
        if (alive) setPic(p);
      })
      .catch(() => cache.delete(id));
    return () => {
      alive = false;
    };
  }, [id, enabled]);
  return pic;
}

const STARS = { S: 4, A: 3, B: 2, C: 1 };

export default function PlayCard({ card, onClick }) {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  const pic = useCardPreview(card.pictureId, seen);
  const owned = card.count > 0;
  const frame = card.rarity === 'S' ? undefined : { background: RARITY_COLOR[card.rarity] };
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-testid={`deck-card-${card.pictureId}`}
      className={`group relative flex aspect-[3/4] flex-col rounded-2xl p-1.5 text-left shadow-[0_6px_16px_rgba(27,42,56,0.15)] transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(27,42,56,0.22)] ${card.rarity === 'S' ? 'card-s-bg' : ''} ${owned ? `rarity-glow-${card.rarity}` : ''}`}
      style={frame}
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-white">
        <div className="relative aspect-square overflow-hidden bg-primary-light">
          {pic ? <PictureView picture={pic} title={card.name[i18n.language]} /> : <div className="h-full w-full animate-pulse bg-primary-light" />}
        </div>
        <div className="flex flex-1 flex-col justify-between px-1.5 pb-1 pt-1">
          <div className="line-clamp-2 text-[11px] font-bold leading-tight text-ink sm:text-xs">{card.name[i18n.language]}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs leading-none" style={{ color: RARITY_COLOR[card.rarity] }}>
              {'★'.repeat(STARS[card.rarity])}
            </span>
            {!owned && <span className="rounded-full bg-line px-1.5 text-[10px] font-bold text-muted">{t('gacha.notOwned')}</span>}
          </div>
        </div>
      </div>
      <RarityBadge rarity={card.rarity} className="absolute -left-1 -top-1 !h-7 !min-w-7 !text-base" />
      {card.count > 1 && <span className="absolute -right-1 -top-1 rounded-full bg-ink px-2 text-sm font-bold text-white">×{card.count}</span>}
    </button>
  );
}
