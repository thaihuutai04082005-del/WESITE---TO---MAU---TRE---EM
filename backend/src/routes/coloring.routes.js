// Nội dung tranh + lưu/tải tiến trình tô.
import { Router } from 'express';
import * as pic from '../controllers/picture.controller.js';
import * as art from '../controllers/artwork.controller.js';
import { optionalAuth, requireAuth, requireNickname } from '../middlewares/auth.js';

const r = Router();

r.get('/themes', pic.themes);
r.get('/themes/:theme/pictures', pic.themePictures);
r.get('/themes/:theme/objects', pic.objects);
r.get('/themes/:theme/objects/:object/pictures', pic.pictures);
r.get('/pictures/:id/thumb.webp', pic.thumb);
r.get('/pictures/:id/thumb-blank.webp', pic.thumb);
r.get('/pictures/:id', optionalAuth, pic.picture); // tranh thường ai cũng xem được (trang giới thiệu); thẻ vẫn phải sở hữu

r.get('/artworks', requireAuth, art.list);
r.post('/artworks', requireAuth, requireNickname, art.create);
r.get('/artworks/:id', requireAuth, art.get);
r.post('/artworks/:id/start', requireAuth, art.start);
r.put('/artworks/:id', requireAuth, art.save);
r.delete('/artworks/:id', requireAuth, art.remove);
r.post('/artworks/:id/download', requireAuth, art.download);
r.put('/artworks/:id/frame', requireAuth, art.setFrame);

export default r;
