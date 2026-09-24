// Xuất tranh thành PNG (Mục 4.4): lớp vùng SVG + lớp Brush + sticker + Khung Artwork (tuỳ chọn). In trực tiếp.
import { coloredSvgString } from './picture';
import { drawStrokes } from './brush';
import { stickersMarkup } from './stickers';
import { artworkFrameSvg } from './frames';

function loadSvg(svgString) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('svg_load_failed'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  });
}

/**
 * @param {{ svg: string }} picture
 * @param {{ fills, strokes, stickers, glitter }} data
 * @param {{ size?: number, frame?: string|null, type?: string, quality?: number }} opts
 * @returns {Promise<string>} data URL
 */
export async function renderArtwork(picture, data, { size = 1200, frame = null, type = 'image/png', quality } = {}) {
  const frameSvg = frame ? artworkFrameSvg(frame) : null;
  const total = frameSvg ? Math.round((size * 700) / 600) : size;
  const off = frameSvg ? Math.round((size * 50) / 600) : 0;
  const canvas = document.createElement('canvas');
  canvas.width = total;
  canvas.height = total;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, total, total);

  const base = await loadSvg(coloredSvgString(picture.svg, data));
  ctx.drawImage(base, off, off, size, size);

  if (data?.strokes?.length) {
    const layer = document.createElement('canvas');
    layer.width = size;
    layer.height = size;
    drawStrokes(layer.getContext('2d'), data.strokes, size / 600);
    ctx.drawImage(layer, off, off);
  }
  if (data?.stickers?.length) {
    const st = await loadSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${stickersMarkup(data.stickers)}</svg>`);
    ctx.drawImage(st, off, off, size, size);
  }
  if (frameSvg) ctx.drawImage(await loadSvg(frameSvg), 0, 0, total, total);
  return canvas.toDataURL(type, quality);
}

/** Ảnh thu nhỏ lưu kèm tranh (Lịch sử, Flipbook, Đấu trường). */
export const renderThumbnail = (picture, data) => renderArtwork(picture, data, { size: 480, type: 'image/png' });

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function printDataUrl(dataUrl, title = '') {
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<!doctype html><html><head><title>${title.replace(/</g, '')}</title><style>@page{margin:10mm}html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100%}</style></head><body><img src="${dataUrl}"/></body></html>`);
  doc.close();
  const img = doc.querySelector('img');
  const go = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1000);
  };
  if (img.complete) go();
  else img.onload = go;
}

export const safeFileName = (s) =>
  String(s || 'tranh')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'tranh';
