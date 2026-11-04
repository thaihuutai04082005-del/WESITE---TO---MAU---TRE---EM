// Truy vấn nội dung tranh theo 3 tầng: Chủ đề → Đối tượng → Biến thể.
import { getDb, parseJson } from '../config/db.js';
import { PLANS } from '../config/constants.js';
import { themeAllowedSql } from '../services/themeAccessSql.js';

const lang = (row, l, base = 'name') => (l === 'en' ? row[`${base}_en`] : row[`${base}_vi`]);
const LIGHT_COLUMNS = 'p.id, p.object_id, p.slug, p.variant_slug, p.name_vi, p.name_en, p.variant_name_vi, p.variant_name_en, p.animation, p.is_card, p.rarity, p.sort, p.theme_sort, p.hidden, p.preview, p.asset_hash';
const PICTURE_JOINS = `FROM pictures p JOIN objects o ON o.id=p.object_id JOIN themes t ON t.id=o.theme_id`;
const PICTURE_LABELS = `o.slug AS object_slug, o.name_vi AS object_name_vi, o.name_en AS object_name_en,
  t.slug AS theme_slug, t.id AS theme_id, t.name_vi AS theme_name_vi, t.name_en AS theme_name_en`;

const THEMES_SQL = `SELECT t.*, (SELECT COUNT(*) FROM objects o WHERE o.theme_id = t.id AND EXISTS (SELECT 1 FROM pictures q WHERE q.object_id = o.id AND q.is_card = 0 AND q.hidden = 0)) AS object_count,
        (SELECT COUNT(*) FROM pictures q JOIN objects o ON o.id = q.object_id WHERE o.theme_id = t.id AND q.is_card = 0 AND q.hidden = 0) AS picture_count,
        (SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id
          WHERE o.theme_id = t.id AND p.is_card = 0 AND p.hidden = 0 ORDER BY p.theme_sort, o.sort, p.sort LIMIT 1) AS cover_id
       FROM themes t WHERE t.active = 1 ORDER BY t.sort, t.id`;

export async function listThemes() {
  return getDb().prepare(THEMES_SQL).all();
}

/** Metadata, covers and current locks in one database round trip. */
export async function listThemePreviews(userId) {
  const iso = new Date().toISOString();
  const rows = await getDb().prepare(`WITH library AS (${THEMES_SQL})
    SELECT ${LIGHT_COLUMNS}, ${PICTURE_LABELS}, t.age_group, t.object_count, t.picture_count,
      ${themeAllowedSql('t.id')} AS can_use
    FROM library t LEFT JOIN pictures p ON p.id=t.cover_id LEFT JOIN objects o ON o.id=p.object_id
    ORDER BY t.sort,t.id`).all(userId ?? null, iso, iso, PLANS.free.themesPerAge);
  const pictures = await fillMissingPreviews(rows.filter(row => row.id != null));
  const covers = new Map(pictures.map(picture => [picture.theme_id, picture]));
  return rows.map(row => ({ id: row.theme_id, slug: row.theme_slug,
    name_vi: row.theme_name_vi, name_en: row.theme_name_en, age_group: row.age_group,
    object_count: row.object_count, picture_count: row.picture_count,
    allowed: !!row.can_use, cover: covers.get(row.theme_id) || null }));
}

/** One fresh permission check and only the requested theme's preview metadata. */
export async function themePreviewBundle(slug, userId) {
  const iso = new Date().toISOString();
  const rows = await getDb().prepare(`WITH selected_theme AS (
      SELECT t.*, ${themeAllowedSql('t.id')} AS can_use FROM themes t WHERE t.slug=? AND t.active=1
    ) SELECT ${LIGHT_COLUMNS}, ${PICTURE_LABELS}, t.can_use
    FROM selected_theme t LEFT JOIN objects o ON o.theme_id=t.id AND t.can_use
    LEFT JOIN pictures p ON p.object_id=o.id AND p.is_card=0 AND p.hidden=0
    ORDER BY p.theme_sort,o.sort,o.id,p.sort,p.id`)
    .all(userId ?? null, iso, iso, PLANS.free.themesPerAge, slug);
  if (!rows.length) return null;
  const row = rows[0];
  return { theme: { slug: row.theme_slug, name: { vi: row.theme_name_vi, en: row.theme_name_en } },
    allowed: !!row.can_use,
    pictures: row.can_use ? await fillMissingPreviews(rows.filter(picture => picture.id != null)) : [] };
}

