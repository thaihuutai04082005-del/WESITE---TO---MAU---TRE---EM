// Đạo cụ nhỏ dùng chung cho các biến thể riêng từng đối tượng (object-variants.mjs).
// Mọi hàm trả về mảng item (vùng tô / nét trang trí). Toạ độ trong khung 600×600.
import { E, C, R, P, D, deco, line, star, heart } from './shapes.mjs';

const f = (n) => Math.round(n * 10) / 10;
export const pt = (x, y) => `${f(x)} ${f(y)}`;

/** Thanh thẳng dày w nối (x1,y1) → (x2,y2) — cán, gậy, giáo, gậy chơi thể thao… */
export function bar(id, x1, y1, x2, y2, w, color) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / len) * (w / 2);
  const ny = ((x2 - x1) / len) * (w / 2);
  return P(id, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], color);
}

/** Vị trí "tay" để cầm đạo cụ: bên phải / trái thân, ngang giữa thân. */
export const hand = (c, side = 1) => [side > 0 ? c.right + 12 : c.left - 12, (c.bb[1] + c.bb[3]) / 2 + 40];
export const midY = (c) => (c.bb[1] + c.bb[3]) / 2;

/** Vầng hào quang tia nhọn phía sau. */
export function aura(c, color = '#FFE066', r = null) {
  const R0 = r || Math.max(c.bb[2] - c.bb[0], c.bb[3] - c.bb[1]) / 2 + 40;
  return [star('hao-quang', c.cx, midY(c), R0, R0 * 0.82, color, 18)];
}

/** Sóng âm: 3 vòng cung dày dần về một phía. */
export function soundWaves(prefix, x, y, dir = 1, color = '#8FD3FF') {
  return [0, 1, 2].map((k) => {
    const r = 26 + k * 22;
    const x0 = x + dir * k * 4;
    return D(`${prefix}-${k + 1}`, `M ${pt(x0 + dir * r * 0.6, y - r)} Q ${pt(x0 + dir * r * 1.4, y)} ${pt(x0 + dir * r * 0.6, y + r)} L ${pt(x0 + dir * (r * 0.6 + 10), y + r - 4)} Q ${pt(x0 + dir * (r * 1.4 + 12), y)} ${pt(x0 + dir * (r * 0.6 + 10), y - r + 4)} Z`, color);
  });
}

export function boulder(id, x, y, r, color = '#A1887F') {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const rr = r * (0.82 + ((k * 53) % 10) / 45);
    pts.push([x + rr * Math.cos(a) * 1.25, y + rr * Math.sin(a) * 0.85]);
  }
  return [P(id, pts, color), E(`${id}-van`, x - r * 0.3, y - r * 0.2, r * 0.3, r * 0.16, '#8D6E63', -15)];
}

export function tornado(id, x, yTop, h, w, color = '#CFD8DC') {
  return [
    D(id, `M ${pt(x - w, yTop)} Q ${pt(x, yTop - 24)} ${pt(x + w, yTop)} Q ${pt(x + w * 0.4, yTop + h * 0.5)} ${pt(x + 8, yTop + h)} L ${pt(x - 8, yTop + h)} Q ${pt(x - w * 0.4, yTop + h * 0.5)} ${pt(x - w, yTop)} Z`, color),
    line(`M ${pt(x - w * 0.8, yTop + 20)} Q ${pt(x, yTop + 34)} ${pt(x + w * 0.8, yTop + 20)} M ${pt(x - w * 0.5, yTop + h * 0.4)} Q ${pt(x, yTop + h * 0.4 + 14)} ${pt(x + w * 0.5, yTop + h * 0.4)} M ${pt(x - w * 0.25, yTop + h * 0.72)} Q ${pt(x, yTop + h * 0.72 + 10)} ${pt(x + w * 0.25, yTop + h * 0.72)}`, 3),
  ];
}

export function cracks(id, x, y, color = '#6D4C41') {
  return [P(id, [[x - 70, y], [x - 40, y - 8], [x - 20, y + 6], [x + 6, y - 10], [x + 30, y + 4], [x + 60, y - 6], [x + 80, y + 2], [x + 58, y + 8], [x + 30, y + 16], [x + 4, y + 2], [x - 18, y + 18], [x - 42, y + 4]], color)];
}

export function parachute(c, color = '#FF7AA2', stripe = '#FFFFFF') {
  const x = c.cx;
  const top = c.bb[1] - 190;
  return [
    D('du', `M ${pt(x - 150, top + 100)} Q ${pt(x - 150, top)} ${pt(x, top)} Q ${pt(x + 150, top)} ${pt(x + 150, top + 100)} Q ${pt(x + 100, top + 80)} ${pt(x + 50, top + 100)} Q ${pt(x, top + 80)} ${pt(x - 50, top + 100)} Q ${pt(x - 100, top + 80)} ${pt(x - 150, top + 100)} Z`, color),
    D('soc-du', `M ${pt(x - 50, top + 100)} Q ${pt(x - 40, top + 20)} ${pt(x, top)} Q ${pt(x + 40, top + 20)} ${pt(x + 50, top + 100)} Q ${pt(x, top + 80)} ${pt(x - 50, top + 100)} Z`, stripe),
    // Dây buộc vào hai bên vai, vẽ SAU thân (dùng trong `behind`) nên không vắt ngang mặt.
    line(`M ${pt(x - 150, top + 100)} L ${pt(c.left + 14, c.neck)} M ${pt(x + 150, top + 100)} L ${pt(c.right - 14, c.neck)} M ${pt(x - 50, top + 100)} L ${pt(x - 40, c.neck)} M ${pt(x + 50, top + 100)} L ${pt(x + 40, c.neck)}`, 2.5),
  ];
}

export function brickWall(y0 = 120, y1 = 470) {
  const items = [R('buc-tuong', 0, y0, 600, y1 - y0, 0, '#E8A07A')];
  const rows = [];
  for (let y = y0 + 40; y < y1; y += 40) rows.push(`M 0 ${y} L 600 ${y}`);
  let k = 0;
  for (let y = y0; y < y1; y += 40, k++) for (let x = k % 2 ? 40 : 0; x < 600; x += 80) rows.push(`M ${x} ${y} L ${x} ${Math.min(y + 40, y1)}`);
  items.push(line(rows.join(' '), 2));
  return items;
}

export function mountains(color = '#9FB8CF', snow = '#FFFFFF') {
  return [
    P('nui-xa-1', [[-20, 470], [120, 250], [260, 470]], color),
    P('tuyet-nui-xa-1', [[120, 250], [96, 290], [120, 282], [144, 290]], snow),
    P('nui-xa-2', [[340, 470], [480, 230], [620, 470]], color),
    P('tuyet-nui-xa-2', [[480, 230], [454, 274], [480, 266], [506, 274]], snow),
  ];
}

export function footprints(color = '#8D6E63') {
  return [[70, 520], [120, 540], [170, 518], [220, 540], [470, 530], [530, 548]].map(([x, y], k) => E(`dau-chan-${k + 1}`, x, y, 14, 8, color, k % 2 ? 15 : -15));
}

export function sparkles(prefix, pts, color = '#FFD54F') {
  return pts.map(([x, y, r], k) => star(`${prefix}-${k + 1}`, x, y, r, r * 0.35, color, 4));
}

export function hearts(prefix, pts, color = '#FF5F7E') {
  return pts.map(([x, y, s], k) => heart(`${prefix}-${k + 1}`, x, y, s, color));
}

export function feather(id, x, y, rot, color = '#8D6E63') {
  return [E(id, x, y, 10, 30, color, rot)];
}

export function walkieTalkie(x, y) {
  return [R('bo-dam', x - 16, y - 30, 32, 58, 8, '#2F3640'), R('man-bo-dam', x - 10, y - 22, 20, 16, 3, '#8FD3FF'), bar('ang-ten-bo-dam', x + 8, y - 30, x + 12, y - 62, 6, '#2F3640')];
}

export function boneShield(c) {
  const [x, y] = hand(c, 1);
  const w = 64;
  return [
    D('khien-xuong', `M ${pt(x - w, y - 16)} L ${pt(x + w, y - 16)} Q ${pt(x + w + 30, y - 44)} ${pt(x + w + 24, y)} Q ${pt(x + w + 30, y + 44)} ${pt(x + w, y + 16)} L ${pt(x - w, y + 16)} Q ${pt(x - w - 30, y + 44)} ${pt(x - w - 24, y)} Q ${pt(x - w - 30, y - 44)} ${pt(x - w, y - 16)} Z`, '#FFF6E0'),
  ];
}

export function detectiveCap(c, color = '#C8A26B') {
  const { x, y, s } = c.hat;
  return [
    D('mu-tham-tu', `M ${pt(x - 56 * s, y + 6 * s)} Q ${pt(x - 50 * s, y - 60 * s)} ${pt(x, y - 62 * s)} Q ${pt(x + 50 * s, y - 60 * s)} ${pt(x + 56 * s, y + 6 * s)} Z`, color),
    P('luoi-mu-truoc', [[x - 20 * s, y + 4 * s], [x + 20 * s, y + 4 * s], [x, y + 22 * s]], '#A0673A'),
    line(`M ${pt(x - 40 * s, y - 30 * s)} L ${pt(x + 40 * s, y - 30 * s)} M ${pt(x - 44 * s, y - 10 * s)} L ${pt(x + 44 * s, y - 10 * s)}`, 2.5),
  ];
}

