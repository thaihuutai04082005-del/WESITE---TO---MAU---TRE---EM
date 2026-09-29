// Đạo cụ cho Đợt 3 (thí nghiệm, mỹ thuật, hải tặc, xiếc, máy móc). Toạ độ trong khung 600×600.
// Id trùng trong cùng 1 tranh sẽ được build tự đánh số lại.
import { E, C, R, P, D, line, star, heart, cloud, smallFlower } from './shapes.mjs';
import { bar, pt } from './props.mjs';

const f = (n) => Math.round(n * 10) / 10;
const RAINBOW = ['#FF5F5F', '#FF9F43', '#FFD54F', '#4CD787', '#4FA3E0', '#7D5FFF'];
const arc = (cx, cy, rx, ry, a0, a1, n = 20) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
    return [f(cx + rx * Math.cos(a)), f(cy + ry * Math.sin(a))];
  });
/** Dải cong (vành khuyên) từ góc a0 → a1, bán kính trong r0, ngoài r1. */
export const band = (id, cx, cy, r0, r1, a0, a1, color, sy = 1) => P(id, [...arc(cx, cy, r1, r1 * sy, a0, a1), ...arc(cx, cy, r0, r0 * sy, a1, a0)], color);
/** Dải lượn sóng dày w nằm ngang từ x0 → x1. */
export const waveBand = (id, x0, x1, y, w, amp, color, n = 3) => {
  const top = [], bot = [];
  for (let k = 0; k <= 30; k++) {
    const x = x0 + ((x1 - x0) * k) / 30, yy = y + amp * Math.sin((k / 30) * n * 2 * Math.PI);
    top.push([f(x), f(yy - w / 2)]);
    bot.push([f(x), f(yy + w / 2)]);
  }
  return P(id, [...top, ...bot.reverse()], color);
};

// ---------------- 10 · Thí nghiệm ----------------
export const bubbles = (pts, colors = ['#A5F2C4', '#B3E5FC', '#FFC1D6', '#FFF3B0', '#D1C4E9']) =>
  pts.flatMap(([x, y, r], k) => [C(`bong-bot-${k + 1}`, x, y, r, colors[k % colors.length]), E(`loe-bot-${k + 1}`, x - r * 0.35, y - r * 0.35, r * 0.25, r * 0.15, '#FFFFFF', -30)]);
export const puffTrail = (pts, color = '#ECEFF1') => pts.map(([x, y, r], k) => C(`lan-khoi-${k + 1}`, x, y, r, color));
export const smokeBunny = (x, y) => [E('tai-khoi-trai', x - 34, y - 70, 18, 46, '#ECEFF1', -12), E('tai-khoi-phai', x + 34, y - 70, 18, 46, '#ECEFF1', 12), cloud('dau-khoi-tho', x, y, 0.8, '#ECEFF1'), E('mat-tho-khoi-1', x - 20, y - 6, 5, 7, '#90A4AE'), E('mat-tho-khoi-2', x + 20, y - 6, 5, 7, '#90A4AE')];
export const crystals = (id, x, y, s = 1, colors = ['#B39DDB', '#7DE2FF', '#F48FB1']) =>
  [[-26, 0.8, -14], [0, 1.2, 0], [26, 0.9, 14]].map(([dx, h, rot], k) => {
    const cx = x + dx * s, hh = 70 * h * s, w = 16 * s;
    const pts = [[cx - w, y], [cx - w, y - hh * 0.7], [cx, y - hh], [cx + w, y - hh * 0.7], [cx + w, y]];
    const r = (rot * Math.PI) / 180;
    return P(`${id}-${k + 1}`, pts.map(([px, py]) => [f(x + (px - x) * Math.cos(r) - (py - y) * Math.sin(r)), f(y + (px - x) * Math.sin(r) + (py - y) * Math.cos(r))]), colors[k % colors.length]);
  });
