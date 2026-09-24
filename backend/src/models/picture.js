// Truy vấn nội dung tranh theo 3 tầng: Chủ đề → Đối tượng → Biến thể.
import { getDb, parseJson } from '../config/db.js';

const lang = (row, l, base = 'name') => (l === 'en' ? row[`${base}_en`] : row[`${base}_vi`]);

export function listThemes() {
  return getDb()
    .prepare(
      `SELECT t.*, (SELECT COUNT(*) FROM objects o WHERE o.theme_id = t.id) AS object_count,
        (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id
          WHERE o.theme_id = t.id AND p.is_card = 0 ORDER BY o.sort, p.sort LIMIT 1) AS cover_id
       FROM themes t ORDER BY t.sort, t.id`,
    )
    .all();
}

export const findTheme = (slug) => getDb().prepare('SELECT * FROM themes WHERE slug = ?').get(slug);

export function listObjects(themeId) {
  return getDb()
    .prepare(
      `SELECT o.*, (SELECT COUNT(*) FROM pictures p WHERE p.object_id = o.id AND p.is_card = 0) AS picture_count,
        (SELECT p.id FROM pictures p WHERE p.object_id = o.id AND p.is_card = 0 ORDER BY p.sort LIMIT 1) AS cover_id
       FROM objects o WHERE o.theme_id = ? ORDER BY o.sort, o.id`,
    )
    .all(themeId);
}

export const findObject = (themeId, slug) => getDb().prepare('SELECT * FROM objects WHERE theme_id = ? AND slug = ?').get(themeId, slug);

export function listPictures(objectId, { cards = false } = {}) {
  return getDb()
    .prepare('SELECT id, slug, variant_slug, name_vi, name_en, variant_name_vi, variant_name_en, animation, is_card, rarity FROM pictures WHERE object_id = ? AND is_card = ? ORDER BY sort, id')
    .all(objectId, cards ? 1 : 0);
}

export function findPicture(id) {
  return getDb()
    .prepare(
      `SELECT p.*, o.slug AS object_slug, o.name_vi AS object_name_vi, o.name_en AS object_name_en,
              t.slug AS theme_slug, t.id AS theme_id, t.name_vi AS theme_name_vi, t.name_en AS theme_name_en
       FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE p.id = ?`,
    )
    .get(id);
}

export const findPictureBySlug = (slug) => getDb().prepare('SELECT id FROM pictures WHERE slug = ?').get(slug);

export function manifestOf(picture) {
  return parseJson(picture.manifest, { palette: [], regions: [] });
}

/** Bản gọn gửi cho client: SVG + bảng màu + nhãn số, không kèm đa giác (chỉ server cần). */
export function toClient(p, withSvg = true) {
  const m = manifestOf(p);
  return {
    id: p.id,
    slug: p.slug,
    name: { vi: p.name_vi, en: p.name_en },
    variantName: { vi: p.variant_name_vi, en: p.variant_name_en },
    theme: p.theme_slug ? { id: p.theme_id, slug: p.theme_slug, name: { vi: p.theme_name_vi, en: p.theme_name_en } } : undefined,
    object: p.object_slug ? { slug: p.object_slug, name: { vi: p.object_name_vi, en: p.object_name_en } } : undefined,
    animation: p.animation,
    isCard: !!p.is_card,
    rarity: p.rarity,
    ...(withSvg
      ? {
          svg: p.svg,
          palette: m.palette,
          regions: m.regions.map((r) => ({ id: r.id, number: r.number, color: r.color, label: r.label, labelSize: r.labelSize, area: r.area })),
        }
      : {}),
  };
}

export function cardPool() {
  const rows = getDb().prepare('SELECT id, rarity FROM pictures WHERE is_card = 1 AND rarity IS NOT NULL').all();
  const pool = { S: [], A: [], B: [], C: [] };
  for (const r of rows) pool[r.rarity].push(r.id);
  return pool;
}

export function randomPictureForArena() {
  return getDb().prepare('SELECT id FROM pictures WHERE is_card = 0 ORDER BY RANDOM() LIMIT 1').get();
}

export { lang };