export function headset(c) {
  const { x, y, s } = c.face;
  return [
    // Quai và dây micro của tai nghe cố ý nằm sát mặt (onFace) — bước kiểm tra nét vắt ngang mặt bỏ qua.
    { ...line(`M ${pt(x - 70 * s, y - 10 * s)} Q ${pt(x, y - 120 * s)} ${pt(x + 70 * s, y - 10 * s)}`, 5), onFace: true },
    C('tai-nghe-trai', x - 72 * s, y, 16 * s, '#4FA3E0'),
    C('tai-nghe-phai', x + 72 * s, y, 16 * s, '#4FA3E0'),
    { ...line(`M ${pt(x + 72 * s, y + 10 * s)} Q ${pt(x + 60 * s, y + 50 * s)} ${pt(x + 26 * s, y + 46 * s)}`, 3), onFace: true },
    C('mic', x + 22 * s, y + 46 * s, 7 * s, '#2F3640'),
  ];
}

export function visor(c, color = '#FF5F5F') {
  const { x, y, s } = c.face;
  return [R('kinh-tia-x', x - 58 * s, y - 16 * s, 116 * s, 30 * s, 14 * s, color)];
}

export function eyeBeams(c, color = '#FFE066') {
  const { x, y, s } = c.face;
  return [
    P('tia-mat-trai', [[x - 26 * s, y], [x - 170, y + 150], [x - 110, y + 170]], color),
    P('tia-mat-phai', [[x + 26 * s, y], [x + 170, y + 150], [x + 110, y + 170]], color),
  ];
}

export function rescueCross(x, y, s = 1, color = '#FF5F5F') {
  const a = 8 * s;
  const b = 24 * s;
  return [C('huy-hieu-cuu-ho', x, y, 32 * s, '#FFFFFF'), P('chu-thap-cuu-ho', [[x - a, y - b], [x + a, y - b], [x + a, y - a], [x + b, y - a], [x + b, y + a], [x + a, y + a], [x + a, y + b], [x - a, y + b], [x - a, y + a], [x - b, y + a], [x - b, y - a], [x - a, y - a]], color)];
}

export function bigBubble(c, color = '#D6F0FF') {
  const rx = (c.bb[2] - c.bb[0]) / 2 + 40;
  const ry = (c.bb[3] - c.bb[1]) / 2 + 40;
  return [E('bong-bong-bao-ve', c.cx, midY(c), rx, ry, color), E('anh-bong-bong', c.cx - rx * 0.55, midY(c) - ry * 0.55, 22, 12, '#FFFFFF', -35)];
}

/** Dải cong có độ dày thay đổi theo đường cong bậc 2 (p0 → pc → p1). */
function curveBand(id, p0, pc, p1, w0, w1, color, n = 24) {
  const L = [];
  const Rr = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * pc[0] + t * t * p1[0];
    const y = u * u * p0[1] + 2 * u * t * pc[1] + t * t * p1[1];
    const dx = 2 * u * (pc[0] - p0[0]) + 2 * t * (p1[0] - pc[0]);
    const dy = 2 * u * (pc[1] - p0[1]) + 2 * t * (p1[1] - pc[1]);
    const len = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * t) / 2;
    L.push([x - (dy / len) * w, y + (dx / len) * w]);
    Rr.push([x + (dy / len) * w, y - (dx / len) * w]);
  }
  return P(id, [...L, ...Rr.reverse()], color);
}

function flameBig(id, x, y, s) {
  return [
    D(id, `M ${pt(x, y)} C ${pt(x - 34 * s, y - 20 * s)} ${pt(x - 20 * s, y - 60 * s)} ${pt(x, y - 84 * s)} C ${pt(x + 6 * s, y - 56 * s)} ${pt(x + 34 * s, y - 50 * s)} ${pt(x + 26 * s, y - 16 * s)} Q ${pt(x + 20 * s, y)} ${pt(x, y)} Z`, '#FF7043'),
    D(`${id}-loi`, `M ${pt(x, y - 4 * s)} C ${pt(x - 16 * s, y - 14 * s)} ${pt(x - 10 * s, y - 34 * s)} ${pt(x, y - 46 * s)} C ${pt(x + 4 * s, y - 32 * s)} ${pt(x + 18 * s, y - 28 * s)} ${pt(x + 12 * s, y - 10 * s)} Q ${pt(x + 8 * s, y - 4 * s)} ${pt(x, y - 4 * s)} Z`, '#FFC94D'),
  ];
}

/** Vòi rồng nước: dòng nước dày bắn thành vòng cung từ vòi voi xuống đám lửa, có vệt sáng + bọt nước bắn toé. */
export function waterJet(x0, y0, x1, y1, pc = null, color = '#4FC3F7', fire = true) {
  pc = pc || [(x0 + x1) / 2, Math.min(y0, y1) - 80];
  const splash = [[-40, -18, 13], [-10, -40, 15], [26, -30, 12], [44, -6, 10], [-56, 4, 10]];
  return [
    ...(fire ? [-1, 1] : []).flatMap((k) => flameBig(`lua-chay-${k > 0 ? 2 : 1}`, x1 + k * 34, y1 + 30, k > 0 ? 1.1 : 1.4)),
    curveBand('tia-nuoc-voi', [x0, y0], pc, [x1, y1], 38, 70, color),
    curveBand('vet-sang-nuoc', [x0 - 2, y0 - 8], [pc[0] + 8, pc[1] + 2], [x1 + 8, y1 - 16], 10, 18, '#E1F5FE'),
    ...splash.map(([dx, dy, r], k) => C(`giot-nuoc-${k + 1}`, x1 + dx, y1 + dy, r, k % 2 ? '#B3E5FC' : color)),
    ...(fire ? [E('vung-nuoc-ban', x1, y1 + 34, 80, 16, '#81D4FA')] : []),
  ];
}

export function steelPlates(c) {
  return [
    P('giap-canh-trai', [[164, 360], [226, 346], [236, 410], [172, 430]], '#BFC8D0'),
    P('giap-canh-phai', [[436, 360], [374, 346], [364, 410], [428, 430]], '#BFC8D0'),
    line('M 176 380 L 228 370 M 424 380 L 372 370', 3),
  ];
}

// ---------------- Hoàng gia (Vương Quốc Kẹo Ngọt) ----------------

/** Áo choàng hoàng gia sau lưng đồ vật (không có cổ): bắt đầu từ gần đỉnh. */
export function robe(c, color = '#7D5FFF', trim = '#FFFFFF') {
  const x = c.cx;
  const top = c.bb[1] + 40;
  const bottom = Math.min(c.bb[3] + 10, 500);
  const w = (c.bb[2] - c.bb[0]) / 2 + 40;
  return [
    D('ao-choang-hoang-gia', `M ${pt(x - 60, top)} L ${pt(x + 60, top)} Q ${pt(x + w, (top + bottom) / 2)} ${pt(x + w + 10, bottom)} L ${pt(x - w - 10, bottom)} Q ${pt(x - w, (top + bottom) / 2)} ${pt(x - 60, top)} Z`, color),
    R('vien-ao-choang', x - w - 14, bottom - 18, 2 * w + 28, 20, 10, trim),
  ];
}

export function teaSet(x, y) {
  return [
    R('ban-tra', x - 70, y + 40, 140, 14, 6, '#C68B59'),
    bar('chan-ban-tra', x, y + 54, x, y + 110, 12, '#A0673A'),
    D('voi-am', `M ${pt(x - 44, y + 10)} Q ${pt(x - 70, y - 4)} ${pt(x - 78, y - 30)} L ${pt(x - 64, y - 32)} Q ${pt(x - 58, y - 10)} ${pt(x - 38, y)} Z`, '#FFFFFF'),
    D('quai-am', `M ${pt(x + 36, y - 10)} Q ${pt(x + 70, y - 10)} ${pt(x + 50, y + 26)} L ${pt(x + 42, y + 20)} Q ${pt(x + 56, y)} ${pt(x + 36, y)} Z`, '#FFFFFF'),
    E('am-tra', x, y + 6, 44, 34, '#FFFFFF'),
    E('nap-am', x, y - 28, 22, 8, '#7DE2FF'),
    C('num-am', x, y - 38, 7, '#FFD54F'),
    heart('hoa-van-am', x, y + 8, 0.6, '#FF7AA2'),
  ];
}

export function teaCup(x, y) {
  return [D('tach-tra', `M ${pt(x - 24, y - 20)} L ${pt(x + 24, y - 20)} Q ${pt(x + 22, y + 14)} ${pt(x, y + 16)} Q ${pt(x - 22, y + 14)} ${pt(x - 24, y - 20)} Z`, '#FFFFFF'), E('dia-tach', x, y + 18, 34, 7, '#7DE2FF')];
}

export function bunting(y = 70) {
  const items = [line(`M 0 ${y - 20} Q 300 ${y + 30} 600 ${y - 20}`, 3)];
  const colors = ['#FF5F7E', '#FFD54F', '#4FA3E0', '#4CD787', '#7D5FFF', '#FF9F43'];
  for (let k = 0; k < 8; k++) {
    const x = 40 + k * 74;
    const yy = y - 20 + 50 * Math.sin((x / 600) * Math.PI) * 0.5;
    items.push(P(`co-duoi-nheo-${k + 1}`, [[x - 18, yy], [x + 18, yy], [x, yy + 36]], colors[k % colors.length]));
  }
  return items;
}

export function envelope(x, y, s = 1) {
  return [R('phong-thu', x - 44 * s, y - 30 * s, 88 * s, 60 * s, 6, '#FFFFFF'), P('nap-thu', [[x - 44 * s, y - 30 * s], [x + 44 * s, y - 30 * s], [x, y + 6 * s]], '#FFE0B5'), C('dau-sap', x, y + 4 * s, 9 * s, '#FF5F5F')];
}

export function mailBag(c) {
  const x = c.left + 10;
  const y = c.bb[3] - 60;
  return [bar('quai-tui-thu', x + 20, y - 60, c.right - 40, c.bb[1] + 60, 10, '#8B5A2B'), R('tui-thu', x - 60, y - 40, 90, 80, 14, '#C68B59'), R('nap-tui-thu', x - 60, y - 40, 90, 30, 10, '#A0673A')];
}