export const droplets = (pts, colors = RAINBOW) => pts.map(([x, y, s = 1], k) => D(`giot-${k + 1}`, `M ${pt(x, y - 22 * s)} Q ${pt(x + 16 * s, y)} ${pt(x, y + 12 * s)} Q ${pt(x - 16 * s, y)} ${pt(x, y - 22 * s)} Z`, colors[k % colors.length]));
export const foamTop = (x, y, w) => [
  ...Array.from({ length: 6 }, (_, k) => C(`bot-xa-phong-${k + 1}`, x - w / 2 + (k * w) / 5, y - (k % 2) * 14, 26, '#FFFFFF')),
  D('bot-tran-trai', `M ${pt(x - w / 2 - 10, y)} Q ${pt(x - w / 2 - 30, y + 60)} ${pt(x - w / 2 - 14, y + 110)} Q ${pt(x - w / 2 + 6, y + 60)} ${pt(x - w / 2 + 16, y + 10)} Z`, '#FFFFFF'),
  D('bot-tran-phai', `M ${pt(x + w / 2 + 10, y)} Q ${pt(x + w / 2 + 30, y + 70)} ${pt(x + w / 2 + 14, y + 130)} Q ${pt(x + w / 2 - 6, y + 70)} ${pt(x + w / 2 - 16, y + 10)} Z`, '#FFFFFF'),
];
export const eruption = (x, y) => [
  P('dung-nham-phun', [[x - 30, y], [x - 70, y - 90], [x - 30, y - 60], [x, y - 120], [x + 30, y - 60], [x + 70, y - 90], [x + 30, y]], '#FF7043'),
  P('loi-dung-nham', [[x - 16, y], [x - 30, y - 50], [x, y - 80], [x + 30, y - 50], [x + 16, y]], '#FFC94D'),
  ...[[x - 110, y - 70], [x + 110, y - 90], [x - 70, y - 150], [x + 80, y - 160]].map(([px, py], k) => C(`giot-nham-${k + 1}`, px, py, 12, k % 2 ? '#FF7043' : '#FFC94D')),
];
/** Chia dung dịch bình tam giác thành 3 lớp màu. */
export const flaskLayers = () => {
  const xl = (y) => 262 - 0.468 * (y - 222);
  const layer = (id, y0, y1, color) => P(id, [[f(xl(y0)), y0], [f(600 - xl(y0)), y0], [f(600 - xl(y1)), y1], [f(xl(y1)), y1]], color);
  return [layer('lop-mau-1', 372, 402, '#FFD54F'), layer('lop-mau-2', 402, 432, '#4CD787'), layer('lop-mau-3', 432, 458, '#4FA3E0')];
};
export const snowCrystals = (pts) => pts.flatMap(([x, y, r], k) => [star(`tinh-the-tuyet-${k + 1}`, x, y, r, r * 0.35, '#E1F5FE', 6), C(`tam-tinh-the-${k + 1}`, x, y, r * 0.22, '#B3E5FC')]);
export const microbes = (pts) => pts.flatMap(([x, y, r, col], k) => [
  E(`vi-khuan-${k + 1}`, x, y, r * 1.3, r, col, k * 25),
  C(`mat-vi-khuan-a-${k + 1}`, x - r * 0.35, y - r * 0.15, r * 0.18, '#FFFFFF'),
  C(`mat-vi-khuan-b-${k + 1}`, x + r * 0.35, y - r * 0.15, r * 0.18, '#FFFFFF'),
]);
export const slide = (x, y, inner) => [R('tam-kinh', x - 70, y - 10, 140, 20, 4, '#E1F5FE'), ...inner];
export const bigDrop = (x, y, s = 1) => [D('giot-nuoc-lon', `M ${pt(x, y - 80 * s)} Q ${pt(x + 70 * s, y)} ${pt(x, y + 40 * s)} Q ${pt(x - 70 * s, y)} ${pt(x, y - 80 * s)} Z`, '#B3E5FC'), C('sinh-vat-nho-1', x - 14 * s, y, 8 * s, '#4CD787'), C('sinh-vat-nho-2', x + 16 * s, y + 14 * s, 6 * s, '#FF9EC0')];
export const leaf = (id, x, y, s = 1, rot = -30, color = '#66BB6A') => [E(id, x, y, 60 * s, 28 * s, color, rot), bar(`gan-${id}`, x - 50 * s * Math.cos((rot * Math.PI) / 180), y - 50 * s * Math.sin((rot * Math.PI) / 180), x + 50 * s * Math.cos((rot * Math.PI) / 180), y + 50 * s * Math.sin((rot * Math.PI) / 180), 4, '#43A047')];
export const saltCubes = (pts) => pts.map(([x, y, s], k) => P(`hat-muoi-${k + 1}`, [[x, y - s], [x + s, y - s * 0.4], [x + s, y + s * 0.6], [x, y + s * 1.2], [x - s, y + s * 0.6], [x - s, y - s * 0.4]], ['#FFFFFF', '#E1F5FE', '#F3E5F5'][k % 3]));
export const lightBeam = (x, y, h) => [P('tia-sang-kinh', [[x - 18, y], [x + 18, y], [x + 60, y + h], [x - 60, y + h]], '#FFF3B0')];
export const paperclips = (pts) => pts.flatMap(([x, y, rot], k) => [E(`kep-giay-${k + 1}`, x, y, 26, 11, ['#4FA3E0', '#FF7AA2', '#FFD54F', '#4CD787'][k % 4], rot), E(`long-kep-${k + 1}`, x + 3, y, 16, 5, '#FFFFFF', rot)]);
export const screws = (pts) => pts.flatMap(([x, y, rot], k) => {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [bar(`than-vit-${k + 1}`, x, y, x + 40 * c, y + 40 * s, 10, '#B0BEC5'), C(`mu-vit-${k + 1}`, x, y, 12, '#90A4AE')];
});
export const toyCar = (x, y, s = 1) => [
  R('than-xe-nho', x - 50 * s, y - 30 * s, 100 * s, 30 * s, 8 * s, '#FF5F5F'),
  R('cabin-xe-nho', x - 26 * s, y - 52 * s, 52 * s, 24 * s, 6 * s, '#FFD54F'),
  C('banh-xe-nho-1', x - 28 * s, y, 13 * s, '#2F3640'),
  C('banh-xe-nho-2', x + 28 * s, y, 13 * s, '#2F3640'),
];
export const fieldLines = (cx, cy) => line([150, 200, 250].map((r) => `M ${cx - 120} ${cy} Q ${cx} ${cy - r} ${cx + 120} ${cy}`).join(' '), 3);
export const miniMagnet = (x, y) => [
  P('nam-cham-nho', [[x - 40, y], ...arc(x, y + 20, 40, 44, 180, 0, 12).map(([a, b]) => [a, b]), [x + 40, y], [x + 16, y], ...arc(x, y + 20, 16, 18, 0, 180, 8), [x - 16, y]], '#4FA3E0'),
  R('cuc-nho-trai', x - 40, y - 16, 24, 18, 3, '#CFD8DC'),
  R('cuc-nho-phai', x + 16, y - 16, 24, 18, 3, '#CFD8DC'),
];
export const ant = (x, y, s = 1) => [
  C('bung-kien', x + 34 * s, y, 20 * s, '#8D6E63'),
  C('nguc-kien', x, y, 14 * s, '#8D6E63'),
  C('dau-kien', x - 30 * s, y - 6 * s, 16 * s, '#8D6E63'),
  line(`M ${pt(x - 8 * s, y + 8 * s)} L ${pt(x - 20 * s, y + 32 * s)} M ${pt(x, y + 10 * s)} L ${pt(x, y + 34 * s)} M ${pt(x + 8 * s, y + 8 * s)} L ${pt(x + 20 * s, y + 32 * s)} M ${pt(x - 36 * s, y - 20 * s)} L ${pt(x - 44 * s, y - 42 * s)} M ${pt(x - 26 * s, y - 20 * s)} L ${pt(x - 20 * s, y - 42 * s)}`, 3),
];
export const ladybug = (x, y, s = 1) => [
  C('dau-bo-rua', x - 38 * s, y, 18 * s, '#2F3640'),
  C('lung-bo-rua', x, y, 40 * s, '#FF5F5F'),
  ...[[-14, -16], [16, -14], [-16, 14], [14, 16]].map(([dx, dy], k) => C(`cham-bo-rua-${k + 1}`, x + dx * s, y + dy * s, 7 * s, '#2F3640')),
];
export const shell = (x, y, s = 1) => [
  D('vo-oc', `M ${pt(x - 50 * s, y + 30 * s)} Q ${pt(x - 60 * s, y - 50 * s)} ${pt(x + 10 * s, y - 50 * s)} Q ${pt(x + 60 * s, y - 40 * s)} ${pt(x + 50 * s, y + 10 * s)} Q ${pt(x + 30 * s, y + 40 * s)} ${pt(x - 50 * s, y + 30 * s)} Z`, '#FFCC80'),
  C('xoan-oc-1', x + 6 * s, y - 8 * s, 24 * s, '#FFE0B2'),
  C('xoan-oc-2', x + 10 * s, y - 10 * s, 11 * s, '#FFB74D'),
];
export const sunBeamIn = (sx, sy, lx, ly) => [P('tia-nang-vao', [[sx + 20, sy - 20], [sx + 30, sy + 10], [lx + 40, ly + 60], [lx - 10, ly - 30]], '#FFF3B0')];
export const focusCone = (lx, ly, tx, ty) => [P('tia-nang-hoi-tu', [[lx - 26, ly - 10], [lx + 20, ly + 14], [tx + 4, ty], [tx - 4, ty]], '#FFE082'), star('diem-nong', tx, ty, 22, 9, '#FF9F43', 8)];
export const waterMolecule = (x, y, s = 1) => [
  bar('lien-ket-1', x, y, x - 50 * s, y + 40 * s, 10 * s, '#CFD8DC'),
  bar('lien-ket-2', x, y, x + 50 * s, y + 40 * s, 10 * s, '#CFD8DC'),
  C('nguyen-tu-oxy', x, y, 34 * s, '#FF5F5F'),
  C('nguyen-tu-hydro-1', x - 54 * s, y + 44 * s, 20 * s, '#FFFFFF'),
  C('nguyen-tu-hydro-2', x + 54 * s, y + 44 * s, 20 * s, '#FFFFFF'),
];
export const spark = (id, x, y, s = 1, color = '#FFD54F') => P(id, [[x, y - 30 * s], [x + 8 * s, y - 6 * s], [x + 26 * s, y - 8 * s], [x + 6 * s, y + 6 * s], [x + 12 * s, y + 30 * s], [x - 4 * s, y + 10 * s], [x - 24 * s, y + 14 * s], [x - 8 * s, y - 2 * s]].map(([a, b]) => [f(a), f(b)]), color);

