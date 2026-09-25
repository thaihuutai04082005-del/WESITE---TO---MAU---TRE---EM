// Hình minh hoạ cho các thẻ ở trang chính — vẽ bằng SVG, ghép với linh vật lấy từ kho tranh (/mascots).
const INK = '#1B2A38';

function Crayon({ x, y, rot, color }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
      <rect x="0" y="0" width="46" height="13" rx="4" fill={color} />
      <polygon points="46,0 60,6.5 46,13" fill={color} />
      <rect x="10" y="0" width="7" height="13" fill="#FFFFFF" opacity="0.55" stroke="none" />
    </g>
  );
}

/** Tô màu: tờ giấy có hình gấu + bút sáp + linh vật mèo cầm bút. */
export function ColorArt() {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 220 150" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g transform="rotate(-8 90 110)">
          <rect x="30" y="78" width="120" height="62" rx="6" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
          <circle cx="90" cy="110" r="18" fill="#FFE0B5" stroke={INK} strokeWidth="2" />
          <circle cx="76" cy="95" r="6" fill="#FFE0B5" stroke={INK} strokeWidth="2" />
          <circle cx="104" cy="95" r="6" fill="#FFE0B5" stroke={INK} strokeWidth="2" />
          <circle cx="84" cy="108" r="2" fill={INK} />
          <circle cx="96" cy="108" r="2" fill={INK} />
          <path d="M85 116 Q90 121 95 116" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </g>
        <Crayon x={8} y={112} rot={-18} color="#FF5F7E" />
        <Crayon x={128} y={124} rot={10} color="#4FA3E0" />
      </svg>
      <img src="/mascots/meo.svg" alt="" className="absolute bottom-2 right-[14%] h-[80%] drop-shadow-sm" draggable={false} />
    </div>
  );
}

/** Đấu trường: cúp vàng có ngôi sao. */
export function TrophyArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M78 34 Q50 34 52 58 Q55 80 84 82" fill="none" stroke="#E6A817" strokeWidth="9" strokeLinecap="round" />
        <path d="M142 34 Q170 34 168 58 Q165 80 136 82" fill="none" stroke="#E6A817" strokeWidth="9" strokeLinecap="round" />
        <path d="M72 22 H148 Q150 84 110 96 Q70 84 72 22 Z" fill="#FFD54F" />
        <path d="M84 30 Q86 70 104 84" fill="none" stroke="#FFF3B0" strokeWidth="6" strokeLinecap="round" />
        <rect x="100" y="94" width="20" height="18" fill="#E6A817" />
        <rect x="82" y="110" width="56" height="12" rx="4" fill="#FFC94D" />
        <rect x="74" y="120" width="72" height="16" rx="5" fill="#8B5A2B" />
        <polygon points="110,38 116,52 131,53 119,62 123,77 110,68 97,77 101,62 89,53 104,52" fill="#FFF3B0" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

/** Tô cùng nhau: 3 bạn (mèo, gấu, thỏ) cùng tô chung 1 bức tranh — nhìn là biết hoạt động nhóm. */
export function TogetherArt() {
  const heart = (x, y, s, c) => (
    <path
      d={`M${x} ${y + 7 * s} C${x - 11 * s} ${y - 1 * s} ${x - 7 * s} ${y - 10 * s} ${x} ${y - 4 * s} C${x + 7 * s} ${y - 10 * s} ${x + 11 * s} ${y - 1 * s} ${x} ${y + 7 * s} Z`}
      fill={c}
      stroke={INK}
      strokeWidth="1.8"
    />
  );
  return (
    <svg viewBox="0 0 176 150" className="h-full w-full" aria-hidden="true">
      {heart(10, 26, 1, '#FF7AA2')}
      {heart(168, 30, 0.9, '#FF9EC0')}
      {/* 3 bạn đứng sát nhau sau tờ tranh chung */}
      <image href="/mascots/meo.svg" x="-4" y="12" width="74" height="100" preserveAspectRatio="xMidYMax meet" />
      <image href="/mascots/tho.svg" x="110" y="2" width="70" height="110" preserveAspectRatio="xMidYMax meet" />
      <image href="/mascots/gau.svg" x="44" y="4" width="86" height="110" preserveAspectRatio="xMidYMax meet" />
      {/* Tờ tranh chung: cầu vồng đang được tô bởi 3 màu khác nhau */}
      <g transform="rotate(-3 88 122)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <rect x="6" y="96" width="164" height="50" rx="8" fill="#FFFFFF" />
        <path d="M40 138 A48 30 0 0 1 136 138" fill="none" stroke="#FF7AA2" strokeWidth="9" />
        <path d="M54 138 A34 22 0 0 1 122 138" fill="none" stroke="#FFD54F" strokeWidth="9" />
        <path d="M68 138 A20 14 0 0 1 108 138" fill="none" stroke="#E3F0FF" strokeWidth="9" />
        <path d="M40 138 A48 30 0 0 1 136 138 M54 138 A34 22 0 0 1 122 138 M68 138 A20 14 0 0 1 108 138" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.35" />
      </g>
      <Crayon x={16} y={110} rot={-32} color="#FF7AA2" />
      <Crayon x={84} y={96} rot={62} color="#FFD54F" />
      <Crayon x={166} y={102} rot={200} color="#4FA3E0" />
    </svg>
  );
}

