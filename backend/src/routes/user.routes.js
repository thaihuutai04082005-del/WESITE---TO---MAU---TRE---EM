import { Router } from 'express';
import * as c from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.put('/me', requireAuth, c.updateMe);
r.get('/me/notifications', requireAuth, c.notifications);
r.post('/me/notifications/read', requireAuth, c.readNotifications);
export default r;
