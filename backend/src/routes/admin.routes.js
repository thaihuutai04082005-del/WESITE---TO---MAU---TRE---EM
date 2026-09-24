import { Router } from 'express';
import * as c from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const r = Router();
r.use(requireAuth, requireAdmin);
r.get('/tree', c.tree);
r.get('/stats', c.stats);
r.post('/themes', c.createTheme);
r.post('/objects', c.createObject);
r.post('/pictures', c.createPicture);
r.delete('/pictures/:id', c.deletePicture);
export default r;
