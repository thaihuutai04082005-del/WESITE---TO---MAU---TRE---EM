-- Xoá hẳn 4 chủ đề: Phòng Thí Nghiệm Kỳ Diệu, Hạm Đội Hải Tặc Kho Báu, Rạp Xiếc Diệu Kỳ, Thành Phố Máy Móc Tí Hon
-- cùng mọi dữ liệu gắn với tranh của chúng (tranh bé đã tô, thẻ + giao dịch thẻ, lịch sử bóc thẻ, phòng Đấu trường).
-- Thẻ vẽ tay "Capybara – Hải Tặc" do chủ web gửi được giữ lại: chuyển sang chủ đề Anh Hùng Siêu Thú.
UPDATE objects SET theme_id = (SELECT id FROM themes WHERE slug = 'anh-hung-sieu-thu')
 WHERE slug = 'capybara'
   AND theme_id = (SELECT id FROM themes WHERE slug = 'hai-tac-kho-bau')
   AND EXISTS (SELECT 1 FROM themes WHERE slug = 'anh-hung-sieu-thu')
   AND NOT EXISTS (SELECT 1 FROM objects x WHERE x.slug = 'capybara' AND x.theme_id = (SELECT id FROM themes WHERE slug = 'anh-hung-sieu-thu'));

DELETE FROM trades WHERE offer_card_id IN (SELECT id FROM user_cards WHERE picture_id IN (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN ('phong-thi-nghiem', 'hai-tac-kho-bau', 'rap-xiec', 'thanh-pho-may-moc')))
  OR request_card_id IN (SELECT id FROM user_cards WHERE picture_id IN (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN ('phong-thi-nghiem', 'hai-tac-kho-bau', 'rap-xiec', 'thanh-pho-may-moc')));
DELETE FROM user_cards WHERE picture_id IN (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN ('phong-thi-nghiem', 'hai-tac-kho-bau', 'rap-xiec', 'thanh-pho-may-moc'));
DELETE FROM gacha_pulls WHERE picture_id IN (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN ('phong-thi-nghiem', 'hai-tac-kho-bau', 'rap-xiec', 'thanh-pho-may-moc'));
DELETE FROM arena_rooms WHERE picture_id IN (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN ('phong-thi-nghiem', 'hai-tac-kho-bau', 'rap-xiec', 'thanh-pho-may-moc'));
DELETE FROM artworks WHERE picture_id IN (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN ('phong-thi-nghiem', 'hai-tac-kho-bau', 'rap-xiec', 'thanh-pho-may-moc'));

-- Xoá chủ đề → tự xoá đối tượng + tranh (ON DELETE CASCADE).
DELETE FROM themes WHERE slug IN ('phong-thi-nghiem', 'hai-tac-kho-bau', 'rap-xiec', 'thanh-pho-may-moc');
