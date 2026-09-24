import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { rateLimit } from '../middlewares/rateLimit.js';

const r = Router();
const strict = rateLimit({ windowMs: 15 * 60000, max: 20 });

r.get('/captcha', rateLimit({ max: 30 }), c.captcha);
r.post('/register/start', strict, c.registerStart);
r.post('/register/verify', strict, c.registerVerify);
r.post('/login', strict, c.login);
r.post('/google', strict, c.google);
r.post('/forgot/start', strict, c.forgotStart);
r.post('/forgot/verify', strict, c.forgotVerify);
r.post('/forgot/reset', strict, c.forgotReset);
r.get('/me', requireAuth, c.me);

export default r;
