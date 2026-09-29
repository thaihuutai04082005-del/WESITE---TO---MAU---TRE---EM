// Lớp 3 — Đợt 3: mỗi đối tượng 5 biến thể RIÊNG, bám concept chủ đề.
// 10 Dụng cụ khoa học × Phản ứng kỳ diệu · 11 Dụng cụ mỹ thuật × Họa sĩ nhí · 13 Đồ vật hải tặc × Phiêu lưu biển cả
// 14 Đạo cụ xiếc × Màn biểu diễn · 15 Máy móc × Cư dân thành phố tí hon.
import * as A from './accessories.mjs';
import * as X from './props.mjs';
import * as Y from './props2.mjs';
import * as Z from './props3.mjs';
import { E, C, R, P, line, star, cloud, heart } from './shapes.mjs';

const V = (slug, vi, en, opts) => ({ slug, name: { vi, en }, scene: [], expr: 'happy', ...opts });
const SHIFT_L = { tx: -80, scale: 0.85, px: 300, py: 480 };
const SHIFT_R = { tx: 80, scale: 0.85, px: 300, py: 480 };
const SMALL = { scale: 0.82, px: 300, py: 480 };
const FLOAT = { ty: -50, scale: 0.8, px: 300, py: 300 };

// ======================= 10 · PHÒNG THÍ NGHIỆM KỲ DIỆU =======================
const THI_NGHIEM = {
  'ong-nghiem': [
    V('sui-bot-cau-vong', 'Sủi Bọt Cầu Vồng', 'Rainbow Fizz', { expr: 'surprised', acc: () => ({ front: Z.bubbles([[300, 90, 18], [262, 50, 13], [340, 40, 15], [226, 96, 10], [380, 92, 11]], ['#FF9EC0', '#FFD54F', '#A5F2C4', '#B3E5FC', '#D1C4E9']) }) }),
    V('khoi-hinh-con-tho', 'Khói Hình Con Thỏ', 'Bunny-Shaped Smoke', { transform: SMALL, acc: () => ({ fg: [...Z.puffTrail([[310, 150, 14], [340, 128, 18], [375, 118, 20]]), ...Z.smokeBunny(450, 150)] }) }),
    V('ban-phao-hoa-mini', 'Bắn Pháo Hoa Mini', 'Mini Fireworks', { transform: SMALL, acc: () => ({ fg: Y.fireworks([[160, 110, 44], [430, 90, 50], [300, 60, 30]]) }) }),
    V('moc-tinh-the-tim', 'Mọc Tinh Thể Tím', 'Purple Crystals', { acc: () => ({ front: Z.crystals('tinh-the-mieng-ong', 300, 124, 1.1) }) }),
    V('lo-lung-khong-trong-luc', 'Lơ Lửng Không Trọng Lực', 'Zero Gravity Float', { transform: FLOAT, acc: () => ({ fg: Z.droplets([[140, 180], [470, 220, 1.2], [150, 400, 0.9], [460, 430], [380, 90, 0.8]], ['#4CD787', '#A5F2C4', '#4CD787', '#A5F2C4', '#4CD787']) }) }),
  ],
  'binh-tam-giac': [
    V('trao-bot-xa-phong', 'Trào Bọt Xà Phòng', 'Soap Foam Overflow', { expr: 'surprised', acc: () => ({ front: Z.foamTop(300, 100, 100) }) }),
    V('khoi-hinh-trai-tim', 'Khói Hình Trái Tim', 'Heart-Shaped Smoke', { transform: SMALL, acc: () => ({ fg: [...Z.puffTrail([[300, 80, 18], [270, 50, 14]], '#FFC1D6'), ...X.hearts('tim-khoi', [[190, 70, 1.4], [410, 60, 1.6], [470, 150, 1]], '#FF9EC0')] }) }),
    V('phun-trao-nui-lua', 'Phun Trào Núi Lửa', 'Volcano Eruption', { transform: SMALL, acc: () => ({ fg: Z.eruption(300, 190) }) }),
    V('ba-lop-mau', 'Ba Lớp Màu', 'Three Color Layers', { acc: () => ({ preface: Z.flaskLayers(), fg: Z.droplets([[140, 260], [460, 250], [150, 360, 0.8]], ['#FFD54F', '#4CD787', '#4FA3E0']) }) }),
    V('ket-tinh-bong-tuyet', 'Kết Tinh Bông Tuyết', 'Snowflake Crystals', { acc: () => ({ fg: Z.snowCrystals([[140, 150, 40], [470, 130, 34], [460, 330, 26], [130, 350, 24]]) }) }),
  ],
  'kinh-hien-vi': [
    V('soi-vi-khuan-vui-nhon', 'Soi Vi Khuẩn Vui Nhộn', 'Funny Microbes', { expr: 'surprised', acc: () => ({ fg: Z.microbes([[120, 140, 30, '#A5F2C4'], [480, 110, 26, '#FFC1D6'], [110, 300, 22, '#D1C4E9'], [500, 250, 24, '#FFF3B0']]) }) }),
    V('soi-giot-nuoc', 'Soi Giọt Nước', 'Water Drop Zoom', { acc: () => ({ front: Z.slide(285, 328, []), fg: Z.bigDrop(110, 200, 1.1) }) }),
    V('soi-la-cay', 'Soi Lá Cây', 'Leaf Zoom', { acc: () => ({ front: Z.leaf('la-tren-ban', 272, 318, 0.7, -8), fg: Z.leaf('la-phong-to', 110, 170, 1.2, -40) }) }),
    V('soi-tinh-the-muoi', 'Soi Tinh Thể Muối', 'Salt Crystal Zoom', { acc: () => ({ fg: Z.saltCubes([[110, 150, 30], [170, 90, 20], [490, 120, 26], [500, 230, 18], [100, 280, 18]]) }) }),
    V('anh-sang-than-ky', 'Ánh Sáng Thần Kỳ', 'Magic Light', { acc: () => ({ behind: Z.lightBeam(300, 316, 160), fg: X.sparkles('lap-lanh', [[120, 120, 20], [480, 110, 18], [140, 300, 14], [470, 300, 16]]) }) }),
  ],
  'nam-cham': [
    V('hut-kep-giay', 'Hút Kẹp Giấy', 'Paper Clip Pull', { expr: 'surprised', acc: () => ({ fg: Z.paperclips([[210, 110, -20], [390, 100, 30], [250, 70, 10], [350, 60, -30], [140, 420, 0], [470, 430, 20]]) }) }),
    V('hut-dinh-vit', 'Hút Đinh Vít', 'Screw Magnet', { acc: () => ({ fg: Z.screws([[200, 100, 60], [380, 90, 120], [290, 60, 90], [130, 450, 10], [460, 440, 170]]) }) }),
    V('nang-o-to-do-choi', 'Nâng Ô Tô Đồ Chơi', 'Lifting a Toy Car', { transform: { ty: 60, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: Z.toyCar(300, 150, 1.2) }) }),
    V('vong-tu-truong', 'Vòng Từ Trường', 'Magnetic Field Loops', { acc: () => ({ back: [Z.fieldLines(300, 180)] }) }),
    V('day-nhau-lo-lung', 'Đẩy Nhau Lơ Lửng', 'Floating Repel', { transform: { tx: -90, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: Z.miniMagnet(470, 200) }) }),
  ],
  'kinh-lup': [
    V('soi-chu-kien', 'Soi Chú Kiến', 'Ant Watching', { acc: () => ({ fg: Z.ant(140, 470, 0.9) }) }),
    V('soi-bo-rua', 'Soi Bọ Rùa', 'Ladybug Watching', { expr: 'surprised', acc: () => ({ fg: [...Z.leaf('la-bo-rua', 130, 480, 1.1, -20), ...Z.ladybug(130, 470, 0.8)] }) }),
    V('hoi-tu-tia-nang', 'Hội Tụ Tia Nắng', 'Sunbeam Focus', { transform: { tx: 30, px: 300, py: 480 }, acc: () => ({ back: [C('mat-troi-hoi-tu', 110, 90, 40, '#FFD54F'), ...Z.sunBeamIn(110, 90, 240, 170)], fg: Z.focusCone(236, 330, 150, 480) }) }),
    V('soi-bong-tuyet', 'Soi Bông Tuyết', 'Snowflake Watching', { scene: ['snow'], acc: () => ({ fg: Y.bigSnowflake(470, 140, 50) }) }),
    V('soi-vo-oc', 'Soi Vỏ Ốc', 'Seashell Watching', { acc: () => ({ fg: Z.shell(140, 470, 1) }) }),
  ],
  'mo-hinh-nguyen-tu': [
    V('quay-tit-sieu-toc', 'Quay Tít Siêu Tốc', 'Super Spin', { scene: ['motion'], acc: () => ({}) }),
    V('ghep-phan-tu-nuoc', 'Ghép Phân Tử Nước', 'Water Molecule', { transform: SHIFT_L, acc: () => ({ fg: Z.waterMolecule(480, 150, 1) }) }),
    V('tia-dien-lap-lanh', 'Tia Điện Lấp Lánh', 'Sparkling Electricity', { expr: 'surprised', acc: () => ({ fg: [A.bolt('tia-dien-1', 110, 150, 1.2), A.bolt('tia-dien-2', 490, 150, 1.2), A.bolt('tia-dien-3', 500, 400, 0.9)] }) }),
    V('troi-giua-vu-tru', 'Trôi Giữa Vũ Trụ', 'Drifting in Space', { transform: FLOAT, acc: () => ({ fg: [...X.bigPlanet(90, 470, 60, '#B39DDB', '#FFE0B5')] }) }),
    V('no-phao-hoa-hat', 'Nổ Pháo Hoa Hạt', 'Particle Fireworks', { acc: () => ({ fg: Y.fireworks([[110, 100, 40], [500, 480, 36], [510, 90, 30]]) }) }),
  ],
};

