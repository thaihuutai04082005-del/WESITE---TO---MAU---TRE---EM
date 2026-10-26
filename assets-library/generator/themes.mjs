// Bộ chủ đề mới — Đợt 1 (5 chủ đề × 6 đối tượng). Xem docs/ma-tran-chu-de.md.
// Mỗi chủ đề = Nhóm đối tượng × Concept; 5 biến thể cố định + 4 thẻ (C/B/A/S) áp cho mọi đối tượng.
import { legacy } from './objects.mjs';
import * as B from './bodies.mjs';
import * as B2 from './bodies2.mjs';
import * as B3 from './bodies3.mjs';
import * as X from './props.mjs';
import * as A from './accessories.mjs';
import { E } from './shapes.mjs';
import { flame, bolt, iceCrystal, asteroid, soccerBall, basketball } from './accessories.mjs';

export const THEMES = [
  { slug: 'anh-hung-sieu-thu', name: { vi: 'Anh Hùng Siêu Thú', en: 'Super Beast Heroes' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'vuong-quoc-keo-ngot', name: { vi: 'Vương Quốc Bánh Kẹo', en: 'Sweets Kingdom' }, faceStyle: 'face', animation: 'float' },
  { slug: 'doi-xe-vu-tru', name: { vi: 'Đội Xe Chinh Phục Vũ Trụ', en: 'Space Vehicle Squad' }, faceStyle: 'none', animation: 'drive' },
  { slug: 'thi-tran-khung-long', name: { vi: 'Thị Trấn Khủng Long Tài Ba', en: 'Talented Dino Town' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'the-thao-trai-cay', name: { vi: 'Đại Hội Thể Thao Trái Cây', en: 'Fruit Sports Festival' }, faceStyle: 'face', animation: 'float' },
  // Đợt 2
  { slug: 'khu-rung-cay-than', name: { vi: 'Khu Rừng Ánh Sáng', en: 'Forest of Light' }, faceStyle: 'face', animation: 'sway' },
  { slug: 'thanh-pho-nha-biet-bay', name: { vi: 'Thành Phố Nhà Biết Bay', en: 'Flying House City' }, faceStyle: 'none', animation: 'float' },
  { slug: 'xu-so-do-choi', name: { vi: 'Xứ Sở Đồ Chơi Thức Giấc', en: 'Midnight Toyland' }, faceStyle: 'face', animation: 'bounce', hidden: true },
  { slug: 'vuong-quoc-lau-dai', name: { vi: 'Xứ Sở Học Cụ', en: 'Stationery Land' }, faceStyle: 'none', animation: 'wiggle' },
  { slug: 'vuong-quoc-thien-the', name: { vi: 'Vương Quốc Thiên Thể', en: 'Sky Kingdom' }, faceStyle: 'face', animation: 'float', plainSky: true, hidden: true },
  // Đợt 3
  { slug: 'xuong-nghe-thuat', name: { vi: 'Xưởng Nghệ Thuật Sắc Màu', en: 'Colorful Art Studio' }, faceStyle: 'face', animation: 'bounce', hidden: true },
];

const O = (theme, slug, vi, en, opts) => ({ theme, slug, name: { vi, en }, ...opts });
/** Thêm 2 tay (chi trước) cho thú 4 chân: vẽ sau thân, hai bên sườn. */
const withArms = (build, color, { x = 78, y = 402 } = {}) => () => [
  ...build(),
  E('tay-trai', 300 - x, y, 22, 42, color, 28),
  E('tay-phai', 300 + x, y, 22, 42, color, -28),
];
/** Dùng lại hình dáng đối tượng cũ, đổi slug/tên để không trùng tranh cũ. */
const reuse = (theme, oldSlug, slug, vi, en, extra = {}) => {
  const o = legacy(oldSlug);
  const { arms, ...rest } = extra;
  const build = arms ? withArms(o.build, arms.color, arms) : o.build;
  return O(theme, slug, vi, en, { face: o.face, hat: o.hat, build, glow: o.glow, animation: o.animation, ground: o.ground, ...rest });
};

export const OBJECTS = [
  // 01 — Động vật × Siêu anh hùng
  O('anh-hung-sieu-thu', 'su-tu', 'Sư tử', 'Lion', { face: { x: 300, y: 250, s: 1 }, hat: { x: 300, y: 150, s: 0.9 }, neck: 336, left: 212, right: 388, build: B.suTu }),
  O('anh-hung-sieu-thu', 'ho', 'Hổ', 'Tiger', { face: { x: 300, y: 248, s: 1 }, hat: { x: 300, y: 176, s: 0.9 }, neck: 334, left: 212, right: 388, build: B.ho }),
  reuse('anh-hung-sieu-thu', 'voi', 'voi-sieu-thu', 'Voi', 'Elephant', { neck: 336, left: 200, right: 400 }),
  O('anh-hung-sieu-thu', 'dai-bang', 'Đại bàng', 'Eagle', { face: { x: 300, y: 228, s: 0.85 }, mouth: false, hat: { x: 300, y: 168, s: 0.85 }, neck: 306, left: 150, right: 450, build: B.daiBang }),
  reuse('anh-hung-sieu-thu', 'meo', 'meo-sieu-thu', 'Mèo', 'Cat', { neck: 334, left: 210, right: 390 }),
  reuse('anh-hung-sieu-thu', 'cho', 'cho-sieu-thu', 'Chó', 'Dog', { neck: 334, left: 208, right: 392 }),
  reuse('anh-hung-sieu-thu', 'tho', 'tho-sieu-thu', 'Thỏ', 'Rabbit', { neck: 334, left: 212, right: 388 }),
  reuse('anh-hung-sieu-thu', 'gau', 'gau-sieu-thu', 'Gấu', 'Bear', { neck: 334, left: 208, right: 392 }),
  O('anh-hung-sieu-thu', 'heo-sieu-thu', 'Heo', 'Pig', { face: { x: 300, y: 250, s: 1 }, hat: { x: 300, y: 176, s: 0.9 }, neck: 334, left: 208, right: 392, build: () => [] }),
  O('anh-hung-sieu-thu', 'khi-sieu-thu', 'Khỉ', 'Monkey', { face: { x: 300, y: 250, s: 1 }, hat: { x: 300, y: 176, s: 0.9 }, neck: 334, left: 208, right: 392, build: () => [] }),
  O('anh-hung-sieu-thu', 'canh-cut-sieu-thu', 'Chim cánh cụt', 'Penguin', { face: { x: 300, y: 250, s: 1 }, hat: { x: 300, y: 176, s: 0.9 }, neck: 334, left: 208, right: 392, build: () => [] }),

  // 02 — Bánh kẹo × Hoàng gia
  O('vuong-quoc-keo-ngot', 'donut', 'Donut', 'Donut', { face: { x: 300, y: 398, s: 0.62 }, hat: { x: 300, y: 186, s: 1.2 }, build: B.donut }),
  O('vuong-quoc-keo-ngot', 'cupcake', 'Cupcake', 'Cupcake', { face: { x: 300, y: 408, s: 0.6 }, hat: { x: 300, y: 212, s: 1.05 }, build: B.cupcake }),
  O('vuong-quoc-keo-ngot', 'keo-mut', 'Kẹo mút', 'Lollipop', { face: { x: 300, y: 226, s: 0.62 }, hat: { x: 300, y: 118, s: 1.15 }, build: B.keoMut }),
  O('vuong-quoc-keo-ngot', 'kem-oc-que', 'Kem ốc quế', 'Ice cream cone', { face: { x: 300, y: 276, s: 0.62 }, hat: { x: 300, y: 156, s: 1.05 }, build: B.kemOcQue }),
  O('vuong-quoc-keo-ngot', 'banh-quy', 'Bánh quy', 'Cookie', { face: { x: 300, y: 318, s: 0.9 }, hat: { x: 300, y: 180, s: 1.25 }, build: B.banhQuy }),
  O('vuong-quoc-keo-ngot', 'banh-kem', 'Bánh kem', 'Cake', { face: { x: 300, y: 428, s: 0.6 }, hat: { x: 300, y: 234, s: 0.9 }, build: B.banhKem }),
  O('vuong-quoc-keo-ngot', 'macaron', 'Macaron', 'Macaron', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('vuong-quoc-keo-ngot', 'banh-gung', 'Bánh gừng', 'Gingerbread', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('vuong-quoc-keo-ngot', 'socola', 'Socola', 'Chocolate', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),

  // 03 — Phương tiện × Không gian
  O('doi-xe-vu-tru', 'xe-dua', 'Xe đua', 'Race car', { face: { x: 440, y: 386, s: 0.42 }, hat: { x: 318, y: 306, s: 0.7 }, glow: ['den-truoc'], build: B.xeDua }),
  reuse('doi-xe-vu-tru', 'xe-buyt', 'xe-buyt-vu-tru', 'Xe buýt', 'Bus'),
  O('doi-xe-vu-tru', 'xe-cuu-hoa', 'Xe cứu hỏa', 'Fire truck', { face: { x: 434, y: 396, s: 0.44 }, hat: { x: 452, y: 278, s: 0.6 }, glow: ['den-truoc', 'den-coi'], build: B.xeCuuHoa }),
  reuse('doi-xe-vu-tru', 'tau-hoa', 'tau-hoa-vu-tru', 'Tàu hỏa', 'Train'),
  reuse('doi-xe-vu-tru', 'may-bay', 'may-bay-vu-tru', 'Máy bay', 'Airplane'),
  O('doi-xe-vu-tru', 'truc-thang', 'Trực thăng', 'Helicopter', { face: { x: 300, y: 372, s: 0.5 }, hat: { x: 310, y: 226, s: 0.6 }, animation: 'fly', build: B.trucThang }),
  O('doi-xe-vu-tru', 'xe-tai-vu-tru', 'Xe tải', 'Truck', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('doi-xe-vu-tru', 'xe-xuc-vu-tru', 'Xe xúc', 'Excavator', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('doi-xe-vu-tru', 'xe-tuk-tuk-vu-tru', 'Xe túc túc', 'Tuk-tuk', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('doi-xe-vu-tru', 'xe-canh-sat-vu-tru', 'Xe cảnh sát', 'Police car', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),

  // 07 — Khủng long × Nghề nghiệp
  O('thi-tran-khung-long', 'khung-long-bao-chua', 'Khủng long bạo chúa', 'T-Rex', { face: { x: 300, y: 248, s: 1 }, hat: { x: 300, y: 172, s: 0.95 }, left: 208, right: 392, build: B.khungLongBaoChua }),
  O('thi-tran-khung-long', 'khung-long-co-dai', 'Khủng long cổ dài', 'Long-neck dino', { face: { x: 402, y: 154, s: 0.5 }, hat: { x: 400, y: 120, s: 0.6 }, left: 176, right: 440, build: B.khungLongCoDai }),
  O('thi-tran-khung-long', 'khung-long-ba-sung', 'Khủng long ba sừng', 'Triceratops', { face: { x: 300, y: 262, s: 0.9 }, hat: { x: 300, y: 104, s: 0.9 }, left: 208, right: 392, build: B.khungLongBaSung }),
  O('thi-tran-khung-long', 'khung-long-gai-lung', 'Khủng long gai lưng', 'Stegosaurus', { face: { x: 300, y: 256, s: 0.95 }, hat: { x: 300, y: 194, s: 0.9 }, left: 208, right: 392, build: B.khungLongGaiLung }),
  O('thi-tran-khung-long', 'duc-long', 'Dực long', 'Pterosaur', { face: { x: 300, y: 228, s: 0.7 }, mouth: false, hat: { x: 300, y: 182, s: 0.75 }, animation: 'fly', left: 180, right: 420, build: B.khungLongDucLong }),
  O('thi-tran-khung-long', 'khung-long-mao-ken', 'Khủng long mào kèn', 'Parasaurolophus', { face: { x: 300, y: 248, s: 0.95 }, hat: { x: 316, y: 184, s: 0.85 }, left: 208, right: 392, build: B.khungLongMaoKen }),
  O('thi-tran-khung-long', 'khung-long-boc-giap', 'Khủng long bọc giáp', 'Ankylosaurus', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('thi-tran-khung-long', 'khung-long-dau-vom', 'Khủng long đầu vòm', 'Dome-head dino', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('thi-tran-khung-long', 'bo-sat-bien', 'Bò sát biển cổ dài', 'Plesiosaur', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),
  O('thi-tran-khung-long', 'khung-long-hai-mao', 'Khủng long hai mào', 'Twin-crest dino', { face: { x: 300, y: 300, s: 0.7 }, hat: { x: 300, y: 190, s: 1 }, build: () => [] }),

  // 08 — Trái cây × Thể thao
  reuse('the-thao-trai-cay', 'tao', 'tao-the-thao', 'Táo', 'Apple'),
  reuse('the-thao-trai-cay', 'chuoi', 'chuoi-the-thao', 'Chuối', 'Banana'),
  reuse('the-thao-trai-cay', 'dau-tay', 'dau-tay-the-thao', 'Dâu tây', 'Strawberry'),
  reuse('the-thao-trai-cay', 'dua-hau', 'dua-hau-the-thao', 'Dưa hấu', 'Watermelon'),
  O('the-thao-trai-cay', 'dua', 'Dứa', 'Pineapple', { face: { x: 300, y: 370, s: 0.8 }, hat: { x: 300, y: 150, s: 0.7 }, build: B.dua }),
  reuse('the-thao-trai-cay', 'cam', 'cam-the-thao', 'Cam', 'Orange'),
  O('the-thao-trai-cay', 'ngo', 'Ngô', 'Corn', { face: { x: 300, y: 330, s: 0.8 }, hat: { x: 300, y: 170, s: 0.8 }, build: () => [] }),
  O('the-thao-trai-cay', 'dua-nau', 'Dừa', 'Coconut', { face: { x: 300, y: 330, s: 0.8 }, hat: { x: 300, y: 170, s: 0.8 }, build: () => [] }),
  O('the-thao-trai-cay', 'le-the-thao', 'Lê', 'Pear', { face: { x: 300, y: 340, s: 0.8 }, hat: { x: 300, y: 170, s: 0.8 }, build: () => [] }),
  O('the-thao-trai-cay', 'xoai-the-thao', 'Xoài', 'Mango', { face: { x: 300, y: 330, s: 0.8 }, hat: { x: 300, y: 170, s: 0.8 }, build: () => [] }),

  // 04 — Cây × Phép thuật
  reuse('khu-rung-cay-than', 'cay', 'cay-co-thu', 'Cây cổ thụ', 'Ancient tree'),
  O('khu-rung-cay-than', 'cay-thong', 'Cây thông', 'Pine tree', { face: { x: 300, y: 370, s: 0.75 }, hat: { x: 300, y: 118, s: 0.7 }, build: B2.cayThong }),
  O('khu-rung-cay-than', 'cay-dua', 'Cây dừa', 'Coconut palm', { face: { x: 292, y: 372, s: 0.6 }, hat: { x: 325, y: 150, s: 0.7 }, build: B2.cayDua }),
  O('khu-rung-cay-than', 'cay-xuong-rong', 'Cây xương rồng', 'Cactus', { face: { x: 300, y: 300, s: 0.8 }, hat: { x: 300, y: 184, s: 0.8 }, build: B2.xuongRong }),
  O('khu-rung-cay-than', 'cay-lieu', 'Cây liễu', 'Willow tree', { face: { x: 300, y: 214, s: 0.8 }, hat: { x: 300, y: 122, s: 0.9 }, build: B2.cayLieu }),
  O('khu-rung-cay-than', 'cay-anh-dao', 'Cây anh đào', 'Cherry blossom', { face: { x: 300, y: 330, s: 0.7 }, hat: { x: 300, y: 150, s: 0.8 }, build: () => [] }),
  O('khu-rung-cay-than', 'cay-phong', 'Cây phong', 'Maple tree', { face: { x: 300, y: 330, s: 0.7 }, hat: { x: 300, y: 150, s: 0.8 }, build: () => [] }),
  O('khu-rung-cay-than', 'cay-bao-bap', 'Cây bao báp', 'Baobab tree', { face: { x: 300, y: 330, s: 0.8 }, hat: { x: 300, y: 150, s: 0.8 }, build: () => [] }),
  O('khu-rung-cay-than', 'khom-tre', 'Khóm tre', 'Bamboo grove', { face: { x: 300, y: 310, s: 0.62 }, hat: { x: 300, y: 124, s: 0.6 }, build: B2.khomTre }),

  // 05 — Nhà × Bay lượn
  reuse('thanh-pho-nha-biet-bay', 'nha-go', 'nha-go-biet-bay', 'Nhà gỗ', 'Cottage'),
  O('thanh-pho-nha-biet-bay', 'nha-tam-giac', 'Nhà gỗ tam giác', 'A-frame cabin', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'coi-xay-chong-chong', 'Cối xay gió chong chóng', 'Pinwheel windmill', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'biet-thu', 'Biệt thự', 'Villa', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'nha-san-canh-chim', 'Nhà sàn cánh chim', 'Winged stilt house', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'nha-ong-ten-lua', 'Nhà ống tên lửa', 'Rocket townhouse', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'nha-tuyet-du', 'Nhà tuyết dù', 'Parachute igloo', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'lau-dai-canh-rong', 'Lâu đài cánh rồng', 'Dragon-wing castle', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'nha-kinh-drone', 'Nhà kính drone', 'Drone greenhouse', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'nha-mai-vom', 'Nhà mái vòm', 'Dome house', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('thanh-pho-nha-biet-bay', 'nha-pho', 'Nhà phố', 'Townhouse', { face: null, hat: { x: 300, y: 124, s: 0.9 }, build: B2.nhaPho }),
  reuse('thanh-pho-nha-biet-bay', 'chung-cu', 'chung-cu-biet-bay', 'Chung cư', 'Apartment'),
  O('thanh-pho-nha-biet-bay', 'nha-san', 'Nhà sàn', 'Stilt house', { face: null, hat: { x: 300, y: 152, s: 0.9 }, build: B2.nhaSan }),
  O('thanh-pho-nha-biet-bay', 'nha-tuyet', 'Nhà tuyết', 'Igloo', { face: null, hat: { x: 300, y: 244, s: 1 }, build: B2.nhaTuyet }),
  O('thanh-pho-nha-biet-bay', 'coi-xay-gio', 'Nhà cối xay gió', 'Windmill house', { face: null, hat: { x: 300, y: 180, s: 0.7 }, build: B2.coiXayGio }),

  // 06 — Đồ chơi × Sống dậy lúc nửa đêm
  O('xu-so-do-choi', 'bup-be-go', 'Búp bê gỗ', 'Wooden doll', { face: { x: 300, y: 250, s: 0.72 }, hat: { x: 300, y: 166, s: 0.8 }, build: B2.bupBeGo }),
  O('xu-so-do-choi', 'linh-chi', 'Lính chì', 'Tin soldier', { face: { x: 300, y: 244, s: 0.62 }, hat: { x: 300, y: 124, s: 0.8 }, build: B2.linhChi }),
  O('xu-so-do-choi', 'ngua-bap-benh', 'Ngựa bập bênh', 'Rocking horse', { face: { x: 440, y: 216, s: 0.45 }, mouth: false, hat: { x: 438, y: 180, s: 0.6 }, build: B2.nguaBapBenh }),
  O('xu-so-do-choi', 'con-quay', 'Con quay', 'Spinning top', { face: { x: 300, y: 372, s: 0.7 }, hat: { x: 300, y: 204, s: 0.6 }, build: B2.conQuay }),
  O('xu-so-do-choi', 'hop-hinh-nhay', 'Hộp hình nhảy', 'Jack-in-the-box', { face: { x: 300, y: 188, s: 0.7 }, hat: { x: 300, y: 128, s: 0.7 }, build: B2.hopHinhNhay }),
  O('xu-so-do-choi', 'khoi-xep-chu', 'Khối xếp chữ', 'Letter blocks', { face: { x: 300, y: 284, s: 0.55 }, hat: { x: 300, y: 232, s: 0.8 }, build: B2.khoiXepChu }),

  // 09 — Thiên thể × Một ngày sinh hoạt
  O('vuong-quoc-thien-the', 'mat-troi', 'Mặt Trời', 'Sun', { face: { x: 300, y: 290, s: 1.1 }, hat: { x: 300, y: 184, s: 1 }, build: B2.matTroi }),
  O('vuong-quoc-thien-the', 'mat-trang', 'Mặt Trăng', 'Moon', { face: { x: 196, y: 300, s: 0.62 }, hat: { x: 250, y: 150, s: 0.8 }, build: B2.matTrang }),
  O('vuong-quoc-thien-the', 'ngoi-sao', 'Ngôi sao', 'Star', { face: { x: 300, y: 300, s: 0.95 }, hat: { x: 300, y: 150, s: 0.7 }, build: B2.ngoiSao }),
  O('vuong-quoc-thien-the', 'sao-tho', 'Sao Thổ', 'Saturn', { face: { x: 300, y: 318, s: 0.9 }, hat: { x: 300, y: 190, s: 0.9 }, build: B2.saoTho }),
  O('vuong-quoc-thien-the', 'trai-dat', 'Trái Đất', 'Earth', { face: { x: 300, y: 294, s: 1 }, hat: { x: 300, y: 164, s: 1 }, build: B2.traiDat }),
  O('vuong-quoc-thien-the', 'sao-choi', 'Sao chổi', 'Comet', { face: { x: 372, y: 246, s: 0.8 }, hat: { x: 372, y: 164, s: 0.8 }, build: B2.saoChoi }),

  // 12 — Công trình cổ tích × Bốn mùa & lễ hội
  reuse('vuong-quoc-lau-dai', 'lau-dai', 'lau-dai-huyen-bi', 'Lâu đài', 'Castle'),
  O('vuong-quoc-lau-dai', 'dai-thien-van', 'Đài thiên văn', 'Observatory', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('vuong-quoc-lau-dai', 'cong-vien', 'Cổng công viên', 'Park gate', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('vuong-quoc-lau-dai', 'bao-tang', 'Bảo tàng', 'Museum', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('vuong-quoc-lau-dai', 'chung-cu', 'Chung cư', 'Apartment building', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('vuong-quoc-lau-dai', 'hai-dang', 'Hải đăng', 'Lighthouse', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('vuong-quoc-lau-dai', 'nha-ga', 'Nhà ga', 'Train station', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('vuong-quoc-lau-dai', 'thu-vien', 'Thư viện', 'Library', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: () => [] }),
  O('vuong-quoc-lau-dai', 'cung-dien', 'Cung điện mái vòm', 'Domed palace', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: B2.cungDien }),
  O('vuong-quoc-lau-dai', 'thap-co', 'Tháp cổ', 'Ancient tower', { face: null, hat: { x: 300, y: 62, s: 0.6 }, build: B2.thapCo }),
  O('vuong-quoc-lau-dai', 'cong-thanh', 'Cổng thành', 'Castle gate', { face: null, hat: { x: 300, y: 250, s: 0.8 }, build: B2.congThanh }),
  O('vuong-quoc-lau-dai', 'cau-da', 'Cầu đá cổ tích', 'Fairytale stone bridge', { face: null, hat: { x: 300, y: 282, s: 0.7 }, ground: 'water', build: B2.cauDa }),
  O('vuong-quoc-lau-dai', 'gieng-uoc', 'Giếng ước', 'Wishing well', { face: null, hat: { x: 300, y: 142, s: 0.7 }, build: B2.giengUoc }),
  // 10 — Dụng cụ khoa học × Phản ứng kỳ diệu

  // 11 — Dụng cụ mỹ thuật × Họa sĩ nhí
  O('xuong-nghe-thuat', 'co-ve', 'Cọ vẽ', 'Paintbrush', { face: { x: 300, y: 220, s: 0.62 }, hat: { x: 300, y: 90, s: 0.6 }, build: B3.coVe }),
  O('xuong-nghe-thuat', 'but-chi-mau', 'Bút chì màu', 'Colored pencil', { face: { x: 300, y: 250, s: 0.7 }, hat: { x: 300, y: 72, s: 0.6 }, build: B3.butChiMau }),
  O('xuong-nghe-thuat', 'but-sap', 'Bút sáp', 'Crayon', { face: { x: 300, y: 318, s: 0.8 }, hat: { x: 300, y: 100, s: 0.55 }, build: B3.butSap }),
  O('xuong-nghe-thuat', 'bang-mau', 'Bảng màu', 'Paint palette', { face: { x: 270, y: 390, s: 0.75 }, hat: { x: 310, y: 140, s: 0.8 }, build: B3.bangMau }),
  O('xuong-nghe-thuat', 'tuyp-mau', 'Tuýp màu', 'Paint tube', { face: { x: 300, y: 335, s: 0.8 }, hat: { x: 300, y: 96, s: 0.6 }, build: B3.tuypMau }),
  O('xuong-nghe-thuat', 'gia-ve', 'Giá vẽ', 'Easel', { face: { x: 300, y: 215, s: 0.9 }, hat: { x: 300, y: 96, s: 0.8 }, build: B3.giaVe }),

  // 13 — Đồ vật hải tặc × Phiêu lưu biển cả

  // 14 — Đạo cụ xiếc × Màn biểu diễn

  // 15 — Máy móc × Cư dân thành phố tí hon
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
  // ================= Đợt 2 (thẻ tạm theo chủ đề) =================
  'khu-rung-cay-than': {
    variants: [],
    cards: [
      card('C', 'mam-xanh', 'Mầm Xanh', 'Green Sprout', { expr: 'happy', scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'deo-no-hoa', 'Đeo Nơ Hoa', 'Flower Bow', { expr: 'happy', scene: ['clouds', 'flowers', 'butterfly'], acc: (c) => ({ front: A.ribbonBow(c) }) }),
      card('A', 'duoi-cau-vong', 'Dưới Cầu Vồng', 'Under the Rainbow', { expr: 'happy', scene: ['rainbow', 'clouds', 'stars'], acc: () => ({}) }),
      card('S', 'cay-than-nghin-nam', 'Cây Thần Nghìn Năm', 'Thousand-Year Magic Tree', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
    ],
  },
  'thanh-pho-nha-biet-bay': {
    variants: [],
    cards: [
      card('C', 'ngoi-nha-nho', 'Ngôi Nhà Nhỏ', 'Little Home', { scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'co-bong-bay', 'Có Bóng Bay', 'With Balloons', { scene: ['clouds', 'balloons'], acc: () => ({}) }),
      card('A', 'duoi-cau-vong', 'Dưới Cầu Vồng', 'Under the Rainbow', { scene: ['rainbow', 'clouds', 'stars'], acc: () => ({}) }),
      card('S', 'nha-bay-hoang-kim', 'Nhà Bay Hoàng Kim', 'Golden Flying House', { scene: ['rainbow', 'stars', 'confetti'], transform: { ty: -40, scale: 0.85, px: 300, py: 400 }, acc: (c) => ({ behind: A.wings(c, '#FFE9A8', '#FFD54F'), front: A.crown(c) }) }),
    ],
  },
  'xu-so-do-choi': {
    variants: [],
    cards: [
      card('C', 'mon-do-choi', 'Món Đồ Chơi', 'Little Toy', { expr: 'happy', scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'deo-no-qua', 'Đeo Nơ Quà', 'Gift Bow', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ front: A.ribbonBow(c) }) }),
      card('A', 'dem-sao', 'Đêm Đầy Sao', 'Starry Night', { expr: 'happy', scene: ['night', 'stars'], acc: () => ({}) }),
      card('S', 'hop-qua-vang', 'Hộp Quà Vàng', 'Golden Gift Box', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
    ],
  },
  'vuong-quoc-thien-the': {
    variants: [],
    cards: [
      card('C', 'lap-lanh', 'Lấp Lánh', 'Twinkle', { expr: 'happy', scene: ['clouds'], acc: () => ({}) }),
      card('B', 'deo-no', 'Đeo Nơ', 'With a Bow', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ front: A.ribbonBow(c) }) }),
      card('A', 'giua-dai-ngan-ha', 'Giữa Dải Ngân Hà', 'In the Milky Way', { expr: 'happy', scene: ['space', 'stars'], sky: 'space', acc: () => ({}) }),
      card('S', 'hao-quang-ruc-ro', 'Hào Quang Rực Rỡ', 'Radiant Glory', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFF3B0'), front: A.crown(c) }) }),
    ],
  },
  'vuong-quoc-lau-dai': {
    variants: [],
    cards: [
      card('C', 'cong-trinh-nho', 'Công Trình Nhỏ', 'Little Landmark', { scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'treo-co-hoa', 'Treo Cờ Hoa', 'Flag Garland', { scene: ['clouds', 'confetti'], acc: () => ({ fg: X.bunting(70) }) }),
      card('A', 'duoi-cau-vong', 'Dưới Cầu Vồng', 'Under the Rainbow', { scene: ['rainbow', 'clouds', 'stars'], acc: () => ({}) }),
      card('S', 'ban-pha-le', 'Bản Pha Lê', 'Crystal Edition', { scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#B3E5FC'), front: A.crown(c, '#B3E5FC', '#7DE2FF') }) }),
    ],
  },
  // ================= Đợt 3 (thẻ tạm theo chủ đề) =================
  'xuong-nghe-thuat': {
    variants: [],
    cards: [
      card('C', 'hoa-si-nhi', 'Họa Sĩ Nhí', 'Little Artist', { expr: 'happy', scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'deo-no', 'Đeo Nơ', 'With a Bow', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ front: A.ribbonBow(c) }) }),
      card('A', 'duoi-cau-vong', 'Dưới Cầu Vồng', 'Under the Rainbow', { expr: 'happy', scene: ['rainbow', 'clouds', 'stars'], acc: () => ({}) }),
      card('S', 'kiet-tac-vang', 'Kiệt Tác Vàng', 'Golden Masterpiece', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
    ],
  },
};

// ---------------- Thẻ vẽ tay (thay thẻ tạm theo chủ đề) ----------------
// Tranh nét do chủ web gửi, chuyển thành vùng tô bằng assets-library/art/lineart.py → art/<file>.json.
// CHỈ những thẻ có trong danh sách này mới được tạo (bộ thẻ gacha = tranh chủ web cung cấp), theo đúng thứ tự gửi.
// Tên/slug thẻ lấy theo thẻ mẫu cùng hạng của chủ đề.
// Thẻ của con vật không có trong 6 đối tượng của chủ đề: ghi thêm theme + objectName + slug + name (thẻ riêng, không có tranh thường).
export const CARD_ART = [
  { object: 'meo-sieu-thu', rarity: 'S', file: 'meo-sieu-thu--s' },
  { theme: 'anh-hung-sieu-thu', object: 'ca-heo', objectName: { vi: 'Cá heo', en: 'Dolphin' }, rarity: 'A', slug: 'the-a-dung-si-bien-ca', name: { vi: 'Dũng Sĩ Biển Cả', en: 'Ocean Warrior' }, file: 'ca-heo--a' },
  { theme: 'vuong-quoc-lau-dai', object: 'tho', objectName: { vi: 'Thỏ', en: 'Bunny' }, rarity: 'S', slug: 'the-s-cong-chua-dang-yeu', name: { vi: 'Công Chúa Đáng Yêu', en: 'Lovely Princess' }, file: 'tho--s' },
  { theme: 'anh-hung-sieu-thu', object: 'heo', objectName: { vi: 'Heo', en: 'Pig' }, rarity: 'A', slug: 'the-a-cao-boi', name: { vi: 'Cao Bồi', en: 'Cowboy' }, file: 'heo--a' },
  { theme: 'anh-hung-sieu-thu', object: 'voi', objectName: { vi: 'Voi', en: 'Elephant' }, rarity: 'S', slug: 'the-s-linh-cuu-hoa', name: { vi: 'Lính Cứu Hỏa', en: 'Firefighter' }, file: 'voi--s' },
  { theme: 'anh-hung-sieu-thu', object: 'capybara', objectName: { vi: 'Capybara', en: 'Capybara' }, rarity: 'S', slug: 'the-s-hai-tac', name: { vi: 'Hải Tặc', en: 'Pirate' }, file: 'capybara--s' },
  { theme: 'the-thao-trai-cay', object: 'hamster', objectName: { vi: 'Hamster', en: 'Hamster' }, rarity: 'S', slug: 'the-s-tham-an', name: { vi: 'Tham Ăn', en: 'Little Glutton' }, file: 'hamster--s' },
];


// Tranh thường (không phải thẻ) thay bằng tranh vẽ tay: "<đối tượng>--<biến thể>" → file trong art/.
/** Tranh đứng đầu trang chọn tranh của chủ đề (hàng 1 = 5 tranh đầu, hàng 2 = 5 tranh kế), theo thứ tự: khoá = `<đối tượng>--<biến thể>`. */
export const THEME_FIRST = {
  'vuong-quoc-keo-ngot': ['banh-kem--hoang-hau', 'donut--nha-vua', 'cupcake--cong-chua', 'keo-mut--hoang-tu', 'kem-oc-que--nu-hoang-bang-gia',
    'banh-quy--linh-gac', 'keo-mut--hiep-si', 'macaron--cung-nu', 'banh-gung--dau-bep', 'socola--te-tuong'],
  'anh-hung-sieu-thu': ['su-tu--ruc-lua', 'ho--tia-chop', 'cho-sieu-thu--sieu-thong-minh', 'meo-sieu-thu--nhay-sieu-cao', 'tho-sieu-thu--sieu-toc',
    'gau-sieu-thu--dai-luc', 'dai-bang--xe-gio', 'heo-sieu-thu--sieu-pham-an', 'khi-sieu-thu--day-leo-than-toc', 'canh-cut-sieu-thu--bang-gia'],
  'thi-tran-khung-long': ['khung-long-bao-chua--dau-bep', 'khung-long-co-dai--tho-lau-kinh', 'khung-long-ba-sung--bac-si', 'khung-long-gai-lung--nong-dan',
    'duc-long--dua-thu', 'khung-long-mao-ken--tho-lam-vuon', 'khung-long-boc-giap--tho-xay', 'khung-long-dau-vom--giao-vien', 'bo-sat-bien--ngu-dan', 'khung-long-hai-mao--hoa-si'],
  'doi-xe-vu-tru': [
    'xe-dua--phan-luc', 'xe-buyt-vu-tru--cho-phi-hanh-gia', 'xe-cuu-hoa--dap-lua-thien-thach', 'tau-hoa-vu-tru--duong-ray-ngan-ha', 'may-bay-vu-tru--bay-qua-vong-hanh-tinh',
    'xe-tai-vu-tru--giao-hang-lien-hanh-tinh', 'xe-xuc-vu-tru--dao-kho-bau-thien-thach', 'truc-thang--tha-du-tiep-te', 'xe-tuk-tuk-vu-tru--di-dao-thien-ha', 'xe-canh-sat-vu-tru--tuan-tra-ngan-ha'
  ],
  'khu-rung-cay-than': ['cay-co-thu--canh-cua-bi-mat', 'cay-co-thu--cong-troi', 'cay-dua--dao-ngoc-thien-duong', 'cay-xuong-rong--oc-dao-anh-sao', 'cay-lieu--ren-trang', 'khom-tre--rung-ngoc-bich',
    'cay-thong--ngoi-sao-tuyet', 'cay-anh-dao--mua-sao-hong', 'cay-phong--la-lua-thien-thu', 'cay-bao-bap--sa-mac-nang-vang'],
  'vuong-quoc-lau-dai': ['lau-dai-huyen-bi--mua-xuan-hoa-no', 'thu-vien--sach-mo-than-ky', 'cau-da--cau-vong-thuoc-ke', 'thap-co--dong-ho-got-but', 'nha-ga--hop-but-phieu-luu',
    'dai-thien-van--compa-ngan-ha', 'cong-vien--keo-than-ky', 'bao-tang--bang-mau', 'chung-cu--so-tay-xoan-oc', 'hai-dang--ho-dan-anh-sao'],
  'thanh-pho-nha-biet-bay': ['nha-go-biet-bay--khinh-khi-cau', 'nha-tam-giac--may-trang', 'coi-xay-chong-chong--chong-chong', 'biet-thu--truc-thang', 'nha-san-canh-chim--canh-chim',
    'nha-ong-ten-lua--ten-lua', 'nha-tuyet-du--cau-vong', 'lau-dai-canh-rong--canh-rong', 'nha-kinh-drone--bay', 'nha-mai-vom--bong-bay'],
  'the-thao-trai-cay': ['ngo--karate', 'tao-the-thao--da-bong', 'chuoi-the-thao--bong-ro', 'dau-tay-the-thao--nhay-day', 'dua-hau-the-thao--nang-ta', 'dua--luot-song',
    'cam-the-thao--vuot-rao', 'xoai-the-thao--tennis', 'le-the-thao--ban-cung', 'dua-nau--quyen-anh'],
};

/** Chủ đề chỉ hiện các tranh trong THEME_FIRST; tranh còn lại bị ẩn (vẫn giữ trong kho để xem lại tranh đã tô). */
/** Tranh bị ẩn riêng lẻ (vẫn giữ trong kho để xem lại tranh đã tô). */
export const HIDDEN_PICTURES = ['duc-long--phi-cong'];
export const THEME_ONLY_FIRST = ['anh-hung-sieu-thu', 'vuong-quoc-keo-ngot', 'doi-xe-vu-tru', 'thi-tran-khung-long', 'the-thao-trai-cay', 'khu-rung-cay-than', 'vuong-quoc-lau-dai', 'thanh-pho-nha-biet-bay'];

export const VARIANT_ART = {
  'donut--nha-vua': 'donut--nha-vua',
  'xe-dua--phan-luc': 'xe-dua--phan-luc',
  'khung-long-bao-chua--dau-bep': 'khung-long-bao-chua--dau-bep',
  'su-tu--ruc-lua': 'su-tu--ruc-lua',
  'ho--tia-chop': 'ho--gam-vang',
  'cam-the-thao--vuot-rao': 'cam-the-thao--vuot-rao',
  'xoai-the-thao--tennis': 'xoai-the-thao--tennis',
  'le-the-thao--ban-cung': 'le-the-thao--ban-cung',
  'dua-nau--quyen-anh': 'dua-nau--quyen-anh',
  'ngo--karate': 'ngo--karate',
  'dua--luot-song': 'dua--luot-song',
  'dua-hau-the-thao--nang-ta': 'dua-hau-the-thao--nang-ta',
  'dau-tay-the-thao--nhay-day': 'dau-tay-the-thao--nhay-day',
  'chuoi-the-thao--bong-ro': 'chuoi-the-thao--bong-ro',
  'khung-long-hai-mao--hoa-si': 'khung-long-hai-mao--hoa-si',
  'bo-sat-bien--ngu-dan': 'bo-sat-bien--ngu-dan',
  'khung-long-dau-vom--giao-vien': 'khung-long-dau-vom--giao-vien',
  'khung-long-mao-ken--tho-lam-vuon': 'khung-long-mao-ken--tho-lam-vuon',
  'khung-long-boc-giap--tho-xay': 'khung-long-boc-giap--tho-xay',
  'duc-long--dua-thu': 'duc-long--dua-thu',
  'khung-long-gai-lung--nong-dan': 'khung-long-gai-lung--nong-dan',
  'khung-long-ba-sung--bac-si': 'khung-long-ba-sung--bac-si',
  'khung-long-co-dai--tho-lau-kinh': 'khung-long-co-dai--tho-lau-kinh',
  'xe-canh-sat-vu-tru--tuan-tra-ngan-ha': 'xe-canh-sat-vu-tru--tuan-tra-ngan-ha',
  'xe-tuk-tuk-vu-tru--di-dao-thien-ha': 'xe-tuk-tuk-vu-tru--di-dao-thien-ha',
  'xe-xuc-vu-tru--dao-kho-bau-thien-thach': 'xe-xuc-vu-tru--dao-kho-bau-thien-thach',
  'xe-tai-vu-tru--giao-hang-lien-hanh-tinh': 'xe-tai-vu-tru--giao-hang-lien-hanh-tinh',
  'truc-thang--tha-du-tiep-te': 'truc-thang--tha-du-tiep-te',
  'may-bay-vu-tru--bay-qua-vong-hanh-tinh': 'may-bay-vu-tru--bay-qua-vong-hanh-tinh',
  'tau-hoa-vu-tru--duong-ray-ngan-ha': 'tau-hoa-vu-tru--duong-ray-ngan-ha',
  'xe-cuu-hoa--dap-lua-thien-thach': 'xe-cuu-hoa--dap-lua-thien-thach',
  'xe-buyt-vu-tru--cho-phi-hanh-gia': 'xe-buyt-vu-tru--cho-phi-hanh-gia',
  'socola--te-tuong': 'socola--te-tuong',
  'banh-gung--dau-bep': 'banh-gung--dau-bep',
  'macaron--cung-nu': 'macaron--cung-nu',
  'keo-mut--hiep-si': 'keo-mut--hiep-si',
  'banh-kem--hoang-hau': 'banh-kem--hoang-hau',
  'banh-quy--linh-gac': 'banh-quy--linh-gac',
  'kem-oc-que--nu-hoang-bang-gia': 'kem-oc-que--nu-hoang-bang-gia',
  'keo-mut--hoang-tu': 'keo-mut--hoang-tu',
  'cupcake--cong-chua': 'cupcake--cong-chua',
  'canh-cut-sieu-thu--bang-gia': 'canh-cut-sieu-thu--bang-gia',
  'khi-sieu-thu--day-leo-than-toc': 'khi-sieu-thu--day-leo-than-toc',
  'heo-sieu-thu--sieu-pham-an': 'heo-sieu-thu--sieu-pham-an',
  'dai-bang--xe-gio': 'dai-bang--xe-gio',
  'gau-sieu-thu--dai-luc': 'gau-sieu-thu--dai-luc',
  'tho-sieu-thu--sieu-toc': 'tho-sieu-thu--sieu-toc',
  'cho-sieu-thu--sieu-thong-minh': 'cho-sieu-thu--sieu-thong-minh',
  'meo-sieu-thu--nhay-sieu-cao': 'meo--nhay-sieu-cao',
  'tao-the-thao--da-bong': 'tao-the-thao--da-bong',
  'lau-dai-huyen-bi--mua-xuan-hoa-no': 'lau-dai-huyen-bi--mua-xuan-hoa-no',
  'cay-co-thu--canh-cua-bi-mat': 'cay-co-thu--canh-cua-bi-mat',
  'cay-co-thu--cong-troi': 'cay-co-thu--cong-troi',
  'cay-dua--dao-ngoc-thien-duong': 'cay-dua--dao-ngoc-thien-duong',
  'dai-thien-van--compa-ngan-ha': 'dai-thien-van--compa-ngan-ha',
  'cong-vien--keo-than-ky': 'cong-vien--keo-than-ky',
  'nha-ga--hop-but-phieu-luu': 'nha-ga--hop-but-phieu-luu',
  'hai-dang--ho-dan-anh-sao': 'hai-dang--ho-dan-anh-sao',
  'chung-cu--so-tay-xoan-oc': 'chung-cu--so-tay-xoan-oc',
  'bao-tang--bang-mau': 'bao-tang--bang-mau',
  'thap-co--dong-ho-got-but': 'thap-co--dong-ho-got-but',
  'cau-da--cau-vong-thuoc-ke': 'cau-da--cau-vong-thuoc-ke',
  'thu-vien--sach-mo-than-ky': 'thu-vien--sach-mo-than-ky',
  'cay-bao-bap--sa-mac-nang-vang': 'cay-bao-bap--sa-mac-nang-vang',
  'cay-phong--la-lua-thien-thu': 'cay-phong--la-lua-thien-thu',
  'cay-anh-dao--mua-sao-hong': 'cay-anh-dao--mua-sao-hong',
  'cay-lieu--ren-trang': 'cay-lieu--ren-trang',
  'cay-thong--ngoi-sao-tuyet': 'cay-thong--ngoi-sao-tuyet',
  'khom-tre--rung-ngoc-bich': 'khom-tre--rung-ngoc-bich',
  'cay-xuong-rong--oc-dao-anh-sao': 'cay-xuong-rong--oc-dao-anh-sao',
  'nha-go-biet-bay--khinh-khi-cau': 'nha-go-biet-bay--khinh-khi-cau',
  'nha-tam-giac--may-trang': 'nha-tam-giac--may-trang',
  'nha-mai-vom--bong-bay': 'nha-mai-vom--bong-bay',
  'nha-kinh-drone--bay': 'nha-kinh-drone--bay',
  'lau-dai-canh-rong--canh-rong': 'lau-dai-canh-rong--canh-rong',
  'nha-tuyet-du--cau-vong': 'nha-tuyet-du--cau-vong',
  'nha-ong-ten-lua--ten-lua': 'nha-ong-ten-lua--ten-lua',
  'nha-san-canh-chim--canh-chim': 'nha-san-canh-chim--canh-chim',
  'biet-thu--truc-thang': 'biet-thu--truc-thang',
  'coi-xay-chong-chong--chong-chong': 'coi-xay-chong-chong--chong-chong',
};

// Tên riêng cho tranh vẽ tay (thay tên ghép "đối tượng + biến thể"): "<đối tượng>--<biến thể>" → tên.
export const PICTURE_NAME = {
  'ho--tia-chop': { vi: 'Hổ Gầm Vang', en: 'Roaring Tiger' },
  'cam-the-thao--vuot-rao': { vi: 'Cam Ngọt Chạy Vượt Rào', en: 'Orange Hurdler' },
  'ngo--karate': { vi: 'Ngô Tập Võ Karate', en: 'Corn Karate' },
  'dua-nau--quyen-anh': { vi: 'Dừa Nâu Tập Quyền Anh', en: 'Coconut Boxer' },
  'le-the-thao--ban-cung': { vi: 'Lê Xanh Tập Bắn Cung', en: 'Pear Archer' },
  'xoai-the-thao--tennis': { vi: 'Xoài Vàng Chơi Tennis', en: 'Mango Tennis' },
  'dua--luot-song': { vi: 'Đào Hồng Lướt Sóng', en: 'Pink Peach Surfer' },
  'dua-hau-the-thao--nang-ta': { vi: 'Dưa Hấu Nâng Tạ', en: 'Watermelon Weightlifter' },
  'dau-tay-the-thao--nhay-day': { vi: 'Anh Đào Nhảy Dây', en: 'Cherry Jump Rope' },
  'chuoi-the-thao--bong-ro': { vi: 'Chuối Vàng Chơi Bóng Rổ', en: 'Banana Basketball' },
  'khung-long-hai-mao--hoa-si': { vi: 'Khủng Long Hai Mào Họa Sĩ', en: 'Twin-crest Painter' },
  'bo-sat-bien--ngu-dan': { vi: 'Bò Sát Biển Cổ Dài Ngư Dân', en: 'Plesiosaur Fisherman' },
  'khung-long-dau-vom--giao-vien': { vi: 'Khủng Long Đầu Vòm Giáo Viên', en: 'Dome-head Teacher' },
  'khung-long-mao-ken--tho-lam-vuon': { vi: 'Khủng Long Mỏ Vịt Thợ Làm Vườn', en: 'Duck-bill Gardener' },
  'khung-long-boc-giap--tho-xay': { vi: 'Khủng Long Bọc Giáp Thợ Xây', en: 'Armored Dino Builder' },
  'duc-long--dua-thu': { vi: 'Dực Long Đưa Thư', en: 'Pterosaur Mail Carrier' },
  'khung-long-gai-lung--nong-dan': { vi: 'Khủng Long Lưng Gai Nông Dân', en: 'Stegosaurus Farmer' },
  'khung-long-ba-sung--bac-si': { vi: 'Khủng Long Ba Sừng Bác Sĩ', en: 'Triceratops Doctor' },
  'khung-long-co-dai--tho-lau-kinh': { vi: 'Khủng Long Cổ Dài Lau Kính Toàn Nhà', en: 'Long-neck Window Washer' },
  'xe-canh-sat-vu-tru--tuan-tra-ngan-ha': { vi: 'Xe Cảnh Sát Tuần Tra Ngân Hà', en: 'Galaxy Patrol Police Car' },
  'xe-tuk-tuk-vu-tru--di-dao-thien-ha': { vi: 'Xe Túc Túc Đi Dạo Thiên Hà', en: 'Galaxy Stroll Tuk-tuk' },
  'xe-xuc-vu-tru--dao-kho-bau-thien-thach': { vi: 'Xe Xúc Đào Kho Báu Thiên Thạch', en: 'Asteroid Treasure Excavator' },
  'xe-tai-vu-tru--giao-hang-lien-hanh-tinh': { vi: 'Xe Tải Giao Hàng Liên Hành Tinh', en: 'Interplanetary Delivery Truck' },
  'truc-thang--tha-du-tiep-te': { vi: 'Trực Thăng Thả Dù Tiếp Tế', en: 'Supply Drop Helicopter' },
  'may-bay-vu-tru--bay-qua-vong-hanh-tinh': { vi: 'Máy Bay Vòng Quanh Hành Tinh', en: 'Around the Planet Plane' },
  'tau-hoa-vu-tru--duong-ray-ngan-ha': { vi: 'Tàu Hỏa Đường Ray Ngân Hà', en: 'Galaxy Railway Train' },
  'xe-cuu-hoa--dap-lua-thien-thach': { vi: 'Xe Cứu Hỏa Dập Lửa Thiên Hà', en: 'Galaxy Fire Truck' },
  'xe-buyt-vu-tru--cho-phi-hanh-gia': { vi: 'Xe Buýt Chở Phi Hành Gia', en: 'Astronaut Bus' },
  'kem-oc-que--nu-hoang-bang-gia': { vi: 'Bánh Quế Cuộn Quân Sư', en: 'Wafer Roll Strategist' },
  'tho-con--tho-con': { vi: 'Thỏ con', en: 'Bunny' },
  'ga-con--ga-con': { vi: 'Gà con', en: 'Chick' },
  'vit-con--vit-con': { vi: 'Vịt con', en: 'Duckling' },
  'heo-con--heo-con': { vi: 'Heo con', en: 'Piglet' },
  'bo-sua--bo-sua': { vi: 'Bò sữa', en: 'Dairy cow' },
  'ca-vang--ca-vang': { vi: 'Cá vàng', en: 'Goldfish' },
  'chim-con--chim-con': { vi: 'Chim con', en: 'Little bird' },
  'buom--buom': { vi: 'Bướm', en: 'Butterfly' },
  'tao--tao': { vi: 'Táo', en: 'Apple' },
  'chuoi--chuoi': { vi: 'Chuối', en: 'Banana' },
  'cam--cam': { vi: 'Cam', en: 'Orange' },
  'xoai--xoai': { vi: 'Xoài', en: 'Mango' },
  'dua-hau--dua-hau': { vi: 'Dưa hấu', en: 'Watermelon' },
  'nho--nho': { vi: 'Nho', en: 'Grapes' },
  'dau-tay--dau-tay': { vi: 'Dâu tây', en: 'Strawberry' },
  'du-du--du-du': { vi: 'Đu đủ', en: 'Papaya' },
  'dua--dua': { vi: 'Dừa', en: 'Coconut' },
  'dua-thom--dua-thom': { vi: 'Dứa', en: 'Pineapple' },
  'o-to--o-to': { vi: 'Ô tô', en: 'Car' },
  'xe-buyt--xe-buyt': { vi: 'Xe buýt', en: 'Bus' },
  'xe-tai--xe-tai': { vi: 'Xe tải', en: 'Truck' },
  'may-bay--may-bay': { vi: 'Máy bay', en: 'Airplane' },
  'meo-con--meo-con': { vi: 'Mèo con', en: 'Kitten' },
  'socola--te-tuong': { vi: 'Socola Tể Tướng', en: 'Chocolate Chancellor' },
  'banh-gung--dau-bep': { vi: 'Bánh Gừng Đầu Bếp', en: 'Gingerbread Chef' },
  'macaron--cung-nu': { vi: 'Macaron Cung Nữ', en: 'Macaron Maid' },
  'keo-mut--hiep-si': { vi: 'Kẹo Dẻo Hiệp Sĩ', en: 'Gummy Knight' },
  'canh-cut-sieu-thu--bang-gia': { vi: 'Chim Cánh Cụt Băng Giá', en: 'Frost Penguin' },
  'khi-sieu-thu--day-leo-than-toc': { vi: 'Khỉ Dây Leo Thần Tốc', en: 'Lightning Vine Monkey' },
  'heo-sieu-thu--sieu-pham-an': { vi: 'Heo Siêu Phàm Ăn', en: 'Super Foodie Pig' },
  'dai-bang--xe-gio': { vi: 'Đại Bàng Xé Gió', en: 'Windslicer Eagle' },
  'gau-sieu-thu--dai-luc': { vi: 'Gấu Trắng Đại Lực', en: 'Mighty Polar Bear' },
  'tho-sieu-thu--sieu-toc': { vi: 'Thỏ Siêu Tốc', en: 'Super Speed Bunny' },
  'cho-sieu-thu--sieu-thong-minh': { vi: 'Chó Siêu Thông Minh', en: 'Super Smart Dog' },
  'meo-sieu-thu--nhay-sieu-cao': { vi: 'Mèo Nhảy Siêu Cao', en: 'Super Jump Cat' },
  'cay-xuong-rong--oc-dao-anh-sao': { vi: 'Xương Rồng Ốc Đảo Ánh Sao', en: 'Starlight Oasis Cactus' },
  'khom-tre--rung-ngoc-bich': { vi: 'Rừng Tre Ngọc Bích', en: 'Jade Bamboo Forest' },
  'cay-thong--ngoi-sao-tuyet': { vi: 'Cây Thông Ngôi Sao Tuyết', en: 'Snowy Star Pine' },
  'cay-lieu--ren-trang': { vi: 'Cây Liễu Rèm Trăng', en: 'Moonlit Willow Curtain' },
  'cay-anh-dao--mua-sao-hong': { vi: 'Cây Anh Đào Mưa Sao Hồng', en: 'Pink Star-Shower Cherry Tree' },
  'cay-phong--la-lua-thien-thu': { vi: 'Cây Phong Lá Lửa Thiên Thu', en: 'Autumn Fire Maple' },
  'cay-bao-bap--sa-mac-nang-vang': { vi: 'Cây Bao Báp Giữa Sa Mạc Nắng Vàng', en: 'Golden Desert Baobab' },
  'coi-xay-chong-chong--chong-chong': { vi: 'Nhà Cối Xay Gió Chong Chóng', en: 'Pinwheel Windmill House' },
  'biet-thu--truc-thang': { vi: 'Biệt Thự Trực Thăng', en: 'Helicopter Villa' },
  'nha-san-canh-chim--canh-chim': { vi: 'Nhà Sàn Cánh Chim', en: 'Winged Stilt House' },
  'nha-ong-ten-lua--ten-lua': { vi: 'Nhà Ống Tên Lửa', en: 'Rocket Townhouse' },
  'nha-tuyet-du--cau-vong': { vi: 'Nhà Tuyết Dù Cầu Vồng', en: 'Rainbow Parachute Igloo' },
  'lau-dai-canh-rong--canh-rong': { vi: 'Lâu Đài Cánh Rồng', en: 'Dragon-Wing Castle' },
  'nha-kinh-drone--bay': { vi: 'Nhà Kính Drone Bay', en: 'Flying Drone Greenhouse' },
  'nha-mai-vom--bong-bay': { vi: 'Nhà Mái Vòm Bóng Bay', en: 'Balloon Dome House' },
  'nha-tam-giac--may-trang': { vi: 'Nhà Gỗ Tam Giác Mây Trắng', en: 'White Cloud A-Frame Cabin' },
  'thu-vien--sach-mo-than-ky': { vi: 'Thư Viện Sách Mở Thần Kỳ', en: 'Magic Open-Book Library' },
  'cau-da--cau-vong-thuoc-ke': { vi: 'Cầu Vồng Thước Kẻ Ánh Dương', en: 'Sunny Ruler Rainbow Bridge' },
  'thap-co--dong-ho-got-but': { vi: 'Tháp Đồng Hồ Gọt Bút Thời Gian', en: 'Pencil-Sharpener Clock Tower' },
  'bao-tang--bang-mau': { vi: 'Bảo Tàng Bảng Màu Sáng Tạo', en: 'Creative Palette Museum' },
  'chung-cu--so-tay-xoan-oc': { vi: 'Chung Cư Sổ Tay Xoắn Ốc', en: 'Spiral Notebook Apartments' },
  'hai-dang--ho-dan-anh-sao': { vi: 'Hải Đăng Hồ Dán Ánh Sao', en: 'Glue-Stick Starlight Lighthouse' },
  'nha-ga--hop-but-phieu-luu': { vi: 'Nhà Ga Hộp Bút Phiêu Lưu', en: 'Pencil-Case Adventure Station' },
  'cong-vien--keo-than-ky': { vi: 'Cổng Công Viên Kéo Thần Kỳ', en: 'Magic Scissors Park Gate' },
  'dai-thien-van--compa-ngan-ha': { vi: 'Đài Thiên Văn Compa Ngân Hà', en: 'Compass Galaxy Observatory' },
  'cay-dua--dao-ngoc-thien-duong': { vi: 'Cây Dừa Đảo Ngọc Thiên Đường', en: 'Paradise Jewel Island Palm' },
  'cay-co-thu--cong-troi': { vi: 'Cây Đa Cổng Trời', en: 'Sky Gate Banyan' },
  'cay-co-thu--canh-cua-bi-mat': { vi: 'Cây Cổ Thụ Thiên Đường', en: 'Paradise Ancient Tree' },
  'vay-hoa--cong-chua-vay-hoa-hong': { vi: 'Công Chúa Váy Hoa Hồng', en: 'Rose Gown Princess' },
  'lau-dai-huyen-bi--mua-xuan-hoa-no': { vi: 'Lâu Đài Bút Chì Cầu Vồng', en: 'Rainbow Pencil Castle' },
  'cardigan--cam-tu-cau': { vi: 'Thiếu Nữ Cardigan Cẩm Tú Cầu', en: 'Hydrangea Cardigan Maiden' },
  'hoodie--oai-huong': { vi: 'Cô Nàng Hoodie Oải Hương', en: 'Lavender Hoodie Girl' },
  'ao-len--hoa-ly': { vi: 'Tiểu Thư Áo Len Hoa Ly', en: 'Lily Sweater Girl' },
  'vay-ngan--huong-duong': { vi: 'Tiểu Thư Váy Ngắn Hướng Dương', en: 'Sunflower Short Dress Girl' },
  'suon-xam--tu-dang': { vi: 'Thiếu Nữ Sườn Xám Tử Đằng', en: 'Wisteria Qipao Maiden' },
  'vay-yem--hoa-cuc-trang': { vi: 'Cô Nàng Váy Yếm Hoa Cúc Trắng', en: 'Daisy Pinafore Girl' },
  'hanbok--mau-don': { vi: 'Thiếu Nữ Hanbok Mẫu Đơn', en: 'Peony Hanbok Maiden' },
  'ballet--hoa-tulip': { vi: 'Vũ Công Ballet Hoa Tulip', en: 'Tulip Ballerina' },
  'ao-dai--hoa-sen': { vi: 'Thiếu Nữ Áo Dài Hoa Sen', en: 'Lotus Ao Dai Maiden' },
  'tau-ngam--bong-bong-phep-thuat': { vi: 'Tàu Ngầm Bong Bóng Phép Thuật', en: 'Magic Bubble Submarine' },
};

// Nhóm tuổi: 3–5 (tranh vẽ tay, art/*.json), 6–8 (các chủ đề kết hợp sáng tạo ở trên), 9+ (chưa có tranh).
export const AGE_GROUPS = ['3-5', '6-8', '9+'];

/** Chủ đề tranh vẽ tay theo độ tuổi: chủ đề → đối tượng → từng tranh (file trong art/). */
export const ART_THEMES = [
  {
    slug: 'dong-vat-3-4',
    age: '3-5',
    name: { vi: 'Động Vật', en: 'Animals' },
    animation: 'bounce',
    objects: [
      {
        slug: 'cho-con',
        name: { vi: 'Chó con', en: 'Puppy' },
        pictures: [
          { slug: 'ben-nha-cun', name: { vi: 'Bên nhà cún', en: 'By the doghouse' }, file: 'cho-con--ben-nha-cun' },
          { slug: 'ngoi-ngoan', name: { vi: 'Ngồi ngoan', en: 'Sitting nicely' }, file: 'cho-con--ngoi-ngoan', hidden: true },
          { slug: 'vay-duoi', name: { vi: 'Vẫy đuôi', en: 'Wagging its tail' }, file: 'cho-con--vay-duoi', hidden: true },
          { slug: 'choi-bong', name: { vi: 'Chơi bóng', en: 'Playing ball' }, file: 'cho-con--choi-bong', hidden: true },
          { slug: 'an-thuc-an', name: { vi: 'Ăn thức ăn', en: 'Eating its food' }, file: 'cho-con--an-thuc-an', hidden: true },
          { slug: 'nam-nghi', name: { vi: 'Nằm nghỉ', en: 'Resting' }, file: 'cho-con--nam-nghi', hidden: true },
        ],
      },
      {
        slug: 'meo-con',
        name: { vi: 'Mèo con', en: 'Kitten' },
        pictures: [
          { slug: 'meo-con', name: { vi: 'Mèo con', en: 'Kitten' }, file: 'meo-con--meo-con' },
          { slug: 'ngoi-xinh', name: { vi: 'Ngồi xinh', en: 'Sitting pretty' }, file: 'meo-con--ngoi-xinh', hidden: true },
          { slug: 'choi-cuon-len', name: { vi: 'Chơi cuộn len', en: 'Playing with yarn' }, file: 'meo-con--choi-cuon-len', hidden: true },
          { slug: 'uong-sua', name: { vi: 'Uống sữa', en: 'Drinking milk' }, file: 'meo-con--uong-sua', hidden: true },
          { slug: 'rua-mat', name: { vi: 'Rửa mặt', en: 'Washing its face' }, file: 'meo-con--rua-mat', hidden: true },
          { slug: 'nam-ngu', name: { vi: 'Nằm ngủ', en: 'Sleeping' }, file: 'meo-con--nam-ngu', hidden: true },
        ],
      },
      {
        slug: 'tho-con',
        name: { vi: 'Thỏ con', en: 'Bunny' },
        pictures: [
          { slug: 'tho-con', name: { vi: 'Thỏ con', en: 'Bunny' }, file: 'tho-con--tho-con' },
          { slug: 'ngoi-ngoan', name: { vi: 'Ngồi ngoan', en: 'Sitting nicely' }, file: 'tho-con--ngoi-ngoan', hidden: true },
          { slug: 'an-ca-rot', name: { vi: 'Ăn cà rốt', en: 'Eating a carrot' }, file: 'tho-con--an-ca-rot', hidden: true },
          { slug: 'nhay-vui', name: { vi: 'Nhảy vui', en: 'Happy hopping' }, file: 'tho-con--nhay-vui', hidden: true },
          { slug: 'ngui-hoa', name: { vi: 'Ngửi hoa', en: 'Smelling a flower' }, file: 'tho-con--ngui-hoa', hidden: true },
          { slug: 'nam-nghi', name: { vi: 'Nằm nghỉ', en: 'Resting' }, file: 'tho-con--nam-nghi', hidden: true },
        ],
      },
      {
        slug: 'ga-con',
        name: { vi: 'Gà con', en: 'Chick' },
        pictures: [
          { slug: 'ga-con', name: { vi: 'Gà con', en: 'Chick' }, file: 'ga-con--ga-con' },
        ],
      },
      {
        slug: 'vit-con',
        name: { vi: 'Vịt con', en: 'Duckling' },
        pictures: [
          { slug: 'vit-con', name: { vi: 'Vịt con', en: 'Duckling' }, file: 'vit-con--vit-con' },
        ],
      },
      {
        slug: 'heo-con',
        name: { vi: 'Heo con', en: 'Piglet' },
        pictures: [
          { slug: 'heo-con', name: { vi: 'Heo con', en: 'Piglet' }, file: 'heo-con--heo-con' },
        ],
      },
      {
        slug: 'bo-sua',
        name: { vi: 'Bò sữa', en: 'Dairy cow' },
        pictures: [
          { slug: 'bo-sua', name: { vi: 'Bò sữa', en: 'Dairy cow' }, file: 'bo-sua--bo-sua' },
        ],
      },
      {
        slug: 'ca-vang',
        name: { vi: 'Cá vàng', en: 'Goldfish' },
        pictures: [
          { slug: 'ca-vang', name: { vi: 'Cá vàng', en: 'Goldfish' }, file: 'ca-vang--ca-vang' },
        ],
      },
      {
        slug: 'chim-con',
        name: { vi: 'Chim con', en: 'Little bird' },
        pictures: [
          { slug: 'chim-con', name: { vi: 'Chim con', en: 'Little bird' }, file: 'chim-con--chim-con' },
        ],
      },
      {
        slug: 'buom',
        name: { vi: 'Bướm', en: 'Butterfly' },
        pictures: [
          { slug: 'buom', name: { vi: 'Bướm', en: 'Butterfly' }, file: 'buom--buom' },
        ],
      },
    ],
  },
];

ART_THEMES.push({
  slug: 'trai-cay-3-5',
  age: '3-5',
  name: { vi: 'Trái Cây', en: 'Fruits' },
  animation: 'float',
  objects: [
    {
      slug: 'tao',
      name: { vi: 'Táo', en: 'Apple' },
      pictures: [
        { slug: 'tao', name: { vi: 'Táo', en: 'Apple' }, file: 'tao--tao' },
      ],
    },
    {
      slug: 'chuoi',
      name: { vi: 'Chuối', en: 'Banana' },
      pictures: [
        { slug: 'chuoi', name: { vi: 'Chuối', en: 'Banana' }, file: 'chuoi--chuoi' },
      ],
    },
    {
      slug: 'cam',
      name: { vi: 'Cam', en: 'Orange' },
      pictures: [
        { slug: 'cam', name: { vi: 'Cam', en: 'Orange' }, file: 'cam--cam' },
      ],
    },
    {
      slug: 'xoai',
      name: { vi: 'Xoài', en: 'Mango' },
      pictures: [
        { slug: 'xoai', name: { vi: 'Xoài', en: 'Mango' }, file: 'xoai--xoai' },
      ],
    },
    {
      slug: 'dua-hau',
      name: { vi: 'Dưa hấu', en: 'Watermelon' },
      pictures: [
        { slug: 'dua-hau', name: { vi: 'Dưa hấu', en: 'Watermelon' }, file: 'dua-hau--dua-hau' },
      ],
    },
    {
      slug: 'nho',
      name: { vi: 'Nho', en: 'Grapes' },
      pictures: [
        { slug: 'nho', name: { vi: 'Nho', en: 'Grapes' }, file: 'nho--nho' },
      ],
    },
    {
      slug: 'dau-tay',
      name: { vi: 'Dâu tây', en: 'Strawberry' },
      pictures: [
        { slug: 'dau-tay', name: { vi: 'Dâu tây', en: 'Strawberry' }, file: 'dau-tay--dau-tay' },
      ],
    },
    {
      slug: 'du-du',
      name: { vi: 'Đu đủ', en: 'Papaya' },
      pictures: [
        { slug: 'du-du', name: { vi: 'Đu đủ', en: 'Papaya' }, file: 'du-du--du-du' },
      ],
    },
    {
      slug: 'dua',
      name: { vi: 'Dừa', en: 'Coconut' },
      pictures: [
        { slug: 'dua', name: { vi: 'Dừa', en: 'Coconut' }, file: 'dua--dua' },
      ],
    },
    {
      slug: 'dua-thom',
      name: { vi: 'Dứa', en: 'Pineapple' },
      pictures: [
        { slug: 'dua-thom', name: { vi: 'Dứa', en: 'Pineapple' }, file: 'dua-thom--dua-thom' },
      ],
    },
  ],
});

ART_THEMES.push({
  slug: 'xe-co-3-5',
  age: '3-5',
  name: { vi: 'Xe Cộ', en: 'Vehicles' },
  animation: 'drive',
  objects: [
    {
      slug: 'o-to',
      name: { vi: 'Ô tô', en: 'Car' },
      pictures: [
        { slug: 'o-to', name: { vi: 'Ô tô', en: 'Car' }, file: 'o-to--o-to' },
      ],
    },
    {
      slug: 'xe-buyt',
      name: { vi: 'Xe buýt', en: 'Bus' },
      pictures: [
        { slug: 'xe-buyt', name: { vi: 'Xe buýt', en: 'Bus' }, file: 'xe-buyt--xe-buyt' },
      ],
    },
    {
      slug: 'xe-tai',
      name: { vi: 'Xe tải', en: 'Truck' },
      pictures: [
        { slug: 'xe-tai', name: { vi: 'Xe tải', en: 'Truck' }, file: 'xe-tai--xe-tai' },
      ],
    },
    {
      slug: 'may-bay',
      name: { vi: 'Máy bay', en: 'Airplane' },
      pictures: [
        { slug: 'may-bay', name: { vi: 'Máy bay', en: 'Airplane' }, file: 'may-bay--may-bay' },
      ],
    },
  ],
});

// Chủ đề tranh vẽ tay thuộc nhóm 6–8 tuổi: `after` = đứng ngay sau chủ đề có slug đó (cùng hàng trên trang chọn chủ đề).
ART_THEMES.push({
  slug: 'cong-chua-ngan-hoa',
  age: '6-8',
  after: 'xu-so-do-choi',
  name: { vi: 'Công Chúa Ngàn Hoa', en: 'Princess of a Thousand Flowers' },
  animation: 'float',
  objects: [
    {
      slug: 'vay-hoa',
      name: { vi: 'Công Chúa Váy Hoa', en: 'Flower Gown Princess' },
      pictures: [
        { slug: 'cong-chua-vay-hoa-hong', name: { vi: 'Công Chúa Váy Hoa Hồng', en: 'Rose Gown Princess' }, file: 'cong-chua-ngan-hoa--vay-hoa-hong' },
      ],
    },
    {
      slug: 'ao-dai',
      name: { vi: 'Thiếu Nữ Áo Dài', en: 'Ao Dai Maiden' },
      pictures: [
        { slug: 'hoa-sen', name: { vi: 'Thiếu Nữ Áo Dài Hoa Sen', en: 'Lotus Ao Dai Maiden' }, file: 'cong-chua-ngan-hoa--ao-dai-hoa-sen' },
      ],
    },
    {
      slug: 'ballet',
      name: { vi: 'Vũ Công Ballet', en: 'Ballerina' },
      pictures: [
        { slug: 'hoa-tulip', name: { vi: 'Vũ Công Ballet Hoa Tulip', en: 'Tulip Ballerina' }, file: 'cong-chua-ngan-hoa--ballet-hoa-tulip' },
      ],
    },
    {
      slug: 'hanbok',
      name: { vi: 'Thiếu Nữ Hanbok', en: 'Hanbok Maiden' },
      pictures: [
        { slug: 'mau-don', name: { vi: 'Thiếu Nữ Hanbok Mẫu Đơn', en: 'Peony Hanbok Maiden' }, file: 'cong-chua-ngan-hoa--hanbok-mau-don' },
      ],
    },
    {
      slug: 'suon-xam',
      name: { vi: 'Thiếu Nữ Sườn Xám', en: 'Qipao Maiden' },
      pictures: [
        { slug: 'tu-dang', name: { vi: 'Thiếu Nữ Sườn Xám Tử Đằng', en: 'Wisteria Qipao Maiden' }, file: 'cong-chua-ngan-hoa--suon-xam-tu-dang' },
      ],
    },
    {
      slug: 'vay-ngan',
      name: { vi: 'Tiểu Thư Váy Ngắn', en: 'Short Dress Girl' },
      pictures: [
        { slug: 'huong-duong', name: { vi: 'Tiểu Thư Váy Ngắn Hướng Dương', en: 'Sunflower Short Dress Girl' }, file: 'cong-chua-ngan-hoa--vay-ngan-huong-duong' },
      ],
    },
    {
      slug: 'ao-len',
      name: { vi: 'Tiểu Thư Áo Len', en: 'Sweater Girl' },
      pictures: [
        { slug: 'hoa-ly', name: { vi: 'Tiểu Thư Áo Len Hoa Ly', en: 'Lily Sweater Girl' }, file: 'cong-chua-ngan-hoa--ao-len-hoa-ly' },
      ],
    },
    {
      slug: 'hoodie',
      name: { vi: 'Cô Nàng Hoodie', en: 'Hoodie Girl' },
      pictures: [
        { slug: 'oai-huong', name: { vi: 'Cô Nàng Hoodie Oải Hương', en: 'Lavender Hoodie Girl' }, file: 'cong-chua-ngan-hoa--hoodie-oai-huong' },
      ],
    },
    {
      slug: 'vay-yem',
      name: { vi: 'Cô Nàng Váy Yếm', en: 'Pinafore Girl' },
      pictures: [
        { slug: 'hoa-cuc-trang', name: { vi: 'Cô Nàng Váy Yếm Hoa Cúc Trắng', en: 'Daisy Pinafore Girl' }, file: 'cong-chua-ngan-hoa--vay-yem-hoa-cuc' },
      ],
    },
    {
      slug: 'cardigan',
      name: { vi: 'Thiếu Nữ Cardigan', en: 'Cardigan Maiden' },
      pictures: [
        { slug: 'cam-tu-cau', name: { vi: 'Thiếu Nữ Cardigan Cẩm Tú Cầu', en: 'Hydrangea Cardigan Maiden' }, file: 'cong-chua-ngan-hoa--cardigan-cam-tu-cau' },
      ],
    },
  ],
});

ART_THEMES.push({
  slug: 'hai-trinh-ky-dieu',
  age: '6-8',
  after: 'vuong-quoc-lau-dai',
  name: { vi: 'Hải Trình Kỳ Diệu', en: 'Magical Voyage' },
  animation: 'float',
  objects: [
    {
      slug: 'tau-ngam',
      name: { vi: 'Tàu Ngầm', en: 'Submarine' },
      pictures: [
        { slug: 'bong-bong-phep-thuat', name: { vi: 'Tàu Ngầm Bong Bóng Phép Thuật', en: 'Magic Bubble Submarine' }, file: 'tau-ngam--bong-bong-phep-thuat' },
      ],
    },
    {
      slug: 'thuyen-buom',
      name: { vi: 'Thuyền Buồm', en: 'Sailboat' },
      pictures: [
        { slug: 'canh-buom', name: { vi: 'Thuyền Buồm Cánh Bướm Biển', en: 'Sea Butterfly Sailboat' }, file: 'thuyen-buom--canh-buom' },
      ],
    },
    {
      slug: 'tau-cuop-bien',
      name: { vi: 'Tàu Cướp Biển', en: 'Pirate Ship' },
      pictures: [
        { slug: 'ngoc-trai', name: { vi: 'Tàu Cướp Biển Ngọc Trai', en: 'Pearl Pirate Ship' }, file: 'tau-cuop-bien--ngoc-trai' },
      ],
    },
    {
      slug: 'thuyen-gondola',
      name: { vi: 'Thuyền Gondola', en: 'Gondola' },
      pictures: [
        { slug: 'vo-so', name: { vi: 'Thuyền Gondola Vỏ Sò', en: 'Seashell Gondola' }, file: 'thuyen-gondola--vo-so' },
      ],
    },
    {
      slug: 'tau-hoi-nuoc',
      name: { vi: 'Tàu Hơi Nước', en: 'Steamboat' },
      pictures: [
        { slug: 'san-ho', name: { vi: 'Tàu Hơi Nước San Hô', en: 'Coral Steamboat' }, file: 'tau-hoi-nuoc--san-ho' },
      ],
    },
    {
      slug: 'thuyen-danh-ca',
      name: { vi: 'Thuyền Đánh Cá', en: 'Fishing Boat' },
      pictures: [
        { slug: 'sao-bien', name: { vi: 'Thuyền Đánh Cá Sao Biển', en: 'Starfish Fishing Boat' }, file: 'thuyen-danh-ca--sao-bien' },
      ],
    },
    {
      slug: 'ca-no',
      name: { vi: 'Ca Nô', en: 'Speedboat' },
      pictures: [
        { slug: 'song-than', name: { vi: 'Ca Nô Sóng Thần Kì', en: 'Magic Tidal Wave Speedboat' }, file: 'ca-no--song-than' },
      ],
    },
    {
      slug: 'thuyen-hai-than',
      name: { vi: 'Thuyền Hai Thân', en: 'Catamaran' },
      pictures: [
        { slug: 'sua-bien', name: { vi: 'Thuyền Hai Thân Sứa Biển', en: 'Jellyfish Catamaran' }, file: 'thuyen-hai-than--sua-bien' },
      ],
    },
    {
      slug: 'be-go',
      name: { vi: 'Bè Gỗ', en: 'Wooden Raft' },
      pictures: [
        { slug: 'rua-bien', name: { vi: 'Bè Gỗ Rùa Biển Thần Kì', en: 'Magic Sea Turtle Raft' }, file: 'be-go--rua-bien' },
      ],
    },
    {
      slug: 'thuyen-kayak',
      name: { vi: 'Thuyền Kayak', en: 'Kayak' },
      pictures: [
        { slug: 'ca-heo', name: { vi: 'Thuyền Kayak Cá Heo', en: 'Dolphin Kayak' }, file: 'thuyen-kayak--ca-heo' },
      ],
    },
  ],
});
