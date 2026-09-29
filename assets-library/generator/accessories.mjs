// Phụ kiện "concept" ghép vào đối tượng: áo choàng, mặt nạ, cánh, khiên, vương miện, mũ nghề nghiệp,
// lửa phản lực, bóng thể thao… Mọi phụ kiện đều là vùng tô khép kín (bé tô được).
// ctx = { face, hat, bb: [x0, y0, x1, y1], cx, cy, neck } — tính sẵn từ đối tượng ở build.mjs.
import { E, C, R, P, D, line, star, heart } from './shapes.mjs';

const f = (n) => Math.round(n * 10) / 10;
const pt = (x, y) => `${f(x)} ${f(y)}`;

// ---------------- Siêu anh hùng ----------------

/** Áo choàng sau lưng: hẹp ở cổ, xoè rộng ở dưới — chỉ lộ 2 vạt hai bên thân. */
export function cape(ctx, color, id = 'ao-choang') {
  const { cx, neck, bb } = ctx;
  const bottom = Math.min(bb[3] + 6, 500);
  const w1 = 44;
  const w2 = Math.min((bb[2] - bb[0]) / 2 + 30, 190);
  return [
    D(id, `M ${pt(cx - w1, neck)} L ${pt(cx + w1, neck)} Q ${pt(cx + w2 - 10, (neck + bottom) / 2)} ${pt(cx + w2, bottom)} Q ${pt(cx + w2 / 2, bottom - 18)} ${pt(cx, bottom)} Q ${pt(cx - w2 / 2, bottom - 18)} ${pt(cx - w2, bottom)} Q ${pt(cx - w2 + 10, (neck + bottom) / 2)} ${pt(cx - w1, neck)} Z`, color),
  ];
}

/** Mặt nạ che quanh 2 mắt (vẽ trước khuôn mặt nên mắt vẫn nổi lên trên). */
export function mask(ctx, color, id = 'mat-na') {
  const { x, y, s } = ctx.face;
  return [
    D(
      id,
      `M ${pt(x - 52 * s, y - 6 * s)} Q ${pt(x - 44 * s, y - 26 * s)} ${pt(x - 16 * s, y - 20 * s)} Q ${pt(x, y - 12 * s)} ${pt(x + 16 * s, y - 20 * s)} Q ${pt(x + 44 * s, y - 26 * s)} ${pt(x + 52 * s, y - 6 * s)} Q ${pt(x + 48 * s, y + 18 * s)} ${pt(x + 16 * s, y + 16 * s)} Q ${pt(x, y + 8 * s)} ${pt(x - 16 * s, y + 16 * s)} Q ${pt(x - 48 * s, y + 18 * s)} ${pt(x - 52 * s, y - 6 * s)} Z`,
      color,
    ),
  ];
}

export function flame(id, x, y, s, outer = '#FF7043', inner = '#FFC94D') {
  return [
    D(id, `M ${pt(x, y)} C ${pt(x - 34 * s, y - 20 * s)} ${pt(x - 20 * s, y - 60 * s)} ${pt(x, y - 84 * s)} C ${pt(x + 6 * s, y - 56 * s)} ${pt(x + 34 * s, y - 50 * s)} ${pt(x + 26 * s, y - 16 * s)} Q ${pt(x + 20 * s, y)} ${pt(x, y)} Z`, outer),
    D(`${id}-loi`, `M ${pt(x, y - 4 * s)} C ${pt(x - 16 * s, y - 14 * s)} ${pt(x - 10 * s, y - 34 * s)} ${pt(x, y - 46 * s)} C ${pt(x + 4 * s, y - 32 * s)} ${pt(x + 18 * s, y - 28 * s)} ${pt(x + 12 * s, y - 10 * s)} Q ${pt(x + 8 * s, y - 4 * s)} ${pt(x, y - 4 * s)} Z`, inner),
  ];
}

export function bolt(id, x, y, s, color = '#FFD54F') {
  return P(id, [[x, y], [x - 22 * s, y + 50 * s], [x - 2 * s, y + 50 * s], [x - 18 * s, y + 96 * s], [x + 22 * s, y + 38 * s], [x + 2 * s, y + 38 * s], [x + 16 * s, y]], color);
}

