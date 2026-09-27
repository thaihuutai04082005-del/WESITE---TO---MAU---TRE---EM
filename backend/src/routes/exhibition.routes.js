import { Router } from 'express';
import * as c from '../controllers/exhibition.controller.js';
import { requireAuth, requireAdmin, requireNickname } from '../middlewares/auth.js';

const r = Router();
r.use(requireAuth);
r.get('/', c.hall);
r.get('/mine', c.mine);
r.get('/rooms/:board', c.room);
r.post('/entries', requireNickname, c.submit);
r.delete('/entries/:id', c.withdraw);
r.put('/entries/:id/reaction', c.react);
r.post('/entries/:id/report', c.report);
r.get('/review', requireAdmin, c.queue);
r.post('/review/approve', requireAdmin, c.approve);
r.post('/review/:id/reject', requireAdmin, c.reject);
export default r;
