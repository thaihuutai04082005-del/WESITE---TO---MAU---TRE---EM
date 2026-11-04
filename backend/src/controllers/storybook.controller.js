import { asyncMap, asyncForEach } from '../utils/asyncArray.js';
// Mục 10.2: đóng các tranh đã hoàn thành trong bộ sưu tập (tô mẫu, sáng tạo, thẻ hiếm) thành cuốn truyện Flipbook; xem lật trang, tải PDF, chia sẻ.
import { getDb, tx } from '../config/db.js';
import * as User from '../models/user.js';
import * as progression from '../services/progression.js';
import { storybookPdf } from '../services/pdf.js';
import { token } from '../utils/ids.js';
import { badRequest, forbidden, notFound, str } from '../utils/http.js';
import { isVip } from '../services/quota.js';
import { STORYBOOK_LIMITS } from '../config/constants.js';

const limitsOf = async (userId) => ((await isVip(userId)) ? STORYBOOK_LIMITS.vip : STORYBOOK_LIMITS.free);

async function pagesOf(bookId) {
  return (
    await getDb()
      .prepare(
        `SELECT sp.position, sp.caption, sp.artwork_id, a.thumbnail, p.name_vi, p.name_en
       FROM storybook_pages sp JOIN artworks a ON a.id = sp.artwork_id JOIN pictures p ON p.id = a.picture_id
       WHERE sp.storybook_id = ? ORDER BY sp.position`,
      )
      .all(bookId)
  ).map((r) => ({ artworkId: r.artwork_id, caption: r.caption, image: r.thumbnail, name: { vi: r.name_vi, en: r.name_en } }));
}

async function view(b, withPages = true) {
  const [pageCount, cover, pages] = await Promise.all([
    b.page_count !== undefined ? b.page_count : getDb().prepare('SELECT COUNT(*) AS c FROM storybook_pages WHERE storybook_id = ?').get(b.id).then(row => row.c),
    b.first_thumbnail !== undefined ? b.first_thumbnail : getDb().prepare('SELECT a.thumbnail FROM storybook_pages sp JOIN artworks a ON a.id=sp.artwork_id WHERE sp.storybook_id=? ORDER BY sp.position LIMIT 1').get(b.id).then(row => row?.thumbnail),
    withPages ? pagesOf(b.id) : undefined,
  ]);
  return {
    id: b.id,
    title: b.title,
    completed: !!b.completed,
    coverStyle: b.cover_style || null,
    shareToken: b.share_token,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    pageCount,
    cover: cover || null,
    ...(withPages ? { pages } : {}),
  };
}

/** Bìa chỉ nhận khi bé đã mua (hoặc để trống = bìa mặc định). */
async function validateCover(userId, v) {
  if (v === null || v === '' || v === undefined) return null;
  const it = await getDb().prepare("SELECT id, price FROM items WHERE slug = ? AND type = 'storybook_cover'").get(String(v));
  if (!it) throw badRequest('invalid_cover');
  if (it.price !== 0 && !(await getDb().prepare('SELECT 1 FROM user_items WHERE user_id = ? AND item_id = ?').get(userId, it.id)))
    throw badRequest('cover_not_owned');
  return String(v);
}

