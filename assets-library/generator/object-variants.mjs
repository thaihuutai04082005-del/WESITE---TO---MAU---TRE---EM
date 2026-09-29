// Lớp 3 — mỗi đối tượng có 5 biến thể RIÊNG (không trùng đối tượng khác), vẫn bám concept của chủ đề.
// Danh sách tên đã chốt với chủ web (xem docs/ma-tran-chu-de.md). Thẻ C/B/A/S vẫn theo chủ đề (themes.mjs).
// acc(c) → { behind, preface, front } gắn theo chủ thể; { back, mid, fg } là cảnh riêng của biến thể.
import * as A from './accessories.mjs';
import * as X from './props.mjs';
import { E, C, R, P, D, line, star, heart } from './shapes.mjs';

const V = (slug, vi, en, opts) => ({ slug, name: { vi, en }, scene: [], expr: 'happy', ...opts });

// ======================= 01 · ANH HÙNG SIÊU THÚ =======================

const SIEU_THU = {
  'su-tu': [
    V('ruc-lua', 'Rực Lửa', 'Blazing', {
      scene: ['stars'], sky: 'sunset',
      acc: (c) => ({ behind: A.cape(c, '#FF5F5F'), front: [...A.flame('ngon-lua-trai', c.left - 10, c.bb[3] + 8, 1.5), ...A.flame('ngon-lua-phai', c.right + 10, c.bb[3] + 8, 1.5), ...A.flame('ngon-lua-tren-trai', c.left - 40, c.bb[3] - 140, 0.9), ...A.flame('ngon-lua-tren-phai', c.right + 40, c.bb[3] - 160, 0.9)] }),
    }),
    V('tieng-gam-song-am', 'Tiếng Gầm Sóng Âm', 'Sonic Roar', {
      expr: 'surprised', scene: ['clouds', 'wind'],
      acc: (c) => ({ behind: A.cape(c, '#4FA3E0'), front: [...X.soundWaves('song-am-trai', c.face.x - 90, c.face.y + 36, -1), ...X.soundWaves('song-am-phai', c.face.x + 90, c.face.y + 36, 1)] }),
    }),
    V('nang-tang-da', 'Nâng Tảng Đá', 'Boulder Lift', {
      scene: ['sun', 'clouds'], transform: { ty: 20, scale: 0.85, px: 300, py: 480 },
      acc: (c) => ({ behind: A.cape(c, '#FF9F43'), front: [...X.boulder('tang-da', c.cx, c.bb[1] - 40, 70), ...X.sparkles('lap-lanh', [[c.cx - 150, c.bb[1] - 60, 16], [c.cx + 150, c.bb[1] - 30, 14]])] }),
    }),
    V('khien-hoang-gia', 'Khiên Hoàng Gia', 'Royal Shield', {
      scene: ['sun', 'flowers'],
      acc: (c) => ({ behind: A.cape(c, '#7D5FFF'), front: [...A.smallCrown(c), ...A.shield(c, '#FFD54F', '#FFFFFF')] }),
    }),
    V('bom-anh-sang', 'Bờm Ánh Sáng', 'Radiant Mane', {
      scene: ['clouds'],
      acc: (c) => ({ behind: [...X.aura(c, '#FFE066'), ...A.cape(c, '#FFC94D')], front: X.sparkles('tia-sang', [[110, 160, 20], [490, 180, 18], [90, 340, 14], [510, 360, 16]]) }),
    }),
  ],
  ho: [
    V('tia-chop', 'Tia Chớp', 'Lightning', {
      scene: ['clouds', 'motion'],
      acc: (c) => ({ behind: A.cape(c, '#4FA3E0'), preface: A.mask(c, '#2B7CC4'), front: [A.bolt('tia-chop-trai', c.left - 40, midYc(c) - 150, 1.7), A.bolt('tia-chop-phai', c.right + 60, midYc(c) - 90, 1.5)] }),
    }),
    V('mong-vuot-laser', 'Móng Vuốt Laser', 'Laser Claws', {
      scene: ['space'], sky: 'space',
      acc: (c) => ({ behind: A.cape(c, '#FF5F5F'), preface: A.mask(c, '#2F3640'), front: [X.bar('tia-laser-trai', c.left + 20, c.bb[3] - 60, 60, 200, 14, '#FF5F7E'), X.bar('tia-laser-phai', c.right - 20, c.bb[3] - 60, 540, 200, 14, '#FF5F7E')] }),
    }),
    V('sieu-toc', 'Siêu Tốc', 'Super Speed', {
      scene: ['clouds', 'speed', 'motion'], transform: { rot: -8, px: 300, py: 460 },
      acc: (c) => ({ behind: A.cape(c, '#4CD787'), preface: A.mask(c, '#2E7D32'), fg: [A.bolt('tia-toc-do', 500, 150, 1.2, '#4CD787')] }),
    }),
    V('bang-gia', 'Băng Giá', 'Frost', {
      scene: ['snow'], sky: 'snow', ground: 'snow',
      acc: (c) => ({ behind: A.cape(c, '#B3E5FC'), front: [A.iceCrystal('pha-le-bang-1', c.left - 60, midYc(c) - 90, 44), A.iceCrystal('pha-le-bang-2', c.right + 60, midYc(c) - 30, 40), A.iceCrystal('pha-le-bang-3', c.left - 30, midYc(c) + 70, 30)] }),
    }),
    V('nhay-vot-qua-nui', 'Nhảy Vọt Qua Núi', 'Mountain Leap', {
      scene: ['clouds', 'motion'], transform: { ty: -110, rot: -10, scale: 0.8, px: 300, py: 400 },
      acc: (c) => ({ behind: A.cape(c, '#FF9F43'), back: X.mountains() }),
    }),
  ],
  'voi-sieu-thu': [
    V('voi-rong-nuoc', 'Vòi Rồng Nước', 'Water Cannon', {
      scene: ['sun'],
      acc: (c) => ({ behind: A.cape(c, '#4FA3E0'), front: X.waterJet(262, 396, 110, 140) }),
    }),
    V('khong-lo', 'Khổng Lồ', 'Giant', {
      scene: ['clouds'], transform: { ty: 30, scale: 1.12, px: 300, py: 480 },
      acc: (c) => ({ behind: A.cape(c, '#FF5F5F'), fg: [...cloudsLow()] }),
    }),
    V('tai-bay-luon', 'Tai Bay Lượn', 'Ear Glider', {
      scene: ['clouds', 'sun', 'motion'], transform: { ty: -60, scale: 0.9, px: 300, py: 400 },
      acc: (c) => ({ preface: A.mask(c, '#7D5FFF') }),
    }),
    V('bong-bong-bao-ve', 'Bong Bóng Bảo Vệ', 'Bubble Shield', {
      scene: ['sun', 'flowers'], transform: { scale: 0.88, px: 300, py: 470 },
      acc: (c) => ({ behind: [...X.bigBubble(c), ...A.cape(c, '#FF7AA2')] }),
    }),
    V('dam-chan-dong-dat', 'Dậm Chân Động Đất', 'Earthquake Stomp', {
      scene: ['clouds', 'motion'],
      acc: (c) => ({ behind: A.cape(c, '#8D6E63'), mid: [...X.cracks('vet-nut-1', 140, 520), ...X.cracks('vet-nut-2', 450, 540)], fg: [...X.boulder('da-bay-1', 90, 360, 18), ...X.boulder('da-bay-2', 520, 330, 22)] }),
    }),
  ],
  'dai-bang': [
    V('canh-thep', 'Cánh Thép', 'Steel Wings', {
      scene: ['clouds', 'sun'],
      acc: (c) => ({ behind: A.cape(c, '#FF5F5F'), front: X.steelPlates(c) }),
    }),
    V('mat-than-tia-x', 'Mắt Thần Tia X', 'X-Ray Eyes', {
      scene: ['space'], sky: 'space',
      acc: (c) => ({ behind: A.cape(c, '#7D5FFF'), preface: X.visor(c), front: X.eyeBeams(c) }),
    }),
    V('loc-xoay', 'Lốc Xoáy', 'Whirlwind', {
      scene: ['clouds', 'wind'], transform: { ty: -30, scale: 0.8, px: 300, py: 300 },
      acc: () => ({ back: X.tornado('loc-xoay', 300, 120, 360, 200) }),
    }),
    V('long-vu-phi-tieu', 'Lông Vũ Phi Tiêu', 'Feather Darts', {
      scene: ['clouds', 'sun'],
      acc: (c) => ({ behind: A.cape(c, '#4CD787'), preface: A.mask(c, '#2E7D32'), fg: [...X.feather('long-vu-1', 90, 180, 60), ...X.feather('long-vu-2', 120, 300, 70), ...X.feather('long-vu-3', 500, 200, -60), ...X.feather('long-vu-4', 480, 320, -70)] }),
    }),
    V('bo-nhao-sieu-toc', 'Bổ Nhào Siêu Tốc', 'Power Dive', {
      scene: ['clouds', 'speed'], transform: { rot: 28, scale: 0.85, px: 300, py: 330 },
      acc: (c) => ({ behind: A.cape(c, '#FF9F43'), preface: A.mask(c, '#E65100') }),
    }),
  ],
  'meo-sieu-thu': [
    V('bong-dem', 'Bóng Đêm', 'Shadow Night', {
      scene: ['space'], sky: 'night',
      acc: (c) => ({ behind: A.cape(c, '#5E35B1'), preface: A.mask(c, '#2F3640') }),
    }),
    V('leo-tuong', 'Leo Tường', 'Wall Climber', {
      transform: { tx: -40, rot: -12, px: 300, py: 400 },
      acc: (c) => ({ behind: A.cape(c, '#FF5F5F'), preface: A.mask(c, '#FF5F5F'), back: X.brickWall(110, 470) }),
    }),
    V('nhay-sieu-cao', 'Nhảy Siêu Cao', 'Super Jump', {
      scene: ['clouds', 'motion'], transform: { ty: -120, scale: 0.8, px: 300, py: 400 },
      acc: (c) => ({ behind: A.cape(c, '#4CD787'), mid: [E('lo-xo-1', 300, 480, 60, 12, '#BFC8D0')] }),
    }),
    V('ria-radar', 'Ria Radar', 'Whisker Radar', {
      scene: ['clouds'],
      acc: (c) => ({ behind: A.cape(c, '#4FA3E0'), front: [...X.soundWaves('radar-trai', c.face.x - 110, c.face.y + 40, -1, '#B2EBF2'), ...X.soundWaves('radar-phai', c.face.x + 110, c.face.y + 40, 1, '#B2EBF2')] }),
    }),
    V('chin-mang', 'Chín Mạng', 'Nine Lives', {
      scene: ['clouds'],
      acc: (c) => ({ behind: A.cape(c, '#FF7AA2'), fg: X.hearts('mang', [[70, 110, 1], [160, 70, 1], [300, 50, 1], [440, 70, 1], [530, 110, 1], [60, 250, 0.9], [540, 250, 0.9], [70, 380, 0.8], [530, 380, 0.8]]) }),
    }),
  ],
  'cho-sieu-thu': [
    V('mui-tham-tu', 'Mũi Thám Tử', 'Super Sniffer', {
      scene: ['sun', 'clouds'],
      acc: (c) => ({ behind: A.cape(c, '#C8A26B'), front: X.detectiveCap(c), mid: X.footprints() }),
    }),
    V('cuu-ho-sieu-toc', 'Cứu Hộ Siêu Tốc', 'Rescue Dash', {
      scene: ['clouds', 'speed'], transform: { rot: -6, px: 300, py: 460 },
      acc: (c) => ({ behind: A.cape(c, '#FF5F5F'), front: X.rescueCross(c.cx, c.bb[3] - 70, 1) }),
    }),
    V('khien-xuong', 'Khiên Xương', 'Bone Shield', {
      scene: ['sun', 'flowers'],
      acc: (c) => ({ behind: A.cape(c, '#4FA3E0'), preface: A.mask(c, '#2B7CC4'), front: X.boneShield(c) }),
    }),
    V('chi-huy-doi', 'Chỉ Huy Đội', 'Team Commander', {
      scene: [],
      acc: (c) => ({ behind: A.cape(c, '#7D5FFF'), front: [...X.headset(c), ...X.walkieTalkie(c.right + 24, c.bb[3] - 70), star('sao-chi-huy', c.cx, c.bb[3] - 90, 24, 10, '#FFD54F')] }),
    }),
    V('nhay-du-cuu-ho', 'Nhảy Dù Cứu Hộ', 'Parachute Rescue', {
      scene: ['clouds', 'sun', 'shadow'], transform: { ty: 30, scale: 0.72, px: 300, py: 480 },
      acc: (c) => ({ behind: A.cape(c, '#FF9F43'), front: X.parachute(c) }),
    }),
  ],
};

