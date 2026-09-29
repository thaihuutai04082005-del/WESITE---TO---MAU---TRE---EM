// Hình dáng các đối tượng MỚI của Đợt 3 (khung 600×600, chủ thể quanh giữa, đáy ≈ 480).
// Thí nghiệm (10), Mỹ thuật (11), Hải tặc (13), Xiếc (14), Máy móc (15).
import { E, C, R, P, D, line, star } from './shapes.mjs';

const f = (n) => Math.round(n * 10) / 10;
/** Điểm trên cung tròn (độ, trục y hướng xuống): a0 → a1. */
const arc = (cx, cy, rx, ry, a0, a1, n = 24) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
const poly = (id, pts, color) => P(id, pts.map(([x, y]) => [f(x), f(y)]), color);
/** Thanh chéo (hình chữ nhật xoay) nối 2 điểm. */
const bar = (id, x1, y1, x2, y2, w, color) => {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = (-dy / L) * (w / 2), ny = (dx / L) * (w / 2);
  return poly(id, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], color);
};

// ================= 10 · DỤNG CỤ THÍ NGHIỆM =================

export const ongNghiem = () => [
  poly('ong-nghiem', [[232, 140], [368, 140], ...arc(300, 400, 68, 72, 0, 180)], '#E3F6FF'),
  poly('dung-dich-ong', [[238, 300], [362, 300], ...arc(300, 400, 62, 66, 0, 180)], '#4CD787'),
  C('bot-trong-ong-1', 270, 400, 12, '#A5F2C4'),
  C('bot-trong-ong-2', 326, 360, 9, '#A5F2C4'),
  C('bot-trong-ong-3', 310, 430, 7, '#A5F2C4'),
  R('mieng-ong', 220, 118, 160, 26, 10, '#B3E5FC'),
];

export const binhTamGiac = () => [
  R('co-binh', 262, 118, 76, 110, 6, '#E3F6FF'),
  R('mieng-binh', 250, 104, 100, 22, 8, '#B3E5FC'),
  D('than-binh', 'M 262 222 L 338 222 L 440 440 Q 450 472 418 472 L 182 472 Q 150 472 160 440 Z', '#E3F6FF'),
  D('dung-dich-binh', 'M 205 372 L 395 372 L 430 446 Q 436 464 416 464 L 184 464 Q 164 464 170 446 Z', '#FF7AA2'),
  C('bot-binh-1', 250, 420, 11, '#FFC1D6'),
  C('bot-binh-2', 350, 432, 9, '#FFC1D6'),
];

export const kinhHienVi = () => [
  R('de-kinh', 180, 438, 250, 42, 14, '#546E7A'),
  poly('than-kinh', [[318, 440], [424, 440], [424, 250], [380, 166], [318, 184], [340, 256], [340, 380], [318, 400]], '#78909C'),
  R('ban-kinh', 200, 330, 170, 20, 6, '#90A4AE'),
  R('kep-kinh', 222, 318, 50, 12, 4, '#B0BEC5'),
  bar('ong-kinh', 250, 130, 305, 290, 58, '#ECEFF1'),
  bar('vat-kinh', 296, 280, 305, 316, 30, '#FFD54F'),
  bar('thi-kinh', 238, 96, 252, 138, 44, '#607D8B'),
  C('num-chinh', 432, 300, 22, '#FF7AA2'),
];

export const namCham = () => [
  poly('than-nam-cham', [[180, 200], ...arc(300, 330, 120, 130, 180, 0, 30), [420, 200], [340, 200], ...arc(300, 330, 40, 50, 0, 180, 16), [260, 200]], '#FF5F5F'),
  R('cuc-trai', 180, 150, 80, 60, 6, '#CFD8DC'),
  R('cuc-phai', 340, 150, 80, 60, 6, '#CFD8DC'),
];

export const kinhLup = () => [
  bar('can-kinh-lup', 350, 340, 452, 468, 52, '#8D6E63'),
  bar('dai-can', 344, 332, 368, 362, 60, '#FFD54F'),
  C('vanh-kinh-lup', 270, 250, 126, '#FFB74D'),
  C('mat-kinh-lup', 270, 250, 100, '#E3F6FF'),
  E('loe-sang', 222, 190, 22, 12, '#FFFFFF', -35),
];

