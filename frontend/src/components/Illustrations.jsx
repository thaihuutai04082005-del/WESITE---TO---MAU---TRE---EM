// Hình minh hoạ cho các thẻ ở trang chính — vẽ bằng SVG, ghép với linh vật lấy từ kho tranh (/mascots).
const INK = '#1B2A38';

function Crayon({ x, y, rot, color, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
      <rect x="0" y="0" width="46" height="13" rx="4" fill={color} />
      <polygon points="46,0 60,6.5 46,13" fill={color} />
      <rect x="10" y="0" width="7" height="13" fill="#FFFFFF" opacity="0.55" stroke="none" />
    </g>
  );
}

/** Tô màu: bảng màu có 5 viên màu + cây cọ xanh (hình tách từ ảnh gốc, /public/mascots/tomau.webp). */
export function ColorArt() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      <image href="/mascots/tomau.webp" x="4" y="2" width="192" height="146" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

/** Đấu trường: cúp vàng có ngôi sao. */
export function TrophyArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <image href="/mascots/daututruong.webp" x="26" y="2" width="168" height="146" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

/** Tô cùng nhau: mèo, gấu, thỏ cùng tô một tờ tranh cầu vồng (hình tách từ ảnh gốc, /public/mascots/tocungnhau.webp). */
export function TogetherArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <image href="/mascots/tocungnhau.webp" x="8" y="6" width="204" height="138" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

/** Bốc thẻ: 3 thẻ xoè + hộp quà. */
export function GachaArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <image href="/mascots/bocthe.webp" x="22" y="2" width="176" height="146" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

/** Truyện tranh: cuốn truyện mở — trang trái là tranh chú gấu, trang phải là lời thoại "Xin chào!" (hình tách từ ảnh gốc, /public/mascots/truyentranh.webp). */
export function BookArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <image href="/mascots/truyentranh.webp" x="4" y="10" width="212" height="126" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

