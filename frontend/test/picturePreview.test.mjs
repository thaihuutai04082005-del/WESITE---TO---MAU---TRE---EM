import { test } from 'node:test';
import assert from 'node:assert/strict';
import { picturePreviewPaths } from '../../shared/picturePreview.mjs';

test('Immutable previews change when line art or suggested region colors change', () => {
  const picture = { slug: 'test-picture', svg: '<svg>test</svg>' };
  const regions = [{ id: 'sky', color: '#123456', label: [1, 2] }];
  const initial = picturePreviewPaths(picture, regions);
  assert.match(initial.color, /^\/picture-previews\/test-picture-[a-f0-9]{16}\.webp$/);
  assert.equal(initial.outline, initial.color.replace('.webp', '-outline.webp'));
  assert.notEqual(picturePreviewPaths({ ...picture, svg: '<svg>changed</svg>' }, regions).color, initial.color);
  assert.notEqual(picturePreviewPaths(picture, [{ ...regions[0], color: '#FFFFFF' }]).color, initial.color);
  assert.deepEqual(picturePreviewPaths(picture, [{ ...regions[0], label: [3, 4] }]), initial);
});
