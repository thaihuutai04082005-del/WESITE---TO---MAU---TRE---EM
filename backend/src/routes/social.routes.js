import { Router } from 'express';
import * as c from '../controllers/social.controller.js';
import { requireAuth, requireNickname } from '../middlewares/auth.js';

const r = Router();
r.use(requireAuth, requireNickname);
r.get('/friends', c.friends);
r.post('/friends', c.addFriend);
r.post('/friends/:id/accept', c.acceptFriend);
r.delete('/friends/:id', c.removeFriend);
r.get('/friends/:userId/cards', c.friendCards);
r.get('/trades', c.trades);
r.post('/trades', c.createTrade);
r.post('/trades/:id/accept', c.acceptTrade);
r.post('/trades/:id/decline', c.declineTrade);
r.post('/trades/:id/cancel', c.cancelTrade);
export default r;
