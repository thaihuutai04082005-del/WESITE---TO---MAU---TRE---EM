// Hình minh họa phòng chờ (SVG thuần, không tia sáng): giá vẽ + cửa sổ vòm + cốc bút chì và chồng sách.
export function PaletteBrush() {
  return (
    <svg viewBox="0 0 140 92" className="wr-palette" aria-hidden="true">
      <path d="M60 8C28 8 6 28 8 52c2 22 22 32 40 30 12-1 12-12 22-14 10-2 24 2 34-10C118 36 96 8 60 8Z" fill="#FFD9A0" stroke="#E8923A" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="44" cy="62" rx="7" ry="6" fill="#FFF6E5" stroke="#E8923A" strokeWidth="3" />
      <circle cx="30" cy="36" r="7" fill="#FF6B6B" stroke="#C94545" strokeWidth="2" />
      <circle cx="52" cy="26" r="7" fill="#FFD23F" stroke="#C99B12" strokeWidth="2" />
      <circle cx="74" cy="30" r="7" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="2" />
      <circle cx="24" cy="56" r="6" fill="#5FD068" stroke="#3A9F43" strokeWidth="2" />
      <g transform="translate(106 44) rotate(38)">
        <rect x="-6" y="-46" width="12" height="60" rx="6" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="3" />
        <rect x="-8" y="13" width="16" height="11" fill="#F2F2F2" stroke="#9AA3AD" strokeWidth="2" />
        <path d="M-8 24h16c0 10-3 18-8 24-5-6-8-14-8-24Z" fill="#FFB454" stroke="#E8923A" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function WaitingScene() {
  return (
    <svg viewBox="0 -16 560 146" className="wr-scene" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      {/* cửa sổ vòm */}
      <path d="M190 124V62C190 30 218 10 280 10s90 20 90 52v62Z" fill="#FFCC66" stroke="#E8923A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M202 120V64c0-24 22-40 78-40s78 16 78 40v56Z" fill="#BFE8FF" />
      <path d="M202 120V90c20-14 40-8 78-2 38 6 58-8 78 4v28Z" fill="#6FD36B" />
      <ellipse cx="236" cy="52" rx="20" ry="8" fill="#fff" opacity=".9" />
      <ellipse cx="318" cy="64" rx="16" ry="7" fill="#fff" opacity=".9" />
      <path d="M280 24v96M202 74h156" stroke="#FFCC66" strokeWidth="6" />
      {/* giá vẽ + tranh hoa */}
      <path d="M72 124l22-88M142 124l-22-88M107 36l0 88" stroke="#E08A3C" strokeWidth="7" strokeLinecap="round" />
      <rect x="64" y="22" width="86" height="76" rx="8" fill="#FFF8EA" stroke="#E8923A" strokeWidth="5" />
      <circle cx="107.0" cy="37.0" r="9" fill="#FF8E8E" stroke="#FF6B6B" strokeWidth="1.5" /><circle cx="121.3" cy="47.4" r="9" fill="#FF8E8E" stroke="#FF6B6B" strokeWidth="1.5" /><circle cx="115.8" cy="64.1" r="9" fill="#FF8E8E" stroke="#FF6B6B" strokeWidth="1.5" /><circle cx="98.2" cy="64.1" r="9" fill="#FF8E8E" stroke="#FF6B6B" strokeWidth="1.5" /><circle cx="92.7" cy="47.4" r="9" fill="#FF8E8E" stroke="#FF6B6B" strokeWidth="1.5" />
      <circle cx="107" cy="52" r="7" fill="#FFD23F" stroke="#E8A317" strokeWidth="1.5" />
      <path d="M107 70v22M107 82c-8-2-12-8-12-12M107 86c8-2 12-8 12-12" stroke="#4CB85A" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* hũ màu */}
      <rect x="158" y="96" width="26" height="28" rx="6" fill="#CFEFFF" stroke="#5AAEE0" strokeWidth="3" />
      <rect x="156" y="90" width="30" height="10" rx="4" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="2" />
      {/* chồng sách + cốc bút */}
      <rect x="392" y="104" width="86" height="20" rx="4" fill="#FF8E8E" stroke="#D95C5C" strokeWidth="3" />
      <rect x="398" y="88" width="76" height="18" rx="4" fill="#FFE07A" stroke="#D9A61F" strokeWidth="3" />
      <rect x="404" y="74" width="64" height="16" rx="4" fill="#9ED8FF" stroke="#4B9CD6" strokeWidth="3" />
      <g transform="rotate(-14 478 64)"><path d="M473 4l5-12 5 12z" fill="#FFD9A0" stroke="#E8923A" strokeWidth="1.5" strokeLinejoin="round" /><path d="M476 -4l2-4 2 4z" fill="#555" /><rect x="473" y="4" width="10" height="72" rx="2" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="2" /></g>
      <g transform="rotate(5 498 64)"><path d="M493 4l5-12 5 12z" fill="#FFD9A0" stroke="#E8923A" strokeWidth="1.5" strokeLinejoin="round" /><path d="M496 -4l2-4 2 4z" fill="#555" /><rect x="493" y="4" width="10" height="72" rx="2" fill="#FF6B6B" stroke="#C94545" strokeWidth="2" /></g>
      <g transform="rotate(18 516 64)"><path d="M511 4l5-12 5 12z" fill="#FFD9A0" stroke="#E8923A" strokeWidth="1.5" strokeLinejoin="round" /><path d="M514 -4l2-4 2 4z" fill="#555" /><rect x="511" y="4" width="10" height="72" rx="2" fill="#5FD068" stroke="#3A9F43" strokeWidth="2" /></g>
      <path d="M470 56h58l-5 50c-1 6-5 10-12 10h-24c-7 0-11-4-12-10Z" fill="#FFB23F" stroke="#E8923A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M499 70l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" fill="#FFE07A" stroke="#D9A61F" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