export const nguyenTu = () => [
  line('M 110 300 A 190 70 0 1 0 490 300 A 190 70 0 1 0 110 300', 5),
  line(`M ${f(300 - 190 * 0.5)} ${f(300 - 190 * 0.866)} A 190 70 60 1 0 ${f(300 + 190 * 0.5)} ${f(300 + 190 * 0.866)} A 190 70 60 1 0 ${f(300 - 190 * 0.5)} ${f(300 - 190 * 0.866)}`, 5),
  line(`M ${f(300 + 190 * 0.5)} ${f(300 - 190 * 0.866)} A 190 70 -60 1 0 ${f(300 - 190 * 0.5)} ${f(300 + 190 * 0.866)} A 190 70 -60 1 0 ${f(300 + 190 * 0.5)} ${f(300 - 190 * 0.866)}`, 5),
  C('hat-nhan', 300, 300, 72, '#FF9F43'),
  C('proton-1', 246, 262, 18, '#FF5F5F'),
  C('proton-2', 356, 258, 16, '#4FA3E0'),
  C('proton-3', 360, 350, 16, '#FF5F5F'),
  C('electron-1', 110, 300, 18, '#4CD787'),
  C('electron-2', 395, 135, 18, '#7D5FFF'),
  C('electron-3', 395, 465, 18, '#FFD54F'),
];

// ================= 11 · DỤNG CỤ MỸ THUẬT =================

export const coVe = () => [
  R('can-co', 254, 90, 92, 250, 40, '#FF9F43'),
  R('dai-kim-loai', 246, 330, 108, 52, 8, '#CFD8DC'),
  D('long-co', 'M 250 380 L 350 380 Q 360 440 300 486 Q 240 440 250 380 Z', '#FFE0B5'),
  D('mau-dau-co', 'M 272 440 L 328 440 Q 322 468 300 486 Q 278 468 272 440 Z', '#4FA3E0'),
];

export const butChiMau = () => [
  R('tay-bui', 252, 72, 96, 40, 12, '#FF9EC0'),
  R('dai-bac', 250, 108, 100, 30, 4, '#CFD8DC'),
  R('than-but-chi', 250, 136, 100, 250, 0, '#7D5FFF'),
  R('canh-but-trai', 250, 136, 22, 250, 0, '#9C85FF'),
  R('canh-but-phai', 328, 136, 22, 250, 0, '#5E43D8'),
  P('go-but-chi', [[250, 386], [350, 386], [300, 470]], '#F6D1A4'),
  P('ruot-but-chi', [[284, 443], [316, 443], [300, 470]], '#7D5FFF'),
];

export const butSap = () => [
  D('dau-but-sap', 'M 244 190 L 272 110 Q 300 90 328 110 L 356 190 Z', '#FF5F5F'),
  R('than-but-sap', 236, 186, 128, 290, 18, '#FF5F5F'),
  poly('giay-boc', [[236, 236], ...Array.from({ length: 9 }, (_, k) => [236 + k * 16, k % 2 ? 226 : 236]), [364, 236], [364, 410], ...Array.from({ length: 9 }, (_, k) => [364 - k * 16, k % 2 ? 420 : 410]), [236, 410]], '#FFE0B5'),
];

export const bangMau = () => [
  D('bang-mau', 'M 140 300 Q 140 150 320 140 Q 480 140 480 280 Q 480 360 420 360 Q 380 360 380 400 Q 380 470 290 470 Q 140 470 140 300 Z', '#F6D1A4'),
  E('lo-ngon-cai', 400, 300, 26, 22, '#FFF6E0'),
  C('mau-do', 200, 250, 26, '#FF5F5F'),
  C('mau-vang', 262, 190, 26, '#FFD54F'),
  C('mau-xanh-la', 340, 182, 26, '#4CD787'),
  C('mau-xanh-duong', 414, 214, 24, '#4FA3E0'),
  C('mau-tim', 200, 340, 22, '#7D5FFF'),
];

export const tuypMau = () => [
  R('nap-tuyp', 262, 96, 76, 60, 12, '#FF7AA2'),
  P('vai-tuyp', [[270, 150], [330, 150], [376, 200], [224, 200]], '#CFD8DC'),
  R('than-tuyp', 220, 196, 160, 250, 16, '#ECEFF1'),
  R('nhan-tuyp', 220, 280, 160, 110, 0, '#FF7AA2'),
  poly('duoi-tuyp', [[208, 440], [392, 440], [392, 478], ...Array.from({ length: 11 }, (_, k) => [392 - k * 18.4, k % 2 ? 470 : 478]), [208, 478]], '#CFD8DC'),
];

export const giaVe = () => [
  bar('chan-sau-gia', 300, 110, 300, 480, 22, '#A0673A'),
  bar('chan-trai-gia', 272, 110, 180, 482, 26, '#C68B59'),
  bar('chan-phai-gia', 328, 110, 420, 482, 26, '#C68B59'),
  R('kep-tren', 270, 96, 60, 30, 6, '#8B5A2B'),
  R('toan-tranh', 180, 118, 240, 200, 6, '#FFFFFF'),
  R('go-do-tranh', 166, 316, 268, 20, 6, '#8B5A2B'),
];