export function iceCrystal(id, x, y, r, color = '#B3E5FC') {
  return star(id, x, y, r, r * 0.42, color, 6);
}

export function shield(ctx, color = '#4FA3E0', inner = '#FFFFFF', side = 1, id = 'khien') {
  const x = side > 0 ? ctx.right - 20 : ctx.left + 20;
  const y = ctx.bb[3] - 80;
  return [
    D(id, `M ${pt(x - 50, y - 56)} L ${pt(x + 50, y - 56)} Q ${pt(x + 52, y + 20)} ${pt(x, y + 60)} Q ${pt(x - 52, y + 20)} ${pt(x - 50, y - 56)} Z`, color),
    D(`${id}-vien`, `M ${pt(x - 34, y - 40)} L ${pt(x + 34, y - 40)} Q ${pt(x + 34, y + 12)} ${pt(x, y + 40)} Q ${pt(x - 34, y + 12)} ${pt(x - 34, y - 40)} Z`, inner),
    star(`${id}-sao`, x, y - 4, 22, 10, '#FFD54F'),
  ];
}

/** 2 cánh lông vũ sau lưng. */
export function wings(ctx, color = '#FFFFFF', tip = '#BDE6FF') {
  const { cx } = ctx;
  const cy = ctx.neck + 30;
  const half = (sgn, id) => {
    const X = (dx) => cx + sgn * dx;
    return [
      D(id, `M ${pt(X(30), cy + 40)} Q ${pt(X(120), cy - 110)} ${pt(X(250), cy - 120)} Q ${pt(X(226), cy - 70)} ${pt(X(246), cy - 44)} Q ${pt(X(206), cy - 20)} ${pt(X(226), cy + 10)} Q ${pt(X(176), cy + 20)} ${pt(X(186), cy + 50)} Q ${pt(X(110), cy + 60)} ${pt(X(30), cy + 40)} Z`, color),
      D(`${id}-dau`, `M ${pt(X(170), cy - 96)} Q ${pt(X(214), cy - 116)} ${pt(X(250), cy - 120)} Q ${pt(X(226), cy - 70)} ${pt(X(246), cy - 44)} Q ${pt(X(200), cy - 60)} ${pt(X(170), cy - 96)} Z`, tip),
    ];
  };
  return [...half(-1, 'canh-trai'), ...half(1, 'canh-phai')];
}

// ---------------- Mũ / vương miện (đặt theo điểm "hat" của đối tượng) ----------------

export function crown(ctx, color = '#FFD700', gem = '#FF5F7E', id = 'vuong-mien', scale = 1) {
  const { x, y } = ctx.hat;
  const s = ctx.hat.s * scale;
  return [
    P(id, [[x - 48 * s, y + 6 * s], [x - 54 * s, y - 50 * s], [x - 26 * s, y - 22 * s], [x, y - 64 * s], [x + 26 * s, y - 22 * s], [x + 54 * s, y - 50 * s], [x + 48 * s, y + 6 * s]], color),
    C(`${id}-ngoc`, x, y - 14 * s, 9 * s, gem),
  ];
}

export function diamondCrown(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    ...crown(ctx, '#FFD700', '#FF5F7E', 'vuong-mien', 1.1),
    P('kim-cuong', [[x - 20 * s, y - 84 * s], [x - 10 * s, y - 98 * s], [x + 10 * s, y - 98 * s], [x + 20 * s, y - 84 * s], [x, y - 62 * s]], '#7DE2FF'),
  ];
}

export function tiara(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    P('mieng-vuong-mien', [[x - 52 * s, y + 6 * s], [x - 40 * s, y - 24 * s], [x - 22 * s, y - 8 * s], [x, y - 44 * s], [x + 22 * s, y - 8 * s], [x + 40 * s, y - 24 * s], [x + 52 * s, y + 6 * s]], '#FFD54F'),
    heart('tim-vuong-mien', x, y - 16 * s, 0.7 * s, '#FF7AA2'),
    C('ngoc-trai-tiara', x - 40 * s, y - 24 * s, 6 * s, '#7DE2FF'),
    C('ngoc-phai-tiara', x + 40 * s, y - 24 * s, 6 * s, '#7DE2FF'),
  ];
}

