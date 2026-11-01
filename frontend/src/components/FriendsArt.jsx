// Hình minh họa nhỏ cho trang Bạn bè (SVG thuần).
export function FriendCardsArt() {
  return (
    <svg viewBox="0 0 150 96" className="fr-art" aria-hidden="true">
      <g transform="rotate(-8 50 52)"><rect x="12" y="18" width="62" height="58" rx="10" fill="#8CC9FF" stroke="#3F8FDB" strokeWidth="4" /><circle cx="43" cy="39" r="9" fill="#3F8FDB" /><path d="M26 66c2-11 9-15 17-15s15 4 17 15z" fill="#3F8FDB" /></g>
      <g transform="rotate(8 100 52)"><rect x="70" y="14" width="62" height="58" rx="10" fill="#C9B8FF" stroke="#8264D8" strokeWidth="4" /><circle cx="101" cy="35" r="9" fill="#8264D8" /><path d="M84 62c2-11 9-15 17-15s15 4 17 15z" fill="#8264D8" /></g>
    </svg>
  );
}
export function TradeCardsArt() {
  const star = 'M0-14l4 9 10 1-7.5 6.5 2.5 10L0 7.5-9 12.5l2.5-10L-14-4l10-1z';
  return (
    <svg viewBox="0 0 160 96" className="fr-art" aria-hidden="true">
      <g transform="rotate(-10 52 52)"><rect x="8" y="22" width="76" height="52" rx="8" fill="#8CC9FF" stroke="#3F8FDB" strokeWidth="4" /><path transform="translate(46 48) scale(.9)" d={star} fill="#FFD23F" stroke="#E8A317" strokeWidth="3" strokeLinejoin="round" /></g>
      <g transform="rotate(10 108 48)"><rect x="70" y="14" width="76" height="52" rx="8" fill="#FF9EC7" stroke="#E0558F" strokeWidth="4" /><path transform="translate(108 40) scale(.9)" d={star} fill="#FFD23F" stroke="#E8A317" strokeWidth="3" strokeLinejoin="round" /></g>
    </svg>
  );
}