export function fairyWand(x, y, color = '#FFD54F') {
  return [bar('dua-than', x, y + 110, x + 30, y, 8, '#FF7AA2'), star('sao-dua-than', x + 32, y - 6, 26, 11, color)];
}

export function fairyWings(c) {
  const x = c.cx;
  const y = c.bb[1] + (c.bb[3] - c.bb[1]) * 0.45;
  return [
    E('canh-tien-tren-trai', x - 130, y - 40, 70, 44, '#D6F0FF', -25),
    E('canh-tien-tren-phai', x + 130, y - 40, 70, 44, '#D6F0FF', 25),
    E('canh-tien-duoi-trai', x - 110, y + 40, 50, 32, '#FFD6E7', 20),
    E('canh-tien-duoi-phai', x + 110, y + 40, 50, 32, '#FFD6E7', -20),
  ];
}

export function ballGown(c, color = '#FF9EC0', trim = '#FFFFFF') {
  const x = c.cx;
  const top = c.bb[3] - 60;
  return [
    D('vay-da-hoi', `M ${pt(x - 70, top)} L ${pt(x + 70, top)} Q ${pt(x + 170, c.bb[3] + 10)} ${pt(x + 190, 520)} Q ${pt(x, 540)} ${pt(x - 190, 520)} Q ${pt(x - 170, c.bb[3] + 10)} ${pt(x - 70, top)} Z`, color),
    D('vien-vay', `M ${pt(x - 190, 520)} Q ${pt(x, 540)} ${pt(x + 190, 520)} L ${pt(x + 186, 506)} Q ${pt(x, 524)} ${pt(x - 186, 506)} Z`, trim),
  ];
}

export function giftBox(id, x, y, w, color = '#4FA3E0', ribbon = '#FF5F7E') {
  return [
    R(id, x - w / 2, y - w * 0.8, w, w * 0.8, 6, color),
    R(`${id}-nap`, x - w / 2 - 6, y - w * 0.8 - 14, w + 12, 18, 5, color),
    R(`${id}-day`, x - 7, y - w * 0.8 - 14, 14, w * 0.8 + 14, 2, ribbon),
    E(`${id}-no-trai`, x - 14, y - w * 0.8 - 22, 14, 9, ribbon, -20),
    E(`${id}-no-phai`, x + 14, y - w * 0.8 - 22, 14, 9, ribbon, 20),
  ];
}

export function spear(x, yBottom, h = 300) {
  return [bar('can-giao', x, yBottom, x, yBottom - h, 10, '#8B5A2B'), P('mui-giao', [[x - 16, yBottom - h + 4], [x, yBottom - h - 44], [x + 16, yBottom - h + 4]], '#DDE2E8'), R('tua-giao', x - 12, yBottom - h + 2, 24, 12, 4, '#FF5F5F')];
}

export function trumpet(x, y) {
  return [
    bar('than-ken', x - 70, y, x + 40, y - 20, 12, '#FFC94D'),
    P('loa-ken', [[x + 36, y - 34], [x + 96, y - 64], [x + 110, y + 6], [x + 44, y - 6]], '#FFD54F'),
    P('co-ken', [[x - 30, y - 4], [x + 20, y - 14], [x + 24, y + 30], [x - 26, y + 40]], '#FF5F7E'),
  ];
}

export function musicNotes(prefix, pts) {
  return pts.flatMap(([x, y], k) => [E(`${prefix}-${k + 1}`, x, y, 11, 8, '#7D5FFF', -20), line(`M ${x + 10} ${y - 2} L ${x + 10} ${y - 40} L ${x + 26} ${y - 30}`, 3.5)]);
}

export function wizardHat(c, color = '#5E35B1') {
  const { x, y, s } = c.hat;
  return [
    E('vanh-mu-phu-thuy', x, y + 2 * s, 80 * s, 16 * s, color),
    P('mu-phu-thuy', [[x - 50 * s, y], [x + 16 * s, y - 130 * s], [x + 50 * s, y]], color),
    star('sao-mu-1', x - 4 * s, y - 40 * s, 12 * s, 5 * s, '#FFD54F'),
    star('sao-mu-2', x + 14 * s, y - 80 * s, 9 * s, 4 * s, '#FFD54F'),
  ];
}

export function iceCrown(c) {
  const { x, y, s } = c.hat;
  return [
    P('vuong-mien-bang', [[x - 54 * s, y + 6 * s], [x - 50 * s, y - 40 * s], [x - 30 * s, y - 14 * s], [x - 14 * s, y - 64 * s], [x, y - 22 * s], [x + 14 * s, y - 64 * s], [x + 30 * s, y - 14 * s], [x + 50 * s, y - 40 * s], [x + 54 * s, y + 6 * s]], '#B3E5FC'),
    star('ngoc-bang', x, y - 12 * s, 10 * s, 4 * s, '#FFFFFF', 6),
  ];
}

export function featherFan(x, y) {
  return [
    D('quat-long', `M ${pt(x, y)} L ${pt(x - 90, y - 80)} Q ${pt(x - 40, y - 140)} ${pt(x + 30, y - 120)} Z`, '#FFB3C1'),
    line(`M ${pt(x, y)} L ${pt(x - 60, y - 110)} M ${pt(x, y)} L ${pt(x - 20, y - 126)} M ${pt(x, y)} L ${pt(x - 84, y - 86)}`, 2.5),
    bar('can-quat', x, y, x + 20, y + 40, 8, '#FFC94D'),
  ];
}

export function wateringCan(x, y) {
  return [
    R('binh-tuoi', x - 40, y - 40, 80, 60, 14, '#4FA3E0'),
    P('voi-binh-tuoi', [[x + 36, y - 10], [x + 100, y - 60], [x + 108, y - 50], [x + 40, y + 6]], '#4FA3E0'),
    E('sen-binh-tuoi', x + 104, y - 56, 12, 8, '#2B7CC4', -40),
    D('quai-binh-tuoi', `M ${pt(x - 30, y - 40)} Q ${pt(x, y - 80)} ${pt(x + 30, y - 40)} L ${pt(x + 20, y - 40)} Q ${pt(x, y - 66)} ${pt(x - 20, y - 40)} Z`, '#2B7CC4'),
  ];
}

export function ladle(x, y) {
  return [bar('can-muoi', x, y, x + 20, y - 130, 10, '#BFC8D0'), E('muoi-mui', x + 22, y - 136, 26, 18, '#BFC8D0')];
}

export function cookPot(x, y) {
  return [R('noi-nau', x - 60, y - 50, 120, 70, 14, '#FF8A65'), R('mieng-noi', x - 68, y - 58, 136, 16, 6, '#E57350'), C('hoi-1', x - 20, y - 86, 12, '#F0F4F8'), C('hoi-2', x + 16, y - 104, 14, '#F0F4F8')];
}

export function pillow(c) {
  const x = c.cx;
  const y = c.bb[3] + 10;
  return [E('goi-nhung', x, y, 180, 34, '#B39DDB'), E('tua-goi-trai', x - 184, y, 14, 10, '#FFD54F'), E('tua-goi-phai', x + 184, y, 14, 10, '#FFD54F')];
}

export function bigKey(x, y) {
  return [C('dau-chia-khoa', x, y - 70, 30, '#FFD54F'), C('lo-chia-khoa', x, y - 70, 12, '#FFF3B0'), bar('than-chia-khoa', x, y - 40, x, y + 70, 14, '#FFD54F'), R('rang-chia-khoa-1', x + 6, y + 40, 26, 12, 3, '#FFD54F'), R('rang-chia-khoa-2', x + 6, y + 60, 20, 10, 3, '#FFD54F')];
}

export function openBook(x, y) {
  return [
    D('sach-trai', `M ${pt(x, y)} Q ${pt(x - 40, y - 20)} ${pt(x - 80, y - 6)} L ${pt(x - 80, y + 60)} Q ${pt(x - 40, y + 46)} ${pt(x, y + 66)} Z`, '#FFFFFF'),
    D('sach-phai', `M ${pt(x, y)} Q ${pt(x + 40, y - 20)} ${pt(x + 80, y - 6)} L ${pt(x + 80, y + 60)} Q ${pt(x + 40, y + 46)} ${pt(x, y + 66)} Z`, '#FFFFFF'),
    D('bia-sach', `M ${pt(x - 86, y - 2)} L ${pt(x - 86, y + 70)} Q ${pt(x, y + 60)} ${pt(x + 86, y + 70)} L ${pt(x + 86, y - 2)} L ${pt(x + 80, y + 60)} Q ${pt(x, y + 50)} ${pt(x - 80, y + 60)} Z`, '#FF7AA2'),
    line(`M ${pt(x - 66, y + 10)} L ${pt(x - 16, y + 18)} M ${pt(x - 66, y + 28)} L ${pt(x - 16, y + 36)} M ${pt(x + 16, y + 18)} L ${pt(x + 66, y + 10)} M ${pt(x + 16, y + 36)} L ${pt(x + 66, y + 28)}`, 2.5),
  ];
}

export function glasses(c) {
  const { x, y, s } = c.face;
  return [C('mat-kinh-trai', x - 26 * s, y, 17 * s, '#E3F6FF'), C('mat-kinh-phai', x + 26 * s, y, 17 * s, '#E3F6FF'), line(`M ${pt(x - 9 * s, y)} L ${pt(x + 9 * s, y)}`, 3)];
}

export function bell(x, y) {
  return [
    bar('gia-chuong', x - 60, y - 70, x + 60, y - 70, 12, '#8B5A2B'),
    D('chuong', `M ${pt(x - 40, y + 30)} Q ${pt(x - 40, y - 60)} ${pt(x, y - 60)} Q ${pt(x + 40, y - 60)} ${pt(x + 40, y + 30)} Q ${pt(x + 50, y + 40)} ${pt(x + 50, y + 44)} L ${pt(x - 50, y + 44)} Q ${pt(x - 50, y + 40)} ${pt(x - 40, y + 30)} Z`, '#FFD54F'),
    C('qua-lac', x, y + 50, 10, '#E6A817'),
    line(`M ${pt(x - 70, y - 10)} Q ${pt(x - 84, y + 10)} ${pt(x - 70, y + 30)} M ${pt(x + 70, y - 10)} Q ${pt(x + 84, y + 10)} ${pt(x + 70, y + 30)}`, 4),
  ];
}

