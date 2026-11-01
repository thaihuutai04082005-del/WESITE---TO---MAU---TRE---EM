// Bảng màu (Mục 4.1): preset mở rộng, chọn màu tuỳ ý, màu yêu thích.
// Chế độ Tô theo mẫu: chỉ hiện đúng các màu (đánh số) mà tranh đó dùng — không có bảng màu đầy đủ.
import { useState } from 'react';
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

/** Chữ trắng hay đen cho dễ đọc trên màu nền (theo độ sáng). */
function inkOn(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? '#1B2A38' : '#FFFFFF';
}

// Hạt li ti phủ lên ô màu khi đang dùng sáp hạt (giống nét sáp hạt sẽ tô ra).
const GRAINS = {
  backgroundImage: [
    'radial-gradient(circle, rgba(255,255,255,.95) 0 1.1px, transparent 1.6px)',
    'radial-gradient(circle, rgba(255,255,255,.8) 0 0.9px, transparent 1.4px)',
    'radial-gradient(circle, rgba(255,255,255,.9) 0 1px, transparent 1.5px)',
  ].join(','),
  backgroundSize: '9px 9px, 7px 7px, 11px 11px',
  backgroundPosition: '1px 2px, 4px 5px, 6px 1px',
};

function Swatch({ color, active, onClick, label, number, glitter = false }) {
  const ink = number != null ? inkOn(color) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || color}
      title={label || color}
      className={`cw-sw relative flex shrink-0 items-center justify-center rounded-full transition ${active ? 'scale-110 ring-[3px] ring-ink ring-offset-2 ring-offset-white' : 'ring-1 ring-black/15'}`}
      style={glitter ? { backgroundColor: color, ...GRAINS } : { background: color }}
    >
      {number != null && (
        <span className="text-base font-extrabold leading-none" style={{ color: ink }}>
          {number}
        </span>
      )}
    </button>
  );
}

export default function ColorPalette({ glitter = false, color, onChange, userKey = 'guest', numbered = null, activeNumber = null, onNumber }) {
  const { t } = useTranslation();
  const favKey = `btm.fav.${userKey}`;
  const [favs, setFavs] = useState(() => load(favKey));


  const isFav = favs.includes(color);
  const toggleFav = () => {
    const next = isFav ? favs.filter((c) => c !== color) : [color, ...favs].slice(0, FAV_MAX);
    setFavs(next);
    persist(favKey, next);
  };

  // Tô theo mẫu: chỉ các màu có trong tranh, theo số.
  if (numbered) {
    return (
      <div data-testid="color-palette">
        <div className="mb-1 text-sm font-bold text-muted">{t('coloring.numberedColors')}</div>
        <div className="cw-grid cw-grid-num">
          {numbered.map((p) => (
            <Swatch glitter={glitter} key={p.number} color={p.color} number={p.number} active={activeNumber === p.number && color === p.color} onClick={() => { onChange(p.color); onNumber?.(p.number); }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cw-palette space-y-3" data-testid="color-palette">
      <div className="flex items-center gap-2">
        <label className="relative flex h-12 cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-white px-2 pr-3 font-bold" title={t('coloring.customColor')}>
          <span className="h-8 w-8 shrink-0 rounded-full ring-1 ring-black/15" style={glitter ? { backgroundColor: color, ...GRAINS } : { background: color }} />
          <Icon name="palette" size={20} />
          <input type="color" value={color} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t('coloring.customColor')} />
        </label>
        <button type="button" onClick={toggleFav} className={`btn-ghost min-h-12 px-3 ${isFav ? 'text-danger' : ''}`} aria-pressed={isFav} title={t('coloring.favorite')}>
          <Icon name="heart" size={20} />
        </button>
      </div>
      {favs.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-bold text-muted">{t('coloring.favorites')}</div>
          <div className="cw-grid">{favs.map((c) => <Swatch glitter={glitter} key={c} color={c} active={c === color} onClick={() => onChange(c)} />)}</div>
        </div>
      )}
      <div>
        <div className="cw-label mb-1 text-sm font-bold text-muted">{t('coloring.presets')}</div>
        <div className="cw-grid">
          {PRESETS.map((c) => <Swatch glitter={glitter} key={c} color={c} active={c === color} onClick={() => onChange(c)} />)}
        </div>
      </div>
    </div>
  );
}
