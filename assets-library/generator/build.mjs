// Chạy: node assets-library/generator/build.mjs
// Sinh toàn bộ tranh SVG theo cấu trúc 3 tầng + file catalog.json (manifest vùng tô).
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGACY_OBJECTS, LEGACY_THEMES } from './objects.mjs';
import { THEMES, OBJECTS, THEME_VARIANTS, CARD_ART } from './themes.mjs';
import { OBJECT_VARIANTS } from './object-variants.mjs';
import { buildBackground } from './backgrounds.mjs';
import { bgFor, checkBgMap } from './bg-map.mjs';
import { SKY, GROUND, groundItem, sceneParts } from './variants.mjs';
import { face } from './face.mjs';
import { R, D, deco, skyStar } from './shapes.mjs';
import {
  applyGroupTransform,
  groupTransformAttr,
  bbox,
  pointInPoly,
  distToPolyEdge,
  flattenPath,
  polyArea,
  simplify,
  round1,
} from './geometry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STROKE = '#1B2A38';

function uniquify(items) {
  const seen = new Map();
  for (const it of items) {
    if (it.kind !== 'region') continue;
    const n = seen.get(it.id) || 0;
    seen.set(it.id, n + 1);
    if (n > 0) it.id = `${it.id}-${n + 1}`;
  }
}

function renderItems(items) {
  return items
    .map((it) => {
      if (it.dropped || (it.kind === 'deco' && !it.markup)) return '';
      if (it.kind === 'deco') return `<g class="deco" pointer-events="none">${it.markup}</g>`;
      // Vùng của tranh vẽ tay không có viền riêng: nét đen nằm ở lớp ảnh phía trên.
      const attrs = it.noStroke
        ? `id="r-${it.id}" data-region="${it.id}" class="region" fill="#FFFFFF" stroke="none"`
        : `id="r-${it.id}" data-region="${it.id}" class="region" fill="#FFFFFF" stroke="${STROKE}" stroke-width="3" stroke-linejoin="round"`;
      return it.svg(attrs);
    })
    .join('\n');
}

/**
 * Tính diện tích hiển thị (sau che khuất), vị trí đặt số và đa giác gọn cho từng vùng.
 * Vị trí số = ô lưới thuộc vùng xa ranh giới vùng khác nhất (distance transform trên bản đồ hiển thị),
 * nên số luôn nằm ở phần rộng nhất mà bé nhìn thấy được.
 */
function computeManifestRegions(regions) {
  const STEP = 5;
  const N = 600 / STEP;
  const boxes = regions.map((r) => bbox(r.worldPoly));
  const owner = new Int16Array(N * N).fill(-1);
  const counts = new Array(regions.length).fill(0);
  for (let gy = 0; gy < N; gy++) {
    for (let gx = 0; gx < N; gx++) {
      const x = gx * STEP + STEP / 2;
      const y = gy * STEP + STEP / 2;
      for (let k = regions.length - 1; k >= 0; k--) {
        const b = boxes[k];
        if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
        if (!pointInPoly(x, y, regions[k].worldPoly)) continue;
        owner[gy * N + gx] = k;
        counts[k]++;
        break;
      }
    }
  }
  // Khoảng cách (theo ô) tới ô thuộc vùng khác hoặc mép tranh — BFS nhiều nguồn.
  const dist = new Float32Array(N * N).fill(Infinity);
  const queue = [];
  for (let gy = 0; gy < N; gy++) {
    for (let gx = 0; gx < N; gx++) {
      const i = gy * N + gx;
      const o = owner[i];
      const edge = gx === 0 || gy === 0 || gx === N - 1 || gy === N - 1;
      const boundary = edge || owner[i - 1] !== o || owner[i + 1] !== o || owner[i - N] !== o || owner[i + N] !== o;
      if (boundary) {
        dist[i] = 1;
        queue.push(i);
      }
    }
  }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    const gx = i % N;
    const gy = (i - gx) / N;
    for (const [dx, dy, w] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]]) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const j = ny * N + nx;
      if (owner[j] !== owner[i]) continue;
      if (dist[i] + w < dist[j]) {
        dist[j] = dist[i] + w;
        queue.push(j);
      }
    }
  }
  const best = regions.map(() => ({ d: -1, x: 0, y: 0 }));
  for (let i = 0; i < N * N; i++) {
    const k = owner[i];
    if (k < 0 || dist[i] <= best[k].d) continue;
    const gx = i % N;
    best[k] = { d: dist[i], x: gx * STEP + STEP / 2, y: ((i - gx) / N) * STEP + STEP / 2 };
  }
  return regions.map((r, k) => {
    const b = boxes[k];
    const label = best[k].d >= 0 ? [best[k].x, best[k].y] : [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    const clearance = best[k].d > 0 ? best[k].d * STEP : 6;
    return {
      id: r.id,
      color: r.color,
      area: counts[k] * STEP * STEP,
      shapeArea: Math.round(polyArea(r.worldPoly)),
      bbox: b.map(round1),
      label: label.map(round1),
      labelSize: Math.max(9, Math.min(26, Math.round(clearance * 1.2))),
      poly: simplify(r.worldPoly, 4).map(([x, y]) => [round1(x), round1(y)]),
    };
  });
}

