// Chạy: node assets-library/generator/build.mjs
// Sinh toàn bộ tranh SVG theo cấu trúc 3 tầng + file catalog.json (manifest vùng tô).
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES, OBJECTS } from './objects.mjs';
import { THEME_VARIANTS, CARD_VARIANTS, SKY, GROUND, groundItem, sceneParts } from './variants.mjs';
import { face } from './face.mjs';
import { R } from './shapes.mjs';
import {
  applyGroupTransform,
  groupTransformAttr,
  bbox,
  pointInPoly,
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
      if (it.kind === 'deco') return `<g class="deco" pointer-events="none">${it.markup}</g>`;
      const attrs = `id="r-${it.id}" data-region="${it.id}" class="region" fill="#FFFFFF" stroke="${STROKE}" stroke-width="3" stroke-linejoin="round"`;
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

function buildPicture(theme, obj, variant, isCard) {
  const night = variant.scene.includes('night');
  const skyColor = night
    ? SKY.night
    : variant.scene.includes('sunset')
      ? SKY.sunset
      : variant.scene.includes('rain')
        ? SKY.rain
        : variant.scene.includes('snow')
          ? SKY.snow
          : SKY.day;
  const water = obj.ground === 'water';
  const groundColor = water
    ? night
      ? GROUND.waterNight
      : GROUND.water
    : night
      ? GROUND.night
      : variant.scene.includes('snow')
        ? GROUND.snow
        : GROUND.grass;

  const sky = R('nen-troi', 0, 0, 600, 600, 0, skyColor);
  const ground = groundItem(water ? 'water' : 'grass', groundColor);
  const { back, mid, front, subjectExtra } = sceneParts(variant.scene, obj);

  const subject = obj.build();
  if (night && obj.glow) {
    for (const it of subject) if (it.kind === 'region' && obj.glow.includes(it.id)) it.color = '#FFE066';
  }
  const expr = theme.faceStyle === 'face' ? variant.expr : null;
  if (expr && obj.face) subject.push(...face(obj.face.x, obj.face.y, obj.face.s, expr));
  subject.push(...subjectExtra);

  const all = [sky, ...back, ground, ...mid, ...subject, ...front];
  uniquify(all);

  const transform = variant.transform || null;
  const subjectSet = new Set(subject);
  const regions = all
    .filter((it) => it.kind === 'region')
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
  const animation = obj.animation || theme.animation;
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
        vi: `${obj.name.vi} ${variant.name.vi}`,
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

/** Ảnh đại diện: tranh "vui vẻ" đã tô màu gợi ý, cắt khung quanh chủ thể. */
const AVATARS = ['meo', 'cho', 'tho', 'voi', 'gau', 'hoa', 'tao', 'dau-tay', 'o-to', 'may-bay', 'nam', 'cau-vong'];
function writeAvatars(catalog) {
  const outDir = join(ROOT, '..', 'frontend', 'public', 'avatars');
  mkdirSync(outDir, { recursive: true });
  const pics = catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures));
  for (const slug of AVATARS) {
    const p = pics.find((x) => x.object === slug && !x.isCard);
    let svg = readFileSync(join(ROOT, p.file), 'utf8');
    for (const r of p.regions) svg = svg.replace(`data-region="${r.id}" class="region" fill="#FFFFFF"`, `data-region="${r.id}" class="region" fill="${r.color}"`);
    // Khung vuông bao chủ thể (bỏ qua nền trời/đất).
    const subj = p.regions.filter((r) => !['nen-troi', 'nen-dat', 'mat-nuoc'].includes(r.id) && !/^(may-|mat-troi|tia-nang)/.test(r.id));
    const x0 = Math.min(...subj.map((r) => r.bbox[0]));
    const y0 = Math.min(...subj.map((r) => r.bbox[1]));
    const x1 = Math.max(...subj.map((r) => r.bbox[2]));
    const y1 = Math.max(...subj.map((r) => r.bbox[3]));
    const size = Math.max(x1 - x0, y1 - y0) + 30;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    svg = svg.replace('viewBox="0 0 600 600"', `viewBox="${round1(cx - size / 2)} ${round1(cy - size / 2)} ${round1(size)} ${round1(size)}"`);
    writeFileSync(join(outDir, `${slug}.svg`), svg);
  }
}

/** Linh vật cho giao diện: chỉ lấy chủ thể (bỏ nền), tô màu gợi ý, nền trong suốt. */
const MASCOTS = ['gau', 'tho', 'meo', 'cho', 'voi', 'tao', 'dau-tay', 'hoa', 'o-to', 'may-bay'];
function writeMascots(catalog) {
  const outDir = join(ROOT, '..', 'frontend', 'public', 'mascots');
  mkdirSync(outDir, { recursive: true });
  const pics = catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures));
  for (const slug of MASCOTS) {
    const p = pics.find((x) => x.object === slug && !x.isCard);
    let svg = readFileSync(join(ROOT, p.file), 'utf8');
    for (const r of p.regions) svg = svg.replace(`data-region="${r.id}" class="region" fill="#FFFFFF"`, `data-region="${r.id}" class="region" fill="${r.color}"`);
    const start = svg.indexOf('<g id="subject"');
    const end = svg.indexOf('<g class="scene-front">');
    const subject = svg.slice(start, end).trim();
    // Khung bao chủ thể: bỏ các vùng cảnh nền (trời, đất, mây, mặt trời…).
    const bg = /^(nen-|mat-nuoc|may-|mat-troi|tia-nang|bong-do|hoa-nho|buom)/;
    const subj = p.regions.filter((r) => !bg.test(r.id) && r.area > 0);
    const x0 = Math.min(...subj.map((r) => r.bbox[0])) - 8;
    const y0 = Math.min(...subj.map((r) => r.bbox[1])) - 8;
    const x1 = Math.max(...subj.map((r) => r.bbox[2])) + 8;
    const y1 = Math.max(...subj.map((r) => r.bbox[3])) + 8;
    writeFileSync(
      join(outDir, `${slug}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round1(x0)} ${round1(y0)} ${round1(x1 - x0)} ${round1(y1 - y0)}">${subject}</svg>`,
    );
  }
}

function main() {
  const catalog = { generatedAt: new Date().toISOString(), viewBox: [600, 600], themes: [] };
  for (const theme of THEMES) {
    const dir = join(ROOT, theme.slug);
    if (existsSync(dir)) rmSync(dir, { recursive: true });
    const tEntry = { slug: theme.slug, name: theme.name, objects: [] };
    for (const obj of OBJECTS.filter((o) => o.theme === theme.slug)) {
      const oEntry = { slug: obj.slug, name: obj.name, pictures: [] };
      const variants = [...THEME_VARIANTS[theme.slug].map((v) => [v, false]), ...CARD_VARIANTS.map((v) => [v, true])];
      for (const [variant, isCard] of variants) {
        const { svg, meta } = buildPicture(theme, obj, variant, isCard);
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
  writeAvatars(catalog);
  writeMascots(catalog);
  const pics = catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures));
  console.log(
    `Đã sinh ${pics.length} tranh (${pics.filter((p) => !p.isCard).length} tranh thường, ${pics.filter((p) => p.isCard).length} tranh thẻ).`,
  );
}

main();
