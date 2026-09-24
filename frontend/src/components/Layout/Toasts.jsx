import { useUi } from '../../store/ui';

export default function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`animate-float-up pointer-events-auto max-w-md rounded-2xl px-4 py-3 font-bold text-white shadow-pop ${t.kind === 'error' ? 'bg-danger' : t.kind === 'success' ? 'bg-mint' : 'bg-ink'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
