// Hội trường triển lãm (Đợt 2): gửi/rút tranh, xem sảnh & phòng, thả cảm xúc, báo cho Gấu, admin duyệt.
import * as Ex from '../services/exhibition.js';
import * as User from '../models/user.js';
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

// Quản trị
export const queue = (_req, res) => res.json(Ex.reviewQueue());
export function approve(req, res) {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  res.json(Ex.approve(req.user.id, ids));
}
export const reject = (req, res) => res.json(Ex.reject(req.user.id, req.params.id, req.body?.rule));
