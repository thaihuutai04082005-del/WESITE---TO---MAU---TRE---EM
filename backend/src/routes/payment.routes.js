import { Router } from 'express';
import * as c from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.post('/momo/ipn', c.momoIpn);
r.post('/', requireAuth, c.create);
r.get('/:id', requireAuth, c.status);
r.post('/:id/paypal/capture', requireAuth, c.paypalCapture);
r.post('/:id/momo/return', requireAuth, c.momoReturn);
r.post('/:id/mock-complete', requireAuth, c.mockComplete);
export default r;
