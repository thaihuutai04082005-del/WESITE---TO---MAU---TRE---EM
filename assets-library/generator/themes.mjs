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
  { slug: 'vuong-quoc-keo-ngot', name: { vi: 'Vương Quốc Kẹo Ngọt', en: 'Candy Kingdom' }, faceStyle: 'face', animation: 'float' },
  { slug: 'doi-xe-vu-tru', name: { vi: 'Đội Xe Chinh Phục Vũ Trụ', en: 'Space Vehicle Squad' }, faceStyle: 'none', animation: 'drive' },
  { slug: 'thi-tran-khung-long', name: { vi: 'Thị Trấn Khủng Long Tài Ba', en: 'Talented Dino Town' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'the-thao-trai-cay', name: { vi: 'Đại Hội Thể Thao Trái Cây', en: 'Fruit Sports Festival' }, faceStyle: 'face', animation: 'float' },
  // Đợt 2
  { slug: 'khu-rung-cay-than', name: { vi: 'Khu Rừng Cây Thần', en: 'Magic Tree Forest' }, faceStyle: 'face', animation: 'sway' },
  { slug: 'thanh-pho-nha-biet-bay', name: { vi: 'Thành Phố Nhà Biết Bay', en: 'Flying House City' }, faceStyle: 'none', animation: 'float' },
  { slug: 'xu-so-do-choi', name: { vi: 'Xứ Sở Đồ Chơi Thức Giấc', en: 'Midnight Toyland' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'vuong-quoc-thien-the', name: { vi: 'Vương Quốc Thiên Thể', en: 'Sky Kingdom' }, faceStyle: 'face', animation: 'float', plainSky: true },
  { slug: 'vuong-quoc-lau-dai', name: { vi: 'Vương Quốc Lâu Đài Huyền Bí', en: 'Mystic Castle Kingdom' }, faceStyle: 'none', animation: 'wiggle' },
  // Đợt 3
  { slug: 'phong-thi-nghiem', name: { vi: 'Phòng Thí Nghiệm Kỳ Diệu', en: 'Wonder Lab' }, faceStyle: 'face', animation: 'wiggle' },
  { slug: 'xuong-nghe-thuat', name: { vi: 'Xưởng Nghệ Thuật Sắc Màu', en: 'Colorful Art Studio' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'hai-tac-kho-bau', name: { vi: 'Hạm Đội Hải Tặc Kho Báu', en: 'Treasure Pirate Fleet' }, faceStyle: 'face', animation: 'sway' },
  { slug: 'rap-xiec', name: { vi: 'Rạp Xiếc Diệu Kỳ', en: 'Wonder Circus' }, faceStyle: 'face', animation: 'bounce' },
  { slug: 'thanh-pho-may-moc', name: { vi: 'Thành Phố Máy Móc Tí Hon', en: 'Tiny Machine City' }, faceStyle: 'face', animation: 'wiggle' },
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

  // 04 — Cây × Phép thuật
  reuse('khu-rung-cay-than', 'cay', 'cay-co-thu', 'Cây cổ thụ', 'Ancient tree'),
  O('khu-rung-cay-than', 'cay-thong', 'Cây thông', 'Pine tree', { face: { x: 300, y: 370, s: 0.75 }, hat: { x: 300, y: 118, s: 0.7 }, build: B2.cayThong }),
  O('khu-rung-cay-than', 'cay-dua', 'Cây dừa', 'Coconut palm', { face: { x: 292, y: 372, s: 0.6 }, hat: { x: 325, y: 150, s: 0.7 }, build: B2.cayDua }),
  O('khu-rung-cay-than', 'cay-xuong-rong', 'Cây xương rồng', 'Cactus', { face: { x: 300, y: 300, s: 0.8 }, hat: { x: 300, y: 184, s: 0.8 }, build: B2.xuongRong }),
  O('khu-rung-cay-than', 'cay-lieu', 'Cây liễu', 'Willow tree', { face: { x: 300, y: 214, s: 0.8 }, hat: { x: 300, y: 122, s: 0.9 }, build: B2.cayLieu }),
  O('khu-rung-cay-than', 'khom-tre', 'Khóm tre', 'Bamboo grove', { face: { x: 300, y: 310, s: 0.62 }, hat: { x: 300, y: 124, s: 0.6 }, build: B2.khomTre }),

  // 05 — Nhà × Bay lượn
  reuse('thanh-pho-nha-biet-bay', 'nha-go', 'nha-go-biet-bay', 'Nhà gỗ', 'Cottage'),
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
  O('vuong-quoc-lau-dai', 'cung-dien', 'Cung điện mái vòm', 'Domed palace', { face: null, hat: { x: 300, y: 112, s: 0.6 }, build: B2.cungDien }),
  O('vuong-quoc-lau-dai', 'thap-co', 'Tháp cổ', 'Ancient tower', { face: null, hat: { x: 300, y: 62, s: 0.6 }, build: B2.thapCo }),
  O('vuong-quoc-lau-dai', 'cong-thanh', 'Cổng thành', 'Castle gate', { face: null, hat: { x: 300, y: 250, s: 0.8 }, build: B2.congThanh }),
  O('vuong-quoc-lau-dai', 'cau-da', 'Cầu đá cổ tích', 'Fairytale stone bridge', { face: null, hat: { x: 300, y: 282, s: 0.7 }, ground: 'water', build: B2.cauDa }),
  O('vuong-quoc-lau-dai', 'gieng-uoc', 'Giếng ước', 'Wishing well', { face: null, hat: { x: 300, y: 142, s: 0.7 }, build: B2.giengUoc }),
  // 10 — Dụng cụ khoa học × Phản ứng kỳ diệu
  O('phong-thi-nghiem', 'ong-nghiem', 'Ống nghiệm', 'Test tube', { face: { x: 300, y: 220, s: 0.75 }, hat: { x: 300, y: 112, s: 0.7 }, build: B3.ongNghiem }),
  O('phong-thi-nghiem', 'binh-tam-giac', 'Bình tam giác', 'Flask', { face: { x: 300, y: 300, s: 0.75 }, hat: { x: 300, y: 100, s: 0.6 }, build: B3.binhTamGiac }),
  O('phong-thi-nghiem', 'kinh-hien-vi', 'Kính hiển vi', 'Microscope', { face: { x: 382, y: 330, s: 0.58 }, hat: { x: 245, y: 86, s: 0.5 }, build: B3.kinhHienVi }),
  O('phong-thi-nghiem', 'nam-cham', 'Nam châm', 'Magnet', { face: { x: 300, y: 416, s: 0.55 }, hat: { x: 220, y: 150, s: 0.6 }, build: B3.namCham }),
  O('phong-thi-nghiem', 'kinh-lup', 'Kính lúp', 'Magnifying glass', { face: { x: 270, y: 255, s: 0.9 }, hat: { x: 270, y: 124, s: 0.8 }, build: B3.kinhLup }),
  O('phong-thi-nghiem', 'mo-hinh-nguyen-tu', 'Mô hình nguyên tử', 'Atom model', { face: { x: 300, y: 312, s: 0.7 }, hat: { x: 300, y: 228, s: 0.6 }, build: B3.nguyenTu }),

  // 11 — Dụng cụ mỹ thuật × Họa sĩ nhí
  O('xuong-nghe-thuat', 'co-ve', 'Cọ vẽ', 'Paintbrush', { face: { x: 300, y: 220, s: 0.62 }, hat: { x: 300, y: 90, s: 0.6 }, build: B3.coVe }),
  O('xuong-nghe-thuat', 'but-chi-mau', 'Bút chì màu', 'Colored pencil', { face: { x: 300, y: 250, s: 0.7 }, hat: { x: 300, y: 72, s: 0.6 }, build: B3.butChiMau }),
  O('xuong-nghe-thuat', 'but-sap', 'Bút sáp', 'Crayon', { face: { x: 300, y: 318, s: 0.8 }, hat: { x: 300, y: 100, s: 0.55 }, build: B3.butSap }),
  O('xuong-nghe-thuat', 'bang-mau', 'Bảng màu', 'Paint palette', { face: { x: 270, y: 390, s: 0.75 }, hat: { x: 310, y: 140, s: 0.8 }, build: B3.bangMau }),
  O('xuong-nghe-thuat', 'tuyp-mau', 'Tuýp màu', 'Paint tube', { face: { x: 300, y: 335, s: 0.8 }, hat: { x: 300, y: 96, s: 0.6 }, build: B3.tuypMau }),
  O('xuong-nghe-thuat', 'gia-ve', 'Giá vẽ', 'Easel', { face: { x: 300, y: 215, s: 0.9 }, hat: { x: 300, y: 96, s: 0.8 }, build: B3.giaVe }),

  // 13 — Đồ vật hải tặc × Phiêu lưu biển cả
  O('hai-tac-kho-bau', 'tau-hai-tac', 'Tàu hải tặc', 'Pirate ship', { face: { x: 300, y: 225, s: 0.8 }, hat: { x: 300, y: 150, s: 0.7 }, build: B3.tauHaiTac }),
  O('hai-tac-kho-bau', 'ruong-kho-bau', 'Rương kho báu', 'Treasure chest', { face: { x: 300, y: 390, s: 0.85 }, hat: { x: 300, y: 190, s: 0.8 }, build: B3.ruongKhoBau }),
  O('hai-tac-kho-bau', 'la-ban', 'La bàn', 'Compass', { face: { x: 300, y: 330, s: 0.8 }, hat: { x: 300, y: 150, s: 0.8 }, build: B3.laBan }),
  O('hai-tac-kho-bau', 'mo-neo', 'Mỏ neo', 'Anchor', { face: { x: 300, y: 290, s: 0.66 }, hat: { x: 300, y: 82, s: 0.6 }, build: B3.moNeo }),
  O('hai-tac-kho-bau', 'ban-do-kho-bau', 'Bản đồ kho báu', 'Treasure map', { face: { x: 300, y: 235, s: 0.8 }, hat: { x: 300, y: 126, s: 0.8 }, build: B3.banDoKhoBau }),
  O('hai-tac-kho-bau', 'banh-lai', 'Bánh lái', 'Ship wheel', { face: { x: 300, y: 305, s: 0.8 }, hat: { x: 300, y: 100, s: 0.7 }, build: B3.banhLai }),

  // 14 — Đạo cụ xiếc × Màn biểu diễn
  O('rap-xiec', 'leu-xiec', 'Lều xiếc', 'Circus tent', { face: { x: 300, y: 390, s: 0.8 }, hat: { x: 300, y: 130, s: 0.6 }, build: B3.leuXiec }),
  O('rap-xiec', 'mu-ao-thuat', 'Mũ ảo thuật', 'Magic hat', { face: { x: 300, y: 270, s: 0.9 }, hat: { x: 300, y: 140, s: 0.8 }, build: B3.muAoThuat }),
  O('rap-xiec', 'bong-tung-hung', 'Bóng tung hứng', 'Juggling balls', { face: { x: 300, y: 420, s: 0.75 }, hat: { x: 300, y: 222, s: 0.8 }, build: B3.bongTungHung }),
  O('rap-xiec', 'vong-nhao-lon', 'Vòng nhào lộn', 'Circus hoop', { face: { x: 300, y: 275, s: 1 }, hat: { x: 300, y: 90, s: 0.8 }, build: B3.vongNhaoLon }),
  O('rap-xiec', 'trong-xiec', 'Trống xiếc', 'Circus drum', { face: { x: 300, y: 350, s: 0.8 }, hat: { x: 300, y: 226, s: 0.8 }, build: B3.trongXiec }),
  O('rap-xiec', 'xa-du', 'Xà đu', 'Trapeze', { face: { x: 300, y: 322, s: 0.66 }, hat: { x: 300, y: 292, s: 0.6 }, build: B3.xaDu }),

  // 15 — Máy móc × Cư dân thành phố tí hon
  O('thanh-pho-may-moc', 'banh-rang', 'Bánh răng', 'Gear', { face: { x: 300, y: 305, s: 0.9 }, hat: { x: 300, y: 114, s: 0.8 }, build: B3.banhRang }),
  O('thanh-pho-may-moc', 'co-le', 'Cờ lê', 'Wrench', { face: { x: 300, y: 320, s: 0.6 }, hat: { x: 300, y: 90, s: 0.6 }, build: B3.coLe }),
  O('thanh-pho-may-moc', 'tua-vit', 'Tua vít', 'Screwdriver', { face: { x: 300, y: 200, s: 0.8 }, hat: { x: 300, y: 100, s: 0.7 }, build: B3.tuaVit }),
  O('thanh-pho-may-moc', 'bong-den', 'Bóng đèn', 'Light bulb', { face: { x: 300, y: 220, s: 0.95 }, hat: { x: 300, y: 96, s: 0.8 }, build: B3.bongDen }),
  O('thanh-pho-may-moc', 'dong-ho-bao-thuc', 'Đồng hồ báo thức', 'Alarm clock', { face: { x: 300, y: 335, s: 0.75 }, hat: { x: 300, y: 140, s: 0.6 }, build: B3.dongHoBaoThuc }),
  O('thanh-pho-may-moc', 'quat-dien', 'Quạt điện', 'Electric fan', { face: { x: 300, y: 438, s: 0.7 }, hat: { x: 300, y: 50, s: 0.8 }, build: B3.quatDien }),
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
  'phong-thi-nghiem': {
    variants: [],
    cards: [
      card('C', 'dung-cu-nho', 'Dụng Cụ Nhỏ', 'Little Tool', { expr: 'happy', scene: ['clouds'], acc: () => ({}) }),
      card('B', 'kinh-bao-ho', 'Kính Bảo Hộ', 'Safety Goggles', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ front: A.goggles(c) }) }),
      card('A', 'duoi-cau-vong', 'Dưới Cầu Vồng', 'Under the Rainbow', { expr: 'happy', scene: ['rainbow', 'clouds', 'stars'], acc: () => ({}) }),
      card('S', 'phat-minh-the-ky', 'Phát Minh Thế Kỷ', 'Invention of the Century', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
    ],
  },
  'xuong-nghe-thuat': {
    variants: [],
    cards: [
      card('C', 'hoa-si-nhi', 'Họa Sĩ Nhí', 'Little Artist', { expr: 'happy', scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'deo-no', 'Đeo Nơ', 'With a Bow', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ front: A.ribbonBow(c) }) }),
      card('A', 'duoi-cau-vong', 'Dưới Cầu Vồng', 'Under the Rainbow', { expr: 'happy', scene: ['rainbow', 'clouds', 'stars'], acc: () => ({}) }),
      card('S', 'kiet-tac-vang', 'Kiệt Tác Vàng', 'Golden Masterpiece', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
    ],
  },
  'hai-tac-kho-bau': {
    variants: [],
    cards: [
      card('C', 'ra-khoi', 'Ra Khơi', 'Setting Sail', { expr: 'happy', scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'treo-co-hoa', 'Treo Cờ Hoa', 'Flag Garland', { expr: 'happy', scene: ['clouds'], acc: () => ({ fg: X.bunting(70) }) }),
      card('A', 'dem-sao-bien', 'Đêm Sao Biển', 'Starry Sea Night', { expr: 'happy', scene: ['night', 'stars'], acc: () => ({}) }),
      card('S', 'kho-bau-huyen-thoai', 'Kho Báu Huyền Thoại', 'Legendary Treasure', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
    ],
  },
  'rap-xiec': {
    variants: [],
    cards: [
      card('C', 'chao-khan-gia', 'Chào Khán Giả', 'Hello Audience', { expr: 'happy', scene: ['clouds'], acc: () => ({}) }),
      card('B', 'no-sao', 'Nơ Sân Khấu', 'Stage Bow Tie', { expr: 'happy', scene: ['clouds', 'confetti'], acc: (c) => ({ front: A.bowTie(c) }) }),
      card('A', 'dem-bieu-dien', 'Đêm Biểu Diễn', 'Show Night', { expr: 'happy', scene: ['night', 'stars', 'confetti'], acc: () => ({}) }),
      card('S', 'ngoi-sao-san-khau', 'Ngôi Sao Sân Khấu', 'Star of the Show', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
    ],
  },
  'thanh-pho-may-moc': {
    variants: [],
    cards: [
      card('C', 'cu-dan-ti-hon', 'Cư Dân Tí Hon', 'Tiny Citizen', { expr: 'happy', scene: ['sun', 'clouds'], acc: () => ({}) }),
      card('B', 'mu-bao-ho', 'Mũ Bảo Hộ', 'Hard Hat', { expr: 'happy', scene: ['clouds'], acc: (c) => ({ front: X.hardHat(c) }) }),
      card('A', 'thanh-pho-dem', 'Thành Phố Đêm', 'City Night', { expr: 'happy', scene: ['night', 'stars'], acc: () => ({}) }),
      card('S', 'co-may-vang', 'Cỗ Máy Vàng', 'Golden Machine', { expr: 'happy', scene: ['rainbow', 'stars', 'confetti'], acc: (c) => ({ behind: X.aura(c, '#FFE066'), front: A.crown(c) }) }),
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
];

