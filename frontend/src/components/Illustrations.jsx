// Hình minh hoạ cho các thẻ ở trang chính — vẽ bằng SVG, ghép với linh vật lấy từ kho tranh (/mascots).
const INK = '#1B2A38';

function Sparkles({ color = '#FFC94D', x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="5" strokeLinecap="round">
      <path d="M0 0 L10 6" />
      <path d="M-4 16 L8 16" />
      <path d="M0 32 L10 26" />
    </g>
  );
}

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
        <Sparkles x="96" y="18" />
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
      <Sparkles x="40" y="40" />
      <g transform="translate(200 40) scale(-1 1)">
        <Sparkles />
      </g>
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

/** Tô cùng nhau: linh vật thỏ + tờ giấy vẽ hoa. */
export function TogetherArt() {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 220 150" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <Sparkles x="60" y="24" />
        <g transform="rotate(8 80 115)">
          <rect x="18" y="88" width="120" height="54" rx="6" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={62 + 9 * Math.cos(((a - 90) * Math.PI) / 180)} cy={114 + 9 * Math.sin(((a - 90) * Math.PI) / 180)} r="7" fill="#FF9EC0" stroke={INK} strokeWidth="1.8" />
          ))}
          <circle cx="62" cy="114" r="5" fill="#FFD54F" stroke={INK} strokeWidth="1.8" />
          <path d="M40 132 Q60 124 88 134" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" />
        </g>
        <Crayon x={120} y={80} rot={-58} color="#4CD787" />
      </svg>
      <img src="/mascots/tho.svg" alt="" className="absolute bottom-2 right-[14%] h-[88%] drop-shadow-sm" draggable={false} />
    </div>
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
      <g stroke="#FF7AA2" strokeWidth="5" strokeLinecap="round">
        <path d="M14 70 L26 74" />
        <path d="M16 90 L28 86" />
      </g>
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

/** Truyện tranh: cuốn sách mở có tranh + linh vật gấu. */
export function BookArt() {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 220 150" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <Sparkles x="30" y="30" />
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M20 58 Q55 46 88 60 L88 138 Q55 124 20 136 Z" fill="#FFFFFF" />
          <path d="M156 58 Q121 46 88 60 L88 138 Q121 124 156 136 Z" fill="#FFFFFF" />
          <path d="M28 66 Q54 58 80 68 L80 104 Q54 96 28 102 Z" fill="#BDE6FF" />
          <circle cx="44" cy="76" r="7" fill="#FFD54F" />
          <path d="M28 102 L44 88 L56 98 L66 90 L80 104 Q54 96 28 102 Z" fill="#8BD17C" />
          <path d="M96 70 Q122 62 146 70 M96 82 Q122 74 146 82 M96 94 Q122 86 140 94" fill="none" strokeWidth="2" stroke="#8FA8BF" />
          <path d="M16 136 Q55 126 88 142 Q121 126 160 136 L160 144 Q121 134 88 148 Q55 134 16 144 Z" fill="#FF8A65" />
        </g>
      </svg>
      <img src="/mascots/gau.svg" alt="" className="absolute bottom-2 right-[12%] h-[78%] drop-shadow-sm" draggable={false} />
    </div>
  );
}

/** Nhiệm vụ: ngôi sao cười + bảng nhiệm vụ có dấu tick. */
export function MissionArt() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <g stroke="#7DE2FF" strokeWidth="5" strokeLinecap="round">
        <path d="M188 40 L198 34" />
        <path d="M190 58 L202 58" />
      </g>
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
