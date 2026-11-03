// Tô màu & Lịch sử tô (Mục 3, 6.2, 7).
import { getDb } from '../config/db.js';
import * as Artwork from '../models/artwork.js';
import * as Picture from '../models/picture.js';
import { sanitizeArtworkData } from '../services/scoringEngine.js';
import * as Signature from '../services/signature.js';
import * as User from '../models/user.js';
import * as Exhibition from '../services/exhibition.js';
import { consume, planStatus, COUNTED_MODES } from '../services/quota.js';
import * as progression from '../services/progression.js';
import { canUsePicture } from './picture.controller.js';
import { badRequest, forbidden, notFound } from '../utils/http.js';
import { DEFAULT_ARTWORK_FRAME } from '../config/constants.js';

const THUMB_RE = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;
const MAX_THUMB = 900 * 1024;

async function own(req) {
  const a = await Artwork.findById(Number(req.params.id));
  if (!a || a.user_id !== req.user.id) throw notFound('artwork_not_found');
  return a;
}

const hasContent = (d) => Object.keys(d.fills).length > 0 || d.strokes.length > 0 || d.stickers.length > 0;

export async function list(req, res) {
  const { status, mode, eligibility, progress } = req.query;
  const artworks = await Artwork.listByUser(req.user.id, { status: status || undefined, mode: mode || undefined });
  // Tranh hoàn thành đã đủ điều kiện gửi triển lãm (máy tự kiểm các điều 1, 2, 3, 4, 8) → bé thấy chú thích "Đủ điều kiện triển lãm".
  // Chỉ tính khi có ?eligibility=1 (trang Bộ sưu tập) vì phải đọc dữ liệu từng tranh.
  for (const a of eligibility ? artworks : []) {
    a.exhibitEligible = false;
    if (a.status !== 'completed' || a.mode !== 'free') continue;
    try {
      const row = await Artwork.findById(a.id);
      a.exhibitEligible = !!row && (await Exhibition.checkArtwork(row)).failures.length === 0;
    } catch {
      /* tranh lỗi dữ liệu: coi như chưa đủ điều kiện */
    }
  }
  // Tranh đang dở: % vùng đã tô (?progress=1, trang Lịch sử). 0 = chưa tô gì.
  if (progress) {
    for (const a of artworks) {
      if (a.status !== 'in_progress') continue;
      a.progress = 0;
      try {
        const row = await Artwork.findById(a.id);
        const total = Picture.manifestOf(await Picture.findPicture(a.pictureId)).regions.length;
        const d = Artwork.dataOf(row);
        const filled = Object.keys(d.fills).length;
        if (total && filled) a.progress = Math.max(1, Math.min(99, Math.round((filled / total) * 100)));
        else if (hasContent(d)) a.progress = 1;
      } catch {
        /* dữ liệu lỗi: coi như chưa tô */
      }
    }
  }
  res.json({ artworks });
}

export async function create(req, res) {
  const { pictureId, mode } = req.body || {};
  if (!['template', 'free'].includes(mode)) throw badRequest('invalid_mode');
  const p = await Picture.findPicture(Number(pictureId));
  if (!p) throw notFound('picture_not_found');
  if (!(await canUsePicture(req.user, p))) throw forbidden('card_not_owned');
  const a = await Artwork.create({ userId: req.user.id, pictureId: p.id, mode });
  res.status(201).json({
    artwork: { ...Artwork.toSummary({ ...a, name_vi: p.name_vi, name_en: p.name_en }), data: Artwork.dataOf(a) },
    plan: await planStatus(req.user.id),
  });
}

export async function get(req, res) {
  const a = await own(req);
  const p = await Picture.findPicture(a.picture_id);
  res.json({
    artwork: {
      ...Artwork.toSummary({ ...a, name_vi: p.name_vi, name_en: p.name_en, is_card: p.is_card, rarity: p.rarity }),
      data: Artwork.dataOf(a),
      counted: !!a.counted,
      exhibited: !!(await Exhibition.activeEntryFor(a.id)),
    },
    picture: Picture.toClient(p),
  });
}

