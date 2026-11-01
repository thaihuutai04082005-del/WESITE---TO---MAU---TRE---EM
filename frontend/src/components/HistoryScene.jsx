// Hình minh họa trang Lịch sử tô (SVG thuần): giá vẽ có ngôi sao, hũ màu, cốc cọ, bụi cây hai góc.
export function HistoryEasel() {
  return (
    <svg viewBox="0 0 346 150" className="hs-easel" aria-hidden="true">
      <path d="M0 140c14-34 46-44 74-34 10-22 40-26 54-6 18-14 50-8 58 18h144v22H0Z" fill="#7BCB5E" />
      <path d="M20 146c10-20 30-26 48-18 8-12 24-12 32-2" stroke="#A6E083" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M90 140l30-100M190 140l-30-100" stroke="#5C7FA6" strokeWidth="9" strokeLinecap="round" />
      <path d="M140 40l0 100" stroke="#5C7FA6" strokeWidth="9" strokeLinecap="round" />
      <g transform="rotate(-6 140 70)">
        <rect x="88" y="16" width="104" height="84" rx="6" fill="#fff" stroke="#9DB7D3" strokeWidth="5" />
        <path d="M140 34l9 18 20 3-14 14 3 20-18-10-18 10 3-20-14-14 20-3z" fill="#FFD23F" stroke="#E8A317" strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d="M96 106h88" stroke="#5C7FA6" strokeWidth="8" strokeLinecap="round" />
      <rect x="206" y="104" width="38" height="34" rx="8" fill="#DDF1FF" stroke="#6FB3E8" strokeWidth="3" />
      <rect x="203" y="96" width="44" height="12" rx="5" fill="#3FA3F0" stroke="#2B83C9" strokeWidth="2" />
      <rect x="252" y="112" width="30" height="26" rx="7" fill="#F2F7FF" stroke="#9DB7D3" strokeWidth="3" />
      <rect x="250" y="105" width="34" height="10" rx="4" fill="#C9D6E6" stroke="#9DB7D3" strokeWidth="2" />
      {/* cọ trong cốc */}
      <g transform="rotate(-18 296 60)"><rect x="291" y="14" width="10" height="56" rx="5" fill="#6FC3FF" stroke="#2B83C9" strokeWidth="2" /><path d="M289 8h14c0 10-3 14-7 14s-7-4-7-14z" fill="#4A8FD8" /></g>
      <g transform="rotate(4 310 60)"><rect x="305" y="8" width="10" height="60" rx="5" fill="#FFD27A" stroke="#E8A317" strokeWidth="2" /><path d="M303 2h14c0 10-3 14-7 14s-7-4-7-14z" fill="#FFB23F" /></g>
      <g transform="rotate(22 326 60)"><rect x="321" y="16" width="10" height="54" rx="5" fill="#FFD27A" stroke="#E8A317" strokeWidth="2" /><path d="M319 10h14c0 10-3 14-7 14s-7-4-7-14z" fill="#FFB23F" /></g>
      <path d="M284 66h54l-5 62c-1 8-6 12-14 12h-16c-8 0-13-4-14-12Z" fill="#F4FAFF" stroke="#9DB7D3" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function Bush({ flip = false }) {
  return (
    <svg viewBox="0 0 160 130" className={`hs-bush ${flip ? 'hs-bush-r' : 'hs-bush-l'}`} aria-hidden="true">
      <path d="M0 130V70c10-28 34-30 46-14 6-26 36-34 52-14 12-16 38-8 42 18 8-2 14 2 20 6v64Z" fill="#6CC24A" />
      <path d="M12 130V86c8-14 24-14 32-4" stroke="#8FD86B" strokeWidth="6" fill="none" strokeLinecap="round" />
      <g fill="#fff"><circle cx="34" cy="78" r="6" /><circle cx="28" cy="72" r="4" /><circle cx="40" cy="72" r="4" /><circle cx="28" cy="84" r="4" /><circle cx="40" cy="84" r="4" /></g>
      <circle cx="34" cy="78" r="3.5" fill="#FFD23F" />
      <g fill="#fff"><circle cx="86" cy="100" r="6" /><circle cx="80" cy="94" r="4" /><circle cx="92" cy="94" r="4" /><circle cx="80" cy="106" r="4" /><circle cx="92" cy="106" r="4" /></g>
      <circle cx="86" cy="100" r="3.5" fill="#FFD23F" />
    </svg>
  );
}
