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

function star(doc, cx, cy, r, color) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const rr = k % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * k - Math.PI / 2;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  doc.polygon(...pts).fill(color);
}

/**
 * Giấy khen "Tranh được yêu thích nhất" (Đợt 3 — Khoe & chia sẻ). A4 ngang: tranh bên trái, lời khen bên phải.
 * @param {{ heading, presents, nickname, line1, line2, board, line3, footer, image: string|null }} c  chữ đã dịch sẵn
 * @returns {Promise<Buffer>}
 */
export function certificatePdf(c) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, info: { Title: c.heading, Author: c.nickname } });
    const chunks = [];
    doc.on('data', (x) => chunks.push(x));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.registerFont('body', FONT_BODY);
    doc.registerFont('title', FONT_TITLE);
    const W = doc.page.width;
    const H = doc.page.height;
    const GOLD = '#D9A400';

    // Nền + viền vàng đôi + góc sao
    doc.rect(0, 0, W, H).fill('#FFFBEF');
    doc.roundedRect(18, 18, W - 36, H - 36, 18).lineWidth(8).stroke(GOLD);
    doc.roundedRect(34, 34, W - 68, H - 68, 12).lineWidth(2).stroke('#F2C94C');
    for (const [x, y] of [[34, 34], [W - 34, 34], [34, H - 34], [W - 34, H - 34]]) star(doc, x, y, 16, GOLD);
    for (let i = 0; i < 9; i++) star(doc, 120 + i * ((W - 240) / 8), 58, 5, i % 2 ? '#FF8A65' : '#4FA3E0');

    // Tranh bên trái, trong khung
    const size = 300;
    const ix = 70;
    const iy = (H - size) / 2 + 18;
    doc.roundedRect(ix - 12, iy - 12, size + 24, size + 24, 10).fill(GOLD);
    doc.rect(ix - 4, iy - 4, size + 8, size + 8).fill('#FFFFFF');
    const img = dataUrlToBuffer(c.image);
    let drawn = false;
    if (img) {
      try {
        doc.image(img, ix, iy, { fit: [size, size], align: 'center', valign: 'center' });
        drawn = true;
      } catch {
        /* ảnh hỏng → để khung trống */
      }
    }
    if (!drawn) doc.rect(ix, iy, size, size).fill('#EAF6FF');

    // Lời khen bên phải
    const tx = ix + size + 50;
    const tw = W - tx - 60;
    doc.fillColor('#B7791F').font('title').fontSize(46).text(c.heading, tx, 92, { width: tw, align: 'center' });
    doc.fillColor('#5E7A8C').font('body').fontSize(15).text(c.presents, tx, 160, { width: tw, align: 'center' });
    doc.fillColor('#1B2A38').font('title').fontSize(40).text(c.nickname, tx, 188, { width: tw, align: 'center' });
    doc.moveTo(tx + 40, 246).lineTo(tx + tw - 40, 246).lineWidth(1.5).stroke(GOLD);
    doc.fillColor('#1B2A38').font('body').fontSize(17).text(c.line1, tx, 262, { width: tw, align: 'center' });
    doc.fillColor('#E0662B').font('title').fontSize(26).text(c.line2, tx, 292, { width: tw, align: 'center' });
    doc.fillColor('#7D5FFF').font('title').fontSize(19).text(c.board, tx, 330, { width: tw, align: 'center' });
    doc.fillColor('#5E7A8C').font('body').fontSize(14).text(c.line3, tx, 366, { width: tw, align: 'center' });
    // Huy chương
    const mx = tx + tw / 2;
    doc.polygon([mx - 22, 440], [mx - 34, 492], [mx - 14, 482], [mx - 4, 500], [mx + 2, 446]).fill('#FF5F7E');
    doc.polygon([mx + 22, 440], [mx + 34, 492], [mx + 14, 482], [mx + 4, 500], [mx - 2, 446]).fill('#4FA3E0');
    doc.circle(mx, 430, 28).fill(GOLD);
    doc.circle(mx, 430, 21).fill('#FFE08A');
    star(doc, mx, 431, 15, GOLD);
    doc.fillColor('#8A9BA8').font('body').fontSize(11).text(c.footer, 40, H - 60, { width: W - 80, align: 'center' });
    doc.end();
  });
}
