-- Đổi tên Khung Avatar theo tên bậc chủ đề hội họa (Mầm Non Tô Màu → Bậc Thầy Hội Họa).
UPDATE items SET name_vi = 'Khung Mầm Non Tô Màu', name_en = 'Little Colorer frame' WHERE slug = 'avatar-dong';
UPDATE items SET name_vi = 'Khung Họa Sĩ Nhí', name_en = 'Young Artist frame' WHERE slug = 'avatar-bac';
UPDATE items SET name_vi = 'Khung Họa Sĩ Tài Năng', name_en = 'Talented Artist frame' WHERE slug = 'avatar-vang';
UPDATE items SET name_vi = 'Khung Nghệ Sĩ Sáng Tạo', name_en = 'Creative Artist frame' WHERE slug = 'avatar-bach-kim';
UPDATE items SET name_vi = 'Khung Danh Họa', name_en = 'Famous Painter frame' WHERE slug = 'avatar-kim-cuong';
UPDATE items SET name_vi = 'Khung Bậc Thầy Hội Họa', name_en = 'Master Painter frame' WHERE slug = 'avatar-cao-thu';
