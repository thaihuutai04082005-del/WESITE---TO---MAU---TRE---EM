// Cảnh quầy Shop vẽ bằng SVG (một tấm duy nhất 1821×864, nền trời là ảnh /shop/shop-bg.webp phía sau):
// khung quầy gỗ, mái hiên sọc đỏ có viền lượn, bảng hiệu, đèn có chùm sáng, bảng loại bên trái, ly cọ, bảng pha màu, ngôi sao.
// Chữ, thẻ vật phẩm và nút nằm ở lớp HTML phía trên (xem Shop.jsx).
export const SHOP_W = 1821;
export const SHOP_H = 1040;

const WOOD_OUT = '#C27A24';
const RED = '#E2434E';
const RED_DK = '#B3303C';

function Defs() {
  return (
    <defs>
      <linearGradient id="shg-post" x1="0" x2="1"><stop offset="0" stopColor="#E59A44" /><stop offset=".45" stopColor="#FCD493" /><stop offset="1" stopColor="#E3963F" /></linearGradient>
      <linearGradient id="shg-rail" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFE5AE" /><stop offset=".5" stopColor="#F8BE62" /><stop offset="1" stopColor="#E59A44" /></linearGradient>
      <linearGradient id="shg-wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFF9F3" /><stop offset="1" stopColor="#FDEADC" /></linearGradient>
      <linearGradient id="shg-wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#F2B96A" /><stop offset=".12" stopColor="#F8CE8C" /><stop offset="1" stopColor="#F4C27A" /></linearGradient>
      <linearGradient id="shg-roof-r" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FF8088" /><stop offset="1" stopColor="#F2535E" /></linearGradient>
      <linearGradient id="shg-roof-w" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#FCE9EA" /></linearGradient>
      <linearGradient id="shg-val-r" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E9505B" /><stop offset="1" stopColor="#D23845" /></linearGradient>
      <linearGradient id="shg-val-w" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFF8F8" /><stop offset="1" stopColor="#F6DDDF" /></linearGradient>
      <linearGradient id="shg-plank" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FCD07E" /><stop offset=".5" stopColor="#F7BC5C" /><stop offset="1" stopColor="#EDA645" /></linearGradient>
      <linearGradient id="shg-panel" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FF8F9A" /><stop offset="1" stopColor="#E8505E" /></linearGradient>
      <linearGradient id="shg-star" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFEE7A" /><stop offset="1" stopColor="#FFC01F" /></linearGradient>
      <linearGradient id="shg-lamp" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FF6A74" /><stop offset="1" stopColor="#D8394A" /></linearGradient>
      <linearGradient id="shg-beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFF08A" stopOpacity=".75" /><stop offset="1" stopColor="#FFF08A" stopOpacity="0" /></linearGradient>
      <filter id="shf-soft" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#7A2A22" floodOpacity=".28" /></filter>
      <filter id="shf-small" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5A3A10" floodOpacity=".3" /></filter>
    </defs>
  );
}

function StarShape({ cx, cy, r, rot = 0 }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 ? r * 0.48 : r;
    const a = ((-90 + i * 36 + rot) * Math.PI) / 180;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return (
    <g filter="url(#shf-small)">
      <polygon points={pts} fill="url(#shg-star)" stroke="#F0960A" strokeWidth={r * 0.1} strokeLinejoin="round" />
      <path d={`M${cx - r * 0.45} ${cy - r * 0.35} L${cx - r * 0.1} ${cy - r * 0.55}`} stroke="#FFFBD0" strokeWidth={r * 0.1} strokeLinecap="round" opacity=".9" />
    </g>
  );
}

function Post({ x }) {
  return (
    <g>
      <rect x={x} y="150" width="58" height="850" rx="14" fill="url(#shg-post)" stroke={WOOD_OUT} strokeWidth="4" />
      <rect x={x + 10} y="170" width="8" height="810" rx="4" fill="#FFF1CC" opacity=".55" />
    </g>
  );
}