/** Nhiệm vụ: ngôi sao cười + bảng nhiệm vụ có dấu tick. */
export function MissionArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <g transform="translate(0 -10) rotate(-12 80 108)">
          <rect x="44" y="66" width="72" height="82" rx="8" fill="#FFFFFF" />
          <rect x="64" y="60" width="32" height="14" rx="4" fill="#4FA3E0" />
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(0 ${k * 22})`}>
              <rect x="54" y="84" width="14" height="14" rx="3" fill={k < 2 ? '#4CD787' : '#FFFFFF'} />
              {k < 2 && <path d="M57 91 L60 95 L66 87" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />}
              <path d={`M74 91 H${104 - k * 6}`} stroke="#8FA8BF" strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
        </g>
        <polygon points="150,8 166,44 205,47 175,72 185,110 150,90 115,110 125,72 95,47 134,44" fill="#FFD54F" strokeWidth="3" />
      </g>
      <circle cx="140" cy="58" r="4.5" fill={INK} />
      <circle cx="160" cy="58" r="4.5" fill={INK} />
      <ellipse cx="131" cy="68" rx="6" ry="4" fill="#FFB3C1" />
      <ellipse cx="169" cy="68" rx="6" ry="4" fill="#FFB3C1" />
      <path d="M142 68 Q150 78 158 68" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Mặt trời + mây trang trí góc phải lời chào: mặt trời và đám mây nhún lên xuống. */
export function SunCloud({ className = '' }) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden="true">
      <g className="sun-bob">
        {/* Mặt trời đặt thấp xuống để luôn dính một phần vào đám mây dù đang nhún lên */}
        <g transform="translate(0 14)">
          <g stroke="#FFC94D" strokeWidth="5" strokeLinecap="round">
            {[0, 135, 180, 225, 270, 315].map((a) => {
              const r = (a * Math.PI) / 180;
              return <path key={a} d={`M${60 + 32 * Math.cos(r)} ${42 + 32 * Math.sin(r)} L${60 + 42 * Math.cos(r)} ${42 + 42 * Math.sin(r)}`} />;
            })}
          </g>
          <circle cx="60" cy="42" r="24" fill="#FFD54F" />
        </g>
      </g>
      <path className="cloud-bob" d="M70 96 Q52 96 56 80 Q56 64 76 66 Q84 48 104 54 Q122 46 130 64 Q150 64 146 82 Q152 96 136 96 Z" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
}

/** Bảng vàng: vương miện trên đám mây nhỏ. */
export function CrownCloudArt() {
  return (
    <svg viewBox="0 0 140 90" className="h-full w-full" aria-hidden="true">
      <path d="M22 80 Q8 80 12 68 Q10 56 26 58 Q32 44 50 50 Q64 38 80 50 Q98 46 102 60 Q120 60 116 74 Q118 84 104 82 Z" fill="#FFFFFF" opacity="0.95" />
      <g transform="translate(40 14) rotate(-8)" stroke="#B7791F" strokeWidth="2.5" strokeLinejoin="round">
        <polygon points="4,44 0,10 16,26 30,2 44,26 60,10 56,44" fill="#FFD54F" />
        <rect x="4" y="42" width="52" height="9" rx="3" fill="#F2B705" />
        <circle cx="30" cy="30" r="5" fill="#FF5F7E" strokeWidth="2" />
      </g>
      <path d="M18 30 l4 -6 l4 6 l-4 6 Z" fill="#FF9EC0" />
      <path d="M118 30 l3 -5 l3 5 l-3 5 Z" fill="#FFD54F" />
    </svg>
  );
}

/** Các trận của bé: gấu nằm ôm đám mây + tim. */
export function BearCloudArt() {
  return (
    <svg viewBox="0 0 150 90" className="h-full w-full" aria-hidden="true">
      <path d="M20 86 Q4 86 8 72 Q6 60 24 62 Q30 50 48 56 Q60 46 76 56 Q96 50 100 64 Q124 62 122 76 Q126 88 108 86 Z" fill="#FFFFFF" opacity="0.95" />
      <image href="/mascots/gau.svg" x="36" y="0" width="80" height="80" preserveAspectRatio="xMidYMax meet" />
      <path d="M128 36 C120 30 122 22 128 26 C134 22 136 30 128 36 Z" fill="#FF7AA2" />
      <path d="M22 30 C16 25 18 19 22 22 C26 19 28 25 22 30 Z" fill="#FF9EC0" />
    </svg>
  );
}

/** Đấu trường — đầu trang: cúp vàng lớn trong vầng hào quang, tia sáng và ngôi sao lấp lánh. */
export function GrandTrophy() {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 140 140" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="gt-halo" cx="50%" cy="48%" r="50%">
          <stop offset="0" stopColor="#FFF3B0" />
          <stop offset="0.6" stopColor="#FFE08A" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFE08A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gt-cup" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F2B705" />
          <stop offset="0.35" stopColor="#FFE680" />
          <stop offset="0.7" stopColor="#FFC61A" />
          <stop offset="1" stopColor="#D99A00" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="66" r="66" fill="url(#gt-halo)" />
      {rays.map((a) => (
        <rect key={a} x="68" y="4" width="4" height="16" rx="2" fill="#FFC94D" opacity="0.75" transform={`rotate(${a} 70 66)`} />
      ))}
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M44 36 Q22 36 24 56 Q27 74 50 76" fill="none" stroke="#D99A00" strokeWidth="8" strokeLinecap="round" />
        <path d="M96 36 Q118 36 116 56 Q113 74 90 76" fill="none" stroke="#D99A00" strokeWidth="8" strokeLinecap="round" />
        <path d="M40 26 H100 Q102 80 70 90 Q38 80 40 26 Z" fill="url(#gt-cup)" />
        <path d="M50 34 Q52 66 64 80" fill="none" stroke="#FFF7C8" strokeWidth="5" strokeLinecap="round" />
        <rect x="62" y="88" width="16" height="14" fill="#E6A817" />
        <rect x="48" y="100" width="44" height="10" rx="4" fill="#FFC94D" />
        <rect x="40" y="108" width="60" height="16" rx="5" fill="#8B5A2B" />
        <rect x="54" y="112" width="32" height="8" rx="2" fill="#FFD54F" strokeWidth="2" />
        <polygon points="70,38 75.5,50 88,51 78.5,59 81.5,72 70,65 58.5,72 61.5,59 52,51 64.5,50" fill="#FFFFFF" strokeWidth="2.5" />
      </g>
      <path d="M16 16 l2.5 -6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 Z" fill="#FF5F7E" />
      <path d="M116 24 l2.5 -6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 Z" fill="#FF9EC0" />
      <path d="M118 102 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 Z" fill="#4FA3E0" />
    </svg>
  );
}

/** Trang Chọn chủ đề: gấu họa sĩ cầm bảng màu và cọ, kèm ngôi sao lấp lánh. */
export function PainterBear() {
  const star = (x, y, r, fill) => {
    const pts = Array.from({ length: 10 }, (_, k) => {
      const a = ((k * 36 - 90) * Math.PI) / 180;
      const rr = k % 2 ? r * 0.45 : r;
      return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return <polygon points={pts} fill={fill} stroke={INK} strokeWidth="2" strokeLinejoin="round" />;
  };
  return (
    <svg viewBox="0 0 200 180" className="h-full w-full" aria-hidden="true">
      {star(14, 120, 9, '#FFD54F')}
      {star(178, 28, 10, '#7FC8C8')}
      <image href="/mascots/gau.svg" x="30" y="4" width="130" height="170" preserveAspectRatio="xMidYMax meet" />
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        {/* Cọ vẽ giơ lên bên phải */}
        <g transform="translate(-12 14) rotate(35 160 110)">
          <rect x="154" y="62" width="12" height="62" rx="5" fill="#4FA3E0" />
          <rect x="152" y="54" width="16" height="12" rx="2" fill="#CFD8DC" />
          <path d="M152 54 Q160 26 168 54 Z" fill="#1B2A38" />
        </g>
        {/* Bảng màu bên trái */}
        <path d="M18 150 Q14 124 44 120 Q74 116 78 138 Q80 152 66 150 Q56 148 58 160 Q58 172 40 170 Q20 168 18 150 Z" fill="#F6D1A4" />
        <circle cx="34" cy="136" r="5.5" fill="#FF5F5F" strokeWidth="1.8" />
        <circle cx="48" cy="130" r="5.5" fill="#FFD54F" strokeWidth="1.8" />
        <circle cx="62" cy="132" r="5.5" fill="#4CD787" strokeWidth="1.8" />
        <circle cx="30" cy="152" r="5.5" fill="#4FA3E0" strokeWidth="1.8" />
        <circle cx="44" cy="158" r="4.5" fill="#FFFFFF" strokeWidth="1.8" />
      </g>
    </svg>
  );
}
