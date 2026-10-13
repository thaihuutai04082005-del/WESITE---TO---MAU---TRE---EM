-- Nhóm tuổi mới: '3-5', '6-8', '9+' (thay cho '3-4', '4-5', '6+').
UPDATE themes SET age_group = '3-5' WHERE age_group IN ('3-4', '4-5');
UPDATE themes SET age_group = '6-8' WHERE age_group = '6+';
