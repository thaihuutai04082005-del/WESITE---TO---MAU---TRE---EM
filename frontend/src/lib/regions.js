// Đường bao các vùng tô (Path2D) lấy từ chính SVG của tranh — dùng để "khóa vùng" khi tô tay:
// nét vẽ chỉ ăn màu trong vùng bé chạm xuống đầu tiên.
const cache = new Map(); // svg → Map(id → { path, above }) (tính một lần cho mỗi tranh)

function bboxOf(d) {
  const n = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < n.length; i += 2) {
    x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]);
    y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]);
  }
  return [x0, y0, x1, y1];
}

/**
 * Mỗi vùng: `path` (Path2D) và `above` = các vùng vẽ SAU nó (nằm đè lên) mà chồng lên nó.
 * Nhiều tranh xếp vùng theo lớp (nền trời nằm dưới đám mây…): phần bị vùng khác đè lên thì không thuộc vùng này,
 * nên nét tô phải trừ các vùng `above` đi — nếu không màu sẽ lem vào vùng trắng nằm trên (mây, vệt sáng…).
 */
export function regionPaths(svgString) {
  if (!svgString) return new Map();
  let m = cache.get(svgString);
  if (m) return m;
  const list = [];
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  for (const el of doc.querySelectorAll('[data-region]')) {
    const d = el.getAttribute('d');
    if (d) list.push({ id: el.getAttribute('data-region'), path: new Path2D(d), bbox: bboxOf(d) });
  }
  m = new Map();
  list.forEach((r, i) => {
    const above = [];
    for (let j = i + 1; j < list.length; j++) {
      const o = list[j];
      if (o.bbox[0] <= r.bbox[2] + 1 && o.bbox[2] >= r.bbox[0] - 1 && o.bbox[1] <= r.bbox[3] + 1 && o.bbox[3] >= r.bbox[1] - 1) above.push(o.path);
    }
    m.set(r.id, { path: r.path, above });
  });
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
  for (const [id, r] of paths) if (ctx.isPointInPath(r.path, x, y)) found = id;
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