// ================= 13 · ĐỒ VẬT HẢI TẶC =================

export const tauHaiTac = () => [
  R('cot-buom', 292, 90, 16, 290, 4, '#8B5A2B'),
  P('co-dinh-cot', [[308, 92], [370, 110], [308, 128]], '#2F3640'),
  D('buom-lon', 'M 190 150 Q 300 128 410 150 Q 430 230 410 310 Q 300 290 190 310 Q 170 230 190 150 Z', '#FFF6E0'),
  R('choi-canh', 270, 112, 60, 22, 6, '#A0673A'),
  D('than-tau', 'M 110 350 L 490 350 Q 470 470 380 480 L 220 480 Q 130 470 110 350 Z', '#8D5A3B'),
  R('man-tau', 104, 340, 392, 22, 8, '#A0673A'),
  C('cua-tron-1', 200, 410, 16, '#FFE066'),
  C('cua-tron-2', 400, 410, 16, '#FFE066'),
];

export const ruongKhoBau = () => [
  D('nap-ruong', 'M 180 290 L 180 240 Q 300 150 420 240 L 420 290 Z', '#A0673A'),
  R('than-ruong', 180, 286, 240, 186, 10, '#8D5A3B'),
  R('dai-sat-trai', 206, 212, 26, 260, 4, '#FFD54F'),
  R('dai-sat-phai', 368, 212, 26, 260, 4, '#FFD54F'),
  R('o-khoa', 278, 270, 44, 50, 8, '#FFD54F'),
  C('lo-khoa', 300, 292, 7, '#5D4037'),
];

export const laBan = () => [
  C('khuyen-la-ban', 300, 132, 28, '#FFD54F'),
  C('vo-la-ban', 300, 310, 166, '#FFB74D'),
  C('mat-la-ban', 300, 310, 136, '#FFF6E0'),
  P('huong-bac', [[300, 182], [314, 214], [286, 214]], '#FF5F5F'),
  P('huong-nam', [[300, 438], [314, 406], [286, 406]], '#4FA3E0'),
  P('huong-dong', [[428, 310], [396, 296], [396, 324]], '#4FA3E0'),
  P('huong-tay', [[172, 310], [204, 296], [204, 324]], '#4FA3E0'),
  star('tam-la-ban', 300, 250, 20, 8, '#FFD54F', 4),
];

export const moNeo = () => [
  C('vong-neo', 300, 118, 40, '#90A4AE'),
  C('lo-vong-neo', 300, 118, 20, '#ECEFF1'),
  R('ngang-neo', 190, 168, 220, 32, 14, '#78909C'),
  R('than-neo', 248, 150, 104, 300, 26, '#90A4AE'),
  poly('cung-neo', [...arc(300, 330, 170, 150, 160, 20, 30), ...arc(300, 330, 128, 110, 20, 160, 30)], '#78909C'),
  P('mui-neo-trai', [[112, 330], [178, 384], [130, 410]], '#607D8B'),
  P('mui-neo-phai', [[488, 330], [422, 384], [470, 410]], '#607D8B'),
];

export const banDoKhoBau = () => [
  R('giay-ban-do', 170, 150, 260, 300, 4, '#FFF1C9'),
  R('cuon-tren', 150, 126, 300, 36, 18, '#E8C68A'),
  R('cuon-duoi', 150, 440, 300, 36, 18, '#E8C68A'),
  D('dao-ban-do', 'M 196 370 Q 210 320 280 330 Q 340 310 400 340 Q 420 400 360 412 Q 280 424 214 410 Q 188 400 196 370 Z', '#A5D66F'),
  line('M 230 390 L 250 380 M 270 372 L 292 368 M 312 366 L 334 372', 4),
  bar('dau-x-1', 348, 360, 380, 392, 12, '#FF5F5F'),
  bar('dau-x-2', 380, 360, 348, 392, 12, '#FF5F5F'),
];

