import { Router } from 'express';
import * as c from '../controllers/shop.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.get('/', requireAuth, c.list);
r.post('/:slug/buy', requireAuth, c.buy);
export default r;
