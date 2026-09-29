// Lớp 3 — Đợt 2: mỗi đối tượng 5 biến thể RIÊNG, bám concept chủ đề.
// 04 Cây × Phép thuật · 05 Nhà × Bay lượn · 06 Đồ chơi × Sống dậy nửa đêm · 09 Thiên thể × Một ngày · 12 Công trình × Bốn mùa & lễ hội.
import * as A from './accessories.mjs';
import * as X from './props.mjs';
import * as Y from './props2.mjs';
import { E, C, R, P, D, line, star, cloud } from './shapes.mjs';

const V = (slug, vi, en, opts) => ({ slug, name: { vi, en }, scene: [], expr: 'happy', ...opts });
const my = (c) => (c.bb[1] + c.bb[3]) / 2;
const FLY = { ty: -70, scale: 0.78, px: 300, py: 300 };

// ======================= 04 · KHU RỪNG CÂY THẦN =======================
const CAY = {
  'cay-co-thu': [
    V('canh-cua-bi-mat', 'Cánh Cửa Bí Mật', 'Secret Door', { acc: () => ({ front: Y.treeDoor(300, 470) }) }),
    V('qua-tao-vang', 'Quả Táo Vàng', 'Golden Apples', { acc: () => ({ front: [...Y.fruitsOn('tao-vang', [[222, 250], [370, 190], [385, 292], [250, 318], [300, 160]], '#FFD54F'), ...X.sparkles('lap-lanh', [[120, 200, 16], [480, 160, 14]])] }) }),
    V('xich-du-phep-thuat', 'Xích Đu Phép Thuật', 'Magic Swing', { transform: { tx: -50, px: 300, py: 480 }, acc: () => ({ fg: [...Y.swing(470, 330, 440), ...X.sparkles('lap-lanh', [[520, 250, 14], [560, 360, 12]])] }) }),
    V('re-cay-biet-di', 'Rễ Cây Biết Đi', 'Walking Roots', { transform: { ty: -30, px: 300, py: 480 }, acc: () => ({ front: Y.roots(300, 460) }) }),
    V('vuong-mien-la-than', 'Vương Miện Lá Thần', 'Magic Leaf Crown', { acc: (c) => ({ front: Y.leafCrown(c.hat.x, c.hat.y, 1.1) }) }),
  ],
  'cay-thong': [
    V('den-long-tien', 'Đèn Lồng Tiên', 'Fairy Lanterns', { acc: () => ({ front: Y.hangingLanterns([[230, 250], [370, 250], [200, 350], [400, 350], [300, 200]]) }) }),
    V('ngoi-sao-uoc-nguyen', 'Ngôi Sao Ước Nguyện', 'Wishing Star', { acc: () => ({ front: [star('sao-dinh-thong', 300, 100, 44, 18, '#FFD54F')], fg: X.sparkles('lap-lanh', [[180, 110, 14], [420, 130, 14]]) }) }),
    V('tuyet-phep-mau', 'Tuyết Phép Màu', 'Magic Snow', { scene: ['snow'], acc: () => ({ front: Y.snowCaps() }) }),
    V('qua-bat-ngo', 'Quà Bất Ngờ', 'Surprise Gifts', { acc: () => ({ fg: [...X.giftBox('hop-qua-1', 170, 500, 64, '#FF7AA2', '#FFD54F'), ...X.giftBox('hop-qua-2', 430, 505, 56, '#4FA3E0'), ...X.giftBox('hop-qua-3', 500, 500, 44, '#FFD54F', '#7D5FFF')] }) }),
    V('chuong-gio-pha-le', 'Chuông Gió Pha Lê', 'Crystal Wind Chimes', { acc: () => ({ front: Y.bells([[220, 336], [380, 336], [250, 236], [350, 236]]) }) }),
  ],
  'cay-dua': [
    V('vong-may', 'Võng Mây', 'Cloud Hammock', { transform: { tx: -60, px: 300, py: 480 }, acc: () => ({ fg: Y.hammock(250, 380, 530, 380) }) }),
    V('qua-dua-biet-nhay', 'Quả Dừa Biết Nhảy', 'Bouncing Coconuts', { scene: ['motion'], acc: () => ({ fg: [C('dua-nhay-1', 140, 440, 26, '#8D6E63'), C('dua-nhay-2', 470, 400, 26, '#8D6E63'), C('dua-nhay-3', 520, 480, 22, '#A1887F')] }) }),
    V('la-quat-bay', 'Bay Bằng Lá Quạt', 'Leaf-Fan Flight', { transform: FLY, acc: () => ({ mid: [...Y.cloudBase(300, 470, 1.2)] }) }),
    V('suoi-nuoc-than', 'Suối Nước Thần', 'Magic Spring', { acc: () => ({ mid: Y.pool('suoi-than', 300, 520, 200, 34), fg: X.sparkles('lap-lanh', [[140, 470, 12], [470, 470, 14]]) }) }),
    V('dao-hoang-hon', 'Đảo Hoàng Hôn', 'Sunset Island', { acc: () => ({ mid: [E('dao-cat', 300, 500, 200, 40, '#F6D98B'), star('sao-bien', 180, 505, 16, 7, '#FF8A65')] }) }),
  ],
  'cay-xuong-rong': [
    V('no-hoa-ngu-sac', 'Nở Hoa Ngũ Sắc', 'Rainbow Blossoms', { acc: () => ({ front: Y.flowersAt([[193, 280], [407, 250], [300, 180], [250, 330], [350, 370]]) }) }),
    V('doi-mu-phu-thuy', 'Đội Mũ Phù Thủy', 'Wizard Hat', { acc: (c) => ({ front: [...X.wizardHat(c), ...X.fairyWand(c.right + 20, c.bb[3] - 220)] }) }),
    V('oc-dao-than-ky', 'Ốc Đảo Thần Kỳ', 'Magic Oasis', { transform: { tx: -60, px: 300, py: 480 }, acc: () => ({ fg: [...Y.pool('oc-dao', 470, 520, 110, 26), ...X.sparkles('lap-lanh', [[470, 450, 14]])] }) }),
    V('gai-ngoc-lap-lanh', 'Gai Ngọc Lấp Lánh', 'Jewel Spines', { acc: () => ({ front: Y.gems([[260, 230], [340, 240], [195, 320], [405, 290], [270, 380], [330, 390]]) }) }),
    V('o-hoa-sa-mac', 'Chiếc Ô Hoa Sa Mạc', 'Desert Flower Umbrella', { acc: () => ({ front: X.umbrella(470, 170, '#FF9EC0') }) }),
  ],
  'cay-lieu': [
    V('toc-lieu-tet-hoa', 'Tóc Liễu Tết Hoa', 'Flower-Braided Willow', { acc: () => ({ front: Y.flowersAt([[150, 360], [190, 390], [410, 390], [450, 360], [230, 330], [370, 330]]) }) }),
    V('dom-dom-thap-sang', 'Đom Đóm Thắp Sáng', 'Firefly Lights', { acc: () => ({ fg: Y.fireflies([[90, 200], [140, 300], [480, 220], [520, 320], [110, 420], [500, 430], [300, 110]]) }) }),
    V('soi-guong-mat-ho', 'Soi Gương Mặt Hồ', 'Lake Mirror', { acc: () => ({ mid: Y.lilyPond(300, 530) }) }),
    V('mua-cung-gio', 'Múa Cùng Gió', 'Dancing in the Wind', { scene: ['wind'], transform: { rot: 6, px: 300, py: 480 }, acc: () => ({ fg: X.leaves('la-bay', [[90, 200, 20], [520, 170, -30], [540, 300, 10]]) }) }),
    V('chiec-noi-la', 'Chiếc Nôi Lá', 'Leaf Cradle', { acc: () => ({ front: Y.leafCradle(420, 410) }) }),
  ],
  'khom-tre': [
    V('sao-truc-than', 'Sáo Trúc Thần', 'Magic Bamboo Flute', { acc: () => ({ front: [...Y.flute(300, 420), ...X.musicNotes('not-nhac', [[110, 200], [480, 160], [520, 280]])] }) }),
    V('cay-cau-tre', 'Cây Cầu Tre', 'Bamboo Bridge', { transform: { ty: -40, scale: 0.9, px: 300, py: 480 }, acc: () => ({ fg: Y.bambooBridge(540) }) }),
    V('mang-non-lon-vu', 'Măng Non Lớn Vù', 'Speedy Bamboo Shoots', { acc: () => ({ fg: Y.shoots([[120, 500, 70], [470, 500, 90], [530, 510, 50], [80, 510, 40]]) }) }),
    V('chuon-chuon-tre', 'Chuồn Chuồn Tre', 'Bamboo Dragonfly', { acc: () => ({ front: Y.dragonflyToy(300, 80) }) }),
    V('dem-trang-ram', 'Đêm Trăng Rằm', 'Full Moon Night', { acc: () => ({ back: Y.moon(480, 110, 52), front: [...X.lantern(440, 420)] }) }),
  ],
};

