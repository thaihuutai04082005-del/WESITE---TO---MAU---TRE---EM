// Tầng 3: biến thể tư thế / cảm xúc / hoạt động, và 4 cấp thẻ Gacha (C/B/A/S).
// Mỗi biến thể = biểu cảm khuôn mặt + cảnh nền + (tuỳ chọn) biến đổi tư thế của chủ thể.
import { E, C, R, P, D, deco, line, star, heart, cloud, drop, arcBand, smallFlower, butterfly } from './shapes.mjs';

const V = (slug, vi, en, opts) => ({ slug, name: { vi, en }, ...opts });

export const THEME_VARIANTS = {
  'dong-vat': [
    V('vui-ve', 'vui vẻ', 'happy', { expr: 'happy', scene: ['sun', 'clouds'] }),
    V('tuc-gian', 'tức giận', 'angry', { expr: 'angry', scene: ['stormCloud'] }),
    V('ngu-ngon', 'ngủ ngon', 'sleeping', { expr: 'sleep', scene: ['night', 'zzz'] }),
    V('le-luoi', 'thè lưỡi tinh nghịch', 'playful tongue', { expr: 'tongue', scene: ['clouds', 'flowers', 'butterfly'] }),
    V('chay-nhay', 'chạy nhảy', 'jumping', {
      expr: 'happy',
      scene: ['sun', 'motion', 'shadow'],
      transform: { ty: -48, rot: -7, px: 300, py: 400 },
    }),
  ],
  'xe-co': [
    V('vui-ve', 'vui vẻ', 'happy', { expr: 'happy', scene: ['sun', 'clouds'] }),
    V('chay-nhanh', 'chạy nhanh', 'speeding', { expr: 'happy', scene: ['clouds', 'speed'], transform: { rot: -3, px: 300, py: 450 } }),
    V('ban-dem', 'ban đêm', 'at night', { expr: 'happy', scene: ['night'] }),
    V('troi-mua', 'trời mưa', 'in the rain', { expr: 'surprised', scene: ['rain'] }),
    V('nghi-ngoi', 'nghỉ ngơi', 'resting', { expr: 'sleep', scene: ['sunset', 'zzz'] }),
  ],
  'thien-nhien': [
    V('vui-ve', 'vui vẻ', 'happy', { expr: 'happy', scene: ['sun', 'clouds'] }),
    V('ngu-ngon', 'ngủ ngon', 'sleeping', { expr: 'sleep', scene: ['night', 'zzz'] }),
    V('troi-mua', 'trời mưa', 'in the rain', { expr: 'surprised', scene: ['rain'] }),
    V('co-buom', 'có bướm bay', 'with butterflies', { expr: 'tongue', scene: ['sun', 'butterfly', 'flowers'] }),
    V('dung-dua', 'đung đưa trong gió', 'swaying in the wind', {
      expr: 'happy',
      scene: ['clouds', 'wind'],
      transform: { rot: 5, px: 300, py: 480 },
    }),
  ],
  'trai-cay': [
    V('vui-ve', 'vui vẻ', 'happy', { expr: 'happy', scene: ['sun', 'clouds'] }),
    V('ngac-nhien', 'ngạc nhiên', 'surprised', { expr: 'surprised', scene: ['clouds', 'flowers'] }),
    V('ngu-ngon', 'ngủ ngon', 'sleeping', { expr: 'sleep', scene: ['night', 'zzz'] }),
    V('tinh-nghich', 'tinh nghịch', 'cheeky', { expr: 'tongue', scene: ['sun', 'butterfly'] }),
    V('nhay-mua', 'nhảy múa', 'dancing', { expr: 'happy', scene: ['sun', 'motion', 'shadow'], transform: { ty: -40, rot: 8, px: 300, py: 400 } }),
  ],
  'nha-cua': [
    V('ban-ngay', 'ban ngày', 'daytime', { expr: null, scene: ['sun', 'clouds'] }),
    V('ban-dem', 'ban đêm', 'at night', { expr: null, scene: ['night'] }),
    V('troi-mua', 'trời mưa', 'rainy day', { expr: null, scene: ['rain'] }),
    V('mua-dong', 'mùa đông', 'winter', { expr: null, scene: ['snow', 'snowman'] }),
    V('mua-xuan', 'mùa xuân', 'spring', { expr: null, scene: ['sun', 'flowers', 'butterfly'] }),
  ],
};

