-- Xoá hẳn 5 chủ đề cũ (đã thay bằng bộ chủ đề mới — docs/ma-tran-chu-de.md) cùng mọi dữ liệu gắn với tranh cũ:
-- tranh bé đã tô (kèm trang truyện, tranh triển lãm, cảm xúc), thẻ + giao dịch thẻ, lịch sử bóc thẻ, phòng Đấu trường.
-- Chỉ chạy được một lần; chủ đề do admin tự tạo không bị ảnh hưởng.
DELETE FROM trades WHERE offer_card_id IN (
    SELECT id FROM user_cards WHERE picture_id IN (
      SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
      WHERE t.slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua')))
  OR request_card_id IN (
    SELECT id FROM user_cards WHERE picture_id IN (
      SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
      WHERE t.slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua')));

DELETE FROM user_cards WHERE picture_id IN (
  SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
  WHERE t.slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua'));

DELETE FROM gacha_pulls WHERE picture_id IN (
  SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
  WHERE t.slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua'));

DELETE FROM arena_rooms WHERE picture_id IN (
  SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
  WHERE t.slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua'));

DELETE FROM artworks WHERE picture_id IN (
  SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
  WHERE t.slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua'));

-- Xoá chủ đề → tự xoá đối tượng + tranh (ON DELETE CASCADE).
DELETE FROM themes WHERE slug IN ('dong-vat', 'xe-co', 'thien-nhien', 'trai-cay', 'nha-cua');
