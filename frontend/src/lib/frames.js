// Hai lớp khung trang trí (Mục 8.5):
// - Khung Artwork (mua bằng Ruby): bao quanh tranh khi tải về / in. Khung 700×700, tranh đặt tại (50, 50, 600, 600).
// - Khung Avatar (mở theo Rank): vòng trang trí quanh ảnh đại diện, khung 120×120, avatar tròn bán kính 46 ở giữa.
const INK = '#1B2A38';

function starPts(cx, cy, ro, ri, n = 5) {
  return Array.from({ length: n * 2 }, (_, k) => {
    const r = k % 2 ? ri : ro;
    const a = ((-90 + (k * 180) / n) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

const border = (fill, extra = '') =>
  `<path fill-rule="evenodd" d="M0 0 H700 V700 H0 Z M50 50 V650 H650 V50 Z" fill="${fill}" ${extra}/>` +
  `<rect x="50" y="50" width="600" height="600" fill="none" stroke="${INK}" stroke-width="4"/>` +
  `<rect x="2" y="2" width="696" height="696" rx="18" fill="none" stroke="${INK}" stroke-width="4"/>`;

// Vị trí dọc theo viền để rải hoạ tiết.
const alongBorder = (step = 100) => {
  const pts = [];
  for (let v = 25; v <= 675; v += step) pts.push([v, 25], [v, 675], [25, v], [675, v]);
  return pts;
};

export const ARTWORK_FRAMES = {
  'khung-go': () =>
    border('#B5651D') +
    Array.from({ length: 12 }, (_, i) => `<path d="M${10 + i * 58} 12 q20 14 40 0" fill="none" stroke="#8B4A12" stroke-width="3"/>`).join('') +
    Array.from({ length: 12 }, (_, i) => `<path d="M${10 + i * 58} 688 q20 -14 40 0" fill="none" stroke="#8B4A12" stroke-width="3"/>`).join(''),
  'khung-hoa': () =>
    border('#FFD1E1') +
    alongBorder(100)
      .map(([x, y], i) => {
        const c = ['#FF7AA2', '#FF9F43', '#7D5FFF', '#4FA3E0'][i % 4];
        return [0, 72, 144, 216, 288].map((a) => `<circle cx="${x + 11 * Math.cos(((a - 90) * Math.PI) / 180)}" cy="${y + 11 * Math.sin(((a - 90) * Math.PI) / 180)}" r="8" fill="${c}" stroke="${INK}" stroke-width="2"/>`).join('') + `<circle cx="${x}" cy="${y}" r="6" fill="#FFD54F" stroke="${INK}" stroke-width="2"/>`;
      })
      .join(''),
  'khung-may': () =>
    border('#BDE6FF') +
    alongBorder(117)
      .map(([x, y]) => `<path d="M${x - 20} ${y + 8} q-10 0 -6 -10 q0 -12 14 -10 q6 -12 20 -6 q14 -2 12 12 q10 4 2 14 z" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`)
      .join(''),
  'khung-sao': () =>
    border('#2C3E74') + alongBorder(65).map(([x, y], i) => `<polygon points="${starPts(x, y, i % 2 ? 11 : 16, i % 2 ? 5 : 7)}" fill="#FFE066" stroke="${INK}" stroke-width="1.5"/>`).join(''),
  'khung-bien': () =>
    border('#5DADE2') +
    Array.from({ length: 14 }, (_, i) => `<path d="M${i * 50} 30 q12 -16 25 0 t25 0 M${i * 50} 670 q12 -16 25 0 t25 0 M30 ${i * 50} q-16 12 0 25 t0 25 M670 ${i * 50} q-16 12 0 25 t0 25" fill="none" stroke="#FFFFFF" stroke-width="4"/>`).join('') +
    [[25, 25], [675, 25], [25, 675], [675, 675]].map(([x, y]) => `<path d="M${x - 16} ${y + 10} Q${x} ${y - 24} ${x + 16} ${y + 10} Z" fill="#FFB3C1" stroke="${INK}" stroke-width="2"/>`).join(''),
  'khung-hoang-gia': () =>
    '<defs><linearGradient id="kg-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE57F"/><stop offset=".5" stop-color="#E6B422"/><stop offset="1" stop-color="#FFF3B0"/></linearGradient></defs>' +
    border('url(#kg-gold)') +
    [[25, 25], [675, 25], [25, 675], [675, 675]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#FF5F7E" stroke="${INK}" stroke-width="3"/>`).join('') +
    alongBorder(100).map(([x, y]) => `<polygon points="${x},${y - 10} ${x + 8},${y} ${x},${y + 10} ${x - 8},${y}" fill="#4FA3E0" stroke="${INK}" stroke-width="2"/>`).join(''),
  'khung-cau-vong': () =>
    '<defs><linearGradient id="kg-rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF5F5F"/><stop offset=".2" stop-color="#FF9F43"/><stop offset=".4" stop-color="#FFD54F"/><stop offset=".6" stop-color="#4CD787"/><stop offset=".8" stop-color="#4FA3E0"/><stop offset="1" stop-color="#7D5FFF"/></linearGradient></defs>' +
    border('url(#kg-rb)') +
    alongBorder(80).map(([x, y]) => `<polygon points="${starPts(x, y, 10, 3, 4)}" fill="#FFFFFF"/>`).join(''),
  'khung-kim-cuong': () =>
    '<defs><linearGradient id="kg-dia" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E0FBFF"/><stop offset=".5" stop-color="#7DE2FF"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient></defs>' +
    border('url(#kg-dia)') +
    alongBorder(58).map(([x, y]) => `<polygon points="${x},${y - 14} ${x + 12},${y - 3} ${x},${y + 14} ${x - 12},${y - 3}" fill="#B9F2FF" stroke="#2B9BF4" stroke-width="2"/><path d="M${x - 12} ${y - 3} H${x + 12}" stroke="#2B9BF4" stroke-width="1.5"/>`).join(''),
};

export const artworkFrameSvg = (slug) =>
  ARTWORK_FRAMES[slug] ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="700" height="700">${ARTWORK_FRAMES[slug]()}</svg>` : null;

export const AVATAR_FRAMES = {
  'avatar-dong': () => `<circle cx="60" cy="60" r="52" fill="none" stroke="#B08D57" stroke-width="8"/>`,
  'avatar-bac': () =>
    `<circle cx="60" cy="60" r="52" fill="none" stroke="#C0C0C0" stroke-width="9"/><circle cx="60" cy="60" r="52" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4 10"/>` +
    [0, 120, 240].map((a) => `<polygon points="${starPts(60 + 54 * Math.cos(((a - 90) * Math.PI) / 180), 60 + 54 * Math.sin(((a - 90) * Math.PI) / 180), 9, 4)}" fill="#E8E8E8" stroke="${INK}" stroke-width="1.5"/>`).join(''),
  'avatar-vang': () =>
    `<circle cx="60" cy="60" r="52" fill="none" stroke="#FFD700" stroke-width="10"/><polygon points="40,14 44,0 52,10 60,-2 68,10 76,0 80,14" fill="#FFD700" stroke="${INK}" stroke-width="2" transform="translate(0 6)"/>`,
  'avatar-bach-kim': () =>
    `<circle cx="60" cy="60" r="52" fill="none" stroke="#B9F2FF" stroke-width="10"/><circle cx="60" cy="60" r="57" fill="none" stroke="#7DB9C9" stroke-width="2"/>` +
    `<path d="M8 60 q-8 -16 4 -30 q2 14 10 18 z M112 60 q8 -16 -4 -30 q-2 14 -10 18 z" fill="#E0FBFF" stroke="${INK}" stroke-width="2"/>`,
  'avatar-kim-cuong': () =>
    `<defs><linearGradient id="av-dia" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E0FBFF"/><stop offset="1" stop-color="#2B9BF4"/></linearGradient></defs><circle cx="60" cy="60" r="52" fill="none" stroke="url(#av-dia)" stroke-width="11"/>` +
    [0, 72, 144, 216, 288].map((a) => { const x = 60 + 53 * Math.cos(((a - 90) * Math.PI) / 180); const y = 60 + 53 * Math.sin(((a - 90) * Math.PI) / 180); return `<polygon points="${x},${y - 9} ${x + 7},${y - 2} ${x},${y + 9} ${x - 7},${y - 2}" fill="#7DE2FF" stroke="${INK}" stroke-width="1.5"/>`; }).join(''),
};
