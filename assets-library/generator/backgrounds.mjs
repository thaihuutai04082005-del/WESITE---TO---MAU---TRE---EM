// Bối cảnh (background) riêng cho từng tranh Lớp 3: ~40 khung cảnh × nhiều màu trời.
// Mỗi tranh được gán 1 cặp (khung cảnh, màu trời) KHÔNG TRÙNG với tranh nào khác (xem bg-map.mjs).
// Bối cảnh chỉ vẽ ở rìa / phía xa để không che chủ thể ở giữa tranh.
import { E, C, R, P, D, line, star, cloud, smallFlower } from './shapes.mjs';

export const SKIES = {
  day: '#BDE6FF',
  morning: '#FFE9C7',
  sunset: '#FFD3A5',
  dusk: '#C9B6E4',
  night: '#2C3E74',
  mint: '#CFF3E6',
  pink: '#FFE0EC',
  storm: '#A9C4D6',
  space: '#243B6B',
  nebula: '#3B2667',
  alien: '#1E4D5C',
  deep: '#14213D',
};
const DARK = new Set(['night', 'space', 'nebula', 'alien', 'deep']);

// ---------- Mặt đất ----------
const G = {
  hill: (c) => D('nen-dat', 'M 0 470 Q 150 440 300 465 Q 450 490 600 455 L 600 600 L 0 600 Z', c),
  flat: (c) => R('nen-dat', 0, 470, 600, 130, 0, c),
  floor: (c) => R('san-nha', 0, 450, 600, 150, 0, c),
  dune: (c) => D('nen-dat', 'M 0 480 Q 100 440 220 470 Q 340 500 460 455 Q 540 430 600 460 L 600 600 L 0 600 Z', c),
  wave: (c) => D('mat-nuoc', 'M 0 440 Q 75 425 150 440 Q 225 455 300 440 Q 375 425 450 440 Q 525 455 600 440 L 600 600 L 0 600 Z', c),
};

// ---------- Trang trí bầu trời theo màu trời ----------
function skyDecor(pal, side = 1) {
  const x = side > 0 ? 505 : 95;
  if (pal === 'day') return [star('tia-nang', x, 88, 60, 42, '#FFB74D', 12), C('mat-troi', x, 88, 36, '#FFD54F'), cloud('may-1', 600 - x, 90, 0.6)];
  if (pal === 'morning') return [C('mat-troi', x, 110, 44, '#FFB74D'), cloud('may-1', 600 - x, 80, 0.55, '#FFFFFF')];
  if (pal === 'sunset') return [C('mat-troi', x, 150, 54, '#FF8A65'), E('dai-may-1', 600 - x, 90, 90, 14, '#FFB3A1')];
  if (pal === 'pink' || pal === 'mint') return [cloud('may-1', 600 - x, 86, 0.6, '#FFFFFF'), cloud('may-2', x, 60, 0.45, '#FFFFFF')];
  if (pal === 'storm') return [cloud('may-mua-1', 120, 90, 0.8, '#B0BEC5'), cloud('may-mua-2', 480, 80, 0.8, '#B0BEC5')];
  if (pal === 'dusk') return [star('sao-1', 90, 70, 12, 5, '#FFF3B0'), star('sao-2', 510, 110, 10, 4, '#FFF3B0'), C('trang-chieu', x, 80, 26, '#FFF3D6')];
  if (DARK.has(pal)) {
    return [[60, 60], [170, 120], [270, 40], [430, 90], [560, 50], [540, 210], [40, 230]].map(([sx, sy], k) => star(`sao-${k + 1}`, sx, sy, k % 2 ? 9 : 13, k % 2 ? 4 : 6, '#FFE066'));
  }
  return [];
}

