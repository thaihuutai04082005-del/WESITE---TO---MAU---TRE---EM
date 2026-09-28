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

/** Vương miện đặt trên đỉnh khung avatar: `w` rộng, `h` cao, `peaks` số chóp, `fill` màu, `gems` màu đá. */
function crown({ w, h, peaks, fill, stroke = INK, gems = [], tip = null, y = 8 }) {
  const x0 = 60 - w / 2;
  const base = y;
  const top = y - h;
  const pts = [[x0, base]];
  for (let k = 0; k <= peaks * 2; k++) {
    const x = x0 + (w * k) / (peaks * 2);
    pts.push([x, k % 2 === 0 ? top : top + h * 0.55]);
  }
  pts.push([x0 + w, base]);
  const band = `<rect x="${x0}" y="${base - 2}" width="${w}" height="${Math.max(5, h * 0.28)}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>`;
  const body = `<polygon points="${pts.map((q) => q.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  const tips = tip ? Array.from({ length: peaks + 1 }, (_, k) => `<circle cx="${x0 + (w * k) / peaks}" cy="${top}" r="${Math.max(2, w / 26)}" fill="${tip}" stroke="${stroke}" stroke-width="1.2"/>`).join('') : '';
  const gem = gems.map((c, k) => `<circle cx="${x0 + (w * (k + 1)) / (gems.length + 1)}" cy="${base + 0.5}" r="${Math.max(2.2, w / 18)}" fill="${c}" stroke="${stroke}" stroke-width="1.2"/>`).join('');
  return body + band + tips + gem;
}
const sparkle = (x, y, r, c) => `<path d="M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z" fill="${c}"/>`;
const around = (n, r, off = -90) => Array.from({ length: n }, (_, k) => { const a = ((off + (k * 360) / n) * Math.PI) / 180; return [60 + r * Math.cos(a), 60 + r * Math.sin(a)]; });

// Khung Avatar theo Rank — chủ đề hội họa, càng lên cao càng hoành tráng:
// Mầm Non Tô Màu → Họa Sĩ Nhí (chấm màu) → Họa Sĩ Tài Năng (vệt sơn, chưa có vương miện)
// → Nghệ Sĩ Sáng Tạo (vương miện nhỏ) → Danh Họa (góc khung tranh + vương miện lớn đính đá)
// → Bậc Thầy Hội Họa (vòng cầu vồng, cánh vệt sơn, vương miện hoàng gia).
const splat = (x, y, r, c) => `<path d="M${x} ${y - r} q${r * 0.5} ${r * 0.4} ${r} ${r * 0.3} q-${r * 0.4} ${r * 0.5} -${r * 0.1} ${r} q-${r * 0.5} -${r * 0.3} -${r * 0.9} ${r * 0.2} q${r * 0.1} -${r * 0.6} -${r * 0.5} -${r * 0.9} q${r * 0.6} 0 ${r * 0.5} -${r * 0.6} z" fill="${c}"/>`;
const RAINBOW = ['#FF5F5F', '#FF9F43', '#FFD54F', '#4CD787', '#4FA3E0', '#7D5FFF'];

export const AVATAR_FRAMES = {
  // Hạt Giống Tô Màu: vòng xanh lá nhạt + chồi 2 lá nhú ở đỉnh.
  'avatar-hat-giong': () =>
    `<circle cx="60" cy="60" r="52" fill="none" stroke="#A8DDB0" stroke-width="7"/>` +
    `<path d="M60 12 Q60 6 61 1" fill="none" stroke="#3E9B52" stroke-width="2.6" stroke-linecap="round"/>` +
    `<path d="M60 5 Q48 -2 44 8 Q54 12 60 5 Z" fill="#6CC57C" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<path d="M61 3 Q74 -4 77 7 Q67 11 61 3 Z" fill="#8EDB9A" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`,
  // Mầm Non Tô Màu: vòng màu đồng.
  'avatar-dong': () =>
    `<circle cx="60" cy="60" r="52" fill="none" stroke="#B08D57" stroke-width="8"/>`,
  // Họa Sĩ Nhí: vòng bạc có chấm màu.
  'avatar-bac': () =>
    `<circle cx="60" cy="60" r="52" fill="none" stroke="#C0C0C0" stroke-width="9"/>` +
    around(8, 52, -67.5).map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="2.3" fill="${RAINBOW[k % 6]}"/>`).join(''),
  // Họa Sĩ Tài Năng: vòng vàng + vệt sơn nhiều màu — CHƯA có vương miện.
  'avatar-vang': () =>
    `<circle cx="60" cy="60" r="52" fill="none" stroke="#FFD700" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="#FFF3B0" stroke-width="2.5"/>` +
    splat(14, 30, 7, '#FF7AA2') + splat(106, 28, 6, '#4FA3E0') + splat(8, 78, 6, '#4CD787') + splat(112, 80, 7, '#7D5FFF'),
  // Nghệ Sĩ Sáng Tạo: vòng bạch kim + vệt sơn + vương miện nhỏ.
  'avatar-bach-kim': () =>
    `<defs><linearGradient id="av-pt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FCFF"/><stop offset="1" stop-color="#8FCFE0"/></linearGradient></defs>` +
    `<circle cx="60" cy="60" r="52" fill="none" stroke="url(#av-pt)" stroke-width="10"/><circle cx="60" cy="60" r="57" fill="none" stroke="#7DB9C9" stroke-width="2"/>` +
    splat(10, 70, 6, '#FF9EC0') + splat(110, 70, 6, '#7DE2FF') +
    crown({ w: 36, h: 17, peaks: 3, fill: '#C9E4EE', gems: ['#7DE2FF'], tip: '#FFFFFF', y: 9 }),
  // Danh Họa: khung tranh mạ vàng (4 góc hoa văn) quanh vòng pha lê + vương miện lớn đính đá + lấp lánh.
  'avatar-kim-cuong': () =>
    `<defs><linearGradient id="av-dia" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E0FBFF"/><stop offset=".5" stop-color="#7DE2FF"/><stop offset="1" stop-color="#2B9BF4"/></linearGradient>` +
    `<linearGradient id="av-dia-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0FBFF"/><stop offset="1" stop-color="#5FC3F2"/></linearGradient></defs>` +
    [[4, 4, 0], [116, 4, 90], [116, 116, 180], [4, 116, 270]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 0 H22 Q10 4 8 8 Q4 10 0 22 Z" fill="#FFD54F" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`).join('') +
    `<circle cx="60" cy="60" r="52" fill="none" stroke="url(#av-dia)" stroke-width="12"/><circle cx="60" cy="60" r="58.5" fill="none" stroke="#2B9BF4" stroke-width="1.8"/>` +
    around(6, 52, -60).map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${RAINBOW[k]}" stroke="${INK}" stroke-width="1"/>`).join('') +
    crown({ w: 50, h: 22, peaks: 3, fill: 'url(#av-dia-c)', gems: ['#FF5F7E', '#FFD54F', '#FF5F7E'], tip: '#FFFFFF', y: 10 }) +
    sparkle(26, 4, 5, '#7DE2FF') + sparkle(96, 2, 4.5, '#FFD54F'),
  // Bậc Thầy Hội Họa: vòng cầu vồng 2 lớp, 2 cánh là vệt sơn cầu vồng,
  // vương miện hoàng gia 5 chóp đính ngọc, lấp lánh — hoành tráng nhất.
  'avatar-cao-thu': () =>
    `<defs><linearGradient id="av-rb" x1="0" y1="0" x2="1" y2="1">${RAINBOW.map((c, k) => `<stop offset="${k / 5}" stop-color="${c}"/>`).join('')}</linearGradient>` +
    `<linearGradient id="av-master-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".6" stop-color="#FFC61A"/><stop offset="1" stop-color="#E09A00"/></linearGradient></defs>` +
    [-1, 1].map((d) => RAINBOW.slice(0, 5).map((c, k) => { const x = d < 0 ? 8 - k * 3.2 : 112 + k * 3.2; return `<path d="M${60 + d * 52} ${34 + k * 4} Q${x + d * 14} ${50 + k * 4} ${x} ${88 - k * 2}" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`; }).join('')).join('') +
    `<circle cx="60" cy="60" r="52" fill="none" stroke="url(#av-rb)" stroke-width="12"/><circle cx="60" cy="60" r="59" fill="none" stroke="#FFC61A" stroke-width="2.5" stroke-dasharray="2 5"/>` +
    around(8, 52, -67.5).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#FFFFFF" stroke="${INK}" stroke-width="1"/>`).join('') +
    crown({ w: 66, h: 30, peaks: 4, fill: 'url(#av-master-c)', gems: ['#4CD787', '#FF5F7E', '#2B9BF4', '#FF5F7E', '#4CD787'], tip: '#FFFFFF', y: 11 }) +
    sparkle(18, -2, 6, '#FFD54F') + sparkle(104, -4, 6.5, '#FF9EC0') + sparkle(60, -26, 5, '#FFF3B0') + sparkle(2, 30, 4, '#FFD54F') + sparkle(118, 30, 4, '#7DE2FF'),
};


