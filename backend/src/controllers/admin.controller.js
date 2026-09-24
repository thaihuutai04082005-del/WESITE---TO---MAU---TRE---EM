// Công cụ quản trị nội dung (Mục 12): thêm chủ đề/đối tượng, tải tranh SVG mới kèm manifest vùng tô
// (admin-cms tự tính bbox/đa giác/vị trí số trong trình duyệt) — không cần sửa code khi thêm tranh.
import { getDb } from '../config/db.js';
import * as Picture from '../models/picture.js';
import { badRequest, conflict, notFound, str } from '../utils/http.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = (v, name) => {
  const s = str(v, { min: 1, max: 60, name });
  if (!SLUG_RE.test(s)) throw badRequest('invalid_slug');
  return s;
};

export function tree(_req, res) {
  const themes = getDb().prepare('SELECT * FROM themes ORDER BY sort, id').all();
  const out = themes.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: { vi: t.name_vi, en: t.name_en },
    objects: getDb()
      .prepare('SELECT * FROM objects WHERE theme_id = ? ORDER BY sort, id')
      .all(t.id)
      .map((o) => ({
        id: o.id,
        slug: o.slug,
        name: { vi: o.name_vi, en: o.name_en },
        pictures: getDb()
          .prepare('SELECT id, slug, variant_slug, name_vi, name_en, is_card, rarity FROM pictures WHERE object_id = ? ORDER BY is_card, sort, id')
          .all(o.id),
      })),
  }));
  res.json({ themes: out });
}

export function createTheme(req, res) {
  const s = slug(req.body?.slug, 'slug');
  if (Picture.findTheme(s)) throw conflict('slug_taken');
  const max = getDb().prepare('SELECT COALESCE(MAX(sort), 0) AS m FROM themes').get().m;
  getDb().prepare('INSERT INTO themes (slug, name_vi, name_en, sort) VALUES (?, ?, ?, ?)').run(s, str(req.body?.nameVi, { min: 1, max: 60 }), str(req.body?.nameEn, { min: 1, max: 60 }), max + 1);
  res.status(201).json({ ok: true });
}

export function createObject(req, res) {
  const theme = getDb().prepare('SELECT * FROM themes WHERE id = ?').get(Number(req.body?.themeId));
  if (!theme) throw notFound();
  const s = slug(req.body?.slug, 'slug');
  if (Picture.findObject(theme.id, s)) throw conflict('slug_taken');
  const max = getDb().prepare('SELECT COALESCE(MAX(sort), 0) AS m FROM objects WHERE theme_id = ?').get(theme.id).m;
  getDb().prepare('INSERT INTO objects (theme_id, slug, name_vi, name_en, sort) VALUES (?, ?, ?, ?, ?)').run(theme.id, s, str(req.body?.nameVi, { min: 1, max: 60 }), str(req.body?.nameEn, { min: 1, max: 60 }), max + 1);
  res.status(201).json({ ok: true });
}

function validateManifest(m) {
  if (!m || !Array.isArray(m.regions) || !m.regions.length || m.regions.length > 400) throw badRequest('invalid_manifest');
  const ids = new Set();
  const regions = m.regions.map((r) => {
    if (typeof r.id !== 'string' || !/^[a-zA-Z0-9_-]{1,60}$/.test(r.id) || ids.has(r.id)) throw badRequest('invalid_manifest');
    ids.add(r.id);
    if (!/^#[0-9A-Fa-f]{6}$/.test(r.color || '')) throw badRequest('invalid_manifest');
    if (!Array.isArray(r.poly) || r.poly.length < 3) throw badRequest('invalid_manifest');
    return {
      id: r.id,
      color: r.color.toUpperCase(),
      area: Math.max(0, Number(r.area) || 0),
      bbox: r.bbox.map(Number),
      label: r.label.map(Number),
      labelSize: Number(r.labelSize) || 14,
      poly: r.poly.map(([x, y]) => [Number(x), Number(y)]),
    };
  });
  const palette = [];
  for (const r of regions) {
    let p = palette.find((q) => q.color === r.color);
    if (!p) palette.push((p = { number: palette.length + 1, color: r.color }));
    r.number = p.number;
  }
  return { palette, regions };
}

function sanitizeSvg(svg) {
  const s = str(svg, { min: 20, max: 500000, name: 'svg' });
  if (!/^<svg[\s>]/.test(s) || /<script|\son[a-z]+\s*=|javascript:|<foreignObject|href\s*=\s*["'](?!#)/i.test(s)) throw badRequest('unsafe_svg');
  return s;
}

export function createPicture(req, res) {
  const b = req.body || {};
  const obj = getDb().prepare('SELECT * FROM objects WHERE id = ?').get(Number(b.objectId));
  if (!obj) throw notFound();
  const variantSlug = slug(b.variantSlug, 'variantSlug');
  const obSlug = obj.slug;
  const pSlug = `${obSlug}--${variantSlug}`;
  if (Picture.findPictureBySlug(pSlug)) throw conflict('slug_taken');
  const manifest = validateManifest(b.manifest);
  const svg = sanitizeSvg(b.svg);
  let rarity = null;
  if (b.isCard) {
    if (!['S', 'A', 'B', 'C'].includes(b.rarity)) throw badRequest('invalid_rarity');
    rarity = b.rarity;
  }
  const variantVi = str(b.variantNameVi, { min: 1, max: 60 });
  const variantEn = str(b.variantNameEn, { min: 1, max: 60 });
  const r = getDb()
    .prepare(
      `INSERT INTO pictures (object_id, slug, variant_slug, name_vi, name_en, variant_name_vi, variant_name_en, svg, manifest, animation, is_card, rarity, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 100)`,
    )
    .run(obj.id, pSlug, variantSlug, `${obj.name_vi} ${variantVi}`, `${obj.name_en} – ${variantEn}`, variantVi, variantEn, svg, JSON.stringify(manifest), ['bounce', 'drive', 'sway', 'float', 'wiggle', 'fly', 'bob'].includes(b.animation) ? b.animation : 'bounce', b.isCard ? 1 : 0, rarity);
  res.status(201).json({ id: Number(r.lastInsertRowid), slug: pSlug });
}

export function deletePicture(req, res) {
  const id = Number(req.params.id);
  const used = getDb().prepare('SELECT (SELECT COUNT(*) FROM artworks WHERE picture_id = ?) + (SELECT COUNT(*) FROM user_cards WHERE picture_id = ?) AS c').get(id, id).c;
  if (used) throw conflict('picture_in_use');
  getDb().prepare('DELETE FROM pictures WHERE id = ?').run(id);
  res.json({ ok: true });
}

export function stats(_req, res) {
  const one = (sql) => getDb().prepare(sql).get().c;
  res.json({
    users: one('SELECT COUNT(*) AS c FROM users'),
    pictures: one('SELECT COUNT(*) AS c FROM pictures'),
    artworks: one('SELECT COUNT(*) AS c FROM artworks'),
    paidPayments: one("SELECT COUNT(*) AS c FROM payments WHERE status = 'paid'"),
    arenaRooms: one("SELECT COUNT(*) AS c FROM arena_rooms WHERE status = 'finished'"),
  });
}