// Tên đầy đủ tiếng Việt chỉ viết hoa chữ đầu ("Sư tử rực lửa"): phần tên kiểu viết thường,
// trừ tên riêng (Tết Nguyên Đán, Bắc Cực…) và chữ cái đứng một mình (tia X).
const KEEP_CASE = ['Tết Nguyên Đán', 'Bắc Cực'];
function lowerVi(text) {
  let out = text
    .split(' ')
    .map((w) => (w.length === 1 && w === w.toUpperCase() ? w : w.toLocaleLowerCase('vi')))
    .join(' ');
  for (const k of KEEP_CASE) out = out.replace(k.toLocaleLowerCase('vi'), k);
  return out;
}

/** Điểm mẫu dọc các nét dây/đường (không phải của chủ thể) để tránh đặt trang trí đè lên. */
function barrierPoints(all, subjectSet) {
  const pts = [];
  for (const it of all) if (it.kind === 'deco' && it.d && it.markup && !subjectSet.has(it)) pts.push(...pathPoints(it.d, 5));
  return pts;
}

/** Mây / mặt trời / trăng trang trí (optional) chạm vào hình khác hoặc dây → bỏ cả nhóm. */
function dropBlockedSkyDecor(all, sky, subjectSet, transform) {
  const opt = all.filter((it) => it.optional);
  if (!opt.length) return;
  const world = (it) => (subjectSet.has(it) ? applyGroupTransform(it.poly, transform) : it.poly);
  const solid = all.filter((it) => it.kind === 'region' && it !== sky && !it.optional && !it.movable).map((it) => ({ poly: world(it), box: bbox(world(it)) }));
  const lines = barrierPoints(all, subjectSet);
  const near = (a, b, pad) => a[0] <= b[2] + pad && a[2] >= b[0] - pad && a[1] <= b[3] + pad && a[3] >= b[1] - pad;
  const bad = new Set();
  for (const it of opt) {
    const poly = world(it), box = bbox(poly);
    const hitShape = solid.some((s) => near(box, s.box, 4) && (poly.some(([x, y]) => pointInPoly(x, y, s.poly)) || s.poly.some(([x, y]) => pointInPoly(x, y, poly))));
    const hitLine = lines.some(([x, y]) => x >= box[0] - 4 && x <= box[2] + 4 && y >= box[1] - 4 && y <= box[3] + 4 && (pointInPoly(x, y, poly) || distToPolyEdge(x, y, poly) < 4));
    if (hitShape || hitLine) bad.add(it.group || it.id);
  }
  for (const it of opt) if (bad.has(it.group || it.id)) it.dropped = true;
}

