import { Router } from 'express';
import { progression } from '../controllers/progression.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.get('/', requireAuth, progression);
export default r;
