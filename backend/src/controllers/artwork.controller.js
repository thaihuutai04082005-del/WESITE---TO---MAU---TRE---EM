// Tô màu & Lịch sử tô (Mục 3, 6.2, 7).
import { getDb } from '../config/db.js';
import * as Artwork from '../models/artwork.js';
import * as Picture from '../models/picture.js';
import { sanitizeArtworkData } from '../services/scoringEngine.js';
import { consume, planStatus, COUNTED_MODES } from '../services/quota.js';
import * as progression from '../services/progression.js';
import { canUsePicture } from './picture.controller.js';
import { badRequest, forbidden, notFound } from '../utils/http.js';

const THUMB_RE = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;
const MAX_THUMB = 900 * 1024;

function own(req) {
  const a = Artwork.findById(Number(req.params.id));
  if (!a || a.user_id !== req.user.id) throw notFound('artwork_not_found');
  return a;
}

const hasContent = (d) => Object.keys(d.fills).length > 0 || d.strokes.length > 0 || d.stickers.length > 0;

export function list(req, res) {
  const { status, mode } = req.query;
  res.json({ artworks: Artwork.listByUser(req.user.id, { status: status || undefined, mode: mode || undefined }) });
}

export function create(req, res) {
  const { pictureId, mode } = req.body || {};
  if (!['template', 'free'].includes(mode)) throw badRequest('invalid_mode');
  const p = Picture.findPicture(Number(pictureId));
  if (!p) throw notFound('picture_not_found');
  if (!canUsePicture(req.user, p)) throw forbidden('card_not_owned');
  const a = Artwork.create({ userId: req.user.id, pictureId: p.id, mode });
  res.status(201).json({ artwork: { ...Artwork.toSummary({ ...a, name_vi: p.name_vi, name_en: p.name_en }), data: Artwork.dataOf(a) }, plan: planStatus(req.user.id) });
}

export function get(req, res) {
  const a = own(req);
  const p = Picture.findPicture(a.picture_id);
  res.json({
    artwork: { ...Artwork.toSummary({ ...a, name_vi: p.name_vi, name_en: p.name_en, is_card: p.is_card, rarity: p.rarity }), data: Artwork.dataOf(a), counted: !!a.counted },
    picture: Picture.toClient(p),
  });
}

/** Gọi ngay trước thao tác tô đầu tiên: tính 1 lượt; hết lượt → 402. */
export function start(req, res) {
  const a = own(req);
  res.json({ plan: consume(req.user.id, a) });
}

export function save(req, res) {
  const a = own(req);
  const p = Picture.findPicture(a.picture_id);
  const data = sanitizeArtworkData(Picture.manifestOf(p), req.body?.data);
  if (hasContent(data) && COUNTED_MODES.has(a.mode)) consume(req.user.id, a);
  const thumb = req.body?.thumbnail;
  if (thumb != null && (!THUMB_RE.test(thumb) || thumb.length > MAX_THUMB)) throw badRequest('invalid_thumbnail');

  const completing = req.body?.completed === true && a.status !== 'completed';
  const nowIso = new Date().toISOString();
  getDb()
    .prepare('UPDATE artworks SET data = ?, thumbnail = COALESCE(?, thumbnail), updated_at = ?, warned_at = NULL, status = ?, completed_at = COALESCE(completed_at, ?) WHERE id = ?')
    .run(JSON.stringify(data), thumb ?? null, nowIso, completing ? 'completed' : a.status, completing ? nowIso : null, a.id);

  const events = [];
  if (completing) {
    const uid = req.user.id;
    events.push(...progression.markThemeTried(uid, p.theme_id));
    if (a.mode === 'free') events.push(...progression.record(uid, 'complete_free'));
    if (a.mode === 'template') events.push(...progression.record(uid, 'complete_template'));
    if (data.glitter.length) events.push(...progression.record(uid, 'sparkle_use'));
    if (data.strokes.some((s) => s.tool === 'brush') && data.stickers.length) events.push(...progression.record(uid, 'brush_sticker'));
    events.push(...progression.record(uid, 'complete_any'));
  }
  const fresh = Artwork.findById(a.id);
  res.json({ artwork: { ...Artwork.toSummary({ ...fresh, name_vi: p.name_vi, name_en: p.name_en }) }, events, plan: planStatus(req.user.id) });
}

export function remove(req, res) {
  const a = own(req);
  getDb().prepare('DELETE FROM artworks WHERE id = ?').run(a.id);
  res.json({ ok: true });
}

/** Ghi nhận bé đã tải về / in tranh (phục vụ nhiệm vụ). */
export function download(req, res) {
  own(req);
  res.json({ events: progression.record(req.user.id, 'download') });
}

export function setFrame(req, res) {
  const a = own(req);
  const frame = req.body?.frame ?? null;
  if (frame !== null) {
    const owned = getDb()
      .prepare("SELECT 1 FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.user_id = ? AND i.slug = ? AND i.type = 'artwork_frame'")
      .get(req.user.id, frame);
    if (!owned) throw forbidden('item_not_owned');
  }
  getDb().prepare('UPDATE artworks SET artwork_frame = ? WHERE id = ?').run(frame, a.id);
  res.json({ ok: true, frame });
}