/** Biến thể thẻ Gacha: tranh mở rộng, càng hiếm càng nhiều chi tiết. */
export const CARD_VARIANTS = [
  V('the-c-doi-mu', 'đội mũ tiệc', 'party hat', { rarity: 'C', expr: 'happy', scene: ['sun', 'clouds', 'hat'] }),
  V('the-b-bong-bay', 'với bóng bay', 'with balloons', { rarity: 'B', expr: 'happy', scene: ['clouds', 'balloons', 'hat', 'confetti'] }),
  V('the-a-cau-vong', 'dưới cầu vồng', 'under the rainbow', {
    rarity: 'A',
    expr: 'tongue',
    scene: ['rainbow', 'clouds', 'stars', 'flowers', 'butterfly'],
  }),
  V('the-s-vuong-mien', 'vương miện hoàng gia', 'royal crown', {
    rarity: 'S',
    expr: 'happy',
    scene: ['rainbow', 'stars', 'crown', 'balloons', 'hearts', 'confetti', 'flowers'],
  }),
];

// ----------------- Cảnh nền -----------------

export const SKY = { day: '#BDE6FF', night: '#2C3E74', sunset: '#FFD3A5', rain: '#A9C4D6', snow: '#CFE3F2' };
export const GROUND = { grass: '#8BD17C', night: '#2F6B3F', snow: '#E3F2FD', water: '#5DADE2', waterNight: '#1F4E79' };

export function groundItem(kind, color) {
  if (kind === 'water') {
    return D('mat-nuoc', 'M 0 440 Q 75 425 150 440 Q 225 455 300 440 Q 375 425 450 440 Q 525 455 600 440 L 600 600 L 0 600 Z', color);
  }
  return D('nen-dat', 'M 0 470 Q 150 440 300 465 Q 450 490 600 455 L 600 600 L 0 600 Z', color);
}

