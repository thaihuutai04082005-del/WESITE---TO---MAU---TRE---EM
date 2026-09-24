// Mục 10.2: đóng các tranh Sáng tạo đã hoàn thành thành cuốn truyện Flipbook; xem lật trang, tải PDF, chia sẻ.
import { getDb, tx } from '../config/db.js';
import * as User from '../models/user.js';
import * as progression from '../services/progression.js';
import { storybookPdf } from '../services/pdf.js';
import { token } from '../utils/ids.js';
import { badRequest, notFound, str } from '../utils/http.js';

const MAX_PAGES = 40;

function pagesOf(bookId) {
  return getDb()
    .prepare(
      `SELECT sp.position, sp.caption, sp.artwork_id, a.thumbnail, p.name_vi, p.name_en
       FROM storybook_pages sp JOIN artworks a ON a.id = sp.artwork_id JOIN pictures p ON p.id = a.picture_id
       WHERE sp.storybook_id = ? ORDER BY sp.position`,
    )
    .all(bookId)
    .map((r) => ({ artworkId: r.artwork_id, caption: r.caption, image: r.thumbnail, name: { vi: r.name_vi, en: r.name_en } }));
}

function view(b, withPages = true) {
  return {
    id: b.id,
    title: b.title,
    completed: !!b.completed,
    shareToken: b.share_token,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    pageCount: getDb().prepare('SELECT COUNT(*) AS c FROM storybook_pages WHERE storybook_id = ?').get(b.id).c,
    cover: getDb()
      .prepare('SELECT a.thumbnail FROM storybook_pages sp JOIN artworks a ON a.id = sp.artwork_id WHERE sp.storybook_id = ? ORDER BY sp.position LIMIT 1')
      .get(b.id)?.thumbnail || null,
    ...(withPages ? { pages: pagesOf(b.id) } : {}),
  };
}

function own(req) {
  const b = getDb().prepare('SELECT * FROM storybooks WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.user.id);
  if (!b) throw notFound('storybook_not_found');
  return b;
}

/** Chỉ nhận tranh Sáng tạo (mode free) đã hoàn thành của chính bé. */
function validatePages(userId, pages) {
  if (!Array.isArray(pages) || pages.length > MAX_PAGES) throw badRequest('invalid_pages');
  return pages.map((p) => {
    const a = getDb().prepare("SELECT id FROM artworks WHERE id = ? AND user_id = ? AND mode = 'free' AND status = 'completed'").get(Number(p.artworkId), userId);
    if (!a) throw badRequest('invalid_page_artwork');
    return { artworkId: a.id, caption: typeof p.caption === 'string' ? p.caption.slice(0, 200) : '' };
  });
}

function writePages(bookId, pages) {
  getDb().prepare('DELETE FROM storybook_pages WHERE storybook_id = ?').run(bookId);
  const ins = getDb().prepare('INSERT INTO storybook_pages (storybook_id, artwork_id, position, caption) VALUES (?, ?, ?, ?)');
  pages.forEach((p, i) => ins.run(bookId, p.artworkId, i, p.caption));
}

export function list(req, res) {
  const books = getDb().prepare('SELECT * FROM storybooks WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id);
  res.json({ storybooks: books.map((b) => view(b, false)) });
}

export function create(req, res) {
  const title = str(req.body?.title, { min: 1, max: 80, name: 'title' });
  const pages = validatePages(req.user.id, req.body?.pages || []);
  const id = tx(() => {
    const r = getDb().prepare('INSERT INTO storybooks (user_id, title) VALUES (?, ?)').run(req.user.id, title);
    writePages(Number(r.lastInsertRowid), pages);
    return Number(r.lastInsertRowid);
  });
  res.status(201).json({ storybook: view(getDb().prepare('SELECT * FROM storybooks WHERE id = ?').get(id)) });
}

export function get(req, res) {
  res.json({ storybook: view(own(req)) });
}

export function update(req, res) {
  const b = own(req);
  const title = req.body?.title !== undefined ? str(req.body.title, { min: 1, max: 80, name: 'title' }) : b.title;
  const pages = req.body?.pages !== undefined ? validatePages(req.user.id, req.body.pages) : null;
  tx(() => {
    getDb().prepare('UPDATE storybooks SET title = ?, updated_at = ? WHERE id = ?').run(title, new Date().toISOString(), b.id);
    if (pages) writePages(b.id, pages);
  });
  res.json({ storybook: view(own(req)) });
}

export function remove(req, res) {
  const b = own(req);
  getDb().prepare('DELETE FROM storybooks WHERE id = ?').run(b.id);
  res.json({ ok: true });
}

/** Hoàn thành cuốn truyện (tối thiểu 2 trang) — tính cho nhiệm vụ "Hoàn thành 1 cuốn Flipbook". */
export function complete(req, res) {
  const b = own(req);
  if (view(b, false).pageCount < 2) throw badRequest('storybook_too_short');
  let events = [];
  if (!b.completed) {
    getDb().prepare('UPDATE storybooks SET completed = 1, updated_at = ? WHERE id = ?').run(new Date().toISOString(), b.id);
    events = progression.record(req.user.id, 'flipbook_complete');
  }
  res.json({ storybook: view(own(req)), events });
}

export function share(req, res) {
  const b = own(req);
  const t = b.share_token || token(12);
  getDb().prepare('UPDATE storybooks SET share_token = ? WHERE id = ?').run(req.body?.revoke ? null : t, b.id);
  res.json({ shareToken: req.body?.revoke ? null : t });
}

async function sendPdf(res, b) {
  const author = User.findById(b.user_id);
  const buf = await storybookPdf({
    title: b.title,
    author: author?.nickname || '',
    pages: pagesOf(b.id).map((p) => ({ image: p.image, caption: p.caption })),
  });
  const safe = b.title.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40) || 'truyen';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safe}.pdf"`);
  res.send(buf);
}

export async function pdf(req, res) {
  await sendPdf(res, own(req));
}

/** Xem công khai qua link chia sẻ (chỉ đọc) — phù hợp gửi cho ông bà, bố mẹ. */
export function shared(req, res) {
  const b = getDb().prepare('SELECT * FROM storybooks WHERE share_token = ?').get(String(req.params.token));
  if (!b) throw notFound('storybook_not_found');
  const author = User.findById(b.user_id);
  const v = view(b);
  delete v.shareToken;
  res.json({ storybook: { ...v, author: author?.nickname || '' } });
}

export async function sharedPdf(req, res) {
  const b = getDb().prepare('SELECT * FROM storybooks WHERE share_token = ?').get(String(req.params.token));
  if (!b) throw notFound('storybook_not_found');
  await sendPdf(res, b);
}
