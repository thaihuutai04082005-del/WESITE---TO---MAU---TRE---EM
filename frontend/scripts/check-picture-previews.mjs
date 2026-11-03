import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { picturePreviewPaths, PREVIEW_SIZE } from '../../shared/picturePreview.mjs';

const library = new URL('../../assets-library/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('catalog.json', library), 'utf8'));
let pictures = 0, bytes = 0;
for (const theme of catalog.themes.filter((item) => !item.hidden)) {
  for (const picture of theme.objects.flatMap((object) => object.pictures).filter((item) => !item.hidden)) {
    const svg = await readFile(new URL(picture.file, library), 'utf8');
    for (const path of Object.values(picturePreviewPaths({ ...picture, svg }, picture.regions))) {
      const file = new URL(path.slice(1), dist);
      bytes += (await stat(file)).size;
      const image = await sharp(await readFile(file)).metadata();
      assert.equal(image.format, 'webp');
      assert.equal(image.width, PREVIEW_SIZE);
      assert.equal(image.height, PREVIEW_SIZE);
    }
    pictures++;
  }
}
assert.match(await readFile(new URL('_headers', dist), 'utf8'), /\/picture-previews\/\*\n  Cache-Control: public, max-age=31536000, immutable/);
console.log(`PASS: ${pictures} pictures have both versioned WebP previews; ${(bytes / 1024 / 1024).toFixed(2)} MiB total, immutable caching.`);
