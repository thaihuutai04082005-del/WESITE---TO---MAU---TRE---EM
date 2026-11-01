// Đường bao các vùng tô (Path2D) lấy từ chính SVG của tranh — dùng để "khóa vùng" khi tô tay:
// nét vẽ chỉ ăn màu trong vùng bé chạm xuống đầu tiên.
const cache = new Map(); // svg → Map(id → Path2D) (tính một lần cho mỗi tranh)

export function regionPaths(svgString) {
  if (!svgString) return new Map();
  let m = cache.get(svgString);
  if (m) return m;
  m = new Map();
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  for (const el of doc.querySelectorAll('[data-region]')) {
    const d = el.getAttribute('d');
    if (d) m.set(el.getAttribute('data-region'), new Path2D(d));
  }
  if (cache.size > 6) cache.delete(cache.keys().next().value);
  cache.set(svgString, m);
  return m;
}

let scratch = null;
const scratchCtx = () => (scratch ||= document.createElement('canvas').getContext('2d'));

/** Vùng trên cùng (vẽ sau cùng) chứa điểm (x, y) theo toạ độ tranh 600×600. */
function exactRegion(paths, x, y) {
  const ctx = scratchCtx();
  let found = null;
  for (const [id, p] of paths) if (ctx.isPointInPath(p, x, y)) found = id;
  return found;
}

/** Chạm trúng vùng thì lấy vùng đó; chạm đúng nét viền thì lấy vùng gần nhất trong vài điểm ảnh. */
export function regionAtLocal(paths, x, y, tolerance = 6) {
  const hit = exactRegion(paths, x, y);
  if (hit) return hit;
  for (const r of [2, 4, tolerance]) {
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const id = exactRegion(paths, x + r * Math.cos(a), y + r * Math.sin(a));
      if (id) return id;
    }
  }
  return null;
}
