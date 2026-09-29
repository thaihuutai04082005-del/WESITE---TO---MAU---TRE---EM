// Hình dáng các đối tượng MỚI của Đợt 2 (khung 600×600, chủ thể quanh giữa, đáy ≈ 480).
// Cây (04), Nhà (05), Đồ chơi (06), Thiên thể (09), Công trình cổ tích (12).
import { E, C, R, P, D, line, star } from './shapes.mjs';

// ================= 04 · CÂY =================

export const cayThong = () => [
  R('than-cay-thong', 282, 420, 36, 60, 4, '#8B5A2B'),
  P('tang-la-duoi', [[150, 430], [300, 270], [450, 430]], '#2E7D32'),
  P('tang-la-giua', [[180, 330], [300, 190], [420, 330]], '#388E3C'),
  P('tang-la-tren', [[215, 235], [300, 110], [385, 235]], '#43A047'),
];

// Tàu lá dừa: cong vòng từ ngọn (cx,cy) ra đầu lá (tx,ty), mép dưới có răng cưa như lá chét.
const frond = (id, cx, cy, tx, ty, lift, w, color) => {
  const mx = (cx + tx) / 2, my = (cy + ty) / 2 - lift;
  const q = (t) => [(1 - t) ** 2 * cx + 2 * (1 - t) * t * mx + t * t * tx, (1 - t) ** 2 * cy + 2 * (1 - t) * t * my + t * t * ty];
  const N = 14, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, [x, y] = q(t), [x2, y2] = q(Math.min(1, t + 0.01)), [x1, y1] = q(Math.max(0, t - 0.01));
    let dx = x2 - x1, dy = y2 - y1; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    let nx = -dy, ny = dx; if (ny > 0) { nx = -nx; ny = -ny; } // pháp tuyến hướng lên
    const ww = w * Math.sin(Math.PI * Math.min(0.97, 0.12 + t * 0.88));
    top.push([x + nx * ww * 0.35, y + ny * ww * 0.35]);
    const tooth = i % 2 ? 1.25 : 0.55;
    bot.push([x - nx * ww * tooth, y - ny * ww * tooth]);
  }
  const pts = [...top, ...bot.reverse()].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`);
  return D(id, `M ${pts.join(' L ')} Z`, color);
};

export const cayDua = () => {
  // Thân cong thon, chia đốt (mỗi đốt là một vùng tô riêng).
  const L = (y) => 252 + (480 - y) * 0.03 + ((480 - y) / 255) ** 2 * 50; // mép trái
  const Rr = (y) => L(y) + 32 + (y - 225) * 0.2;                          // mép phải
  const cuts = [225, 262, 300, 340, 410, 445, 480];
  const seg = cuts.slice(1).map((y1, k) => {
    const y0 = cuts[k];
    return D(`dot-than-dua-${k + 1}`, `M ${L(y0).toFixed(1)} ${y0} L ${Rr(y0).toFixed(1)} ${y0} L ${Rr(y1).toFixed(1)} ${y1} L ${L(y1).toFixed(1)} ${y1} Z`, k % 2 ? '#B97A4A' : '#C68B59');
  });
  const cx = 320, cy = 215;
  return [
    ...seg,
    frond('la-dua-sau-1', cx, cy, 200, 150, 40, 30, '#388E3C'),
    frond('la-dua-sau-2', cx, cy, 440, 150, 40, 30, '#388E3C'),
    frond('la-dua-1', cx, cy, 160, 270, 70, 34, '#43A047'),
    frond('la-dua-2', cx, cy, 480, 270, 70, 34, '#43A047'),
    frond('la-dua-3', cx, cy, 230, 110, 20, 26, '#66BB6A'),
    frond('la-dua-4', cx, cy, 415, 115, 20, 26, '#66BB6A'),
    C('trai-dua-1', 305, 244, 20, '#8D6E63'),
    C('trai-dua-2', 340, 244, 20, '#8D6E63'),
    C('trai-dua-3', 322, 264, 19, '#A1887F'),
  ];
};

export const xuongRong = () => [
  P('chau-xuong-rong', [[228, 420], [372, 420], [356, 486], [244, 486]], '#E07A5F'),
  R('mieng-chau-xuong-rong', 218, 408, 164, 22, 8, '#F2A07B'),
  R('canh-trai', 170, 280, 46, 110, 23, '#66BB6A'),
  R('noi-canh-trai', 196, 344, 60, 34, 12, '#66BB6A'),
  R('canh-phai', 384, 250, 46, 110, 23, '#66BB6A'),
  R('noi-canh-phai', 344, 314, 60, 34, 12, '#66BB6A'),
  R('than-xuong-rong', 240, 180, 120, 236, 60, '#4CAF50'),
  C('hoa-xuong-rong', 300, 180, 18, '#FF7AA2'),
];

export const cayLieu = () => [
  D('than-cay-lieu', 'M 270 480 Q 280 380 285 300 L 315 300 Q 320 380 330 480 Z', '#8B5A2B'),
  E('tan-lieu', 300, 230, 170, 110, '#81C784'),
  ...[150, 190, 230, 370, 410, 450].map((x, k) => R(`nhanh-lieu-${k + 1}`, x - 14, 250, 28, 150 + (k % 3) * 30, 14, k % 2 ? '#66BB6A' : '#A5D6A7')),
];

export const khomTre = () => [
  R('cay-tre-trai', 186, 170, 44, 310, 14, '#9CCC65'),
  R('cay-tre-phai', 370, 200, 44, 280, 14, '#9CCC65'),
  R('cay-tre-giua', 260, 120, 80, 360, 24, '#8BC34A'),
  line('M 186 260 L 230 260 M 186 360 L 230 360 M 370 290 L 414 290 M 370 390 L 414 390 M 260 210 L 340 210 M 260 430 L 340 430', 3),
  E('la-tre-1', 160, 170, 40, 12, '#43A047', -30),
  E('la-tre-2', 440, 200, 40, 12, '#43A047', 30),
  E('la-tre-3', 360, 120, 44, 13, '#66BB6A', 25),
  E('la-tre-4', 240, 110, 44, 13, '#66BB6A', -25),
];

// ================= 05 · NHÀ =================

export const nhaPho = () => [
  R('tuong-nha-pho', 220, 190, 160, 280, 4, '#FFCC80'),
  P('mai-nha-pho', [[206, 196], [300, 120], [394, 196]], '#E57350'),
  R('ban-cong', 240, 300, 120, 18, 4, '#8D6E63'),
  R('cua-so-tang-tren-1', 240, 214, 48, 60, 6, '#BDE6FF'),
  R('cua-so-tang-tren-2', 312, 214, 48, 60, 6, '#BDE6FF'),
  R('cua-so-tang-duoi', 240, 340, 48, 54, 6, '#BDE6FF'),
  R('cua-nha-pho', 312, 370, 50, 100, 6, '#8B5A2B'),
  P('mai-hien', [[300, 372], [374, 372], [366, 350], [308, 350]], '#4FA3E0'),
  C('cua-so-tron-gac', 300, 164, 16, '#FFE066'),
];

export const nhaSan = () => [
  R('cot-san-1', 180, 380, 18, 100, 3, '#8B5A2B'),
  R('cot-san-2', 260, 380, 18, 100, 3, '#8B5A2B'),
  R('cot-san-3', 322, 380, 18, 100, 3, '#8B5A2B'),
  R('cot-san-4', 402, 380, 18, 100, 3, '#8B5A2B'),
  R('san-nha', 160, 366, 280, 20, 4, '#A0673A'),
  R('vach-nha-san', 190, 270, 220, 100, 4, '#D7A574'),
  P('mai-nha-san', [[140, 282], [210, 150], [390, 150], [460, 282]], '#C8A26B'),
  R('cua-so-nha-san', 220, 296, 50, 44, 5, '#BDE6FF'),
  R('cua-nha-san', 318, 290, 50, 76, 5, '#8B5A2B'),
  P('cau-thang', [[330, 386], [364, 386], [396, 480], [362, 480]], '#C68B59'),
];

export const nhaTuyet = () => [
  D('mai-vom-tuyet', 'M 140 470 Q 140 250 300 240 Q 460 250 460 470 Z', '#F0F8FF'),
  line('M 150 420 L 450 420 M 162 370 L 438 370 M 190 320 L 410 320 M 240 280 L 360 280 M 240 320 L 240 370 M 360 320 L 360 370 M 300 280 L 300 320 M 200 370 L 200 420 M 300 370 L 300 420 M 400 370 L 400 420', 2.5),
  D('cua-vom-tuyet', 'M 250 470 L 250 420 Q 250 380 300 380 Q 350 380 350 420 L 350 470 Z', '#90CAF9'),
];

export const coiXayGio = () => [
  P('than-coi-xay', [[240, 470], [262, 230], [338, 230], [360, 470]], '#FFE0B5'),
  P('mai-coi-xay', [[248, 236], [300, 176], [352, 236]], '#E57350'),
  D('cua-coi-xay', 'M 280 470 L 280 420 Q 280 398 300 398 Q 320 398 320 420 L 320 470 Z', '#8B5A2B'),
  C('cua-so-coi-xay', 300, 320, 16, '#BDE6FF'),
  P('canh-quat-1', [[300, 214], [290, 80], [318, 80], [312, 214]], '#FFFFFF'),
  P('canh-quat-2', [[300, 214], [434, 204], [434, 232], [300, 226]], '#FFFFFF'),
  P('canh-quat-3', [[300, 214], [310, 348], [282, 348], [288, 214]], '#FFFFFF'),
  P('canh-quat-4', [[300, 214], [166, 224], [166, 196], [300, 202]], '#FFFFFF'),
  C('truc-quat', 300, 214, 14, '#8D6E63'),
];

// ================= 06 · ĐỒ CHƠI =================

export const bupBeGo = () => [
  E('than-bup-be', 300, 390, 110, 96, '#E74C3C'),
  E('dau-bup-be', 300, 250, 86, 90, '#E74C3C'),
  E('mat-bup-be', 300, 260, 58, 56, '#FFE0B5'),
  E('yem-bup-be', 300, 400, 64, 62, '#FFF3D6'),
  C('hoa-yem', 300, 400, 24, '#FFD54F'),
  C('nhuy-hoa-yem', 300, 400, 10, '#FF7AA2'),
  E('la-hoa-trai', 262, 410, 16, 9, '#4CAF50', -20),
  E('la-hoa-phai', 338, 410, 16, 9, '#4CAF50', 20),
];

export const linhChi = () => [
  R('chan-linh-trai', 262, 400, 30, 80, 6, '#2F3640'),
  R('chan-linh-phai', 308, 400, 30, 80, 6, '#2F3640'),
  R('ao-linh', 240, 300, 120, 110, 16, '#E74C3C'),
  R('that-lung', 240, 380, 120, 16, 4, '#FFFFFF'),
  R('tay-linh-trai', 214, 306, 28, 90, 12, '#E74C3C'),
  R('tay-linh-phai', 358, 306, 28, 90, 12, '#E74C3C'),
  C('khuy-1', 300, 324, 6, '#FFD54F'),
  C('khuy-2', 300, 350, 6, '#FFD54F'),
  C('dau-linh', 300, 250, 56, '#FFE0B5'),
  R('mu-linh', 252, 120, 96, 110, 30, '#2F3640'),
  R('quai-mu-linh', 250, 214, 100, 12, 5, '#FFD54F'),
];

export const nguaBapBenh = () => [
  D('go-bap-benh', 'M 110 440 Q 300 520 490 440 L 494 458 Q 300 540 106 458 Z', '#A0673A'),
  R('chan-ngua-1', 200, 360, 22, 90, 6, '#FFCC80'),
  R('chan-ngua-2', 250, 360, 22, 98, 6, '#FFCC80'),
  R('chan-ngua-3', 340, 360, 22, 98, 6, '#FFCC80'),
  R('chan-ngua-4', 390, 360, 22, 90, 6, '#FFCC80'),
  E('duoi-ngua', 170, 330, 20, 54, '#8D6E63', 30),
  E('than-ngua', 300, 340, 120, 60, '#FFCC80'),
  R('yen-ngua', 260, 290, 80, 30, 10, '#E74C3C'),
  D('co-ngua', 'M 370 320 L 400 210 L 450 214 L 420 330 Z', '#FFCC80'),
  E('dau-ngua', 440, 220, 60, 44, '#FFCC80'),
  E('mom-ngua', 486, 234, 26, 22, '#FFE0B5'),
  P('tai-ngua', [[420, 184], [428, 150], [446, 182]], '#FFCC80'),
  D('bom-ngua', 'M 400 200 Q 380 240 392 300 L 376 300 Q 362 240 390 196 Z', '#8D6E63'),
];

export const conQuay = () => [
  P('mui-con-quay', [[280, 440], [320, 440], [300, 484]], '#8D6E63'),
  D('than-con-quay', 'M 170 330 Q 300 250 430 330 Q 380 450 300 452 Q 220 450 170 330 Z', '#4FA3E0'),
  D('soc-con-quay', 'M 186 350 Q 300 300 414 350 Q 406 372 396 388 Q 300 346 204 388 Q 194 372 186 350 Z', '#FFD54F'),
  E('nap-con-quay', 300, 300, 100, 30, '#7D5FFF'),
  R('can-con-quay', 288, 218, 24, 80, 10, '#E74C3C'),
  C('nut-con-quay', 300, 216, 16, '#FFD54F'),
];

export const hopHinhNhay = () => [
  R('hop-nhay', 200, 340, 200, 140, 10, '#4FA3E0'),
  R('nap-hop-nhay', 186, 318, 228, 26, 6, '#2B7CC4'),
  star('sao-hop-nhay', 250, 410, 26, 11, '#FFD54F'),
  C('tron-hop-nhay', 350, 410, 22, '#FF7AA2'),
  R('lo-xo-1', 280, 290, 40, 16, 8, '#BFC8D0'),
  R('lo-xo-2', 280, 262, 40, 16, 8, '#DDE2E8'),
  E('co-ao-hop-nhay', 300, 252, 70, 18, '#FFFFFF'),
  C('dau-hop-nhay', 300, 190, 64, '#FFE0B5'),
  P('mu-hop-nhay', [[252, 146], [300, 60], [348, 146]], '#FF7AA2'),
  C('bong-mu-hop-nhay', 300, 60, 12, '#FFD54F'),
];

const letterBlock = (id, x, y, s, color, ch) => [
  R(id, x - s / 2, y - s, s, s, 8, color),
  R(`${id}-o-trong`, x - s / 2 + 10, y - s + 10, s - 20, s - 20, 6, '#FFFFFF'),
  {
    kind: 'deco',
    markup: `<text x="${x}" y="${y - s / 2 + 14}" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="${Math.round(s * 0.45)}" fill="#1B2A38" pointer-events="none">${ch}</text>`,
  },
];

export const khoiXepChu = () => [
  ...letterBlock('khoi-a', 230, 480, 120, '#FF7AA2', 'A'),
  ...letterBlock('khoi-b', 370, 480, 120, '#4FA3E0', 'B'),
  ...letterBlock('khoi-c', 300, 360, 130, '#FFD54F', ''),
];

// ================= 09 · THIÊN THỂ =================

export const matTroi = () => [
  star('tia-mat-troi', 300, 300, 170, 120, '#FFB74D', 16),
  C('mat-troi-than', 300, 300, 120, '#FFD54F'),
];

export const matTrang = () => [
  D('mat-trang-khuyet', 'M 330 130 C 150 140 100 330 170 420 C 240 500 380 490 440 410 C 330 440 250 380 250 290 C 250 215 280 160 330 130 Z', '#FFE066'),
  C('ho-trang-1', 170, 250, 12, '#FFD54F'),
  C('ho-trang-2', 210, 410, 10, '#FFD54F'),
];

export const ngoiSao = () => [star('than-ngoi-sao', 300, 300, 180, 88, '#FFD54F'), C('ma-sao-trong', 300, 316, 70, '#FFE680')];

export const saoTho = () => [
  E('vanh-sao-tho-sau', 300, 310, 200, 54, '#FFCC80', -10),
  C('than-sao-tho', 300, 300, 115, '#FFB74D'),
  D('soc-sao-tho-1', 'M 196 250 Q 300 230 404 250 Q 410 268 412 282 Q 300 262 190 282 Q 190 266 196 250 Z', '#FFCC80'),
  D('vanh-sao-tho-truoc', 'M 103 344 Q 300 420 497 276 Q 505 300 490 316 Q 300 450 110 372 Q 96 360 103 344 Z', '#FFE0B5'),
];

export const traiDat = () => [
  C('dai-duong', 300, 300, 140, '#4FA3E0'),
  D('luc-dia-1', 'M 200 210 Q 250 170 290 200 Q 300 240 260 250 Q 240 290 200 270 Q 170 240 200 210 Z', '#66BB6A'),
  D('luc-dia-2', 'M 330 330 Q 380 300 410 340 Q 420 390 380 410 Q 340 420 330 380 Q 310 360 330 330 Z', '#66BB6A'),
  D('luc-dia-3', 'M 350 190 Q 390 180 400 210 Q 380 230 356 220 Z', '#81C784'),
  E('may-trai-dat', 230, 360, 40, 14, '#FFFFFF'),
];

export const saoChoi = () => [
  D('duoi-sao-choi', 'M 330 200 Q 200 250 70 460 Q 170 360 300 330 Z', '#B3E5FC'),
  D('duoi-sao-choi-2', 'M 330 230 Q 230 290 150 450 Q 240 360 320 310 Z', '#81D4FA'),
  C('dau-sao-choi', 370, 250, 90, '#FFE066'),
];

// ================= 12 · CÔNG TRÌNH CỔ TÍCH =================

export const cungDien = () => [
  R('than-cung-dien', 130, 330, 340, 140, 6, '#FFF3D6'),
  R('thap-trai', 120, 220, 50, 250, 6, '#FFE0B5'),
  R('thap-phai', 430, 220, 50, 250, 6, '#FFE0B5'),
  D('mai-thap-trai', 'M 120 224 Q 145 150 145 130 Q 145 150 170 224 Z', '#4FA3E0'),
  D('mai-thap-phai', 'M 430 224 Q 455 150 455 130 Q 455 150 480 224 Z', '#4FA3E0'),
  R('co-cung-dien', 250, 280, 100, 60, 4, '#FFF3D6'),
  D('mai-vom', 'M 220 290 Q 220 170 300 120 Q 380 170 380 290 Z', '#FFD54F'),
  C('dinh-mai-vom', 300, 116, 12, '#E74C3C'),
  D('cong-cung-dien', 'M 262 470 L 262 400 Q 262 360 300 360 Q 338 360 338 400 L 338 470 Z', '#8B5A2B'),
  D('cua-so-cung-1', 'M 168 420 L 168 380 Q 168 364 184 364 Q 200 364 200 380 L 200 420 Z', '#BDE6FF'),
  D('cua-so-cung-2', 'M 400 420 L 400 380 Q 400 364 416 364 Q 432 364 432 380 L 432 420 Z', '#BDE6FF'),
];

export const thapCo = () => [
  R('than-thap', 240, 170, 120, 300, 6, '#CFD8DC'),
  P('mai-thap', [[222, 176], [300, 60], [378, 176]], '#7D5FFF'),
  E('da-1', 268, 250, 16, 9, '#B0BEC5'),
  E('da-2', 336, 300, 16, 9, '#B0BEC5'),
  E('da-3', 270, 380, 16, 9, '#B0BEC5'),
  E('da-4', 338, 420, 16, 9, '#B0BEC5'),
  D('cua-so-thap', 'M 284 250 L 284 216 Q 284 198 300 198 Q 316 198 316 216 L 316 250 Z', '#FFE066'),
  D('cua-thap', 'M 276 470 L 276 410 Q 276 386 300 386 Q 324 386 324 410 L 324 470 Z', '#8B5A2B'),
];

export const congThanh = () => [
  R('tuong-cong', 150, 250, 300, 220, 4, '#D7CCC8'),
  R('thap-cong-trai', 110, 190, 80, 280, 4, '#BCAAA4'),
  R('thap-cong-phai', 410, 190, 80, 280, 4, '#BCAAA4'),
  ...[0, 1, 2].map((k) => R(`rang-trai-${k + 1}`, 110 + k * 30, 170, 20, 24, 2, '#BCAAA4')),
  ...[0, 1, 2].map((k) => R(`rang-phai-${k + 1}`, 410 + k * 30, 170, 20, 24, 2, '#BCAAA4')),
  D('vom-cong', 'M 230 470 L 230 350 Q 230 290 300 290 Q 370 290 370 350 L 370 470 Z', '#5D4037'),
  line('M 256 330 L 256 470 M 282 300 L 282 470 M 318 300 L 318 470 M 344 330 L 344 470 M 232 380 L 368 380 M 230 430 L 370 430', 3),
  D('cua-so-cong-trai', 'M 136 300 L 136 270 Q 136 256 150 256 Q 164 256 164 270 L 164 300 Z', '#FFE066'),
  D('cua-so-cong-phai', 'M 436 300 L 436 270 Q 436 256 450 256 Q 464 256 464 270 L 464 300 Z', '#FFE066'),
];

export const cauDa = () => [
  E('dong-nuoc-duoi-cau', 300, 472, 250, 26, '#81D4FA'),
  D('cau-da', 'M 60 330 L 540 330 L 540 470 L 470 470 Q 460 380 300 370 Q 140 380 130 470 L 60 470 Z', '#BCAAA4'),
  R('lan-can-cau', 60, 300, 480, 30, 6, '#D7CCC8'),
  ...[0, 1, 2, 3, 4].map((k) => R(`tru-lan-can-${k + 1}`, 70 + k * 110, 282, 26, 50, 5, '#A1887F')),
  E('da-cau-1', 90, 410, 18, 10, '#A1887F'),
  E('da-cau-2', 510, 410, 18, 10, '#A1887F'),
  E('da-cau-3', 300, 350, 22, 10, '#A1887F'),
];

export const giengUoc = () => [
  R('cot-gieng-trai', 200, 220, 20, 200, 4, '#8B5A2B'),
  R('cot-gieng-phai', 380, 220, 20, 200, 4, '#8B5A2B'),
  P('mai-gieng', [[170, 236], [300, 140], [430, 236]], '#E57350'),
  R('tay-quay', 214, 250, 172, 12, 5, '#A0673A'),
  line('M 300 262 L 300 300', 3),
  P('xo-gieng', [[280, 300], [320, 300], [314, 336], [286, 336]], '#FFC94D'),
  R('thanh-gieng', 180, 380, 240, 100, 10, '#BCAAA4'),
  E('mieng-gieng', 300, 382, 124, 22, '#5D6D7E'),
  E('da-gieng-1', 230, 430, 20, 11, '#A1887F'),
  E('da-gieng-2', 300, 450, 20, 11, '#A1887F'),
  E('da-gieng-3', 370, 430, 20, 11, '#A1887F'),
];
