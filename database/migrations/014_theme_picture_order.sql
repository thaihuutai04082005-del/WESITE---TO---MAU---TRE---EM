-- Thứ tự riêng của tranh trong trang chọn tranh của chủ đề (nhỏ = đứng trước, mặc định 1000 = theo thứ tự đối tượng).
ALTER TABLE pictures ADD COLUMN theme_sort INTEGER NOT NULL DEFAULT 1000;