// ---------------- 11 · Mỹ thuật ----------------
export const paintedRainbow = (cx, cy, r, w = 14) => RAINBOW.map((col, k) => band(`net-cau-vong-${k + 1}`, cx, cy, r - (k + 1) * w, r - k * w, 180, 360, col));
export const paintedWaves = (x0, x1, y) => [waveBand('net-song-1', x0, x1, y, 18, 12, '#4FA3E0'), waveBand('net-song-2', x0, x1, y + 30, 18, 12, '#7DE2FF'), waveBand('net-song-3', x0, x1, y + 60, 18, 12, '#26A69A')];
export const paintedSun = (x, y, r) => [star('tia-mat-troi-ve', x, y, r * 1.5, r * 1.05, '#FFB74D', 12), C('mat-troi-ve', x, y, r, '#FFD54F')];
export const bigFlower = (id, x, y, s, petal = '#FF7AA2') => [
  R(`cuong-${id}`, x - 5 * s, y, 10 * s, 120 * s, 4, '#4CAF50'),
  E(`la-${id}`, x + 22 * s, y + 70 * s, 22 * s, 10 * s, '#66BB6A', -30),
  ...Array.from({ length: 6 }, (_, k) => { const a = (k * 60 * Math.PI) / 180; return C(`canh-${id}-${k + 1}`, x + 26 * s * Math.cos(a), y + 26 * s * Math.sin(a), 18 * s, petal); }),
  C(`nhuy-${id}`, x, y, 16 * s, '#FFD54F'),
];
export const fish = (id, x, y, s = 1, color = '#FF9F43', dir = 1) => [
  P(`duoi-${id}`, [[x - dir * 40 * s, y], [x - dir * 70 * s, y - 24 * s], [x - dir * 70 * s, y + 24 * s]], color),
  E(id, x, y, 46 * s, 28 * s, color),
  C(`mat-${id}`, x + dir * 24 * s, y - 6 * s, 6 * s, '#FFFFFF'),
];
export const house = (id, x, y, s = 1, wall = '#FFCC80', roof = '#E57350') => [
  R(`tuong-${id}`, x - 50 * s, y - 80 * s, 100 * s, 80 * s, 4, wall),
  P(`mai-${id}`, [[x - 64 * s, y - 78 * s], [x, y - 130 * s], [x + 64 * s, y - 78 * s]], roof),
  R(`cua-${id}`, x - 14 * s, y - 44 * s, 28 * s, 44 * s, 4, '#8D6E63'),
  R(`so-${id}`, x + 22 * s, y - 66 * s, 20 * s, 20 * s, 3, '#B3E5FC'),
];
export const spiralDots = (x, y, r, turns = 2.5, n = 26) => Array.from({ length: n }, (_, k) => {
  const t = k / (n - 1), a = t * turns * 2 * Math.PI, rr = 10 + t * r;
  return C(`xoan-oc-${k + 1}`, x + rr * Math.cos(a), y + rr * Math.sin(a), 5 + t * 7, RAINBOW[k % 6]);
});
export const polkaDots = (pts) => pts.map(([x, y, r], k) => C(`cham-bi-${k + 1}`, x, y, r, RAINBOW[k % 6]));
export const catFace = (x, y, s = 1) => [
  P('tai-meo-ve-1', [[x - 40 * s, y - 20 * s], [x - 34 * s, y - 64 * s], [x - 8 * s, y - 36 * s]], '#FFB74D'),
  P('tai-meo-ve-2', [[x + 40 * s, y - 20 * s], [x + 34 * s, y - 64 * s], [x + 8 * s, y - 36 * s]], '#FFB74D'),
  C('mat-meo-ve', x, y, 44 * s, '#FFB74D'),
  C('mat-meo-trai', x - 16 * s, y - 6 * s, 6 * s, '#2F3640'),
  C('mat-meo-phai', x + 16 * s, y - 6 * s, 6 * s, '#2F3640'),
  P('mui-meo-ve', [[x - 6 * s, y + 8 * s], [x + 6 * s, y + 8 * s], [x, y + 16 * s]], '#FF7AA2'),
];
export const rocketDrawing = (x, y, s = 1) => [
  P('canh-ten-lua-ve-1', [[x - 24 * s, y + 20 * s], [x - 50 * s, y + 60 * s], [x - 24 * s, y + 50 * s]], '#FF5F5F'),
  P('canh-ten-lua-ve-2', [[x + 24 * s, y + 20 * s], [x + 50 * s, y + 60 * s], [x + 24 * s, y + 50 * s]], '#FF5F5F'),
  D('than-ten-lua-ve', `M ${pt(x - 24 * s, y + 56 * s)} L ${pt(x - 24 * s, y - 20 * s)} Q ${pt(x, y - 80 * s)} ${pt(x + 24 * s, y - 20 * s)} L ${pt(x + 24 * s, y + 56 * s)} Z`, '#ECEFF1'),
  C('cua-so-ten-lua-ve', x, y - 4 * s, 11 * s, '#4FA3E0'),
  P('lua-ten-lua-ve', [[x - 16 * s, y + 56 * s], [x, y + 96 * s], [x + 16 * s, y + 56 * s]], '#FF9F43'),
];
export const butterfly = (x, y, s = 1, c1 = '#7D5FFF', c2 = '#FF9EC0') => [
  E('canh-buom-ve-1', x - 26 * s, y - 16 * s, 26 * s, 20 * s, c1, -20),
  E('canh-buom-ve-2', x + 26 * s, y - 16 * s, 26 * s, 20 * s, c1, 20),
  E('canh-buom-ve-3', x - 20 * s, y + 18 * s, 18 * s, 14 * s, c2, 20),
  E('canh-buom-ve-4', x + 20 * s, y + 18 * s, 18 * s, 14 * s, c2, -20),
  E('than-buom-ve', x, y, 6 * s, 30 * s, '#5D4037'),
];
export const paintMix = (x, y) => [C('vet-mau-a', x - 26, y, 30, '#4FA3E0'), C('vet-mau-b', x + 26, y, 30, '#FFD54F'), E('vet-mau-tron', x, y, 22, 28, '#4CD787')];
export const splats = (pts) => pts.map(([x, y, r], k) => {
  const n = 9, pts2 = [];
  for (let i = 0; i < n * 2; i++) { const a = (i * Math.PI) / n, rr = i % 2 ? r * 0.55 : r * (0.9 + ((i * 7 + k) % 3) * 0.12); pts2.push([f(x + rr * Math.cos(a)), f(y + rr * Math.sin(a))]); }
  return P(`vet-mau-bắn-${k + 1}`.replace('bắn', 'ban'), pts2, RAINBOW[(k * 2) % 6]);
});
export const frame = (id, x, y, w, h, inner = [], color = '#C68B59') => [R(`khung-${id}`, x - w / 2, y - h / 2, w, h, 4, color), R(`tranh-${id}`, x - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20, 2, '#FFFFFF'), ...inner];
export const miniEasel = (x, y) => [bar('chan-gia-nho-1', x - 10, y - 120, x - 50, y, 8, '#C68B59'), bar('chan-gia-nho-2', x + 10, y - 120, x + 50, y, 8, '#C68B59'), R('toan-nho', x - 50, y - 150, 100, 76, 3, '#FFFFFF'), ...paintedSun(x, y - 112, 14)];
export const handprint = (id, x, y, s = 1, color = '#4FA3E0') => [
  E(id, x, y, 26 * s, 30 * s, color),
  ...[-24, -9, 6, 20].map((dx, k) => E(`ngon-${id}-${k + 1}`, x + dx * s, y - 40 * s + Math.abs(dx) * 0.4 * s, 7 * s, 16 * s, color)),
  E(`ngon-cai-${id}`, x + 30 * s, y - 2 * s, 7 * s, 15 * s, color, 50),
];
export const boatDrawing = (x, y, s = 1) => [
  P('than-thuyen-ve', [[x - 60 * s, y], [x + 60 * s, y], [x + 40 * s, y + 30 * s], [x - 40 * s, y + 30 * s]], '#FF7043'),
  R('cot-thuyen-ve', x - 3 * s, y - 80 * s, 6 * s, 80 * s, 2, '#8D6E63'),
  P('buom-thuyen-ve', [[x + 4 * s, y - 76 * s], [x + 50 * s, y - 10 * s], [x + 4 * s, y - 10 * s]], '#FFFFFF'),
];

