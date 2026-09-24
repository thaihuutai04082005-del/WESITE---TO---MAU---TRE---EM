// Thao tác trên SVG tranh: áp màu cho vùng, lớp lấp lánh, dựng SVG hoàn chỉnh để xem trước / xuất ảnh.
import { stickersMarkup } from './stickers';

export const EMPTY_DATA = () => ({ fills: {}, strokes: [], stickers: [], glitter: [] });
export const WHITE = '#FFFFFF';

const GLITTER_DEFS = `<defs id="btm-defs"><pattern id="btm-glitter" width="36" height="36" patternUnits="userSpaceOnUse">
<rect width="36" height="36" fill="#FFFFFF" fill-opacity="0.12"/>
<polygon points="8,2 10,7 15,8 10,9 8,14 6,9 1,8 6,7" fill="#FFFFFF"/>
<polygon points="26,18 27.5,22 31,23 27.5,24 26,28 24.5,24 21,23 24.5,22" fill="#FFF7C2"/>
<circle cx="24" cy="6" r="1.6" fill="#FFFFFF"/><circle cx="8" cy="28" r="1.4" fill="#FFFFFF"/><circle cx="18" cy="15" r="1" fill="#FFFFFF"/>
</pattern></defs>`;

/** Áp màu & lấp lánh lên 1 phần tử <svg> (DOM thật hoặc tài liệu parse). */
export function applyToSvg(svgEl, fills = {}, glitter = []) {
  if (!svgEl.querySelector('#btm-defs')) {
    const tmp = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${GLITTER_DEFS}</svg>`, 'image/svg+xml');
    svgEl.insertBefore(svgEl.ownerDocument.importNode(tmp.documentElement.firstElementChild, true), svgEl.firstChild);
  }
  svgEl.querySelectorAll('.glitter-overlay').forEach((n) => n.remove());
  const glitterSet = new Set(glitter);
  svgEl.querySelectorAll('[data-region]').forEach((el) => {
    const id = el.getAttribute('data-region');
    el.setAttribute('fill', fills[id] || WHITE);
    if (glitterSet.has(id) && fills[id]) {
      const g = el.cloneNode(false);
      g.removeAttribute('id');
      g.removeAttribute('data-region');
      g.setAttribute('class', 'glitter-overlay');
      g.setAttribute('fill', 'url(#btm-glitter)');
      g.setAttribute('stroke', 'none');
      g.setAttribute('pointer-events', 'none');
      el.after(g);
    }
  });
}

/** SVG tranh đã tô (chưa gồm nét Brush — lớp canvas riêng). `withStickers` thêm sticker lên trên cùng. */
export function coloredSvgString(pictureSvg, data, { withStickers = false } = {}) {
  const doc = new DOMParser().parseFromString(pictureSvg, 'image/svg+xml');
  const svg = doc.documentElement;
  applyToSvg(svg, data?.fills, data?.glitter);
  if (withStickers && data?.stickers?.length) {
    const tmp = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg"><g class="stickers">${stickersMarkup(data.stickers)}</g></svg>`, 'image/svg+xml');
    svg.appendChild(doc.importNode(tmp.documentElement.firstElementChild, true));
  }
  svg.setAttribute('width', '600');
  svg.setAttribute('height', '600');
  return new XMLSerializer().serializeToString(svg);
}

/** Tô bằng màu gợi ý (tranh mẫu / ảnh minh hoạ ở các tầng chọn tranh). */
export function referenceFills(picture) {
  return Object.fromEntries((picture.regions || []).map((r) => [r.id, r.color]));
}

/** Vùng chưa tô / tô khác màu gợi ý (dùng cho gợi ý số ở chế độ Theo mẫu). */
export function isRegionDone(region, fills) {
  return (fills[region.id] || '').toUpperCase() === region.color.toUpperCase();
}

export function progressOf(picture, fills) {
  const regions = picture.regions || [];
  const total = regions.reduce((s, r) => s + Math.max(r.area, 1), 0);
  const done = regions.reduce((s, r) => s + (fills[r.id] ? Math.max(r.area, 1) : 0), 0);
  return total ? done / total : 0;
}