export function smallCrown(ctx) {
  const { x, y } = ctx.hat;
  const s = ctx.hat.s * 1.3;
  return [P('vuong-mien-nho', [[x - 36 * s, y + 4 * s], [x - 36 * s, y - 30 * s], [x - 18 * s, y - 14 * s], [x, y - 36 * s], [x + 18 * s, y - 14 * s], [x + 36 * s, y - 30 * s], [x + 36 * s, y + 4 * s]], '#FFC94D')];
}

export function bowTie(ctx, color = '#7D5FFF', dy = 64) {
  const { x, y } = ctx.face;
  const by = y + dy * ctx.face.s;
  const s = Math.max(ctx.face.s * 1.5, 0.9);
  return [
    P('no-trai', [[x, by], [x - 34 * s, by - 18 * s], [x - 34 * s, by + 18 * s]], color),
    P('no-phai', [[x, by], [x + 34 * s, by - 18 * s], [x + 34 * s, by + 18 * s]], color),
    C('nut-no', x, by, 8 * s, '#FFD54F'),
  ];
}

export function knightHelmet(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    D('long-chim', `M ${pt(x, y - 50 * s)} C ${pt(x + 10 * s, y - 110 * s)} ${pt(x + 70 * s, y - 110 * s)} ${pt(x + 80 * s, y - 70 * s)} C ${pt(x + 50 * s, y - 86 * s)} ${pt(x + 26 * s, y - 70 * s)} ${pt(x + 10 * s, y - 44 * s)} Z`, '#FF5F7E'),
    D('mu-giap', `M ${pt(x - 56 * s, y + 8 * s)} Q ${pt(x - 56 * s, y - 60 * s)} ${pt(x, y - 60 * s)} Q ${pt(x + 56 * s, y - 60 * s)} ${pt(x + 56 * s, y + 8 * s)} Z`, '#BFC8D0'),
    R('vanh-mu-giap', x - 60 * s, y - 4 * s, 120 * s, 14 * s, 6 * s, '#8FA3B5'),
  ];
}

export function sword(ctx, side = 1) {
  const x = side > 0 ? ctx.right + 6 : ctx.left - 6;
  const y = ctx.bb[3] - 60;
  return [
    P('luoi-kiem', [[x - 9, y - 20], [x - 9, y - 150], [x, y - 172], [x + 9, y - 150], [x + 9, y - 20]], '#DDE2E8'),
    R('chuoi-kiem-ngang', x - 30, y - 22, 60, 12, 5, '#FFC94D'),
    R('chuoi-kiem', x - 7, y - 10, 14, 36, 5, '#8B5A2B'),
  ];
}

export function guardHat(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    D('mu-linh-gac', `M ${pt(x - 44 * s, y + 8 * s)} L ${pt(x - 44 * s, y - 70 * s)} Q ${pt(x - 44 * s, y - 110 * s)} ${pt(x, y - 110 * s)} Q ${pt(x + 44 * s, y - 110 * s)} ${pt(x + 44 * s, y - 70 * s)} L ${pt(x + 44 * s, y + 8 * s)} Z`, '#2F3640'),
    R('day-mu-linh-gac', x - 46 * s, y - 14 * s, 92 * s, 14 * s, 4 * s, '#FF5F5F'),
  ];
}

export function flagPole(ctx, side = 1) {
  const x = side > 0 ? ctx.right + 20 : ctx.left - 20;
  const y1 = ctx.bb[3] + 4;
  return [
    R('can-co', x - 5, y1 - 250, 10, 250, 4, '#8B5A2B'),
    P('la-co', [[x + 5, y1 - 248], [x + 80, y1 - 226], [x + 5, y1 - 204]], '#FF5F7E'),
    C('dau-can-co', x, y1 - 254, 10, '#FFD54F'),
  ];
}

