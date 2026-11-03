-- Selection grids and startup checks must not transfer full SVG/region blobs.
ALTER TABLE pictures ADD COLUMN preview TEXT;
ALTER TABLE pictures ADD COLUMN asset_hash TEXT;
CREATE INDEX idx_pictures_visible_object ON pictures (object_id, is_card, hidden, theme_sort, sort, id);
CREATE INDEX idx_objects_theme_sort ON objects (theme_id, sort, id);