// ---------------- 13 · Hải tặc ----------------
export const seaWaves = (y = 470, color = '#4FA3E0') => [D('song-truoc', `M 0 ${y} Q 50 ${y - 30} 100 ${y} Q 150 ${y + 30} 200 ${y} Q 250 ${y - 30} 300 ${y} Q 350 ${y + 30} 400 ${y} Q 450 ${y - 30} 500 ${y} Q 550 ${y + 30} 600 ${y} L 600 600 L 0 600 Z`, color), ...[80, 280, 480].map((x, k) => E(`bot-song-${k + 1}`, x, y - 16, 18, 7, '#FFFFFF'))];
export const bigWave = (x, y, dir = 1) => [D('con-song-lon', `M ${pt(x - dir * 90, y)} Q ${pt(x - dir * 90, y - 140)} ${pt(x + dir * 20, y - 150)} Q ${pt(x + dir * 70, y - 140)} ${pt(x + dir * 50, y - 100)} Q ${pt(x + dir * 10, y - 120)} ${pt(x, y - 80)} Q ${pt(x + dir * 30, y - 20)} ${pt(x + dir * 90, y)} Z`, '#29B6F6')];
export const palmIsland = (x, y, s = 1) => [
  E('dao-cat', x, y, 110 * s, 26 * s, '#F6D98B'),
  bar('than-dua-dao', x, y - 10 * s, x + 20 * s, y - 130 * s, 12 * s, '#A0673A'),
  ...[[-60, 10, -20], [60, 20, 20], [-40, -20, -50], [45, -20, 50]].map(([dx, dy, rot], k) => E(`la-dua-dao-${k + 1}`, x + 20 * s + dx * s, y - 136 * s + dy * s, 44 * s, 12 * s, '#43A047', rot)),
];
export const whale = (x, y, s = 1) => [
  D('ca-voi', `M ${pt(x - 110 * s, y)} Q ${pt(x - 100 * s, y - 70 * s)} ${pt(x, y - 70 * s)} Q ${pt(x + 90 * s, y - 70 * s)} ${pt(x + 110 * s, y)} Z`, '#5C6BC0'),
  P('duoi-ca-voi', [[x - 100 * s, y - 10 * s], [x - 150 * s, y - 60 * s], [x - 130 * s, y - 10 * s], [x - 160 * s, y - 20 * s]].map(([a, b]) => [f(a), f(b)]), '#5C6BC0'),
  C('mat-ca-voi', x + 60 * s, y - 34 * s, 7 * s, '#FFFFFF'),
  D('voi-nuoc', `M ${pt(x + 20 * s, y - 70 * s)} Q ${pt(x - 20 * s, y - 150 * s)} ${pt(x - 50 * s, y - 130 * s)} Q ${pt(x + 10 * s, y - 130 * s)} ${pt(x + 20 * s, y - 180 * s)} Q ${pt(x + 30 * s, y - 130 * s)} ${pt(x + 90 * s, y - 130 * s)} Q ${pt(x + 60 * s, y - 150 * s)} ${pt(x + 30 * s, y - 70 * s)} Z`, '#B3E5FC'),
];
export const coral = (id, x, y, s = 1, color = '#FF7AA2') => [
  R(`${id}-goc`, x - 10 * s, y - 60 * s, 20 * s, 60 * s, 8 * s, color),
  R(`${id}-nhanh-1`, x - 40 * s, y - 100 * s, 18 * s, 60 * s, 8 * s, color),
  R(`${id}-nhanh-2`, x + 22 * s, y - 110 * s, 18 * s, 70 * s, 8 * s, color),
  R(`${id}-noi`, x - 40 * s, y - 56 * s, 80 * s, 18 * s, 8 * s, color),
];
export const octopus = (x, y, s = 1) => [
  ...[-3, -2, -1, 1, 2, 3].map((k) => D(`vuot-bach-tuoc-${k + 4}`, `M ${pt(x + k * 14 * s - 8 * s, y)} Q ${pt(x + k * 34 * s, y + 50 * s)} ${pt(x + k * 40 * s + 10 * s, y + 70 * s)} Q ${pt(x + k * 30 * s, y + 40 * s)} ${pt(x + k * 14 * s + 8 * s, y)} Z`, '#BA68C8')),
  E('dau-bach-tuoc', x, y - 30 * s, 56 * s, 50 * s, '#BA68C8'),
  C('mat-bach-tuoc-1', x - 18 * s, y - 30 * s, 8 * s, '#FFFFFF'),
  C('mat-bach-tuoc-2', x + 18 * s, y - 30 * s, 8 * s, '#FFFFFF'),
];
export const chain = (x, y0, y1) => Array.from({ length: Math.floor((y1 - y0) / 30) }, (_, k) => E(`mat-xich-${k + 1}`, x, y0 + 15 + k * 30, k % 2 ? 7 : 12, 17, '#90A4AE'));
export const shipBottom = () => [D('day-tau-tren', 'M 120 0 L 480 0 Q 470 60 400 70 L 200 70 Q 130 60 120 0 Z', '#8D5A3B')];
export const dock = (y = 470) => [R('ben-go', 0, y - 20, 600, 30, 4, '#A0673A'), ...[40, 200, 400, 560].map((x, k) => R(`coc-ben-${k + 1}`, x - 12, y + 6, 24, 90, 4, '#8D5A3B'))];
export const coins = (pts) => pts.map(([x, y, r = 14], k) => C(`dong-vang-${k + 1}`, x, y, r, k % 2 ? '#FFC107' : '#FFD54F'));
export const goldPile = (x, y) => [D('dong-vang-lon', `M ${pt(x - 110, y)} Q ${pt(x, y - 80)} ${pt(x + 110, y)} Z`, '#FFD54F'), ...coins([[x - 60, y - 20], [x - 10, y - 44], [x + 44, y - 26], [x + 10, y - 16]])];
export const shovel = (x, y, rot = 20) => [bar('can-xeng', x, y, x + 110 * Math.sin((rot * Math.PI) / 180), y - 150 * Math.cos((rot * Math.PI) / 180), 12, '#A0673A'), D('luoi-xeng', `M ${pt(x - 26, y - 6)} L ${pt(x + 26, y - 6)} L ${pt(x + 20, y + 40)} Q ${pt(x, y + 60)} ${pt(x - 20, y + 40)} Z`, '#B0BEC5')];
export const dugHole = (x, y) => [E('ho-dao', x, y, 90, 22, '#8D6E63'), E('dong-cat-dao', x + 140, y - 6, 60, 26, '#E8C68A')];
export const lighthouse = (x, y, s = 1) => [
  P('than-hai-dang', [[x - 34 * s, y], [x - 22 * s, y - 200 * s], [x + 22 * s, y - 200 * s], [x + 34 * s, y]].map(([a, b]) => [f(a), f(b)]), '#FFFFFF'),
  P('soc-hai-dang', [[x - 30 * s, y - 70 * s], [x - 26 * s, y - 130 * s], [x + 26 * s, y - 130 * s], [x + 30 * s, y - 70 * s]].map(([a, b]) => [f(a), f(b)]), '#FF5F5F'),
  R('den-hai-dang', x - 24 * s, y - 236 * s, 48 * s, 36 * s, 4, '#FFE066'),
  P('mai-hai-dang', [[x - 30 * s, y - 234 * s], [x, y - 266 * s], [x + 30 * s, y - 234 * s]].map(([a, b]) => [f(a), f(b)]), '#FF5F5F'),
];
export const rocks = (pts) => pts.map(([x, y, w, h], k) => E(`da-ngam-${k + 1}`, x, y, w, h, k % 2 ? '#90A4AE' : '#78909C'));
export const volcanoIsland = (x, y) => [P('nui-lua-dao', [[x - 110, y], [x - 30, y - 120], [x + 30, y - 120], [x + 110, y]], '#8D6E63'), D('khoi-nui-lua', `M ${pt(x - 20, y - 120)} Q ${pt(x - 50, y - 170)} ${pt(x - 10, y - 180)} Q ${pt(x + 20, y - 220)} ${pt(x + 50, y - 180)} Q ${pt(x + 60, y - 140)} ${pt(x + 20, y - 120)} Z`, '#ECEFF1')];
export const northStar = (x, y) => [star('sao-bac-cuc', x, y, 36, 10, '#FFE066', 4), star('sao-bac-cuc-nho', x, y, 16, 6, '#FFFFFF', 4)];
export const footsteps = (pts) => pts.map(([x, y, rot], k) => E(`dau-chan-${k + 1}`, x, y, 10, 16, '#D7B37A', rot));

