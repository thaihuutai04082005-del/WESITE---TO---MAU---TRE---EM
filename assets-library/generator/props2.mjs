// Đạo cụ cho Đợt 2 (cây thần, nhà biết bay, đồ chơi, thiên thể, lâu đài). Toạ độ trong khung 600×600.
// Id trùng trong cùng 1 tranh sẽ được build tự đánh số lại.
import { E, C, R, P, D, line, star, heart, cloud, smallFlower } from './shapes.mjs';
import { bar, pt } from './props.mjs';

const RAINBOW = ['#FF5F5F', '#FF9F43', '#FFD54F', '#4CD787', '#4FA3E0', '#7D5FFF'];

// ---------- Cây thần ----------
export const treeDoor = (x, y) => [
  D('cua-bi-mat', `M ${pt(x - 22, y)} L ${pt(x - 22, y - 46)} Q ${pt(x - 22, y - 70)} ${pt(x, y - 70)} Q ${pt(x + 22, y - 70)} ${pt(x + 22, y - 46)} L ${pt(x + 22, y)} Z`, '#7D5FFF'),
  C('nam-cua', x + 12, y - 30, 4, '#FFD54F'),
  R('bac-cua-1', x - 30, y, 60, 10, 3, '#BCAAA4'),
  C('den-cua', x + 34, y - 72, 10, '#FFE066'),
];
export const fruitsOn = (id, pts, color, leaf = '#4CAF50') => pts.flatMap(([x, y], k) => [C(`${id}-${k + 1}`, x, y, 16, color), E(`la-${id}-${k + 1}`, x + 10, y - 16, 9, 5, leaf, -30)]);
export const swing = (x, yTop, yBot) => [
  bar('canh-xich-du', x - 90, yTop, x + 20, yTop - 10, 16, '#8B5A2B'),
  line(`M ${x - 40} ${yTop} L ${x - 40} ${yBot} M ${x + 10} ${yTop - 6} L ${x + 10} ${yBot}`, 3),
  R('ghe-xich-du', x - 54, yBot - 4, 78, 14, 5, '#FF7AA2'),
];
export const roots = (cx, y) => [
  P('re-trai', [[cx - 20, y - 20], [cx - 90, y + 30], [cx - 60, y + 36], [cx - 10, y + 6]], '#8B5A2B'),
  P('re-phai', [[cx + 20, y - 20], [cx + 90, y + 30], [cx + 60, y + 36], [cx + 10, y + 6]], '#8B5A2B'),
  E('ban-chan-trai', cx - 80, y + 36, 26, 10, '#A0673A'),
  E('ban-chan-phai', cx + 80, y + 36, 26, 10, '#A0673A'),
];
export const leafCrown = (x, y, s = 1) => [
  ...[-3, -2, -1, 0, 1, 2, 3].map((k) => E(`la-vuong-mien-${k + 4}`, x + k * 18 * s, y - Math.abs(k) * -4 * s - 14 * s, 11 * s, 22 * s, k % 2 ? '#66BB6A' : '#43A047', k * 14)),
  star('sao-vuong-mien-la', x, y - 44 * s, 16 * s, 7 * s, '#FFD54F'),
];
export const hangingLanterns = (pts) => pts.flatMap(([x, y], k) => [R(`den-long-nho-${k + 1}`, x - 12, y, 24, 30, 8, RAINBOW[k % 6]), R(`nap-den-nho-${k + 1}`, x - 8, y - 6, 16, 8, 3, '#8D6E63')]);
export const bells = (pts) => pts.flatMap(([x, y], k) => [D(`chuong-gio-${k + 1}`, `M ${pt(x - 14, y + 20)} Q ${pt(x - 14, y - 10)} ${pt(x, y - 12)} Q ${pt(x + 14, y - 10)} ${pt(x + 14, y + 20)} Z`, '#B3E5FC'), C(`qua-lac-${k + 1}`, x, y + 22, 5, '#FFD54F')]);
export const snowCaps = () => [
  P('tuyet-tang-tren', [[240, 200], [300, 110], [360, 200], [330, 190], [300, 206], [270, 190]], '#FFFFFF'),
  P('tuyet-tang-giua', [[200, 300], [240, 250], [360, 250], [400, 300], [360, 290], [300, 304], [240, 290]], '#FFFFFF'),
];
export const hammock = (x1, y1, x2, y2) => [
  bar('coc-vong', x2, y2 + 110, x2, y2 - 10, 14, '#8B5A2B'),
  D('vong', `M ${pt(x1, y1)} Q ${pt((x1 + x2) / 2, y1 + 90)} ${pt(x2, y2)} L ${pt(x2, y2 + 18)} Q ${pt((x1 + x2) / 2, y1 + 120)} ${pt(x1, y1 + 18)} Z`, '#FF9EC0'),
];
export const pool = (id, x, y, w, h = 30) => [E(id, x, y, w, h, '#81D4FA'), E(`${id}-song`, x - w * 0.3, y - 4, w * 0.3, h * 0.3, '#E1F5FE')];
export const gems = (pts) => pts.map(([x, y], k) => P(`vien-ngoc-${k + 1}`, [[x, y - 14], [x + 11, y], [x, y + 14], [x - 11, y]], ['#7DE2FF', '#FF7AA2', '#B39DDB', '#FFD54F'][k % 4]));
export const flowersAt = (pts) => pts.flatMap(([x, y], k) => smallFlower(`hoa-nho-${k + 1}`, x, y, RAINBOW[k % 6]));
export const fireflies = (pts) => pts.map(([x, y], k) => C(`dom-dom-${k + 1}`, x, y, 8, '#FFE066'));
export const lilyPond = (x, y) => [...pool('ao-sen', x, y, 190, 34), E('la-sen-1', x - 110, y, 28, 10, '#66BB6A'), E('la-sen-2', x + 120, y + 4, 26, 9, '#66BB6A'), C('hoa-sen', x + 120, y - 6, 9, '#FF9EC0')];
export const leafCradle = (x, y) => [line(`M ${x} ${y - 80} L ${x - 30} ${y - 10} M ${x} ${y - 80} L ${x + 30} ${y - 10}`, 2.5), D('noi-la', `M ${pt(x - 50, y - 12)} Q ${pt(x, y + 40)} ${pt(x + 50, y - 12)} Z`, '#66BB6A'), C('trung-trong-noi', x, y - 6, 14, '#FFF3D6')];
export const flute = (x, y) => [bar('sao-truc', x - 80, y + 30, x + 80, y - 20, 16, '#D7A574'), ...[0, 1, 2, 3].map((k) => C(`lo-sao-${k + 1}`, x - 40 + k * 28, y + 17 - k * 9, 4, '#5D4037'))];
export const bambooBridge = (y = 500) => [R('cau-tre', 20, y - 16, 560, 22, 6, '#C8A26B'), line(`M 20 ${y - 30} L 580 ${y - 30}`, 4), ...[40, 160, 440, 560].map((x, k) => bar(`coc-cau-${k + 1}`, x, y + 40, x, y - 36, 10, '#8B5A2B'))];
export const shoots = (pts) => pts.map(([x, y, h], k) => P(`mang-${k + 1}`, [[x - 16, y], [x, y - h], [x + 16, y]], '#C5E1A5'));
export const dragonflyToy = (x, y) => [P('chuon-chuon-than', [[x - 4, y], [x + 4, y], [x + 2, y + 50], [x - 2, y + 50]], '#8D6E63'), E('canh-chuon-trai', x - 50, y + 6, 50, 9, '#FFD54F', 10), E('canh-chuon-phai', x + 50, y + 6, 50, 9, '#FFD54F', -10), C('dau-chuon-chuon', x, y, 9, '#FF7043')];
export const moon = (x, y, r = 40) => [C('trang-tron', x, y, r, '#FFF3B0'), C('ho-trang-nho', x - r * 0.3, y - r * 0.2, r * 0.18, '#FFE680')];

