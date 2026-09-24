// Xuất cuốn truyện Flipbook ra PDF (Mục 10.2). Mỗi trang: tranh bé tô + lời thoại/chú thích.
import PDFDocument from 'pdfkit';
import { join } from 'node:path';
import { BACKEND_ROOT } from '../config/env.js';

const FONT_BODY = join(BACKEND_ROOT, 'assets', 'fonts', 'Nunito-var.ttf');
const FONT_TITLE = join(BACKEND_ROOT, 'assets', 'fonts', 'Baloo2-var.ttf');

function dataUrlToBuffer(url) {
  const m = /^data:image\/(png|jpeg);base64,(.+)$/.exec(url || '');
  return m ? Buffer.from(m[2], 'base64') : null;
}

/**
 * @param {{ title: string, author: string, pages: { image: string|null, caption: string }[] }} book
 * @returns {Promise<Buffer>}
 */
export function storybookPdf(book) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36, info: { Title: book.title, Author: book.author } });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.registerFont('body', FONT_BODY);
    doc.registerFont('title', FONT_TITLE);
    const W = doc.page.width;
    const H = doc.page.height;

    // Bìa
    doc.rect(0, 0, W, H).fill('#EAF6FF');
    doc.roundedRect(40, 40, W - 80, H - 80, 24).lineWidth(4).stroke('#2B9BF4');
    doc.fillColor('#1B2A38').font('title').fontSize(44).text(book.title, 60, H / 2 - 70, { width: W - 120, align: 'center' });
    doc.font('body').fontSize(20).fillColor('#5E7A8C').text(book.author, 60, H / 2 + 10, { width: W - 120, align: 'center' });

    book.pages.forEach((p, i) => {
      doc.addPage();
      doc.rect(0, 0, W, H).fill('#FFFFFF');
      const img = dataUrlToBuffer(p.image);
      const size = H - 150;
      const x = (W - size) / 2;
      let drawn = false;
      if (img) {
        try {
          doc.image(img, x, 36, { fit: [size, size], align: 'center' });
          drawn = true;
        } catch {
          /* ảnh hỏng → vẽ khung trống */
        }
      }
      if (!drawn) doc.roundedRect(x, 36, size, size, 16).stroke('#D6EAF8');
      doc.font('body').fontSize(18).fillColor('#1B2A38').text(p.caption || '', 60, H - 100, { width: W - 120, align: 'center' });
      doc.fontSize(11).fillColor('#5E7A8C').text(`${i + 1}`, W - 60, H - 40);
    });
    doc.end();
  });
}