export function scepter(ctx) {
  const x = ctx.right + 8;
  const y = ctx.bb[3] - 10;
  return [R('gay-vua', x - 6, y - 200, 12, 200, 5, '#FFC94D'), C('ngoc-gay-vua', x, y - 214, 20, '#FF5F7E'), star('sao-gay-vua', x, y - 214, 12, 5, '#FFF3B0')];
}

export function ribbonBow(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    D('no-ruy-bang-trai', `M ${pt(x, y - 10 * s)} Q ${pt(x - 60 * s, y - 60 * s)} ${pt(x - 56 * s, y - 4 * s)} Q ${pt(x - 30 * s, y + 6 * s)} ${pt(x, y - 10 * s)} Z`, '#FF7AA2'),
    D('no-ruy-bang-phai', `M ${pt(x, y - 10 * s)} Q ${pt(x + 60 * s, y - 60 * s)} ${pt(x + 56 * s, y - 4 * s)} Q ${pt(x + 30 * s, y + 6 * s)} ${pt(x, y - 10 * s)} Z`, '#FF7AA2'),
    C('nut-ruy-bang', x, y - 10 * s, 12 * s, '#FF5F7E'),
  ];
}

// ---------------- Nghề nghiệp ----------------

export function chefHat(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    D('mu-dau-bep', `M ${pt(x - 40 * s, y)} L ${pt(x - 40 * s, y - 40 * s)} Q ${pt(x - 76 * s, y - 60 * s)} ${pt(x - 50 * s, y - 94 * s)} Q ${pt(x - 30 * s, y - 128 * s)} ${pt(x, y - 104 * s)} Q ${pt(x + 30 * s, y - 128 * s)} ${pt(x + 50 * s, y - 94 * s)} Q ${pt(x + 76 * s, y - 60 * s)} ${pt(x + 40 * s, y - 40 * s)} L ${pt(x + 40 * s, y)} Z`, '#FFFFFF'),
    R('vanh-mu-dau-bep', x - 44 * s, y - 22 * s, 88 * s, 26 * s, 6 * s, '#F0F4F8'),
  ];
}

export function fryingPan(ctx) {
  const x = ctx.right + 20;
  const y = ctx.bb[3] - 70;
  return [
    R('can-chao', x + 40, y - 8, 90, 16, 7, '#8B5A2B'),
    E('chao', x, y, 56, 30, '#2F3640'),
    E('long-trang', x - 4, y - 2, 34, 18, '#FFFFFF'),
    C('long-do', x - 4, y - 4, 10, '#FFC94D'),
  ];
}

export function fireHelmet(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    E('vanh-mu-cuu-hoa', x, y + 2 * s, 74 * s, 14 * s, '#C0392B'),
    D('mu-cuu-hoa', `M ${pt(x - 54 * s, y)} Q ${pt(x - 54 * s, y - 74 * s)} ${pt(x, y - 76 * s)} Q ${pt(x + 54 * s, y - 74 * s)} ${pt(x + 54 * s, y)} Z`, '#E74C3C'),
    D('huy-hieu', `M ${pt(x - 18 * s, y - 50 * s)} L ${pt(x + 18 * s, y - 50 * s)} L ${pt(x + 14 * s, y - 20 * s)} L ${pt(x, y - 12 * s)} L ${pt(x - 14 * s, y - 20 * s)} Z`, '#FFD54F'),
  ];
}

export function hose(ctx) {
  const x = ctx.right - 10;
  const y = ctx.bb[3] - 60;
  return [
    R('voi-cuu-hoa', x - 10, y - 12, 70, 24, 10, '#FFC94D'),
    P('dau-voi', [[x + 58, y - 16], [x + 90, y - 26], [x + 90, y + 26], [x + 58, y + 16]], '#BFC8D0'),
    D('tia-nuoc', `M ${pt(x + 92, y - 22)} Q ${pt(x + 130, y - 80)} ${pt(x + 170, y - 60)} Q ${pt(x + 150, y - 40)} ${pt(x + 92, y + 20)} Z`, '#8FD3FF'),
  ];
}