// ---------- Nhà biết bay ----------
export const hotAirBalloon = (x, y, r, color = '#FF7AA2', stripe = '#FFD54F') => [
  E('khinh-khi-cau', x, y, r, r * 1.1, color),
  D('soc-khinh-khi-cau', `M ${pt(x - r * 0.35, y - r * 1.05)} Q ${pt(x - r * 0.55, y)} ${pt(x - r * 0.3, y + r)} L ${pt(x + r * 0.3, y + r)} Q ${pt(x + r * 0.55, y)} ${pt(x + r * 0.35, y - r * 1.05)} Q ${pt(x, y - r * 1.15)} ${pt(x - r * 0.35, y - r * 1.05)} Z`, stripe),
];
export const ropesTo = (xs, yTop, yBot) => line(xs.map(([a, b]) => `M ${a} ${yTop} L ${b} ${yBot}`).join(' '), 2.5);
export const cloudBase = (x, y, s = 1.6) => [cloud('may-do-nha', x, y, s, '#FFFFFF')];
export const rotor = (x, y) => [R('cot-canh-quat', x - 8, y - 40, 16, 44, 4, '#2F3640'), E('canh-quat-mai', x, y - 44, 170, 12, '#BFC8D0'), C('tam-canh-quat', x, y - 44, 10, '#FF5F5F')];
export const balloonCluster = (x, y) => {
  const pts = [[-60, -60], [0, -90], [60, -60], [-30, -120], [30, -130], [-80, -130], [80, -120]];
  return [line(pts.map(([dx, dy]) => `M ${x} ${y} L ${x + dx} ${y + dy + 26}`).join(' '), 2), ...pts.map(([dx, dy], k) => E(`bong-bay-cum-${k + 1}`, x + dx, y + dy, 24, 30, RAINBOW[k % 6]))];
};
export const rocketsUnder = (xs, y) => xs.flatMap((x, k) => [
  P(`lua-ten-lua-nha-${k + 1}`, [[x - 14, y + 40], [x, y + 96], [x + 14, y + 40]], '#FFC94D'),
  R(`ten-lua-nha-${k + 1}`, x - 18, y - 30, 36, 72, 14, '#FF5F7E'),
]);
export const jetEngines = (c) => [
  R('dong-co-trai', c.bb[0] - 70, c.bb[3] - 150, 70, 40, 18, '#BFC8D0'),
  R('dong-co-phai', c.bb[2], c.bb[3] - 150, 70, 40, 18, '#BFC8D0'),
  P('lua-dong-co-trai', [[c.bb[0] - 70, c.bb[3] - 142], [c.bb[0] - 120, c.bb[3] - 130], [c.bb[0] - 70, c.bb[3] - 118]], '#FF7043'),
  P('lua-dong-co-phai', [[c.bb[2] + 70, c.bb[3] - 142], [c.bb[2] + 120, c.bb[3] - 130], [c.bb[2] + 70, c.bb[3] - 118]], '#FF7043'),
];
export const planeWings = (c) => [
  P('canh-nha-trai', [[c.bb[0] + 10, c.bb[3] - 170], [c.bb[0] - 130, c.bb[3] - 120], [c.bb[0] - 120, c.bb[3] - 100], [c.bb[0] + 10, c.bb[3] - 120]], '#4FA3E0'),
  P('canh-nha-phai', [[c.bb[2] - 10, c.bb[3] - 170], [c.bb[2] + 130, c.bb[3] - 120], [c.bb[2] + 120, c.bb[3] - 100], [c.bb[2] - 10, c.bb[3] - 120]], '#4FA3E0'),
];
export const sailMast = (x, yRoof) => [bar('cot-buom', x, yRoof, x, yRoof - 170, 10, '#8B5A2B'), P('buom', [[x + 6, yRoof - 160], [x + 6, yRoof - 30], [x + 110, yRoof - 40]], '#FFFFFF'), P('co-cot-buom', [[x, yRoof - 170], [x + 40, yRoof - 160], [x, yRoof - 150]], '#FF5F5F')];
export const birds = (pts, color = '#FFFFFF') => pts.map(([x, y, s = 1], k) => D(`chim-${k + 1}`, `M ${pt(x - 26 * s, y)} Q ${pt(x - 12 * s, y - 16 * s)} ${pt(x, y)} Q ${pt(x + 12 * s, y - 16 * s)} ${pt(x + 26 * s, y)} Q ${pt(x + 12 * s, y - 6 * s)} ${pt(x, y + 6 * s)} Q ${pt(x - 12 * s, y - 6 * s)} ${pt(x - 26 * s, y)} Z`, color));
export const skyLanterns = (pts) => pts.flatMap(([x, y, s = 1], k) => [P(`den-troi-${k + 1}`, [[x - 22 * s, y - 34 * s], [x + 22 * s, y - 34 * s], [x + 16 * s, y + 20 * s], [x - 16 * s, y + 20 * s]], ['#FFB74D', '#FF8A65', '#FFD54F'][k % 3]), C(`lua-den-troi-${k + 1}`, x, y + 12 * s, 6 * s, '#FFF3B0')]);
export const oars = (c) => [bar('mai-cheo-trai', c.bb[0] + 30, c.bb[3] - 120, c.bb[0] - 90, c.bb[3] + 10, 10, '#8B5A2B'), E('dau-mai-cheo-trai', c.bb[0] - 96, c.bb[3] + 16, 14, 30, '#A0673A', 40), bar('mai-cheo-phai', c.bb[2] - 30, c.bb[3] - 120, c.bb[2] + 90, c.bb[3] + 10, 10, '#8B5A2B'), E('dau-mai-cheo-phai', c.bb[2] + 96, c.bb[3] + 16, 14, 30, '#A0673A', -40)];
export const paperCranes = (pts) => pts.flatMap(([x, y], k) => [P(`hac-giay-${k + 1}`, [[x - 34, y], [x, y - 26], [x + 34, y], [x, y + 8]], ['#FFFFFF', '#FF9EC0', '#B3E5FC'][k % 3]), P(`dau-hac-${k + 1}`, [[x + 30, y - 2], [x + 48, y - 18], [x + 38, y + 2]], '#FF7043')]);
export const pinwheel = (x, y) => [bar('can-chong-chong', x, y, x, y + 110, 8, '#8B5A2B'), ...[0, 1, 2, 3].map((k) => { const a = (k * Math.PI) / 2; return P(`canh-chong-chong-${k + 1}`, [[x, y], [x + 50 * Math.cos(a), y + 50 * Math.sin(a)], [x + 36 * Math.cos(a + 0.9), y + 36 * Math.sin(a + 0.9)]], RAINBOW[k]); }), C('tam-chong-chong', x, y, 8, '#FFD54F')];
export const sled = (c) => [R('xe-truot-tuyet', c.bb[0] - 20, c.bb[3] + 4, c.bb[2] - c.bb[0] + 40, 22, 8, '#E74C3C'), D('ray-truot', `M ${pt(c.bb[0] - 30, c.bb[3] + 40)} L ${pt(c.bb[2] + 20, c.bb[3] + 40)} Q ${pt(c.bb[2] + 50, c.bb[3] + 40)} ${pt(c.bb[2] + 50, c.bb[3] + 14)} L ${pt(c.bb[2] + 40, c.bb[3] + 14)} Q ${pt(c.bb[2] + 40, c.bb[3] + 30)} ${pt(c.bb[2] + 20, c.bb[3] + 30)} L ${pt(c.bb[0] - 30, c.bb[3] + 30)} Z`, '#BFC8D0')];
export const bigSnowflake = (x, y, r) => [star('bong-tuyet-to', x, y, r, r * 0.4, '#E1F5FE', 6), C('tam-bong-tuyet', x, y, r * 0.25, '#FFFFFF')];
export const flowerPatch = (x, y) => [D('manh-dat-hoa', `M ${pt(x - 160, y)} Q ${pt(x, y + 90)} ${pt(x + 160, y)} Z`, '#8BD17C'), ...flowersAt([[x - 90, y + 14], [x - 30, y + 34], [x + 30, y + 34], [x + 90, y + 14]])];