/** Bốc thẻ: 3 thẻ xoè + hộp quà. */
export function GachaArt() {
  const card = (x, rot, color, mark) => (
    <g transform={`translate(${x} 18) rotate(${rot} 30 44)`} stroke={INK} strokeWidth="2.5">
      <rect width="60" height="84" rx="9" fill={color} />
      <rect x="6" y="6" width="48" height="72" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      {mark === '?' ? (
        <text x="30" y="56" textAnchor="middle" fontSize="38" fontWeight="900" fontFamily="Baloo 2, Nunito, sans-serif" fill="#FFFFFF" stroke="none">?</text>
      ) : (
        <polygon points="30,24 36,38 51,39 39,48 43,63 30,55 17,63 21,48 9,39 24,38" fill="#FFFFFF" strokeWidth="1.5" />
      )}
    </g>
  );
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      {card(46, -18, '#FF7AA2', 'star')}
      {card(86, -4, '#4FA3E0', '?')}
      {card(126, 12, '#5DADE2', '?')}
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <rect x="70" y="92" width="80" height="50" rx="5" fill="#9B6BFF" />
        <rect x="64" y="80" width="92" height="18" rx="5" fill="#B38BFF" />
        <rect x="102" y="80" width="16" height="62" fill="#FFD54F" />
        <path d="M110 80 C96 60 78 66 88 78 Z M110 80 C124 60 142 66 132 78 Z" fill="#FFD54F" />
      </g>
    </svg>
  );
}

/** Truyện tranh: cuốn truyện mở — trang trái là tranh chú gấu, trang phải là lời thoại & chú thích. */
export function BookArt({ bubble = 'Xin chào!' }) {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        {/* bìa + gáy sách */}
        <path d="M8 40 Q60 26 110 42 Q160 26 212 40 L212 146 Q160 134 110 148 Q60 134 8 146 Z" fill="#FF8A65" />
        {/* hai trang giấy */}
        <path d="M16 34 Q62 22 110 38 L110 140 Q62 128 16 140 Z" fill="#FFFDF6" />
        <path d="M204 34 Q158 22 110 38 L110 140 Q158 128 204 140 Z" fill="#FFFDF6" />
        {/* dải đánh dấu trang */}
        <path d="M184 27 L184 58 L191 51 L198 58 L198 25" fill="#FF5F7E" strokeWidth="2" />
        {/* trang trái: khung tranh có chú gấu */}
        <rect x="26" y="42" width="76" height="72" rx="6" fill="#BDE6FF" />
        <path d="M26 98 Q50 90 72 98 T102 96 L102 108 Q102 114 96 114 L32 114 Q26 114 26 108 Z" fill="#8BD17C" strokeWidth="2" />
        <circle cx="90" cy="54" r="6" fill="#FFD54F" strokeWidth="2" />
      </g>
      <image href="/mascots/gau.svg" x="36" y="47" width="52" height="66" preserveAspectRatio="xMidYMax meet" />
      <g stroke="#8FA8BF" strokeWidth="2.5" strokeLinecap="round">
        <path d="M30 124 H96" />
        <path d="M30 131 H78" />
      </g>
      {/* trang phải: bong bóng lời thoại chỉ về chú gấu + chú thích */}
      <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
        <path d="M122 46 H192 Q198 46 198 52 V76 Q198 82 192 82 H132 L118 92 L124 80 Q118 80 118 74 V52 Q118 46 122 46 Z" fill="#FFFFFF" />
      </g>
      <text x="158" y="69" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="Baloo 2, Nunito, sans-serif" fill={INK}>
        {bubble}
      </text>
      <g stroke="#8FA8BF" strokeWidth="2.5" strokeLinecap="round">
        <path d="M122 100 H196" />
        <path d="M122 110 H190" />
        <path d="M122 120 H172" />
      </g>
      <circle cx="194" cy="128" r="6" fill="#FFD54F" stroke={INK} strokeWidth="1.8" />
    </svg>
  );
}

/** Nhiệm vụ: ngôi sao cười + bảng nhiệm vụ có dấu tick. */
export function MissionArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <g transform="rotate(-12 80 108)">
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

/** Mặt trời + mây trang trí góc phải lời chào. */
export function SunCloud({ className = '' }) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden="true">
      <g stroke="#FFC94D" strokeWidth="5" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          return <path key={a} d={`M${60 + 32 * Math.cos(r)} ${42 + 32 * Math.sin(r)} L${60 + 42 * Math.cos(r)} ${42 + 42 * Math.sin(r)}`} />;
        })}
      </g>
      <circle cx="60" cy="42" r="24" fill="#FFD54F" />
      <path d="M70 96 Q52 96 56 80 Q56 64 76 66 Q84 48 104 54 Q122 46 130 64 Q150 64 146 82 Q152 96 136 96 Z" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
}
