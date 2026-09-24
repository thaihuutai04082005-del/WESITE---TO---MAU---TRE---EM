// Xem cuốn truyện dạng lật trang (Mục 10.2).
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';

export default function FlipbookViewer({ title, author, pages = [] }) {
  const { t } = useTranslation();
  const sheets = [{ cover: true }, ...pages];
  const [index, setIndex] = useState(0);
  const next = useCallback(() => setIndex((i) => Math.min(sheets.length - 1, i + 1)), [sheets.length]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  return (
    <div className="mx-auto w-full max-w-xl" data-testid="flipbook">
      <div className="flip-stage relative aspect-[4/5] w-full">
        {sheets.map((p, i) => (
          <div
            key={i}
            className={`flip-page card absolute inset-0 flex flex-col overflow-hidden p-4 ${i < index ? 'turned' : ''}`}
            style={{ zIndex: sheets.length - i, background: p.cover ? 'linear-gradient(160deg,#EAF6FF,#BDE6FF)' : '#FFFFFF' }}
          >
            {p.cover ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-4 border-primary p-6 text-center">
                <Icon name="book" size={56} className="text-primary" />
                <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">{title}</h2>
                {author && <div className="text-lg text-muted">{t('storybook.by', { name: author })}</div>}
              </div>
            ) : (
              <>
                {p.image ? <img src={p.image} alt="" className="aspect-square w-full rounded-2xl border border-line object-contain" /> : <div className="aspect-square rounded-2xl bg-primary-light" />}
                <p className="mt-3 flex-1 text-center font-display text-xl font-bold">{p.caption}</p>
                <div className="text-right text-sm text-muted">{i}</div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button type="button" className="btn-ghost" onClick={prev} disabled={index === 0} aria-label={t('common.prev')}>
          <Icon name="back" />
        </button>
        <span className="font-bold text-muted">
          {index}/{sheets.length - 1}
        </span>
        <button type="button" className="btn-primary" onClick={next} disabled={index >= sheets.length - 1} aria-label={t('common.next')}>
          <Icon name="back" className="rotate-180" />
        </button>
      </div>
    </div>
  );
}