function midYc(c) {
  return (c.bb[1] + c.bb[3]) / 2;
}

function cloudsLow() {
  return [E('may-thap-1', 90, 470, 80, 24, '#F0F4F8'), E('may-thap-2', 520, 480, 90, 26, '#F0F4F8')];
}


// ======================= 02 · VƯƠNG QUỐC KẸO NGỌT =======================
// Bánh kẹo không có tay: đạo cụ đặt cạnh thân (bên phải c.right / bên trái c.left).

const robeCtx = (c) => c;
const KEO = {
  donut: [
    V('nha-vua', 'Nhà Vua', 'King', { scene: ['sun', 'candyCanes'], acc: (c) => ({ behind: X.robe(robeCtx(c), '#E74C3C'), front: [...A.crown(c), ...A.scepter(c)] }) }),
    V('le-dang-quang', 'Lễ Đăng Quang', 'Coronation', {
      scene: ['confetti', 'stars'],
      acc: (c) => ({ front: A.crown(c, '#FFD700', '#7DE2FF', 'vuong-mien', 1), mid: [P('tham-do', [[220, 600], [380, 600], [340, 440], [260, 440]], '#E74C3C')], fg: X.sparkles('lap-lanh', [[90, 150, 20], [510, 150, 20], [120, 330, 14], [480, 330, 14]]) }),
    }),
    V('tiec-tra-hoang-gia', 'Tiệc Trà Hoàng Gia', 'Royal Tea Party', { scene: ['clouds', 'flowers'], transform: { tx: -60, scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: [...A.tiara(c)], fg: [...X.teaSet(470, 330), ...X.teaCup(390, 360)] }) }),
    V('dieu-hanh-hoang-gia', 'Diễu Hành Hoàng Gia', 'Royal Parade', { scene: ['sun', 'confetti'], acc: (c) => ({ front: [...A.smallCrown(c), ...A.flagPole(c, 1)], fg: X.bunting(80) }) }),
    V('nguoi-dua-thu', 'Người Đưa Thư Hoàng Gia', 'Royal Mail Carrier', { scene: ['clouds', 'candyCanes'], acc: (c) => ({ behind: X.mailBag(c), front: [...A.sportCap({ ...c }), ...X.envelope(c.right + 50, c.bb[3] - 120)] }) }),
  ],
  cupcake: [
    V('cong-chua', 'Công Chúa', 'Princess', { scene: ['hearts', 'flowers', 'candyCanes'], acc: (c) => ({ behind: X.ballGown(c), front: A.tiara(c) }) }),
    V('nang-tien-duong', 'Nàng Tiên Đường', 'Sugar Fairy', { scene: ['clouds', 'stars'], acc: (c) => ({ behind: X.fairyWings(c), front: X.fairyWand(c.right + 20, c.bb[3] - 170) }) }),
    V('da-hoi-khieu-vu', 'Dạ Hội Khiêu Vũ', 'Royal Ball', { scene: ['stars', 'confetti'], sky: 'night', transform: { rot: -8, px: 300, py: 470 }, acc: (c) => ({ behind: X.ballGown(c, '#7DE2FF'), front: [...A.tiara(c), ...X.musicNotes('not-nhac', [[110, 200], [480, 170], [520, 300]])] }) }),
    V('vuon-hoa-thuong-uyen', 'Vườn Hoa Thượng Uyển', 'Palace Garden', { scene: ['sun', 'flowers', 'butterfly'], acc: (c) => ({ front: X.bouquet(c.right + 40, c.bb[3] - 100) }) }),
    V('tiec-sinh-nhat', 'Tiệc Sinh Nhật Công Chúa', 'Princess Birthday', { scene: ['balloons', 'confetti', 'hat'], acc: (c) => ({ fg: [...X.giftBox('hop-qua-1', 470, 520, 70, '#4FA3E0'), ...X.giftBox('hop-qua-2', 120, 530, 60, '#FF9EC0', '#FFD54F')] }) }),
  ],
  'keo-mut': [
    V('hoang-tu', 'Hoàng Tử', 'Prince', { scene: ['clouds', 'candyCanes'], acc: (c) => ({ behind: X.robe(c, '#4FA3E0'), front: [...A.smallCrown(c), ...A.bowTie({ ...c, face: { ...c.face, y: c.face.y + 60 } })] }) }),
    V('hiep-si', 'Hiệp Sĩ', 'Knight', { scene: ['clouds', 'candyCanes'], acc: (c) => ({ front: [...A.knightHelmet(c), ...A.sword(c, 1), ...A.shield({ ...c, bb: [c.bb[0], c.bb[1], c.bb[2], c.bb[3] - 140] }, '#FF7AA2', '#FFFFFF', -1)] }) }),
    V('can-ve-cam-giao', 'Cận Vệ Cầm Giáo', 'Spear Guard', { scene: ['sun', 'candyCanes'], acc: (c) => ({ front: [...A.guardHat(c), ...X.spear(c.right + 30, c.bb[3], 320)] }) }),
    V('nhac-cong-ken-dong', 'Nhạc Công Kèn Đồng', 'Brass Musician', { scene: ['clouds'], acc: (c) => ({ front: [...X.trumpet(c.right - 20, c.face.y + 30), ...X.musicNotes('not-nhac', [[480, 140], [530, 90], [90, 200]])] }) }),
    V('phap-su-keo-ngot', 'Pháp Sư Kẹo Ngọt', 'Candy Wizard', { scene: ['stars'], sky: 'night', acc: (c) => ({ front: [...X.wizardHat(c), ...X.fairyWand(c.right + 20, c.bb[3] - 200, '#FFE066')], fg: X.sparkles('phep', [[110, 150, 18], [500, 260, 14], [90, 340, 12]]) }) }),
  ],
  'kem-oc-que': [
    V('nu-hoang-bang-gia', 'Nữ Hoàng Băng Giá', 'Ice Queen', { scene: ['snow'], sky: 'snow', ground: 'snow', acc: (c) => ({ behind: X.robe(c, '#B3E5FC'), front: X.iceCrown(c) }) }),
    V('thi-nu-quat-long', 'Thị Nữ Quạt Lông', 'Feather Fan Maid', { scene: ['sun', 'flowers'], acc: (c) => ({ front: [...A.ribbonBow(c), ...X.featherFan(c.right + 60, c.bb[3] - 120)] }) }),
    V('tho-lam-vuon', 'Thợ Làm Vườn Hoàng Gia', 'Royal Gardener', { scene: ['sun', 'flowers', 'butterfly'], acc: (c) => ({ front: [...A.strawHat(c), ...X.wateringCan(c.right + 60, c.bb[3] - 60)] }) }),
    V('dau-bep-hoang-gia', 'Đầu Bếp Hoàng Gia', 'Royal Chef', { scene: ['clouds'], acc: (c) => ({ front: [...A.chefHat(c), ...X.ladle(c.right + 30, c.bb[3] - 60)], fg: X.cookPot(110, 520) }) }),
    V('ngu-trua-goi-nhung', 'Ngủ Trưa Gối Nhung', 'Velvet Nap', { expr: 'sleep', scene: ['zzz', 'stars'], sky: 'night', acc: (c) => ({ front: A.smallCrown(c), mid: X.pillow(c) }) }),
  ],
  'banh-quy': [
    V('linh-gac', 'Lính Gác', 'Royal Guard', { scene: ['sun', 'candyCanes'], acc: (c) => ({ front: [...A.guardHat(c), ...A.flagPole(c, 1)] }) }),
    V('thu-kho-chia-khoa', 'Thủ Kho Chìa Khóa', 'Key Keeper', { scene: ['clouds'], acc: (c) => ({ front: [...A.sportCap(c), ...X.bigKey(c.right + 40, c.bb[3] - 100)] }) }),
    V('thu-thu-hoang-gia', 'Thủ Thư Hoàng Gia', 'Royal Librarian', { scene: [], acc: (c) => ({ preface: X.glasses(c), front: X.openBook(c.cx, c.bb[3] - 40) }) }),
    V('nguoi-gac-chuong', 'Người Gác Chuông', 'Bell Keeper', { scene: ['clouds'], transform: { tx: -60, scale: 0.85, px: 300, py: 480 }, acc: () => ({ fg: X.bell(470, 250) }) }),
    V('xa-thu-cung-ten', 'Xạ Thủ Cung Tên', 'Archer', { scene: ['clouds'], transform: { tx: -40, px: 300, py: 480 }, acc: (c) => ({ front: [...A.safariHat(c), ...X.bowAndArrow(c.right + 20, (c.bb[1] + c.bb[3]) / 2)] }) }),
  ],
  'banh-kem': [
    V('hoang-hau', 'Hoàng Hậu', 'Queen', { scene: ['sun', 'candyCanes'], acc: (c) => ({ behind: X.robe(c, '#7D5FFF'), front: [...A.crown(c, '#FFD700', '#7DE2FF'), ...X.necklace(c)] }) }),
    V('dam-cuoi-co-tich', 'Đám Cưới Cổ Tích', 'Fairytale Wedding', { scene: ['hearts', 'flowers'], acc: (c) => ({ back: X.flowerArch(), front: X.bouquet(c.right + 40, c.bb[3] - 80) }) }),
    V('dem-hoi-anh-nen', 'Đêm Hội Ánh Nến', 'Candlelight Night', { scene: ['stars'], sky: 'night', acc: () => ({ mid: [...X.candle('nen-1', 70, 520, 70), ...X.candle('nen-2', 130, 540, 50, '#FFD6E7'), ...X.candle('nen-3', 470, 540, 50, '#D6F0FF'), ...X.candle('nen-4', 530, 520, 70)] }) }),
    V('yen-tiec-hoang-cung', 'Yến Tiệc Hoàng Cung', 'Palace Banquet', { scene: ['confetti'], transform: { ty: -40, scale: 0.85, px: 300, py: 480 }, acc: () => ({ fg: X.banquetTable(560) }) }),
    V('qua-mung-sinh-nhat-vua', 'Quà Mừng Sinh Nhật Vua', 'Birthday Gift for the King', { scene: ['balloons', 'confetti'], acc: (c) => ({ front: A.crown(c), fg: [...X.giftBox('hop-qua-1', 90, 540, 80, '#FF7AA2', '#FFD54F'), ...X.giftBox('hop-qua-2', 510, 540, 70, '#4CD787'), ...X.giftBox('hop-qua-3', 520, 450, 46, '#FFD54F')] }) }),
  ],
};