export function doctorCap(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    D('mu-bac-si', `M ${pt(x - 48 * s, y + 4 * s)} L ${pt(x - 40 * s, y - 44 * s)} Q ${pt(x, y - 56 * s)} ${pt(x + 40 * s, y - 44 * s)} L ${pt(x + 48 * s, y + 4 * s)} Z`, '#FFFFFF'),
    P('chu-thap', [[x - 6 * s, y - 38 * s], [x + 6 * s, y - 38 * s], [x + 6 * s, y - 26 * s], [x + 18 * s, y - 26 * s], [x + 18 * s, y - 14 * s], [x + 6 * s, y - 14 * s], [x + 6 * s, y - 2 * s], [x - 6 * s, y - 2 * s], [x - 6 * s, y - 14 * s], [x - 18 * s, y - 14 * s], [x - 18 * s, y - 26 * s], [x - 6 * s, y - 26 * s]], '#FF5F5F'),
  ];
}

export function medicalBag(ctx) {
  const x = ctx.right + 30;
  const y = ctx.bb[3] - 20;
  return [
    D('quai-tui', `M ${pt(x - 26, y - 70)} Q ${pt(x - 26, y - 100)} ${pt(x, y - 100)} Q ${pt(x + 26, y - 100)} ${pt(x + 26, y - 70)} L ${pt(x + 16, y - 70)} Q ${pt(x + 16, y - 90)} ${pt(x, y - 90)} Q ${pt(x - 16, y - 90)} ${pt(x - 16, y - 70)} Z`, '#8B5A2B'),
    R('tui-y-te', x - 56, y - 72, 112, 74, 12, '#FFFFFF'),
    P('chu-thap-tui', [[x - 8, y - 56], [x + 8, y - 56], [x + 8, y - 42], [x + 22, y - 42], [x + 22, y - 26], [x + 8, y - 26], [x + 8, y - 12], [x - 8, y - 12], [x - 8, y - 26], [x - 22, y - 26], [x - 22, y - 42], [x - 8, y - 42]], '#FF5F5F'),
  ];
}

export function strawHat(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    E('vanh-mu-rom', x, y, 94 * s, 20 * s, '#FFE08A'),
    D('mu-rom', `M ${pt(x - 50 * s, y - 4 * s)} Q ${pt(x - 48 * s, y - 64 * s)} ${pt(x, y - 64 * s)} Q ${pt(x + 48 * s, y - 64 * s)} ${pt(x + 50 * s, y - 4 * s)} Z`, '#FFD54F'),
    R('day-mu-rom', x - 50 * s, y - 20 * s, 100 * s, 12 * s, 4 * s, '#FF5F5F'),
  ];
}

export function carrotBasket(ctx) {
  const x = ctx.right + 30;
  const y = ctx.bb[3];
  const carrot = (k, cx) => [
    P(`la-ca-rot-${k}`, [[cx, y - 96], [cx - 14, y - 124], [cx + 2, y - 108], [cx + 14, y - 126]], '#4CAF50'),
    P(`ca-rot-${k}`, [[cx - 12, y - 96], [cx + 12, y - 96], [cx, y - 40]], '#FF8A3D'),
  ];
  return [...carrot(1, x - 28), ...carrot(2, x + 4), ...carrot(3, x + 34), P('gio', [[x - 60, y - 70], [x + 64, y - 70], [x + 50, y], [x - 46, y]], '#C68B59'), line(`M ${x - 52} ${y - 46} L ${x + 58} ${y - 46} M ${x - 48} ${y - 22} L ${x + 54} ${y - 22}`, 3)];
}

export function safariHat(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    E('vanh-mu-tham-hiem', x, y, 84 * s, 18 * s, '#C8A26B'),
    D('mu-tham-hiem', `M ${pt(x - 50 * s, y - 2 * s)} Q ${pt(x - 50 * s, y - 70 * s)} ${pt(x, y - 72 * s)} Q ${pt(x + 50 * s, y - 70 * s)} ${pt(x + 50 * s, y - 2 * s)} Z`, '#E0C08A'),
    R('day-mu-tham-hiem', x - 50 * s, y - 22 * s, 100 * s, 14 * s, 4 * s, '#8B5A2B'),
  ];
}

