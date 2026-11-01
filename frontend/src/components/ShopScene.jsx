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
      <rect x="8" y="340" width="262" height="300" rx="46" fill="url(#shg-panel)" stroke="#FFFFFF" strokeWidth="6" />
      <rect x="20" y="352" width="238" height="276" rx="36" fill="none" stroke="#FFC2C8" strokeWidth="3" />
    </g>
  );
}

function Brush({ x, y, rot, handle, handleDk, tip, tipDk }) {
  // Cọ thẳng đứng dài 150: lông cọ trên đầu, đai kim loại, cán sơn màu.
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M-12 -44 C-12 -78 -4 -100 0 -112 C4 -100 12 -78 12 -44 Z" fill={tip} stroke={tipDk} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-4 -52 C-5 -72 -2 -90 0 -100" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      <rect x="-14" y="-46" width="28" height="26" rx="5" fill="#E7ECF2" stroke="#A9B4C2" strokeWidth="3" />
      <path d="M-14 -38H14M-14 -29H14" stroke="#C5CEDA" strokeWidth="2" />
      <path d="M-11 -20 H11 L9 100 H-9 Z" fill={handle} stroke={handleDk} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-5 -14 L-4 92" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity=".4" />
    </g>
  );
}

function BrushCup() {
  // Thứ tự vẽ: lòng ly (phía sau) → cọ → thân ly + vành trước (che phần cán) ⇒ cọ nằm TRONG ly.
  return (
    <g transform="translate(118 742)" filter="url(#shf-small)">
      <ellipse cx="92" cy="128" rx="78" ry="13" fill="#B9B1C4" stroke="#D5CEDB" strokeWidth="4" />
      <ellipse cx="92" cy="131" rx="70" ry="9" fill="#8F86A0" />
      <Brush x={50} y={96} rot={-18} handle="#F0525E" handleDk="#C73541" tip="#F0525E" tipDk="#C73541" />
      <Brush x={134} y={96} rot={18} handle="#3DA9FC" handleDk="#2276C9" tip="#3DA9FC" tipDk="#2276C9" />
      <Brush x={92} y={88} rot={0} handle="#FF5A66" handleDk="#C73541" tip="#FFC21A" tipDk="#E09A00" />
      {/* thân ly + vành trước */}
      <path d="M14 128 A78 13 0 0 0 170 128 L156 232 Q154 252 134 252 H50 Q30 252 28 232 Z" fill="url(#shg-cup)" stroke="#D5CEDB" strokeWidth="4" strokeLinejoin="round" />
      <path d="M14 128 A78 13 0 0 0 170 128" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity=".9" />
      <path d="M21 172 H163 L158 208 H26 Z" fill="#EE4C5A" />
      <path d="M21 172 H163" stroke="#FF98A0" strokeWidth="4" opacity=".8" />
      <path d="M40 146V232" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".55" />
    </g>
  );
}