/**
 * Sao trang trí trên trời (skyStar) không được chạm vào hình khác (mây, trăng, núi, chủ thể…):
 * nếu chạm thì dời sang chỗ trống gần nhất ở nửa trên tranh.
 */
function unstickStars(all, sky, subjectSet, transform) {
  const world = (it) => (subjectSet.has(it) ? applyGroupTransform(it.poly, transform) : it.poly);
  const shapes = all.filter((it) => it.kind === 'region' && it !== sky && !it.dropped).map((it) => ({ it, poly: world(it), box: bbox(world(it)) }));
  const lines = barrierPoints(all, subjectSet);
  const PAD = 6;
  const hits = (self, x, y, r) => {
    const probe = [];
    for (let k = 0; k < 16; k++) probe.push([x + (r + PAD) * Math.cos((k * Math.PI) / 8), y + (r + PAD) * Math.sin((k * Math.PI) / 8)]);
    probe.push([x, y]);
    if (lines.some(([px, py]) => (px - x) ** 2 + (py - y) ** 2 < (r + PAD) ** 2)) return true;
    return shapes.some((s) => {
      if (s.it === self || s.box[0] > x + r + PAD || s.box[2] < x - r - PAD || s.box[1] > y + r + PAD || s.box[3] < y - r - PAD) return false;
      return probe.some(([px, py]) => pointInPoly(px, py, s.poly)) || s.poly.some(([px, py]) => (px - x) ** 2 + (py - y) ** 2 < (r + PAD) ** 2);
    });
  };
  for (let i = 0; i < all.length; i++) {
    const it = all[i];
    const m = it.movable;
    if (!m || !hits(it, m.cx, m.cy, m.rOuter)) continue;
    const spots = [];
    for (let y = 24; y <= 300; y += 12) for (let x = 24; x <= 576; x += 12) spots.push([x, y, (x - m.cx) ** 2 + (y - m.cy) ** 2]);
    spots.sort((a, b) => a[2] - b[2]);
    const free = spots.find(([x, y]) => !hits(it, x, y, m.rOuter));
    if (!free) continue;
    // Sửa tại chỗ để các mảng back/mid/front (dùng khi vẽ SVG) cũng nhận vị trí mới.
    Object.assign(it, skyStar(it.id, free[0], free[1], m.rOuter, m.rInner, it.color, m.n, m.rot));
    const s = shapes.find((q) => q.it === it);
    s.poly = it.poly;
    s.box = bbox(it.poly);
  }
}

/** Vạch mềm (tốc độ, chuyển động, gió) đè lên bất kỳ hình nào (trừ nền trời) thì bỏ đi. */
function dropBlockedLines(all, sky, subjectSet, transform) {
  const soft = all.filter((it) => it.kind === 'deco' && it.soft);
  if (!soft.length) return;
  const world = (it) => (subjectSet.has(it) ? applyGroupTransform(it.poly, transform) : it.poly);
  const shapes = all.filter((it) => it.kind === 'region' && it !== sky).map((it) => ({ poly: world(it), box: bbox(world(it)) }));
  for (const it of soft) {
    const pts = pathPoints(it.d, 4);
    const blocked = pts.some(([x, y]) => shapes.some((s) => x >= s.box[0] - 4 && x <= s.box[2] + 4 && y >= s.box[1] - 4 && y <= s.box[3] + 4 && (pointInPoly(x, y, s.poly) || distToPolyEdge(x, y, s.poly) < 5)));
    if (blocked) it.markup = '';
  }
}

/** Điểm mẫu dọc một nét SVG (tách từng đoạn M… riêng để không nối nhầm các đoạn rời nhau). */
function pathPoints(d, step) {
  return d
    .split(/(?=M )/)
    .filter((p) => p.trim())
    .flatMap((p) => densify(flattenPath(p), step));
}

