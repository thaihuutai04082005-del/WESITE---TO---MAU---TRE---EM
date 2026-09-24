import { useEffect } from 'react';

export default function Modal({ open, onClose, children, wide = false, className = '', dismissable = true }) {
  useEffect(() => {
    if (!open || !dismissable) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, dismissable]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => dismissable && onClose?.()}>
      <div
        role="dialog"
        aria-modal="true"
        className={`animate-pop max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-pop sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-md'} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