// ======================= 05 · THÀNH PHỐ NHÀ BIẾT BAY =======================
const NHA = {
  'nha-go-biet-bay': [
    V('khinh-khi-cau', 'Khinh Khí Cầu', 'Hot-Air Balloon', { transform: { ty: 60, scale: 0.7, px: 300, py: 480 }, acc: () => ({ back: [...Y.hotAirBalloon(300, 110, 90), Y.ropesTo([[262, 245], [338, 355]], 205, 371)] }) }),
    V('doi-canh-chim', 'Đôi Cánh Chim', 'Bird Wings', { transform: FLY, acc: (c) => ({ behind: A.wings(c) }) }),
    V('cuoi-dam-may', 'Cưỡi Đám Mây', 'Cloud Rider', { transform: FLY, acc: () => ({ fg: Y.cloudBase(300, 470, 1.8) }) }),
    V('dieu-keo-nha', 'Diều Kéo Nhà', 'Kite-Pulled House', { transform: { ty: -40, tx: -60, scale: 0.75, px: 300, py: 300 }, acc: () => ({ fg: [line('M 330 170 Q 420 120 480 90', 2.5), ...X.kite(500, 80)] }) }),
    V('bay-qua-cau-vong', 'Bay Qua Cầu Vồng', 'Over the Rainbow', { scene: ['rainbow'], transform: FLY, acc: () => ({}) }),
  ],
  'nha-pho': [
    V('canh-quat-truc-thang', 'Cánh Quạt Trực Thăng', 'Helicopter Rotor', { transform: FLY, acc: () => ({ front: Y.rotor(300, 124) }) }),
    V('chum-bong-bay', 'Chùm Bóng Bay', 'Balloon Bunch', { transform: { ty: 40, scale: 0.72, px: 300, py: 480 }, acc: () => ({ front: Y.balloonCluster(300, 130) }) }),
    V('ten-lua-day', 'Tên Lửa Đẩy', 'Rocket Boost', { transform: FLY, acc: () => ({ behind: Y.rocketsUnder([250, 350], 470) }) }),
    V('bay-giua-sao-dem', 'Bay Giữa Sao Đêm', 'Starry Night Flight', { transform: FLY, acc: () => ({ back: Y.moon(110, 110, 40), fg: X.sparkles('sao-dem', [[500, 150, 16], [80, 320, 12], [520, 380, 14]], '#FFE066') }) }),
    V('ha-canh-tren-may', 'Hạ Cánh Trên Mây', 'Cloud Landing', { transform: { ty: -20, scale: 0.9, px: 300, py: 480 }, acc: () => ({ fg: [...Y.cloudBase(300, 520, 1.5)] }) }),
  ],
  'chung-cu-biet-bay': [
    V('dong-co-phan-luc', 'Động Cơ Phản Lực', 'Jet Engines', { transform: FLY, acc: (c) => ({ behind: Y.jetEngines(c) }) }),
    V('canh-may-bay', 'Cánh Máy Bay', 'Airplane Wings', { transform: FLY, acc: (c) => ({ behind: Y.planeWings(c) }) }),
    V('cang-buom-bay', 'Căng Buồm Bay', 'Sky Sail', { transform: { ty: 40, scale: 0.75, px: 300, py: 480 }, acc: () => ({ front: Y.sailMast(330, 136) }) }),
    V('dan-chim-dan-duong', 'Đàn Chim Dẫn Đường', 'Bird Escort', { transform: FLY, acc: () => ({ fg: Y.birds([[90, 150, 1], [150, 110, 0.8], [480, 130, 1], [530, 190, 0.8]]) }) }),
    V('buoc-day-vao-may', 'Buộc Dây Vào Mây', 'Tied to a Cloud', { transform: { ty: 50, scale: 0.72, px: 300, py: 480 }, acc: () => ({ back: [cloud('may-buoc', 300, 110, 1.1, '#FFFFFF'), line('M 300 135 L 300 285', 3)] }) }),
  ],
  'nha-san': [
    V('den-troi-nang-nha', 'Đèn Trời Nâng Nhà', 'Sky Lantern Lift', { transform: FLY, acc: () => ({ fg: Y.skyLanterns([[120, 140, 1.2], [480, 120, 1], [520, 280, 0.9], [90, 300, 0.9]]) }) }),
    V('canh-dieu-sao', 'Cánh Diều Sáo', 'Flute Kite', { transform: { ty: -30, tx: -50, scale: 0.75, px: 300, py: 300 }, acc: () => ({ fg: [line('M 300 160 Q 410 120 470 90', 2.5), ...X.kite(490, 80)] }) }),
    V('bay-qua-ruong-bac-thang', 'Bay Qua Ruộng Bậc Thang', 'Over Rice Terraces', { transform: FLY, acc: () => ({}) }),
    V('mai-cheo-may', 'Mái Chèo Mây', 'Cloud Oars', { transform: FLY, acc: (c) => ({ behind: Y.oars(c), fg: [...Y.cloudBase(300, 480, 1.3)] }) }),
    V('hac-giay-dan-duong', 'Hạc Giấy Dẫn Đường', 'Paper Crane Guides', { transform: FLY, acc: () => ({ fg: Y.paperCranes([[100, 140], [480, 120], [510, 260]]) }) }),
  ],
  'nha-tuyet': [
    V('bay-tren-cuc-quang', 'Bay Trên Cực Quang', 'Aurora Flight', { transform: FLY, acc: () => ({}) }),
    V('chong-chong-tuyet', 'Chong Chóng Tuyết', 'Snow Pinwheel', { acc: () => ({ front: Y.pinwheel(300, 170) }) }),
    V('khinh-khi-cau-bang', 'Khinh Khí Cầu Băng', 'Ice Balloon', { transform: { ty: 60, scale: 0.72, px: 300, py: 480 }, acc: () => ({ back: [...Y.hotAirBalloon(300, 110, 90, '#B3E5FC', '#FFFFFF'), Y.ropesTo([[262, 262], [338, 338]], 205, 372)] }) }),
    V('truot-may-tuyet', 'Trượt Trên Mây Tuyết', 'Snow-Cloud Sled', { scene: ['snow'], transform: { ty: -30, scale: 0.85, px: 300, py: 400 }, acc: (c) => ({ front: Y.sled(c) }) }),
    V('bong-tuyet-nang-nha', 'Bông Tuyết Khổng Lồ Nâng Nhà', 'Giant Snowflake Lift', { transform: FLY, acc: () => ({ mid: Y.bigSnowflake(300, 480, 110) }) }),
  ],
  'coi-xay-gio': [
    V('canh-quat-cat-canh', 'Cánh Quạt Cất Cánh', 'Blade Take-Off', { scene: ['motion'], transform: FLY, acc: () => ({}) }),
    V('bay-theo-gio-mua', 'Bay Theo Gió Mùa', 'Riding the Monsoon', { scene: ['wind'], transform: { ty: -50, rot: -8, scale: 0.8, px: 300, py: 300 }, acc: () => ({ fg: X.leaves('la-gio', [[100, 180, 20], [500, 150, -20], [530, 320, 30]]) }) }),
    V('keo-canh-dong-hoa', 'Kéo Theo Cánh Đồng Hoa', 'Flying Flower Field', { transform: FLY, acc: () => ({ behind: Y.flowerPatch(300, 470) }) }),
    V('luon-vong-hoang-hon', 'Lượn Vòng Hoàng Hôn', 'Sunset Loop', { transform: { ty: -40, rot: 10, scale: 0.8, px: 300, py: 300 }, acc: () => ({ fg: Y.birds([[100, 160, 0.8], [140, 130, 0.6]], '#2F3640') }) }),
    V('ha-canh-doi-co', 'Hạ Cánh Đồi Cỏ', 'Hill Landing', { transform: { ty: 40, scale: 0.72, px: 300, py: 480 }, acc: (c) => ({ behind: X.parachute(c, '#4FA3E0') }) }),
  ],
};