/** Chèn thêm điểm để khoảng cách giữa 2 điểm liên tiếp ≤ step. */
function densify(pts, step) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    out.push([x, y]);
    const nx = pts[i + 1];
    if (!nx) break;
    const n = Math.ceil(Math.hypot(nx[0] - x, nx[1] - y) / step);
    for (let k = 1; k < n; k++) out.push([x + ((nx[0] - x) * k) / n, y + ((nx[1] - y) * k) / n]);
  }
  return out;
}

const FACE_WARN = [];

function buildPicture(theme, obj, variant, isCard, bgIndex = 0) {
  // Tranh Lớp 3 có bối cảnh riêng (bg-map.mjs) → bỏ trang trí trời chung, dùng khung cảnh riêng.
  const bgPick = isCard ? null : bgFor(obj.slug, variant.slug);
  const scene = (variant.scene || []).filter((n) => !bgPick || !['sun', 'clouds', 'space', 'night'].includes(n));
  const skyName = variant.sky || (scene.includes('night') ? 'night' : scene.includes('sunset') ? 'sunset' : scene.includes('rain') ? 'rain' : scene.includes('snow') ? 'snow' : 'day');
  const night = skyName === 'night';
  const groundKind = variant.ground || (obj.ground === 'water' ? 'water' : skyName === 'snow' ? 'snow' : 'grass');
  const groundColor =
    groundKind === 'water' ? (night ? GROUND.waterNight : GROUND.water) : groundKind === 'grass' ? (night ? GROUND.night : GROUND.grass) : GROUND[groundKind] || GROUND.grass;

  const bg = bgPick ? buildBackground(bgPick[0], bgPick[1], bgIndex % 2 ? -1 : 1) : null;
  const sky = R('nen-troi', 0, 0, 600, 600, 0, bg ? bg.skyColor : SKY[skyName]);
  const ground = bg ? bg.ground : groundItem(groundKind === 'water' ? 'water' : groundKind === 'rock' ? 'rock' : 'grass', groundColor);
  const { back, mid, front, subjectExtra } = sceneParts(scene, obj);
  if (bg) {
    back.unshift(...(theme.plainSky ? [] : bg.skyItems), ...bg.far);
    mid.unshift(...bg.near);
    front.push(...bg.fg);
  }

  const body = obj.build();
  if (night && obj.glow) {
    for (const it of body) if (it.kind === 'region' && obj.glow.includes(it.id)) it.color = '#FFE066';
  }
  // Khung bao của thân (trước phụ kiện) để đặt phụ kiện concept cho vừa từng đối tượng.
  const pts = body.filter((it) => it.kind === 'region').flatMap((it) => it.poly);
  const bb = bbox(pts);
  const ctx = {
    face: obj.face,
    hat: obj.hat,
    bb,
    // Động vật (có "neck") lấy tâm theo mặt; đồ vật/xe lấy tâm khung bao.
    cx: obj.neck && obj.face ? obj.face.x : (bb[0] + bb[2]) / 2,
    neck: obj.neck || (obj.face ? obj.face.y + 84 * obj.face.s : bb[1] + 80),
    left: obj.left ?? bb[0],
    right: obj.right ?? bb[2],
  };
  const acc = variant.acc ? variant.acc(ctx) : {};
  const expr = theme.faceStyle === 'face' ? variant.expr : null;
  const faceItems = expr && obj.face ? face(obj.face.x, obj.face.y, obj.face.s, expr, { mouth: obj.mouth !== false }) : [];
  const subject = [...(acc.behind || []), ...body, ...(acc.preface || []), ...faceItems, ...(acc.front || []), ...subjectExtra];
  // Kiểm tra: không có nét đen (dây, vạch…) nào vắt ngang khuôn mặt.
  if (faceItems.length) {
    const f = obj.face;
    const [[fx, fy]] = applyGroupTransform([[f.x, f.y + 8 * f.s]], variant.transform || null);
    const k = (variant.transform?.scale || 1) * f.s;
    // Bỏ qua đồ đeo trên mặt (kính, mặt nạ, tai nghe… nằm trong preface/front có vùng tô) — chỉ xét nét dây/trang trí.
    const mine = (acc.front || []).filter((it) => it.kind === 'deco');
    const over = [...mine, ...front, ...(acc.fg || [])]
      .filter((it) => it.kind === 'deco' && it.d && it.markup && !it.onFace)
      .some((it) => {
        const pts = mine.includes(it) ? applyGroupTransform(pathPoints(it.d, 4), variant.transform || null) : pathPoints(it.d, 4);
        return pts.some(([x, y]) => ((x - fx) / (58 * k)) ** 2 + ((y - fy) / (46 * k)) ** 2 < 1);
      });
    if (over) FACE_WARN.push(`${obj.slug}--${variant.slug}`);
  }
  // Cảnh riêng của biến thể (không chịu biến đổi tư thế của chủ thể).
  back.push(...(acc.back || []));
  mid.push(...(acc.mid || []));
  front.push(...(acc.fg || []));

  const all = [sky, ...back, ground, ...mid, ...subject, ...front];
  const transform = variant.transform || null;
  const subjectSet = new Set(subject);
  dropBlockedLines(all, sky, subjectSet, transform);
  dropBlockedSkyDecor(all, sky, subjectSet, transform);
  unstickStars(all, sky, subjectSet, transform);
  uniquify(all);

  const regions = all
    .filter((it) => it.kind === 'region' && !it.dropped)
    .map((it) => ({ ...it, worldPoly: subjectSet.has(it) ? applyGroupTransform(it.poly, transform) : it.poly }));

  const manifestRegions = computeManifestRegions(regions);
  // Đánh số theo màu gợi ý (chế độ Tô theo mẫu): cùng màu → cùng số.
  const palette = [];
  for (const r of manifestRegions) {
    let p = palette.find((q) => q.color === r.color);
    if (!p) {
      p = { number: palette.length + 1, color: r.color };
      palette.push(p);
    }
    r.number = p.number;
  }

  const slug = `${obj.slug}--${variant.slug}`;
  const animation = obj.animation || theme.animation || 'bounce';
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" data-picture="${slug}">`,
    `<g class="scene-back">`,
    renderItems([sky, ...back, ground, ...mid]),
    `</g>`,
    `<g id="subject" class="subject anim-${animation}"${transform ? ` transform="${groupTransformAttr(transform)}"` : ''}>`,
    renderItems(subject),
    `</g>`,
    `<g class="scene-front">`,
    renderItems(front),
    `</g>`,
    `</svg>`,
  ].join('\n');

  return {
    svg,
    meta: {
      slug,
      theme: theme.slug,
      object: obj.slug,
      variant: variant.slug,
      name: {
        vi: `${obj.name.vi} ${lowerVi(variant.name.vi)}`,
        en: `${obj.name.en} – ${variant.name.en}`,
      },
      variantName: variant.name,
      isCard,
      rarity: variant.rarity || null,
      animation,
      file: join(theme.slug, obj.slug, `${variant.slug}.svg`),
      palette,
      regions: manifestRegions,
    },
  };
}

