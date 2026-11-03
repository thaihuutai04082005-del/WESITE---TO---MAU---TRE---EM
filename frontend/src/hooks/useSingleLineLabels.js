import { useLayoutEffect } from 'react';

/** Fit full labels to their available width using one shared font size. */
export default function useSingleLineLabels(ref, dependencies) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    let alive = true;
    const fit = () => {
      if (!alive) return;
      const labels = [...root.querySelectorAll('[data-fit-label]')];
      labels.forEach((label) => { label.style.fontSize = ''; });
      if (!labels.length || labels.some((label) => label.clientWidth === 0)) return;
      const initial = Math.min(...labels.map((label) => parseFloat(getComputedStyle(label).fontSize)));
      const ratio = Math.min(1, ...labels.map((label) => (label.clientWidth - 1) / label.scrollWidth));
      let size = initial * ratio;
      const apply = () => labels.forEach((label) => { label.style.fontSize = `${size}px`; });
      apply();
      while (size > 6 && labels.some((label) => label.scrollWidth > label.clientWidth)) {
        size -= 0.25;
        apply();
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    document.fonts?.ready.then(fit);
    return () => { alive = false; observer.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
