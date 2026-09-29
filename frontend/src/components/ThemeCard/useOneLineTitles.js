// Tên trên thẻ ở cả 3 tầng (chủ đề → đối tượng → kiểu) luôn nằm trên 1 hàng.
// Tầng chủ đề và đối tượng dùng CÙNG một cỡ chữ (theo tên dài nhất). Tầng kiểu ghi tên đầy đủ ("Sư tử Rực Lửa"),
// dùng cỡ chung nếu vừa, tên nào quá dài thì cả trang đó thu nhỏ vừa đủ để không rớt dòng.
import { useLayoutEffect } from 'react';

// Tên dài nhất hiện có ở mỗi tầng (chủ đề, đối tượng, kiểu). Tên trên trang đang xem cũng được đo thêm,
// nên nếu sau này có tên dài hơn thì vẫn không bị rớt dòng.
const LONGEST = {
  vi: ['Vương Quốc Lâu Đài Huyền Bí', 'Thị Trấn Khủng Long Tài Ba', 'Bánh kem nhiều tầng', 'Chạy Trên Vành Đai Hành Tinh', 'Bông Tuyết Khổng Lồ Nâng Nhà'],
  en: ['Fruit Sports Festival', 'Mystic Castle Kingdom', 'Fairytale stone bridge', 'Birthday Gift for the King', 'Lullaby for Little Sister'],
};

/**
 * shared = true (tầng chủ đề, đối tượng): cùng cỡ chữ ở mọi tầng theo tên dài nhất.
 * shared = false (tầng kiểu — tên đầy đủ "Sư tử Rực Lửa"): chỉ đo tên trên trang, không lớn hơn cỡ chung.
 */
/** Cỡ chữ chung của tầng chủ đề/đối tượng ở bề ngang thẻ hiện tại (để tầng kiểu không to hơn). */
function sharedSize(grid, sample, lang) {
  const width = sample.clientWidth;
  const probes = (LONGEST[lang] || LONGEST.vi).map((text) => {
    const s = document.createElement('span');
    s.className = sample.className;
    s.textContent = text;
    Object.assign(s.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', width: 'auto', left: '0', top: '0', fontSize: '' });
    grid.appendChild(s);
    return s;
  });
  let size = parseFloat(getComputedStyle(probes[0]).fontSize);
  while (size > 9 && probes.some((p) => p.offsetWidth > width)) {
    size -= 0.5;
    probes.forEach((p) => (p.style.fontSize = `${size}px`));
  }
  probes.forEach((p) => p.remove());
  return size;
}

export default function useOneLineTitles(ref, lang, deps = [], { shared = true } = {}) {
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return undefined;
    const fit = () => {
      const els = [...grid.querySelectorAll('[data-one-line]')];
      if (!els.length) return;
      els.forEach((el) => (el.style.fontSize = ''));
      const probes = (shared ? LONGEST[lang] || LONGEST.vi : []).map((text) => {
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
      if (!shared) size = Math.min(size, sharedSize(grid, els[0], lang));
      els.forEach((el) => (el.style.fontSize = `${size}px`));
      const min = shared ? 9 : 7;
      while (size > min && tooWide()) {
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
  }, [lang, shared, ...deps]);
}

/** Lớp chữ tên thẻ dùng chung (cỡ tối đa 20px, hook sẽ thu nhỏ cho vừa). */
export const TITLE_CLASS = 'overflow-hidden whitespace-nowrap font-display text-[20px] font-extrabold leading-snug tracking-[-0.02em] text-[#17365D]';
/** Lưới thẻ dùng chung cho cả 3 tầng (bề ngang thẻ giống nhau → cỡ chữ giống nhau). */
export const GRID_CLASS = 'grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5';