export function backpack(ctx) {
  const x = ctx.left + 14;
  const y = ctx.bb[3] - 60;
  return [
    R('ba-lo', x - 50, y - 80, 84, 110, 20, '#4CAF50'),
    R('tui-ba-lo', x - 38, y - 20, 60, 40, 10, '#81C784'),
    R('day-ba-lo', x - 10, y - 96, 12, 24, 4, '#2E7D32'),
  ];
}

// ---------------- Vũ trụ ----------------

export function jetFlame(ctx) {
  const x = ctx.bb[0] + 6;
  const y = (ctx.bb[1] + ctx.bb[3]) / 2 + 10;
  return [
    D('lua-phan-luc', `M ${pt(x, y - 34)} Q ${pt(x - 90, y - 40)} ${pt(x - 130, y)} Q ${pt(x - 90, y + 40)} ${pt(x, y + 34)} Z`, '#FF7043'),
    D('loi-lua-phan-luc', `M ${pt(x, y - 18)} Q ${pt(x - 50, y - 20)} ${pt(x - 76, y)} Q ${pt(x - 50, y + 20)} ${pt(x, y + 18)} Z`, '#FFE066'),
    R('dong-co-phan-luc', x - 12, y - 30, 26, 60, 8, '#BFC8D0'),
  ];
}

export function glassDome(ctx) {
  const { cx, bb } = ctx;
  const rx = (bb[2] - bb[0]) / 2 + 16;
  return [E('kinh-vom', cx, bb[1] + 60, rx, 120, '#D6F0FF'), line(`M ${f(cx)} ${f(bb[1] - 60)} L ${f(cx)} ${f(bb[1] - 96)}`, 4), C('dau-ang-ten', cx, bb[1] - 102, 10, '#FF5F7E')];
}

export function antenna(ctx) {
  const x = ctx.cx + 40;
  const y = ctx.bb[1] + 6;
  return [line(`M ${f(x)} ${f(y)} L ${f(x + 20)} ${f(y - 60)}`, 4), C('dau-ang-ten', x + 22, y - 66, 11, '#FF5F7E')];
}

export function asteroid(id, x, y, r, color = '#B0A89E') {
  const pts = [];
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    const rr = r * (0.8 + ((k * 37) % 10) / 40);
    pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]);
  }
  return [P(id, pts, color), C(`${id}-ho`, x - r * 0.25, y - r * 0.2, r * 0.25, '#8D8379')];
}

export function goldStarBadge(ctx) {
  const x = ctx.cx;
  const y = ctx.bb[1] - 40;
  return [star('huy-hieu-sao', x, y, 40, 18, '#FFD700'), C('tam-huy-hieu', x, y, 10, '#FF5F7E')];
}

// ---------------- Thể thao ----------------

/** Tay chân nhỏ cho trái cây (vẽ sau thân nên như mọc ra từ hai bên và đáy quả). */
export function limbs(ctx, color = '#FFE0B5', shoe = '#FF5F7E') {
  const { cx, bb } = ctx;
  const my = (bb[1] + bb[3]) / 2 + 20;
  const b = bb[3];
  return [
    E('tay-trai', ctx.left + 4, my, 12, 36, color, 40),
    E('tay-phai', ctx.right - 4, my, 12, 36, color, -40),
    R('chan-trai', cx - 44, b - 20, 16, 46, 7, color),
    R('chan-phai', cx + 28, b - 20, 16, 46, 7, color),
    E('giay-trai', cx - 44, b + 28, 22, 12, shoe),
    E('giay-phai', cx + 44, b + 28, 22, 12, shoe),
  ];
}

export function soccerBall(id, x, y, r) {
  return [C(id, x, y, r, '#FFFFFF'), P(`${id}-giua`, [0, 1, 2, 3, 4].map((k) => { const a = ((k * 72 - 90) * Math.PI) / 180; return [x + r * 0.38 * Math.cos(a), y + r * 0.38 * Math.sin(a)]; }), '#2F3640')];
}