// ---------- Đồ chơi ----------
export const tutu = (c) => [D('vay-ba-le', `M ${pt(c.cx - 130, c.bb[3] - 60)} Q ${pt(c.cx, c.bb[3] - 110)} ${pt(c.cx + 130, c.bb[3] - 60)} Q ${pt(c.cx + 90, c.bb[3] - 40)} ${pt(c.cx + 60, c.bb[3] - 60)} Q ${pt(c.cx + 30, c.bb[3] - 36)} ${pt(c.cx, c.bb[3] - 60)} Q ${pt(c.cx - 30, c.bb[3] - 36)} ${pt(c.cx - 60, c.bb[3] - 60)} Q ${pt(c.cx - 90, c.bb[3] - 40)} ${pt(c.cx - 130, c.bb[3] - 60)} Z`, '#FFB3C1')];
export const miniDoll = (x, y) => [E('bup-be-nho-than', x, y, 36, 32, '#4FA3E0'), E('bup-be-nho-dau', x, y - 42, 28, 28, '#4FA3E0'), E('bup-be-nho-mat', x, y - 40, 18, 17, '#FFE0B5'), C('bup-be-nho-hoa', x, y + 4, 9, '#FFD54F')];
export const drum = (x, y) => [R('trong', x - 44, y - 40, 88, 60, 10, '#E74C3C'), E('mat-trong', x, y - 40, 44, 12, '#FFF3D6'), bar('dui-trong-1', x - 30, y - 60, x - 70, y - 110, 6, '#8B5A2B'), bar('dui-trong-2', x + 30, y - 60, x + 70, y - 110, 6, '#8B5A2B')];
export const toyBox = (x, y) => [R('hop-do-choi', x - 70, y - 90, 140, 90, 8, '#FFC94D'), R('nap-hop-do-choi', x - 76, y - 106, 152, 20, 6, '#FF9F43'), star('sao-hop-do-choi', x, y - 44, 22, 9, '#FF7AA2')];
export const paperBoat = (c) => [P('thuyen-giay', [[c.cx - 170, c.bb[3] - 10], [c.cx + 170, c.bb[3] - 10], [c.cx + 120, c.bb[3] + 40], [c.cx - 120, c.bb[3] + 40]], '#FFFFFF'), P('buom-thuyen-giay', [[c.cx + 120, c.bb[3] - 12], [c.cx + 170, c.bb[3] - 90], [c.cx + 180, c.bb[3] - 12]], '#FFF3D6')];
export const pillows = (y = 520) => [E('goi-1', 170, y, 90, 34, '#B39DDB'), E('goi-2', 440, y + 6, 80, 30, '#FFB3C1')];
export const cart = (x, y) => [R('xe-do-choi', x - 60, y - 50, 120, 50, 8, '#4CD787'), C('banh-xe-dc-1', x - 34, y + 4, 16, '#2F3640'), C('banh-xe-dc-2', x + 34, y + 4, 16, '#2F3640'), line(`M ${x + 60} ${y - 26} L ${x + 110} ${y - 60}`, 3), star('sao-tren-xe', x, y - 70, 20, 8, '#FFD54F')];
export const wreath = (x, y, s = 1) => [0, 1, 2, 3, 4, 5, 6].flatMap((k) => { const a = Math.PI + (k / 6) * Math.PI; return [C(`vong-hoa-${k + 1}`, x + 46 * s * Math.cos(a), y + 20 * s * Math.sin(a), 10 * s, RAINBOW[k % 6])]; });
export const starRing = (x, y, rx, ry) => Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return star(`sao-vong-${k + 1}`, x + rx * Math.cos(a), y + ry * Math.sin(a), 16, 7, RAINBOW[k % 6]); });
export const marbles = (pts) => pts.map(([x, y], k) => C(`bi-ve-${k + 1}`, x, y, 14, ['#7DE2FF', '#FF7AA2', '#4CD787', '#FFD54F'][k % 4]));
export const crank = (x, y) => [bar('tay-quay-hop-nhac', x, y, x + 50, y, 10, '#8B5A2B'), C('nam-tay-quay', x + 54, y - 14, 10, '#E74C3C'), bar('can-nam', x + 50, y, x + 54, y - 14, 6, '#8B5A2B')];
export const blockTower = (x, y) => [0, 1, 2, 3].map((k) => R(`khoi-thap-${k + 1}`, x - 40 + (k % 2) * 6, y - 70 * (k + 1), 80, 70, 8, RAINBOW[k]));
export const dominos = (x, y) => [0, 1, 2, 3, 4].map((k) => P(`domino-${k + 1}`, (() => { const r = (k * 14 * Math.PI) / 180; const bx = x + k * 50; return [[bx, y], [bx + 26 * Math.cos(r), y + 26 * Math.sin(r)], [bx + 26 * Math.cos(r) + 80 * Math.sin(r), y + 26 * Math.sin(r) - 80 * Math.cos(r)], [bx + 80 * Math.sin(r), y - 80 * Math.cos(r)]]; })(), '#FFFFFF'));
export const stairs = (x, y) => [0, 1, 2].map((k) => R(`bac-khoi-${k + 1}`, x + k * 60, y - (k + 1) * 50, 60, (k + 1) * 50, 6, RAINBOW[k + 2]));
export const trainBlocks = (y) => [R('toa-khoi-1', 30, y - 70, 110, 60, 8, '#FF7AA2'), R('toa-khoi-2', 460, y - 70, 110, 60, 8, '#4CD787'), ...[60, 110, 490, 540].map((x, k) => C(`banh-toa-${k + 1}`, x, y - 6, 14, '#2F3640'))];

