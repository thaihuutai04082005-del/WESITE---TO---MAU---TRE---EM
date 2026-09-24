// Ảnh đại diện + Khung Avatar theo Rank (hiển thị công khai trong phòng đấu, phòng tô chung, danh sách bạn bè).
import { AVATAR_FRAMES } from '../../lib/frames';

export default function Avatar({ avatar = 'meo', frame = null, size = 56, className = '' }) {
  const f = frame && AVATAR_FRAMES[frame];
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img src={`/avatars/${avatar}.svg`} alt="" className="absolute rounded-full border-2 border-white bg-primary-light object-cover" style={{ inset: size * 0.117, width: size * 0.766, height: size * 0.766 }} draggable={false} />
      {f && <svg viewBox="0 0 120 120" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" dangerouslySetInnerHTML={{ __html: f() }} />}
    </div>
  );
}
