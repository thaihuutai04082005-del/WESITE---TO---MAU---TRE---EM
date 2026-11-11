// Mục 2: nội dung 3 tầng — mỗi tầng trả kèm tranh minh hoạ thật (SVG + màu gợi ý) để bé dễ chọn.
import { getDb } from '../config/db.js';
import * as Picture from '../models/picture.js';
import { forbidden, notFound } from '../utils/http.js';
import { coloredSvg, thumbFile, thumbUrl } from '../services/thumbs.js';

/** Tranh trong danh sách: thông tin + đường dẫn ảnh nhỏ (không kèm SVG nặng — SVG chỉ tải khi vào tô). */
function listItem(id) {
  const p = Picture.findPictureLite(id);
  return p && { ...Picture.toClient(p, false), thumb: thumbUrl(p), thumbBlank: thumbUrl(p, true) };
}

export function themes(_req, res) {
  const list = Picture.listThemes().map((t) => ({
    id: t.id,
    slug: t.slug,
    name: { vi: t.name_vi, en: t.name_en },
    age: t.age_group,
    objectCount: t.object_count,
    pictureCount: t.picture_count,
    cover: t.cover_id ? listItem(t.cover_id) : null,
  }));
  res.json({ themes: list });
}

export function objects(req, res) {
  const theme = Picture.findActiveTheme(req.params.theme);
  if (!theme) throw notFound();
  const list = Picture.listObjects(theme.id).map((o) => ({
    id: o.id,
    slug: o.slug,
    name: { vi: o.name_vi, en: o.name_en },
    pictureCount: o.picture_count,
    cover: o.cover_id ? listItem(o.cover_id) : null,
  }));
  res.json({ theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } }, objects: list });
}

export function pictures(req, res) {
  const theme = Picture.findActiveTheme(req.params.theme);
  const obj = theme && Picture.findObject(theme.id, req.params.object);
  if (!obj) throw notFound();
  const list = Picture.listPictures(obj.id).map((p) => listItem(p.id));
  res.json({
    theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } },
    object: { slug: obj.slug, name: { vi: obj.name_vi, en: obj.name_en } },
    pictures: list,
  });
}

/** Tranh của cả chủ đề (2 tầng: Chủ đề → Tranh). */
export function themePictures(req, res) {
  const theme = Picture.findActiveTheme(req.params.theme);
  if (!theme) throw notFound();
  const list = Picture.listThemePictures(theme.id).map((p) => listItem(p.id));
  res.json({ theme: { slug: theme.slug, name: { vi: theme.name_vi, en: theme.name_en } }, pictures: list });
}

export function canUsePicture(user, picture) {
  if (!picture.is_card) return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!getDb().prepare('SELECT 1 FROM user_cards WHERE user_id = ? AND picture_id = ?').get(user?.id, picture.id);
}

export function picture(req, res) {
  const p = Picture.findPicture(Number(req.params.id));
  if (!p) throw notFound();
  if (!canUsePicture(req.user, p)) throw forbidden('card_not_owned');
  res.json({ picture: Picture.toClient(p) });
}

/** Ảnh nhỏ WebP của tranh mẫu (`blank`: chưa tô). Đường dẫn có ?v= theo nội dung nên cho trình duyệt nhớ mãi. Thẻ không có ảnh công khai. */
export async function thumb(req, res) {
  const p = Picture.findPicture(Number(req.params.id));
  if (!p || p.is_card) throw notFound();
  const blank = req.path.endsWith('thumb-blank.webp');
  res.setHeader('Cache-Control', req.query.v ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
  const file = await thumbFile(p, blank);
  if (file) return res.type('image/webp').sendFile(file, { cacheControl: false });
  res.type('image/svg+xml').send(coloredSvg(p, blank)); // máy chủ không có sharp: gửi SVG đã tô
}
