// Hình học dùng chung cho bộ sinh tranh: làm phẳng path SVG thành đa giác,
// biến đổi toạ độ, diện tích, kiểm tra điểm trong đa giác.

const TOKEN_RE = /[MLHVQCZmlhvqcz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g;

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function quad(p0, p1, p2, t) {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ];
}

/** Làm phẳng một path (một subpath khép kín) thành danh sách điểm. */
export function flattenPath(d, steps = 10) {
  const tokens = d.match(TOKEN_RE) || [];
  const pts = [];
  let i = 0;
  let cmd = null;
  let cur = [0, 0];
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const off = (p) => (rel ? [p[0] + cur[0], p[1] + cur[1]] : p);
    switch (cmd.toUpperCase()) {
      case 'M':
      case 'L': {
        const p = off([num(), num()]);
        pts.push(p);
        cur = p;
        if (cmd === 'M') cmd = 'L';
        if (cmd === 'm') cmd = 'l';
        break;
      }
      case 'H': {
        const x = num();
        cur = [rel ? cur[0] + x : x, cur[1]];
        pts.push(cur);
        break;
      }
      case 'V': {
        const y = num();
        cur = [cur[0], rel ? cur[1] + y : y];
        pts.push(cur);
        break;
      }
      case 'Q': {
        const c1 = off([num(), num()]);
        const p = off([num(), num()]);
        for (let s = 1; s <= steps; s++) pts.push(quad(cur, c1, p, s / steps));
        cur = p;
        break;
      }
      case 'C': {
        const c1 = off([num(), num()]);
        const c2 = off([num(), num()]);
        const p = off([num(), num()]);
        for (let s = 1; s <= steps; s++) pts.push(cubic(cur, c1, c2, p, s / steps));
        cur = p;
        break;
      }
      case 'Z':
        break;
      default:
        throw new Error(`Lệnh path không hỗ trợ: ${cmd}`);
    }
  }
  return pts;
}

export function ellipsePoly(cx, cy, rx, ry, n = 36) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

export function rotatePts(pts, deg, cx, cy) {
  if (!deg) return pts;
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
}

/** Biến đổi nhóm: xoay quanh pivot, phóng to quanh pivot rồi tịnh tiến. */
export function applyGroupTransform(pts, t) {
  if (!t) return pts;
  const { tx = 0, ty = 0, rot = 0, scale = 1, px = 300, py = 300 } = t;
  return rotatePts(pts, rot, px, py).map(([x, y]) => [px + (x - px) * scale + tx, py + (y - py) * scale + ty]);
}

export function groupTransformAttr(t) {
  if (!t) return '';
  const { tx = 0, ty = 0, rot = 0, scale = 1, px = 300, py = 300 } = t;
  return `translate(${tx} ${ty}) translate(${px} ${py}) scale(${scale}) rotate(${rot}) translate(${-px} ${-py})`;
}

export function polyArea(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  }
  return Math.abs(a / 2);
}

export function bbox(pts) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

export function pointInPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function distToPolyEdge(x, y, pts) {
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j];
    const [bx, by] = pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((x - ax) * dx + (y - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
    if (d < best) best = d;
  }
  return best;
}

/** Giảm số điểm: bỏ điểm gần điểm trước đó hơn `minDist`. */
export function simplify(pts, minDist = 3) {
  const out = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= minDist) out.push(p);
  }
  return out.length >= 3 ? out : pts;
}

export const round1 = (v) => Math.round(v * 10) / 10;
