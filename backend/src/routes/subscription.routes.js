import { Router } from 'express';
import { subscription } from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.get('/', requireAuth, subscription);
export default r;
