import { Router } from 'express';
import * as c from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.post('/momo/ipn', c.momoIpn);
r.post('/paypal/webhook', c.paypalWebhook);
r.post('/sepay/webhook', c.sepayWebhook);
r.post('/recurring/cancel', requireAuth, c.cancelRecurring);
r.post('/', requireAuth, c.create);
r.get('/:id', requireAuth, c.status);
r.post('/:id/paypal/confirm', requireAuth, c.paypalConfirm);
r.post('/:id/momo/return', requireAuth, c.momoReturn);
r.post('/:id/mock-complete', requireAuth, c.mockComplete);
export default r;