// ======================= 11 · XƯỞNG NGHỆ THUẬT SẮC MÀU =======================
const MY_THUAT = {
  'co-ve': [
    V('ve-cau-vong', 'Vẽ Cầu Vồng', 'Painting a Rainbow', { transform: SHIFT_R, acc: () => ({ mid: Z.paintedRainbow(190, 470, 150, 15) }) }),
    V('ve-song-bien', 'Vẽ Sóng Biển', 'Painting Waves', { transform: { ty: -40, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: Z.paintedWaves(40, 560, 480) }) }),
    V('ve-mat-troi', 'Vẽ Mặt Trời', 'Painting the Sun', { transform: SHIFT_R, acc: () => ({ fg: Z.paintedSun(160, 290, 46) }) }),
    V('ve-bong-hoa', 'Vẽ Bông Hoa', 'Painting a Flower', { transform: SHIFT_R, acc: () => ({ fg: Z.bigFlower('hoa-ve', 160, 330, 1.2, '#FF7AA2') }) }),
    V('ve-ca-vang', 'Vẽ Cá Vàng', 'Painting a Goldfish', { transform: SHIFT_R, acc: () => ({ fg: [...Z.fish('ca-vang-ve', 160, 300, 1.4, '#FF9F43'), ...Z.bubbles([[230, 230, 10], [250, 190, 7]], ['#B3E5FC'])] }) }),
  ],
  'but-chi-mau': [
    V('ve-ngoi-nha', 'Vẽ Ngôi Nhà', 'Drawing a House', { transform: SHIFT_R, acc: () => ({ fg: Z.house('nha-ve', 160, 470, 1.3) }) }),
    V('ve-xoan-oc', 'Vẽ Xoắn Ốc', 'Drawing a Spiral', { transform: SHIFT_R, acc: () => ({ fg: Z.spiralDots(150, 280, 100, 3, 64) }) }),
    V('ve-ngoi-sao', 'Vẽ Ngôi Sao', 'Drawing Stars', { acc: () => ({ fg: [star('sao-ve-1', 130, 170, 50, 20, '#FFD54F'), star('sao-ve-2', 480, 130, 40, 16, '#FF9F43'), star('sao-ve-3', 470, 330, 30, 12, '#FF7AA2')] }) }),
    V('ve-dam-may', 'Vẽ Đám Mây', 'Drawing Clouds', { acc: () => ({ fg: [cloud('may-ve-1', 120, 160, 0.8, '#B3E5FC'), cloud('may-ve-2', 480, 250, 0.7, '#D1C4E9')] }) }),
    V('ve-canh-dieu', 'Vẽ Cánh Diều', 'Drawing a Kite', { transform: SHIFT_R, acc: () => ({ fg: Y.kites([[150, 170]]) }) }),
  ],
  'but-sap': [
    V('ve-cham-bi', 'Vẽ Chấm Bi', 'Drawing Polka Dots', { acc: () => ({ fg: Z.polkaDots([[110, 150, 24], [170, 250, 18], [100, 360, 22], [490, 140, 20], [440, 240, 16], [500, 350, 24], [160, 450, 14], [460, 450, 16]]) }) }),
    V('ve-trai-tim', 'Vẽ Trái Tim', 'Drawing Hearts', { acc: () => ({ fg: X.hearts('tim-ve', [[130, 180, 2.2], [470, 150, 1.8], [460, 350, 1.4], [140, 380, 1.3]], '#FF5F7E') }) }),
    V('ve-meo-con', 'Vẽ Mèo Con', 'Drawing a Kitten', { transform: SHIFT_R, acc: () => ({ fg: Z.catFace(150, 300, 1.3) }) }),
    V('ve-ten-lua', 'Vẽ Tên Lửa', 'Drawing a Rocket', { transform: SHIFT_R, acc: () => ({ fg: Z.rocketDrawing(150, 240, 1.3) }) }),
    V('ve-buom-xinh', 'Vẽ Bướm Xinh', 'Drawing a Butterfly', { acc: () => ({ fg: [...Z.butterfly(120, 170, 1.3), ...Z.butterfly(480, 330, 1, '#4FA3E0', '#FFD54F')] }) }),
  ],
  'bang-mau': [
    V('pha-mau-moi', 'Pha Màu Mới', 'Mixing New Colors', { acc: () => ({ fg: Z.paintMix(470, 450) }) }),
    V('mau-tung-toe', 'Màu Tung Tóe', 'Paint Splash', { expr: 'surprised', acc: () => ({ fg: Z.splats([[100, 130, 34], [500, 120, 30], [90, 420, 26], [510, 440, 32], [300, 60, 22]]) }) }),
    V('ve-tranh-ngoai-troi', 'Vẽ Tranh Ngoài Trời', 'Painting Outdoors', { transform: SHIFT_L, acc: () => ({ fg: Z.miniEasel(490, 480) }) }),
    V('ve-chan-dung', 'Vẽ Chân Dung', 'Painting a Portrait', { transform: SHIFT_L, acc: () => ({ fg: Z.frame('chan-dung', 490, 350, 130, 150, [C('mat-chan-dung', 490, 345, 36, '#FFE0B5'), E('toc-chan-dung', 490, 318, 40, 18, '#8D6E63')]) }) }),
    V('trien-lam-tranh', 'Triển Lãm Tranh', 'Art Exhibition', { transform: SMALL, acc: () => ({ fg: [...Z.frame('tranh-1', 80, 340, 110, 90, Z.paintedSun(80, 340, 16)), ...Z.frame('tranh-2', 520, 340, 110, 90, [...Z.house('nha-tranh', 520, 375, 0.4)])] }) }),
  ],
  'tuyp-mau': [
    V('bop-mau-thanh-song', 'Bóp Màu Thành Sông', 'Paint River', { transform: SHIFT_L, acc: () => ({ fg: [Z.waveBand('song-mau-1', 250, 590, 520, 26, 12, '#FF7AA2', 2), Z.waveBand('song-mau-2', 230, 590, 560, 26, 12, '#7D5FFF', 2)] }) }),
    V('ve-sau-bien', 'Vẽ Sóng Xanh Ngắt', 'Painting Blue Waves', { transform: { ty: -40, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: [Z.waveBand('song-xanh-1', 40, 560, 500, 22, 14, '#26A69A', 4), Z.waveBand('song-xanh-2', 40, 560, 540, 22, 14, '#4FA3E0', 4)] }) }),
    V('in-dau-ban-tay', 'In Dấu Bàn Tay', 'Handprints', { acc: () => ({ fg: [...Z.handprint('ban-tay-1', 110, 180, 1.2, '#4FA3E0'), ...Z.handprint('ban-tay-2', 490, 160, 1.1, '#FF7AA2'), ...Z.handprint('ban-tay-3', 480, 380, 1, '#FFD54F'), ...Z.handprint('ban-tay-4', 120, 400, 1, '#4CD787')] }) }),
    V('ve-thuyen-buom', 'Vẽ Thuyền Buồm', 'Painting a Sailboat', { transform: SHIFT_R, acc: () => ({ fg: Z.boatDrawing(150, 400, 1.3) }) }),
    V('ve-hoa-huong-duong', 'Vẽ Hoa Hướng Dương', 'Painting Sunflowers', { acc: () => ({ fg: Y.sunflowers([[110, 330], [490, 300]]) }) }),
  ],
  'gia-ve': [
    V('ve-cham-mau', 'Chấm Màu Lên Tranh', 'Dotting the Canvas', { acc: () => ({ front: Z.polkaDots([[200, 140, 10], [400, 140, 12], [206, 296, 12], [396, 296, 10], [250, 130, 7], [352, 300, 8]]) }) }),
    V('ve-trai-tim-hong', 'Vẽ Trái Tim Hồng', 'Pink Hearts', { acc: () => ({ front: X.hearts('tim-toan', [[210, 150, 0.8], [390, 150, 0.8], [210, 290, 0.7], [390, 290, 0.7]], '#FF7AA2') }) }),
    V('ve-hoang-hon', 'Vẽ Hoàng Hôn', 'Painting a Sunset', { acc: () => ({ front: [C('mat-troi-toan', 380, 160, 22, '#FF8A65'), E('may-toan', 220, 150, 26, 8, '#FFB3A1')], fg: [...X.sparkles('lap-lanh', [[110, 150, 16], [490, 140, 14]])] }) }),
    V('bo-suu-tap-tranh', 'Bộ Sưu Tập Tranh', 'Painting Collection', { transform: SMALL, acc: () => ({ fg: [...Z.frame('tranh-treo-1', 80, 360, 100, 110, [star('sao-tranh', 80, 360, 24, 10, '#FFD54F')]), ...Z.frame('tranh-treo-2', 520, 360, 100, 110, Z.fish('ca-tranh', 522, 360, 0.55, '#4FA3E0'))] }) }),
    V('tranh-biet-bay', 'Tranh Biết Bay', 'Flying Paintings', { acc: () => ({ fg: [...Z.frame('tranh-bay-1', 190, 60, 90, 70, [C('cham-tranh-bay', 190, 60, 12, '#FF7AA2')]), ...Z.frame('tranh-bay-2', 420, 50, 90, 70, [heart('tim-tranh-bay', 420, 52, 0.8, '#FF5F7E')]), ...Z.frame('tranh-bay-3', 520, 320, 80, 64, [star('sao-tranh-bay', 520, 320, 16, 7, '#FFD54F')]), ...Z.frame('tranh-bay-4', 80, 330, 80, 64, [C('cham-tranh-bay-2', 80, 330, 10, '#4FA3E0')])] }) }),
  ],
};

