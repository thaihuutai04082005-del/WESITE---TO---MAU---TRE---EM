import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

test('The published library contains no retired pictures or themes, and preserves the seven active cards', async () => {
  const root = new URL('../../assets-library/', import.meta.url);
  const catalog = JSON.parse(await readFile(new URL('catalog.json',root),'utf8'));
  const retired = JSON.parse(await readFile(new URL('retired-pictures.json',root),'utf8'));
  const pictures = catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures));
  assert.ok(catalog.themes.every((t) => !t.hidden && !retired.themes.includes(t.slug)));
  assert.ok(pictures.every((p) => !p.hidden && !retired.pictures.includes(p.slug)));
  assert.equal(pictures.filter((p) => p.isCard).length,7);
  assert.equal(pictures.filter((p) => !p.isCard).length,225);
  for (const picture of pictures) await access(new URL(picture.file,root));
});