const tree = (id, x, y, s, leaf = '#4CAF50') => [R(`than-${id}`, x - 8 * s, y - 60 * s, 16 * s, 60 * s, 3, '#8B5A2B'), C(id, x, y - 90 * s, 44 * s, leaf)];
const pine = (id, x, y, s, col = '#43A047') => [P(id, [[x - 40 * s, y], [x, y - 140 * s], [x + 40 * s, y]], col)];
const building = (id, x, w, h, col, win = '#D6F0FF', y0 = 470) => {
  const items = [R(id, x, y0 - h, w, h, 4, col)];
  let k = 1;
  for (let yy = y0 - h + 16; yy < y0 - 30; yy += 38) for (let xx = x + 12; xx < x + w - 24; xx += 30) items.push(R(`${id}-cs-${k++}`, xx, yy, 18, 22, 3, win));
  return items;
};
const hills = (col1, col2) => [D('doi-xa-1', 'M -20 470 Q 120 330 280 470 Z', col1), D('doi-xa-2', 'M 300 470 Q 460 320 620 470 Z', col2)];

// ---------- Khung cảnh ----------
// Mỗi hàm trả về { ground, far (sau mặt đất), near (trước mặt đất), fg (trước chủ thể) }.
export const SETTINGS = {
  meadow: () => ({ ground: G.hill('#8BD17C'), far: [...hills('#B5E3A8', '#A4DA96')], near: [...smallFlower('hoa-dong-1', 60, 520, '#FF7AA2'), ...smallFlower('hoa-dong-2', 540, 530, '#FFD54F')] }),
  beach: () => ({ ground: G.dune('#F6D98B'), far: [R('bien-xa', 0, 400, 600, 80, 0, '#5DADE2'), E('buom-thuyen', 100, 400, 26, 8, '#FFFFFF')], near: [E('vo-so', 80, 540, 16, 12, '#FFB3C1'), star('sao-bien-cat', 520, 545, 16, 7, '#FF8A65')] }),
  city: () => ({ ground: G.flat('#9E9E9E'), far: [...building('toa-1', 10, 110, 260, '#90A4AE'), ...building('toa-2', 470, 120, 300, '#B0BEC5')], near: [line('M 0 530 L 80 530 M 140 530 L 220 530 M 380 530 L 460 530 M 520 530 L 600 530', 6)] }),
  forest: () => ({ ground: G.hill('#6FBF73'), far: [...pine('thong-1', 50, 470, 1.1), ...pine('thong-2', 130, 470, 0.8, '#388E3C'), ...pine('thong-3', 470, 470, 0.9, '#388E3C'), ...pine('thong-4', 560, 470, 1.2)] }),
  desert: () => ({ ground: G.dune('#F4C27A'), far: [P('kim-tu-thap-1', [[20, 470], [120, 330], [220, 470]], '#E0A15A'), P('kim-tu-thap-2', [[420, 470], [500, 360], [580, 470]], '#EDB673')] }),
  farm: () => ({ ground: G.flat('#A5D66F'), far: [...hills('#C5E1A5', '#AED581'), R('hang-rao', 0, 430, 600, 12, 2, '#C68B59')], near: [line('M 20 420 L 20 470 M 90 420 L 90 470 M 160 420 L 160 470 M 440 420 L 440 470 M 510 420 L 510 470 M 580 420 L 580 470', 6), E('dong-rom', 70, 540, 50, 26, '#FFD54F')] }),
  park: () => ({ ground: G.hill('#8BD17C'), far: [...tree('cay-cong-vien', 520, 470, 1.1)], near: [R('ghe-da', 30, 480, 120, 14, 4, '#A0673A'), R('lung-ghe', 30, 450, 120, 12, 4, '#A0673A'), D('loi-di', 'M 250 600 L 350 600 L 320 470 L 280 470 Z', '#E8D5B0')] }),
  playground: () => ({ ground: G.flat('#FFCC80'), far: [P('cau-truot', [[440, 470], [440, 300], [470, 300], [590, 470]], '#FF7AA2'), R('thang-cau-truot', 420, 300, 20, 170, 3, '#4FA3E0'), P('khung-xich-du-trai', [[30, 470], [70, 330], [84, 330], [46, 470]], '#4FA3E0'), P('khung-xich-du-phai', [[150, 470], [140, 330], [154, 330], [166, 470]], '#4FA3E0'), R('xa-xich-du', 64, 322, 96, 14, 5, '#4FA3E0'), line('M 95 336 L 95 414 M 125 336 L 125 414', 3), R('ghe-xich-du', 86, 412, 48, 12, 4, '#FFD54F')] }),
  river: () => ({ ground: G.hill('#8BD17C'), far: [D('dong-song', 'M 0 460 Q 150 430 300 460 Q 450 490 600 450 L 600 490 Q 450 520 300 490 Q 150 460 0 490 Z', '#5DADE2')], near: [E('da-song-1', 90, 530, 30, 12, '#B0BEC5'), E('da-song-2', 510, 540, 34, 12, '#B0BEC5')] }),
  lake: () => ({ ground: G.hill('#8BD17C'), far: [P('nui-ho-1', [[-30, 430], [120, 250], [260, 430]], '#9FB8CF'), P('nui-ho-2', [[340, 430], [480, 270], [630, 430]], '#8FA8BF'), R('mat-ho', 0, 420, 600, 50, 0, '#7DC4FF')], near: [line('M 40 520 L 40 470 M 52 520 L 60 470 M 560 520 L 560 470 M 548 520 L 540 470', 4)] }),
  waterfall: () => ({ ground: G.hill('#7CC47F'), far: [R('vach-da', 420, 140, 180, 330, 6, '#A1887F'), R('thac-nuoc', 470, 140, 70, 330, 4, '#8FD3FF'), E('bot-thac', 505, 470, 70, 16, '#F0F8FF')] }),
  peak: () => ({ ground: G.hill('#CFD8DC'), far: [P('dinh-nui', [[-20, 470], [150, 170], [320, 470]], '#90A4AE'), P('tuyet-dinh', [[150, 170], [118, 230], [150, 216], [182, 230]], '#FFFFFF'), R('co-dinh-nui', 150, 130, 4, 44, 1, '#2F3640'), P('la-co-dinh', [[154, 132], [190, 142], [154, 152]], '#FF5F5F')] }),
  autumn: () => ({ ground: G.hill('#D7B37A'), far: [...tree('cay-thu-1', 70, 470, 1.1, '#FF9F43'), ...tree('cay-thu-2', 530, 470, 1, '#E57350')], fg: [E('la-thu-1', 200, 120, 14, 8, '#FFC94D', 30), E('la-thu-2', 400, 160, 14, 8, '#FF9F43', -20)] }),
  spring: () => ({ ground: G.hill('#A5D66F'), far: [...tree('cay-hoa-1', 80, 470, 1.1, '#FFB3C1'), ...tree('cay-hoa-2', 520, 470, 1, '#FF9EC0')], fg: [E('canh-hoa-roi-1', 220, 140, 10, 6, '#FFB3C1', 20), E('canh-hoa-roi-2', 380, 100, 10, 6, '#FFB3C1', -30)] }),
  rainyStreet: () => ({ ground: G.flat('#8D9BA6'), far: [...building('nha-mua-1', 20, 100, 220, '#A1B0BC'), ...building('nha-mua-2', 480, 100, 250, '#90A4AE')], near: [E('vung-nuoc-1', 120, 540, 60, 12, '#7DC4FF'), E('vung-nuoc-2', 470, 560, 50, 10, '#7DC4FF')], fg: [0, 1, 2, 3, 4, 5].map((k) => E(`giot-mua-${k + 1}`, 60 + k * 100, 150 + (k % 2) * 60, 4, 10, '#5DADE2')) }),
  snowVillage: () => ({ ground: G.hill('#F0F6FB'), far: [R('nha-tuyet-1', 30, 390, 90, 80, 4, '#FFCC80'), P('mai-tuyet-1', [[20, 395], [75, 340], [130, 395]], '#FFFFFF'), R('nha-tuyet-2', 480, 380, 90, 90, 4, '#FF8A65'), P('mai-tuyet-2', [[470, 385], [525, 330], [580, 385]], '#FFFFFF')], fg: [[80, 150], [220, 90], [380, 140], [520, 200], [300, 60]].map(([x, y], k) => C(`bong-tuyet-${k + 1}`, x, y, 7, '#FFFFFF')) }),
  volcanoValley: () => ({ ground: G.hill('#8BC34A'), far: [P('nui-lua-xa', [[380, 470], [470, 250], [520, 250], [610, 470]], '#8D6E63'), D('dung-nham-xa', 'M 470 252 Q 495 222 520 252 L 510 290 Q 495 270 480 290 Z', '#FF7043')], near: [E('duong-xi-1', 60, 480, 40, 16, '#4CAF50', -30), E('duong-xi-2', 100, 486, 34, 14, '#66BB6A', 30)] }),
  cloudland: () => ({ ground: D('bien-may', 'M 0 470 Q 60 430 120 460 Q 180 420 250 455 Q 320 420 390 455 Q 460 425 520 458 Q 570 435 600 450 L 600 600 L 0 600 Z', '#FFFFFF'), far: [cloud('may-cao-1', 110, 180, 0.7, '#FFFFFF'), cloud('may-cao-2', 480, 220, 0.6, '#FFFFFF')] }),
  rainbowHills: () => ({ ground: G.hill('#9CCC65'), far: ['#FF5F5F', '#FF9F43', '#FFD54F', '#4CD787', '#4FA3E0'].map((col, k) => D(`cau-vong-xa-${k + 1}`, `M ${-40 + k * 14} 470 Q 300 ${120 + k * 14} ${640 - k * 14} 470 L ${626 - k * 14} 470 Q 300 ${134 + k * 14} ${-26 + k * 14} 470 Z`, col)) }),
  stadium: () => ({ ground: G.flat('#7CC47F'), far: [R('khan-dai', 0, 330, 600, 140, 0, '#B0BEC5'), line('M 0 370 L 600 370 M 0 410 L 600 410 M 0 450 L 600 450', 3), ...[40, 120, 200, 400, 480, 560].map((x, k) => C(`khan-gia-${k + 1}`, x, 356, 10, ['#FF5F7E', '#4FA3E0', '#FFD54F'][k % 3]))], near: [line('M 0 540 L 600 540', 4)] }),
  iceRink: () => ({ ground: G.flat('#DDF1FB'), far: [R('thanh-chan-san', 0, 430, 600, 40, 0, '#FFFFFF'), R('vach-do', 0, 446, 600, 8, 0, '#FF5F5F')], near: [line('M 60 530 Q 200 500 300 530 M 360 560 Q 480 530 560 560', 2)] }),
  garden: () => ({ ground: G.hill('#8BD17C'), far: [0, 1, 2, 3, 4, 5, 6, 7].map((k) => P(`coc-rao-${k + 1}`, [[10 + k * 76, 470], [10 + k * 76, 400], [30 + k * 76, 380], [50 + k * 76, 400], [50 + k * 76, 470]], '#FFFFFF')), near: [...smallFlower('hoa-vuon-1', 120, 530, '#7D5FFF'), ...smallFlower('hoa-vuon-2', 480, 540, '#FF7AA2')] }),
  jungle: () => ({ ground: G.hill('#66BB6A'), far: [E('la-to-1', 40, 330, 90, 40, '#43A047', -50), E('la-to-2', 560, 300, 90, 40, '#388E3C', 50), E('la-to-3', 70, 430, 70, 30, '#66BB6A', 20), E('la-to-4', 540, 420, 70, 30, '#4CAF50', -20)] }),
  canyon: () => ({ ground: G.flat('#E0A15A'), far: [P('vach-nui-trai', [[0, 470], [0, 200], [110, 230], [150, 470]], '#D0845A'), P('vach-nui-phai', [[600, 470], [600, 180], [480, 220], [440, 470]], '#C0704A')] }),
  sunsetSea: () => ({ ground: G.wave('#4F8EC9'), far: [E('duong-chan-troi', 300, 440, 320, 10, '#FFB380')] }),
  underwater: () => ({ ground: G.dune('#F6D98B'), far: [D('rong-1', 'M 60 480 Q 30 400 70 330 Q 90 400 80 480 Z', '#4CAF50'), D('rong-2', 'M 530 480 Q 500 380 550 300 Q 570 400 550 480 Z', '#66BB6A')], fg: [C('bot-nuoc-1', 120, 180, 12, '#D6F0FF'), C('bot-nuoc-2', 480, 140, 16, '#D6F0FF'), C('bot-nuoc-3', 500, 240, 9, '#D6F0FF')] }),
  crystalCave: () => ({ ground: G.flat('#6D6875'), far: [P('pha-le-1', [[40, 470], [70, 330], [100, 470]], '#B39DDB'), P('pha-le-2', [[90, 470], [110, 380], [130, 470]], '#7DE2FF'), P('pha-le-3', [[480, 470], [520, 320], [560, 470]], '#80DEEA'), P('pha-le-4', [[440, 470], [460, 390], [480, 470]], '#F48FB1')] }),
  // Trong nhà (far[0] luôn là bức tường — màu tường đổi theo "màu trời")
  kitchen: () => ({ ground: G.floor('#FFE0B5'), far: [R('tuong-gach', 0, 0, 600, 450, 0, '#FFF6E0'), R('gach-op-bep', 0, 180, 600, 60, 0, '#B2EBF2'), R('tu-bep', 0, 330, 140, 120, 6, '#A0673A'), R('mat-bep', 0, 320, 150, 14, 4, '#BFC8D0'), R('cua-so-bep', 440, 60, 120, 100, 8, '#BDE6FF')] }),
  classroom: () => ({ ground: G.floor('#E0C08A'), far: [R('tuong-lop', 0, 0, 600, 450, 0, '#E3F2FD'), R('ke-sach', 460, 250, 120, 200, 6, '#C68B59'), R('sach-1', 474, 270, 18, 60, 2, '#FF5F7E'), R('sach-2', 496, 270, 18, 60, 2, '#4FA3E0'), R('sach-3', 518, 270, 18, 60, 2, '#FFD54F'), R('cua-so-lop', 40, 60, 140, 110, 8, '#BDE6FF')] }),
  stage: () => ({ ground: G.floor('#C68B59'), far: [R('phong-nen', 0, 0, 600, 450, 0, '#4A2C5E'), D('man-trai', 'M 0 0 L 140 0 Q 100 200 150 450 L 0 450 Z', '#E74C3C'), D('man-phai', 'M 600 0 L 460 0 Q 500 200 450 450 L 600 450 Z', '#E74C3C'), R('diem-man', 0, 0, 600, 40, 0, '#C0392B')] }),
  palaceHall: () => ({ ground: G.floor('#F3E3C3'), far: [R('tuong-cung', 0, 0, 600, 450, 0, '#FFF3D6'), R('cot-cung-1', 30, 60, 50, 390, 6, '#FFE0B5'), R('cot-cung-2', 520, 60, 50, 390, 6, '#FFE0B5'), P('co-cung-1', [[120, 60], [180, 60], [180, 190], [150, 160], [120, 190]], '#7D5FFF'), P('co-cung-2', [[420, 60], [480, 60], [480, 190], [450, 160], [420, 190]], '#7D5FFF')], near: [P('tham-cung', [[230, 600], [370, 600], [340, 450], [260, 450]], '#E74C3C')] }),
  library: () => ({ ground: G.floor('#D7B37A'), far: [R('tuong-thu-vien', 0, 0, 600, 450, 0, '#EFE6D8'), R('ke-1', 0, 80, 130, 370, 4, '#A0673A'), R('ke-2', 470, 80, 130, 370, 4, '#A0673A'), ...[0, 1, 2].flatMap((r) => [R(`sach-trai-${r}`, 10, 100 + r * 110, 110, 80, 2, ['#FF7AA2', '#4FA3E0', '#FFD54F'][r]), R(`sach-phai-${r}`, 480, 100 + r * 110, 110, 80, 2, ['#4CD787', '#FF9F43', '#7D5FFF'][r])])] }),
  bedroom: () => ({ ground: G.floor('#B39DDB'), far: [R('tuong-ngu', 0, 0, 600, 450, 0, '#3E3B6E'), R('cua-so-ngu', 60, 60, 130, 130, 10, '#2C3E74'), star('sao-cua-so', 125, 125, 16, 7, '#FFE066'), E('tham-tron', 300, 520, 200, 40, '#FFB3C1')] }),
  workshop: () => ({ ground: G.floor('#C8A26B'), far: [R('bang-dung-cu', 0, 0, 600, 450, 0, '#D7CCC8'), R('ban-lam-viec', 0, 360, 600, 22, 4, '#8B5A2B'), R('hop-dung-cu', 480, 320, 90, 40, 6, '#FF5F5F'), C('dong-ho-xuong', 90, 120, 44, '#FFFFFF'), line('M 90 120 L 90 92 M 90 120 L 110 128', 4), R('ke-go-xuong', 430, 150, 150, 14, 4, '#8B5A2B'), R('hu-1', 446, 108, 34, 42, 6, '#4FA3E0'), R('hu-2', 494, 118, 30, 32, 6, '#FFD54F'), R('hu-3', 536, 100, 32, 50, 6, '#4CD787')] }),
  gym: () => ({
    ground: G.floor('#E0B070'),
    far: [
      R('tuong-nha-thi-dau', 0, 0, 600, 450, 0, '#E3F2FD'),
      R('soc-tuong-nha-thi-dau', 0, 290, 600, 24, 0, '#FFCC80'),
      line('M 0 40 Q 300 110 600 40', 3),
      ...['#FF5F7E', '#FFD54F', '#4FA3E0', '#4CD787', '#7D5FFF', '#FF9F43', '#FF5F7E', '#FFD54F'].map((col, k) => {
        const x = 40 + k * 74;
        const y = 40 + 70 * Math.sin((x / 600) * Math.PI) * 0.5;
        return P(`co-nha-thi-dau-${k + 1}`, [[x - 20, y], [x + 20, y], [x, y + 40]], col);
      }),
    ],
  }),
  stationInside: () => ({ ground: G.floor('#90A4AE'), far: [R('tuong-tram', 0, 0, 600, 450, 0, '#CFD8DC'), C('cua-so-tron-tram', 470, 150, 80, '#243B6B'), star('sao-cua-so-tram', 460, 140, 14, 6, '#FFE066'), R('bang-dieu-khien', 20, 300, 160, 150, 8, '#607D8B'), C('nut-1', 60, 340, 10, '#FF5F5F'), C('nut-2', 100, 340, 10, '#4CD787'), C('nut-3', 140, 340, 10, '#FFD54F')] }),
  // Đêm & vũ trụ
  nightCity: () => ({ ground: G.flat('#37474F'), far: [...building('toa-dem-1', 0, 120, 280, '#263238', '#FFE066'), ...building('toa-dem-2', 460, 140, 320, '#37474F', '#FFE066')] }),
  starField: () => ({ ground: G.hill('#2F6B3F'), far: [C('den-dom-1', 90, 420, 6, '#FFE066'), C('den-dom-2', 520, 400, 6, '#FFE066')] }),
  aurora: () => ({ ground: G.hill('#E3F2FD'), far: [D('cuc-quang-1', 'M 0 160 Q 150 60 300 160 Q 450 260 600 150 L 600 200 Q 450 300 300 200 Q 150 100 0 210 Z', '#4CD787'), D('cuc-quang-2', 'M 0 230 Q 200 150 360 240 Q 480 300 600 230 L 600 260 Q 480 330 360 270 Q 200 180 0 260 Z', '#7DE2FF')] }),
  moonSurface: () => ({ ground: G.flat('#B7BCC6'), far: [C('hanh-tinh-xa', 510, 110, 44, '#4FA3E0'), E('luc-dia-xa', 500, 100, 18, 12, '#4CD787')], near: [E('ho-trang-1', 90, 520, 50, 12, '#9AA1AD'), E('ho-trang-2', 480, 550, 40, 10, '#9AA1AD')] }),
  marsDesert: () => ({ ground: G.dune('#D9784A'), far: [P('nui-hoa-1', [[-20, 470], [100, 330], [220, 470]], '#B85C38'), P('nui-hoa-2', [[400, 470], [520, 350], [640, 470]], '#C0683F')], near: [E('da-do-1', 80, 540, 30, 14, '#A0522D'), E('da-do-2', 520, 530, 24, 12, '#A0522D')] }),
  nebula: () => ({ ground: G.flat('#5E548E'), far: [E('tinh-van-1', 150, 160, 180, 70, '#9F86C0', -15), E('tinh-van-2', 460, 220, 150, 60, '#E0B1CB', 20)] }),
  asteroidBelt: () => ({ ground: G.flat('#7B7F8C'), far: [0, 1, 2, 3, 4, 5].map((k) => E(`da-vanh-dai-${k + 1}`, 40 + k * 104, 180 + (k % 2) * 40, 22 - (k % 3) * 4, 14, '#A89F94', k * 20)) }),
  ringPlanet: () => ({ ground: G.flat('#9FA8DA'), far: [E('vanh-sau-xa', 150, 150, 120, 26, '#FFE0B5', -15), C('hanh-tinh-vanh', 150, 150, 56, '#FFB74D')] }),
  galaxy: () => ({ ground: G.flat('#3949AB'), far: [E('canh-thien-ha-1', 150, 170, 130, 34, '#B39DDB', -25), E('canh-thien-ha-2', 150, 170, 90, 22, '#D1C4E9', 20), C('loi-thien-ha', 150, 170, 20, '#FFF3B0')] }),
  alienJungle: () => ({ ground: G.hill('#26A69A'), far: [C('nam-la-1', 70, 360, 50, '#F06292'), R('than-nam-la-1', 60, 400, 20, 70, 6, '#B2DFDB'), C('nam-la-2', 530, 340, 60, '#BA68C8'), R('than-nam-la-2', 518, 390, 24, 80, 6, '#B2DFDB')] }),
};