/** Thẻ vẽ tay: vùng tô + lớp nét lấy từ art/<file>.json (do lineart.py tạo). */
function buildArtPicture(theme, obj, variant, file) {
  const art = JSON.parse(readFileSync(join(ROOT, 'art', `${file}.json`), 'utf8'));
  const regionsItems = art.regions.map((r) => ({ ...D(r.id, r.d, r.color), noStroke: true }));
  const lines = deco(`<image href="data:image/png;base64,${art.lines}" x="0" y="0" width="600" height="600" pointer-events="none"/>`);
  const manifestRegions = computeManifestRegions(regionsItems.map((it) => ({ ...it, worldPoly: it.poly })));
  const palette = [];
  for (const r of manifestRegions) {
    let p = palette.find((q) => q.color === r.color);
    if (!p) {
      p = { number: palette.length + 1, color: r.color };
      palette.push(p);
    }
    r.number = p.number;
  }
  const slug = `${obj.slug}--${variant.slug}`;
  const animation = obj.animation || theme.animation || 'bounce';
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" data-picture="${slug}">`,
    `<g class="scene-back">`,
    renderItems(regionsItems),
    `</g>`,
    `<g id="subject" class="subject anim-${animation}"></g>`,
    `<g class="scene-front">`,
    renderItems([lines]),
    `</g>`,
    `</svg>`,
  ].join('\n');
  return {
    svg,
    meta: {
      slug,
      theme: theme.slug,
      object: obj.slug,
      variant: variant.slug,
      name: { vi: `${obj.name.vi} ${lowerVi(variant.name.vi)}`, en: `${obj.name.en} – ${variant.name.en}` },
      variantName: variant.name,
      isCard: true,
      rarity: variant.rarity || null,
      animation,
      art: true,
      file: join(theme.slug, obj.slug, `${variant.slug}.svg`),
      palette,
      regions: manifestRegions,
    },
  };
}

