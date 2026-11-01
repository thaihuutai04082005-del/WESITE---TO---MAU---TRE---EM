// Biểu tượng 5 kiểu tô: bút sáp, cọ, sáp hạt lấp lánh, bút họa tiết, sticker — vẽ bằng SVG thuần.
export function CrayonIcon() {
  return (
    <svg viewBox="0 0 64 64" className="tb-ico" aria-hidden="true">
      <path d="M8 50c6-6 12-2 18-6s10 2 16-2 10 4 14 0v8c-6 4-10-2-16 2s-10-2-16 2-12 0-16 4z" fill="#5FD068" />
      <path d="M12 54c6-4 12 0 18-3" stroke="#B6F0A8" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g transform="rotate(38 30 28)">
        <path d="M24 6h14v28H24z" fill="#4CC25A" stroke="#2E8C3B" strokeWidth="2" />
        <path d="M24 12h14M24 28h14" stroke="#2E8C3B" strokeWidth="1.5" />
        <path d="M24 34h14l-7 16z" fill="#8EE27E" stroke="#2E8C3B" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function BrushIcon() {
  return (
    <svg viewBox="0 0 64 64" className="tb-ico" aria-hidden="true">
      <path d="M28 50c4-8 14-8 18-2 4 6-2 12-10 10-6 0-6 4-12 2 0-3 2-6 4-10z" fill="#B14BE0" />
      <path d="M34 52c4-2 8 0 8 3" stroke="#D99CF5" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g transform="rotate(-40 32 28)">
        <rect x="27" y="2" width="9" height="26" rx="4" fill="#8A4B2A" />
        <rect x="26" y="26" width="11" height="9" fill="#D9DEE6" stroke="#8D96A3" strokeWidth="1.5" />
        <path d="M26 35h11c0 8-2 14-5.5 17-3.5-3-5.5-9-5.5-17z" fill="#B14BE0" stroke="#7B2FA8" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function GlitterIcon() {
  const dots = [[40, 46], [48, 52], [34, 54], [46, 42], [52, 46], [38, 38], [30, 48], [44, 58], [54, 56]];
  return (
    <svg viewBox="0 0 64 64" className="tb-ico" aria-hidden="true">
      <path d="M26 40c0-6 8-8 14-6s14 4 14 12-8 14-18 12-10-8-10-18z" fill="#FFA43A" />
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1.6 : 2.2} fill={i % 2 ? '#FFE3B0' : '#FF7A1A'} />)}
      <g transform="rotate(38 24 24)">
        <path d="M17 4h14v26H17z" fill="#FF9A2E" stroke="#C96A10" strokeWidth="2" />
        <path d="M17 10h14M17 24h14" stroke="#C96A10" strokeWidth="1.5" />
        <path d="M17 30h14l-7 16z" fill="#FFC070" stroke="#C96A10" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function PatternIcon() {
  const cols = ['#FF5F5F', '#FFA94D', '#FFE14D', '#5FD068', '#4FA3E0', '#9B6BFF'];
  return (
    <svg viewBox="0 0 64 64" className="tb-ico" aria-hidden="true">
      {cols.map((c, i) => <path key={c} d={`M${6 + i * 3} ${52 - i * 0.5}c8-8 14 2 22-4s14 2 24-2`} stroke={c} strokeWidth="3.2" fill="none" strokeLinecap="round" transform={`translate(0 ${i * 2.2 - 6})`} />)}
      <g transform="rotate(38 26 24)">
        <path d="M19 4h14v26H19z" fill="#FFFFFF" stroke="#7B5FD0" strokeWidth="2" />
        {cols.map((c, i) => <rect key={c} x="19" y={4 + i * 4.3} width="14" height="4.3" fill={c} />)}
        <path d="M19 30h14l-7 16z" fill="#FFD6A0" stroke="#7B5FD0" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function StickerIcon() {
  return (
    <svg viewBox="0 0 64 64" className="tb-ico" aria-hidden="true">
      <path d="M10 10h40l6 6v38H10z" fill="#FFFFFF" stroke="#DDE4EE" strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 10v6h6z" fill="#E6EDF7" />
      <ellipse cx="24" cy="26" rx="10" ry="12" transform="rotate(-22 24 26)" fill="#F26BD0" stroke="#C03FA0" strokeWidth="2" />
      <ellipse cx="42" cy="26" rx="10" ry="12" transform="rotate(22 42 26)" fill="#F26BD0" stroke="#C03FA0" strokeWidth="2" />
      <ellipse cx="27" cy="44" rx="7" ry="8" fill="#FFB84D" stroke="#D98A1A" strokeWidth="2" />
      <ellipse cx="39" cy="44" rx="7" ry="8" fill="#FFB84D" stroke="#D98A1A" strokeWidth="2" />
      <path d="M33 24v30" stroke="#7B2FA8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
