// Bảng hướng dẫn nhanh cho từng chế độ ở trang chính (mở bằng nút "i" trên mỗi ô).
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from './Modal/Modal';
import Icon from './Icon';

export default function ModeGuide({ card, onClose }) {
  const { t } = useTranslation();
  if (!card) return null;
  const { Art } = card;
  const steps = t(`guide.${card.key}.steps`, { returnObjects: true });
  return (
    <Modal open onClose={onClose} wide>
      <div data-testid={`guide-${card.key}`}>
        {/* Đầu bảng: cùng màu nền với ô chức năng */}
        <div className="relative -mx-5 -mt-5 mb-5 overflow-hidden rounded-t-3xl px-5 pb-5 pt-6 sm:px-6" style={{ background: card.bg }}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-ink shadow-soft transition hover:rotate-90 hover:bg-white"
            aria-label={t('common.close')}
          >
            <Icon name="close" size={20} strokeWidth={2.6} />
          </button>
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wide" style={{ color: card.accent }}>
                <Icon name="bulb" size={14} strokeWidth={2.6} /> {t('guide.label')}
              </span>
              <h2 className="mt-2 flex items-center gap-2 font-display text-3xl font-extrabold text-ink">
                <span style={{ color: card.accent }}>
                  <Icon name={card.icon} size={32} strokeWidth={2.6} />
                </span>
                {t(`nav.${card.key}`)}
              </h2>
              <p className="mt-1 text-base font-semibold text-ink/75">{t(`guide.${card.key}.intro`)}</p>
            </div>
            <div className="hidden h-28 w-40 shrink-0 sm:block">
              <Art bubble={t('home.bookBubble')} />
            </div>
          </div>
        </div>

        {/* Các bước */}
        <ol className="relative space-y-3">
          {Array.isArray(steps) &&
            steps.map((step, i) => (
              <li key={i} className="relative flex items-start gap-3">
                {i < steps.length - 1 && <span className="absolute left-[19px] top-10 h-[calc(100%-16px)] border-l-2 border-dashed" style={{ borderColor: `${card.accent}55` }} aria-hidden="true" />}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold text-white shadow-soft" style={{ background: card.accent }}>
                  {i + 1}
                </span>
                <p className="pt-2 text-base leading-snug text-ink">{step}</p>
              </li>
            ))}
        </ol>

        {/* Mẹo nhỏ */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-dashed border-sun/70 bg-[#FFF8E1] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun text-ink">
            <Icon name="bulb" size={20} strokeWidth={2.4} />
          </span>
          <p className="text-sm leading-snug text-ink">
            <b>{t('guide.tip')}</b> {t(`guide.${card.key}.tip`)}
          </p>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-ghost" onClick={onClose}>
            {t('guide.gotIt')}
          </button>
          <Link to={card.to} className="btn text-white shadow-soft hover:brightness-95" style={{ background: card.accent }} data-testid="guide-start">
            {t('guide.start')} <Icon name="arrow" size={20} strokeWidth={3} />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