export function sceneParts(names, obj) {
  const back = [];
  const mid = [];
  const front = [];
  const subjectExtra = [];
  const has = (n) => names.includes(n);
  const hat = obj.hat;

  if (has('rainbow')) {
    ['#FF5F5F', '#FF9F43', '#FFD54F', '#4CD787', '#4FA3E0', '#7D5FFF'].forEach((c, k) =>
      back.push(arcBand(`cau-vong-${k + 1}`, 300, 470, 290 - 16 * k, 274 - 16 * k, c)),
    );
  }
  if (has('sun')) {
    back.push(star('tia-nang', 510, 92, 72, 50, '#FFB74D', 12));
    back.push(C('mat-troi', 510, 92, 42, '#FFD54F'));
  }
  if (has('night')) {
    back.push(D('mat-trang', 'M 490 50 C 412 56 412 164 490 170 C 452 146 452 76 490 50 Z', '#FFE066'));
    [[80, 70], [190, 130], [350, 60], [560, 230], [50, 240]].forEach(([x, y], k) =>
      back.push(star(`ngoi-sao-${k + 1}`, x, y, 15, 7, '#FFE066')),
    );
  }
  if (has('stars')) {
    [[70, 90], [540, 70], [520, 240], [90, 260]].forEach(([x, y], k) => back.push(star(`sao-lap-lanh-${k + 1}`, x, y, 17, 8, '#FFD700')));
  }
  if (has('clouds')) {
    back.push(cloud('may-1', 110, 110, 0.75));
    back.push(cloud('may-2', 330, 70, 0.6));
  }
  if (has('stormCloud')) {
    back.push(cloud('may-den', 470, 110, 0.9, '#90A4AE'));
    back.push(P('tia-set', [[470, 150], [448, 200], [468, 200], [452, 245], [492, 190], [472, 190], [486, 150]], '#FFD54F'));
    back.push(cloud('may-1', 120, 90, 0.6));
  }
  if (has('rain')) {
    back.push(cloud('may-mua-1', 140, 100, 0.95, '#B0BEC5'));
    back.push(cloud('may-mua-2', 460, 90, 0.95, '#B0BEC5'));
    [[70, 190], [130, 230], [200, 185], [400, 180], [470, 225], [540, 185], [100, 300], [510, 310]].forEach(([x, y], k) =>
      front.push(drop(`giot-mua-${k + 1}`, x, y, 1)),
    );
    mid.push(E('vung-nuoc', 480, 535, 70, 16, '#5DADE2'));
  }
  if (has('snow')) {
    [[60, 80], [150, 150], [250, 60], [360, 120], [470, 60], [550, 150], [80, 250], [520, 280], [420, 220], [180, 260]].forEach(
      ([x, y], k) => front.push(C(`bong-tuyet-${k + 1}`, x, y, 8, '#FFFFFF')),
    );
  }
  if (has('flowers')) {
    const petals = ['#FF7AA2', '#7D5FFF', '#FF9F43', '#4FA3E0'];
    [[70, 515], [150, 548], [455, 548], [535, 512]].forEach(([x, y], k) => mid.push(...smallFlower(`hoa-nho-${k + 1}`, x, y, petals[k])));
  }
  if (has('shadow')) mid.push(E('bong-do', 300, 505, 100, 16, '#6FB36A'));
  if (has('snowman')) {
    mid.push(
      C('nguoi-tuyet-duoi', 80, 478, 38, '#FFFFFF'),
      C('nguoi-tuyet-tren', 80, 418, 26, '#FFFFFF'),
      R('mu-nguoi-tuyet', 63, 372, 34, 26, 3, '#2F3640'),
      R('vanh-mu', 54, 394, 52, 8, 3, '#2F3640'),
      P('mui-ca-rot', [[80, 420], [106, 426], [80, 430]], '#FF8A65'),
      deco('<circle cx="72" cy="410" r="3" fill="#1B2A38"/><circle cx="88" cy="410" r="3" fill="#1B2A38"/>'),
    );
  }
  if (has('butterfly')) front.push(...butterfly('buom', 95, 330, 1.1), ...butterfly('buom-nho', 510, 300, 0.8));
  if (has('balloons')) {
    front.push(
      line('M 90 190 Q 100 280 80 380 M 150 150 Q 140 260 150 360 M 515 175 Q 505 270 525 380', 2),
      E('bong-bay-1', 90, 150, 32, 40, '#FF5F7E'),
      E('bong-bay-2', 150, 108, 28, 36, '#4FA3E0'),
      E('bong-bay-3', 515, 135, 32, 40, '#FFC94D'),
    );
  }
  if (has('hearts')) {
    [[60, 380], [545, 360], [240, 90]].forEach(([x, y], k) => front.push(heart(`trai-tim-${k + 1}`, x, y, 1.1, '#FF5F7E')));
  }
  if (has('confetti')) {
    const cs = ['#FF5F7E', '#4CD787', '#7D5FFF', '#FF9F43', '#4FA3E0', '#FFD54F'];
    [[40, 40], [220, 40], [400, 30], [580, 40], [30, 440], [575, 450]].forEach(([x, y], k) =>
      front.push(R(`hoa-giay-${k + 1}`, x - 7, y - 4, 14, 8, 2, cs[k])),
    );
  }
  if (has('motion')) front.push(line('M 110 280 L 60 280 M 120 330 L 50 330 M 110 380 L 60 380 M 490 300 L 540 300 M 495 350 L 555 350', 5));
  if (has('speed')) {
    front.push(line('M 100 300 L 30 300 M 90 350 L 10 350 M 100 400 L 40 400', 6));
    mid.push(C('bui-1', 110, 455, 18, '#D6DEE6'), C('bui-2', 80, 440, 13, '#D6DEE6'), C('bui-3', 60, 462, 10, '#D6DEE6'));
  }
  if (has('wind')) {
    front.push(line('M 40 200 Q 90 180 140 200 Q 170 212 160 230 M 460 150 Q 510 130 560 150 M 480 260 Q 530 240 580 260', 4));
    front.push(E('la-bay-1', 520, 200, 12, 7, '#4CAF50', 30), E('la-bay-2', 90, 150, 12, 7, '#4CAF50', -20));
  }
  if (has('zzz') && hat) {
    subjectExtra.push(
      deco(
        `<text x="${hat.x + 70}" y="${hat.y - 10}" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="40" fill="#1B2A38" pointer-events="none">Z<tspan font-size="30" dy="-18">z</tspan><tspan font-size="22" dy="-14">z</tspan></text>`,
      ),
    );
  }
  if (has('hat') && hat) {
    const { x, y, s } = hat;
    subjectExtra.push(
      P('mu-tiec', [[x - 36 * s, y + 6 * s], [x, y - 82 * s], [x + 36 * s, y + 6 * s]], '#7D5FFF'),
      P('soc-mu', [[x - 22 * s, y - 28 * s], [x + 22 * s, y - 28 * s], [x + 14 * s, y - 48 * s], [x - 14 * s, y - 48 * s]], '#FFD54F'),
      C('bong-mu', x, y - 84 * s, 11 * s, '#FF5F7E'),
    );
  }
  if (has('crown') && hat) {
    const { x, y, s } = hat;
    subjectExtra.push(
      P(
        'vuong-mien',
        [[x - 48 * s, y + 6 * s], [x - 54 * s, y - 50 * s], [x - 26 * s, y - 22 * s], [x, y - 64 * s], [x + 26 * s, y - 22 * s], [x + 54 * s, y - 50 * s], [x + 48 * s, y + 6 * s]],
        '#FFD700',
      ),
      C('ngoc-giua', x, y - 14 * s, 9 * s, '#FF5F7E'),
      C('ngoc-trai', x - 30 * s, y - 6 * s, 7 * s, '#4FA3E0'),
      C('ngoc-phai', x + 30 * s, y - 6 * s, 7 * s, '#4CD787'),
    );
  }
  return { back, mid, front, subjectExtra };
}
