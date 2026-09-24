// Phòng thi & chấm điểm chạy qua Socket.io (services/arena.js); REST phục vụ thông tin, lịch sử, bảng xếp hạng.
import { Router } from 'express';
import * as c from '../controllers/arena.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.get('/', requireAuth, c.info);
r.get('/rooms/:id', requireAuth, c.result);
export default r;