async function own(req) {
  const b = await getDb().prepare('SELECT * FROM storybooks WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.user.id);
  if (!b) throw notFound('storybook_not_found');
  return b;
}

/** Nhận mọi tranh đã hoàn thành (nằm trong bộ sưu tập) của chính bé: tô mẫu, sáng tạo, thẻ hiếm. */
async function validatePages(userId, pages) {
  if (!Array.isArray(pages)) throw badRequest('invalid_pages');
  const max = (await limitsOf(userId)).pages;
  if (pages.length > max) throw pages.length > STORYBOOK_LIMITS.vip.pages ? badRequest('invalid_pages') : forbidden('storybook_pages_limit');
  return await asyncMap(pages, async (p) => {
    const a = await getDb().prepare("SELECT id FROM artworks WHERE id = ? AND user_id = ? AND status = 'completed'").get(Number(p.artworkId), userId);
    if (!a) throw badRequest('invalid_page_artwork');
    return { artworkId: a.id, caption: typeof p.caption === 'string' ? p.caption.slice(0, 200) : '' };
  });
}

async function writePages(bookId, pages) {
  await getDb().prepare('DELETE FROM storybook_pages WHERE storybook_id = ?').run(bookId);
  const ins = getDb().prepare('INSERT INTO storybook_pages (storybook_id, artwork_id, position, caption) VALUES (?, ?, ?, ?)');
  await asyncForEach(pages, async (p, i) => await ins.run(bookId, p.artworkId, i, p.caption));
}

export async function list(req, res) {
  const books = await getDb().prepare(`SELECT b.*,
    (SELECT COUNT(*) FROM storybook_pages sp WHERE sp.storybook_id=b.id) AS page_count,
    (SELECT a.thumbnail FROM storybook_pages sp JOIN artworks a ON a.id=sp.artwork_id WHERE sp.storybook_id=b.id ORDER BY sp.position LIMIT 1) AS first_thumbnail
    FROM storybooks b WHERE b.user_id=? ORDER BY b.updated_at DESC`).all(req.user.id);
  res.json({ storybooks: await asyncMap(books, async (b) => await view(b, false)) });
}

export async function create(req, res) {
  const maxBooks = (await limitsOf(req.user.id)).books;
  if (maxBooks !== null && (await getDb().prepare('SELECT COUNT(*) AS c FROM storybooks WHERE user_id = ?').get(req.user.id)).c >= maxBooks)
    throw forbidden('storybook_limit');
  const title = str(req.body?.title, { min: 1, max: 80, name: 'title' });
  const pages = await validatePages(req.user.id, req.body?.pages || []);
  const cover = await validateCover(req.user.id, req.body?.coverStyle);
  const id = await tx(async () => {
    const r = await getDb().prepare('INSERT INTO storybooks (user_id, title, cover_style) VALUES (?, ?, ?)').run(req.user.id, title, cover);
    await writePages(Number(r.lastInsertRowid), pages);
    return Number(r.lastInsertRowid);
  });
  res.status(201).json({ storybook: await view(await getDb().prepare('SELECT * FROM storybooks WHERE id = ?').get(id)) });
}

export async function get(req, res) {
  res.json({ storybook: await view(await own(req)) });
}

export async function update(req, res) {
  const b = await own(req);
  const title = req.body?.title !== undefined ? str(req.body.title, { min: 1, max: 80, name: 'title' }) : b.title;
  const pages = req.body?.pages !== undefined ? await validatePages(req.user.id, req.body.pages) : null;
  const cover = req.body?.coverStyle !== undefined ? await validateCover(req.user.id, req.body.coverStyle) : b.cover_style;
  await tx(async () => {
    await getDb()
      .prepare('UPDATE storybooks SET title = ?, cover_style = ?, updated_at = ? WHERE id = ?')
      .run(title, cover, new Date().toISOString(), b.id);
    if (pages) await writePages(b.id, pages);
  });
  res.json({ storybook: await view(await own(req)) });
}

export async function remove(req, res) {
  const b = await own(req);
  await getDb().prepare('DELETE FROM storybooks WHERE id = ?').run(b.id);
  res.json({ ok: true });
}

/** Hoàn thành cuốn truyện (tối thiểu 2 trang) — tính cho nhiệm vụ "Hoàn thành 1 cuốn Flipbook". */
export async function complete(req, res) {
  const b = await own(req);
  if ((await view(b, false)).pageCount < 2) throw badRequest('storybook_too_short');
  let events = [];
  if (!b.completed) {
    await getDb().prepare('UPDATE storybooks SET completed = 1, updated_at = ? WHERE id = ?').run(new Date().toISOString(), b.id);
    events = await progression.record(req.user.id, 'flipbook_complete');
  }
  res.json({ storybook: await view(await own(req)), events });
}

export async function share(req, res) {
  const b = await own(req);
  const t = b.share_token || token(12);
  await getDb()
    .prepare('UPDATE storybooks SET share_token = ? WHERE id = ?')
    .run(req.body?.revoke ? null : t, b.id);
  res.json({ shareToken: req.body?.revoke ? null : t });
}

async function sendPdf(res, b) {
  const author = await User.findById(b.user_id);
  const buf = await storybookPdf({
    title: b.title,
    author: author?.nickname || '',
    coverStyle: b.cover_style || null,
    pages: (await pagesOf(b.id)).map((p) => ({ image: p.image, caption: p.caption })),
  });
  const safe =
    b.title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .slice(0, 40) || 'truyen';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safe}.pdf"`);
  res.send(buf);
}

export async function pdf(req, res) {
  await sendPdf(res, await own(req));
}

/** Xem công khai qua link chia sẻ (chỉ đọc) — phù hợp gửi cho ông bà, bố mẹ. */
export async function shared(req, res) {
  const b = await getDb().prepare('SELECT * FROM storybooks WHERE share_token = ?').get(String(req.params.token));
  if (!b) throw notFound('storybook_not_found');
  const author = await User.findById(b.user_id);
  const v = await view(b);
  delete v.shareToken;
  res.json({ storybook: { ...v, author: author?.nickname || '' } });
}

export async function sharedPdf(req, res) {
  const b = await getDb().prepare('SELECT * FROM storybooks WHERE share_token = ?').get(String(req.params.token));
  if (!b) throw notFound('storybook_not_found');
  await sendPdf(res, b);
}