export const findTheme = async (slug) => await getDb().prepare('SELECT * FROM themes WHERE slug = ?').get(slug);
/** Chủ đề đang mở cho bé duyệt (chủ đề đã ẩn chỉ còn xem lại tranh cũ qua lịch sử / bộ sưu tập). */
export const findActiveTheme = async (slug) => await getDb().prepare('SELECT * FROM themes WHERE slug = ? AND active = 1').get(slug);

/** Điều kiện SQL: tranh p thuộc chủ đề đang mở. */
export const ACTIVE_PICTURE = 'p.object_id IN (SELECT o.id FROM objects o JOIN themes t ON t.id = o.theme_id WHERE t.active = 1)';

export async function listObjects(themeId) {
  return await getDb()
    .prepare(
      `SELECT o.*, (SELECT COUNT(*) FROM pictures p WHERE p.object_id = o.id AND p.is_card = 0 AND p.hidden = 0) AS picture_count,
        (SELECT p.id FROM pictures p WHERE p.object_id = o.id AND p.is_card = 0 AND p.hidden = 0 ORDER BY p.sort LIMIT 1) AS cover_id
       FROM objects o WHERE o.theme_id = ? AND EXISTS (SELECT 1 FROM pictures q WHERE q.object_id = o.id AND q.is_card = 0 AND q.hidden = 0) ORDER BY o.sort, o.id`, // bỏ đối tượng chỉ có thẻ
    )
    .all(themeId);
}

/** Mọi tranh (không phải thẻ) của một chủ đề, xếp theo thứ tự đối tượng rồi tranh — bé chọn thẳng, không qua tầng đối tượng. */
export async function listThemePictures(themeId) {
  return await getDb()
    .prepare(
      'SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id WHERE o.theme_id = ? AND p.is_card = 0 AND p.hidden = 0 ORDER BY p.theme_sort, o.sort, o.id, p.sort, p.id',
    )
    .all(themeId);
}

export const findObject = async (themeId, slug) => await getDb().prepare('SELECT * FROM objects WHERE theme_id = ? AND slug = ?').get(themeId, slug);

export async function listPictures(objectId, { cards = false } = {}) {
  return await getDb()
    .prepare(
      'SELECT id, slug, variant_slug, name_vi, name_en, variant_name_vi, variant_name_en, animation, is_card, rarity FROM pictures WHERE object_id = ? AND is_card = ? AND hidden = 0 ORDER BY sort, id',
    )
    .all(objectId, cards ? 1 : 0);
}

export async function findPicture(id, options) {
  const rows = await findPictures([id], options);
  return rows.get(id) || rows.get(Number(id));
}

/** The access flag belongs to this query result only; room/session checks still query fresh rights. */
export async function findPictureForUser(id, user, { metadataOnly = false } = {}) {
  const iso = new Date().toISOString();
  return getDb().prepare(`SELECT ${metadataOnly ? LIGHT_COLUMNS : 'p.*'}, ${PICTURE_LABELS},
    CASE WHEN p.is_card=1 THEN (?=1 OR EXISTS (SELECT 1 FROM user_cards WHERE user_id=? AND picture_id=p.id))
      ELSE ${themeAllowedSql('t.id')} END AS can_use
    ${PICTURE_JOINS} WHERE p.id=?`)
    .get(user?.role === 'admin' ? 1 : 0, user?.id ?? null,
      user?.id ?? null, iso, iso, PLANS.free.themesPerAge, id);
}