// ======================= 13 · HẠM ĐỘI HẢI TẶC KHO BÁU =======================
const HAI_TAC = {
  'tau-hai-tac': [
    V('vuot-bao-lon', 'Vượt Bão Lớn', 'Braving the Storm', { expr: 'surprised', scene: ['rain'], transform: { rot: -6, px: 300, py: 480 }, acc: () => ({ fg: [...Z.seaWaves(480, '#29B6F6'), A.bolt('tia-set', 500, 120, 1.3)] }) }),
    V('cap-dao-hoang', 'Cập Đảo Hoang', 'Landing on an Island', { transform: SHIFT_L, acc: () => ({ mid: Z.palmIsland(500, 470, 0.9), fg: Z.seaWaves(500) }) }),
    V('gap-ca-voi', 'Gặp Cá Voi', 'Meeting a Whale', { transform: { tx: -60, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: [...Z.whale(470, 500, 0.8), ...Z.seaWaves(510)] }) }),
    V('san-kho-bau-dem-trang', 'Săn Kho Báu Đêm Trăng', 'Moonlit Treasure Hunt', { acc: () => ({ back: Y.moon(500, 90, 40), fg: Z.seaWaves(500, '#3F51B5') }) }),
    V('mung-chien-thang', 'Mừng Chiến Thắng', 'Victory Celebration', { expr: 'happy', scene: ['confetti'], acc: () => ({ back: X.bunting(60), fg: Z.seaWaves(500) }) }),
  ],
  'ruong-kho-bau': [
    V('chim-duoi-day-bien', 'Chìm Dưới Đáy Biển', 'Sunken Chest', { acc: () => ({ fg: [...Z.fish('ca-bien-1', 110, 170, 0.8, '#FFB74D'), ...Z.fish('ca-bien-2', 490, 240, 0.7, '#4FC3F7', -1), ...Z.bubbles([[140, 110, 10], [460, 170, 8], [480, 120, 12]], ['#E1F5FE'])] }) }),
    V('day-ap-vang', 'Đầy Ắp Vàng', 'Full of Gold', { expr: 'happy', acc: () => ({ front: Z.goldPile(300, 250), fg: X.sparkles('lap-lanh', [[150, 160, 18], [450, 150, 20], [470, 300, 12]]) }) }),
    V('chon-tren-dao-hoang', 'Chôn Trên Đảo Hoang', 'Buried on an Island', { transform: SHIFT_R, acc: () => ({ fg: [...Z.shovel(120, 440, -15), ...Z.footsteps([[70, 540, -10], [110, 560, 10], [160, 545, -10]])] }) }),
    V('mo-bang-chia-khoa-vang', 'Mở Bằng Chìa Khóa Vàng', 'Golden Key', { transform: SHIFT_R, acc: () => ({ fg: X.bigKey(130, 300) }) }),
    V('trong-hang-kho-bau', 'Trong Hang Kho Báu', 'Treasure Cave', { acc: () => ({ fg: [...Y.gems([[120, 450], [160, 470], [470, 460], [510, 440], [440, 480]]), ...Z.coins([[90, 490], [520, 490], [200, 500]])] }) }),
  ],
  'la-ban': [
    V('chi-duong-qua-bao', 'Chỉ Đường Qua Bão', 'Guiding Through the Storm', { expr: 'angry', scene: ['rain', 'wind'], acc: () => ({ fg: [A.bolt('tia-set-bao', 110, 110, 1.2)] }) }),
    V('tim-dao-hoang', 'Tìm Đảo Hoang', 'Finding the Island', { transform: SHIFT_L, acc: () => ({ mid: Z.palmIsland(490, 480, 0.8) }) }),
    V('chi-huong-sao-bac-cuc', 'Chỉ Hướng Sao Bắc Cực', 'Following the North Star', { acc: () => ({ back: Z.northStar(300, 60) }) }),
    V('qua-rung-ram', 'Băng Qua Rừng Rậm', 'Through the Jungle', { acc: () => ({ fg: [...Z.leaf('la-rung-1', 90, 480, 1.3, -60, '#43A047'), ...Z.leaf('la-rung-2', 510, 470, 1.3, 60, '#388E3C')] }) }),
    V('di-theo-dau-chan', 'Đi Theo Dấu Chân', 'Following Footprints', { acc: () => ({ fg: Z.footsteps([[90, 560, -20], [140, 530, 20], [190, 560, -20], [420, 540, 20], [470, 570, -20], [520, 540, 20]]) }) }),
  ],
  'mo-neo': [
    V('tha-neo-day-bien', 'Thả Neo Đáy Biển', 'Anchor Drop', { acc: () => ({ back: Z.chain(300, 0, 90), fg: [...Z.fish('ca-neo-1', 110, 200, 0.8, '#FFD54F'), ...Z.fish('ca-neo-2', 500, 150, 0.7, '#FF8A65', -1)] }) }),
    V('san-ho-quan-quanh', 'San Hô Quấn Quanh', 'Coral Friends', { acc: () => ({ fg: [...Z.coral('san-ho-1', 110, 480, 1.1, '#FF7AA2'), ...Z.coral('san-ho-2', 500, 480, 0.9, '#FF9F43')] }) }),
    V('bach-tuoc-om-neo', 'Bạch Tuộc Ôm Neo', 'Octopus Hug', { transform: SHIFT_R, acc: () => ({ fg: Z.octopus(120, 380, 0.9) }) }),
    V('keo-neo-len-tau', 'Kéo Neo Lên Tàu', 'Hauling the Anchor', { transform: { ty: 30, scale: 0.85, px: 300, py: 480 }, acc: () => ({ back: [...Z.chain(300, 60, 170), ...Z.shipBottom()] }) }),
    V('nghi-tren-ben-cang', 'Nghỉ Trên Bến Cảng', 'Resting at the Dock', { transform: { ty: -20, scale: 0.85, px: 300, py: 480 }, acc: () => ({ mid: Z.dock(500) }) }),
  ],
  'ban-do-kho-bau': [
    V('bay-trong-gio-bao', 'Bay Trong Gió Bão', 'Blown by the Storm', { expr: 'surprised', scene: ['wind'], transform: { ty: -40, rot: 10, scale: 0.8, px: 300, py: 300 }, acc: () => ({}) }),
    V('chi-duong-toi-kho-bau', 'Chỉ Đường Tới Kho Báu', 'Road to Treasure', { transform: SHIFT_L, acc: () => ({ fg: [...X.giftBox('ruong-nho', 500, 480, 70, '#8D5A3B', '#FFD54F'), ...Z.footsteps([[420, 540, 30], [460, 520, 60]])] }) }),
    V('dao-nui-lua', 'Đảo Núi Lửa', 'Volcano Island', { transform: SHIFT_L, acc: () => ({ mid: Z.volcanoIsland(500, 480) }) }),
    V('he-lo-duoi-anh-trang', 'Hé Lộ Dưới Ánh Trăng', 'Revealed by Moonlight', { acc: () => ({ back: Y.moon(90, 90, 44), fg: X.sparkles('lap-lanh', [[480, 120, 16], [500, 300, 12]]) }) }),
    V('tim-thay-dau-x', 'Tìm Thấy Dấu X', 'X Marks the Spot', { transform: { ty: -40, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: [...Z.dugHole(200, 540), ...Z.shovel(480, 520, 20)] }) }),
  ],
  'banh-lai': [
    V('lai-qua-song-du', 'Lái Qua Sóng Dữ', 'Steering Through Waves', { expr: 'angry', transform: SMALL, acc: () => ({ fg: [...Z.bigWave(90, 520, 1), ...Z.bigWave(510, 520, -1)] }) }),
    V('tranh-da-ngam', 'Tránh Đá Ngầm', 'Dodging Rocks', { acc: () => ({ fg: Z.rocks([[90, 520, 60, 30], [510, 530, 70, 34], [170, 560, 40, 18]]) }) }),
    V('theo-hai-au', 'Theo Đàn Hải Âu', 'Following Seagulls', { acc: () => ({ fg: Y.birds([[110, 110, 1.2], [480, 90], [520, 180, 0.8]]) }) }),
    V('dem-hai-dang', 'Đêm Hải Đăng', 'Lighthouse Night', { transform: SHIFT_L, acc: () => ({ mid: Z.lighthouse(510, 480, 0.9) }) }),
    V('ve-ben-chien-thang', 'Về Bến Chiến Thắng', 'Victorious Return', { scene: ['confetti'], acc: () => ({ back: X.bunting(50) }) }),
  ],
};

