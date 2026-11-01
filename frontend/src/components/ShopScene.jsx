// Cảnh quầy Shop vẽ bằng SVG/CSS (nền trời là ảnh /shop/shop-bg.webp): mái hiên sọc đỏ, bảng "Shop", đèn, khung quầy gỗ,
// ly cọ và bảng pha màu ở góc dưới. Toạ độ theo khung 1821×864.
export const SHOP_W = 1821;
export const SHOP_H = 864;

/** Mái hiên sọc đỏ – trắng, viền lượn sóng. */
export function Awning() {
  const n = 14;
  const botW = 1480 / n;
  const topW = 1260 / n;
  const stripes = Array.from({ length: n }, (_, i) => {
    const b0 = i * botW;
    const b1 = (i + 1) * botW;
    const t0 = 110 + i * topW;
    const t1 = 110 + (i + 1) * topW;
    const r = botW / 2;
    const fill = i % 2 ? '#FFF4F2' : '#E2434E';
    return (
      <path key={i} d={`M${t0} 0 L${t1} 0 L${b1} 140 A${r} 26 0 0 1 ${b0} 140 Z`} fill={fill} stroke="#B7303B" strokeWidth="5" strokeLinejoin="round" />
    );
  });
  return (
    <svg viewBox="0 0 1480 180" className="sh-awning" aria-hidden="true" preserveAspectRatio="none">
      {stripes}
      <path d="M110 4 H1370" stroke="#B7303B" strokeWidth="8" />
    </svg>
  );
}

/** Đèn chụp đỏ có quầng sáng. */
export function Lamp() {
  return (
    <svg viewBox="0 0 130 110" className="sh-lamp" aria-hidden="true">
      <ellipse cx="65" cy="82" rx="58" ry="24" fill="#FFE98A" opacity=".45" />
      <path d="M20 62 Q22 22 65 18 Q108 22 110 62 Z" fill="#E2434E" stroke="#B7303B" strokeWidth="4" strokeLinejoin="round" />
      <rect x="15" y="60" width="100" height="10" rx="5" fill="#C9323E" stroke="#B7303B" strokeWidth="3" />
      <circle cx="65" cy="80" r="14" fill="#FFF3A8" stroke="#F4B400" strokeWidth="3" />
      <rect x="58" y="0" width="14" height="20" rx="3" fill="#C9323E" />
    </svg>
  );
}

export function Star({ className = '' }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <path d="M40 4l10 22 24 3-18 16 5 24-21-12-21 12 5-24L6 29l24-3z" fill="#FFD43B" stroke="#F1A00A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M32 24l-12 10" stroke="#FFF3A8" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

/** Túi mua sắm trên bảng hiệu. */
export function Bag() {
  return (
    <svg viewBox="0 0 64 64" className="sh-bag" aria-hidden="true">
      <path d="M12 22h40l-3 34H15z" fill="#FFE3E3" stroke="#E2434E" strokeWidth="5" strokeLinejoin="round" />
      <path d="M22 26v-6a10 10 0 0120 0v6" fill="none" stroke="#E2434E" strokeWidth="5" strokeLinecap="round" />
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

/** Ly cọ có ngôi sao (góc dưới trái). */
export function BrushCup() {
  return (
    <svg viewBox="0 0 170 250" className="sh-cup" aria-hidden="true">
      <g transform="rotate(-18 50 100)"><rect x="42" y="40" width="16" height="90" rx="6" fill="#E2434E" /><rect x="40" y="26" width="20" height="22" rx="5" fill="#C9D3DE" /><path d="M40 26 Q50 0 60 26z" fill="#E2434E" /></g>
      <g><rect x="76" y="20" width="16" height="110" rx="6" fill="#E2434E" stroke="#B7303B" strokeWidth="2" /><rect x="74" y="8" width="20" height="22" rx="5" fill="#C9D3DE" /><path d="M74 8 Q84 -22 94 8z" fill="#FFC21A" /></g>
      <g transform="rotate(20 124 100)"><rect x="116" y="40" width="16" height="90" rx="6" fill="#3DA9FC" /><rect x="114" y="26" width="20" height="22" rx="5" fill="#C9D3DE" /><path d="M114 26 Q124 0 134 26z" fill="#2B7BE4" /></g>
      <path d="M26 120h118l-12 112q-2 14-16 14H54q-14 0-16-14z" fill="#FFFFFF" stroke="#DDE3EA" strokeWidth="3" />
      <path d="M30 150h110l-4 30H34z" fill="#F0525E" />
      <path d="M85 160l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#FFFFFF" />
    </svg>
  );
}

/** Bảng pha màu (góc dưới phải). */
export function Palette() {
  return (
    <svg viewBox="0 0 220 190" className="sh-palette" aria-hidden="true">
      <path d="M110 12C52 12 8 52 12 104c4 48 46 74 86 70 20-2 22-16 40-20 24-4 56 2 70-30C228 66 176 12 110 12z" fill="#F9DDB4" stroke="#E0BC86" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="78" cy="126" rx="14" ry="12" fill="#FFF3E0" stroke="#E0BC86" strokeWidth="4" />
      <ellipse cx="150" cy="48" rx="24" ry="14" transform="rotate(-18 150 48)" fill="#E2434E" />
      <ellipse cx="62" cy="72" rx="20" ry="14" transform="rotate(30 62 72)" fill="#FFC21A" />
      <ellipse cx="104" cy="56" rx="16" ry="11" fill="#FFB3C1" />
      <ellipse cx="160" cy="112" rx="22" ry="14" transform="rotate(-20 160 112)" fill="#3DA9FC" />
    </svg>
  );
}
