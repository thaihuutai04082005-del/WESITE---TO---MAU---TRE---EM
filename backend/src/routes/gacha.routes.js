import { Router } from 'express';
import * as c from '../controllers/gacha.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.get('/', requireAuth, c.info);
r.post('/pull', requireAuth, c.pull);
r.get('/cards', requireAuth, c.collection);
r.get('/cards/:id/picture', requireAuth, c.cardPicture);
export default r;