// ======================= 14 · RẠP XIẾC DIỆU KỲ =======================
const XIEC = {
  'leu-xiec': [
    V('den-san-khau-bat-sang', 'Đèn Sân Khấu Bật Sáng', 'Spotlights On', { acc: () => ({ back: [...Z.spot(60, 60, 1), ...Z.spot(540, 60, -1)] }) }),
    V('doan-xiec-toi-thi-tran', 'Đoàn Xiếc Tới Thị Trấn', 'Circus Comes to Town', { transform: SHIFT_L, acc: () => ({ fg: Z.wagon(490, 500) }) }),
    V('co-bay-phap-phoi', 'Cờ Bay Phấp Phới', 'Flying Flags', { scene: ['wind'], acc: () => ({ back: X.bunting(70) }) }),
    V('dem-hoi-phao-giay', 'Đêm Hội Pháo Giấy', 'Confetti Night', { scene: ['confetti'], acc: () => ({ back: Y.fireworks([[100, 90, 40], [500, 110, 44]]) }) }),
    V('bong-bay-chao-khach', 'Bóng Bay Chào Khách', 'Welcome Balloons', { scene: ['balloons'], acc: () => ({}) }),
  ],
  'mu-ao-thuat': [
    V('tho-trang-nhay-ra', 'Thỏ Trắng Nhảy Ra', 'Bunny Pops Out', { expr: 'surprised', acc: () => ({ behind: Z.rabbit(300, 150, 1.1) }) }),
    V('bo-cau-bay-ra', 'Bồ Câu Bay Ra', 'Doves Fly Out', { acc: () => ({ fg: Y.birds([[220, 100, 1.2], [380, 80, 1.4], [480, 150], [130, 160, 0.9]]) }) }),
    V('bien-ra-hoa', 'Biến Ra Hoa', 'Flower Magic', { acc: () => ({ behind: [...Z.bigFlower('hoa-mu-1', 250, 110, 0.8, '#FF7AA2'), ...Z.bigFlower('hoa-mu-2', 350, 90, 0.8, '#FFD54F')] }) }),
    V('khan-dai-bat-tan', 'Chiếc Khăn Dài Bất Tận', 'Endless Scarf', { acc: () => ({ fg: Z.scarfChain([[300, 130, 0], [340, 100, 20], [390, 80, 10], [440, 90, -20], [480, 120, -40], [510, 170, -60], [520, 230, -80]]) }) }),
    V('dua-phep-lap-lanh', 'Đũa Phép Lấp Lánh', 'Sparkling Wand', { acc: () => ({ fg: [...Z.wand(430, 330, -60), ...X.sparkles('lap-lanh', [[540, 130, 16], [470, 90, 12], [130, 150, 14]])] }) }),
  ],
  'bong-tung-hung': [
    V('tung-hung-nam-bong', 'Tung Hứng Năm Bóng', 'Five-Ball Juggle', { acc: () => ({ back: Z.juggleArc(300, 300, 230, 5) }) }),
    V('nhay-qua-vong-lua', 'Nhảy Qua Vòng Lửa', 'Through the Fire Hoop', { transform: { tx: -90, scale: 0.8, px: 300, py: 480 }, acc: () => ({ back: Z.fireHoop(470, 280, 70) }) }),
    V('lan-tren-day', 'Lăn Trên Dây', 'Rolling on the Rope', { transform: { ty: -110, scale: 0.75, px: 300, py: 480 }, acc: () => ({ mid: Z.tightrope(372, 30, 570) }) }),
    V('xep-thap-bong', 'Xếp Tháp Bóng', 'Ball Tower', { transform: SHIFT_L, acc: () => ({ fg: Z.ballStack(490, 480) }) }),
    V('mua-phao-giay', 'Mưa Pháo Giấy', 'Confetti Rain', { scene: ['confetti', 'stars'], acc: () => ({}) }),
  ],
  'vong-nhao-lon': [
    V('xoay-tit-san-khau', 'Xoay Tít Trên Sân Khấu', 'Spinning on Stage', { scene: ['motion'], acc: () => ({}) }),
    V('mua-ruy-bang', 'Múa Ruy Băng', 'Ribbon Dance', { acc: () => ({ fg: [...Z.ribbon(90, 420)] }) }),
    V('lan-vong-qua-san', 'Lăn Vòng Qua Sân', 'Rolling Across', { scene: ['speed'], transform: { tx: 40, rot: 12, scale: 0.85, px: 300, py: 480 }, acc: () => ({}) }),
    V('chong-ba-vong', 'Chồng Ba Vòng', 'Three-Hoop Stack', { transform: SHIFT_R, acc: () => ({ fg: Z.hoopStack(110, 480) }) }),
    V('ha-man-tung-hoa', 'Hạ Màn Tung Hoa', 'Curtain Call Flowers', { transform: SMALL, acc: () => ({ back: Z.curtainsDrop(), fg: Y.flowersAt([[200, 540], [260, 560], [340, 555], [400, 540]]) }) }),
  ],
  'trong-xiec': [
    V('go-nhip-mo-man', 'Gõ Nhịp Mở Màn', 'Opening Beat', { acc: () => ({ fg: X.musicNotes('not-nhac', [[110, 180], [490, 150], [130, 330], [480, 320]]) }) }),
    V('trong-dieu-hanh', 'Trống Diễu Hành', 'Parade Drum', { acc: () => ({ back: X.bunting(60), fg: [...Y.drum(110, 520), ...Y.drum(490, 520)] }) }),
    V('tau-nhac-cung-ken', 'Tấu Nhạc Cùng Kèn', 'Drum and Trumpet', { transform: SHIFT_R, acc: () => ({ fg: X.trumpet(110, 260) }) }),
    V('dem-nhac-anh-den', 'Đêm Nhạc Ánh Đèn', 'Spotlight Concert', { acc: () => ({ back: [...Z.spot(70, 70, 1)] }) }),
    V('man-ket-phao-giay', 'Màn Kết Pháo Giấy', 'Confetti Finale', { scene: ['confetti'], acc: () => ({ back: Z.curtainsDrop() }) }),
  ],
  'xa-du': [
    V('du-cao-cham-sao', 'Đu Cao Chạm Sao', 'Swinging to the Stars', { transform: { rot: -14, px: 300, py: 50 }, acc: () => ({ fg: X.sparkles('sao-cao', [[110, 150, 18], [500, 120, 22], [520, 260, 14]], '#FFE066') }) }),
    V('bay-qua-luoi-an-toan', 'Bay Qua Lưới An Toàn', 'Over the Safety Net', { acc: () => ({ fg: Z.net(500) }) }),
    V('du-doi-ban-than', 'Đu Đôi Bạn Thân', 'Trapeze Buddies', { transform: { tx: -80, scale: 0.85, px: 300, py: 50 }, acc: () => ({ back: Z.smallTrapeze(500, 260) }) }),
    V('du-giua-den-chieu', 'Đu Giữa Đèn Chiếu', 'Spotlight Swing', { acc: () => ({ back: [...Z.spot(60, 110, 1), ...Z.spot(540, 110, -1)] }) }),
    V('tung-phao-giay-tren-cao', 'Tung Pháo Giấy Trên Cao', 'Confetti up High', { scene: ['confetti'], transform: { rot: 12, px: 300, py: 50 }, acc: () => ({}) }),
  ],
};

