-- Tranh ẩn: không hiện ở trang chọn tranh nhưng vẫn giữ nguyên để bé xem lại tranh đã tô.
ALTER TABLE pictures ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
