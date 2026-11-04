import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { uiImagesPlugin, UI_IMAGE_PATHS } from '../scripts/ui-images.mjs';

test('Home and history images receive content-versioned URLs without changing any image bytes', () => {
  const root = fileURLToPath(new URL('../',import.meta.url));
  const plugin = uiImagesPlugin(root), files = [];
  plugin.configResolved({command:'build'});
  const context = { addWatchFile(){}, emitFile(file){ files.push(file); return String(files.length); } };
  const code = plugin.load.call(context,plugin.resolveId('virtual:ui-images'));
  assert.equal(files.length,16);
  for (const [index,file] of files.entries()) {
    const original = readFileSync(new URL('../public'+UI_IMAGE_PATHS[index],import.meta.url));
    assert.deepEqual(file.source,original);
    assert.ok(file.fileName.startsWith('ui-images/'+createHash('sha256').update(original).digest('hex').slice(0,16)+'-'));
    assert.ok(code.includes(`ROLLUP_FILE_URL_${index+1}`));
  }
  plugin.configResolved({command:'serve'});
  const development = plugin.load.call(context,plugin.resolveId('virtual:ui-images'));
  assert.ok(development.includes('"/mascots/bear-body.webp":"/mascots/bear-body.webp"'));
});
