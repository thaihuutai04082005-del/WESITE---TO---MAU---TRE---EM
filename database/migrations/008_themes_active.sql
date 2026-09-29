-- Chủ đề có thể ẩn (active = 0): không hiện ở trang Tô màu, không vào Bóc thẻ / Đấu trường,
-- nhưng tranh cũ vẫn giữ nguyên để các bé xem lại tranh đã tô và thẻ đã sưu tầm.
ALTER TABLE themes ADD COLUMN active INTEGER NOT NULL DEFAULT 1;

-- Bộ chủ đề đầu tiên được thay bằng bộ chủ đề mới (docs/ma-tran-chu-de.md).
UPDATE themes SET active = 0 WHERE slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua');