// ---------------- 14 · Xiếc ----------------
export const spot = (x, y, dir = 1) => [P(`chum-sang-${dir > 0 ? 'phai' : 'trai'}`, [[x, y], [x + dir * 26, y - 16], [x + dir * 240, y + 360], [x + dir * 100, y + 400]], '#FFF3B0'), C(`den-chieu-${dir > 0 ? 'phai' : 'trai'}`, x, y, 22, '#78909C')];
export const wagon = (x, y) => [
  R('toa-xe-xiec', x - 80, y - 110, 160, 90, 8, '#FF5F5F'),
  R('mai-xe-xiec', x - 90, y - 126, 180, 22, 8, '#FFD54F'),
  ...[0, 1, 2].map((k) => R(`song-xe-xiec-${k + 1}`, x - 56 + k * 44, y - 100, 20, 70, 4, '#FFF3D6')),
  C('banh-xe-xiec-1', x - 50, y - 12, 26, '#8D6E63'),
  C('banh-xe-xiec-2', x + 50, y - 12, 26, '#8D6E63'),
];
export const rabbit = (x, y, s = 1) => [
  E('tai-tho-trai', x - 16 * s, y - 70 * s, 12 * s, 36 * s, '#FFFFFF', -10),
  E('tai-tho-phai', x + 16 * s, y - 70 * s, 12 * s, 36 * s, '#FFFFFF', 10),
  E('trong-tai-tho-trai', x - 16 * s, y - 70 * s, 6 * s, 24 * s, '#FFB3C1', -10),
  E('trong-tai-tho-phai', x + 16 * s, y - 70 * s, 6 * s, 24 * s, '#FFB3C1', 10),
  C('dau-tho', x, y - 20 * s, 34 * s, '#FFFFFF'),
  C('mat-tho-1', x - 12 * s, y - 24 * s, 5 * s, '#2F3640'),
  C('mat-tho-2', x + 12 * s, y - 24 * s, 5 * s, '#2F3640'),
  C('mui-tho', x, y - 10 * s, 5 * s, '#FF7AA2'),
];
export const scarfChain = (pts) => pts.map(([x, y, rot], k) => P(`khan-mau-${k + 1}`, [[x - 22, y - 16], [x + 22, y - 16], [x + 22, y + 16], [x - 22, y + 16]].map(([a, b]) => { const r = (rot * Math.PI) / 180; return [f(x + (a - x) * Math.cos(r) - (b - y) * Math.sin(r)), f(y + (a - x) * Math.sin(r) + (b - y) * Math.cos(r))]; }), RAINBOW[k % 6]));
export const wand = (x, y, rot = -30) => {
  const r = (rot * Math.PI) / 180, x2 = x + 120 * Math.cos(r), y2 = y + 120 * Math.sin(r);
  return [bar('dua-ao-thuat', x, y, x2, y2, 12, '#2F3640'), bar('dau-dua-ao-thuat', x2 - 20 * Math.cos(r), y2 - 20 * Math.sin(r), x2, y2, 13, '#FFFFFF'), star('sao-dua', x2 + 20 * Math.cos(r), y2 + 20 * Math.sin(r), 22, 9, '#FFD54F')];
};
export const juggleArc = (cx, cy, r, n = 5) => Array.from({ length: n }, (_, k) => { const a = ((200 + (k * 140) / (n - 1)) * Math.PI) / 180; return C(`bong-bay-${k + 1}`, cx + r * Math.cos(a), cy + r * Math.sin(a), 22, RAINBOW[k % 6]); });
export const fireHoop = (x, y, r = 80) => [
  ...Array.from({ length: 10 }, (_, k) => { const a = (k * 36 * Math.PI) / 180; return P(`lua-vong-${k + 1}`, [[x + (r - 6) * Math.cos(a - 0.2), y + (r - 6) * Math.sin(a - 0.2)], [x + (r + 34) * Math.cos(a), y + (r + 34) * Math.sin(a)], [x + (r - 6) * Math.cos(a + 0.2), y + (r - 6) * Math.sin(a + 0.2)]].map(([p, q]) => [f(p), f(q)]), k % 2 ? '#FF7043' : '#FFC94D'); }),
  band('vong-lua', x, y, r - 12, r, 0, 360, '#FF9F43'),
  R('chan-vong-lua', x - 8, y + r, 16, 470 - y - r, 4, '#78909C'),
];
export const tightrope = (y, x0 = 20, x1 = 580) => [R('cot-day-trai', x0 - 10, y - 10, 20, 480 - y + 10, 4, '#8D6E63'), R('cot-day-phai', x1 - 10, y - 10, 20, 480 - y + 10, 4, '#8D6E63'), line(`M ${x0} ${y} L ${x1} ${y}`, 5)];
export const ribbon = (x, y) => [bar('que-ruy-bang', x, y, x + 20, y + 90, 8, '#8D6E63'), D('ruy-bang', `M ${pt(x, y)} Q ${pt(x - 60, y - 80)} ${pt(x + 20, y - 110)} Q ${pt(x + 100, y - 130)} ${pt(x + 60, y - 200)} L ${pt(x + 76, y - 200)} Q ${pt(x + 116, y - 126)} ${pt(x + 26, y - 94)} Q ${pt(x - 40, y - 76)} ${pt(x + 12, y)} Z`, '#FF7AA2')];
export const hoopStack = (x, y) => [0, 1, 2].map((k) => band(`vong-chong-${k + 1}`, x, y - k * 18, 40, 52, 0, 360, RAINBOW[k * 2], 0.3));
export const net = (y = 470) => [R('khung-luoi', 60, y - 30, 480, 20, 6, '#8D6E63'), line(Array.from({ length: 13 }, (_, k) => `M ${80 + k * 36} ${y - 10} L ${80 + k * 36} ${y + 40}`).join(' ') + ` M 70 ${y + 10} L 530 ${y + 10} M 70 ${y + 30} L 530 ${y + 30}`, 2)];
export const smallTrapeze = (x, y) => [line(`M ${x - 40} 58 L ${x - 40} ${y} M ${x + 40} 58 L ${x + 40} ${y}`, 3), R('xa-du-nho', x - 54, y - 6, 108, 18, 9, '#FF7AA2')];
export const ballStack = (x, y) => [C('bong-chong-1', x - 34, y - 34, 34, '#4FA3E0'), C('bong-chong-2', x + 34, y - 34, 34, '#FFD54F'), C('bong-chong-3', x, y - 92, 34, '#4CD787')];
export const curtainsDrop = () => [D('man-ha-trai', 'M 0 0 L 170 0 Q 110 240 150 600 L 0 600 Z', '#E74C3C'), D('man-ha-phai', 'M 600 0 L 430 0 Q 490 240 450 600 L 600 600 Z', '#E74C3C'), R('diem-man-ha', 0, 0, 600, 36, 0, '#C0392B')];