/** One database trip for a whole selection grid, including each picture's theme metadata. */
export async function findPictures(ids, { preview = false, metadataOnly = false } = {}) {
  const unique = [...new Set(ids.filter((id) => id != null))];
  if (!unique.length) return new Map();
  const rows = await getDb().prepare(
    `SELECT ${preview || metadataOnly ? LIGHT_COLUMNS : 'p.*'}, ${PICTURE_LABELS}
     ${PICTURE_JOINS}
     WHERE p.id IN (${unique.map(() => '?').join(',')})`,
  ).all(...unique);
  // Legacy/custom records can lack prebuilt previews; keep them usable as full SVGs.
  if (preview && !metadataOnly) await fillMissingPreviews(rows);
  return new Map(rows.map((row) => [row.id, row]));
}

async function fillMissingPreviews(rows) {
  const missing = rows.filter(row => !row.preview).map(row => row.id);
  const full = missing.length ? await findPictures(missing) : new Map();
  for (let i = 0; i < rows.length; i++) if (full.has(rows[i].id)) rows[i] = full.get(rows[i].id);
  return rows;
}

export async function themePicturePreviews(themeId) {
  const rows = await getDb().prepare(`SELECT ${LIGHT_COLUMNS}, ${PICTURE_LABELS} ${PICTURE_JOINS}
    WHERE o.theme_id=? AND p.is_card=0 AND p.hidden=0
    ORDER BY p.theme_sort,o.sort,o.id,p.sort,p.id`).all(themeId);
  return fillMissingPreviews(rows);
}

export async function objectPicturePreviews(objectId) {
  const rows = await getDb().prepare(`SELECT ${LIGHT_COLUMNS}, ${PICTURE_LABELS} ${PICTURE_JOINS}
    WHERE p.object_id=? AND p.is_card=0 AND p.hidden=0 ORDER BY p.sort,p.id`).all(objectId);
  return fillMissingPreviews(rows);
}

/** Checks and history need geometry, but not SVG artwork or repeated copies per saved image. */
export async function findManifests(ids) {
  const unique = [...new Set(ids.filter(id => id != null))];
  if (!unique.length) return new Map();
  const rows = await getDb().prepare(`SELECT id,manifest FROM pictures WHERE id IN (${unique.map(() => '?').join(',')})`).all(...unique);
  return new Map(rows.map(row => [row.id, row]));
}

export async function findSvgs(ids) {
  const unique = [...new Set(ids.filter(id => id != null))];
  if (!unique.length) return new Map();
  const rows = await getDb().prepare(`SELECT id,svg FROM pictures WHERE id IN (${unique.map(() => '?').join(',')})`).all(...unique);
  return new Map(rows.map(row => [row.id, row]));
}

export const findPictureBySlug = async (slug) => await getDb().prepare('SELECT id FROM pictures WHERE slug = ?').get(slug);

export function manifestOf(picture) {
  return parseJson(picture.manifest, { palette: [], regions: [] });
}

/** Bản gọn gửi cho client: SVG + bảng màu + nhãn số, không kèm đa giác (chỉ server cần). */
export function toClient(p, withSvg = true) {
  const m = withSvg ? manifestOf(p) : null;
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

/** Lists need names and small static images; SVG/regions are fetched only for the editor. */
export function toPreview(p) {
  const preview = parseJson(p.preview);
  return preview ? { ...toClient(p, false), preview } : toClient(p);
}

export async function cardPool() {
  const rows = await getDb()
    .prepare(`SELECT p.id, p.rarity FROM pictures p WHERE p.is_card = 1 AND p.hidden = 0 AND p.rarity IS NOT NULL AND ${ACTIVE_PICTURE}`)
    .all();
  const pool = { S: [], A: [], B: [], C: [] };
  for (const r of rows) pool[r.rarity].push(r.id);
  return pool;
}

export async function randomPictureForArena() {
  return await getDb()
    .prepare(`SELECT p.id FROM pictures p WHERE p.is_card = 0 AND p.hidden = 0 AND ${ACTIVE_PICTURE} ORDER BY RANDOM() LIMIT 1`)
    .get();
}

export { lang };
