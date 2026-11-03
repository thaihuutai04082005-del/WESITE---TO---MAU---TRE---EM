import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertNoAppAssetCollisions, staticAssetPaths } from '../scripts/static-assets.mjs';

test('App wildcard routes cannot silently replace animation or other static assets with HTML', () => {
  for (const path of ['/together/cat.webp', '/together/meadow.webp', '/color/preview.svg']) {
    assert.throws(() => assertNoAppAssetCollisions([path]), /Static assets would be rewritten/);
  }
  assert.doesNotThrow(() => assertNoAppAssetCollisions(['/animations/together/cat.webp', '/shop/shop-bg.webp', '/sounds/ting.mp3']));
});

test('All shipped static files avoid SPA routes and all Together layers are preserved', async () => {
  const paths = await staticAssetPaths(new URL('../public/', import.meta.url));
  assertNoAppAssetCollisions(paths);
  for (const name of ['bg', 'shadow', 'paper', 'lines', 'cat', 'bear', 'rabbit', 'band-red', 'band-yellow', 'band-blue', 'meadow']) {
    assert.ok(paths.includes(`/animations/together/${name}.webp`));
  }
});