// ======================= 03 · ĐỘI XE CHINH PHỤC VŨ TRỤ =======================
const SV = (slug, vi, en, opts) => V(slug, vi, en, { sky: 'space', ground: 'rock', ...opts, scene: ['space', ...(opts.scene || [])] });

const XE = {
  'xe-dua': [
    SV('phan-luc', 'Phản Lực', 'Jet Boost', { scene: ['planet', 'speed'], transform: { ty: -30, rot: -4, px: 300, py: 440 }, acc: (c) => ({ behind: A.jetFlame(c) }) }),
    SV('dua-vong-quanh-hanh-tinh', 'Đua Vòng Quanh Hành Tinh', 'Planet Lap', { transform: { ty: 20, scale: 0.8, rot: -6, px: 300, py: 480 }, acc: () => ({ back: X.bigPlanet(300, 200, 110, '#FF8A65') }) }),
    SV('dua-tren-duong-sao', 'Đua Trên Đường Sao', 'Star Road Race', { scene: ['planet'], transform: { ty: -30, scale: 0.9, px: 300, py: 440 }, acc: () => ({ mid: X.starRoad() }) }),
    SV('vuot-mua-thien-thach', 'Vượt Mưa Thiên Thạch', 'Meteor Shower Dash', { expr: 'surprised', transform: { rot: -6, px: 300, py: 440 }, acc: () => ({ fg: [...A.asteroid('thien-thach-1', 96, 150, 50), ...A.asteroid('thien-thach-2', 500, 110, 40), ...A.asteroid('thien-thach-3', 540, 290, 32), ...A.asteroid('thien-thach-4', 70, 320, 34)] }) }),
    SV('ve-dich-ngan-ha', 'Về Đích Ngân Hà', 'Galaxy Finish Line', { scene: ['confetti'], transform: { tx: -40, px: 300, py: 480 }, acc: () => ({ mid: X.finishFlag(470, 470) }) }),
  ],
  'xe-buyt-vu-tru': [
    SV('cho-phi-hanh-gia', 'Chở Phi Hành Gia Đi Học', 'Astronaut School Bus', { acc: () => ({ front: [...X.helmetHead('phi-hanh-gia-1', 170, 318), ...X.helmetHead('phi-hanh-gia-2', 255, 318), ...X.helmetHead('phi-hanh-gia-3', 340, 318)] }) }),
    SV('kinh-vom-khong-gian', 'Kính Vòm Không Gian', 'Space Dome', { transform: { scale: 0.88, px: 300, py: 470 }, acc: (c) => ({ behind: A.glassDome(c) }) }),
    SV('nhun-nhay-hanh-tinh-la', 'Nhún Nhảy Trên Hành Tinh Lạ', 'Bouncy Planet Ride', { scene: ['craters', 'motion'], transform: { ty: -60, rot: 6, px: 300, py: 440 }, acc: () => ({ mid: [E('bong-xe-buyt', 300, 500, 150, 16, '#9AA1AD')] }) }),
    SV('tram-dung-vu-tru', 'Trạm Dừng Vũ Trụ', 'Space Bus Stop', { scene: ['station'], transform: { tx: 40, scale: 0.9, px: 300, py: 480 }, acc: () => ({ mid: X.busStop(70, 480) }) }),
    SV('chay-tren-vanh-dai', 'Chạy Trên Vành Đai Hành Tinh', 'Planet Ring Road', { transform: { ty: -30, scale: 0.8, px: 300, py: 480 }, acc: () => ({ back: X.bigPlanet(300, 520, 150, '#FFB74D'), mid: X.ringRoad() }) }),
  ],
  'xe-cuu-hoa': [
    SV('dap-lua-thien-thach', 'Dập Lửa Thiên Thạch', 'Meteor Firefighter', { acc: () => ({ fg: [...X.flamingMeteor(110, 160), ...X.waterJet(330, 380, 150, 190)] }) }),
    SV('thang-len-tram', 'Thang Lên Trạm Vũ Trụ', 'Ladder to the Station', { scene: ['station'], acc: () => ({ mid: X.ladderUp(260, 300, 200, 150) }) }),
    SV('cuu-ho-tau-vu-tru', 'Cứu Hộ Tàu Vũ Trụ', 'Spaceship Rescue', { scene: ['planet'], acc: () => ({ fg: [...X.smallRocket(120, 180, -35), ...X.foam('khoi', [[60, 250, 16], [90, 270, 12]])] }) }),
    SV('phun-bot', 'Phun Bọt Không Trọng Lực', 'Zero-G Foam', { acc: () => ({ fg: X.foam('bot', [[100, 150, 30], [150, 110, 22], [70, 220, 20], [520, 140, 26], [480, 200, 18], [540, 250, 16], [200, 170, 14]]) }) }),
    SV('tuan-tra-hanh-tinh-la', 'Tuần Tra Hành Tinh Lạ', 'Alien Planet Patrol', { scene: ['craters', 'flag'], acc: () => ({ fg: X.beams(395, 262, 1) }) }),
  ],
  'tau-hoa-vu-tru': [
    SV('duong-ray-ngan-ha', 'Đường Ray Ngân Hà', 'Galaxy Railway', { scene: ['planet'], transform: { ty: -20, px: 300, py: 480 }, acc: () => ({ mid: X.rails(470) }) }),
    SV('toc-hanh-xuyen-sao', 'Tốc Hành Xuyên Sao', 'Star Express', { scene: ['speed'], transform: { ty: -40, rot: -5, px: 300, py: 440 }, acc: () => ({ back: X.starStreaks() }) }),
    SV('cho-hang-len-tram', 'Chở Hàng Lên Trạm', 'Cargo to the Station', { scene: ['station'], transform: { tx: 40, scale: 0.85, px: 300, py: 480 }, acc: () => ({ mid: X.crates(80, 480) }) }),
    SV('duong-ham-vu-tru', 'Đường Hầm Vũ Trụ', 'Space Tunnel', { transform: { scale: 0.8, px: 300, py: 380 }, acc: () => ({ back: X.wormhole(300, 290) }) }),
    SV('toa-kinh-ngam-sao', 'Toa Kính Ngắm Sao', 'Stargazing Car', { acc: (c) => ({ behind: A.glassDome(c), back: X.constellation() }) }),
  ],
  'may-bay-vu-tru': [
    SV('canh-ten-lua', 'Cánh Tên Lửa', 'Rocket Wings', { scene: ['planet'], transform: { ty: -40, px: 300, py: 400 }, acc: () => ({ front: X.boosters(352, [240, 420]) }) }),
    SV('bay-qua-vong-hanh-tinh', 'Bay Qua Vòng Hành Tinh', 'Through the Planet Ring', { transform: { ty: -20, scale: 0.85, px: 300, py: 330 }, acc: () => ({ back: X.bigPlanet(300, 300, 110, '#FF8A65', '#FFE0B5') }) }),
    SV('nhao-lon-giua-sao', 'Nhào Lộn Giữa Sao', 'Star Loop', { scene: ['stars'], transform: { rot: -25, scale: 0.85, px: 330, py: 300 }, acc: () => ({ fg: X.sparkles('vet-sao', [[110, 360, 14], [170, 250, 16], [260, 190, 12]], '#FFE066') }) }),
    SV('tiep-nhien-lieu', 'Tiếp Nhiên Liệu Ở Trạm', 'Station Refuel', { scene: ['station'], transform: { ty: -20, px: 300, py: 400 }, acc: () => ({ fg: X.fuelHose(210, 150, 250, 330) }) }),
    SV('ha-canh-hanh-tinh-la', 'Hạ Cánh Hành Tinh Lạ', 'Alien Landing', { scene: ['planet', 'craters'], transform: { ty: 60, px: 300, py: 400 }, acc: () => ({ mid: X.runwayLights() }) }),
  ],
  'truc-thang': [
    SV('canh-quat-sieu-toc', 'Cánh Quạt Siêu Tốc', 'Turbo Rotor', { scene: ['speed'], transform: { ty: -40, px: 300, py: 400 }, acc: () => ({ front: X.rotorBlur(310, 234) }) }),
    SV('tha-du-tiep-te', 'Thả Dù Tiếp Tế', 'Supply Drop', { scene: ['planet'], transform: { ty: -80, scale: 0.85, px: 300, py: 300 }, acc: () => ({ fg: X.supplyDrop(420, 330) }) }),
    SV('soi-den-hang', 'Soi Đèn Hang Hành Tinh', 'Cave Searchlight', { transform: { ty: -60, scale: 0.8, px: 300, py: 300 }, acc: () => ({ back: X.caveArch(), fg: X.lightCone(330, 320) }) }),
    SV('cho-ve-tinh', 'Chở Vệ Tinh', 'Satellite Lift', { transform: { ty: -90, scale: 0.8, px: 300, py: 300 }, acc: () => ({ fg: [line('M 300 330 L 300 380', 3), ...X.satellite(300, 430)] }) }),
    SV('cuu-ho-phi-hanh-gia', 'Cứu Hộ Phi Hành Gia', 'Astronaut Rescue', { scene: ['planet'], transform: { ty: -80, scale: 0.85, px: 300, py: 300 }, acc: () => ({ fg: [line('M 330 320 L 370 380', 3), ...X.astronaut('phi-hanh-gia', 380, 420, 1.7)] }) }),
  ],
};