function Corbel({ side }) {
  // Giá đỡ cong dưới mái hiên, nằm cạnh đỉnh cột.
  const left = side === 'l';
  const x = left ? 296 : 1564;
  return (
    <g transform={left ? '' : 'translate(0 0)'}>
      <path d={left ? `M${x + 80} 148 V232 Q${x} 232 ${x} 168 Q${x + 4} 148 ${x + 40} 148 Z` : `M${x - 8} 148 V232 Q${x + 72} 232 ${x + 72} 168 Q${x + 68} 148 ${x + 32} 148 Z`} fill="url(#shg-rail)" stroke={WOOD_OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d={left ? `M${x + 18} 176 Q${x + 22} 200 ${x + 60} 206` : `M${x + 54} 176 Q${x + 50} 200 ${x + 12} 206`} fill="none" stroke="#FFF0C6" strokeWidth="5" strokeLinecap="round" opacity=".8" />
    </g>
  );
}

function Rail({ x, y, w, h }) {
  return (
    <g filter="url(#shf-small)">
      <rect x={x} y={y} width={w} height={h} rx={h / 2.2} fill="url(#shg-rail)" stroke={WOOD_OUT} strokeWidth="4" />
      <rect x={x + 16} y={y + 5} width={w - 32} height="6" rx="3" fill="#FFF6DC" opacity=".8" />
    </g>
  );
}

function Lamp({ cx }) {
  return (
    <g>
      <polygon points={`${cx - 46},250 ${cx + 46},250 ${cx + 150},420 ${cx - 150},420`} fill="url(#shg-beam)" />
      <rect x={cx - 7} y="150" width="14" height="30" rx="4" fill="#C93846" />
      <path d={`M${cx - 62} 232 Q${cx - 60} 180 ${cx} 176 Q${cx + 60} 180 ${cx + 62} 232 Z`} fill="url(#shg-lamp)" stroke={RED_DK} strokeWidth="4" strokeLinejoin="round" />
      <path d={`M${cx - 44} 214 Q${cx - 40} 192 ${cx - 14} 186`} fill="none" stroke="#FFD0D3" strokeWidth="6" strokeLinecap="round" opacity=".9" />
      <rect x={cx - 70} y="228" width="140" height="14" rx="7" fill="#C93846" stroke={RED_DK} strokeWidth="3" />
      <ellipse cx={cx} cy="248" rx="26" ry="20" fill="#FFF3A6" stroke="#F4B400" strokeWidth="4" />
      <ellipse cx={cx - 6} cy="244" rx="10" ry="7" fill="#FFFFFF" opacity=".85" />
    </g>
  );
}

/** Mái hiên: mặt mái nghiêng (nhạt) + diềm phía trước (đậm) lượn sóng ở mép dưới. */
function Awning() {
  const n = 14;
  const L = 218;
  const R = 1714;
  const w = (R - L) / n;
  const topL = 296;
  const topR = 1636;
  const tw = (topR - topL) / n;
  const roof = [];
  const val = [];
  for (let i = 0; i < n; i++) {
    const red = i % 2 === 0;
    const b0 = L + i * w;
    const b1 = b0 + w;
    const t0 = topL + i * tw;
    const t1 = t0 + tw;
    roof.push(<polygon key={`r${i}`} points={`${t0},0 ${t1},0 ${b1},100 ${b0},100`} fill={red ? 'url(#shg-roof-r)' : 'url(#shg-roof-w)'} />);
    const r = w / 2;
    val.push(
      <path key={`v${i}`} d={`M${b0} 100 H${b1} V132 A${r} 38 0 0 1 ${b0} 132 Z`} fill={red ? 'url(#shg-val-r)' : 'url(#shg-val-w)'} stroke={red ? RED_DK : '#D9A2A8'} strokeWidth="4" strokeLinejoin="round" />,
    );
  }
  return (
    <g filter="url(#shf-soft)">
      {roof}
      <path d={`M${topL} 1 H${topR}`} stroke="#F7C9CC" strokeWidth="4" />
      <rect x={L} y="96" width={R - L} height="8" fill="#FFFFFF" opacity=".22" />
      {val}
    </g>
  );
}

function Sign() {
  return (
    <g>
      {/* hai sợi dây treo lên mái */}
      {[806, 1126].map((x) => (
        <g key={x}>
          <rect x={x} y="86" width="8" height="40" rx="4" fill="#8C5A24" stroke="#6B4118" strokeWidth="2" />
          <circle cx={x + 4} cy="128" r="9" fill="#F4B63A" stroke="#B7791F" strokeWidth="3" />
        </g>
      ))}
      <g filter="url(#shf-soft)">
        <rect x="738" y="104" width="456" height="112" rx="30" fill="url(#shg-plank)" stroke="#C27A24" strokeWidth="7" />
        <rect x="748" y="114" width="436" height="92" rx="22" fill="none" stroke="#FFE4A8" strokeWidth="3" opacity=".7" />
        <path d="M760 142H1172M752 176H1180" stroke="#E9A94F" strokeWidth="2" opacity=".35" />
        <path d="M790 118c60 4 120 -2 200 2" stroke="#FFF2CC" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      </g>
    </g>
  );
}

function LeftPanel() {
  return (
    <g filter="url(#shf-soft)">
      <rect x="8" y="340" width="262" height="300" rx="46" fill="url(#shg-panel)" stroke="#FFFFFF" strokeWidth="6" />
      <rect x="20" y="352" width="238" height="276" rx="36" fill="none" stroke="#FFC2C8" strokeWidth="3" />
    </g>
  );
}

/** Toàn bộ nền quầy (không chữ). */
export function ShopArt() {
  return (
    <svg viewBox={`0 0 ${SHOP_W} ${SHOP_H}`} className="sh-art" aria-hidden="true" preserveAspectRatio="none">
      <Defs />
      <g transform="translate(-48 0)">
      {/* tường quầy */}
      <rect x="372" y="300" width="1188" height="660" fill="url(#shg-wall)" />
      <rect x="372" y="656" width="1188" height="304" fill="url(#shg-wood)" />
      {[716, 776, 836, 896].map((y) => <path key={y} d={`M372 ${y}H1560`} stroke="#E4A55A" strokeWidth="2" opacity=".35" />)}
      <Lamp cx={506} />
      <Lamp cx={1426} />
      <Post x={318} />
      <Post x={1556} />
      <Rail x={336} y={296} w={1260} h={36} />
      <Rail x={304} y={634} w={1308} h={42} />
      <Rail x={290} y={958} w={1336} h={44} />
      <Corbel side="l" />
      <Corbel side="r" />
      <Awning />
      <Sign />
      </g>
      <LeftPanel />
    </svg>
  );
}

/** Chữ "Shop" + túi + 2 sao trên bảng hiệu (lớp HTML). */
export function Bag() {
  return (
    <svg viewBox="0 0 64 64" className="sh-bag" aria-hidden="true">
      <path d="M12 22h40l-3 34H15z" fill="#FFD9DC" stroke="#E2434E" strokeWidth="5" strokeLinejoin="round" />
      <path d="M22 26v-6a10 10 0 0120 0v6" fill="none" stroke="#E2434E" strokeWidth="5" strokeLinecap="round" />
      <path d="M17 30l1 20" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

/** Ngọc Ruby xanh (giữ màu xanh theo yêu cầu). */
export function RubyGem({ size = 24 }) {
  return (
    <svg viewBox="0 0 40 36" width={size} height={size * 0.9} aria-hidden="true" className="sh-gem">
      <path d="M10 3h20l9 10-19 21L1 13z" fill="#37B6FF" stroke="#FFFFFF" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M1 13h38M10 3l6 10 4 21 4-21 6-10M16 13h8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round" opacity=".85" />
      <path d="M10 3l6 10H1z" fill="#8FDBFF" />
      <path d="M30 3l-6 10h15z" fill="#1E8EEA" />
    </svg>
  );
}
