// Hội trường triển lãm (Đợt 2): gửi/rút tranh, xem sảnh & phòng, thả cảm xúc, báo cho Gấu, admin duyệt.
import * as Ex from '../services/exhibition.js';
import * as User from '../models/user.js';
import { certificatePdf } from '../services/pdf.js';
import { badRequest } from '../utils/http.js';

const me = (req) => User.findById(req.user.id);

export const status = (req, res) => res.json(Ex.status(req.user.id));
export const mine = (req, res) => res.json({ ...Ex.status(req.user.id), entries: Ex.mine(req.user.id) });

export function submit(req, res) {
  const entry = Ex.submit(me(req), Number(req.body?.artworkId));
  res.status(201).json({ entry: { id: entry.id, status: entry.status, roundKey: entry.round_key, board: entry.board }, ...Ex.status(req.user.id) });
}

export function withdraw(req, res) {
  const e = Ex.withdraw(me(req), Number(req.params.id));
  res.json({ entry: { id: e.id, status: e.status }, ...Ex.status(req.user.id) });
}

export const hall = (req, res) => res.json(Ex.hall(req.user.id));
export const room = (req, res) => res.json(Ex.room(req.params.board, req.user.id));

export function react(req, res) {
  const emoji = req.body?.emoji ?? null;
  if (emoji !== null && typeof emoji !== 'string') throw badRequest('invalid_input');
  res.json(Ex.react(me(req), Number(req.params.id), emoji));
}

export const report = (req, res) => res.json(Ex.report(me(req), Number(req.params.id)));

// Khoe & chia sẻ (Đợt 3)
export const showcase = (req, res) => res.json(Ex.showcase(Number(req.params.userId), req.user.id));

const IMG_RE = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;
const BOARD_LABEL = {
  vi: { S: 'Phòng Huyền thoại (S)', A: 'Phòng Quý hiếm (A)', B: 'Phòng Đặc biệt (B)', free: 'Phòng Sáng tạo' },
  en: { S: 'Legend room (S)', A: 'Rare room (A)', B: 'Special room (B)', free: 'Creative room' },
};
const dm = (key, days, withYear) => {
  const d = new Date(Date.parse(`${key}T00:00:00Z`) + days * 86400000);
  const s = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return withYear ? `${s}/${d.getUTCFullYear()}` : s;
};

/** Giấy khen PDF cho tranh đạt danh hiệu. Ảnh tranh do trình duyệt vẽ từ dữ liệu tô (chỉ bé tự tải cho mình). */
export async function certificate(req, res) {
  const e = Ex.awardedEntry(req.user.id, Number(req.params.id));
  const image = req.body?.image;
  if (image != null && (!IMG_RE.test(image) || image.length > 3 * 1024 * 1024)) throw badRequest('invalid_input');
  const lang = req.body?.lang === 'en' ? 'en' : 'vi';
  const week = `${dm(e.roundKey, 0)} – ${dm(e.roundKey, 6, true)}`;
  const text =
    lang === 'en'
      ? {
          heading: 'CERTIFICATE',
          presents: 'The Exhibition Hall proudly presents this award to',
          line1: `for the picture “${e.name.en}”`,
          line2: 'Most loved picture of the week',
          board: BOARD_LABEL.en[e.board],
          line3: `Week ${week} · ${e.total} reactions from friends`,
          footer: 'Created by the Exhibition Hall — Bé Tô Màu',
        }
      : {
          heading: 'GIẤY KHEN',
          presents: 'Hội trường triển lãm trân trọng trao tặng bé',
          line1: `với bức tranh “${e.name.vi}”`,
          line2: 'Tranh được yêu thích nhất tuần',
          board: BOARD_LABEL.vi[e.board],
          line3: `Tuần ${week} · ${e.total} lượt cảm xúc từ các bạn`,
          footer: 'Giấy khen do Hội trường triển lãm — Bé Tô Màu trao tặng',
        };
  const pdf = await certificatePdf({ ...text, nickname: e.author.nickname, image });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="giay-khen.pdf"');
  res.send(pdf);
}

// Quản trị
export const queue = (_req, res) => res.json(Ex.reviewQueue());
export function approve(req, res) {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  res.json(Ex.approve(req.user.id, ids));
}
export const reject = (req, res) => res.json(Ex.reject(req.user.id, req.params.id, req.body?.rule));