// ======================= 07 · THỊ TRẤN KHỦNG LONG TÀI BA =======================
// Mỗi con một bộ nghề riêng (không con nào trùng nghề). Đồ nghề cầm ở tay phải (c.right).
const hy = (c) => (c.bb[1] + c.bb[3]) / 2 + 60;

const KHUNG_LONG = {
  'khung-long-bao-chua': [
    V('dau-bep', 'Đầu Bếp', 'Chef', { scene: ['sun', 'clouds'], acc: (c) => ({ front: [...A.chefHat(c), ...A.fryingPan(c)] }) }),
    V('ca-si', 'Ca Sĩ', 'Singer', { scene: ['stars'], sky: 'night', acc: (c) => ({ front: [...X.microphone(c.right + 20, hy(c) - 60), ...X.musicNotes('not-nhac', [[100, 150], [480, 120], [520, 230]])], fg: X.sparkles('den-san-khau', [[80, 80, 20], [520, 70, 18]], '#FFE066') }) }),
    V('tho-xay', 'Thợ Xây', 'Builder', { scene: ['sun', 'clouds'], acc: (c) => ({ front: [...X.hardHat(c), ...X.bricks(c.right + 40, c.bb[3])] }) }),
    V('canh-sat-giao-thong', 'Cảnh Sát Giao Thông', 'Traffic Officer', { scene: ['clouds'], acc: (c) => ({ front: [...X.cap(c, '#2B7CC4', '#1B2A38'), ...X.whistle(c), ...X.stopSign(c.right + 70, c.bb[3])] }) }),
    V('buu-ta', 'Bưu Tá', 'Mail Carrier', { scene: ['sun', 'flowers'], acc: (c) => ({ behind: X.mailBag(c), front: [...X.cap(c, '#FFC94D', '#E6A817'), ...X.envelope(c.right + 50, hy(c) - 40)] }) }),
  ],
  'khung-long-co-dai': [
    V('linh-cuu-hoa', 'Lính Cứu Hỏa', 'Firefighter', { scene: ['clouds'], acc: (c) => ({ front: [...A.fireHelmet(c), ...A.hose(c)], back: [...X.tallBuilding(), ...A.flame('lua-toa-nha', 520, 160, 0.9)] }) }),
    V('tho-lau-kinh', 'Thợ Lau Kính Tòa Nhà', 'Window Washer', { scene: ['sun'], transform: { tx: -40, px: 300, py: 480 }, acc: (c) => ({ front: [...X.cap(c, '#4CD787', '#2E7D32'), ...X.squeegee(c.right - 40, 200)], back: X.tallBuilding(), fg: X.bucket(330, 520) }) }),
    V('nguoi-thap-den-duong', 'Người Thắp Đèn Đường', 'Lamplighter', { scene: ['stars'], sky: 'sunset', transform: { tx: 30, px: 300, py: 480 }, acc: (c) => ({ front: [...X.fedora(c, '#2F3640'), ...X.lighterPole(c.right - 60, 300)], back: X.streetLamp(560, 470) }) }),
    V('giao-vien', 'Giáo Viên', 'Teacher', { scene: ['clouds'], transform: { tx: 60, px: 300, py: 480 }, acc: (c) => ({ preface: X.glasses(c), fg: [...X.chalkboard(110, 480)] }) }),
    V('kiem-lam', 'Kiểm Lâm', 'Forest Ranger', { scene: ['sun', 'butterfly'], acc: (c) => ({ front: [...X.rangerHat(c), ...X.lantern(c.right + 40, 380)], back: X.pineTrees() }) }),
  ],
  'khung-long-ba-sung': [
    V('bac-si', 'Bác Sĩ', 'Doctor', { scene: ['sun', 'hearts'], acc: (c) => ({ front: [...A.doctorCap(c), ...A.medicalBag(c)] }) }),
    V('tho-cat-toc', 'Thợ Cắt Tóc', 'Barber', { scene: ['clouds'], acc: (c) => ({ front: [...X.comb(c.left - 30, hy(c) - 40), ...X.scissors(c.right + 40, hy(c) - 20)], mid: X.barberPole(540, 480) }) }),
    V('nguoi-ban-hoa', 'Người Bán Hoa', 'Flower Seller', { scene: ['sun', 'flowers', 'butterfly'], acc: (c) => ({ front: [...X.bucketHat(c, '#FF9EC0'), ...X.flowerBasket(c.right + 50, c.bb[3] - 10)] }) }),
    V('tho-moc', 'Thợ Mộc', 'Carpenter', { scene: ['sun', 'clouds'], acc: (c) => ({ front: [...X.cap(c, '#FF9F43', '#E65100'), ...X.hammerPlank(c.right + 20, c.bb[3] + 4)] }) }),
    V('nhac-truong', 'Nhạc Trưởng', 'Conductor', { scene: ['stars'], sky: 'night', acc: (c) => ({ front: [...A.bowTie(c, '#2F3640', 70), ...X.baton(c.right + 10, hy(c) - 40), ...X.musicNotes('not-nhac', [[90, 170], [150, 110], [500, 140]])] }) }),
  ],
  'khung-long-gai-lung': [
    V('nong-dan', 'Nông Dân', 'Farmer', { scene: ['sun', 'clouds', 'flowers'], acc: (c) => ({ front: [...A.strawHat(c), ...A.carrotBasket(c)] }) }),
    V('tho-lam-vuon', 'Thợ Làm Vườn', 'Gardener', { scene: ['sun', 'flowers', 'butterfly'], acc: (c) => ({ front: [...X.bucketHat(c, '#81C784'), ...X.wateringCan(c.right + 60, c.bb[3] - 50)] }) }),
    V('tho-gom', 'Thợ Gốm', 'Potter', { scene: ['clouds'], acc: (c) => ({ front: [...X.beret(c, '#8D6E63')], fg: X.potteryWheel(500, 520) }) }),
    V('tho-dan-len', 'Thợ Đan Len', 'Knitter', { scene: ['snow'], sky: 'snow', ground: 'snow', acc: (c) => ({ front: [...X.scarf(c, '#FF7AA2'), ...X.yarnBall(c.right + 40, c.bb[3] - 40)] }) }),
    V('nguoi-quet-la', 'Người Quét Lá', 'Leaf Sweeper', { scene: ['wind'], sky: 'sunset', acc: (c) => ({ front: [...X.bucketHat(c, '#FFC94D'), ...X.broom(c.right + 20, c.bb[3])], fg: X.leaves('la-roi', [[80, 200, 20], [140, 300, -30], [500, 180, 40], [540, 330, -10], [110, 520, 10], [480, 540, 30]]) }) }),
  ],
  'duc-long': [
    V('phi-cong', 'Phi Công', 'Pilot', { scene: ['clouds', 'sun'], transform: { ty: -30, px: 300, py: 400 }, acc: (c) => ({ front: [...X.pilotCap(c), ...X.scarf(c, '#FF5F5F')] }) }),
    V('nha-du-bao-thoi-tiet', 'Nhà Dự Báo Thời Tiết', 'Weather Reporter', { scene: ['rain'], acc: (c) => ({ front: X.umbrella(c.cx, c.bb[1] - 30) }) }),
    V('nhiep-anh-gia', 'Nhiếp Ảnh Gia', 'Photographer', { scene: ['sun', 'butterfly'], acc: (c) => ({ front: [...X.beret(c, '#2F3640'), ...X.camera(c.right + 20, hy(c) - 60)] }) }),
    V('nguoi-lam-dieu', 'Người Làm Diều', 'Kite Maker', { scene: ['clouds'], acc: () => ({ fg: [line('M 520 222 Q 530 190 500 150', 2.5), ...X.kite(470, 90)] }) }),
    V('cuu-ho-bo-bien', 'Cứu Hộ Bờ Biển', 'Lifeguard', { scene: ['sun'], ground: 'water', acc: (c) => ({ front: [...X.cap(c, '#FF5F5F', '#C0392B'), ...X.whistle(c), ...X.ringBuoy(c.right + 30, hy(c) - 20)] }) }),
  ],
  'khung-long-mao-ken': [
    V('nha-tham-hiem', 'Nhà Thám Hiểm', 'Explorer', { scene: ['sun', 'clouds', 'flowers', 'butterfly'], acc: (c) => ({ behind: A.backpack(c), front: A.safariHat(c) }) }),
    V('nhac-cong-ken', 'Nhạc Công Kèn', 'Horn Player', { scene: ['clouds'], acc: (c) => ({ front: [...X.beret(c, '#7D5FFF'), ...X.trumpet(c.right - 30, c.face.y + 40), ...X.musicNotes('not-nhac', [[490, 120], [540, 200], [90, 160]])] }) }),
    V('nha-khao-co', 'Nhà Khảo Cổ', 'Archaeologist', { scene: ['sun', 'volcano'], acc: (c) => ({ front: A.safariHat({ ...c, hat: { ...c.hat, s: c.hat.s * 0.9 } }), fg: X.fossil(430, 540) }) }),
    V('huong-dan-vien', 'Hướng Dẫn Viên', 'Tour Guide', { scene: ['sun', 'clouds'], acc: (c) => ({ front: [...X.cap(c, '#4CD787', '#2E7D32'), ...X.tourFlag(c.right + 30, c.bb[3] - 20)] }) }),
    V('tham-tu', 'Thám Tử', 'Detective', { scene: ['clouds'], sky: 'sunset', acc: (c) => ({ front: [...X.fedora(c), ...X.notebook(c.right + 30, hy(c) - 40)], mid: X.footprints('#6D4C41') }) }),
  ],
};