/** Tranh "vui vẻ" của đối tượng cũ — chỉ dùng để xuất ảnh đại diện + linh vật giao diện (không vào kho tranh). */
const LEGACY_HAPPY = { slug: 'vui-ve', name: { vi: 'vui vẻ', en: 'happy' }, expr: 'happy', scene: ['sun', 'clouds'] };
function legacyPictures(slugs) {
  return slugs.map((slug) => {
    const obj = LEGACY_OBJECTS.find((o) => o.slug === slug);
    const theme = LEGACY_THEMES.find((t) => t.slug === obj.theme);
    return buildPicture(theme, obj, LEGACY_HAPPY, false);
  });
}

const colorize = ({ svg, meta }) => {
  let out = svg;
  for (const r of meta.regions) out = out.replace(`data-region="${r.id}" class="region" fill="#FFFFFF"`, `data-region="${r.id}" class="region" fill="${r.color}"`);
  return out;
};

/** Ảnh đại diện: tranh "vui vẻ" đã tô màu gợi ý, cắt khung quanh chủ thể. */
const AVATARS = ['meo', 'cho', 'tho', 'voi', 'gau', 'hoa', 'tao', 'dau-tay', 'o-to', 'may-bay', 'nam', 'cau-vong'];
function writeAvatars() {
  const outDir = join(ROOT, '..', 'frontend', 'public', 'avatars');
  mkdirSync(outDir, { recursive: true });
  for (const pic of legacyPictures(AVATARS)) {
    let svg = colorize(pic);
    // Khung vuông bao chủ thể (bỏ qua nền trời/đất).
    const subj = pic.meta.regions.filter((r) => !['nen-troi', 'nen-dat', 'mat-nuoc'].includes(r.id) && !/^(may-|mat-troi|tia-nang)/.test(r.id));
    const x0 = Math.min(...subj.map((r) => r.bbox[0]));
    const y0 = Math.min(...subj.map((r) => r.bbox[1]));
    const x1 = Math.max(...subj.map((r) => r.bbox[2]));
    const y1 = Math.max(...subj.map((r) => r.bbox[3]));
    const size = Math.max(x1 - x0, y1 - y0) + 30;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    svg = svg.replace('viewBox="0 0 600 600"', `viewBox="${round1(cx - size / 2)} ${round1(cy - size / 2)} ${round1(size)} ${round1(size)}"`);
    writeFileSync(join(outDir, `${pic.meta.object}.svg`), svg);
  }
}

