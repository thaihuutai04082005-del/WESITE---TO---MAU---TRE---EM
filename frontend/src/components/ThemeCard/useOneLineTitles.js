// Tên trên thẻ ở cả 3 tầng (chủ đề → đối tượng → kiểu) luôn nằm trên 1 hàng và CÙNG một cỡ chữ.
// Cỡ chữ = cỡ lớn nhất mà tên dài nhất của cả 3 tầng vẫn vừa bề ngang thẻ, nên sang tầng nào chữ cũng bằng nhau.
import { useLayoutEffect } from 'react';

// Tên dài nhất hiện có ở mỗi tầng (chủ đề, đối tượng, kiểu). Tên trên trang đang xem cũng được đo thêm,
// nên nếu sau này có tên dài hơn thì vẫn không bị rớt dòng.
const LONGEST = {
  vi: ['Vương Quốc Lâu Đài Huyền Bí', 'Thị Trấn Khủng Long Tài Ba', 'Bánh kem nhiều tầng', 'Chạy Trên Vành Đai Hành Tinh', 'Bông Tuyết Khổng Lồ Nâng Nhà'],
  en: ['Fruit Sports Festival', 'Mystic Castle Kingdom', 'Fairytale stone bridge', 'Birthday Gift for the King', 'Lullaby for Little Sister'],
};

export default function useOneLineTitles(ref, lang, deps = []) {
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return undefined;
    const fit = () => {
      const els = [...grid.querySelectorAll('[data-one-line]')];
      if (!els.length) return;
      els.forEach((el) => (el.style.fontSize = ''));
      const probes = (LONGEST[lang] || LONGEST.vi).map((text) => {
        const s = document.createElement('span');
        s.className = els[0].className;
        s.textContent = text;
        Object.assign(s.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', width: 'auto', left: '0', top: '0' });
        grid.appendChild(s);
        return s;
      });
      const width = els[0].clientWidth;
      const tooWide = () => els.some((el) => el.scrollWidth > el.clientWidth) || probes.some((p) => p.offsetWidth > width);
      let size = parseFloat(getComputedStyle(els[0]).fontSize);
      while (size > 9 && tooWide()) {
        size -= 0.5;
        const px = `${size}px`;
        els.forEach((el) => (el.style.fontSize = px));
        probes.forEach((p) => (p.style.fontSize = px));
      }
      probes.forEach((p) => p.remove());
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(grid);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, ...deps]);
}

/** Lớp chữ tên thẻ dùng chung (cỡ tối đa 20px, hook sẽ thu nhỏ cho vừa). */
export const TITLE_CLASS = 'overflow-hidden whitespace-nowrap font-display text-[20px] font-extrabold leading-snug tracking-[-0.02em] text-[#17365D]';
/** Lưới thẻ dùng chung cho cả 3 tầng (bề ngang thẻ giống nhau → cỡ chữ giống nhau). */
export const GRID_CLASS = 'grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5';
