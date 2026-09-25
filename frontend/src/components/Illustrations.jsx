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

/** Tô màu: tờ giấy có bông hoa đang tô dở + 1 cây bút sáp + mèo ngồi bên cạnh — bố cục gọn, không đè chéo. */
export function ColorArt() {
  const petal = (k) => {
    const a = ((k * 72 - 90) * Math.PI) / 180;
    return { cx: 60 + 15 * Math.cos(a), cy: 70 + 15 * Math.sin(a) };
  };
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      <g transform="rotate(-4 62 88)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <rect x="12" y="34" width="100" height="104" rx="8" fill="#FFFFFF" />
        <path d="M60 84 V124" fill="none" stroke="#4CAF50" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M60 108 Q76 98 84 104 Q74 116 60 112 Z" fill="#8BD17C" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((k) => (
          <circle key={k} {...petal(k)} r="11" fill={k < 3 ? '#FF9EC0' : '#FFFFFF'} strokeWidth="2" />
        ))}
        <circle cx="60" cy="70" r="8" fill="#FFD54F" strokeWidth="2" />
      </g>
      <Crayon x={18} y={134} rot={-4} color="#FF7AA2" />
      <image href="/mascots/meo.svg" x="102" y="18" width="96" height="124" preserveAspectRatio="xMidYMax meet" />
    </svg>
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

/** Tô cùng nhau: 3 bạn đứng thẳng hàng sau cùng một tờ tranh cầu vồng — gọn, dễ nhìn, thấy ngay là nhóm. */
export function TogetherArt() {
  return (
    <svg viewBox="0 0 164 150" className="h-full w-full" aria-hidden="true">
      <path d="M82 22 C74 16 76 6 82 11 C88 6 90 16 82 22 Z" fill="#FF7AA2" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <image href="/mascots/meo.svg" x="0" y="32" width="58" height="80" preserveAspectRatio="xMidYMax meet" />
      <image href="/mascots/gau.svg" x="51" y="26" width="62" height="86" preserveAspectRatio="xMidYMax meet" />
      <image href="/mascots/tho.svg" x="108" y="12" width="56" height="100" preserveAspectRatio="xMidYMax meet" />
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <rect x="6" y="100" width="152" height="44" rx="10" fill="#FFFFFF" />
        <path d="M44 136 A38 24 0 0 1 120 136" fill="none" stroke="#FF7AA2" strokeWidth="8" />
        <path d="M56 136 A26 16 0 0 1 108 136" fill="none" stroke="#FFD54F" strokeWidth="8" />
        <path d="M68 136 A14 9 0 0 1 96 136" fill="none" stroke="#4FA3E0" strokeWidth="8" />
      </g>
      {/* Mỗi bạn cầm 1 cây bút, màu trùng dải cầu vồng đang tô */}
      <Crayon x={34.5} y={93.2} rot={62} scale={0.62} color="#FF7AA2" />
      <Crayon x={66.5} y={85.2} rot={62} scale={0.62} color="#FFD54F" />
      <Crayon x={102.5} y={91.2} rot={62} scale={0.62} color="#4FA3E0" />
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