export const banhLai = () => {
  const spokes = Array.from({ length: 8 }, (_, k) => {
    const a = (k * 45 * Math.PI) / 180;
    return [
      bar(`nan-lai-${k + 1}`, 300 + 50 * Math.cos(a), 300 + 50 * Math.sin(a), 300 + 186 * Math.cos(a), 300 + 186 * Math.sin(a), 18, '#A0673A'),
      E(`tay-cam-${k + 1}`, 300 + 200 * Math.cos(a), 300 + 200 * Math.sin(a), 22, 14, '#8B5A2B', k * 45),
    ];
  });
  return [
    ...spokes.map((s) => s[1]),
    C('vanh-lai', 300, 300, 160, '#8D5A3B'),
    C('long-lai', 300, 300, 128, '#FFF1C9'),
    ...spokes.map((s) => s[0]),
    C('truc-lai', 300, 300, 70, '#FFD54F'),
  ];
};

// ================= 14 · ĐẠO CỤ XIẾC =================

export const leuXiec = () => {
  const n = 8;
  const roof = Array.from({ length: n }, (_, k) => poly(`mai-leu-${k + 1}`, [[300, 130], [120 + (k * 360) / n, 300], [120 + ((k + 1) * 360) / n, 300]], k % 2 ? '#FFFFFF' : '#FF5F5F'));
  return [
    R('tuong-leu', 140, 296, 320, 180, 4, '#FFD54F'),
    D('rem-trai', 'M 140 296 L 210 296 Q 180 380 140 400 Z', '#FF5F5F'),
    D('rem-phai', 'M 460 296 L 390 296 Q 420 380 460 400 Z', '#FF5F5F'),
    ...roof,
    R('cot-co-leu', 296, 76, 8, 60, 2, '#8B5A2B'),
    P('co-leu', [[304, 78], [350, 92], [304, 106]], '#4FA3E0'),
    R('vien-mai', 112, 292, 376, 16, 8, '#4FA3E0'),
  ];
};

export const muAoThuat = () => [
  E('vanh-mu', 300, 440, 160, 34, '#37474F'),
  R('than-mu', 196, 150, 208, 290, 12, '#37474F'),
  E('dinh-mu', 300, 150, 104, 20, '#455A64'),
  R('dai-mu', 196, 370, 208, 44, 0, '#FF5F5F'),
];

export const bongTungHung = () => [
  C('bong-nho-1', 150, 150, 46, '#4FA3E0'),
  E('soc-bong-nho-1', 150, 150, 46, 14, '#FFD54F', -30),
  C('bong-nho-2', 450, 130, 42, '#4CD787'),
  E('soc-bong-nho-2', 450, 130, 42, 13, '#FF7AA2', 30),
  C('bong-lon', 300, 350, 128, '#FF5F5F'),
  D('soc-bong-lon', 'M 176 318 Q 300 280 424 318 L 426 376 Q 300 338 174 376 Z', '#FFD54F'),
];

export const vongNhaoLon = () => [
  P('chan-vong-trai', [[190, 480], [240, 420], [260, 430], [230, 480]], '#78909C'),
  P('chan-vong-phai', [[410, 480], [360, 420], [340, 430], [370, 480]], '#78909C'),
  C('vong-ngoai', 300, 270, 180, '#FF9F43'),
  C('long-vong', 300, 270, 142, '#FFF3D6'),
  ...Array.from({ length: 8 }, (_, k) => {
    const a = ((k * 45 + 22.5) * Math.PI) / 180;
    return E(`bang-vong-${k + 1}`, 300 + 161 * Math.cos(a), 270 + 161 * Math.sin(a), 20, 10, '#FF5F5F', k * 45 + 22.5 + 90);
  }),
];

export const trongXiec = () => [
  bar('dui-trong-1', 190, 110, 330, 230, 14, '#C68B59'),
  C('dau-dui-1', 188, 108, 14, '#FF7AA2'),
  bar('dui-trong-2', 410, 110, 270, 230, 14, '#C68B59'),
  C('dau-dui-2', 412, 108, 14, '#FF7AA2'),
  R('than-trong', 170, 260, 260, 190, 0, '#FF5F5F'),
  E('day-trong', 300, 450, 130, 30, '#FFD54F'),
  R('vanh-duoi', 170, 420, 260, 30, 0, '#FFD54F'),
  E('mat-trong', 300, 260, 130, 36, '#FFF3D6'),
  star('sao-trong-trai', 200, 360, 16, 7, '#FFFFFF'),
  star('sao-trong-phai', 400, 360, 16, 7, '#FFFFFF'),
];

export const xaDu = () => [
  R('moc-treo', 150, 40, 300, 18, 8, '#78909C'),
  line('M 200 58 L 199 282 M 400 58 L 401 282', 5),
  R('xa-du', 160, 280, 280, 96, 48, '#4FA3E0'),
  R('bang-quan-trai', 184, 280, 30, 96, 6, '#FFFFFF'),
  R('bang-quan-phai', 386, 280, 30, 96, 6, '#FFFFFF'),
];

