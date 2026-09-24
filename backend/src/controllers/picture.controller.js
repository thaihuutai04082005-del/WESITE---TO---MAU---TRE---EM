// Mục 2: nội dung 3 tầng — mỗi tầng trả kèm tranh minh hoạ thật (SVG + màu gợi ý) để bé dễ chọn.
import { getDb } from '../config/db.js';
import * as Picture from '../models/picture.js';
import { forbidden, notFound } from '../utils/http.js';

export function themes(_req, res) {
  const list = Picture.listThemes().map((t) => ({
    id: t.id,
    slug: t.slug,
    name: { vi: t.name_vi, en: t.name_en },
    objectCount: t.object_count,
    cover: t.cover_id ? Picture.toClient(Picture.findPicture(t.cover_id)) : null,
  }));
  res.json({ themes: list });
}

export function objects(req, res) {
  const theme = Picture.findTheme(req.params.theme);
  if (!theme) throw notFound();
  const list = Picture.listObjects(theme.id).map((o) => ({
    id: o.id,
    slug: o.slug,
    name: { vi: o.name_vi, en: o.name_en },
    pictureCount: o.picture_count,
    cover: o.cover_id ? Picture.toClient(Picture.findPicture(o.cover_id)) : null,
  }));
  res.json({ theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } }, objects: list });
}

export function pictures(req, res) {
  const theme = Picture.findTheme(req.params.theme);
  const obj = theme && Picture.findObject(theme.id, req.params.object);
  if (!obj) throw notFound();
  const list = Picture.listPictures(obj.id).map((p) => Picture.toClient(Picture.findPicture(p.id)));
  res.json({
    theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } },
    object: { slug: obj.slug, name: { vi: obj.name_vi, en: obj.name_en } },
    pictures: list,
  });
}

export function canUsePicture(user, picture) {
  if (!picture.is_card) return true;
  if (user?.role === 'admin') return true;
  return !!getDb().prepare('SELECT 1 FROM user_cards WHERE user_id = ? AND picture_id = ?').get(user?.id, picture.id);
}

export function picture(req, res) {
  const p = Picture.findPicture(Number(req.params.id));
  if (!p) throw notFound();
  if (!canUsePicture(req.user, p)) throw forbidden('card_not_owned');
  res.json({ picture: Picture.toClient(p) });
}
