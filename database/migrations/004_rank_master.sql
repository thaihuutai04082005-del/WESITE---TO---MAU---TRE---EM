-- Bậc Rank mới: Cao Thủ (≥ 800 Điểm Rank) + Khung Avatar Cao Thủ (chỉ mở khoá khi lên bậc, không bán).
INSERT OR IGNORE INTO items (type, slug, name_vi, name_en, price, limited, rank, sort)
VALUES ('avatar_frame', 'avatar-cao-thu', 'Khung Cao Thủ', 'Master frame', NULL, 0, 'master', 99);
