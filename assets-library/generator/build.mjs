// Chạy: node assets-library/generator/build.mjs
// Sinh toàn bộ tranh SVG theo cấu trúc 3 tầng + file catalog.json (manifest vùng tô).
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
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
  distToPolyEdge,
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

/** Tính diện tích hiển thị (sau che khuất), vị trí đặt số và đa giác gọn cho từng vùng. */
function computeManifestRegions(regions) {
  const STEP = 5;
  const boxes = regions.map((r) => bbox(r.worldPoly));
  const counts = new Array(regions.length).fill(0);
  const best = regions.map(() => ({ d: -1, x: 0, y: 0 }));
  for (let y = STEP / 2; y < 600; y += STEP) {
    for (let x = STEP / 2; x < 600; x += STEP) {
      for (let k = regions.length - 1; k >= 0; k--) {
        const b = boxes[k];
        if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
        if (!pointInPoly(x, y, regions[k].worldPoly)) continue;
        counts[k]++;
        const d = distToPolyEdge(x, y, regions[k].worldPoly);
        if (d > best[k].d) best[k] = { d, x, y };
        break;
      }
    }
  }
  return regions.map((r, k) => {
    const b = boxes[k];
    const label = best[k].d >= 0 ? [best[k].x, best[k].y] : [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    return {
      id: r.id,
      color: r.color,
      area: counts[k] * STEP * STEP,
      shapeArea: Math.round(polyArea(r.worldPoly)),
      bbox: b.map(round1),
      label: label.map(round1),
      labelSize: Math.max(10, Math.min(26, Math.round((best[k].d > 0 ? best[k].d : 8) * 1.1))),
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
  const pics = catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures));
  console.log(
    `Đã sinh ${pics.length} tranh (${pics.filter((p) => !p.isCard).length} tranh thường, ${pics.filter((p) => p.isCard).length} tranh thẻ).`,
  );
}

main();