export function bowAndArrow(x, y) {
  return [
    D('cung', `M ${pt(x, y - 100)} Q ${pt(x + 70, y)} ${pt(x, y + 100)} L ${pt(x + 8, y + 100)} Q ${pt(x + 80, y)} ${pt(x + 8, y - 100)} Z`, '#8B5A2B'),
    line(`M ${pt(x + 2, y - 98)} L ${pt(x + 2, y + 98)}`, 2),
    bar('mui-ten-than', x - 70, y, x + 90, y, 6, '#C68B59'),
    P('mui-ten', [[x + 88, y - 12], [x + 116, y], [x + 88, y + 12]], '#BFC8D0'),
    P('duoi-ten', [[x - 70, y], [x - 90, y - 16], [x - 60, y], [x - 90, y + 16]], '#FF5F7E'),
  ];
}

export function necklace(c) {
  const { x, y, s } = c.face;
  const ny = y + 62 * s;
  return [line(`M ${pt(x - 50 * s, ny - 10)} Q ${pt(x, ny + 20)} ${pt(x + 50 * s, ny - 10)}`, 3), C('mat-day-chuyen', x, ny + 12, 11, '#7DE2FF')];
}

export function flowerArch() {
  const items = [D('cong-hoa', 'M 60 480 L 60 250 Q 60 60 300 60 Q 540 60 540 250 L 540 480 L 500 480 L 500 250 Q 500 100 300 100 Q 100 100 100 250 L 100 480 Z', '#C8E6C9')];
  const colors = ['#FF7AA2', '#FFD54F', '#FF9EC0', '#FFFFFF'];
  for (let k = 0; k < 11; k++) {
    const a = Math.PI + (k / 10) * Math.PI;
    items.push(C(`hoa-cong-${k + 1}`, 300 + 220 * Math.cos(a), 250 + 170 * Math.sin(a), 16, colors[k % colors.length]));
  }
  return items;
}

export function veil(c) {
  const { x, y, s } = c.hat;
  return [D('khan-voan', `M ${pt(x - 40 * s, y)} Q ${pt(x - 150 * s, y + 120)} ${pt(x - 120 * s, y + 280)} L ${pt(x + 120 * s, y + 280)} Q ${pt(x + 150 * s, y + 120)} ${pt(x + 40 * s, y)} Z`, '#F7F9FC'), E('hoa-voan', x, y - 4, 20 * s, 12 * s, '#FFB3C1')];
}

export function bouquet(x, y) {
  return [
    P('giay-bo-hoa', [[x - 30, y - 10], [x + 30, y - 10], [x, y + 60]], '#FFF3D6'),
    C('bo-hoa-1', x - 18, y - 22, 16, '#FF7AA2'),
    C('bo-hoa-2', x + 18, y - 22, 16, '#FFD54F'),
    C('bo-hoa-3', x, y - 42, 16, '#FF9EC0'),
  ];
}

export function candle(id, x, yBase, h = 60, color = '#FFF3D6') {
  return [R(id, x - 10, yBase - h, 20, h, 4, color), D(`${id}-lua`, `M ${pt(x, yBase - h - 4)} C ${pt(x - 12, yBase - h - 16)} ${pt(x - 4, yBase - h - 32)} ${pt(x, yBase - h - 40)} C ${pt(x + 4, yBase - h - 32)} ${pt(x + 12, yBase - h - 16)} ${pt(x, yBase - h - 4)} Z`, '#FFC94D')];
}

export function banquetTable(y = 470) {
  return [
    R('ban-tiec', 20, y - 70, 560, 24, 8, '#C68B59'),
    R('khan-ban-tiec', 20, y - 50, 560, 40, 6, '#FFF3D6'),
    E('dia-tiec-1', 80, y - 76, 40, 10, '#FFFFFF'),
    E('dia-tiec-2', 520, y - 76, 40, 10, '#FFFFFF'),
    C('qua-tiec-1', 74, y - 92, 14, '#FF5F5F'),
    C('qua-tiec-2', 530, y - 92, 14, '#4CD787'),
  ];
}

// ---------------- Vũ trụ (Đội Xe Chinh Phục Vũ Trụ) ----------------

export function astronaut(id, x, y, s = 1) {
  return [
    R(`${id}-ba-lo`, x - 20 * s, y + 8 * s, 40 * s, 40 * s, 8 * s, '#BFC8D0'),
    R(`${id}-than`, x - 16 * s, y + 14 * s, 32 * s, 44 * s, 10 * s, '#FFFFFF'),
    C(`${id}-mu`, x, y, 24 * s, '#FFFFFF'),
    E(`${id}-kinh`, x, y + 2 * s, 16 * s, 12 * s, '#4FA3E0'),
  ];
}

export function helmetHead(id, x, y, r = 22) {
  return [C(`${id}-mu`, x, y, r, '#FFFFFF'), E(`${id}-kinh`, x, y + 2, r * 0.68, r * 0.52, '#4FA3E0')];
}

export function bigPlanet(x, y, r, color = '#B39DDB', ring = null) {
  const items = [];
  if (ring) items.push(E('vanh-dai-sau', x, y, r * 1.8, r * 0.42, ring, -12));
  items.push(C('hanh-tinh-lon', x, y, r, color), C('ho-lon-1', x - r * 0.35, y - r * 0.2, r * 0.18, '#9575CD'), C('ho-lon-2', x + r * 0.3, y + r * 0.3, r * 0.12, '#9575CD'));
  return items;
}

export function starRoad() {
  return [D('duong-sao', 'M -10 420 Q 300 360 610 420 L 610 480 Q 300 420 -10 480 Z', '#7D5FFF'), ...[40, 150, 260, 370, 480, 580].map((x, k) => star(`sao-duong-${k + 1}`, x, 430 - Math.sin((x / 600) * Math.PI) * 30, 10, 4, '#FFE066'))];
}

export function finishFlag(x, y) {
  const items = [bar('can-co-dich', x, y, x, y - 200, 8, '#BFC8D0')];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) items.push(R(`o-co-${r}-${k}`, x + 4 + k * 22, y - 200 + r * 22, 22, 22, 0, (r + k) % 2 ? '#2F3640' : '#FFFFFF'));
  return items;
}

export function busStop(x, y) {
  return [bar('cot-tram', x, y, x, y - 190, 10, '#BFC8D0'), C('bien-tram', x, y - 200, 34, '#4FA3E0'), star('sao-bien-tram', x, y - 200, 18, 8, '#FFE066')];
}

export function ringRoad() {
  return [E('vanh-dai-hanh-tinh', 300, 470, 340, 70, '#FFCC80'), E('trong-vanh-dai', 300, 470, 250, 40, '#B7BCC6')];
}

export function flamingMeteor(x, y) {
  return [D('duoi-lua-thien-thach', `M ${pt(x - 20, y - 20)} L ${pt(x + 110, y - 110)} L ${pt(x + 30, y + 10)} Z`, '#FF7043'), C('thien-thach-chay', x, y, 34, '#A1887F'), C('ho-thien-thach', x - 10, y - 8, 9, '#8D6E63')];
}

export function ladderUp(x0, y0, x1, y1) {
  const items = [bar('thang-trai', x0, y0, x1, y1, 8, '#DDE2E8'), bar('thang-phai', x0 + 30, y0 + 10, x1 + 30, y1 + 10, 8, '#DDE2E8')];
  const steps = [];
  for (let t = 0.1; t < 1; t += 0.15) steps.push(`M ${pt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)} L ${pt(x0 + 30 + (x1 - x0) * t, y0 + 10 + (y1 - y0) * t)}`);
  items.push(line(steps.join(' '), 4));
  return items;
}