// ======================= 06 · XỨ SỞ ĐỒ CHƠI THỨC GIẤC =======================
const DO_CHOI = {
  'bup-be-go': [
    V('thuc-day-vuon-vai', 'Thức Dậy Vươn Vai', 'Wake-Up Stretch', { acc: () => ({ fg: X.sparkles('lap-lanh', [[130, 170, 16], [470, 150, 14], [500, 300, 12]], '#FFE066') }) }),
    V('mua-ba-le', 'Múa Ba Lê', 'Ballet Dance', { transform: { rot: -8, px: 300, py: 480 }, acc: (c) => ({ front: Y.tutu(c), fg: X.musicNotes('not-nhac', [[110, 200], [490, 170]]) }) }),
    V('tiec-tra-nua-dem', 'Tiệc Trà Nửa Đêm', 'Midnight Tea Party', { transform: { tx: -70, scale: 0.9, px: 300, py: 480 }, acc: () => ({ fg: [...X.teaSet(480, 360)] }) }),
    V('ngam-trang-ben-cua-so', 'Ngắm Trăng Bên Cửa Sổ', 'Moon-Gazing', { transform: { tx: -80, px: 300, py: 480 }, acc: () => ({}) }),
    V('ru-em-ngu', 'Ru Em Ngủ', 'Lullaby for Little Sister', { transform: { tx: -60, px: 300, py: 480 }, acc: () => ({ fg: [...Y.miniDoll(480, 450), ...X.musicNotes('not-ru', [[520, 330]])] }) }),
  ],
  'linh-chi': [
    V('dieu-hanh-nua-dem', 'Diễu Hành Nửa Đêm', 'Midnight March', { scene: ['motion'], transform: { tx: -40, px: 300, py: 480 }, acc: () => ({ fg: Y.drum(470, 470) }) }),
    V('thoi-ken-bao-thuc', 'Thổi Kèn Báo Thức', 'Wake-Up Trumpet', { acc: (c) => ({ front: [...X.trumpet(c.right - 30, c.face.y + 30), ...X.musicNotes('not-ken', [[490, 150], [540, 210]])] }) }),
    V('canh-gac-hop-do-choi', 'Canh Gác Hộp Đồ Chơi', 'Guarding the Toy Box', { transform: { tx: -70, px: 300, py: 480 }, acc: (c) => ({ front: X.spear(c.right + 20, c.bb[3], 300), fg: Y.toyBox(480, 480) }) }),
    V('cheo-thuyen-giay', 'Chèo Thuyền Giấy', 'Paper Boat Ride', { transform: { ty: -40, scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: Y.paperBoat(c), mid: [E('vung-nuoc-thuyen', 300, 520, 240, 30, '#81D4FA')] }) }),
    V('chao-binh-minh', 'Chào Bình Minh', 'Saluting the Sunrise', { acc: (c) => ({ front: A.flagPole(c, 1) }) }),
  ],
  'ngua-bap-benh': [
    V('phi-nuoc-dai', 'Phi Nước Đại', 'Full Gallop', { scene: ['motion'], transform: { rot: -8, px: 300, py: 460 }, acc: () => ({}) }),
    V('nhay-qua-goi', 'Nhảy Qua Gối', 'Pillow Jump', { transform: { ty: -90, rot: -10, scale: 0.85, px: 300, py: 400 }, acc: () => ({ mid: Y.pillows(520) }) }),
    V('keo-xe-do-choi', 'Kéo Xe Đồ Chơi', 'Toy Cart Pull', { transform: { tx: 60, scale: 0.85, px: 300, py: 480 }, acc: () => ({ fg: Y.cart(90, 480) }) }),
    V('doi-vong-hoa', 'Đội Vòng Hoa', 'Flower Wreath', { acc: (c) => ({ front: Y.wreath(c.hat.x, c.hat.y + 10, 0.9) }) }),
    V('ngu-gat-luc-binh-minh', 'Ngủ Gật Lúc Bình Minh', 'Dozing at Dawn', { expr: 'sleep', scene: ['zzz'], acc: () => ({}) }),
  ],
  'con-quay': [
    V('xoay-tit', 'Xoay Tít', 'Spinning Fast', { scene: ['motion'], acc: () => ({ mid: [E('vet-xoay', 300, 488, 90, 12, '#BFC8D0')] }) }),
    V('khieu-vu-vong-tron', 'Khiêu Vũ Vòng Tròn', 'Circle Dance', { transform: { rot: 8, px: 300, py: 480 }, acc: () => ({ fg: X.musicNotes('not-nhac', [[110, 180], [480, 150], [520, 280]]) }) }),
    V('ve-vong-sao', 'Vẽ Vòng Sao', 'Star Circle', { acc: () => ({ front: Y.starRing(300, 330, 200, 150) }) }),
    V('truot-tren-san-go', 'Trượt Trên Sàn Gỗ', 'Sliding on the Floor', { transform: { tx: 60, rot: 10, px: 300, py: 480 }, acc: () => ({}) }),
    V('dua-voi-bi-ve', 'Đua Với Bi Ve', 'Marble Race', { transform: { tx: 60, px: 300, py: 480 }, acc: () => ({ fg: Y.marbles([[90, 500], [150, 520], [200, 490]]) }) }),
  ],
  'hop-hinh-nhay': [
    V('bat-ra-chao', 'Bật Ra Chào', 'Pop-Up Hello', { expr: 'surprised', acc: () => ({ fg: X.sparkles('bat-ra', [[180, 110, 18], [420, 110, 18], [140, 230, 12], [460, 230, 12]], '#FFE066') }) }),
    V('ao-thuat-hoa-giay', 'Ảo Thuật Hoa Giấy', 'Confetti Magic', { scene: ['confetti'], acc: () => ({ fg: Y.flowersAt([[130, 200], [470, 190], [110, 330], [490, 320]]) }) }),
    V('hop-nhac-ngan-nga', 'Hộp Nhạc Ngân Nga', 'Humming Music Box', { acc: () => ({ front: [...Y.crank(400, 400), ...X.musicNotes('not-nhac', [[480, 150], [520, 240], [110, 180]])] }) }),
    V('tron-tim', 'Trốn Tìm', 'Hide and Seek', { expr: 'tongue', acc: () => ({ fg: Y.pillows(470) }) }),
    V('tang-qua', 'Tặng Quà', 'Gift Giving', { transform: { tx: -60, px: 300, py: 480 }, acc: () => ({ fg: X.giftBox('hop-qua-tang', 480, 480, 80, '#FF7AA2', '#FFD54F') }) }),
  ],
  'khoi-xep-chu': [
    V('xep-thap-cao', 'Xếp Tháp Cao', 'Tall Tower', { transform: { tx: -60, px: 300, py: 480 }, acc: () => ({ fg: Y.blockTower(500, 480) }) }),
    V('chuc-ngu-ngon', 'Chúc Ngủ Ngon', 'Good Night', { expr: 'sleep', scene: ['zzz'], acc: () => ({ back: Y.moon(110, 100, 36) }) }),
    V('xep-doan-tau', 'Xếp Đoàn Tàu', 'Block Train', { acc: () => ({ fg: Y.trainBlocks(480) }) }),
    V('do-domino', 'Đổ Domino', 'Domino Fall', { transform: { tx: -70, px: 300, py: 480 }, acc: () => ({ fg: Y.dominos(380, 480) }) }),
    V('cau-thang-len-ke', 'Cầu Thang Lên Kệ', 'Stairs to the Shelf', { transform: { tx: -80, px: 300, py: 480 }, acc: () => ({ fg: Y.stairs(400, 480) }) }),
  ],
};

