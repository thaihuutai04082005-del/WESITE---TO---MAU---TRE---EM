// Raster previews are generated at build time; the coloring editor keeps the original SVG.
import { mkdir, readFile, readdir, stat, unlink } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { picturePreviewPaths, PREVIEW_SIZE, PREVIEW_QUALITY } from '../../shared/picturePreview.mjs';

const library = fileURLToPath(new URL('../../assets-library/', import.meta.url));
const output = fileURLToPath(new URL('../public/picture-previews/', import.meta.url));
const catalog = JSON.parse(await readFile(resolve(library, 'catalog.json'), 'utf8'));
const pictures = catalog.themes.filter((theme) => !theme.hidden)
  .flatMap((theme) => theme.objects.flatMap((object) => object.pictures))
  .filter((picture) => !picture.hidden && !picture.isCard);
await mkdir(output, { recursive: true });
const expected = new Set();
let created = 0;
sharp.cache(false);

for (const picture of pictures) {
  const svg = await readFile(resolve(library, picture.file), 'utf8');
  const paths = picturePreviewPaths({ ...picture, svg }, picture.regions);
  const colors = new Map(picture.regions.map(({ id, color }) => [id, color]));
  // The generator emits quoted data-region/fill attributes. Change only region fills.
  const colored = svg.replace(/<[^>]*\bdata-region="([^"]+)"[^>]*>/g,
    (element, id) => element.replace(/\bfill="[^"]*"/, `fill="${colors.get(id) || '#FFFFFF'}"`));
  for (const [kind, path] of Object.entries(paths)) {
    const name = basename(path);
    expected.add(name);
    const target = resolve(output, name);
    if (await stat(target).then((entry) => entry.size > 0).catch(() => false)) continue;
    await sharp(Buffer.from(kind === 'color' ? colored : svg))
      .resize(PREVIEW_SIZE, PREVIEW_SIZE).flatten({ background: '#FFFFFF' })
      .webp({ quality: PREVIEW_QUALITY }).toFile(target);
    created++;
  }
}
for (const name of await readdir(output)) {
  if (name.endsWith('.webp') && !expected.has(name)) await unlink(resolve(output, name));
}
console.log(`Picture previews: ${pictures.length} pictures, ${created} WebP files generated (${expected.size} total).`);