const INDOOR = ['kitchen', 'classroom', 'stage', 'palaceHall', 'library', 'bedroom', 'workshop', 'gym', 'stationInside'];
const WALLS = { day: '#E3F2FD', morning: '#FFF3D6', sunset: '#FFE0CC', dusk: '#E1D5F2', night: '#3E3B6E', mint: '#DDF5EC', pink: '#FFE6EE', storm: '#DDE3E8', deep: '#2B2D42', space: '#CFD8DC', nebula: '#D1C4E9', alien: '#B2DFDB' };
const CURTAINS = { day: '#E74C3C', morning: '#FF9F43', sunset: '#C0392B', dusk: '#7D5FFF', night: '#8E24AA', pink: '#FF7AA2', mint: '#26A69A' };

/** Tạo lớp nền cho 1 tranh: màu trời + trang trí trời + khung cảnh. */
export function buildBackground(setting, pal, side = 1) {
  const s = SETTINGS[setting];
  if (!s) throw new Error(`Không có khung cảnh: ${setting}`);
  const parts = s();
  const indoor = INDOOR.includes(setting);
  // Trong nhà: màu tường (và màn sân khấu) đổi theo "màu trời" để mỗi tranh vẫn khác nhau.
  if (indoor && setting !== 'stage' && WALLS[pal]) parts.far[0].color = WALLS[pal];
  if (setting === 'stage' && CURTAINS[pal]) parts.far[1].color = parts.far[2].color = CURTAINS[pal];
  return {
    skyColor: SKIES[pal],
    skyItems: indoor ? [] : skyDecor(pal, side),
    ground: parts.ground,
    far: parts.far || [],
    near: parts.near || [],
    fg: parts.fg || [],
  };
}
