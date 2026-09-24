// Bảng màu (Mục 4.1): preset mở rộng, chọn màu tuỳ ý, màu vừa dùng, màu yêu thích.
// Chế độ Tô theo mẫu: hiện thêm dãy màu đánh số của tranh.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';

export const PRESETS = [
  '#FF5F5F', '#E74C3C', '#C0392B', '#FF7AA2', '#FF9EC0', '#FFB3C1',
  '#FF9F43', '#FF8A65', '#FFB74D', '#FFD54F', '#FFE066', '#FFF3B0',
  '#4CD787', '#4CAF50', '#2E7D32', '#8BD17C', '#C5E1A5', '#00BFA5',
  '#2B9BF4', '#4FA3E0', '#0B6FB8', '#BDE6FF', '#5DADE2', '#1F4E79',
  '#7D5FFF', '#9B59B6', '#6C3483', '#D7BDE2', '#F48FB1', '#E1BEE7',
  '#8B5A2B', '#C68B59', '#F3D9B1', '#FFE0B5', '#A0673A', '#5C3A1E',
  '#FFFFFF', '#E3E8ED', '#BFC8D0', '#8FA8BF', '#5E7A8C', '#1B2A38',
];

const RECENT_MAX = 10;
const FAV_MAX = 16;

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}
function persist(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* bỏ qua */
  }
}

function Swatch({ color, active, onClick, label, number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || color}
      title={label || color}
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition ${active ? 'scale-110 border-ink ring-4 ring-primary/40' : 'border-white shadow-[0_0_0_1px_#D6EAF8]'}`}
      style={{ background: color }}
    >
      {number != null && (
        <span className="rounded-full bg-white/85 px-1.5 text-sm font-extrabold text-ink">{number}</span>
      )}
    </button>
  );
}

export default function ColorPalette({ color, onChange, userKey = 'guest', numbered = null, activeNumber = null, onNumber }) {
  const { t } = useTranslation();
  const recentKey = `btm.recent.${userKey}`;
  const favKey = `btm.fav.${userKey}`;
  const [recent, setRecent] = useState(() => load(recentKey));
  const [favs, setFavs] = useState(() => load(favKey));

  useEffect(() => {
    if (!color) return;
    setRecent((r) => {
      const next = [color, ...r.filter((c) => c !== color)].slice(0, RECENT_MAX);
      persist(recentKey, next);
      return next;
    });
  }, [color, recentKey]);

  const isFav = favs.includes(color);
  const toggleFav = () => {
    const next = isFav ? favs.filter((c) => c !== color) : [color, ...favs].slice(0, FAV_MAX);
    setFavs(next);
    persist(favKey, next);
  };

  return (
    <div className="space-y-3" data-testid="color-palette">
      {numbered && (
        <div>
          <div className="mb-1 text-sm font-bold text-muted">{t('coloring.numberedColors')}</div>
          <div className="flex flex-wrap gap-2">
            {numbered.map((p) => (
              <Swatch key={p.number} color={p.color} number={p.number} active={activeNumber === p.number && color === p.color} onClick={() => { onChange(p.color); onNumber?.(p.number); }} />
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="relative flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-line pl-1 pr-3 font-bold" title={t('coloring.customColor')}>
          <span className="h-9 w-9 rounded-full border border-line" style={{ background: color }} />
          <Icon name="palette" size={20} />
          <input type="color" value={color} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t('coloring.customColor')} />
        </label>
        <button type="button" onClick={toggleFav} className={`btn-ghost min-h-11 px-3 ${isFav ? 'text-danger' : ''}`} aria-pressed={isFav} title={t('coloring.favorite')}>
          <Icon name="heart" size={20} />
        </button>
      </div>
      {favs.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-bold text-muted">{t('coloring.favorites')}</div>
          <div className="flex flex-wrap gap-2">{favs.map((c) => <Swatch key={c} color={c} active={c === color} onClick={() => onChange(c)} />)}</div>
        </div>
      )}
      {recent.length > 1 && (
        <div>
          <div className="mb-1 text-sm font-bold text-muted">{t('coloring.recent')}</div>
          <div className="flex flex-wrap gap-2">{recent.map((c) => <Swatch key={c} color={c} active={c === color} onClick={() => onChange(c)} />)}</div>
        </div>
      )}
      <div>
        <div className="mb-1 text-sm font-bold text-muted">{t('coloring.presets')}</div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-7 lg:grid-cols-6">
          {PRESETS.map((c) => <Swatch key={c} color={c} active={c === color} onClick={() => onChange(c)} />)}
        </div>
      </div>
    </div>
  );
}