// ================= 15 · MÁY MÓC & DỤNG CỤ SỬA CHỮA =================

export const banhRang = () => {
  const pts = [];
  const n = 10;
  for (let k = 0; k < n; k++) {
    const a = (k * 360) / n;
    pts.push(...arc(300, 300, 150, 150, a - 18, a - 9, 2), ...arc(300, 300, 186, 186, a - 7, a + 7, 2), ...arc(300, 300, 150, 150, a + 9, a + 18, 2));
  }
  return [poly('banh-rang', pts, '#FFB74D'), C('mat-banh-rang', 300, 300, 112, '#FFE0B5')];
};

export const coLe = () => {
  const head = [...arc(300, 180, 90, 90, -62, 242, 30), [262, 106], [274, 150], [326, 150], [338, 106]];
  return [
    R('can-co-le', 258, 220, 84, 230, 24, '#90A4AE'),
    poly('dau-co-le', head, '#78909C'),
    C('duoi-co-le', 300, 450, 46, '#78909C'),
    C('lo-duoi-co-le', 300, 450, 20, '#ECEFF1'),
  ];
};

export const tuaVit = () => [
  R('dau-tua-vit', 284, 350, 32, 100, 4, '#B0BEC5'),
  P('mui-tua-vit', [[284, 446], [316, 446], [306, 482], [294, 482]], '#90A4AE'),
  R('can-tua-vit', 236, 100, 128, 260, 48, '#FFD54F'),
  R('ranh-can-1', 236, 290, 128, 16, 8, '#FFB300'),
  R('ranh-can-2', 236, 320, 128, 16, 8, '#FFB300'),
];

export const bongDen = () => [
  poly('bong-thuy-tinh', [[252, 356], [248, 318], ...arc(300, 220, 124, 124, 125, 415, 40), [352, 318], [348, 356]], '#FFF3B0'),
  R('co-bong', 246, 350, 108, 22, 6, '#CFD8DC'),
  R('ren-1', 252, 372, 96, 20, 6, '#B0BEC5'),
  R('ren-2', 252, 392, 96, 20, 6, '#CFD8DC'),
  R('ren-3', 256, 412, 88, 20, 6, '#B0BEC5'),
  P('chan-bong', [[270, 432], [330, 432], [312, 460], [288, 460]], '#546E7A'),
];

export const dongHoBaoThuc = () => [
  P('chan-dong-ho-trai', [[196, 404], [220, 420], [180, 478], [160, 470]], '#546E7A'),
  P('chan-dong-ho-phai', [[404, 404], [380, 420], [420, 478], [440, 470]], '#546E7A'),
  D('chuong-trai', 'M 150 190 Q 160 110 240 110 Z', '#FFD54F'),
  D('chuong-phai', 'M 450 190 Q 440 110 360 110 Z', '#FFD54F'),
  R('bua-chuong', 290, 110, 20, 40, 6, '#78909C'),
  C('vo-dong-ho', 300, 300, 150, '#FF5F5F'),
  C('mat-dong-ho', 300, 300, 120, '#FFFFFF'),
  R('so-12', 294, 190, 12, 22, 4, '#2F3640'),
  R('so-6', 294, 388, 12, 22, 4, '#2F3640'),
  R('so-3', 388, 294, 22, 12, 4, '#2F3640'),
  R('so-9', 190, 294, 22, 12, 4, '#2F3640'),
  line('M 300 262 L 300 222 M 300 262 L 334 262', 5),
  C('truc-kim', 300, 262, 7, '#FF5F5F'),
];

export const quatDien = () => [
  D('de-quat', 'M 160 482 Q 160 386 300 386 Q 440 386 440 482 Z', '#4FA3E0'),
  R('than-quat', 282, 300, 36, 96, 10, '#90CAF9'),
  C('long-quat', 300, 200, 150, '#E3F6FF'),
  ...[0, 120, 240].map((a, k) => E(`canh-quat-${k + 1}`, 300 + 74 * Math.cos(((a - 90) * Math.PI) / 180), 200 + 74 * Math.sin(((a - 90) * Math.PI) / 180), 64, 34, '#4CD787', a - 90)),
  C('tam-quat', 300, 200, 30, '#FFD54F'),
  line(Array.from({ length: 8 }, (_, k) => { const a = (k * 45 * Math.PI) / 180; return `M ${f(300 + 30 * Math.cos(a))} ${f(200 + 30 * Math.sin(a))} L ${f(300 + 150 * Math.cos(a))} ${f(200 + 150 * Math.sin(a))}`; }).join(' '), 2.5),
];