// ---------------- 15 · Máy móc ----------------
export const windKey = (x, y) => [bar('truc-chia-dong-co', x, y, x + 70, y, 16, '#B0BEC5'), E('canh-chia-dong-co-1', x + 90, y - 34, 22, 36, '#FFD54F'), E('canh-chia-dong-co-2', x + 90, y + 34, 22, 36, '#FFD54F'), C('tam-chia-dong-co', x + 90, y, 12, '#FFB300')];
export const clockTower = (x, y) => [R('than-thap-dong-ho', x - 50, y - 280, 100, 280, 4, '#BCAAA4'), P('mai-thap-dong-ho', [[x - 60, y - 278], [x, y - 350], [x + 60, y - 278]], '#E57350'), C('mat-thap-dong-ho', x, y - 220, 34, '#FFFFFF'), line(`M ${x} ${y - 220} L ${x} ${y - 244} M ${x} ${y - 220} L ${x + 16} ${y - 220}`, 3), R('cua-thap', x - 18, y - 60, 36, 60, 6, '#8D6E63')];
export const conveyor = (y = 500) => [R('bang-chuyen', 20, y - 14, 560, 28, 14, '#607D8B'), ...[60, 180, 300, 420, 540].map((x, k) => C(`truc-bang-chuyen-${k + 1}`, x, y, 10, '#B0BEC5')), R('hop-tren-bang-1', 60, y - 62, 50, 48, 4, '#FFCC80'), R('hop-tren-bang-2', 490, y - 56, 44, 42, 4, '#FFCC80')];
export const oilCan = (x, y) => [
  D('binh-dau', `M ${pt(x - 40, y)} L ${pt(x - 40, y - 50)} Q ${pt(x, y - 80)} ${pt(x + 40, y - 50)} L ${pt(x + 40, y)} Z`, '#FF5F5F'),
  bar('voi-binh-dau', x + 20, y - 60, x + 90, y - 110, 10, '#B0BEC5'),
  D('giot-dau', `M ${pt(x + 96, y - 100)} Q ${pt(x + 106, y - 80)} ${pt(x + 96, y - 72)} Q ${pt(x + 86, y - 80)} ${pt(x + 96, y - 100)} Z`, '#FFB300'),
  R('quai-binh-dau', x - 60, y - 50, 22, 40, 8, '#FF8A80'),
];
export const ferrisWheel = (x, y, r = 110) => [
  P('chan-du-quay', [[x - 70, 480], [x, y], [x + 70, 480]], '#90A4AE'),
  band('vanh-du-quay', x, y, r - 10, r, 0, 360, '#4FA3E0'),
  ...Array.from({ length: 6 }, (_, k) => { const a = (k * 60 * Math.PI) / 180; return R(`cabin-du-quay-${k + 1}`, x + r * Math.cos(a) - 16, y + r * Math.sin(a) - 4, 32, 26, 6, RAINBOW[k]); }),
  C('tam-du-quay', x, y, 16, '#FFD54F'),
];
export const pipes = () => [R('ong-nuoc-ngang', 0, 150, 170, 40, 6, '#90A4AE'), R('ong-nuoc-doc', 130, 150, 40, 330, 6, '#90A4AE'), R('khop-ong-1', 120, 140, 60, 60, 8, '#78909C'), R('khop-ong-2', 120, 300, 60, 24, 6, '#78909C'), R('ong-nuoc-phai', 480, 90, 40, 390, 6, '#90A4AE'), C('van-ong', 500, 220, 30, '#FF5F5F')];
export const cones = (pts) => pts.flatMap(([x, y], k) => [P(`coc-giao-thong-${k + 1}`, [[x - 24, y], [x - 6, y - 64], [x + 6, y - 64], [x + 24, y]], '#FF9F43'), R(`soc-coc-${k + 1}`, x - 16, y - 38, 32, 10, 2, '#FFFFFF'), R(`de-coc-${k + 1}`, x - 32, y - 6, 64, 10, 3, '#FF7043')]);
export const roadStripes = (y = 540) => [R('mat-duong', 0, y - 40, 600, 80, 0, '#78909C'), ...[40, 200, 360, 520].map((x, k) => R(`vach-duong-${k + 1}`, x, y - 6, 60, 12, 3, '#FFFFFF'))];
export const bikeWheel = (x, y, r = 70) => [band('lop-xe', x, y, r - 14, r, 0, 360, '#2F3640'), C('mam-xe', x, y, r - 14, '#E0E0E0'), line(Array.from({ length: 6 }, (_, k) => { const a = (k * 30 * Math.PI) / 180; return `M ${f(x - (r - 16) * Math.cos(a))} ${f(y - (r - 16) * Math.sin(a))} L ${f(x + (r - 16) * Math.cos(a))} ${f(y + (r - 16) * Math.sin(a))}`; }).join(' '), 2), C('truc-xe', x, y, 10, '#FF5F5F')];
export const lunchbox = (x, y) => [R('hop-com', x - 50, y - 50, 100, 50, 8, '#4CD787'), R('nap-hop-com', x - 54, y - 60, 108, 16, 6, '#26A69A'), D('quai-hop-com', `M ${pt(x - 26, y - 58)} Q ${pt(x, y - 100)} ${pt(x + 26, y - 58)} L ${pt(x + 16, y - 58)} Q ${pt(x, y - 84)} ${pt(x - 16, y - 58)} Z`, '#26A69A')];
export const trussBridge = (y = 470) => [R('mat-cau-sat', 0, y - 30, 600, 26, 2, '#78909C'), line(Array.from({ length: 6 }, (_, k) => `M ${k * 120} ${y - 30} L ${k * 120 + 60} ${y - 130} L ${k * 120 + 120} ${y - 30}`).join(' ') + ` M 0 ${y - 130} L 600 ${y - 130}`, 6)];
export const chair = (x, y) => [R('mat-ghe', x - 50, y - 70, 100, 16, 4, '#C68B59'), R('lung-ghe', x + 34, y - 160, 16, 94, 4, '#C68B59'), R('chan-ghe-1', x - 44, y - 56, 12, 56, 3, '#A0673A'), R('chan-ghe-2', x + 34, y - 56, 12, 56, 3, '#A0673A')];
export const streetSign = (x, y) => [R('cot-bien-bao', x - 6, y - 200, 12, 200, 3, '#90A4AE'), C('bien-bao', x, y - 220, 44, '#4FA3E0'), P('mui-ten-bien', [[x - 26, y - 228], [x + 6, y - 228], [x + 6, y - 244], [x + 30, y - 220], [x + 6, y - 196], [x + 6, y - 212], [x - 26, y - 212]], '#FFFFFF')];
export const mailbox = (x, y) => [R('cot-hop-thu', x - 8, y - 120, 16, 120, 3, '#8D6E63'), D('hop-thu', `M ${pt(x - 50, y - 120)} L ${pt(x - 50, y - 170)} Q ${pt(x, y - 210)} ${pt(x + 50, y - 170)} L ${pt(x + 50, y - 120)} Z`, '#FF5F5F'), R('co-hop-thu', x + 50, y - 190, 8, 50, 2, '#2F3640'), R('la-co-hop-thu', x + 58, y - 190, 26, 18, 2, '#FFD54F')];
export const umbrella = (x, y) => [R('can-o', x - 5, y - 200, 10, 200, 3, '#8D6E63'), D('tan-o', `M ${pt(x - 110, y - 190)} Q ${pt(x, y - 300)} ${pt(x + 110, y - 190)} Z`, '#FF7AA2'), P('soc-o', [[x, y - 190], [x - 36, y - 190], [x, y - 272]], '#FFD54F')];
export const streetLamp = (x, y, on = '#FFF3B0') => [R('cot-den-duong', x - 8, y - 240, 16, 240, 4, '#546E7A'), D('choa-den', `M ${pt(x - 40, y - 230)} Q ${pt(x, y - 290)} ${pt(x + 40, y - 230)} Z`, '#37474F'), E('bong-den-duong', x, y - 226, 20, 12, '#FFE066'), P('anh-den-duong', [[x - 30, y - 220], [x + 30, y - 220], [x + 70, y - 60], [x - 70, y - 60]], on)];
export const bulbString = (y = 70) => [line(`M 0 ${y - 30} Q 300 ${y + 40} 600 ${y - 30}`, 3), ...[70, 170, 270, 370, 470, 560].map((x, k) => E(`bong-day-${k + 1}`, x, y - 12 + 50 * Math.sin((x / 600) * Math.PI) * 0.8, 12, 18, RAINBOW[k]))];
export const zzz = (x, y) => [0, 1, 2].map((k) => P(`chu-z-${k + 1}`, [[0, 0], [1, 0], [0.25, 1], [1, 1], [1, 1.25], [-0.1, 1.25], [0.65, 0.25], [0, 0.25]].map(([a, b]) => [f(x + k * 30 + a * (18 + k * 6)), f(y - k * 36 + b * (18 + k * 6))]), '#B39DDB'));
export const ringLines = (x, y, dir = 1) => line([30, 50, 70].map((r) => `M ${f(x + dir * r * 0.5)} ${f(y - r * 0.87)} Q ${f(x + dir * r * 1.1)} ${f(y)} ${f(x + dir * r * 0.5)} ${f(y + r * 0.87)}`).join(' '), 4);
export const busSmall = (x, y) => [R('xe-buyt-nho', x - 80, y - 70, 160, 60, 10, '#FFD54F'), ...[0, 1, 2].map((k) => R(`cua-so-buyt-${k + 1}`, x - 66 + k * 46, y - 60, 34, 24, 4, '#B3E5FC')), C('banh-buyt-1', x - 46, y - 6, 16, '#2F3640'), C('banh-buyt-2', x + 46, y - 6, 16, '#2F3640')];
export const leaves = (pts) => pts.map(([x, y, rot], k) => E(`la-bay-${k + 1}`, x, y, 18, 9, ['#FFB74D', '#E57350', '#FFD54F'][k % 3], rot));
export const soapBubbles = (pts) => pts.flatMap(([x, y, r], k) => [C(`bong-xa-phong-${k + 1}`, x, y, r, '#E1F5FE'), E(`loe-xa-phong-${k + 1}`, x - r * 0.4, y - r * 0.4, r * 0.25, r * 0.14, '#FFFFFF', -35)]);
export const paperBoatAt = (x, y) => [P('thuyen-giay-nho', [[x - 60, y - 20], [x + 60, y - 20], [x + 40, y + 10], [x - 40, y + 10]], '#FFFFFF'), P('buom-giay-nho', [[x - 4, y - 22], [x + 30, y - 80], [x + 36, y - 22]], '#FFF3D6')];