export function smallRocket(x, y, rot = 30) {
  const r = (dx, dy) => {
    const a = (rot * Math.PI) / 180;
    return [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  return [
    P('tau-nho-lua', [r(-14, 50), r(14, 50), r(0, 90)], '#FF7043'),
    P('tau-nho', [r(0, -60), r(24, -20), r(24, 50), r(-24, 50), r(-24, -20)], '#FFFFFF'),
    P('canh-tau-nho-trai', [r(-24, 20), r(-44, 56), r(-24, 50)], '#FF5F7E'),
    P('canh-tau-nho-phai', [r(24, 20), r(44, 56), r(24, 50)], '#FF5F7E'),
    C('cua-tau-nho', ...r(0, -8), 12, '#8FD3FF'),
  ];
}

export function foam(prefix, pts) {
  return pts.map(([x, y, r], k) => C(`${prefix}-${k + 1}`, x, y, r, '#F0F8FF'));
}

export function beams(x, y, dir = 1, color = '#FFF3B0') {
  return [P('tia-den-1', [[x, y], [x + dir * 160, y - 60], [x + dir * 170, y - 10]], color), P('tia-den-2', [[x, y], [x - dir * 160, y - 60], [x - dir * 170, y - 10]], '#8FD3FF')];
}

export function rails(y = 486) {
  const items = [D('ray-ngan-ha', `M -10 ${y} Q 300 ${y - 50} 610 ${y} L 610 ${y + 16} Q 300 ${y - 34} -10 ${y + 16} Z`, '#BFC8D0')];
  const ts = [];
  for (let x = 20; x < 600; x += 50) {
    const yy = y + 8 - Math.sin((x / 600) * Math.PI) * 25;
    ts.push(`M ${x - 10} ${yy + 16} L ${x + 10} ${yy - 4}`);
  }
  items.push(line(ts.join(' '), 5));
  return items;
}

export function starStreaks() {
  // Sao băng: đuôi sáng (vùng tô) + ngôi sao ở đầu.
  return [[90, 110], [440, 70], [520, 250], [120, 260]].flatMap(([x, y], k) => [
    P(`duoi-sao-bang-${k + 1}`, [[x, y - 7], [x - 110, y - 22], [x - 116, y - 14], [x, y + 7]], '#FFF3B0'),
    star(`sao-bang-${k + 1}`, x, y, 14, 6, '#FFE066'),
  ]);
}

export function crates(x, y) {
  return [R('thung-hang-1', x - 60, y - 50, 56, 50, 4, '#FFC94D'), R('thung-hang-2', x, y - 50, 56, 50, 4, '#FF9F43'), R('thung-hang-3', x - 30, y - 96, 56, 46, 4, '#FFD54F'), line(`M ${x - 60} ${y - 25} L ${x - 4} ${y - 25} M ${x} ${y - 25} L ${x + 56} ${y - 25}`, 2)];
}

export function wormhole(x, y) {
  return ['#7D5FFF', '#B39DDB', '#4FA3E0', '#8FD3FF', '#243B6B'].map((col, k) => E(`duong-ham-${k + 1}`, x, y, 250 - k * 44, 200 - k * 36, col));
}

export function constellation() {
  const pts = [[80, 80], [150, 130], [230, 90], [300, 150], [380, 100], [460, 150], [530, 90]];
  return pts.map(([x, y], k) => star(`chom-sao-${k + 1}`, x, y, 16, 7, '#FFE066'));
}

export function boosters(y1, xs) {
  return xs.flatMap((x, k) => [P(`lua-phu-${k + 1}`, [[x - 46, y1 + 4], [x - 110, y1 + 17], [x - 46, y1 + 30]], '#FFC94D'), R(`ten-lua-phu-${k + 1}`, x - 50, y1, 100, 34, 16, '#FF5F7E'), P(`mui-ten-lua-phu-${k + 1}`, [[x + 48, y1 + 2], [x + 76, y1 + 17], [x + 48, y1 + 32]], '#FFFFFF')]);
}

export function loopTrail() {
  return [line('M 60 420 Q 60 200 220 200 Q 360 200 330 300 Q 300 380 220 330 Q 150 280 200 180', 5)];
}

export function fuelHose(x0, y0, x1, y1) {
  return [bar('ong-tiep-nhien-lieu', x0, y0, x1, y1, 14, '#FFC94D'), C('dau-voi-xang', x1, y1, 14, '#FF9F43')];
}

export function runwayLights() {
  return [0, 1, 2, 3, 4, 5].map((k) => C(`den-duong-bang-${k + 1}`, 60 + k * 96, 520, 10, k % 2 ? '#FFE066' : '#FF5F7E'));
}

export function rotorBlur(x, y) {
  return [line(`M ${x - 230} ${y - 20} Q ${x} ${y - 60} ${x + 230} ${y - 20} M ${x - 200} ${y + 16} Q ${x} ${y + 40} ${x + 200} ${y + 16}`, 4)];
}

export function supplyDrop(x, y) {
  return [
    D('du-tiep-te', `M ${pt(x - 60, y)} Q ${pt(x, y - 80)} ${pt(x + 60, y)} Q ${pt(x, y - 20)} ${pt(x - 60, y)} Z`, '#4CD787'),
    line(`M ${pt(x - 60, y)} L ${pt(x - 20, y + 60)} M ${pt(x + 60, y)} L ${pt(x + 20, y + 60)}`, 2),
    R('thung-tiep-te', x - 26, y + 60, 52, 44, 6, '#FFC94D'),
    P('chu-thap-thung', [[x - 5, y + 66], [x + 5, y + 66], [x + 5, y + 78], [x + 17, y + 78], [x + 17, y + 88], [x + 5, y + 88], [x + 5, y + 100], [x - 5, y + 100], [x - 5, y + 88], [x - 17, y + 88], [x - 17, y + 78], [x - 5, y + 78]], '#FF5F5F'),
  ];
}

export function caveArch() {
  return [D('hang-hanh-tinh', 'M 0 480 L 0 200 Q 120 110 250 180 Q 330 120 420 170 Q 520 110 600 190 L 600 480 L 520 480 Q 500 260 300 260 Q 100 260 80 480 Z', '#6D6875')];
}

export function lightCone(x, y) {
  return [P('chum-den', [[x - 12, y], [x + 12, y], [x + 110, y + 190], [x - 110, y + 190]], '#FFF3B0')];
}

export function satellite(x, y) {
  return [
    R('tam-pin-ve-tinh-trai', x - 100, y - 16, 70, 32, 3, '#4FA3E0'),
    R('tam-pin-ve-tinh-phai', x + 30, y - 16, 70, 32, 3, '#4FA3E0'),
    R('than-ve-tinh', x - 30, y - 30, 60, 60, 10, '#E3F0FF'),
    E('chao-ve-tinh', x, y - 44, 26, 10, '#BFC8D0'),
    line(`M ${x - 80} ${y - 16} L ${x - 80} ${y + 16} M ${x - 55} ${y - 16} L ${x - 55} ${y + 16} M ${x + 55} ${y - 16} L ${x + 55} ${y + 16} M ${x + 80} ${y - 16} L ${x + 80} ${y + 16}`, 2),
  ];
}

// ---------------- Nghề nghiệp (Thị Trấn Khủng Long Tài Ba) ----------------

export function cap(c, color = '#4FA3E0', visor = '#2B7CC4', id = 'mu-luoi-trai') {
  const { x, y, s } = c.hat;
  return [
    D(id, `M ${pt(x - 50 * s, y + 4 * s)} Q ${pt(x - 50 * s, y - 60 * s)} ${pt(x, y - 62 * s)} Q ${pt(x + 50 * s, y - 60 * s)} ${pt(x + 50 * s, y + 4 * s)} Z`, color),
    D(`${id}-luoi`, `M ${pt(x - 60 * s, y + 4 * s)} Q ${pt(x, y - 10 * s)} ${pt(x + 60 * s, y + 4 * s)} Q ${pt(x, y + 22 * s)} ${pt(x - 60 * s, y + 4 * s)} Z`, visor),
  ];
}

export function hardHat(c, color = '#FFC94D') {
  const { x, y, s } = c.hat;
  return [E('vanh-mu-bao-ho', x, y + 2 * s, 70 * s, 12 * s, color), D('mu-bao-ho', `M ${pt(x - 50 * s, y)} Q ${pt(x - 50 * s, y - 66 * s)} ${pt(x, y - 68 * s)} Q ${pt(x + 50 * s, y - 66 * s)} ${pt(x + 50 * s, y)} Z`, color), R('go-mu-bao-ho', x - 8 * s, y - 66 * s, 16 * s, 64 * s, 6 * s, '#FFB300')];
}

export function bucketHat(c, color = '#81C784') {
  const { x, y, s } = c.hat;
  return [D('mu-tai-beo', `M ${pt(x - 70 * s, y + 8 * s)} L ${pt(x - 44 * s, y - 50 * s)} Q ${pt(x, y - 60 * s)} ${pt(x + 44 * s, y - 50 * s)} L ${pt(x + 70 * s, y + 8 * s)} Z`, color)];
}

export function rangerHat(c) {
  const { x, y, s } = c.hat;
  return [E('vanh-mu-kiem-lam', x, y, 90 * s, 18 * s, '#8D6E63'), P('mu-kiem-lam', [[x - 44 * s, y - 4 * s], [x - 30 * s, y - 60 * s], [x, y - 44 * s], [x + 30 * s, y - 60 * s], [x + 44 * s, y - 4 * s]], '#A1887F'), R('day-mu-kiem-lam', x - 44 * s, y - 16 * s, 88 * s, 10 * s, 3 * s, '#4CAF50')];
}

export function fedora(c, color = '#8D6E63') {
  const { x, y, s } = c.hat;
  return [E('vanh-mu-pho-da', x, y, 84 * s, 16 * s, color), D('mu-pho-da', `M ${pt(x - 44 * s, y - 2 * s)} L ${pt(x - 38 * s, y - 56 * s)} Q ${pt(x, y - 40 * s)} ${pt(x + 38 * s, y - 56 * s)} L ${pt(x + 44 * s, y - 2 * s)} Z`, color), R('day-mu-pho-da', x - 44 * s, y - 18 * s, 88 * s, 12 * s, 3 * s, '#2F3640')];
}

export function beret(c, color = '#FF5F7E') {
  const { x, y, s } = c.hat;
  return [E('mu-noi', x - 8 * s, y - 14 * s, 64 * s, 26 * s, color, -8), C('nut-mu-noi', x - 8 * s, y - 40 * s, 7 * s, color)];
}

export function pilotCap(c) {
  const { x, y, s } = c.hat;
  return [
    D('mu-phi-cong', `M ${pt(x - 56 * s, y + 20 * s)} Q ${pt(x - 56 * s, y - 60 * s)} ${pt(x, y - 62 * s)} Q ${pt(x + 56 * s, y - 60 * s)} ${pt(x + 56 * s, y + 20 * s)} Z`, '#A0673A'),
    C('kinh-phi-cong-trai', x - 24 * s, y - 20 * s, 16 * s, '#8FD3FF'),
    C('kinh-phi-cong-phai', x + 24 * s, y - 20 * s, 16 * s, '#8FD3FF'),
  ];
}

export function scarf(c, color = '#FF5F5F') {
  const { x, y, s } = c.face;
  const ny = y + 70 * s;
  return [R('khan-quang', x - 56 * s, ny - 12 * s, 112 * s, 24 * s, 12 * s, color), P('duoi-khan', [[x + 30 * s, ny], [x + 110 * s, ny - 20 * s], [x + 100 * s, ny + 20 * s]], color)];
}

export function microphone(x, y) {
  return [bar('can-mic', x, y + 20, x + 10, y + 90, 12, '#2F3640'), C('dau-mic', x, y, 22, '#BFC8D0'), line(`M ${x - 16} ${y - 6} L ${x + 16} ${y - 6} M ${x - 18} ${y + 6} L ${x + 18} ${y + 6}`, 2)];
}

export function bricks(x, y) {
  return [R('gach-1', x - 60, y - 30, 58, 30, 3, '#E57350'), R('gach-2', x, y - 30, 58, 30, 3, '#E57350'), R('gach-3', x - 30, y - 60, 58, 30, 3, '#FF8A65'), bar('bay-xay', x + 70, y - 10, x + 110, y - 90, 8, '#8B5A2B'), P('luoi-bay', [[x + 96, y - 100], [x + 130, y - 120], [x + 128, y - 80]], '#BFC8D0')];
}

export function stopSign(x, y) {
  const pts = [];
  for (let k = 0; k < 8; k++) {
    const a = ((k * 45 + 22.5) * Math.PI) / 180;
    pts.push([x + 40 * Math.cos(a), y - 190 + 40 * Math.sin(a)]);
  }
  return [bar('cot-bien-dung', x, y, x, y - 160, 10, '#BFC8D0'), P('bien-dung', pts, '#FF5F5F'), R('vach-bien-dung', x - 24, y - 196, 48, 12, 4, '#FFFFFF')];
}

export function whistle(c) {
  const { x, y, s } = c.face;
  return [R('coi', x + 10 * s, y + 34 * s, 44 * s, 18 * s, 8 * s, '#BFC8D0'), { ...line(`M ${pt(x + 14 * s, y + 44 * s)} Q ${pt(x - 20 * s, y + 90 * s)} ${pt(x - 50 * s, y + 70 * s)}`, 2), onFace: true }]; // dây còi đeo cổ
}

export function bucket(x, y) {
  return [P('xo-nuoc', [[x - 40, y - 60], [x + 40, y - 60], [x + 30, y], [x - 30, y]], '#4FA3E0'), E('nuoc-xo', x, y - 60, 40, 9, '#D6F0FF'), line(`M ${x - 40} ${y - 60} Q ${x} ${y - 110} ${x + 40} ${y - 60}`, 3), C('bot-xa-phong', x - 16, y - 76, 12, '#F0F8FF'), C('bot-xa-phong-2', x + 10, y - 82, 9, '#F0F8FF')];
}

export function squeegee(x, y) {
  return [bar('can-gat-kinh', x, y, x + 50, y - 130, 8, '#FFC94D'), bar('luoi-gat-kinh', x + 20, y - 150, x + 90, y - 120, 14, '#2F3640')];
}

export function tallBuilding() {
  const items = [R('toa-nha-cao', 440, 60, 150, 420, 6, '#B0BEC5')];
  let k = 1;
  for (let y = 90; y < 440; y += 70) for (const x of [460, 530]) items.push(R(`cua-kinh-${k++}`, x, y, 44, 46, 4, '#D6F0FF'));
  return items;
}

export function streetLamp(x, y) {
  return [bar('cot-den', x, y, x, y - 300, 12, '#2F3640'), bar('tay-den', x, y - 300, x - 50, y - 300, 10, '#2F3640'), P('choa-den', [[x - 80, y - 290], [x - 20, y - 290], [x - 36, y - 250], [x - 64, y - 250]], '#2F3640'), E('bong-den-duong', x - 50, y - 250, 16, 12, '#FFE066')];
}

export function lighterPole(x, y) {
  return [bar('sao-thap-den', x, y, x + 40, y - 190, 8, '#8B5A2B'), ...[{ dy: 0 }].flatMap(() => [D('lua-thap-den', `M ${pt(x + 42, y - 194)} C ${pt(x + 30, y - 208)} ${pt(x + 38, y - 226)} ${pt(x + 42, y - 234)} C ${pt(x + 46, y - 226)} ${pt(x + 56, y - 208)} ${pt(x + 42, y - 194)} Z`, '#FFC94D')])];
}

export function chalkboard(x, y) {
  return [R('khung-bang', x - 90, y - 150, 180, 120, 8, '#A0673A'), R('mat-bang', x - 78, y - 138, 156, 96, 4, '#2E7D32'), bar('chan-bang-trai', x - 60, y - 30, x - 80, y + 30, 8, '#A0673A'), bar('chan-bang-phai', x + 60, y - 30, x + 80, y + 30, 8, '#A0673A'), deco(`<text x="${x}" y="${y - 72}" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="40" fill="#FFFFFF">ABC</text>`)];
}

export function pointer(x, y) {
  return [bar('que-chi', x, y, x + 60, y - 110, 7, '#C68B59')];
}

export function lantern(x, y) {
  return [line(`M ${x} ${y - 60} Q ${x} ${y - 90} ${x + 20} ${y - 90}`, 3), R('den-long-tay', x - 22, y - 60, 44, 60, 10, '#FFE066'), R('nap-den-long', x - 26, y - 66, 52, 12, 4, '#2F3640'), R('day-den-long', x - 26, y - 4, 52, 10, 4, '#2F3640')];
}

export function pineTrees() {
  return [P('thong-xa-1', [[20, 470], [80, 300], [140, 470]], '#4CAF50'), P('thong-xa-2', [[460, 470], [520, 280], [580, 470]], '#43A047')];
}

export function comb(x, y) {
  const teeth = [];
  for (let k = 0; k < 7; k++) teeth.push(`M ${x - 36 + k * 10} ${y} L ${x - 36 + k * 10} ${y + 22}`);
  return [R('luoc', x - 42, y - 16, 84, 18, 6, '#FF7AA2'), line(teeth.join(' '), 3)];
}

export function scissors(x, y) {
  return [C('quai-keo-1', x - 20, y + 30, 16, '#4FA3E0'), C('quai-keo-2', x + 20, y + 30, 16, '#4FA3E0'), P('luoi-keo-1', [[x - 12, y + 18], [x + 34, y - 60], [x + 4, y + 14]], '#DDE2E8'), P('luoi-keo-2', [[x + 12, y + 18], [x - 34, y - 60], [x - 4, y + 14]], '#DDE2E8')];
}

export function barberPole(x, y) {
  return [R('cot-cat-toc', x - 20, y - 200, 40, 200, 18, '#FFFFFF'), line(`M ${x - 20} ${y - 170} L ${x + 20} ${y - 200} M ${x - 20} ${y - 130} L ${x + 20} ${y - 160} M ${x - 20} ${y - 90} L ${x + 20} ${y - 120} M ${x - 20} ${y - 50} L ${x + 20} ${y - 80} M ${x - 20} ${y - 10} L ${x + 20} ${y - 40}`, 6), C('dau-cot-cat-toc', x, y - 206, 16, '#FF5F5F')];
}

export function flowerBasket(x, y) {
  return [P('gio-hoa', [[x - 56, y - 50], [x + 56, y - 50], [x + 40, y], [x - 40, y]], '#C68B59'), line(`M ${x - 56} ${y - 50} Q ${x} ${y - 120} ${x + 56} ${y - 50}`, 4), C('hoa-gio-1', x - 30, y - 60, 16, '#FF7AA2'), C('hoa-gio-2', x, y - 66, 16, '#FFD54F'), C('hoa-gio-3', x + 30, y - 60, 16, '#7D5FFF')];
}

export function hammerPlank(x, y) {
  return [R('tam-go', x - 90, y - 20, 180, 30, 4, '#E0A15A'), line(`M ${x - 80} ${y - 6} L ${x + 80} ${y - 6}`, 2), bar('can-bua', x + 60, y - 40, x + 100, y - 150, 10, '#8B5A2B'), R('dau-bua', x + 76, y - 176, 60, 26, 5, '#BFC8D0')];
}

export function baton(x, y) {
  return [bar('dua-chi-huy', x, y, x + 50, y - 110, 5, '#FFFFFF'), C('can-dua-chi-huy', x, y, 8, '#8B5A2B')];
}

export function potteryWheel(x, y) {
  return [E('ban-xoay-gom', x, y - 10, 90, 18, '#8D6E63'), R('chan-ban-xoay', x - 20, y - 4, 40, 40, 6, '#6D4C41'), D('binh-gom', `M ${pt(x - 34, y - 20)} Q ${pt(x - 60, y - 70)} ${pt(x - 20, y - 110)} L ${pt(x - 20, y - 130)} L ${pt(x + 20, y - 130)} L ${pt(x + 20, y - 110)} Q ${pt(x + 60, y - 70)} ${pt(x + 34, y - 20)} Z`, '#E0A15A')];
}

export function yarnBall(x, y) {
  return [C('cuon-len', x, y, 40, '#FF7AA2'), line(`M ${x - 36} ${y - 10} Q ${x} ${y - 40} ${x + 30} ${y - 20} M ${x - 30} ${y + 16} Q ${x} ${y - 10} ${x + 36} ${y + 8} M ${x - 14} ${y + 36} Q ${x + 10} ${y + 10} ${x + 26} ${y + 30}`, 2.5), bar('kim-dan-1', x + 20, y - 60, x + 60, y + 20, 6, '#FFC94D'), bar('kim-dan-2', x + 50, y - 60, x + 20, y + 20, 6, '#FFC94D')];
}

export function broom(x, y) {
  return [bar('can-choi', x, y - 180, x + 20, y - 40, 10, '#C68B59'), P('choi', [[x - 10, y - 50], [x + 50, y - 50], [x + 70, y + 10], [x - 20, y + 10]], '#FFD54F'), line(`M ${x + 5} ${y - 40} L ${x - 5} ${y + 8} M ${x + 22} ${y - 40} L ${x + 22} ${y + 8} M ${x + 40} ${y - 40} L ${x + 50} ${y + 8}`, 2)];
}

export function leaves(prefix, pts) {
  const colors = ['#FF9F43', '#FFC94D', '#E57350'];
  return pts.map(([x, y, r], k) => E(`${prefix}-${k + 1}`, x, y, 18, 10, colors[k % 3], r));
}

export function umbrella(x, y, color = '#7D5FFF') {
  return [
    D('o', `M ${pt(x - 100, y)} Q ${pt(x - 100, y - 90)} ${pt(x, y - 90)} Q ${pt(x + 100, y - 90)} ${pt(x + 100, y)} Q ${pt(x + 66, y - 20)} ${pt(x + 33, y)} Q ${pt(x, y - 20)} ${pt(x - 33, y)} Q ${pt(x - 66, y - 20)} ${pt(x - 100, y)} Z`, color),
    bar('can-o', x, y - 90, x, y + 120, 7, '#2F3640'),
  ];
}

export function camera(x, y) {
  return [R('may-anh', x - 50, y - 34, 100, 68, 12, '#2F3640'), R('nut-may-anh', x - 36, y - 46, 30, 14, 4, '#BFC8D0'), C('ong-kinh', x + 6, y, 24, '#8FD3FF'), C('trong-ong-kinh', x + 6, y, 11, '#4FA3E0'), star('den-flash', x + 60, y - 50, 22, 8, '#FFE066')];
}

export function kite(x, y) {
  return [P('dieu', [[x, y - 70], [x + 56, y], [x, y + 70], [x - 56, y]], '#FF7AA2'), line(`M ${x} ${y - 70} L ${x} ${y + 70} M ${x - 56} ${y} L ${x + 56} ${y}`, 2), line(`M ${x} ${y + 70} Q ${x - 30} ${y + 130} ${x + 10} ${y + 170}`, 3), R('no-duoi-dieu-1', x - 20, y + 110, 20, 12, 4, '#FFD54F'), R('no-duoi-dieu-2', x - 6, y + 146, 20, 12, 4, '#4FA3E0')];
}

export function ringBuoy(x, y) {
  return [C('phao-cuu-sinh', x, y, 44, '#FF5F5F'), C('lo-phao', x, y, 20, '#8FD3FF'), R('soc-phao-1', x - 8, y - 44, 16, 24, 2, '#FFFFFF'), R('soc-phao-2', x - 8, y + 20, 16, 24, 2, '#FFFFFF')];
}

export function fossil(x, y) {
  return [E('hoa-thach', x, y, 90, 30, '#E0C08A'), line(`M ${x - 60} ${y} L ${x + 60} ${y} M ${x - 40} ${y - 16} L ${x - 40} ${y + 16} M ${x - 14} ${y - 18} L ${x - 14} ${y + 18} M ${x + 12} ${y - 18} L ${x + 12} ${y + 18} M ${x + 38} ${y - 16} L ${x + 38} ${y + 16}`, 3), bar('can-co', x + 100, y - 20, x + 130, y - 110, 8, '#8B5A2B'), R('long-co', x + 122, y - 140, 20, 34, 5, '#FFD54F')];
}

export function tourFlag(x, y) {
  return [bar('can-co-du-lich', x, y, x, y - 230, 8, '#8B5A2B'), P('co-du-lich', [[x, y - 230], [x + 70, y - 214], [x, y - 196]], '#4CD787'), star('sao-co-du-lich', x + 24, y - 214, 8, 3, '#FFD54F')];
}

export function notebook(x, y) {
  return [R('so-tay', x - 34, y - 46, 68, 92, 6, '#FFF3D6'), R('gay-so-tay', x - 34, y - 46, 12, 92, 3, '#FF8A65'), line(`M ${x - 14} ${y - 26} L ${x + 24} ${y - 26} M ${x - 14} ${y - 6} L ${x + 24} ${y - 6} M ${x - 14} ${y + 14} L ${x + 16} ${y + 14}`, 2.5), bar('but-so-tay', x + 40, y + 40, x + 70, y - 40, 7, '#4FA3E0')];
}

// ---------------- Thể thao (Đại Hội Thể Thao Trái Cây) ----------------
// Trái cây có tay (A.limbs): tay trái ≈ (c.left, my), tay phải ≈ (c.right, my), chân ở đáy c.bb[3].
export const handPos = (c, side = 1) => [side > 0 ? c.right + 6 : c.left - 6, (c.bb[1] + c.bb[3]) / 2 + 30];

export function relayBaton(c) {
  const [x, y] = handPos(c, 1);
  return [bar('gay-tiep-suc', x - 10, y + 20, x + 40, y - 40, 16, '#FFC94D')];
}

export function trackLanes() {
  return [R('duong-chay', 0, 470, 600, 130, 0, '#FF8A65'), line('M 0 510 L 600 510 M 0 555 L 600 555', 4)];
}

export function archeryTarget(x, y) {
  return [bar('chan-bia-1', x - 30, y + 120, x, y, 8, '#8B5A2B'), bar('chan-bia-2', x + 30, y + 120, x, y, 8, '#8B5A2B'), C('bia-1', x, y, 60, '#FFFFFF'), C('bia-2', x, y, 44, '#4FA3E0'), C('bia-3', x, y, 28, '#FF5F5F'), C('bia-4', x, y, 12, '#FFD54F')];
}

export function fencing(c) {
  const [x, y] = handPos(c, 1);
  const { x: fx, y: fy, s } = c.face;
  return [
    bar('kiem-dau', x, y, x + 150, y - 110, 6, '#DDE2E8'),
    C('chuoi-kiem-dau', x, y, 14, '#BFC8D0'),
    R('mat-na-dau-kiem', fx - 52 * s, fy - 34 * s, 104 * s, 80 * s, 30 * s, '#DDE2E8'),
    line(`M ${pt(fx - 30 * s, fy - 30 * s)} L ${pt(fx - 30 * s, fy + 42 * s)} M ${pt(fx, fy - 34 * s)} L ${pt(fx, fy + 46 * s)} M ${pt(fx + 30 * s, fy - 30 * s)} L ${pt(fx + 30 * s, fy + 42 * s)} M ${pt(fx - 50 * s, fy - 6 * s)} L ${pt(fx + 50 * s, fy - 6 * s)} M ${pt(fx - 48 * s, fy + 20 * s)} L ${pt(fx + 48 * s, fy + 20 * s)}`, 2),
  ];
}

export function barbell(c) {
  const y = c.bb[1] - 30;
  return [bar('don-ta', c.left - 70, y, c.right + 70, y, 12, '#BFC8D0'), R('ta-trai', c.left - 80, y - 50, 30, 100, 8, '#2F3640'), R('ta-phai', c.right + 50, y - 50, 30, 100, 8, '#2F3640'), bar('tay-nang-trai', c.left + 6, (c.bb[1] + c.bb[3]) / 2, c.left - 30, y, 22, '#FFE0B5'), bar('tay-nang-phai', c.right - 6, (c.bb[1] + c.bb[3]) / 2, c.right + 30, y, 22, '#FFE0B5')];
}

export function surf(c) {
  return [E('van-luot-song', c.cx, c.bb[3] + 30, 190, 22, '#FF7AA2'), line(`M ${c.cx - 150} ${c.bb[3] + 30} L ${c.cx + 150} ${c.bb[3] + 30}`, 2)];
}

export function bigWave() {
  return [D('con-song', 'M 0 600 L 0 380 Q 60 250 170 260 Q 250 270 230 330 Q 200 300 170 320 Q 150 380 240 420 Q 400 470 600 440 L 600 600 Z', '#4FA3E0'), D('bot-song', 'M 170 260 Q 250 270 230 330 Q 210 300 180 306 Q 160 290 170 260 Z', '#F0F8FF')];
}

export function kayak(c) {
  const y = c.bb[3] - 10;
  return [D('thuyen-kayak', `M ${pt(c.cx - 230, y)} Q ${pt(c.cx, y + 60)} ${pt(c.cx + 230, y)} Q ${pt(c.cx, y + 20)} ${pt(c.cx - 230, y)} Z`, '#FFC94D'), bar('mai-cheo', c.left - 60, y - 140, c.right + 60, y + 30, 8, '#8B5A2B'), E('dau-mai-trai', c.left - 60, y - 140, 16, 30, '#FF5F5F', -35), E('dau-mai-phai', c.right + 60, y + 30, 16, 30, '#FF5F5F', -35)];
}

export function skis(c) {
  const y = c.bb[3] + 36;
  return [bar('van-truot-tuyet-1', c.cx - 150, y - 10, c.cx + 130, y + 20, 12, '#FF5F5F'), bar('van-truot-tuyet-2', c.cx - 130, y + 10, c.cx + 150, y + 40, 12, '#4FA3E0'), bar('gay-truot-trai', c.left - 10, c.bb[3] - 100, c.left - 60, y + 30, 6, '#2F3640'), bar('gay-truot-phai', c.right + 10, c.bb[3] - 100, c.right + 60, y + 30, 6, '#2F3640')];
}

export function poleVault(c) {
  return [bar('sao-nhay', c.left - 40, c.bb[3] + 40, c.right + 60, c.bb[1] - 60, 8, '#FFC94D'), bar('xa-ngang', 380, 120, 590, 120, 8, '#FF5F5F'), bar('cot-xa-1', 400, 120, 400, 480, 8, '#BFC8D0'), bar('cot-xa-2', 570, 120, 570, 480, 8, '#BFC8D0')];
}

export function climbingWall() {
  const items = [R('vach-leo', 60, 40, 480, 440, 10, '#B0BEC5')];
  [[120, 100, '#FF5F5F'], [220, 160, '#FFD54F'], [420, 110, '#4CD787'], [480, 220, '#7D5FFF'], [110, 300, '#4FA3E0'], [500, 380, '#FF9F43'], [160, 420, '#FF7AA2']].forEach(([x, y, col], k) => items.push(E(`cuc-bam-${k + 1}`, x, y, 18, 13, col, k * 30)));
  items.push(line('M 300 40 L 300 150', 3));
  return items;
}

export function ribbon(c) {
  const [x, y] = handPos(c, 1);
  return [bar('que-ruy-bang', x, y, x + 40, y - 70, 6, '#8B5A2B'), D('ruy-bang', `M ${pt(x + 40, y - 70)} C ${pt(x + 160, y - 200)} ${pt(x - 100, y - 260)} ${pt(x - 60, y - 330)} C ${pt(x - 30, y - 250)} ${pt(x + 160, y - 190)} ${pt(x + 52, y - 66)} Z`, '#FF7AA2')];
}

export function iceSkates(c) {
  const b = c.bb[3];
  return [R('giay-truot-bang-trai', c.cx - 70, b + 16, 50, 26, 8, '#FFFFFF'), R('giay-truot-bang-phai', c.cx + 20, b + 16, 50, 26, 8, '#FFFFFF'), bar('luoi-truot-trai', c.cx - 76, b + 48, c.cx - 14, b + 48, 5, '#BFC8D0'), bar('luoi-truot-phai', c.cx + 14, b + 48, c.cx + 76, b + 48, 5, '#BFC8D0')];
}

export function racket(c, color = '#4CD787', id = 'vot') {
  const [x, y] = handPos(c, 1);
  return [bar(`can-${id}`, x, y + 10, x + 30, y - 50, 9, '#8B5A2B'), E(id, x + 50, y - 100, 34, 46, color, 25), line(`M ${x + 30} ${y - 130} L ${x + 70} ${y - 70} M ${x + 22} ${y - 104} L ${x + 76} ${y - 96} M ${x + 40} ${y - 142} L ${x + 60} ${y - 58}`, 1.5)];
}

export function net(y = 470, h = 150) {
  const items = [bar('cot-luoi', 40, y, 40, y - h, 8, '#BFC8D0'), R('luoi', 44, y - h, 110, h - 40, 2, '#F0F4F8')];
  const ls = [];
  for (let x = 60; x < 154; x += 18) ls.push(`M ${x} ${y - h} L ${x} ${y - 40}`);
  for (let yy = y - h + 18; yy < y - 40; yy += 18) ls.push(`M 44 ${yy} L 154 ${yy}`);
  items.push(line(ls.join(' '), 1.5));
  return items;
}

export function shuttlecock(x, y) {
  return [P('long-cau', [[x - 18, y - 40], [x + 18, y - 40], [x + 8, y], [x - 8, y]], '#FFFFFF'), C('dau-cau', x, y + 6, 10, '#FF5F5F')];
}

export function yogaMat(c) {
  return [R('tham-yoga', c.cx - 190, c.bb[3] + 20, 380, 24, 10, '#B39DDB')];
}

export function volleyball(x, y) {
  return [C('bong-chuyen', x, y, 36, '#FFFFFF'), line(`M ${x - 34} ${y - 8} Q ${x} ${y - 20} ${x + 20} ${y - 30} M ${x - 20} ${y + 28} Q ${x - 4} ${y} ${x + 34} ${y + 6} M ${x + 4} ${y - 36} Q ${x + 10} ${y} ${x - 6} ${y + 36}`, 2.5)];
}

export function bowling(x, y) {
  const pin = (k, px, py) => [D(`ky-bowling-${k}`, `M ${pt(px, py - 60)} Q ${pt(px + 14, py - 60)} ${pt(px + 10, py - 38)} Q ${pt(px + 22, py - 10)} ${pt(px + 14, py)} L ${pt(px - 14, py)} Q ${pt(px - 22, py - 10)} ${pt(px - 10, py - 38)} Q ${pt(px - 14, py - 60)} ${pt(px, py - 60)} Z`, '#FFFFFF'), R(`soc-ky-${k}`, px - 11, py - 44, 22, 6, 2, '#FF5F5F')];
  return [...pin(1, x, y), ...pin(2, x + 36, y - 10), ...pin(3, x + 72, y), ...pin(4, x + 18, y - 34)];
}

export function bowlingBall(x, y) {
  return [C('bong-bowling', x, y, 36, '#7D5FFF'), C('lo-bowling-1', x - 8, y - 12, 5, '#2F3640'), C('lo-bowling-2', x + 8, y - 14, 5, '#2F3640'), C('lo-bowling-3', x, y, 5, '#2F3640')];
}

export function tugRope(c) {
  const [x, y] = handPos(c, -1);
  return [bar('day-keo-co', x + 40, y, -10, y + 20, 14, '#C68B59'), R('co-keo-co', 150, y + 2, 16, 40, 3, '#FF5F5F')];
}

export function tennisBall(x, y) {
  return [C('bong-tennis', x, y, 18, '#D4E157'), line(`M ${x - 16} ${y - 6} Q ${x} ${y + 4} ${x + 16} ${y - 6}`, 2)];
}

export function pingPongTable() {
  return [R('ban-bong-ban', 330, 380, 260, 20, 4, '#2E7D32'), bar('chan-ban-1', 350, 400, 350, 480, 8, '#2F3640'), bar('chan-ban-2', 570, 400, 570, 480, 8, '#2F3640'), R('luoi-bong-ban', 452, 350, 8, 32, 2, '#FFFFFF'), C('bong-ban', 500, 320, 10, '#FFFFFF')];
}

export function paddle(c) {
  const [x, y] = handPos(c, 1);
  return [bar('can-vot-bong-ban', x, y, x + 20, y - 30, 12, '#8B5A2B'), C('vot-bong-ban', x + 30, y - 60, 30, '#FF5F5F')];
}

export function golf(c) {
  const [x, y] = handPos(c, 1);
  return [bar('gay-golf', x, y, x + 40, c.bb[3] + 30, 7, '#BFC8D0'), R('dau-gay-golf', x + 30, c.bb[3] + 22, 36, 16, 5, '#2F3640'), C('bong-golf', x + 90, c.bb[3] + 34, 10, '#FFFFFF'), bar('can-co-golf', 520, 540, 520, 380, 5, '#BFC8D0'), P('co-golf', [[520, 380], [580, 396], [520, 412]], '#FF5F5F'), E('lo-golf', 520, 542, 20, 6, '#2F3640')];
}

export function karate(c) {
  const { x, y, s } = c.face;
  return [R('bang-dau-karate', x - 64 * s, y - 64 * s, 128 * s, 18 * s, 6 * s, '#FF5F5F'), P('duoi-bang-dau', [[x + 60 * s, y - 58 * s], [x + 100 * s, y - 84 * s], [x + 96 * s, y - 44 * s]], '#FF5F5F'), R('dai-karate', c.cx - 70, c.bb[3] - 44, 140, 16, 6, '#FFFFFF'), P('nut-dai-karate', [[c.cx - 6, c.bb[3] - 36], [c.cx - 26, c.bb[3] - 6], [c.cx - 10, c.bb[3] - 8], [c.cx + 10, c.bb[3] - 8], [c.cx + 26, c.bb[3] - 6], [c.cx + 6, c.bb[3] - 36]], '#FFFFFF')];
}

export function brokenBoard(x, y) {
  return [P('van-gay-1', [[x - 70, y - 16], [x - 4, y - 16], [x + 4, y], [x - 4, y + 16], [x - 70, y + 16]], '#E0A15A'), P('van-gay-2', [[x + 10, y - 26], [x + 76, y - 36], [x + 80, y - 4], [x + 18, y + 6], [x + 22, y - 10]], '#E0A15A')];
}

export function baseball(c) {
  const [x, y] = handPos(c, 1);
  return [bar('gay-bong-chay', x, y, x + 90, y - 150, 16, '#C68B59'), C('bong-chay', 150, 160, 18, '#FFFFFF'), line('M 140 150 Q 150 160 140 172 M 160 150 Q 150 160 160 172', 2)];
}

export function boxingGloves(c) {
  const my = (c.bb[1] + c.bb[3]) / 2 + 30;
  return [C('gang-trai', c.left - 20, my - 20, 34, '#FF5F5F'), C('gang-phai', c.right + 20, my - 40, 34, '#FF5F5F'), R('co-gang-trai', c.left - 36, my + 8, 32, 16, 5, '#FFFFFF'), R('co-gang-phai', c.right + 4, my - 12, 32, 16, 5, '#FFFFFF')];
}

export function ringRopes() {
  return [bar('cot-vo-dai-trai', 30, 480, 30, 250, 14, '#BFC8D0'), bar('cot-vo-dai-phai', 570, 480, 570, 250, 14, '#BFC8D0'), line('M 30 280 L 570 280 M 30 340 L 570 340 M 30 400 L 570 400', 5)];
}

export function hockey(c) {
  const [x, y] = handPos(c, 1);
  return [bar('gay-khuc-con-cau', x, y - 20, x + 50, c.bb[3] + 20, 9, '#8B5A2B'), bar('luoi-gay-khuc', x + 44, c.bb[3] + 24, x + 100, c.bb[3] + 30, 14, '#8B5A2B'), E('bong-khuc-con-cau', x + 140, c.bb[3] + 34, 22, 8, '#2F3640')];
}

export function rollerSkates(c) {
  const b = c.bb[3];
  const skate = (id, x) => [R(id, x - 30, b + 12, 60, 28, 10, '#7D5FFF'), C(`${id}-banh-1`, x - 18, b + 48, 9, '#FFD54F'), C(`${id}-banh-2`, x + 18, b + 48, 9, '#FFD54F')];
  return [...skate('giay-patin-trai', c.cx - 44), ...skate('giay-patin-phai', c.cx + 44)];
}

export function trampoline() {
  return [E('bat-lo-xo', 300, 480, 190, 30, '#4FA3E0'), E('mat-bat', 300, 474, 160, 20, '#2F3640'), bar('chan-bat-1', 150, 490, 140, 540, 8, '#BFC8D0'), bar('chan-bat-2', 450, 490, 460, 540, 8, '#BFC8D0')];
}
