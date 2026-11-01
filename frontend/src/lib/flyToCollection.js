// Hiệu ứng tranh vừa hoàn thành "bay" vào nút Bộ sưu tập trên thanh điều hướng.
// Ảnh bay là một phần tử gắn thẳng vào <body> nên vẫn bay tiếp khi trang bên dưới đổi (VD sang màn chọn chủ đề).
const DURATION = 950;

function visibleTarget() {
  return [...document.querySelectorAll('[data-fly-target="collection"]')].find((el) => el.getBoundingClientRect().width > 0) || null;
}

function pop(el) {
  el.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.28) rotate(-4deg)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });
}

/** @param {HTMLElement} fromEl khung tranh đang hiện;  @param {string} src ảnh tranh (data URL) */
export function flyToCollection(fromEl, src) {
  if (!fromEl || !src) return;
  const from = fromEl.getBoundingClientRect();
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  Object.assign(img.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    zIndex: 9999,
    pointerEvents: 'none',
    borderRadius: '20px',
    background: '#fff',
    border: '4px solid #fff',
    boxShadow: '0 14px 30px rgba(30, 60, 110, 0.35)',
    transformOrigin: 'center center',
  });
  document.body.appendChild(img);
  const target = visibleTarget();
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!target || !img.animate || reduce) {
    const a = img.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
    if (a) a.onfinish = () => img.remove();
    else img.remove();
    return;
  }
  const t = target.getBoundingClientRect();
  const dx = t.left + t.width / 2 - (from.left + from.width / 2);
  const dy = t.top + t.height / 2 - (from.top + from.height / 2);
  const end = Math.max(0.06, (Math.max(t.height, 36) * 0.9) / from.width);
  const anim = img.animate(
    [
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 + 40}px) scale(${Math.max(end, 0.62)}) rotate(-7deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(10deg)`, opacity: 0.9, offset: 1 },
    ],
    { duration: DURATION, easing: 'cubic-bezier(0.55, 0.06, 0.4, 1)', fill: 'forwards' },
  );
  anim.onfinish = () => {
    img.remove();
    pop(target);
  };
}