function Palette() {
  // Bảng pha màu vẽ lại từ ảnh mẫu của chủ web (viền ngoài, nền kem, 5 chấm màu), phóng 3,9 lần.
  return (
    <g transform="translate(1496 760)">
      <path d="M152.1 0.0C145.1 0.1 138.0 0.6 131.1 1.5C124.2 2.3 117.2 3.4 110.7 4.9C104.1 6.3 97.8 8.0 91.6 10.2C85.5 12.5 79.5 15.2 73.6 18.5C67.8 21.9 62.2 26.3 56.5 30.2C50.9 34.1 45.1 37.5 40.0 41.9C34.9 46.4 29.7 51.5 25.8 57.0C22.0 62.6 20.0 69.1 17.1 75.1C14.1 81.1 10.8 86.9 8.3 93.1C5.8 99.3 3.3 105.5 1.9 112.1C0.6 118.7 0.2 125.7 0.0 132.6C-0.2 139.5 -0.2 146.7 0.5 153.6C1.1 160.4 2.2 167.0 3.9 173.5C5.6 180.0 7.9 186.6 10.7 192.6C13.6 198.6 16.9 204.1 21.0 209.6C25.0 215.2 30.1 220.8 35.1 225.7C40.1 230.6 45.2 235.0 50.7 238.9C56.2 242.8 62.2 246.2 68.2 249.1C74.3 252.0 80.4 254.5 86.8 256.4C93.1 258.4 99.5 260.0 106.3 260.8C113.0 261.6 120.6 262.2 127.2 261.3C133.9 260.4 141.1 259.1 146.2 255.4C151.4 251.8 155.9 245.5 157.9 239.4C160.0 233.3 158.7 225.7 158.4 218.9C158.2 212.1 154.4 203.9 156.5 198.4C158.6 193.0 165.1 188.3 171.1 186.2C177.1 184.1 185.5 186.1 192.6 185.7C199.6 185.4 206.7 185.1 213.5 184.3C220.3 183.5 227.1 182.6 233.5 180.9C239.9 179.1 246.1 176.6 252.0 173.5C258.0 170.5 263.9 166.8 269.1 162.3C274.3 157.9 279.4 152.3 283.2 146.7C287.1 141.2 289.9 135.4 292.0 129.2C294.1 122.9 295.4 116.0 295.9 109.2C296.4 102.4 295.6 95.1 294.9 88.2C294.3 81.4 294.4 74.4 292.0 68.2C289.6 62.1 284.8 56.3 280.3 51.2C275.8 46.1 270.5 41.8 265.2 37.5C259.9 33.2 254.3 28.8 248.6 25.3C242.9 21.9 237.1 19.2 231.1 16.6C225.1 14.0 218.9 11.7 212.5 9.8C206.2 7.8 199.6 6.3 193.0 4.9C186.5 3.4 179.9 1.8 173.1 1.0C166.2 0.2 159.1 -0.1 152.1 0.0Z" fill="#E5A817" />
      <path d="M152.6 11.7C145.6 11.8 138.5 12.8 131.6 13.7C124.7 14.5 117.7 15.5 111.1 17.1C104.6 18.6 98.3 20.4 92.1 22.9C86.0 25.4 79.9 28.6 74.1 32.2C68.3 35.8 63.0 40.2 57.5 44.4C52.1 48.5 45.9 52.0 41.4 57.0C37.0 62.1 34.0 68.7 30.7 74.6C27.4 80.4 24.1 86.0 21.4 92.1C18.8 98.2 16.2 104.6 14.6 111.1C13.0 117.7 12.1 124.6 11.7 131.6C11.3 138.6 11.5 146.2 12.2 153.1C12.9 160.0 14.2 166.6 16.1 173.1C18.0 179.5 20.1 185.7 23.4 191.6C26.6 197.5 31.1 203.4 35.6 208.7C40.1 213.9 44.9 218.8 50.2 223.3C55.5 227.7 61.4 232.1 67.3 235.5C73.1 238.8 79.1 241.1 85.3 243.3C91.6 245.5 98.1 247.6 104.8 248.6C111.6 249.7 119.3 250.9 125.8 249.6C132.3 248.3 140.3 245.6 143.8 240.8C147.3 236.0 146.6 227.6 146.7 220.8C146.9 214.1 143.6 206.8 144.8 200.4C145.9 193.9 149.0 186.6 153.6 182.3C158.1 178.0 165.4 175.9 172.1 174.5C178.8 173.1 186.5 174.4 193.5 174.0C200.6 173.7 207.8 173.5 214.5 172.6C221.2 171.6 227.7 170.4 234.0 168.2C240.3 166.0 246.8 163.1 252.5 159.4C258.3 155.8 264.1 151.3 268.6 146.2C273.1 141.2 276.8 135.4 279.3 129.2C281.9 123.0 283.1 116.0 283.7 109.2C284.4 102.4 284.2 95.0 283.2 88.2C282.3 81.5 280.9 74.8 277.9 68.7C274.9 62.7 270.0 57.0 265.2 52.2C260.4 47.4 254.7 43.7 249.1 40.0C243.5 36.2 237.6 32.7 231.6 29.7C225.6 26.8 219.4 24.5 213.0 22.4C206.7 20.3 200.1 18.6 193.5 17.1C187.0 15.5 180.4 14.1 173.5 13.2C166.7 12.3 159.6 11.6 152.6 11.7Z" fill="#FFF3D6" />
      <circle cx="115.0" cy="63.4" r="28.5" fill="#FFC94D" />
      <circle cx="186.8" cy="57.9" r="28.5" fill="#4FA3E0" />
      <circle cx="235.6" cy="112.9" r="28.5" fill="#7D5FFF" />
      <circle cx="76.8" cy="123.8" r="28.5" fill="#FF5F7E" />
      <circle cx="76.8" cy="189.7" r="28.5" fill="#4CD787" />
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
