// Bộ chủ đề mới — Đợt 1 (5 chủ đề × 6 đối tượng). Xem docs/ma-tran-chu-de.md.
// Mỗi chủ đề = Nhóm đối tượng × Concept; 5 biến thể cố định + 4 thẻ (C/B/A/S) áp cho mọi đối tượng.
import { legacy } from './objects.mjs';
import * as B from './bodies.mjs';
import * as A from './accessories.mjs';
import { flame, bolt, iceCrystal, asteroid, soccerBall, basketball } from './accessories.mjs';

export const THEMES = [
  { slug: 'anh-hung-sieu-thu', name: { vi: 'Anh Hùng Siêu Thú', en: 'Super Beast Heroes' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'vuong-quoc-keo-ngot', name: { vi: 'Vương Quốc Kẹo Ngọt', en: 'Candy Kingdom' }, faceStyle: 'face', animation: 'float' },
  { slug: 'doi-xe-vu-tru', name: { vi: 'Đội Xe Chinh Phục Vũ Trụ', en: 'Space Vehicle Squad' }, faceStyle: 'face', animation: 'drive' },
  { slug: 'thi-tran-khung-long', name: { vi: 'Thị Trấn Khủng Long Tài Ba', en: 'Talented Dino Town' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'the-thao-trai-cay', name: { vi: 'Đại Hội Thể Thao Trái Cây', en: 'Fruit Sports Festival' }, faceStyle: 'face', animation: 'float' },
];

const O = (theme, slug, vi, en, opts) => ({ theme, slug, name: { vi, en }, ...opts });
/** Dùng lại hình dáng đối tượng cũ, đổi slug/tên để không trùng tranh cũ. */
const reuse = (theme, oldSlug, slug, vi, en, extra = {}) => {
  const o = legacy(oldSlug);
  return O(theme, slug, vi, en, { face: o.face, hat: o.hat, build: o.build, glow: o.glow, animation: o.animation, ground: o.ground, ...extra });
};

export const OBJECTS = [
  // 01 — Động vật × Siêu anh hùng
  O('anh-hung-sieu-thu', 'su-tu', 'Sư tử', 'Lion', { face: { x: 300, y: 250, s: 1 }, hat: { x: 300, y: 150, s: 0.9 }, neck: 336, build: B.suTu }),
  O('anh-hung-sieu-thu', 'ho', 'Hổ', 'Tiger', { face: { x: 300, y: 248, s: 1 }, hat: { x: 300, y: 176, s: 0.9 }, neck: 334, build: B.ho }),
  reuse('anh-hung-sieu-thu', 'voi', 'voi-sieu-thu', 'Voi', 'Elephant', { neck: 336 }),
  O('anh-hung-sieu-thu', 'dai-bang', 'Đại bàng', 'Eagle', { face: { x: 300, y: 228, s: 0.85 }, mouth: false, hat: { x: 300, y: 168, s: 0.85 }, neck: 306, build: B.daiBang }),
  reuse('anh-hung-sieu-thu', 'meo', 'meo-sieu-thu', 'Mèo', 'Cat', { neck: 334 }),
  reuse('anh-hung-sieu-thu', 'cho', 'cho-sieu-thu', 'Chó', 'Dog', { neck: 334 }),

  // 02 — Bánh kẹo × Hoàng gia
  O('vuong-quoc-keo-ngot', 'donut', 'Donut', 'Donut', { face: { x: 300, y: 398, s: 0.62 }, hat: { x: 300, y: 186, s: 1.2 }, build: B.donut }),
  O('vuong-quoc-keo-ngot', 'cupcake', 'Cupcake', 'Cupcake', { face: { x: 300, y: 408, s: 0.6 }, hat: { x: 300, y: 212, s: 1.05 }, build: B.cupcake }),
  O('vuong-quoc-keo-ngot', 'keo-mut', 'Kẹo mút', 'Lollipop', { face: { x: 300, y: 226, s: 0.62 }, hat: { x: 300, y: 118, s: 1.15 }, build: B.keoMut }),
  O('vuong-quoc-keo-ngot', 'kem-oc-que', 'Kem ốc quế', 'Ice cream cone', { face: { x: 300, y: 276, s: 0.62 }, hat: { x: 300, y: 156, s: 1.05 }, build: B.kemOcQue }),
  O('vuong-quoc-keo-ngot', 'banh-quy', 'Bánh quy', 'Cookie', { face: { x: 300, y: 318, s: 0.9 }, hat: { x: 300, y: 180, s: 1.25 }, build: B.banhQuy }),
  O('vuong-quoc-keo-ngot', 'banh-kem', 'Bánh kem nhiều tầng', 'Layer cake', { face: { x: 300, y: 428, s: 0.6 }, hat: { x: 300, y: 234, s: 0.9 }, build: B.banhKem }),

  // 03 — Phương tiện × Không gian
  O('doi-xe-vu-tru', 'xe-dua', 'Xe đua', 'Race car', { face: { x: 440, y: 386, s: 0.42 }, hat: { x: 318, y: 306, s: 0.7 }, glow: ['den-truoc'], build: B.xeDua }),
  reuse('doi-xe-vu-tru', 'xe-buyt', 'xe-buyt-vu-tru', 'Xe buýt', 'Bus'),
  O('doi-xe-vu-tru', 'xe-cuu-hoa', 'Xe cứu hỏa', 'Fire truck', { face: { x: 434, y: 396, s: 0.44 }, hat: { x: 452, y: 278, s: 0.6 }, glow: ['den-truoc', 'den-coi'], build: B.xeCuuHoa }),
  reuse('doi-xe-vu-tru', 'tau-hoa', 'tau-hoa-vu-tru', 'Tàu hỏa', 'Train'),
  reuse('doi-xe-vu-tru', 'may-bay', 'may-bay-vu-tru', 'Máy bay', 'Airplane'),
  O('doi-xe-vu-tru', 'truc-thang', 'Trực thăng', 'Helicopter', { face: { x: 300, y: 372, s: 0.5 }, hat: { x: 310, y: 226, s: 0.6 }, animation: 'fly', build: B.trucThang }),

  // 07 — Khủng long × Nghề nghiệp
  O('thi-tran-khung-long', 'khung-long-bao-chua', 'Khủng long bạo chúa', 'T-Rex', { face: { x: 300, y: 248, s: 1 }, hat: { x: 300, y: 172, s: 0.95 }, left: 208, right: 392, build: B.khungLongBaoChua }),
  O('thi-tran-khung-long', 'khung-long-co-dai', 'Khủng long cổ dài', 'Long-neck dino', { face: { x: 402, y: 154, s: 0.5 }, hat: { x: 400, y: 120, s: 0.6 }, left: 176, right: 440, build: B.khungLongCoDai }),
  O('thi-tran-khung-long', 'khung-long-ba-sung', 'Khủng long ba sừng', 'Triceratops', { face: { x: 300, y: 262, s: 0.9 }, hat: { x: 300, y: 104, s: 0.9 }, left: 208, right: 392, build: B.khungLongBaSung }),
  O('thi-tran-khung-long', 'khung-long-gai-lung', 'Khủng long gai lưng', 'Stegosaurus', { face: { x: 300, y: 256, s: 0.95 }, hat: { x: 300, y: 194, s: 0.9 }, left: 208, right: 392, build: B.khungLongGaiLung }),
  O('thi-tran-khung-long', 'duc-long', 'Dực long', 'Pterosaur', { face: { x: 300, y: 228, s: 0.7 }, mouth: false, hat: { x: 300, y: 182, s: 0.75 }, animation: 'fly', left: 180, right: 420, build: B.khungLongDucLong }),
  O('thi-tran-khung-long', 'khung-long-mao-ken', 'Khủng long mào kèn', 'Parasaurolophus', { face: { x: 300, y: 248, s: 0.95 }, hat: { x: 316, y: 184, s: 0.85 }, left: 208, right: 392, build: B.khungLongMaoKen }),

  // 08 — Trái cây × Thể thao
  reuse('the-thao-trai-cay', 'tao', 'tao-the-thao', 'Táo', 'Apple'),
  reuse('the-thao-trai-cay', 'chuoi', 'chuoi-the-thao', 'Chuối', 'Banana'),
  reuse('the-thao-trai-cay', 'dau-tay', 'dau-tay-the-thao', 'Dâu tây', 'Strawberry'),
  reuse('the-thao-trai-cay', 'dua-hau', 'dua-hau-the-thao', 'Dưa hấu', 'Watermelon'),
  O('the-thao-trai-cay', 'dua', 'Dứa', 'Pineapple', { face: { x: 300, y: 370, s: 0.8 }, hat: { x: 300, y: 150, s: 0.7 }, build: B.dua }),
  reuse('the-thao-trai-cay', 'cam', 'cam-the-thao', 'Cam', 'Orange'),
];

// ---------------- Biến thể ----------------
// acc(ctx) trả về { behind, preface, front }: behind vẽ sau thân, preface vẽ trên thân nhưng dưới khuôn mặt,
// front vẽ trên cùng. scene = cảnh nền (variants.mjs → sceneParts). sky/ground = đổi màu trời/đất.

const V = (slug, vi, en, opts) => ({ slug, name: { vi, en }, scene: [], ...opts });
const card = (rarity, slug, vi, en, opts) => V(`the-${rarity.toLowerCase()}-${slug}`, vi, en, { rarity, ...opts });

const sides = (ctx) => ({ l: ctx.bb[0] - 30, r: ctx.bb[2] + 30, mid: (ctx.bb[1] + ctx.bb[3]) / 2 });

export const THEME_VARIANTS = {
  'anh-hung-sieu-thu': {
    variants: [
      V('ruc-lua', 'Rực Lửa', 'Blazing', {
        expr: 'happy', scene: ['stars'], sky: 'sunset',
        acc: (c) => ({ behind: A.cape(c, '#FF5F5F'), front: [...flame('ngon-lua-trai', c.left - 10, c.bb[3] + 8, 1.5), ...flame('ngon-lua-phai', c.right + 10, c.bb[3] + 8, 1.5), ...flame('ngon-lua-tren-trai', c.left - 30, c.bb[3] - 130, 0.9), ...flame('ngon-lua-tren-phai', c.right + 30, c.bb[3] - 150, 0.9)] }),
      }),
      V('tia-chop', 'Tia Chớp', 'Lightning', {
        expr: 'happy', scene: ['clouds', 'motion'],
        acc: (c) => { const s = sides(c); return { behind: A.cape(c, '#4FA3E0'), preface: A.mask(c, '#2B7CC4'), front: [bolt('tia-chop-trai', s.l, s.mid - 150, 1.7), bolt('tia-chop-phai', s.r + 20, s.mid - 90, 1.5)] }; },
      }),
      V('bang-gia', 'Băng Giá', 'Frost', {
        expr: 'happy', scene: ['snow'], sky: 'snow', ground: 'snow',
        acc: (c) => { const s = sides(c); return { behind: A.cape(c, '#B3E5FC'), front: [iceCrystal('pha-le-bang-1', s.l - 10, s.mid - 90, 44), iceCrystal('pha-le-bang-2', s.r + 10, s.mid - 30, 40), iceCrystal('pha-le-bang-3', s.l + 10, s.mid + 70, 30)] }; },
      }),
      V('ho-ve', 'Hộ Vệ', 'Guardian', {
        expr: 'happy', scene: ['sun', 'clouds'],
        acc: (c) => ({ behind: A.cape(c, '#7D5FFF'), front: A.shield(c, '#4FA3E0') }),
      }),
      V('phi-thien', 'Phi Thiên', 'Sky Flyer', {
        expr: 'happy', scene: ['clouds', 'sun', 'shadow'], transform: { ty: -34, scale: 0.9, px: 300, py: 400 },
        acc: (c) => ({ behind: A.wings(c) }),
      }),
    ],
    cards: [
      card('C', 'tan-binh', 'Tân Binh', 'Rookie', { expr: 'happy', scene: ['sun', 'clouds'], acc: (c) => ({ behind: A.cape(c, '#FF5F5F') }) }),
      card('B', 'chien-binh', 'Chiến Binh', 'Warrior', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ behind: A.cape(c, '#4FA3E0'), preface: A.mask(c, '#FF5F5F') }) }),
      card('A', 'doi-truong', 'Đội Trưởng', 'Captain', { expr: 'happy', scene: ['rainbow', 'clouds', 'stars'], acc: (c) => ({ behind: A.cape(c, '#7D5FFF'), preface: A.mask(c, '#2B7CC4'), front: A.shield(c, '#FF5F5F') }) }),
      card('S', 'giap-vang', 'Giáp Vàng Huyền Thoại', 'Legendary Gold Armor', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: [...A.wings(c, '#FFE9A8', '#FFD54F'), ...A.cape(c, '#FFD54F')], preface: A.mask(c, '#FFC94D'), front: [...A.crown(c), ...A.shield(c, '#FFD700', '#FFF3B0')] }) }),
    ],
  },

  'vuong-quoc-keo-ngot': {
    variants: [
      V('nha-vua', 'Nhà Vua', 'King', { expr: 'happy', scene: ['sun', 'candyCanes'], acc: (c) => ({ front: [...A.crown(c), ...A.scepter(c)] }) }),
      V('cong-chua', 'Công Chúa', 'Princess', { expr: 'happy', scene: ['hearts', 'flowers', 'candyCanes'], acc: (c) => ({ front: A.tiara(c) }) }),
      V('hoang-tu', 'Hoàng Tử', 'Prince', { expr: 'happy', scene: ['clouds', 'candyCanes'], acc: (c) => ({ front: [...A.smallCrown(c), ...A.bowTie(c)] }) }),
      V('hiep-si', 'Hiệp Sĩ', 'Knight', { expr: 'happy', scene: ['clouds', 'candyCanes'], acc: (c) => ({ front: [...A.knightHelmet(c), ...A.sword(c, 1), ...A.shield(c, '#FF7AA2', '#FFFFFF', -1)] }) }),
      V('linh-gac', 'Lính Gác', 'Royal Guard', { expr: 'happy', scene: ['sun', 'candyCanes'], acc: (c) => ({ front: [...A.guardHat(c), ...A.flagPole(c, 1)] }) }),
    ],
    cards: [
      card('C', 'dan-lang-keo', 'Dân Làng Kẹo', 'Candy Villager', { expr: 'happy', scene: ['sun', 'candyCanes'], acc: () => ({}) }),
      card('B', 'quy-toc', 'Quý Tộc', 'Noble', { expr: 'happy', scene: ['clouds', 'candyCanes', 'confetti'], acc: (c) => ({ front: A.ribbonBow(c) }) }),
      card('A', 'hoang-gia', 'Hoàng Gia', 'Royal', { expr: 'happy', scene: ['rainbow', 'candyCanes', 'stars'], acc: (c) => ({ front: [...A.crown(c), ...A.bowTie(c, '#FF5F7E')] }) }),
      card('S', 'vuong-mien-kim-cuong', 'Vương Miện Kim Cương', 'Diamond Crown', { expr: 'happy', scene: ['rainbow', 'stars', 'hearts', 'confetti', 'candyCanes'], acc: (c) => ({ front: [...A.diamondCrown(c), ...A.scepter(c)] }) }),
    ],
  },

  'doi-xe-vu-tru': {
    variants: [
      V('phan-luc', 'Phản Lực', 'Jet Boost', { expr: 'happy', scene: ['space', 'planet', 'speed'], sky: 'space', ground: 'rock', transform: { ty: -30, rot: -4, px: 300, py: 440 }, acc: (c) => ({ behind: A.jetFlame(c) }) }),
      V('kinh-vom', 'Kính Vòm Không Gian', 'Space Dome', { expr: 'happy', scene: ['space'], sky: 'space', ground: 'rock', transform: { scale: 0.88, px: 300, py: 470 }, acc: (c) => ({ behind: A.glassDome(c) }) }),
      V('vuot-mua-da', 'Vượt Mưa Đá Vũ Trụ', 'Meteor Dash', {
        expr: 'surprised', scene: ['space'], sky: 'space', ground: 'rock', transform: { rot: -6, px: 300, py: 440 },
        acc: () => ({ front: [...asteroid('thien-thach-1', 96, 150, 50), ...asteroid('thien-thach-2', 500, 110, 40), ...asteroid('thien-thach-3', 540, 290, 32), ...asteroid('thien-thach-4', 70, 320, 34)] }),
      }),
      V('ha-canh', 'Hạ Cánh Hành Tinh Lạ', 'Planet Landing', { expr: 'happy', scene: ['space', 'planet', 'craters', 'flag'], sky: 'space', ground: 'rock', acc: () => ({}) }),
      V('tram-vu-tru', 'Ghé Trạm Vũ Trụ', 'Space Station Stop', { expr: 'happy', scene: ['space', 'station'], sky: 'space', ground: 'rock', acc: (c) => ({ front: A.antenna(c) }) }),
    ],
    cards: [
      card('C', 'tap-su', 'Tập Sự', 'Cadet', { expr: 'happy', scene: ['space'], sky: 'space', ground: 'rock', acc: () => ({}) }),
      card('B', 'tuan-tra', 'Tuần Tra', 'Patrol', { expr: 'happy', scene: ['space', 'planet'], sky: 'space', ground: 'rock', acc: (c) => ({ front: A.antenna(c) }) }),
      card('A', 'tham-hiem', 'Thám Hiểm', 'Explorer', { expr: 'happy', scene: ['space', 'station', 'planet'], sky: 'space', ground: 'rock', acc: (c) => ({ behind: A.jetFlame(c), front: A.antenna(c) }) }),
      card('S', 'chi-huy-ngan-ha', 'Chỉ Huy Ngân Hà', 'Galaxy Commander', { expr: 'happy', scene: ['space', 'stars', 'planet', 'confetti'], sky: 'space', ground: 'rock', transform: { ty: -24, scale: 0.9, px: 300, py: 440 }, acc: (c) => ({ behind: A.jetFlame(c), front: A.goldStarBadge(c) }) }),
    ],
  },

  'thi-tran-khung-long': {
    variants: [
      V('dau-bep', 'Đầu Bếp', 'Chef', { expr: 'happy', scene: ['sun', 'clouds', 'volcano'], acc: (c) => ({ front: [...A.chefHat(c), ...A.fryingPan(c)] }) }),
      V('linh-cuu-hoa', 'Lính Cứu Hỏa', 'Firefighter', { expr: 'happy', scene: ['clouds', 'volcano'], acc: (c) => ({ front: [...A.fireHelmet(c), ...A.hose(c)] }) }),
      V('bac-si', 'Bác Sĩ', 'Doctor', { expr: 'happy', scene: ['sun', 'hearts'], acc: (c) => ({ front: [...A.doctorCap(c), ...A.medicalBag(c)] }) }),
      V('nong-dan', 'Nông Dân', 'Farmer', { expr: 'happy', scene: ['sun', 'clouds', 'flowers'], acc: (c) => ({ front: [...A.strawHat(c), ...A.carrotBasket(c)] }) }),
      V('nha-tham-hiem', 'Nhà Thám Hiểm', 'Explorer', { expr: 'happy', scene: ['sun', 'clouds', 'flowers', 'butterfly'], acc: (c) => ({ behind: A.backpack(c), front: A.safariHat(c) }) }),
    ],
    cards: [
      card('C', 'cu-dan', 'Cư Dân Thị Trấn', 'Townsfolk', { expr: 'happy', scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'lich-lam', 'Lịch Lãm', 'Dapper', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ front: A.bowTie(c, '#FF5F7E', 70) }) }),
      card('A', 'nguoi-hung-thi-tran', 'Người Hùng Thị Trấn', 'Town Hero', { expr: 'happy', scene: ['rainbow', 'volcano', 'stars'], acc: (c) => ({ front: [...A.fireHelmet(c), ...A.bowTie(c, '#4FA3E0', 70)] }) }),
      card('S', 'vua-thung-lung', 'Vua Thung Lũng', 'Valley King', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti', 'volcano'], acc: (c) => ({ front: [...A.crown(c), ...A.scepter(c)] }) }),
    ],
  },

  'the-thao-trai-cay': {
    variants: [
      V('da-bong', 'Đá Bóng', 'Soccer', { expr: 'happy', scene: ['sun', 'goal'], acc: (c) => ({ behind: A.limbs(c), front: soccerBall('bong-da', c.right + 40, c.bb[3] + 2, 44) }) }),
      V('boi-loi', 'Bơi Lội', 'Swimming', { expr: 'happy', scene: ['sun', 'bubbles'], ground: 'water', acc: (c) => ({ behind: A.limbs(c), preface: A.goggles(c) }) }),
      V('truot-van', 'Trượt Ván', 'Skateboard', { expr: 'tongue', scene: ['clouds', 'motion'], transform: { ty: -36, rot: -6, scale: 0.9, px: 300, py: 420 }, acc: (c) => ({ behind: A.limbs(c), front: A.skateboard(c) }) }),
      V('nhay-day', 'Nhảy Dây', 'Jump Rope', { expr: 'happy', scene: ['sun', 'shadow'], transform: { ty: -40, scale: 0.88, px: 300, py: 420 }, acc: (c) => ({ behind: A.limbs(c), front: A.jumpRope(c) }) }),
      V('bong-ro', 'Bóng Rổ', 'Basketball', { expr: 'happy', scene: ['clouds', 'hoop'], acc: (c) => ({ behind: A.limbs(c), front: basketball('bong-ro', c.right + 30, c.bb[3] - 70, 42) }) }),
    ],
    cards: [
      card('C', 'van-dong-vien', 'Vận Động Viên', 'Athlete', { expr: 'happy', scene: ['sun', 'clouds'], acc: (c) => ({ behind: A.limbs(c) }) }),
      card('B', 'tuyen-thu', 'Tuyển Thủ', 'Team Player', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ behind: A.limbs(c), front: A.sportCap(c) }) }),
      card('A', 'tren-buc-nhan-giai', 'Trên Bục Nhận Giải', 'On the Podium', { expr: 'happy', scene: ['rainbow', 'podium', 'confetti'], transform: { ty: -128, scale: 0.72, px: 300, py: 480 }, acc: (c) => ({ behind: A.limbs(c), front: A.goldMedal(c) }) }),
      card('S', 'vo-dich-cup-vang', 'Nhà Vô Địch Cúp Vàng', 'Golden Cup Champion', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti', 'hearts'], transform: { ty: -24, scale: 0.84, px: 250, py: 480 }, acc: (c) => ({ behind: A.limbs(c), front: [...A.crown(c), ...A.goldMedal(c), ...A.trophy(c)] }) }),
    ],
  },
};
