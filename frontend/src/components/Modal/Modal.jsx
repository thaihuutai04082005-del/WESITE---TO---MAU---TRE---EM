import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';

/** `closeButton`: nút ✕ ở góc phải trên (mặc định bật). Tắt (false) chỉ với cửa sổ đã có sẵn nút ✕ hoặc chữ "Đóng" của riêng nó. */
export default function Modal({ open, onClose, children, wide = false, className = '', dismissable = true, closeButton = true }) {
  const { t } = useTranslation();
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
        {closeButton && dismissable && (
          <div className="sticky top-0 z-10 float-right -mr-2 -mt-2 h-0 w-0 overflow-visible">
            <button type="button" onClick={() => onClose?.()} className="modal-x" aria-label={t('common.close')} title={t('common.close')} data-testid="modal-x">
              <Icon name="close" size={20} strokeWidth={3} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