// ---------- Thiên thể ----------
export const dumbbells = (c) => [bar('ta-tay-trai', c.left - 60, c.bb[1] + 150, c.left - 20, c.bb[1] + 120, 10, '#2F3640'), C('qua-ta-1', c.left - 64, c.bb[1] + 154, 16, '#4FA3E0'), C('qua-ta-2', c.left - 16, c.bb[1] + 116, 16, '#4FA3E0'), bar('ta-tay-phai', c.right + 20, c.bb[1] + 120, c.right + 60, c.bb[1] + 150, 10, '#2F3640'), C('qua-ta-3', c.right + 16, c.bb[1] + 116, 16, '#4FA3E0'), C('qua-ta-4', c.right + 64, c.bb[1] + 154, 16, '#4FA3E0')];
export const sunglasses = (c) => { const { x, y, s } = c.face; return [E('kinh-ram-trai', x - 28 * s, y, 22 * s, 16 * s, '#2F3640'), E('kinh-ram-phai', x + 28 * s, y, 22 * s, 16 * s, '#2F3640'), E('anh-kinh-trai', x - 34 * s, y - 5 * s, 6 * s, 3 * s, '#FFFFFF'), E('anh-kinh-phai', x + 22 * s, y - 5 * s, 6 * s, 3 * s, '#FFFFFF')]; };
export const bicycle = (c) => [C('banh-xe-dap-1', c.cx - 110, c.bb[3] + 20, 48, '#2F3640'), C('mam-xe-dap-1', c.cx - 110, c.bb[3] + 20, 34, '#BFC8D0'), C('banh-xe-dap-2', c.cx + 110, c.bb[3] + 20, 48, '#2F3640'), C('mam-xe-dap-2', c.cx + 110, c.bb[3] + 20, 34, '#BFC8D0'), P('khung-xe-dap', [[c.cx - 110, c.bb[3] + 20], [c.cx, c.bb[3] + 12], [c.cx + 110, c.bb[3] + 20], [c.cx, c.bb[3] + 26]], '#FF5F5F')];
export const toothbrush = (x, y) => [bar('ban-chai', x, y, x + 90, y - 60, 14, '#4FA3E0'), R('long-ban-chai', x + 70, y - 90, 30, 22, 5, '#FFFFFF'), C('bot-1', x + 110, y - 110, 14, '#E1F5FE'), C('bot-2', x + 140, y - 90, 10, '#E1F5FE'), C('bot-3', x + 130, y - 130, 8, '#E1F5FE')];
export const nightcap = (c) => { const { x, y, s } = c.hat; return [D('mu-ngu', `M ${pt(x - 60 * s, y + 10 * s)} Q ${pt(x - 40 * s, y - 70 * s)} ${pt(x + 30 * s, y - 60 * s)} Q ${pt(x + 90 * s, y - 50 * s)} ${pt(x + 110 * s, y + 20 * s)} L ${pt(x + 90 * s, y + 24 * s)} Q ${pt(x + 70 * s, y - 20 * s)} ${pt(x + 30 * s, y - 20 * s)} Q ${pt(x + 30 * s, y + 10 * s)} ${pt(x + 40 * s, y + 20 * s)} Z`, '#7D5FFF'), C('bong-mu-ngu', x + 104 * s, y + 30 * s, 12 * s, '#FFFFFF')]; };
export const trail = (x, y, dx, dy) => [P('vet-sao-roi', [[x, y - 14], [x + dx, y + dy - 4], [x + dx, y + dy + 4], [x, y + 14]], '#FFF3B0')];
export const hulaHoop = (c) => [E('vong-lac', c.cx, c.bb[3] - 80, (c.bb[2] - c.bb[0]) / 2 + 60, 26, '#FF7AA2')];
export const bathtub = (c) => [R('bon-tam', c.cx - 190, c.bb[3] - 90, 380, 110, 30, '#FFFFFF'), ...[0, 1, 2, 3, 4, 5].map((k) => C(`bot-tam-${k + 1}`, c.cx - 170 + k * 68, c.bb[3] - 96, 24 - (k % 2) * 6, '#E1F5FE')), R('chan-bon-1', c.cx - 160, c.bb[3] + 18, 24, 20, 6, '#FFD54F'), R('chan-bon-2', c.cx + 136, c.bb[3] + 18, 24, 20, 6, '#FFD54F')];
export const blanket = (c) => [D('chan-dap', `M ${pt(c.cx - 200, c.bb[3] - 70)} Q ${pt(c.cx, c.bb[3] - 120)} ${pt(c.cx + 200, c.bb[3] - 70)} L ${pt(c.cx + 210, c.bb[3] + 30)} L ${pt(c.cx - 210, c.bb[3] + 30)} Z`, '#B39DDB'), ...[0, 1, 2].map((k) => star(`sao-chan-${k + 1}`, c.cx - 120 + k * 120, c.bb[3] - 20, 18, 8, '#FFE066'))];
export const smallTree = (x, y) => [R('than-cay-nho', x - 12, y - 90, 24, 90, 5, '#8B5A2B'), C('tan-cay-nho', x, y - 130, 60, '#66BB6A')];
export const waterGlass = (x, y) => [P('coc-nuoc', [[x - 30, y - 80], [x + 30, y - 80], [x + 22, y], [x - 22, y]], '#E1F5FE'), P('nuoc-trong-coc', [[x - 26, y - 50], [x + 26, y - 50], [x + 22, y - 4], [x - 22, y - 4]], '#81D4FA'), bar('ong-hut', x + 10, y - 40, x + 26, y - 120, 8, '#FF7AA2')];
export const headband = (c) => { const { x, y, s } = c.face; return [R('bang-do', x - 70 * s, y - 60 * s, 140 * s, 18 * s, 8 * s, '#FF5F7E')]; };