// ======================= 09 · VƯƠNG QUỐC THIÊN THỂ =======================
// Mặt Trời, Ngôi sao, Sao Thổ, Trái Đất có tay chân nhỏ (như trái cây) để làm việc thường ngày.
const ACT = (slug, vi, en, opts) => {
  const acc = opts.acc || (() => ({}));
  return V(slug, vi, en, { ...opts, acc: (c) => { const a = acc(c); return { ...a, behind: [...A.limbs(c, '#FFE0B5', '#7D5FFF'), ...(a.behind || [])] }; } });
};

const THIEN_THE = {
  'mat-troi': [
    ACT('thuc-day-vuon-vai', 'Thức Dậy Vươn Vai', 'Morning Stretch', { transform: { ty: 20, scale: 0.85, px: 300, py: 480 }, acc: () => ({}) }),
    ACT('tap-the-duc', 'Tập Thể Dục', 'Workout', { transform: { scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: Y.dumbbells(c) }) }),
    ACT('di-bien', 'Đi Biển', 'Beach Day', { transform: { scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ preface: Y.sunglasses(c) }) }),
    ACT('dap-xe-buoi-sang', 'Đạp Xe Buổi Sáng', 'Morning Bike Ride', { transform: { ty: -40, scale: 0.75, px: 300, py: 400 }, acc: (c) => ({ front: Y.bicycle(c) }) }),
    ACT('chao-buoi-chieu', 'Chào Buổi Chiều', 'Good Afternoon', { transform: { ty: 60, scale: 0.8, px: 300, py: 480 }, acc: () => ({}) }),
  ],
  'mat-trang': [
    V('danh-rang', 'Đánh Răng', 'Brushing Teeth', { acc: () => ({ front: Y.toothbrush(240, 420) }) }),
    V('doc-sach', 'Đọc Sách', 'Reading Time', { acc: (c) => ({ preface: X.glasses(c), front: X.openBook(260, 400) }) }),
    V('ke-chuyen-ru-ngu', 'Kể Chuyện Ru Ngủ', 'Bedtime Story', { acc: () => ({ front: X.lantern(380, 470), fg: X.musicNotes('not-ru', [[480, 150], [520, 240]]) }) }),
    V('doi-mu-ngu', 'Đội Mũ Ngủ', 'Nightcap', { expr: 'sleep', acc: (c) => ({ front: Y.nightcap(c) }) }),
    V('soi-bong-mat-ho', 'Soi Bóng Mặt Hồ', 'Lake Reflection', { transform: { ty: -40, scale: 0.85, px: 300, py: 300 }, acc: () => ({}) }),
  ],
  'ngoi-sao': [
    ACT('nhay-day', 'Nhảy Dây', 'Jump Rope', { transform: { ty: -30, scale: 0.8, px: 300, py: 420 }, acc: (c) => ({ front: A.jumpRope(c) }) }),
    ACT('hoc-bai', 'Học Bài', 'Homework', { transform: { tx: -40, scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ preface: X.glasses(c), front: X.notebook(c.right + 30, my(c) + 40) }) }),
    ACT('hat-ru', 'Hát Ru', 'Lullaby Song', { transform: { scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: [...X.microphone(c.right + 10, my(c)), ...X.musicNotes('not-ru', [[90, 160], [520, 130]])] }) }),
    ACT('tiec-sinh-nhat', 'Tiệc Sinh Nhật', 'Birthday Party', { scene: ['balloons', 'hat', 'confetti'], transform: { scale: 0.85, px: 300, py: 480 }, acc: () => ({ fg: X.giftBox('hop-qua', 510, 520, 60, '#FF7AA2', '#FFD54F') }) }),
    ACT('roi-xuong-uoc-nguyen', 'Rơi Xuống Điều Ước', 'Wishing Fall', { transform: { tx: 40, ty: -30, rot: 20, scale: 0.75, px: 300, py: 300 }, acc: () => ({ back: Y.trail(170, 190, -170, -150) }) }),
  ],
  'sao-tho': [
    ACT('lac-vong', 'Lắc Vòng', 'Hula Hoop', { scene: ['motion'], transform: { scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: Y.hulaHoop(c) }) }),
    ACT('tam-bon-bong-bong', 'Tắm Bồn Bong Bóng', 'Bubble Bath', { transform: { scale: 0.85, px: 300, py: 420 }, acc: (c) => ({ front: Y.bathtub(c) }) }),
    ACT('nghe-nhac', 'Nghe Nhạc', 'Music Time', { transform: { scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: [...X.headset(c), ...X.musicNotes('not-nhac', [[90, 150], [510, 130], [530, 250]])] }) }),
    ACT('truot-patin', 'Trượt Patin', 'Roller Skating', { scene: ['motion'], transform: { ty: -20, scale: 0.8, px: 300, py: 440 }, acc: (c) => ({ front: X.rollerSkates(c) }) }),
    ACT('di-ngu-trong-chan', 'Đi Ngủ Trong Chăn', 'Tucked into Bed', { expr: 'sleep', scene: ['zzz'], transform: { scale: 0.85, px: 300, py: 420 }, acc: (c) => ({ front: Y.blanket(c) }) }),
  ],
  'trai-dat': [
    ACT('tuoi-hoa', 'Tưới Hoa', 'Watering Flowers', { transform: { tx: -50, scale: 0.8, px: 300, py: 480 }, acc: (c) => ({ front: X.wateringCan(c.right + 60, c.bb[3] - 60), fg: Y.flowersAt([[500, 520], [560, 500]]) }) }),
    ACT('om-cay-xanh', 'Ôm Cây Xanh', 'Hugging a Tree', { transform: { tx: -60, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: Y.smallTree(500, 480) }) }),
    ACT('uong-nuoc-mat', 'Uống Nước Mát', 'Cool Drink', { transform: { tx: -40, scale: 0.85, px: 300, py: 480 }, acc: (c) => ({ front: Y.waterGlass(c.right + 30, my(c) + 60) }) }),
    ACT('ngu-trua-duoi-o', 'Ngủ Trưa Dưới Ô', 'Nap under an Umbrella', { expr: 'sleep', transform: { scale: 0.8, px: 300, py: 480 }, acc: () => ({ front: X.umbrella(300, 110, '#FF7AA2') }) }),
    ACT('di-dao-cong-vien', 'Đi Dạo Công Viên', 'Park Stroll', { transform: { scale: 0.8, px: 300, py: 480 }, acc: (c) => ({ front: A.strawHat(c) }) }),
  ],
  'sao-choi': [
    V('chay-bo-buoi-sang', 'Chạy Bộ Buổi Sáng', 'Morning Jog', { scene: ['motion'], acc: (c) => ({ front: Y.headband(c) }) }),
    V('dua-thu', 'Đưa Thư', 'Mail Delivery', { acc: (c) => ({ front: [...X.envelope(470, 380), ...A.sportCap(c)] }) }),
    V('tha-dieu', 'Thả Diều', 'Kite Flying', { acc: () => ({ fg: [line('M 440 300 Q 500 220 500 150', 2.5), ...X.kite(500, 110)] }) }),
    V('di-hoc', 'Đi Học', 'Off to School', { acc: (c) => ({ front: [R('ba-lo-sao-choi', c.face.x + 60, c.face.y - 10, 60, 80, 16, '#4CD787'), R('tui-ba-lo-sao-choi', c.face.x + 70, c.face.y + 30, 40, 30, 8, '#81C784')] }) }),
    V('ve-nha-buoi-toi', 'Về Nhà Buổi Tối', 'Home at Night', { acc: () => ({ front: X.lantern(470, 400) }) }),
  ],
};