// ======================= 08 · ĐẠI HỘI THỂ THAO TRÁI CÂY =======================
// Trái cây có tay chân nhỏ (A.limbs), mỗi quả chơi 5 môn riêng (không quả nào trùng môn).
const SP = (slug, vi, en, opts) => {
  const acc = opts.acc || (() => ({}));
  return V(slug, vi, en, { ...opts, acc: (c) => { const a = acc(c); return { ...a, behind: [...A.limbs(c), ...(a.behind || [])] }; } });
};
const my = (c) => (c.bb[1] + c.bb[3]) / 2;

const TRAI_CAY = {
  'tao-the-thao': [
    SP('da-bong', 'Đá Bóng', 'Soccer', { scene: ['sun', 'goal'], acc: (c) => ({ front: A.soccerBall('bong-da', c.right + 40, c.bb[3] + 2, 44) }) }),
    SP('chay-tiep-suc', 'Chạy Tiếp Sức', 'Relay Race', { scene: ['clouds', 'motion'], transform: { rot: -8, scale: 0.9, px: 300, py: 460 }, acc: (c) => ({ front: X.relayBaton(c), mid: X.trackLanes() }) }),
    SP('ban-cung', 'Bắn Cung', 'Archery', { scene: ['sun'], transform: { tx: -80, scale: 0.9, px: 300, py: 480 }, acc: (c) => ({ front: X.bowAndArrow(c.right + 16, my(c)), fg: X.archeryTarget(510, 330) }) }),
    SP('dau-kiem', 'Đấu Kiếm', 'Fencing', { scene: ['clouds'], acc: (c) => ({ preface: X.fencing(c) }) }),
    SP('cu-ta', 'Cử Tạ', 'Weightlifting', { scene: ['sun', 'confetti'], transform: { ty: 30, scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: X.barbell(c) }) }),
  ],
  'chuoi-the-thao': [
    SP('luot-song', 'Lướt Sóng', 'Surfing', { scene: ['sun'], ground: 'water', transform: { ty: -40, rot: -10, scale: 0.85, px: 300, py: 420 }, acc: (c) => ({ front: X.surf(c), back: X.bigWave() }) }),
    SP('cheo-thuyen-kayak', 'Chèo Thuyền Kayak', 'Kayaking', { scene: ['sun', 'clouds'], ground: 'water', transform: { ty: 10, scale: 0.85, px: 300, py: 460 }, acc: (c) => ({ front: X.kayak(c) }) }),
    SP('truot-tuyet', 'Trượt Tuyết', 'Skiing', { scene: ['snow'], sky: 'snow', ground: 'snow', transform: { rot: 10, scale: 0.9, px: 300, py: 440 }, acc: (c) => ({ front: X.skis(c), back: X.mountains() }) }),
    SP('nhay-sao', 'Nhảy Sào', 'Pole Vault', { scene: ['clouds'], transform: { tx: -60, ty: -60, rot: -20, scale: 0.8, px: 300, py: 400 }, acc: (c) => ({ front: X.poleVault(c) }) }),
    SP('leo-nui', 'Leo Núi', 'Climbing', { transform: { ty: -40, scale: 0.85, px: 300, py: 400 }, acc: (c) => ({ front: X.hardHat(c, '#FF5F5F'), back: X.climbingWall() }) }),
  ],
  'dau-tay-the-thao': [
    SP('the-duc-ruy-bang', 'Thể Dục Ruy Băng', 'Ribbon Gymnastics', { scene: ['confetti'], transform: { tx: -40, rot: -6, px: 300, py: 470 }, acc: (c) => ({ front: X.ribbon(c) }) }),
    SP('truot-bang-nghe-thuat', 'Trượt Băng Nghệ Thuật', 'Figure Skating', { scene: ['snow'], sky: 'snow', ground: 'ice', transform: { rot: 12, scale: 0.9, px: 300, py: 440 }, acc: (c) => ({ front: X.iceSkates(c) }) }),
    SP('cau-long', 'Cầu Lông', 'Badminton', { scene: ['clouds'], ground: 'court', transform: { tx: 40, px: 300, py: 480 }, acc: (c) => ({ front: X.racket(c, '#FF7AA2'), back: X.net(), fg: X.shuttlecock(470, 150) }) }),
    SP('nhay-day', 'Nhảy Dây', 'Jump Rope', { scene: ['sun', 'shadow'], transform: { ty: -40, scale: 0.88, px: 300, py: 420 }, acc: (c) => ({ front: A.jumpRope(c) }) }),
    SP('yoga', 'Yoga', 'Yoga', { expr: 'sleep', scene: ['sun', 'flowers', 'butterfly'], transform: { ty: -20, scale: 0.9, px: 300, py: 460 }, acc: (c) => ({ mid: X.yogaMat(c), fg: X.sparkles('thu-gian', [[120, 200, 16], [480, 200, 16]], '#B39DDB') }) }),
  ],
  'dua-hau-the-thao': [
    SP('bong-ro', 'Bóng Rổ', 'Basketball', { scene: ['clouds', 'hoop'], acc: (c) => ({ front: A.basketball('bong-ro', c.right + 30, c.bb[3] - 70, 42) }) }),
    SP('bong-chuyen-bai-bien', 'Bóng Chuyền Bãi Biển', 'Beach Volleyball', { scene: ['sun'], ground: 'sand', transform: { tx: 40, px: 300, py: 480 }, acc: () => ({ back: X.net(470, 250), fg: X.volleyball(400, 130) }) }),
    SP('bowling', 'Bowling', 'Bowling', { scene: ['stars'], sky: 'night', ground: 'court', transform: { tx: -80, scale: 0.9, px: 300, py: 480 }, acc: (c) => ({ front: X.bowlingBall(c.right + 40, c.bb[3] - 10), fg: X.bowling(460, 520) }) }),
    SP('boi-loi', 'Bơi Lội', 'Swimming', { scene: ['sun', 'bubbles'], ground: 'water', acc: (c) => ({ preface: A.goggles(c) }) }),
    SP('keo-co', 'Kéo Co', 'Tug of War', { scene: ['clouds', 'motion'], transform: { tx: 60, rot: 8, px: 300, py: 480 }, acc: (c) => ({ front: X.tugRope(c) }) }),
  ],
  dua: [
    SP('quan-vot', 'Quần Vợt', 'Tennis', { scene: ['sun'], ground: 'court', transform: { tx: 40, px: 300, py: 480 }, acc: (c) => ({ front: X.racket(c, '#4FA3E0', 'vot-tennis'), back: X.net(), fg: X.tennisBall(160, 150) }) }),
    SP('bong-ban', 'Bóng Bàn', 'Table Tennis', { scene: ['clouds'], transform: { tx: -90, scale: 0.9, px: 300, py: 480 }, acc: (c) => ({ front: X.paddle(c), fg: X.pingPongTable() }) }),
    SP('golf', 'Golf', 'Golf', { scene: ['sun', 'clouds'], transform: { tx: -60, scale: 0.9, px: 300, py: 480 }, acc: (c) => ({ front: X.golf(c) }) }),
    SP('karate', 'Karate', 'Karate', { expr: 'angry', scene: ['clouds'], transform: { tx: -40, px: 300, py: 480 }, acc: (c) => ({ front: X.karate(c), fg: X.brokenBoard(500, 300) }) }),
    SP('bong-chay', 'Bóng Chày', 'Baseball', { scene: ['sun'], acc: (c) => ({ front: [...X.cap(c, '#FF5F5F', '#C0392B'), ...X.baseball(c)] }) }),
  ],
  'cam-the-thao': [
    SP('truot-van', 'Trượt Ván', 'Skateboard', { expr: 'tongue', scene: ['clouds', 'motion'], transform: { ty: -36, rot: -6, scale: 0.9, px: 300, py: 420 }, acc: (c) => ({ front: A.skateboard(c) }) }),
    SP('quyen-anh', 'Quyền Anh', 'Boxing', { expr: 'angry', scene: ['stars'], sky: 'night', ground: 'court', acc: (c) => ({ front: X.boxingGloves(c), back: X.ringRopes() }) }),
    SP('khuc-con-cau', 'Khúc Côn Cầu', 'Ice Hockey', { scene: ['snow'], sky: 'snow', ground: 'ice', transform: { tx: -40, px: 300, py: 480 }, acc: (c) => ({ front: [...X.hardHat(c, '#4FA3E0'), ...X.hockey(c)] }) }),
    SP('truot-patin', 'Trượt Patin', 'Roller Skating', { scene: ['sun', 'motion'], transform: { ty: -30, rot: -8, scale: 0.9, px: 300, py: 440 }, acc: (c) => ({ front: X.rollerSkates(c) }) }),
    SP('nhay-bat-lo-xo', 'Nhảy Bạt Lò Xo', 'Trampoline', { scene: ['clouds', 'motion'], transform: { ty: -120, scale: 0.8, px: 300, py: 400 }, acc: () => ({ mid: X.trampoline() }) }),
  ],
};

export const OBJECT_VARIANTS = { ...SIEU_THU, ...KEO, ...XE, ...KHUNG_LONG, ...TRAI_CAY };

// Tránh cảnh báo import chưa dùng khi các chủ đề sau chưa thêm.
void C; void R; void P; void D; void heart;