/** Linh vật cho giao diện: chỉ lấy chủ thể (bỏ nền), tô màu gợi ý, nền trong suốt. */
const MASCOTS = ['gau', 'tho', 'meo', 'cho', 'voi', 'tao', 'dau-tay', 'hoa', 'o-to', 'may-bay'];
function writeMascots() {
  const outDir = join(ROOT, '..', 'frontend', 'public', 'mascots');
  mkdirSync(outDir, { recursive: true });
  for (const pic of legacyPictures(MASCOTS)) {
    const svg = colorize(pic);
    const start = svg.indexOf('<g id="subject"');
    const end = svg.indexOf('<g class="scene-front">');
    const subject = svg.slice(start, end).trim();
    // Khung bao chủ thể: bỏ các vùng cảnh nền (trời, đất, mây, mặt trời…).
    const bg = /^(nen-|mat-nuoc|may-|mat-troi|tia-nang|bong-do|hoa-nho|buom)/;
    const subj = pic.meta.regions.filter((r) => !bg.test(r.id) && r.area > 0);
    const x0 = Math.min(...subj.map((r) => r.bbox[0])) - 8;
    const y0 = Math.min(...subj.map((r) => r.bbox[1])) - 8;
    const x1 = Math.max(...subj.map((r) => r.bbox[2])) + 8;
    const y1 = Math.max(...subj.map((r) => r.bbox[3])) + 8;
    writeFileSync(
      join(outDir, `${pic.meta.object}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round1(x0)} ${round1(y0)} ${round1(x1 - x0)} ${round1(y1 - y0)}">${subject}</svg>`,
    );
  }
}

function main() {
  const bgErrors = checkBgMap(OBJECTS, (o) => OBJECT_VARIANTS[o.slug] || []);
  if (bgErrors.length) throw new Error(`Bối cảnh chưa hợp lệ:\n${bgErrors.join('\n')}`);
  const catalog = { generatedAt: new Date().toISOString(), viewBox: [600, 600], themes: [] };
  for (const theme of THEMES) {
    const dir = join(ROOT, theme.slug);
    if (existsSync(dir)) rmSync(dir, { recursive: true });
    const tEntry = { slug: theme.slug, name: theme.name, objects: [] };
    for (const obj of OBJECTS.filter((o) => o.theme === theme.slug)) {
      const oEntry = { slug: obj.slug, name: obj.name, pictures: [] };
      const tv = THEME_VARIANTS[theme.slug];
      // Lớp 3: mỗi đối tượng có 5 biến thể riêng (object-variants.mjs); thẻ vẫn theo chủ đề.
      const own = OBJECT_VARIANTS[obj.slug] || tv.variants;
      // Thẻ: chỉ tạo thẻ vẽ tay có trong CARD_ART (bỏ thẻ do bộ tạo tranh vẽ).
      const cards = tv.cards.filter((v) => CARD_ART.some((a) => a.object === obj.slug && a.rarity === v.rarity));
      const variants = [...own.map((v) => [v, false]), ...cards.map((v) => [v, true])];
      for (const [[variant, isCard], k] of variants.map((v, i) => [v, i])) {
        const artIdx = isCard ? CARD_ART.findIndex((a) => a.object === obj.slug && a.rarity === variant.rarity) : -1;
        const { svg, meta } = artIdx >= 0 ? buildArtPicture(theme, obj, variant, CARD_ART[artIdx].file) : buildPicture(theme, obj, variant, isCard, k);
        if (artIdx >= 0) meta.cardOrder = artIdx + 1; // thứ tự hiện trên trang Bóc thẻ = thứ tự chủ web gửi
        const out = join(ROOT, meta.file);
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, svg);
        oEntry.pictures.push(meta);
      }
      tEntry.objects.push(oEntry);
    }
    catalog.themes.push(tEntry);
  }
  writeFileSync(join(ROOT, 'catalog.json'), JSON.stringify(catalog));
  writeAvatars();
  writeMascots();
  const pics = catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures));
  if (FACE_WARN.length) console.log(`⚠ Nét đen vắt ngang mặt (${FACE_WARN.length}): ${FACE_WARN.join(', ')}`);
  console.log(
    `Đã sinh ${pics.length} tranh (${pics.filter((p) => !p.isCard).length} tranh thường, ${pics.filter((p) => p.isCard).length} tranh thẻ).`,
  );
}

main();