// ======================= 12 · VƯƠNG QUỐC LÂU ĐÀI HUYỀN BÍ =======================
const LAU_DAI = {
  'lau-dai-huyen-bi': [
    V('mua-xuan-hoa-no', 'Mùa Xuân Hoa Nở', 'Spring Blossoms', { scene: ['butterfly'], acc: () => ({ fg: Y.flowersAt([[80, 520], [150, 540], [460, 540], [530, 520]]) }) }),
    V('mua-dong-tuyet-phu', 'Mùa Đông Tuyết Phủ', 'Snowy Winter', { scene: ['snow'], acc: () => ({ front: [P('tuyet-mai-trai', [[128, 226], [180, 130], [232, 226], [206, 214], [180, 226], [154, 214]], '#FFFFFF'), P('tuyet-mai-phai', [[368, 226], [420, 130], [472, 226], [446, 214], [420, 226], [394, 214]], '#FFFFFF')] }) }),
    V('dem-phao-hoa', 'Đêm Pháo Hoa', 'Fireworks Night', { acc: () => ({ back: Y.fireworks([[100, 100, 50], [500, 90, 46], [300, 50, 36]]) }) }),
    V('le-hoi-den-long', 'Lễ Hội Đèn Lồng', 'Lantern Festival', { acc: () => ({ fg: Y.lanternString(90) }) }),
    V('tren-doi-may', 'Trên Đồi Mây', 'Castle on the Clouds', { transform: { ty: -40, scale: 0.85, px: 300, py: 400 }, acc: () => ({ fg: Y.cloudBase(300, 480, 2) }) }),
  ],
  'cung-dien': [
    V('tet-nguyen-dan', 'Tết Nguyên Đán', 'Lunar New Year', { acc: () => ({ fg: [...Y.lanternString(80), ...Y.apricot(40, 520)] }) }),
    V('mua-he-dai-phun-nuoc', 'Mùa Hè Đài Phun Nước', 'Summer Fountain', { transform: { tx: 60, scale: 0.85, px: 300, py: 480 }, acc: () => ({ fg: Y.fountain(90, 520) }) }),
    V('dem-trang-ram', 'Đêm Trăng Rằm', 'Mid-Autumn Night', { acc: () => ({ back: Y.moon(300, 70, 46), fg: [...X.lantern(80, 480), ...X.lantern(520, 480)] }) }),
    V('mua-thu-la-vang', 'Mùa Thu Lá Vàng', 'Golden Autumn', { acc: () => ({ fg: X.leaves('la-vang', [[80, 200, 20], [520, 180, -30], [120, 400, 10], [500, 420, 40], [300, 90, -10]]) }) }),
    V('le-hoi-bong-bay', 'Lễ Hội Bóng Bay', 'Balloon Festival', { scene: ['balloons', 'confetti'], acc: () => ({}) }),
  ],
  'thap-co': [
    V('mua-thu-la-roi', 'Mùa Thu Lá Rơi', 'Falling Leaves', { acc: () => ({ fg: X.leaves('la-roi', [[120, 150, 20], [480, 200, -30], [160, 330, 10], [460, 380, 40], [520, 100, 0]]) }) }),
    V('dem-sao-bang', 'Đêm Sao Băng', 'Shooting Star Night', { acc: () => ({ back: X.starStreaks() }) }),
    V('mua-xuan-day-leo', 'Mùa Xuân Dây Leo', 'Spring Vines', { acc: (c) => ({ front: [...Y.vines(c), ...Y.flowersAt([[270, 260], [260, 360]])] }) }),
    V('le-hoi-tha-dieu', 'Lễ Hội Thả Diều', 'Kite Festival', { acc: () => ({ fg: Y.kites([[110, 120], [480, 100], [520, 250]]) }) }),
    V('cau-vong-sau-mua', 'Cầu Vồng Sau Mưa', 'Rainbow after Rain', { scene: ['rainbow'], acc: () => ({ mid: [E('vung-nuoc-mua-1', 150, 530, 60, 12, '#81D4FA'), E('vung-nuoc-mua-2', 460, 540, 50, 10, '#81D4FA')] }) }),
  ],
  'cong-thanh': [
    V('le-hoi-co-hoa', 'Lễ Hội Cờ Hoa', 'Flag Festival', { scene: ['confetti'], acc: () => ({ fg: X.bunting(80) }) }),
    V('mua-dong-nguoi-tuyet', 'Mùa Đông Người Tuyết', 'Snowman Winter', { scene: ['snow', 'snowman'], acc: () => ({}) }),
    V('mua-he-huong-duong', 'Mùa Hè Hướng Dương', 'Summer Sunflowers', { acc: () => ({ fg: Y.sunflowers([[60, 420], [540, 410]]) }) }),
    V('dem-hoi-anh-nen', 'Đêm Hội Ánh Nến', 'Candlelight Festival', { acc: () => ({ mid: [...X.candle('nen-1', 70, 530, 70), ...X.candle('nen-2', 130, 545, 50, '#FFD6E7'), ...X.candle('nen-3', 470, 545, 50, '#D6F0FF'), ...X.candle('nen-4', 530, 530, 70)] }) }),
    V('mua-thu-bi-ngo', 'Mùa Thu Bí Ngô', 'Pumpkin Autumn', { acc: () => ({ fg: Y.pumpkins([[80, 520, 1.1], [520, 525, 1], [160, 545, 0.7]]) }) }),
  ],
  'cau-da': [
    V('mua-xuan-hoa-dao', 'Mùa Xuân Hoa Đào', 'Peach Blossom Spring', { acc: () => ({ fg: Y.peachBranch(590, 170) }) }),
    V('mua-he-thuyen-giay', 'Mùa Hè Thuyền Giấy', 'Paper Boat Summer', { acc: () => ({ fg: [P('thuyen-giay-1', [[140, 540], [220, 540], [200, 560], [160, 560]], '#FFFFFF'), P('buom-giay-1', [[180, 540], [196, 500], [206, 540]], '#FFF3D6'), P('thuyen-giay-2', [[400, 560], [470, 560], [452, 578], [418, 578]], '#FFFFFF')] }) }),
    V('mua-dong-bang-gia', 'Mùa Đông Băng Giá', 'Frozen Winter', { scene: ['snow'], acc: () => ({ front: [R('tuyet-lan-can', 60, 290, 480, 14, 6, '#FFFFFF')] }) }),
    V('le-hoi-hoa-dang', 'Lễ Hội Hoa Đăng', 'Floating Lantern Festival', { acc: () => ({ fg: Y.floatingLanterns([[120, 550], [250, 575], [380, 555], [500, 575]]) }) }),
    V('mua-thu-suong-som', 'Mùa Thu Sương Sớm', 'Misty Autumn Morning', { acc: () => ({ back: Y.mist(), fg: X.leaves('la-thu', [[90, 180, 20], [520, 160, -30]]) }) }),
  ],
  'gieng-uoc': [
    V('mua-xuan-buom-bay', 'Mùa Xuân Bướm Bay', 'Spring Butterflies', { scene: ['butterfly', 'flowers'], acc: () => ({}) }),
    V('mua-he-dom-dom', 'Mùa Hè Đom Đóm', 'Summer Fireflies', { acc: () => ({ fg: Y.fireflies([[100, 200], [150, 320], [480, 220], [520, 330], [90, 420], [500, 430]]) }) }),
    V('mua-thu-hat-de', 'Mùa Thu Hạt Dẻ', 'Chestnut Autumn', { acc: () => ({ fg: Y.chestnuts([[90, 520], [130, 540], [480, 530], [520, 550]]) }) }),
    V('mua-dong-tuyet-roi', 'Mùa Đông Tuyết Rơi', 'Snowfall Winter', { scene: ['snow'], acc: () => ({ front: [P('tuyet-mai-gieng', [[170, 236], [300, 140], [430, 236], [400, 226], [300, 240], [200, 226]], '#FFFFFF')] }) }),
    V('le-hoi-uoc-nguyen', 'Lễ Hội Ước Nguyện', 'Wishing Festival', { acc: () => ({ front: [...Y.wishCoins([[270, 374], [320, 380]]), ...X.sparkles('uoc', [[300, 300, 16]])], fg: Y.hearts2([[110, 160, 1], [490, 150, 1], [80, 320, 0.8], [520, 320, 0.8]]) }) }),
  ],
};

export const OBJECT_VARIANTS_2 = { ...CAY, ...NHA, ...DO_CHOI, ...THIEN_THE, ...LAU_DAI };
void D;
