import { useAuth } from '../../store/auth';

const FALLBACK = ['meo', 'cho', 'tho', 'voi', 'gau', 'hoa', 'tao', 'dau-tay', 'o-to', 'may-bay', 'nam', 'cau-vong'];

export default function AvatarPicker({ value, onChange }) {
  const avatars = useAuth((s) => s.meta?.avatars) || FALLBACK;
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {avatars.map((a) => (
        <button key={a} type="button" onClick={() => onChange(a)} className={`rounded-full border-4 p-0.5 transition ${value === a ? 'scale-105 border-primary' : 'border-transparent'}`} aria-label={a} aria-pressed={value === a}>
          <img src={`/avatars/${a}.svg`} alt="" className="aspect-square w-full rounded-full bg-primary-light" />
        </button>
      ))}
    </div>
  );
}
