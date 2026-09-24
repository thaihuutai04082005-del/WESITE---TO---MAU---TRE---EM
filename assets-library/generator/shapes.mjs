// DSL vẽ tranh: mỗi hàm trả về 1 "item" — hoặc vùng tô (region) hoặc nét trang trí (deco).
// Vùng tô luôn khép kín, có id, màu gợi ý (dùng cho chế độ Tô theo mẫu) và đa giác xấp xỉ
// (dùng cho engine chấm điểm phía server).
import { ellipsePoly, flattenPath, rotatePts } from './geometry.mjs';

const f = (n) => Math.round(n * 10) / 10;

export function E(id, cx, cy, rx, ry, color, rot = 0) {
  const tr = rot ? ` transform="rotate(${rot} ${f(cx)} ${f(cy)})"` : '';
  return {
    kind: 'region',
    id,
    color,
    svg: (attrs) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"${tr} ${attrs}/>`,
    poly: rotatePts(ellipsePoly(cx, cy, rx, ry), rot, cx, cy),
  };
}

export const C = (id, cx, cy, r, color) => E(id, cx, cy, r, r, color);

export function R(id, x, y, w, h, rx, color) {
  return {
    kind: 'region',
    id,
    color,
    svg: (attrs) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(rx)}" ${attrs}/>`,
    poly: [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
  };
}

export function P(id, points, color) {
  return {
    kind: 'region',
    id,
    color,
    svg: (attrs) => `<polygon points="${points.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}" ${attrs}/>`,
    poly: points,
  };
}

export function D(id, d, color) {
  return {
    kind: 'region',
    id,
    color,
    svg: (attrs) => `<path d="${d}" ${attrs}/>`,
    poly: flattenPath(d),
  };
}

/** Nét trang trí (không tô được), vẽ bằng màu đường viền. */
export function deco(markup) {
  return { kind: 'deco', markup };
}

export const line = (d, w = 4) =>
  deco(`<path d="${d}" fill="none" stroke="#1B2A38" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`);

export const dot = (x, y, r) => deco(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#1B2A38"/>`);

export const whiteDot = (x, y, r) => deco(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#FFFFFF"/>`);

// ---------- Các hình ghép dùng lại ----------

export function mirrorX(points) {
  return points.map(([x, y]) => [600 - x, y]);
}

export function star(id, cx, cy, rOuter, rInner, color, n = 5, rot = -90) {
  const pts = [];
  for (let k = 0; k < n * 2; k++) {
    const r = k % 2 === 0 ? rOuter : rInner;
    const a = ((rot + (k * 180) / n) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return P(id, pts, color);
}

export function heart(id, x, y, s, color) {
  const d = `M ${f(x)} ${f(y + 18 * s)} C ${f(x - 30 * s)} ${f(y - 2 * s)} ${f(x - 20 * s)} ${f(y - 24 * s)} ${f(x)} ${f(
    y - 10 * s,
  )} C ${f(x + 20 * s)} ${f(y - 24 * s)} ${f(x + 30 * s)} ${f(y - 2 * s)} ${f(x)} ${f(y + 18 * s)} Z`;
  return D(id, d, color);
}

export function cloud(id, x, y, s, color = '#F0F4F8') {
  const p = (dx, dy) => `${f(x + dx * s)} ${f(y + dy * s)}`;
  const d = `M ${p(-70, 25)} Q ${p(-100, 25)} ${p(-92, 0)} Q ${p(-98, -35)} ${p(-55, -35)} Q ${p(-45, -68)} ${p(
    -8,
    -60,
  )} Q ${p(18, -88)} ${p(48, -55)} Q ${p(92, -62)} ${p(86, -18)} Q ${p(104, 25)} ${p(70, 25)} Z`;
  return D(id, d, color);
}

export function drop(id, x, y, s, color = '#5DADE2') {
  const p = (dx, dy) => `${f(x + dx * s)} ${f(y + dy * s)}`;
  return D(id, `M ${p(0, -16)} Q ${p(12, 2)} ${p(10, 8)} Q ${p(0, 20)} ${p(-10, 8)} Q ${p(-12, 2)} ${p(0, -16)} Z`, color);
}

/** Dải bán nguyệt (dùng cho cầu vồng). */
export function arcBand(id, cx, cy, rOuter, rInner, color, n = 28) {
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const a = Math.PI + (k / n) * Math.PI;
    pts.push([cx + rOuter * Math.cos(a), cy + rOuter * Math.sin(a)]);
  }
  for (let k = n; k >= 0; k--) {
    const a = Math.PI + (k / n) * Math.PI;
    pts.push([cx + rInner * Math.cos(a), cy + rInner * Math.sin(a)]);
  }
  return P(id, pts, color);
}

/** Nửa hình tròn phía dưới (miếng dưa hấu). */
export function halfDisk(id, cx, cy, r, color, n = 28) {
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return P(id, pts, color);
}

export function smallFlower(prefix, x, y, petal, center = '#FFD54F') {
  const items = [];
  for (let k = 0; k < 5; k++) {
    const a = ((k * 72 - 90) * Math.PI) / 180;
    items.push(C(`${prefix}-canh-${k + 1}`, x + 11 * Math.cos(a), y + 11 * Math.sin(a), 9, petal));
  }
  items.push(C(`${prefix}-nhuy`, x, y, 7, center));
  return items;
}

export function butterfly(prefix, x, y, s = 1) {
  return [
    E(`${prefix}-canh-tren-trai`, x - 16 * s, y - 8 * s, 16 * s, 20 * s, '#7D5FFF', -25),
    E(`${prefix}-canh-tren-phai`, x + 16 * s, y - 8 * s, 16 * s, 20 * s, '#7D5FFF', 25),
    E(`${prefix}-canh-duoi-trai`, x - 12 * s, y + 14 * s, 10 * s, 12 * s, '#FF8A65', 20),
    E(`${prefix}-canh-duoi-phai`, x + 12 * s, y + 14 * s, 10 * s, 12 * s, '#FF8A65', -20),
    line(`M ${f(x)} ${f(y - 16 * s)} L ${f(x)} ${f(y + 22 * s)}`, 5),
    line(`M ${f(x)} ${f(y - 16 * s)} Q ${f(x - 6 * s)} ${f(y - 30 * s)} ${f(x - 12 * s)} ${f(y - 32 * s)}`, 2.5),
    line(`M ${f(x)} ${f(y - 16 * s)} Q ${f(x + 6 * s)} ${f(y - 30 * s)} ${f(x + 12 * s)} ${f(y - 32 * s)}`, 2.5),
  ];
}
