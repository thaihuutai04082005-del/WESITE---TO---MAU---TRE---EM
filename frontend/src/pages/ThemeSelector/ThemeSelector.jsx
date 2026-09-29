// Tầng 1: Chủ đề lớn.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import ThemeTile from '../../components/ThemeCard/ThemeTile';
import { PainterBear } from '../../components/Illustrations';
import { useAuth } from '../../store/auth';
import { PlanBadge } from '../Payment/Plans';

/** Đám mây mờ trang trí nền. */
function Cloud({ className }) {
  return (
    <svg viewBox="0 0 200 90" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <path d="M30 88 Q0 88 6 64 Q8 44 34 46 Q42 16 76 22 Q96 0 124 16 Q156 10 160 40 Q196 42 194 68 Q192 88 166 88 Z" fill="#FFFFFF" />
    </svg>
  );
}

function Sparkle({ className, color }) {
  return (
    <svg viewBox="0 0 24 24" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <path d="M12 2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17l-6 3.4 1.3-6.7-5-4.7 6.8-.8z" fill={color} stroke="#1B2A38" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/** Tên chủ đề luôn trên 1 hàng và cùng một cỡ chữ: lấy cỡ lớn nhất mà tên dài nhất vẫn vừa thẻ. */
function useOneLineTitles(ref, deps) {
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return undefined;
    const fit = () => {
      const els = [...grid.querySelectorAll('[data-one-line]')];
      if (!els.length) return;
      els.forEach((el) => (el.style.fontSize = ''));
      let size = parseFloat(getComputedStyle(els[0]).fontSize);
      while (size > 9 && els.some((el) => el.scrollWidth > el.clientWidth)) {
        size -= 0.5;
        els.forEach((el) => (el.style.fontSize = `${size}px`));
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(grid);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function ThemeSelector() {
  const { t, i18n } = useTranslation();
  const plan = useAuth((s) => s.plan);
  const [themes, setThemes] = useState(null);
  useEffect(() => {
    api.get('/themes').then((r) => setThemes(r.themes));
  }, []);
  const gridRef = useRef(null);
  useOneLineTitles(gridRef, [themes, i18n.language]);
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#EEF7FF] to-[#F5FAFF]">
      <Cloud className="-left-10 top-40 w-56 opacity-70" />
      <Cloud className="-right-12 top-24 w-64 opacity-80" />
      <Cloud className="-left-16 bottom-4 w-72 opacity-70" />
      <Cloud className="-right-10 bottom-24 w-60 opacity-70" />
      <div className="page relative px-3 sm:px-4 lg:max-w-[1320px]">
        <div className="relative mb-6 flex flex-wrap items-center gap-3 md:gap-5">
          <div className="h-20 w-24 shrink-0 md:h-40 md:w-44">
            <PainterBear />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display whitespace-nowrap text-[34px] font-extrabold leading-none text-[#17365D] md:text-6xl">{t('select.themes')}</h1>
            <p className="mt-1 text-sm text-muted md:mt-2 md:text-lg">{t('select.themesHint')}</p>
          </div>
          <PlanBadge plan={plan} />
          <Sparkle className="right-2 -top-2 hidden h-9 w-9 md:block" color="#FFD54F" />
          <Sparkle className="-right-6 top-8 hidden h-5 w-5 md:block" color="#7FC8C8" />
        </div>
        <div ref={gridRef} className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-5">
          {(themes || []).map((th) => (
            <ThemeTile key={th.slug} to={`/color/${th.slug}`} picture={th.cover} title={th.name[i18n.language]} subtitle={t('select.objectCount', { n: th.objectCount })} testId={`theme-${th.slug}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
