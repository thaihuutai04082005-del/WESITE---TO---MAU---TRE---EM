// Sticker trang trí (Mục 4.5). Mỗi sticker vẽ trong khung 100×100, tâm (50, 50).
const S = '#1B2A38';

export const STICKERS = [
  { type: 'star', svg: `<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="#FFD54F" stroke="${S}" stroke-width="4" stroke-linejoin="round"/>` },
  { type: 'heart', svg: `<path d="M50 88 C10 62 4 36 22 22 C36 12 48 20 50 30 C52 20 64 12 78 22 C96 36 90 62 50 88 Z" fill="#FF5F7E" stroke="${S}" stroke-width="4" stroke-linejoin="round"/>` },
  { type: 'flower', svg: `${[0, 72, 144, 216, 288].map((a) => `<circle cx="${50 + 24 * Math.cos(((a - 90) * Math.PI) / 180)}" cy="${50 + 24 * Math.sin(((a - 90) * Math.PI) / 180)}" r="17" fill="#FF9EC0" stroke="${S}" stroke-width="4"/>`).join('')}<circle cx="50" cy="50" r="14" fill="#FFD54F" stroke="${S}" stroke-width="4"/>` },
  { type: 'sun', svg: `<polygon points="${Array.from({ length: 24 }, (_, k) => { const r = k % 2 ? 34 : 48; const a = (k * 15 * Math.PI) / 180; return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`; }).join(' ')}" fill="#FFB74D" stroke="${S}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="50" r="26" fill="#FFD54F" stroke="${S}" stroke-width="4"/><circle cx="42" cy="46" r="3" fill="${S}"/><circle cx="58" cy="46" r="3" fill="${S}"/><path d="M41 57 Q50 65 59 57" fill="none" stroke="${S}" stroke-width="3" stroke-linecap="round"/>` },
  { type: 'cloud', svg: `<path d="M20 72 Q4 72 8 56 Q6 40 24 40 Q28 20 48 24 Q62 10 76 28 Q96 28 92 50 Q100 72 80 72 Z" fill="#F0F4F8" stroke="${S}" stroke-width="4" stroke-linejoin="round"/>` },
  { type: 'rainbow', svg: `${['#FF5F5F', '#FFD54F', '#4CD787', '#4FA3E0'].map((c, k) => `<path d="M${8 + k * 9} 76 A ${42 - k * 9} ${42 - k * 9} 0 0 1 ${92 - k * 9} 76" fill="none" stroke="${c}" stroke-width="9"/>`).join('')}` },
  { type: 'butterfly', svg: `<ellipse cx="32" cy="38" rx="20" ry="24" transform="rotate(-25 32 38)" fill="#7D5FFF" stroke="${S}" stroke-width="4"/><ellipse cx="68" cy="38" rx="20" ry="24" transform="rotate(25 68 38)" fill="#7D5FFF" stroke="${S}" stroke-width="4"/><ellipse cx="36" cy="68" rx="13" ry="15" fill="#FF8A65" stroke="${S}" stroke-width="4"/><ellipse cx="64" cy="68" rx="13" ry="15" fill="#FF8A65" stroke="${S}" stroke-width="4"/><path d="M50 26 L50 84" stroke="${S}" stroke-width="7" stroke-linecap="round"/>` },
  { type: 'balloon', svg: `<path d="M50 70 Q46 84 54 96" fill="none" stroke="${S}" stroke-width="3"/><ellipse cx="50" cy="38" rx="28" ry="34" fill="#4FA3E0" stroke="${S}" stroke-width="4"/><polygon points="44,72 56,72 50,64" fill="#4FA3E0" stroke="${S}" stroke-width="3"/><ellipse cx="40" cy="26" rx="6" ry="10" fill="#FFFFFF" opacity="0.7"/>` },
  { type: 'crown', svg: `<polygon points="10,78 6,28 30,52 50,16 70,52 94,28 90,78" fill="#FFD700" stroke="${S}" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="60" r="8" fill="#FF5F7E" stroke="${S}" stroke-width="3"/><circle cx="26" cy="66" r="6" fill="#4FA3E0" stroke="${S}" stroke-width="3"/><circle cx="74" cy="66" r="6" fill="#4CD787" stroke="${S}" stroke-width="3"/>` },
  { type: 'music', svg: `<path d="M36 76 L36 22 L78 12 L78 64" fill="none" stroke="${S}" stroke-width="7" stroke-linejoin="round"/><ellipse cx="28" cy="78" rx="12" ry="9" fill="#7D5FFF" stroke="${S}" stroke-width="4"/><ellipse cx="70" cy="66" rx="12" ry="9" fill="#7D5FFF" stroke="${S}" stroke-width="4"/>` },
  { type: 'fish', svg: `<path d="M16 50 Q40 20 70 40 L92 24 L88 50 L92 76 L70 60 Q40 80 16 50 Z" fill="#FF9F43" stroke="${S}" stroke-width="4" stroke-linejoin="round"/><circle cx="34" cy="46" r="4" fill="${S}"/>` },
  { type: 'bow', svg: `<path d="M50 50 L14 26 L14 74 Z" fill="#FF7AA2" stroke="${S}" stroke-width="4" stroke-linejoin="round"/><path d="M50 50 L86 26 L86 74 Z" fill="#FF7AA2" stroke="${S}" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="50" r="11" fill="#FF5F7E" stroke="${S}" stroke-width="4"/>` },
];

export const stickerSvg = (type) => STICKERS.find((s) => s.type === type)?.svg || '';

/** Markup SVG cho danh sách sticker đặt trên tranh (hệ toạ độ 600×600). */
export function stickersMarkup(stickers) {
  return stickers
    .map((st) => `<g transform="translate(${st.x} ${st.y}) rotate(${st.rot || 0}) scale(${st.scale || 1})"><g transform="translate(-50 -50)">${stickerSvg(st.type)}</g></g>`)
    .join('');
}
