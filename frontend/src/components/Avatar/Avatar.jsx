// Ảnh đại diện + Khung Avatar theo Rank (hiển thị công khai trong phòng đấu, phòng tô chung, danh sách bạn bè).
import { AVATAR_FRAMES } from '../../lib/frames';

export default function Avatar({ avatar = 'meo', frame = null, size = 56, vip = false, className = '' }) {
  const f = frame && AVATAR_FRAMES[frame];
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img src={`/avatars/${avatar}.svg`} alt="" className="absolute rounded-full border-2 border-white bg-primary-light object-cover" style={{ inset: size * 0.117, width: size * 0.766, height: size * 0.766 }} draggable={false} />
      {vip && (
        // Vương miện đội trên đầu, nghiêng nhẹ sang phải.
        <svg
          viewBox="0 0 64 50"
          className="pointer-events-none absolute z-10 drop-shadow"
          style={{ width: size * 0.5, left: '50%', top: -size * 0.14, transform: 'translateX(-38%) rotate(15deg)' }}
          data-testid="vip-crown"
          role="img"
          aria-label="VIP"
        >
          <defs>
            <linearGradient id="vipc-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD36B" />
              <stop offset="1" stopColor="#F58A2B" />
            </linearGradient>
            <linearGradient id="vipc-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F7A93B" />
              <stop offset="1" stopColor="#E5701D" />
            </linearGradient>
          </defs>
          <path d="M6 42 L4 14 L19 27 L32 8 L45 27 L60 14 L58 42 Z" fill="url(#vipc-body)" stroke="#E5841F" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 38 L8 22 L19 31" fill="none" stroke="#FFF1B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          <rect x="5" y="36" width="54" height="11" rx="4.5" fill="url(#vipc-band)" stroke="#E5841F" strokeWidth="1.4" />
          <circle cx="4" cy="13" r="4.4" fill="#FFD96B" stroke="#E5A01F" strokeWidth="1.2" />
          <circle cx="32" cy="7" r="4.6" fill="#FFD96B" stroke="#E5A01F" strokeWidth="1.2" />
          <circle cx="60" cy="13" r="4.4" fill="#FFD96B" stroke="#E5A01F" strokeWidth="1.2" />
          <circle cx="32" cy="41.5" r="3.4" fill="#F0476B" stroke="#C5284A" strokeWidth="1" />
          <circle cx="17" cy="41.5" r="3" fill="#3B86F0" stroke="#2358B8" strokeWidth="1" />
          <circle cx="47" cy="41.5" r="3" fill="#3B86F0" stroke="#2358B8" strokeWidth="1" />
        </svg>
      )}
      {f && <svg viewBox="0 0 120 120" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" dangerouslySetInnerHTML={{ __html: f() }} />}
    </div>
  );
}
