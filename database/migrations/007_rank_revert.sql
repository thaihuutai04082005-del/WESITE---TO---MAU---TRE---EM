-- Bỏ bậc "Hạt Giống Tô Màu", trả mốc Rank về như cũ: Mầm Non Tô Màu 0 (ai mới vào cũng có),
-- Họa Sĩ Nhí 50, Họa Sĩ Tài Năng 150, Nghệ Sĩ Sáng Tạo 300, Danh Họa 500, Bậc Thầy Hội Họa 800.
-- Trả lại khung Rank theo mốc cũ (khung đã thu ở 006), rồi đổi khung Hạt Giống đang đeo sang khung của bậc hiện tại.
INSERT OR IGNORE INTO user_items (user_id, item_id, source)
SELECT u.id, i.id, 'rank' FROM users u JOIN items i ON
     (i.slug = 'avatar-dong')
  OR (i.slug = 'avatar-bac' AND u.rank_points >= 50)
  OR (i.slug = 'avatar-vang' AND u.rank_points >= 150)
  OR (i.slug = 'avatar-bach-kim' AND u.rank_points >= 300)
  OR (i.slug = 'avatar-kim-cuong' AND u.rank_points >= 500)
  OR (i.slug = 'avatar-cao-thu' AND u.rank_points >= 800);

UPDATE users SET avatar_frame = CASE
    WHEN rank_points >= 800 THEN 'avatar-cao-thu'
    WHEN rank_points >= 500 THEN 'avatar-kim-cuong'
    WHEN rank_points >= 300 THEN 'avatar-bach-kim'
    WHEN rank_points >= 150 THEN 'avatar-vang'
    WHEN rank_points >= 50 THEN 'avatar-bac'
    ELSE 'avatar-dong'
  END
WHERE avatar_frame = 'avatar-hat-giong';

DELETE FROM user_items WHERE item_id IN (SELECT id FROM items WHERE slug = 'avatar-hat-giong');
DELETE FROM items WHERE slug = 'avatar-hat-giong';
