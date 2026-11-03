// Mục 2: nội dung 3 tầng — mỗi tầng trả kèm tranh minh hoạ thật (SVG + màu gợi ý) để bé dễ chọn.
import { getDb } from '../config/db.js';
import * as Picture from '../models/picture.js';
import { forbidden, notFound } from '../utils/http.js';
import { themeAccess, canAccessTheme, assertThemeAccess } from '../services/quota.js';

export async function themes(req, res) {
  const access = await themeAccess(req.user?.id);
  const rows = await Picture.listThemes();
  const covers = req.query.access === '1' ? new Map() : await Picture.findPictures(rows.map((theme) => theme.cover_id));
  const client = req.query.preview === '1' ? Picture.toPreview : Picture.toClient;
  const list = rows.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: { vi: t.name_vi, en: t.name_en },
    age: t.age_group,
    locked: !access.vip && !access.allowedIds.has(t.id),
    objectCount: t.object_count,
    pictureCount: t.picture_count,
    cover: covers.has(t.cover_id) ? client(covers.get(t.cover_id)) : null,
  }));
  res.json({ themes: list });
}

export async function objects(req, res) {
  const theme = await Picture.findActiveTheme(req.params.theme);
  if (!theme) throw notFound();
  await assertThemeAccess(req.user?.id, theme.id);
  const rows = await Picture.listObjects(theme.id);
  const covers = await Picture.findPictures(rows.map((object) => object.cover_id));
  const client = req.query.preview === '1' ? Picture.toPreview : Picture.toClient;
  const list = rows.map((o) => ({
    id: o.id,
    slug: o.slug,
    name: { vi: o.name_vi, en: o.name_en },
    pictureCount: o.picture_count,
    cover: covers.has(o.cover_id) ? client(covers.get(o.cover_id)) : null,
  }));
  res.json({ theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } }, objects: list });
}

export async function pictures(req, res) {
  const theme = await Picture.findActiveTheme(req.params.theme);
  const obj = theme && (await Picture.findObject(theme.id, req.params.object));
  if (!obj) throw notFound();
  await assertThemeAccess(req.user?.id, theme.id);
  const rows = await Picture.listPictures(obj.id);
  const pictures = await Picture.findPictures(rows.map((p) => p.id));
  const client = req.query.preview === '1' ? Picture.toPreview : Picture.toClient;
  const list = rows.map((p) => client(pictures.get(p.id)));
  res.json({
    theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } },
    object: { slug: obj.slug, name: { vi: obj.name_vi, en: obj.name_en } },
    pictures: list,
  });
}

/** Tranh của cả chủ đề (2 tầng: Chủ đề → Tranh). */
export async function themePictures(req, res) {
  const theme = await Picture.findActiveTheme(req.params.theme);
  if (!theme) throw notFound();
  await assertThemeAccess(req.user?.id, theme.id);
  const rows = await Picture.listThemePictures(theme.id);
  const pictures = await Picture.findPictures(rows.map((p) => p.id));
  const client = req.query.preview === '1' ? Picture.toPreview : Picture.toClient;
  const list = rows.map((p) => client(pictures.get(p.id)));
  res.json({ theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } }, pictures: list });
}

export async function pictureAccessError(user, picture) {
  if (!picture.is_card) return await canAccessTheme(user?.id, picture.theme_id) ? null : 'theme_vip_required';
  if (user?.role === 'admin') return null;
  return await getDb().prepare('SELECT 1 FROM user_cards WHERE user_id = ? AND picture_id = ?').get(user?.id, picture.id) ? null : 'card_not_owned';
}

export async function assertCanUsePicture(user, picture) {
  const error = await pictureAccessError(user, picture);
  if (error) throw forbidden(error);
}

export async function picture(req, res) {
  const p = await Picture.findPicture(Number(req.params.id));
  if (!p) throw notFound();
  await assertCanUsePicture(req.user, p);
  if (req.query.access === '1') return res.json({ allowed: true });
  res.json({ picture: Picture.toClient(p) });
}
