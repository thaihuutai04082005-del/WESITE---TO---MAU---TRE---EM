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
      <linearGradient id="shg-cup" x1="0" x2="1"><stop offset="0" stopColor="#F3F0F4" /><stop offset=".5" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E8E3EA" /></linearGradient>
      <linearGradient id="shg-pal" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#FFE9C8" /><stop offset="1" stopColor="#F2CD97" /></linearGradient>
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
      <rect x="26" y="340" width="296" height="300" rx="48" fill="url(#shg-panel)" stroke="#FFFFFF" strokeWidth="6" />
      <rect x="38" y="352" width="272" height="276" rx="38" fill="none" stroke="#FFC2C8" strokeWidth="3" />
    </g>
  );
}

function BrushCup() {
  return (
    <g transform="translate(118 758)" filter="url(#shf-small)">
      {/* cọ */}
      <g transform="rotate(-16 40 70)"><rect x="30" y="30" width="20" height="92" rx="9" fill="#E2434E" /><rect x="28" y="10" width="24" height="26" rx="6" fill="#D5DCE5" stroke="#A9B4C2" strokeWidth="2" /><path d="M28 10 Q40 -26 52 10 Z" fill="#E8505C" /></g>
      <g><rect x="78" y="20" width="22" height="100" rx="9" fill="#D9323F" /><rect x="76" y="2" width="26" height="26" rx="6" fill="#D5DCE5" stroke="#A9B4C2" strokeWidth="2" /><path d="M76 2 Q89 -40 102 2 Z" fill="#FFC21A" stroke="#F0960A" strokeWidth="2" /></g>
      <g transform="rotate(18 134 70)"><rect x="124" y="30" width="20" height="92" rx="9" fill="#3DA9FC" /><rect x="122" y="10" width="24" height="26" rx="6" fill="#D5DCE5" stroke="#A9B4C2" strokeWidth="2" /><path d="M122 10 Q134 -26 146 10 Z" fill="#2B86E8" /></g>
      {/* ly */}
      <path d="M18 112 H162 L148 224 Q146 244 126 244 H54 Q34 244 32 224 Z" fill="url(#shg-cup)" stroke="#D9D2DD" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="90" cy="112" rx="72" ry="13" fill="#EFEAF2" stroke="#D9D2DD" strokeWidth="4" />
      <path d="M26 156 H154 L150 192 H30 Z" fill="#E94F5C" />
      <path d="M26 156 H154" stroke="#FF9AA2" strokeWidth="4" opacity=".8" />
      <polygon points="90,160 98,176 116,178 103,190 107,207 90,198 73,207 77,190 64,178 82,176" fill="#FFFFFF" />
    </g>
  );
}

function Palette() {
  return (
    <g transform="translate(1566 800)" filter="url(#shf-small)">
      <path d="M118 10C54 10 8 54 12 112c4 54 52 84 98 80 24-2 28-20 50-24 28-4 66 4 80-34C254 70 192 10 118 10z" fill="#FFF8EC" stroke="#F28A1B" strokeWidth="16" strokeLinejoin="round" />
      <path d="M118 22C62 22 22 62 26 112c4 44 44 70 84 66 20-2 26-18 52-22 24-3 58 2 70-26" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".7" />
      <ellipse cx="74" cy="150" rx="19" ry="16" fill="#FFB347" stroke="#F28A1B" strokeWidth="10" />
      <circle cx="62" cy="72" r="19" fill="#FFB938" />
      <circle cx="116" cy="52" r="19" fill="#3E9BF5" />
      <circle cx="170" cy="78" r="19" fill="#8B5CF6" />
      <circle cx="52" cy="118" r="19" fill="#FF5C7A" />
      <circle cx="84" cy="102" r="19" fill="#3FD17A" />
      <path d="M58 64q4-6 10-6M110 44q4-4 9-4M164 70q4-5 9-4" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </g>
  );
}

/** Toàn bộ nền quầy (không chữ). */
export function ShopArt() {
  return (
    <svg viewBox={`0 0 ${SHOP_W} ${SHOP_H}`} className="sh-art" aria-hidden="true" preserveAspectRatio="none">
      <Defs />
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
      <LeftPanel />
      <StarShape cx={120} cy={250} r={42} rot={-10} />
      <StarShape cx={1706} cy={360} r={42} rot={12} />
      <BrushCup />
      <Palette />
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

export function SignStar() {
  return (
    <svg viewBox="0 0 80 80" className="sh-sign-star" aria-hidden="true">
      <polygon points={Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 17 : 36; const a = ((-90 + i * 36) * Math.PI) / 180; return `${(40 + r * Math.cos(a)).toFixed(1)},${(42 + r * Math.sin(a)).toFixed(1)}`; }).join(' ')} fill="#FFD84A" stroke="#F0A818" strokeWidth="5" strokeLinejoin="round" />
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
