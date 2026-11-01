-- @foreign_keys off
-- Shop thêm 2 loại vật phẩm: 'pattern' (màu họa tiết) và 'storybook_cover' (bìa truyện); truyện lưu bìa đã chọn.
CREATE TABLE items_new (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  type     TEXT NOT NULL CHECK (type IN ('brush_skin', 'artwork_frame', 'avatar_frame', 'pattern', 'storybook_cover')),
  slug     TEXT NOT NULL UNIQUE,
  name_vi  TEXT NOT NULL,
  name_en  TEXT NOT NULL,
  price    INTEGER,
  limited  INTEGER NOT NULL DEFAULT 0,
  rank     TEXT,
  sort     INTEGER NOT NULL DEFAULT 0
);
INSERT INTO items_new (id, type, slug, name_vi, name_en, price, limited, rank, sort)
SELECT id, type, slug, name_vi, name_en, price, limited, rank, sort FROM items;
DROP TABLE items;
ALTER TABLE items_new RENAME TO items;

ALTER TABLE storybooks ADD COLUMN cover_style TEXT;
