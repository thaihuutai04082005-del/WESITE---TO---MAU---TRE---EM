-- Hội trường triển lãm chỉ còn một bảng chung: gộp mọi tranh đã gửi (S/A/B) về 'free'.
UPDATE exhibition_entries SET board = 'free' WHERE board != 'free';
