import { Router } from 'express';
import * as c from '../controllers/storybook.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.get('/shared/:token', c.shared);
r.get('/shared/:token/pdf', c.sharedPdf);
r.get('/', requireAuth, c.list);
r.post('/', requireAuth, c.create);
r.get('/:id', requireAuth, c.get);
r.put('/:id', requireAuth, c.update);
r.delete('/:id', requireAuth, c.remove);
r.post('/:id/complete', requireAuth, c.complete);
r.post('/:id/share', requireAuth, c.share);
r.get('/:id/pdf', requireAuth, c.pdf);
export default r;
