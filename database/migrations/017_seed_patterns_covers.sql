-- Đưa họa tiết + bìa truyện vào DB đã có sẵn (seed chỉ chạy khi cài mới).
INSERT OR IGNORE INTO items (type, slug, name_vi, name_en, price, limited, rank, sort) VALUES
  ('pattern', 'caro', 'Họa tiết caro', 'Checkered', 40, 0, NULL, 1),
  ('pattern', 'song-bien', 'Họa tiết sóng biển', 'Ocean waves', 50, 0, NULL, 2),
  ('pattern', 'keo-ngot', 'Họa tiết kẹo ngọt', 'Candy stripes', 60, 0, NULL, 3),
  ('pattern', 'la-xanh', 'Họa tiết lá xanh', 'Green leaves', 70, 0, NULL, 4),
  ('pattern', 'bong-bong', 'Họa tiết bong bóng', 'Bubbles', 80, 0, NULL, 5),
  ('pattern', 'zigzag', 'Họa tiết zigzag', 'Zigzag', 90, 0, NULL, 6),
  ('storybook_cover', 'bia-xanh-troi', 'Bìa xanh da trời', 'Sky blue cover', 30, 0, NULL, 7),
  ('storybook_cover', 'bia-hong-phan', 'Bìa hồng phấn', 'Pink cover', 30, 0, NULL, 8),
  ('storybook_cover', 'bia-xanh-la', 'Bìa xanh lá', 'Green cover', 30, 0, NULL, 9),
  ('storybook_cover', 'bia-vang-nang', 'Bìa vàng nắng', 'Sunny yellow cover', 30, 0, NULL, 10),
  ('storybook_cover', 'bia-tim-oai-huong', 'Bìa tím oải hương', 'Lavender cover', 30, 0, NULL, 11);
