// Ảnh đại diện + Khung Avatar theo Rank (hiển thị công khai trong phòng đấu, phòng tô chung, danh sách bạn bè).
import { AVATAR_FRAMES } from '../../lib/frames';

export default function Avatar({ avatar = 'meo', frame = null, size = 56, vip = false, className = '' }) {
  const f = frame && AVATAR_FRAMES[frame];
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img src={`/avatars/${avatar}.svg`} alt="" className="absolute rounded-full border-2 border-white bg-primary-light object-cover" style={{ inset: size * 0.117, width: size * 0.766, height: size * 0.766 }} draggable={false} />
      {vip && (
        <svg viewBox="0 0 24 20" className="pointer-events-none absolute drop-shadow" style={{ width: size * 0.42, right: -size * 0.04, top: -size * 0.1 }} data-testid="vip-crown" role="img" aria-label="VIP">
          <path d="M2 17 L1 5 L7 10 L12 2 L17 10 L23 5 L22 17 Z" fill="#FFC21A" stroke="#B87400" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="12.5" r="1.7" fill="#FF5F7E" />
        </svg>
      )}
      {f && <svg viewBox="0 0 120 120" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" dangerouslySetInnerHTML={{ __html: f() }} />}
    </div>
  );
}
