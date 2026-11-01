// Hình minh họa phòng chờ (SVG thuần, không tia sáng): giá vẽ + cửa sổ vòm + cốc bút chì và chồng sách.
export function PaletteBrush() {
  return (
    <svg viewBox="0 0 120 90" className="wr-palette" aria-hidden="true">
      <path d="M60 8C28 8 6 28 8 52c2 22 22 32 40 30 12-1 12-12 22-14 10-2 24 2 34-10C118 36 96 8 60 8Z" fill="#FFD9A0" stroke="#E8923A" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="44" cy="62" rx="7" ry="6" fill="#FFF6E5" stroke="#E8923A" strokeWidth="3" />
      <circle cx="30" cy="36" r="7" fill="#FF6B6B" stroke="#C94545" strokeWidth="2" />
      <circle cx="52" cy="26" r="7" fill="#FFD23F" stroke="#C99B12" strokeWidth="2" />
      <circle cx="74" cy="30" r="7" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="2" />
      <circle cx="24" cy="56" r="6" fill="#5FD068" stroke="#3A9F43" strokeWidth="2" />
      <g transform="rotate(38 96 40)">
        <rect x="90" y="-4" width="12" height="46" rx="6" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="3" />
        <rect x="88" y="38" width="16" height="10" fill="#F2F2F2" stroke="#9AA3AD" strokeWidth="2" />
        <path d="M88 48h16c0 10-3 22-8 30-5-8-8-20-8-30Z" fill="#FFB454" stroke="#E8923A" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function WaitingScene() {
  return (
    <svg viewBox="0 0 560 130" className="wr-scene" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
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
      <circle cx="107" cy="54" r="12" fill="#FF6B6B" /><circle cx="94" cy="46" r="8" fill="#FF8E8E" /><circle cx="120" cy="46" r="8" fill="#FF8E8E" />
      <circle cx="94" cy="62" r="8" fill="#FF8E8E" /><circle cx="120" cy="62" r="8" fill="#FF8E8E" />
      <circle cx="107" cy="54" r="6" fill="#FFD23F" />
      <path d="M107 66v24M107 80c-8-2-12-8-12-12M107 84c8-2 12-8 12-12" stroke="#4CB85A" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* hũ màu */}
      <rect x="158" y="96" width="26" height="28" rx="6" fill="#CFEFFF" stroke="#5AAEE0" strokeWidth="3" />
      <rect x="156" y="90" width="30" height="10" rx="4" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="2" />
      {/* chồng sách + cốc bút */}
      <rect x="392" y="104" width="86" height="20" rx="4" fill="#FF8E8E" stroke="#D95C5C" strokeWidth="3" />
      <rect x="398" y="88" width="76" height="18" rx="4" fill="#FFE07A" stroke="#D9A61F" strokeWidth="3" />
      <rect x="404" y="74" width="64" height="16" rx="4" fill="#9ED8FF" stroke="#4B9CD6" strokeWidth="3" />
      <g transform="rotate(-14 470 40)"><rect x="462" y="6" width="9" height="46" rx="3" fill="#4DB7FF" stroke="#2B83C9" strokeWidth="2" /><path d="M462 6l4.5-8 4.5 8z" fill="#FFB454" /></g>
      <g transform="rotate(6 492 40)"><rect x="488" y="4" width="9" height="46" rx="3" fill="#FF6B6B" stroke="#C94545" strokeWidth="2" /><path d="M488 4l4.5-8 4.5 8z" fill="#FFB454" /></g>
      <g transform="rotate(20 512 44)"><rect x="508" y="10" width="9" height="42" rx="3" fill="#5FD068" stroke="#3A9F43" strokeWidth="2" /><path d="M508 10l4.5-8 4.5 8z" fill="#FFB454" /></g>
      <path d="M470 56h58l-5 50c-1 6-5 10-12 10h-24c-7 0-11-4-12-10Z" fill="#FFB23F" stroke="#E8923A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M499 70l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" fill="#FFE07A" stroke="#D9A61F" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