export function basketball(id, x, y, r) {
  return [C(id, x, y, r, '#FF8A3D'), line(`M ${f(x - r)} ${f(y)} L ${f(x + r)} ${f(y)} M ${f(x)} ${f(y - r)} L ${f(x)} ${f(y + r)} M ${f(x - r * 0.7)} ${f(y - r * 0.7)} Q ${f(x - r * 0.2)} ${f(y)} ${f(x - r * 0.7)} ${f(y + r * 0.7)} M ${f(x + r * 0.7)} ${f(y - r * 0.7)} Q ${f(x + r * 0.2)} ${f(y)} ${f(x + r * 0.7)} ${f(y + r * 0.7)}`, 3)];
}

export function goggles(ctx) {
  const { x, y, s } = ctx.face;
  return [
    R('day-kinh-boi', x - 64 * s, y - 6 * s, 128 * s, 12 * s, 6 * s, '#4FA3E0'),
    C('kinh-boi-trai', x - 26 * s, y, 20 * s, '#D6F0FF'),
    C('kinh-boi-phai', x + 26 * s, y, 20 * s, '#D6F0FF'),
  ];
}

export function skateboard(ctx) {
  const { cx, bb } = ctx;
  const y = bb[3] + 8;
  return [R('van-truot', cx - 130, y, 260, 20, 10, '#7D5FFF'), C('banh-van-1', cx - 86, y + 30, 14, '#FFC94D'), C('banh-van-2', cx + 86, y + 30, 14, '#FFC94D')];
}

export function jumpRope(ctx) {
  const { cx, bb } = ctx;
  const yh = (bb[1] + bb[3]) / 2 + 30;
  const xl = bb[0] - 20;
  const xr = bb[2] + 20;
  return [
    line(`M ${f(xl)} ${f(yh - 30)} Q ${f(cx)} ${f(bb[1] - 150)} ${f(xr)} ${f(yh - 30)}`, 5),
    R('tay-cam-trai', xl - 12, yh - 34, 24, 60, 10, '#FF5F7E'),
    R('tay-cam-phai', xr - 12, yh - 34, 24, 60, 10, '#FF5F7E'),
  ];
}

export function sportCap(ctx) {
  const { x, y, s } = ctx.hat;
  return [
    D('mu-luoi-trai', `M ${pt(x - 50 * s, y + 4 * s)} Q ${pt(x - 50 * s, y - 60 * s)} ${pt(x, y - 62 * s)} Q ${pt(x + 50 * s, y - 60 * s)} ${pt(x + 50 * s, y + 4 * s)} Z`, '#4FA3E0'),
    D('luoi-trai', `M ${pt(x + 30 * s, y + 4 * s)} Q ${pt(x + 90 * s, y - 4 * s)} ${pt(x + 100 * s, y + 14 * s)} Q ${pt(x + 60 * s, y + 22 * s)} ${pt(x + 30 * s, y + 14 * s)} Z`, '#2B7CC4'),
    C('nut-mu', x, y - 60 * s, 7 * s, '#FFD54F'),
  ];
}

export function goldMedal(ctx) {
  const { x, y, s } = ctx.face;
  const my = y + 90 * s;
  return [P('day-huy-chuong', [[x - 34, my - 70], [x - 14, my - 70], [x + 4, my - 14], [x - 16, my - 14]], '#4FA3E0'), P('day-huy-chuong-2', [[x + 34, my - 70], [x + 14, my - 70], [x - 4, my - 14], [x + 16, my - 14]], '#FF5F5F'), C('huy-chuong', x, my, 26, '#FFD700'), star('sao-huy-chuong', x, my, 14, 6, '#FFF3B0')];
}

export function trophy(ctx) {
  const x = ctx.right + 40;
  const y = ctx.bb[3];
  return [
    R('de-cup', x - 40, y - 26, 80, 26, 6, '#8B5A2B'),
    R('than-cup', x - 10, y - 60, 20, 36, 4, '#FFC94D'),
    D('coc-cup', `M ${pt(x - 44, y - 140)} L ${pt(x + 44, y - 140)} Q ${pt(x + 44, y - 64)} ${pt(x, y - 58)} Q ${pt(x - 44, y - 64)} ${pt(x - 44, y - 140)} Z`, '#FFD700'),
    star('sao-cup', x, y - 104, 16, 7, '#FFFFFF'),
  ];
}
