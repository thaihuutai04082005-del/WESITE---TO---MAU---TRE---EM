// 25 đối tượng khởi điểm (5 chủ đề × 5 đối tượng). Mỗi đối tượng tự vẽ các vùng của mình
// trong khung 600×600, chủ thể nằm quanh giữa, đáy khoảng y≈480.
import { E, C, R, P, D, line, dot, mirrorX, cloud, arcBand, halfDisk } from './shapes.mjs';

export const THEMES = [
  { slug: 'dong-vat', name: { vi: 'Động vật', en: 'Animals' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'xe-co', name: { vi: 'Xe cộ', en: 'Vehicles' }, faceStyle: 'face', animation: 'drive' },
  { slug: 'thien-nhien', name: { vi: 'Thiên nhiên', en: 'Nature' }, faceStyle: 'face', animation: 'sway' },
  { slug: 'trai-cay', name: { vi: 'Trái cây', en: 'Fruits' }, faceStyle: 'face', animation: 'float' },
  { slug: 'nha-cua', name: { vi: 'Nhà cửa', en: 'Houses' }, faceStyle: 'none', animation: 'wiggle' },
];

const O = (theme, slug, vi, en, opts) => ({ theme, slug, name: { vi, en }, ...opts });

export const OBJECTS = [
  // ================= ĐỘNG VẬT =================
  O('dong-vat', 'meo', 'Mèo', 'Cat', {
    face: { x: 300, y: 245, s: 1 },
    hat: { x: 300, y: 180, s: 0.9 },
    build: () => [
      D('duoi', 'M 380 440 C 470 440 485 350 445 318 C 434 310 420 322 428 334 C 452 366 440 418 380 418 Z', '#F4A340'),
      E('than', 300, 410, 90, 75, '#F4A340'),
      E('bung', 300, 425, 52, 48, '#FFE0B5'),
      E('chan-trai', 262, 478, 26, 16, '#FFE0B5'),
      E('chan-phai', 338, 478, 26, 16, '#FFE0B5'),
      P('tai-trai', [[226, 222], [236, 140], [288, 188]], '#F4A340'),
      P('trong-tai-trai', [[240, 204], [245, 162], [272, 190]], '#FFB3C1'),
      P('tai-phai', mirrorX([[226, 222], [236, 140], [288, 188]]), '#F4A340'),
      P('trong-tai-phai', mirrorX([[240, 204], [245, 162], [272, 190]]), '#FFB3C1'),
      C('dau', 300, 255, 80, '#F4A340'),
      D('soc-tran', 'M 278 180 L 300 208 L 322 180 Q 300 174 278 180 Z', '#D9822B'),
      E('mom', 300, 282, 32, 22, '#FFE0B5'),
      P('mui', [[292, 258], [308, 258], [300, 267]], '#FF8FA3'),
      line('M 250 282 L 205 274 M 250 292 L 205 296 M 350 282 L 395 274 M 350 292 L 395 296', 3),
    ],
  }),
  O('dong-vat', 'cho', 'Chó', 'Dog', {
    face: { x: 300, y: 242, s: 1 },
    hat: { x: 300, y: 176, s: 0.9 },
    build: () => [
      D('duoi', 'M 385 420 Q 450 400 455 340 Q 470 345 468 360 Q 462 420 390 445 Z', '#C68B59'),
      E('than', 300, 412, 92, 75, '#C68B59'),
      E('dom-than', 345, 392, 28, 22, '#8B5A2B'),
      E('bung', 300, 430, 50, 42, '#F3D9B1'),
      E('chan-trai', 262, 480, 26, 16, '#F3D9B1'),
      E('chan-phai', 338, 480, 26, 16, '#F3D9B1'),
      E('dau', 300, 250, 85, 78, '#C68B59'),
      D('tai-trai', 'M 232 205 C 190 200 175 270 200 310 C 215 325 240 300 242 270 Z', '#8B5A2B'),
      D('tai-phai', 'M 368 205 C 410 200 425 270 400 310 C 385 325 360 300 358 270 Z', '#8B5A2B'),
      E('dom-mat', 328, 240, 22, 20, '#8B5A2B'),
      E('mom', 300, 285, 38, 26, '#F3D9B1'),
      E('mui', 300, 263, 13, 9, '#3B2A20'),
    ],
  }),
  O('dong-vat', 'tho', 'Thỏ', 'Rabbit', {
    face: { x: 300, y: 250, s: 1 },
    hat: { x: 300, y: 186, s: 0.85 },
    build: () => [
      E('tai-trai', 262, 140, 24, 70, '#D9D9E8', -10),
      E('trong-tai-trai', 262, 146, 12, 50, '#FFB3C1', -10),
      E('tai-phai', 338, 140, 24, 70, '#D9D9E8', 10),
      E('trong-tai-phai', 338, 146, 12, 50, '#FFB3C1', 10),
      C('duoi', 382, 440, 24, '#F5F5FA'),
      E('than', 300, 415, 85, 75, '#D9D9E8'),
      E('bung', 300, 430, 48, 42, '#FFE4EC'),
      E('chan-trai', 262, 482, 26, 15, '#D9D9E8'),
      E('chan-phai', 338, 482, 26, 15, '#D9D9E8'),
      C('dau', 300, 258, 78, '#D9D9E8'),
      P('mui', [[293, 266], [307, 266], [300, 274]], '#FF8FA3'),
    ],
  }),
  O('dong-vat', 'voi', 'Voi', 'Elephant', {
    face: { x: 300, y: 236, s: 0.9 },
    hat: { x: 300, y: 184, s: 0.9 },
    build: () => [
      E('tai-trai', 205, 250, 70, 85, '#9DB4C8', -10),
      E('trong-tai-trai', 212, 256, 44, 58, '#F2B8C6', -10),
      E('tai-phai', 395, 250, 70, 85, '#9DB4C8', 10),
      E('trong-tai-phai', 388, 256, 44, 58, '#F2B8C6', 10),
      E('than', 300, 420, 100, 70, '#8FA8BF'),
      R('chan-trai', 232, 440, 46, 55, 14, '#8FA8BF'),
      R('chan-phai', 322, 440, 46, 55, 14, '#8FA8BF'),
      E('dau', 300, 258, 85, 80, '#8FA8BF'),
      D('voi', 'M 282 282 L 318 282 C 322 350 310 395 268 400 C 252 402 250 384 264 380 C 286 374 288 340 282 282 Z', '#8FA8BF'),
      P('nga-trai', [[270, 292], [282, 296], [262, 318]], '#FFF6E0'),
      P('nga-phai', [[330, 292], [318, 296], [338, 318]], '#FFF6E0'),
    ],
  }),
  O('dong-vat', 'gau', 'Gấu', 'Bear', {
    face: { x: 300, y: 244, s: 1 },
    hat: { x: 300, y: 176, s: 0.9 },
    build: () => [
      C('tai-trai', 235, 185, 30, '#A0673A'),
      C('trong-tai-trai', 235, 185, 16, '#E8B98C'),
      C('tai-phai', 365, 185, 30, '#A0673A'),
      C('trong-tai-phai', 365, 185, 16, '#E8B98C'),
      E('than', 300, 415, 95, 78, '#A0673A'),
      E('bung', 300, 425, 55, 48, '#E8B98C'),
      E('tay-trai', 215, 400, 24, 45, '#8A5530', 20),
      E('tay-phai', 385, 400, 24, 45, '#8A5530', -20),
      E('chan-trai', 255, 482, 30, 18, '#8A5530'),
      E('dem-chan-trai', 255, 482, 14, 9, '#E8B98C'),
      E('chan-phai', 345, 482, 30, 18, '#8A5530'),
      E('dem-chan-phai', 345, 482, 14, 9, '#E8B98C'),
      C('dau', 300, 255, 82, '#A0673A'),
      E('mom', 300, 284, 34, 26, '#E8B98C'),
      E('mui', 300, 266, 13, 9, '#3B2A20'),
    ],
  }),

  // ================= XE CỘ =================
  O('xe-co', 'o-to', 'Ô tô', 'Car', {
    face: { x: 372, y: 308, s: 0.5 },
    hat: { x: 330, y: 270, s: 0.8 },
    glow: ['den-truoc'],
    build: () => [
      D(
        'than-xe',
        'M 130 430 L 130 380 Q 135 350 170 345 L 220 340 L 260 280 Q 270 268 290 268 L 380 268 Q 400 268 412 282 L 450 335 L 480 342 Q 500 348 500 372 L 500 430 Q 500 440 490 440 L 140 440 Q 130 440 130 430 Z',
        '#E74C3C',
      ),
      D('kinh-sau', 'M 300 285 L 300 338 L 238 338 L 268 294 Q 274 285 285 285 Z', '#BDE6FF'),
      D('kinh-truoc', 'M 318 285 L 378 285 Q 390 285 398 296 L 428 338 L 318 338 Z', '#BDE6FF'),
      line('M 309 285 L 309 430', 3),
      R('tay-nam', 320, 356, 26, 8, 4, '#BFC8D0'),
      E('den-truoc', 488, 372, 10, 14, '#FFE066'),
      R('den-sau', 128, 366, 12, 24, 4, '#FF8A65'),
      R('can-truoc', 470, 418, 40, 16, 7, '#BFC8D0'),
      R('can-sau', 120, 418, 40, 16, 7, '#BFC8D0'),
      C('banh-sau', 205, 440, 42, '#2F3640'),
      C('mam-sau', 205, 440, 18, '#BFC8D0'),
      C('banh-truoc', 420, 440, 42, '#2F3640'),
      C('mam-truoc', 420, 440, 18, '#BFC8D0'),
    ],
  }),
  O('xe-co', 'xe-buyt', 'Xe buýt', 'Bus', {
    face: { x: 432, y: 312, s: 0.5 },
    hat: { x: 300, y: 252, s: 0.9 },
    glow: ['den-truoc'],
    build: () => [
      R('than-xe', 110, 250, 380, 190, 30, '#FFC94D'),
      R('soc', 110, 375, 380, 24, 0, '#FF8A65'),
      R('cua-so-1', 135, 280, 70, 65, 10, '#BDE6FF'),
      R('cua-so-2', 220, 280, 70, 65, 10, '#BDE6FF'),
      R('cua-so-3', 305, 280, 70, 65, 10, '#BDE6FF'),
      R('kinh-lai', 390, 275, 85, 90, 14, '#BDE6FF'),
      C('den-truoc', 476, 414, 10, '#FFE066'),
      R('bien-so', 180, 406, 60, 22, 6, '#FFFFFF'),
      C('banh-sau', 190, 440, 40, '#2F3640'),
      C('mam-sau', 190, 440, 17, '#BFC8D0'),
      C('banh-truoc', 410, 440, 40, '#2F3640'),
      C('mam-truoc', 410, 440, 17, '#BFC8D0'),
    ],
  }),
  O('xe-co', 'may-bay', 'Máy bay', 'Airplane', {
    face: { x: 405, y: 312, s: 0.45 },
    hat: { x: 330, y: 278, s: 0.8 },
    animation: 'fly',
    build: () => [
      P('duoi-dung', [[120, 300], [150, 212], [192, 212], [205, 300]], '#4FA3E0'),
      P('canh-sau', [[330, 300], [372, 300], [338, 250], [312, 250]], '#2B7CC4'),
      D('than-may-bay', 'M 120 300 Q 110 330 140 345 L 420 345 Q 490 340 495 312 Q 490 280 420 275 L 160 275 Q 125 280 120 300 Z', '#E3F0FF'),
      P('canh', [[255, 320], [350, 320], [305, 415], [252, 415]], '#4FA3E0'),
      C('cua-so-1', 190, 300, 11, '#BDE6FF'),
      C('cua-so-2', 225, 300, 11, '#BDE6FF'),
      C('cua-so-3', 260, 300, 11, '#BDE6FF'),
      C('cua-so-4', 295, 300, 11, '#BDE6FF'),
      D('kinh-lai', 'M 440 284 Q 468 288 480 304 L 440 304 Z', '#BDE6FF'),
      E('canh-quat-tren', 502, 286, 6, 22, '#BFC8D0'),
      E('canh-quat-duoi', 502, 338, 6, 22, '#BFC8D0'),
      C('mui-may-bay', 496, 312, 11, '#FF8A65'),
    ],
  }),
  O('xe-co', 'tau-thuy', 'Tàu thủy', 'Ship', {
    face: { x: 300, y: 416, s: 0.55 },
    hat: { x: 300, y: 292, s: 0.9 },
    ground: 'water',
    animation: 'bob',
    glow: ['o-tron-1', 'o-tron-2', 'o-tron-3'],
    build: () => [
      C('khoi-1', 348, 196, 14, '#D6DEE6'),
      C('khoi-2', 368, 168, 18, '#D6DEE6'),
      C('khoi-3', 396, 140, 22, '#D6DEE6'),
      R('ong-khoi', 320, 215, 40, 80, 6, '#FFC94D'),
      R('soc-ong-khoi', 320, 234, 40, 14, 0, '#E74C3C'),
      R('khoang', 200, 300, 200, 82, 10, '#FDF6E3'),
      R('mai-khoang', 190, 290, 220, 16, 6, '#4FA3E0'),
      C('o-tron-1', 240, 340, 14, '#BDE6FF'),
      C('o-tron-2', 300, 340, 14, '#BDE6FF'),
      C('o-tron-3', 360, 340, 14, '#BDE6FF'),
      D('than-tau', 'M 120 380 L 480 380 L 435 462 L 165 462 Z', '#E74C3C'),
      P('soc-than', [[131, 392], [469, 392], [462, 405], [138, 405]], '#FDF6E3'),
    ],
  }),
  O('xe-co', 'tau-hoa', 'Tàu hỏa', 'Train', {
    face: { x: 232, y: 362, s: 0.6 },
    hat: { x: 390, y: 238, s: 0.8 },
    glow: ['cua-so-lai'],
    build: () => [
      C('khoi-1', 206, 215, 16, '#D6DEE6'),
      C('khoi-2', 228, 188, 20, '#D6DEE6'),
      C('khoi-3', 258, 162, 25, '#D6DEE6'),
      R('buong-lai', 330, 250, 120, 170, 12, '#E74C3C'),
      R('mai-buong-lai', 318, 236, 144, 24, 8, '#2F3640'),
      R('cua-so-lai', 350, 275, 80, 65, 10, '#BDE6FF'),
      D('ong-khoi', 'M 185 322 L 180 252 L 230 252 L 225 322 Z', '#2F3640'),
      R('mieng-ong-khoi', 170, 238, 70, 18, 6, '#FFC94D'),
      R('noi-hoi', 150, 318, 190, 102, 20, '#4FA3E0'),
      R('gam', 130, 410, 330, 26, 8, '#2F3640'),
      P('can-gat', [[150, 420], [104, 466], [150, 466]], '#FFC94D'),
      C('banh-1', 190, 452, 32, '#FF8A65'),
      C('truc-1', 190, 452, 12, '#FFE066'),
      C('banh-2', 275, 452, 32, '#FF8A65'),
      C('truc-2', 275, 452, 12, '#FFE066'),
      C('banh-3', 395, 448, 38, '#FF8A65'),
      C('truc-3', 395, 448, 14, '#FFE066'),
    ],
  }),

  // ================= THIÊN NHIÊN =================
  O('thien-nhien', 'hoa', 'Hoa', 'Flower', {
    face: { x: 300, y: 212, s: 0.55 },
    hat: { x: 300, y: 112, s: 0.8 },
    build: () => {
      const items = [
        R('than-hoa', 290, 260, 20, 190, 8, '#4CAF50'),
        D('la-trai', 'M 292 410 C 240 370 210 390 198 412 C 230 432 270 432 292 422 Z', '#6CCB5F'),
        D('la-phai', 'M 308 372 C 360 332 390 352 402 374 C 370 394 330 394 308 384 Z', '#6CCB5F'),
        P('chau', [[235, 452], [365, 452], [350, 512], [250, 512]], '#E07A5F'),
        R('mieng-chau', 222, 438, 156, 24, 9, '#F2A07B'),
      ];
      for (let k = 0; k < 6; k++) {
        const a = ((k * 60 - 90) * Math.PI) / 180;
        items.push(E(`canh-hoa-${k + 1}`, 300 + 62 * Math.cos(a), 220 + 62 * Math.sin(a), 32, 46, k % 2 ? '#FF9EC0' : '#FF7AA2', k * 60));
      }
      items.push(C('nhuy-hoa', 300, 220, 46, '#FFD54F'));
      return items;
    },
  }),
  O('thien-nhien', 'cay', 'Cây', 'Tree', {
    face: { x: 300, y: 228, s: 0.7 },
    hat: { x: 300, y: 114, s: 0.9 },
    build: () => [
      D('than-cay', 'M 268 482 L 280 330 L 320 330 L 332 482 Q 300 492 268 482 Z', '#8B5A2B'),
      E('hoc-cay', 300, 420, 12, 18, '#5C3A1E'),
      C('tan-la-trai', 225, 262, 70, '#43A047'),
      C('tan-la-phai', 375, 262, 70, '#43A047'),
      C('tan-la-duoi', 300, 305, 78, '#57B05A'),
      C('tan-la-tren', 300, 205, 92, '#4CAF50'),
      C('qua-1', 222, 250, 13, '#E74C3C'),
      C('qua-2', 370, 190, 13, '#E74C3C'),
      C('qua-3', 385, 292, 13, '#E74C3C'),
      C('qua-4', 250, 318, 13, '#E74C3C'),
    ],
  }),
  O('thien-nhien', 'nui', 'Núi', 'Mountain', {
    face: { x: 262, y: 348, s: 0.8 },
    hat: { x: 260, y: 164, s: 0.8 },
    build: () => [
      P('nui-sau', [[330, 472], [432, 228], [545, 472]], '#7FA7C9'),
      P('tuyet-nui-sau', [[432, 228], [402, 300], [420, 290], [434, 306], [448, 290], [462, 300]], '#EAF6FF'),
      P('nui-chinh', [[70, 472], [260, 160], [455, 472]], '#8DA3B5'),
      P('tuyet-nui-chinh', [[260, 160], [214, 236], [238, 222], [258, 244], [282, 220], [306, 236]], '#EAF6FF'),
      R('than-thong', 492, 440, 12, 34, 3, '#8B5A2B'),
      P('la-thong', [[466, 446], [498, 360], [530, 446]], '#4CAF50'),
    ],
  }),
  O('thien-nhien', 'nam', 'Nấm', 'Mushroom', {
    face: { x: 300, y: 390, s: 0.6 },
    hat: { x: 300, y: 178, s: 0.9 },
    build: () => [
      D('than-nam', 'M 255 470 Q 250 380 270 330 L 330 330 Q 350 380 345 470 Q 300 482 255 470 Z', '#F3E3C3'),
      D('mu-nam', 'M 150 330 Q 160 190 300 175 Q 440 190 450 330 Q 300 350 150 330 Z', '#E74C3C'),
      C('cham-1', 215, 280, 18, '#FFF7E6'),
      C('cham-2', 300, 225, 24, '#FFF7E6'),
      C('cham-3', 385, 280, 18, '#FFF7E6'),
      C('cham-4', 345, 305, 11, '#FFF7E6'),
      C('cham-5', 255, 305, 11, '#FFF7E6'),
    ],
  }),
  O('thien-nhien', 'cau-vong', 'Cầu vồng', 'Rainbow', {
    face: { x: 170, y: 430, s: 0.5 },
    hat: { x: 300, y: 192, s: 0.9 },
    build: () => {
      const colors = ['#FF5F5F', '#FF9F43', '#FFD54F', '#4CD787', '#4FA3E0', '#7D5FFF'];
      const items = colors.map((c, k) => arcBand(`dai-mau-${k + 1}`, 300, 440, 240 - 22 * k, 218 - 22 * k, c));
      items.push(cloud('may-trai', 170, 448, 1.05), cloud('may-phai', 430, 448, 1.05));
      return items;
    },
  }),

  // ================= TRÁI CÂY =================
  O('trai-cay', 'tao', 'Táo', 'Apple', {
    face: { x: 300, y: 318, s: 0.8 },
    hat: { x: 300, y: 212, s: 0.8 },
    build: () => [
      D(
        'qua-tao',
        'M 300 215 C 250 180 170 200 170 290 C 170 380 230 450 270 450 C 285 450 290 442 300 442 C 310 442 315 450 330 450 C 370 450 430 380 430 290 C 430 200 350 180 300 215 Z',
        '#E74C3C',
      ),
      E('bong-sang', 218, 282, 15, 30, '#FF8A80', 20),
      D('cuong', 'M 296 220 Q 292 180 305 150 L 315 154 Q 304 185 308 220 Z', '#8B5A2B'),
      D('la', 'M 310 175 C 330 140 380 140 395 160 C 375 190 330 195 310 175 Z', '#4CAF50'),
    ],
  }),
  O('trai-cay', 'chuoi', 'Chuối', 'Banana', {
    face: { x: 262, y: 350, s: 0.55 },
    hat: { x: 190, y: 204, s: 0.6 },
    build: () => [
      D('qua-chuoi', 'M 170 230 C 150 390 290 480 450 402 C 460 396 458 380 444 380 C 330 395 235 330 215 230 Z', '#FFD54F'),
      D('vet-chuoi', 'M 205 300 C 225 360 290 395 360 405 C 300 410 230 380 205 300 Z', '#F4C430'),
      D('cuong', 'M 168 232 L 216 232 L 206 202 L 178 202 Z', '#8B5A2B'),
      E('dau-chuoi', 452, 392, 9, 11, '#5C3A1E'),
    ],
  }),
  O('trai-cay', 'dua-hau', 'Dưa hấu', 'Watermelon', {
    face: { x: 300, y: 330, s: 0.7 },
    hat: { x: 300, y: 300, s: 0.9 },
    build: () => [
      halfDisk('vo-dua', 300, 300, 172, '#4CAF50'),
      halfDisk('cui-dua', 300, 300, 156, '#DFF3D8'),
      halfDisk('ruot-dua', 300, 300, 140, '#FF5F7E'),
      E('hat-1', 215, 334, 5, 9, '#2F3640', -15),
      E('hat-2', 385, 334, 5, 9, '#2F3640', 15),
      E('hat-3', 245, 398, 5, 9, '#2F3640', -10),
      E('hat-4', 355, 398, 5, 9, '#2F3640', 10),
      E('hat-5', 300, 418, 5, 9, '#2F3640'),
    ],
  }),
  O('trai-cay', 'cam', 'Cam', 'Orange', {
    face: { x: 300, y: 318, s: 0.85 },
    hat: { x: 300, y: 192, s: 0.8 },
    build: () => [
      C('qua-cam', 300, 320, 130, '#FF9F43'),
      E('bong-sang', 238, 268, 18, 30, '#FFC37A', 30),
      R('cuong', 292, 176, 16, 24, 4, '#8B5A2B'),
      D('la', 'M 305 192 C 330 158 380 158 395 178 C 370 208 330 208 305 192 Z', '#4CAF50'),
      dot(220, 360, 3),
      dot(380, 372, 3),
      dot(340, 420, 3),
      dot(255, 410, 3),
    ],
  }),
  O('trai-cay', 'dau-tay', 'Dâu tây', 'Strawberry', {
    face: { x: 300, y: 318, s: 0.8 },
    hat: { x: 300, y: 158, s: 0.7 },
    build: () => [
      D('qua-dau', 'M 300 470 C 200 420 160 330 180 260 C 200 210 260 205 300 225 C 340 205 400 210 420 260 C 440 330 400 420 300 470 Z', '#FF5F5F'),
      E('hat-1', 225, 285, 5, 8, '#FFD54F'),
      E('hat-2', 375, 285, 5, 8, '#FFD54F'),
      E('hat-3', 212, 345, 5, 8, '#FFD54F'),
      E('hat-4', 388, 345, 5, 8, '#FFD54F'),
      E('hat-5', 250, 400, 5, 8, '#FFD54F'),
      E('hat-6', 350, 400, 5, 8, '#FFD54F'),
      E('hat-7', 300, 435, 5, 8, '#FFD54F'),
      P(
        'la-dau',
        [[236, 218], [268, 206], [262, 180], [290, 196], [300, 166], [310, 196], [338, 180], [332, 206], [364, 218], [332, 232], [300, 224], [268, 232]],
        '#4CAF50',
      ),
      R('cuong', 294, 146, 12, 24, 4, '#6D4C41'),
    ],
  }),

  // ================= NHÀ CỬA =================
  O('nha-cua', 'nha-go', 'Nhà gỗ', 'Cottage', {
    face: null,
    hat: { x: 300, y: 174, s: 0.9 },
    glow: ['cua-so-trai', 'cua-so-phai', 'cua-so-tron'],
    build: () => [
      R('ong-khoi', 370, 170, 36, 80, 4, '#B5651D'),
      R('tuong', 180, 280, 240, 190, 0, '#F6D6A8'),
      P('mai', [[150, 292], [300, 170], [450, 292]], '#E74C3C'),
      C('cua-so-tron', 300, 245, 18, '#BDE6FF'),
      D('cua', 'M 272 470 L 272 395 Q 272 365 300 365 Q 328 365 328 395 L 328 470 Z', '#8B5A2B'),
      dot(318, 420, 4),
      R('cua-so-trai', 200, 320, 55, 55, 6, '#BDE6FF'),
      R('cua-so-phai', 345, 320, 55, 55, 6, '#BDE6FF'),
      line('M 227.5 320 L 227.5 375 M 200 347.5 L 255 347.5 M 372.5 320 L 372.5 375 M 345 347.5 L 400 347.5', 3),
      R('bac-them', 258, 468, 84, 12, 4, '#BFC8D0'),
    ],
  }),
  O('nha-cua', 'lau-dai', 'Lâu đài', 'Castle', {
    face: null,
    hat: { x: 300, y: 256, s: 0.9 },
    glow: ['cua-so-thap-trai', 'cua-so-thap-phai', 'cua-so-giua'],
    build: () => [
      line('M 180 132 L 180 92 M 420 132 L 420 92', 3),
      P('co-trai', [[180, 92], [214, 102], [180, 112]], '#FF5F7E'),
      P('co-phai', [[420, 92], [454, 102], [420, 112]], '#FF5F7E'),
      R('thap-trai', 140, 222, 80, 250, 0, '#C9CED6'),
      R('thap-phai', 380, 222, 80, 250, 0, '#C9CED6'),
      P('mai-thap-trai', [[128, 226], [180, 130], [232, 226]], '#7D5FFF'),
      P('mai-thap-phai', [[368, 226], [420, 130], [472, 226]], '#7D5FFF'),
      R('rang-cua-1', 212, 256, 30, 28, 0, '#DDE2E8'),
      R('rang-cua-2', 258, 256, 30, 28, 0, '#DDE2E8'),
      R('rang-cua-3', 304, 256, 30, 28, 0, '#DDE2E8'),
      R('rang-cua-4', 350, 256, 30, 28, 0, '#DDE2E8'),
      R('tuong-thanh', 210, 280, 180, 192, 0, '#DDE2E8'),
      D('cong', 'M 260 472 L 260 392 Q 260 346 300 346 Q 340 346 340 392 L 340 472 Z', '#8B5A2B'),
      D('cua-so-thap-trai', 'M 165 340 L 165 305 Q 165 290 180 290 Q 195 290 195 305 L 195 340 Z', '#FFE066'),
      D('cua-so-thap-phai', 'M 405 340 L 405 305 Q 405 290 420 290 Q 435 290 435 305 L 435 340 Z', '#FFE066'),
      C('cua-so-giua', 300, 312, 17, '#BDE6FF'),
    ],
  }),
  O('nha-cua', 'leu-trai', 'Lều trại', 'Tent', {
    face: null,
    hat: { x: 300, y: 192, s: 0.8 },
    glow: ['lua', 'loi-lua'],
    build: () => [
      line('M 300 192 L 300 150', 3),
      P('co-leu', [[300, 150], [336, 160], [300, 170]], '#4FA3E0'),
      P('leu', [[120, 472], [300, 190], [480, 472]], '#FF8A65'),
      P('mat-ben', [[300, 190], [480, 472], [398, 472]], '#FFB38A'),
      P('cua-leu', [[300, 300], [245, 472], [355, 472]], '#7A4A2B'),
      P('vat-leu', [[300, 300], [355, 472], [388, 472]], '#FFC94D'),
      E('cui-1', 520, 482, 36, 9, '#8B5A2B', 12),
      E('cui-2', 520, 482, 36, 9, '#A0673A', -12),
      D('lua', 'M 520 474 C 488 454 502 420 520 398 C 526 424 548 432 538 458 Q 534 470 520 474 Z', '#FFC94D'),
      D('loi-lua', 'M 520 472 C 506 460 510 444 520 432 C 524 446 534 452 530 462 Q 528 470 520 472 Z', '#FF7043'),
    ],
  }),
  O('nha-cua', 'chung-cu', 'Chung cư', 'Apartment', {
    face: null,
    hat: { x: 300, y: 138, s: 0.9 },
    glow: ['cua-so-1', 'cua-so-2', 'cua-so-3', 'cua-so-4', 'cua-so-5', 'cua-so-6', 'cua-so-7', 'cua-so-8', 'cua-so-9'],
    build: () => {
      const items = [R('toa-nha', 190, 150, 220, 322, 8, '#4FA3E0'), R('mai-nha', 180, 135, 240, 22, 6, '#2F5F8A')];
      let n = 1;
      for (const y of [180, 245, 310]) {
        for (const x of [212, 277, 342]) items.push(R(`cua-so-${n++}`, x, y, 46, 44, 6, '#BDE6FF'));
      }
      items.push(
        R('cua-chinh', 270, 395, 60, 77, 6, '#FFC94D'),
        P('mai-hien', [[252, 392], [348, 392], [336, 370], [264, 370]], '#FF5F5F'),
        C('bui-cay-trai', 172, 452, 28, '#4CAF50'),
        C('bui-cay-phai', 428, 452, 28, '#4CAF50'),
      );
      return items;
    },
  }),
  O('nha-cua', 'nha-nam', 'Nhà nấm', 'Mushroom house', {
    face: null,
    hat: { x: 300, y: 148, s: 0.9 },
    glow: ['cua-so-trai', 'cua-so-phai'],
    build: () => [
      D('tuong', 'M 220 472 Q 210 380 235 320 L 365 320 Q 390 380 380 472 Z', '#FFF1D6'),
      D('mai', 'M 120 330 Q 130 160 300 145 Q 470 160 480 330 Q 300 355 120 330 Z', '#FF5F7E'),
      C('cham-1', 195, 270, 20, '#FFF7E6'),
      C('cham-2', 300, 205, 26, '#FFF7E6'),
      C('cham-3', 405, 270, 20, '#FFF7E6'),
      C('cham-4', 250, 305, 11, '#FFF7E6'),
      C('cham-5', 352, 305, 11, '#FFF7E6'),
      D('cua', 'M 275 472 L 275 410 Q 275 385 300 385 Q 325 385 325 410 L 325 472 Z', '#8B5A2B'),
      C('cua-so-trai', 250, 372, 17, '#BDE6FF'),
      C('cua-so-phai', 350, 372, 17, '#BDE6FF'),
    ],
  }),
];