// ======================= 15 · THÀNH PHỐ MÁY MÓC TÍ HON =======================
const MAY_MOC = {
  'banh-rang': [
    V('len-day-cot', 'Lên Dây Cót', 'Winding Up', { transform: { tx: -40, scale: 0.85, px: 300, py: 480 }, acc: () => ({ back: Z.windKey(440, 300) }) }),
    V('chay-thap-dong-ho', 'Chạy Tháp Đồng Hồ', 'Running the Clock Tower', { transform: SHIFT_L, acc: () => ({ mid: Z.clockTower(500, 480) }) }),
    V('keo-bang-chuyen', 'Kéo Băng Chuyền', 'Conveyor Belt', { transform: { ty: -40, scale: 0.8, px: 300, py: 480 }, acc: () => ({ fg: Z.conveyor(520) }) }),
    V('nghi-trua-uong-dau', 'Nghỉ Trưa Uống Dầu', 'Oil Break', { expr: 'sleep', transform: SHIFT_R, acc: () => ({ fg: Z.oilCan(110, 490) }) }),
    V('quay-du-quay-ti-hon', 'Quay Đu Quay Tí Hon', 'Tiny Ferris Wheel', { transform: SHIFT_R, acc: () => ({ mid: Z.ferrisWheel(110, 320, 90) }) }),
  ],
  'co-le': [
    V('sua-duong-ong', 'Sửa Đường Ống', 'Fixing Pipes', { acc: () => ({ back: Z.pipes() }) }),
    V('xay-duong-ti-hon', 'Xây Đường Tí Hon', 'Building a Tiny Road', { transform: { ty: -40, scale: 0.85, px: 300, py: 480 }, acc: () => ({ mid: Z.roadStripes(540), fg: Z.cones([[90, 520], [510, 520]]) }) }),
    V('sua-xe-dap', 'Sửa Xe Đạp', 'Fixing a Bicycle', { transform: SHIFT_R, acc: () => ({ fg: Z.bikeWheel(120, 400, 70) }) }),
    V('di-lam-buoi-sang', 'Đi Làm Buổi Sáng', 'Off to Work', { transform: SHIFT_R, acc: () => ({ fg: Z.lunchbox(110, 490) }) }),
    V('siet-oc-cau-sat', 'Siết Ốc Cầu Sắt', 'Tightening the Bridge', { transform: { ty: -60, scale: 0.8, px: 300, py: 480 }, acc: () => ({ mid: Z.trussBridge(560) }) }),
  ],
  'tua-vit': [
    V('lap-ghe-go', 'Lắp Ghế Gỗ', 'Building a Chair', { transform: SHIFT_L, acc: () => ({ fg: Z.chair(490, 490) }) }),
    V('van-oc-bien-bao', 'Vặn Ốc Biển Báo', 'Fixing a Street Sign', { transform: SHIFT_L, acc: () => ({ mid: Z.streetSign(500, 480) }) }),
    V('sua-hop-thu', 'Sửa Hộp Thư', 'Fixing the Mailbox', { transform: SHIFT_R, acc: () => ({ mid: Z.mailbox(110, 480) }) }),
    V('nghi-trua-duoi-o', 'Nghỉ Trưa Dưới Ô', 'Nap Under an Umbrella', { expr: 'sleep', transform: SHIFT_R, acc: () => ({ mid: Z.umbrella(100, 480) }) }),
    V('lap-chong-chong', 'Lắp Chong Chóng', 'Building a Pinwheel', { transform: SHIFT_L, acc: () => ({ fg: Y.pinwheel(490, 330) }) }),
  ],
  'bong-den': [
    V('thap-den-thanh-pho', 'Thắp Đèn Thành Phố', 'Lighting Up the City', { acc: (c) => ({ behind: X.aura(c, '#FFF3B0'), back: Y.fireflies([[90, 380], [510, 360], [120, 180], [480, 200]]) }) }),
    V('y-tuong-chot-loe', 'Ý Tưởng Chợt Lóe', 'Bright Idea', { expr: 'surprised', acc: () => ({ fg: [...X.sparkles('lap-lanh', [[120, 130, 24], [480, 120, 22], [110, 330, 14], [490, 330, 16]]), ...[0, 1, 2, 3, 4].map((k) => { const a = ((200 + k * 35) * Math.PI) / 180; return Z.spark(`tia-y-tuong-${k + 1}`, 300 + 200 * Math.cos(a), 220 + 200 * Math.sin(a), 0.8); })] }) }),
    V('den-duong-ti-hon', 'Đèn Đường Tí Hon', 'Tiny Street Lamp', { transform: SHIFT_R, acc: () => ({ mid: Z.streetLamp(110, 480) }) }),
    V('soi-duong-dem-mua', 'Soi Đường Đêm Mưa', 'Rainy Night Light', { scene: ['rain'], acc: () => ({ fg: [E('vung-nuoc-mua-1', 120, 540, 60, 12, '#7DC4FF'), E('vung-nuoc-mua-2', 480, 550, 60, 12, '#7DC4FF')] }) }),
    V('chuoi-den-nha-ti-hon', 'Chuỗi Đèn Nhà Tí Hon', 'Tiny House Lights', { acc: () => ({ back: Z.bulbString(60), fg: X.sparkles('lap-lanh', [[110, 250, 14], [490, 250, 14]]) }) }),
  ],
  'dong-ho-bao-thuc': [
    V('reng-reng-buoi-sang', 'Reng Reng Buổi Sáng', 'Morning Ring', { expr: 'surprised', acc: () => ({ fg: [Z.ringLines(130, 150, -1), Z.ringLines(470, 150, 1)] }) }),
    V('goi-ca-pho-day', 'Gọi Cả Phố Dậy', 'Waking the Street', { expr: 'surprised', acc: () => ({ fg: [Z.ringLines(160, 280, -1), Z.ringLines(440, 280, 1), ...Y.birds([[110, 110], [480, 90, 0.9]], '#FFFFFF')] }) }),
    V('di-lam-dung-gio', 'Đi Làm Đúng Giờ', 'Right on Time', { transform: SHIFT_L, acc: () => ({ fg: Z.busSmall(490, 500) }) }),
    V('nghi-trua-ngu-gat', 'Nghỉ Trưa Ngủ Gật', 'Afternoon Nap', { expr: 'sleep', acc: () => ({ fg: Z.zzz(430, 150) }) }),
    V('len-day-cot-buoi-toi', 'Lên Dây Cót Buổi Tối', 'Evening Wind-Up', { transform: { tx: -40, scale: 0.85, px: 300, py: 480 }, acc: () => ({ back: Z.windKey(440, 300) }) }),
  ],
  'quat-dien': [
    V('thoi-mat-ca-pho', 'Thổi Mát Cả Phố', 'Cooling the Street', { scene: ['wind'], acc: () => ({}) }),
    V('thoi-buom-thuyen-giay', 'Thổi Buồm Thuyền Giấy', 'Sailing Paper Boats', { scene: ['wind'], transform: SHIFT_L, acc: () => ({ fg: [...Y.pool('ao-thuyen', 500, 520, 110, 24), ...Z.paperBoatAt(500, 510)] }) }),
    V('thoi-chong-chong', 'Thổi Chong Chóng', 'Spinning Pinwheels', { transform: SHIFT_L, acc: () => ({ fg: Y.pinwheel(500, 300) }) }),
    V('thoi-bay-la-thu', 'Thổi Bay Lá Thu', 'Blowing Autumn Leaves', { scene: ['wind'], acc: () => ({ fg: Z.leaves([[480, 120, 20], [520, 220, -30], [460, 330, 40], [540, 400, 10], [120, 140, -20]]) }) }),
    V('thoi-bong-xa-phong', 'Thổi Bong Bóng Xà Phòng', 'Blowing Soap Bubbles', { acc: () => ({ fg: Z.soapBubbles([[480, 120, 30], [530, 220, 20], [460, 300, 24], [540, 360, 16], [110, 150, 18]]) }) }),
  ],
};

export const OBJECT_VARIANTS_3 = { ...THI_NGHIEM, ...MY_THUAT, ...HAI_TAC, ...XIEC, ...MAY_MOC };
void R; void P; void line;
