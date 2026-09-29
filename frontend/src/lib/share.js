// Khoe & chia sẻ (Đợt 3): ảnh "Khoe tranh" (khổ dọc 1080×1350 hợp Zalo/Facebook) và giấy khen PDF.
import { api, request } from '../services/api';
import { renderArtwork } from './exportImage';
import { REACTIONS, boardMeta } from './exhibition';

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxW, size, weight = 800, family = "'Viet Hook', 'Baloo 2', Nunito, sans-serif") {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    s -= 2;
  } while (ctx.measureText(text).width > maxW && s > 18);
}

/**
 * @param {{ picture, data, title, nickname, entry?, labels: { brand, by, award, reactions }, frameColor? }} o
 * @returns {Promise<string>} data URL PNG
 */
export async function renderShareCard({ picture, data, title, nickname, entry = null, labels }) {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  await document.fonts?.ready;

  // Nền pastel + chấm màu
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#FFF3D6');
  bg.addColorStop(0.5, '#FFF9EE');
  bg.addColorStop(1, '#EAF6FF');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const dots = ['#FF7AA2', '#FFD54F', '#4FA3E0', '#4CD787', '#7D5FFF'];
  // Chấm trang trí chỉ nằm sát 2 mép trái/phải để không đè lên chữ.
  for (let i = 0; i < 16; i++) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = dots[i % dots.length];
    ctx.beginPath();
    ctx.arc(i % 2 ? W - 30 - ((i * 13) % 30) : 30 + ((i * 11) % 30), 180 + ((i * 151) % (H - 260)), 10 + ((i * 7) % 14), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Khung tranh
  const frame = entry ? boardMeta(entry.board) : { frame: '#2B9BF4', frameLight: '#EAF6FF' };
  const size = 820;
  const x = (W - size) / 2;
  const y = 150;
  const g = ctx.createLinearGradient(x, y, x + size, y + size);
  g.addColorStop(0, frame.frame);
  g.addColorStop(0.45, frame.frameLight);
  g.addColorStop(1, frame.frame);
  ctx.shadowColor = 'rgba(27,42,56,0.18)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, x - 26, y - 26, size + 52, size + 52, 28);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - 8, y - 8, size + 16, size + 16);
  const art = await loadImage(await renderArtwork(picture, data, { size }));
  ctx.drawImage(art, x, y, size, size);

  // Ruy băng danh hiệu
  if (entry?.award) {
    const text = `🏆 ${labels.award}`;
    ctx.font = "800 38px 'Viet Hook', 'Baloo 2', Nunito, sans-serif";
    const w = ctx.measureText(text).width + 60;
    roundRect(ctx, W - w - 40, 70, w, 70, 35);
    ctx.fillStyle = '#FF8A65';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W - w / 2 - 40, 106);
  }

  // Thương hiệu
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2B9BF4';
  ctx.font = "800 44px 'Viet Hook', 'Baloo 2', Nunito, sans-serif";
  ctx.fillText(`🎨 ${labels.brand}`, 50, 76);

  // Tên tranh + tác giả
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1B2A38';
  fitText(ctx, title, W - 120, 64);
  ctx.fillText(title, W / 2, y + size + 90);
  ctx.fillStyle = '#5E7A8C';
  fitText(ctx, `${labels.by} ${nickname}`, W - 120, 40, 700, 'Nunito, sans-serif');
  ctx.fillText(`${labels.by} ${nickname}`, W / 2, y + size + 150);

  // Bảng cảm xúc
  if (entry && entry.total > 0) {
    const parts = REACTIONS.filter((r) => entry.reactions[r.key]).map((r) => `${r.emoji} ${entry.reactions[r.key]}`);
    ctx.font = "700 40px Nunito, sans-serif";
    const text = parts.join('   ');
    const w = ctx.measureText(text).width + 70;
    roundRect(ctx, (W - w) / 2, y + size + 190, w, 72, 36);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.fillStyle = '#1B2A38';
    ctx.fillText(text, W / 2, y + size + 227);
  }
  return c.toDataURL('image/png');
}

/** Chia sẻ qua ứng dụng trên điện thoại (Zalo, Facebook…) nếu trình duyệt hỗ trợ; không thì tải ảnh về. */
export async function shareOrDownload(dataUrl, filename, title) {
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return 'downloaded';
}

/** Giấy khen PDF: vẽ tranh từ dữ liệu tô rồi nhờ máy chủ dựng trang giấy khen. */
export async function downloadCertificate(entryId, artworkId, lang, filename = 'giay-khen.pdf') {
  const d = await api.get(`/artworks/${artworkId}`);
  const image = await renderArtwork(d.picture, d.artwork.data, { size: 900 });
  const res = await request('POST', `/exhibition/entries/${entryId}/certificate`, { image, lang }, { raw: true });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
