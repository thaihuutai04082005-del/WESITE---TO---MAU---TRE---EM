// Vật phẩm: skin cọ vẽ (50–100 Ruby), Khung Artwork thường (100–200) và đặc biệt/limited (300–500),
// Khung Avatar theo Rank (không bán — mở khoá khi thăng hạng).
export const ITEMS = [
  { type: 'brush_skin', slug: 'but-sap', name_vi: 'Bút sáp', name_en: 'Crayon', price: 50 },
  { type: 'brush_skin', slug: 'but-cham-bi', name_vi: 'Bút chấm bi', name_en: 'Polka dots', price: 60 },
  { type: 'brush_skin', slug: 'but-neon', name_vi: 'Bút neon phát sáng', name_en: 'Neon glow', price: 70 },
  { type: 'brush_skin', slug: 'but-long-vu', name_vi: 'Bút lông vũ mềm', name_en: 'Soft feather', price: 80 },
  { type: 'brush_skin', slug: 'but-cau-vong', name_vi: 'Bút cầu vồng', name_en: 'Rainbow', price: 100 },

  { type: 'artwork_frame', slug: 'khung-go', name_vi: 'Khung gỗ mộc', name_en: 'Wooden frame', price: 100 },
  { type: 'artwork_frame', slug: 'khung-hoa', name_vi: 'Khung hoa xinh', name_en: 'Flower frame', price: 120 },
  { type: 'artwork_frame', slug: 'khung-may', name_vi: 'Khung mây trời', name_en: 'Cloud frame', price: 150 },
  { type: 'artwork_frame', slug: 'khung-sao', name_vi: 'Khung ngôi sao', name_en: 'Star frame', price: 180 },
  { type: 'artwork_frame', slug: 'khung-bien', name_vi: 'Khung đại dương', name_en: 'Ocean frame', price: 200 },
  { type: 'artwork_frame', slug: 'khung-hoang-gia', name_vi: 'Khung vàng hoàng gia', name_en: 'Royal gold frame', price: 300, limited: 1 },
  { type: 'artwork_frame', slug: 'khung-cau-vong', name_vi: 'Khung cầu vồng lấp lánh', name_en: 'Sparkling rainbow frame', price: 400, limited: 1 },
  { type: 'artwork_frame', slug: 'khung-kim-cuong', name_vi: 'Khung kim cương', name_en: 'Diamond frame', price: 500, limited: 1 },

  { type: 'avatar_frame', slug: 'avatar-dong', name_vi: 'Khung Mầm Non Tô Màu', name_en: 'Little Colorer frame', rank: 'bronze' },
  { type: 'avatar_frame', slug: 'avatar-bac', name_vi: 'Khung Họa Sĩ Nhí', name_en: 'Young Artist frame', rank: 'silver' },
  { type: 'avatar_frame', slug: 'avatar-vang', name_vi: 'Khung Họa Sĩ Tài Năng', name_en: 'Talented Artist frame', rank: 'gold' },
  { type: 'avatar_frame', slug: 'avatar-bach-kim', name_vi: 'Khung Nghệ Sĩ Sáng Tạo', name_en: 'Creative Artist frame', rank: 'platinum' },
  { type: 'avatar_frame', slug: 'avatar-kim-cuong', name_vi: 'Khung Danh Họa', name_en: 'Famous Painter frame', rank: 'diamond' },
  { type: 'avatar_frame', slug: 'avatar-cao-thu', name_vi: 'Khung Bậc Thầy Hội Họa', name_en: 'Master Painter frame', rank: 'master' },
];