/** Gọi ngay trước thao tác tô đầu tiên: tính 1 lượt; hết lượt → 402. */
export async function start(req, res) {
  const a = await own(req);
  res.json({ plan: await consume(req.user.id, a) });
}

export async function save(req, res) {
  const a = await own(req);
  // Tranh đã gửi triển lãm: chữ ký và nội dung bị khoá.
  await Exhibition.assertEditable(a.id);
  const p = await Picture.findPicture(a.picture_id);
  const data = sanitizeArtworkData(Picture.manifestOf(p), req.body?.data);
  // Chữ ký là lớp riêng (không phải nét cọ) nên nằm ngoài dữ liệu chấm điểm.
  const signature = await Signature.preparePlaced(await User.findById(req.user.id), req.body?.data?.signature, Artwork.dataOf(a).signature);
  if (signature) data.signature = signature;
  if (hasContent(data) && COUNTED_MODES.has(a.mode)) await consume(req.user.id, a);
  const thumb = req.body?.thumbnail;
  if (thumb != null && (!THUMB_RE.test(thumb) || thumb.length > MAX_THUMB)) throw badRequest('invalid_thumbnail');

  const completing = req.body?.completed === true && a.status !== 'completed';
  const nowIso = new Date().toISOString();
  await getDb()
    .prepare(
      'UPDATE artworks SET data = ?, thumbnail = COALESCE(?, thumbnail), updated_at = ?, warned_at = NULL, status = ?, completed_at = COALESCE(completed_at, ?) WHERE id = ?',
    )
    .run(JSON.stringify(data), thumb ?? null, nowIso, completing ? 'completed' : a.status, completing ? nowIso : null, a.id);

  const events = [];
  if (completing) {
    const uid = req.user.id;
    events.push(...(await progression.markThemeTried(uid, p.theme_id)));
    if (a.mode === 'free') events.push(...(await progression.record(uid, 'complete_free')));
    if (a.mode === 'template') events.push(...(await progression.record(uid, 'complete_template')));
    if (data.glitter.length) events.push(...(await progression.record(uid, 'sparkle_use')));
    if (data.strokes.some((s) => s.tool === 'brush') && data.stickers.length) events.push(...(await progression.record(uid, 'brush_sticker')));
    events.push(...(await progression.record(uid, 'complete_any')));
  }
  const fresh = await Artwork.findById(a.id);
  res.json({ artwork: { ...Artwork.toSummary({ ...fresh, name_vi: p.name_vi, name_en: p.name_en }) }, events, plan: await planStatus(req.user.id) });
}

export async function remove(req, res) {
  const a = await own(req);
  await Exhibition.assertDeletable(a.id);
  await getDb().prepare('DELETE FROM artworks WHERE id = ?').run(a.id);
  res.json({ ok: true });
}

/** Ghi nhận bé đã tải về / in tranh (phục vụ nhiệm vụ). */
export async function download(req, res) {
  await own(req);
  res.json({ events: await progression.record(req.user.id, 'download') });
}

export async function setFrame(req, res) {
  const a = await own(req);
  const frame = req.body?.frame ?? null;
  // Khung mặc định (miễn phí) ai cũng dùng được; khung khác phải sở hữu.
  if (frame !== null && frame !== DEFAULT_ARTWORK_FRAME) {
    const owned = await getDb()
      .prepare("SELECT 1 FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.user_id = ? AND i.slug = ? AND i.type = 'artwork_frame'")
      .get(req.user.id, frame);
    if (!owned) throw forbidden('item_not_owned');
  }
  // null = bé chủ động bỏ khung → lưu '' (để phân biệt với "chưa chọn" = dùng khung mặc định).
  await getDb()
    .prepare('UPDATE artworks SET artwork_frame = ? WHERE id = ?')
    .run(frame ?? '', a.id);
  res.json({ ok: true, frame });
}
