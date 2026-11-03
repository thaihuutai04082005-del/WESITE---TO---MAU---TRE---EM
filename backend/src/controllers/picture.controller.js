import { asyncMap } from '../utils/asyncArray.js';
// Mục 2: nội dung 3 tầng — mỗi tầng trả kèm tranh minh hoạ thật (SVG + màu gợi ý) để bé dễ chọn.
import { getDb } from '../config/db.js';
import * as Picture from '../models/picture.js';
import { forbidden, notFound } from '../utils/http.js';

export async function themes(_req, res) {
  const list = await asyncMap(await Picture.listThemes(), async (t) => ({
    id: t.id,
    slug: t.slug,
    name: { vi: t.name_vi, en: t.name_en },
    age: t.age_group,
    objectCount: t.object_count,
    pictureCount: t.picture_count,
    cover: t.cover_id ? Picture.toClient(await Picture.findPicture(t.cover_id)) : null,
  }));
  res.json({ themes: list });
}

export async function objects(req, res) {
  const theme = await Picture.findActiveTheme(req.params.theme);
  if (!theme) throw notFound();
  const list = await asyncMap(await Picture.listObjects(theme.id), async (o) => ({
    id: o.id,
    slug: o.slug,
    name: { vi: o.name_vi, en: o.name_en },
    pictureCount: o.picture_count,
    cover: o.cover_id ? Picture.toClient(await Picture.findPicture(o.cover_id)) : null,
  }));
  res.json({ theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } }, objects: list });
}

export async function pictures(req, res) {
  const theme = await Picture.findActiveTheme(req.params.theme);
  const obj = theme && (await Picture.findObject(theme.id, req.params.object));
  if (!obj) throw notFound();
  const list = await asyncMap(await Picture.listPictures(obj.id), async (p) => Picture.toClient(await Picture.findPicture(p.id)));
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
  const list = await asyncMap(await Picture.listThemePictures(theme.id), async (p) => Picture.toClient(await Picture.findPicture(p.id)));
  res.json({ theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } }, pictures: list });
}

export async function canUsePicture(user, picture) {
  if (!picture.is_card) return true;
  if (user?.role === 'admin') return true;
  return !!(await getDb().prepare('SELECT 1 FROM user_cards WHERE user_id = ? AND picture_id = ?').get(user?.id, picture.id));
}

export async function picture(req, res) {
  const p = await Picture.findPicture(Number(req.params.id));
  if (!p) throw notFound();
  if (!(await canUsePicture(req.user, p))) throw forbidden('card_not_owned');
  res.json({ picture: Picture.toClient(p) });
}
