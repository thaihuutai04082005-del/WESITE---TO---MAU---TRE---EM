-- Thêm bậc khởi đầu "Hạt Giống Tô Màu" (0–49 điểm, khung chồi lá) và nâng mốc mọi bậc thêm 50 điểm:
-- Mầm Non Tô Màu 50, Họa Sĩ Nhí 100, Họa Sĩ Tài Năng 200, Nghệ Sĩ Sáng Tạo 350, Danh Họa 550, Bậc Thầy Hội Họa 850.
-- Ai cũng nhận khung Hạt Giống; thu lại khung Rank của bậc chưa đạt theo mốc mới,
-- rồi đổi khung đang đeo (nếu không còn sở hữu) về khung của bậc hiện tại.
INSERT OR IGNORE INTO items (type, slug, name_vi, name_en, price, limited, rank, sort)
VALUES ('avatar_frame', 'avatar-hat-giong', 'Khung Hạt Giống Tô Màu', 'Little Seed frame', NULL, 0, 'seed', 98);

INSERT OR IGNORE INTO user_items (user_id, item_id, source)
SELECT u.id, i.id, 'rank' FROM users u, items i WHERE i.slug = 'avatar-hat-giong';

DELETE FROM user_items WHERE source = 'rank' AND (
     (item_id = (SELECT id FROM items WHERE slug = 'avatar-dong')      AND user_id IN (SELECT id FROM users WHERE rank_points < 50))
  OR (item_id = (SELECT id FROM items WHERE slug = 'avatar-bac')       AND user_id IN (SELECT id FROM users WHERE rank_points < 100))
  OR (item_id = (SELECT id FROM items WHERE slug = 'avatar-vang')      AND user_id IN (SELECT id FROM users WHERE rank_points < 200))
  OR (item_id = (SELECT id FROM items WHERE slug = 'avatar-bach-kim')  AND user_id IN (SELECT id FROM users WHERE rank_points < 350))
  OR (item_id = (SELECT id FROM items WHERE slug = 'avatar-kim-cuong') AND user_id IN (SELECT id FROM users WHERE rank_points < 550))
  OR (item_id = (SELECT id FROM items WHERE slug = 'avatar-cao-thu')   AND user_id IN (SELECT id FROM users WHERE rank_points < 850))
);

UPDATE users SET avatar_frame = CASE
    WHEN rank_points >= 850 THEN 'avatar-cao-thu'
    WHEN rank_points >= 550 THEN 'avatar-kim-cuong'
    WHEN rank_points >= 350 THEN 'avatar-bach-kim'
    WHEN rank_points >= 200 THEN 'avatar-vang'
    WHEN rank_points >= 100 THEN 'avatar-bac'
    WHEN rank_points >= 50 THEN 'avatar-dong'
    ELSE 'avatar-hat-giong'
  END
WHERE avatar_frame IN ('avatar-dong', 'avatar-bac', 'avatar-vang', 'avatar-bach-kim', 'avatar-kim-cuong', 'avatar-cao-thu')
  AND NOT EXISTS (
    SELECT 1 FROM user_items ui JOIN items i ON i.id = ui.item_id
    WHERE ui.user_id = users.id AND i.slug = users.avatar_frame
  );
