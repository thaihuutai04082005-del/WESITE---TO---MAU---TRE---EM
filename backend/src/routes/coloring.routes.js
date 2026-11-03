// Nội dung tranh + lưu/tải tiến trình tô.
import { Router } from 'express';
import * as pic from '../controllers/picture.controller.js';
import * as art from '../controllers/artwork.controller.js';
import { requireAuth, requireNickname, optionalAuth } from '../middlewares/auth.js';

const r = Router();

r.get('/themes', optionalAuth, pic.themes);
r.get('/themes/:theme/pictures', optionalAuth, pic.themePictures);
r.get('/themes/:theme/objects', optionalAuth, pic.objects);
r.get('/themes/:theme/objects/:object/pictures', optionalAuth, pic.pictures);
r.get('/pictures/:id', requireAuth, pic.picture);

r.get('/artworks', requireAuth, art.list);
r.post('/artworks', requireAuth, requireNickname, art.create);
r.get('/artworks/:id', requireAuth, art.get);
r.post('/artworks/:id/start', requireAuth, art.start);
r.put('/artworks/:id', requireAuth, art.save);
r.delete('/artworks/:id', requireAuth, art.remove);
r.post('/artworks/:id/download', requireAuth, art.download);
r.put('/artworks/:id/frame', requireAuth, art.setFrame);

export default r;