// ---------- Lâu đài & lễ hội ----------
export const fireworks = (pts) => pts.flatMap(([x, y, r], k) => [star(`phao-hoa-${k + 1}`, x, y, r, r * 0.35, RAINBOW[k % 6], 12), C(`tam-phao-hoa-${k + 1}`, x, y, r * 0.2, '#FFF3B0')]);
export const lanternString = (y = 90) => [line(`M 0 ${y - 30} Q 300 ${y + 30} 600 ${y - 30}`, 3), ...[60, 150, 240, 360, 450, 540].map((x, k) => E(`den-long-day-${k + 1}`, x, y - 20 + 36 * Math.sin((x / 600) * Math.PI) * 0.8, 20, 26, ['#FF5F5F', '#FFD54F'][k % 2]))];
export const apricot = (x, y) => [bar('canh-mai', x, y, x + 120, y - 90, 8, '#6D4C41'), ...[[30, -26], [70, -54], [110, -80], [60, -20]].map(([dx, dy], k) => C(`hoa-mai-${k + 1}`, x + dx, y + dy, 12, '#FFD54F'))];
export const peachBranch = (x, y) => [bar('canh-dao', x, y, x - 130, y - 70, 8, '#6D4C41'), ...[[-30, -20], [-70, -40], [-110, -60], [-60, -10]].map(([dx, dy], k) => C(`hoa-dao-${k + 1}`, x + dx, y + dy, 12, '#FF9EC0'))];
export const fountain = (x, y) => [E('be-dai-phun', x, y, 90, 24, '#BCAAA4'), E('nuoc-be', x, y - 6, 74, 14, '#81D4FA'), R('cot-dai-phun', x - 10, y - 90, 20, 84, 5, '#D7CCC8'), D('tia-dai-phun', `M ${pt(x, y - 90)} Q ${pt(x - 70, y - 140)} ${pt(x - 60, y - 20)} L ${pt(x - 50, y - 20)} Q ${pt(x - 58, y - 120)} ${pt(x, y - 80)} Q ${pt(x + 58, y - 120)} ${pt(x + 50, y - 20)} L ${pt(x + 60, y - 20)} Q ${pt(x + 70, y - 140)} ${pt(x, y - 90)} Z`, '#B3E5FC')];
export const vines = (c) => [D('day-leo', `M ${pt(c.bb[0] + 4, c.bb[3])} Q ${pt(c.bb[0] + 40, c.bb[3] - 120)} ${pt(c.bb[0] + 10, c.bb[3] - 220)} L ${pt(c.bb[0] + 22, c.bb[3] - 220)} Q ${pt(c.bb[0] + 54, c.bb[3] - 120)} ${pt(c.bb[0] + 16, c.bb[3])} Z`, '#66BB6A'), ...[0, 1, 2, 3].map((k) => E(`la-day-leo-${k + 1}`, c.bb[0] + 30 + (k % 2) * 16, c.bb[3] - 40 - k * 50, 16, 9, '#43A047', k % 2 ? 30 : -30))];
export const kites = (pts) => pts.flatMap(([x, y], k) => [P(`dieu-${k + 1}`, [[x, y - 40], [x + 32, y], [x, y + 40], [x - 32, y]], RAINBOW[k % 6]), line(`M ${x} ${y + 40} Q ${x - 20} ${y + 90} ${x + 10} ${y + 130}`, 2)]);
export const sunflowers = (pts) => pts.flatMap(([x, y], k) => [R(`than-huong-duong-${k + 1}`, x - 5, y, 10, 90, 4, '#4CAF50'), star(`canh-huong-duong-${k + 1}`, x, y, 34, 20, '#FFD54F', 12), C(`nhuy-huong-duong-${k + 1}`, x, y, 14, '#8D6E63')]);
export const pumpkins = (pts) => pts.flatMap(([x, y, s = 1], k) => [E(`bi-ngo-${k + 1}`, x, y, 40 * s, 30 * s, '#FF9F43'), R(`cuong-bi-ngo-${k + 1}`, x - 5 * s, y - 40 * s, 10 * s, 14 * s, 3, '#6D4C41'), line(`M ${x} ${y - 28 * s} L ${x} ${y + 28 * s}`, 2)]);
export const floatingLanterns = (pts) => pts.flatMap(([x, y], k) => [P(`hoa-dang-${k + 1}`, [[x - 30, y], [x - 16, y - 24], [x, y - 8], [x + 16, y - 24], [x + 30, y]], ['#FF9EC0', '#FFD54F', '#FF8A65'][k % 3]), C(`nen-hoa-dang-${k + 1}`, x, y - 16, 6, '#FFF3B0')]);
export const mist = () => [E('suong-1', 150, 330, 170, 20, '#ECEFF1'), E('suong-2', 460, 300, 150, 18, '#ECEFF1')];
export const chestnuts = (pts) => pts.map(([x, y], k) => D(`hat-de-${k + 1}`, `M ${pt(x - 16, y + 10)} Q ${pt(x - 18, y - 12)} ${pt(x, y - 18)} Q ${pt(x + 18, y - 12)} ${pt(x + 16, y + 10)} Z`, '#8D6E63'));
export const wishCoins = (pts) => pts.map(([x, y], k) => C(`dong-xu-${k + 1}`, x, y, 12, '#FFD54F'));
export const hearts2 = (pts) => pts.map(([x, y, s], k) => heart(`tim-uoc-${k + 1}`, x, y, s, '#FF7AA2'));
