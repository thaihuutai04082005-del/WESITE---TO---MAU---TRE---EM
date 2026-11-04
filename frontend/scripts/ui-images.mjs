import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, resolve } from 'node:path';

export const UI_IMAGE_PATHS = [
  '/home-bg.webp', '/history/bg.webp', '/history/deco.webp',
  ...['body','leg-l','leg-r','head','eyes','arm-l','arm-r'].map(part => `/mascots/bear-${part}.webp`),
  ...['tomau','daututruong','tocungnhau','bocthe','truyentranh','nhiemvu'].map(name => `/mascots/${name}.webp`),
];

/** Keep original files intact; versioned copies can safely stay cached across SPA navigation. */
export function uiImagesPlugin(root) {
  let building = false;
  return {
    name:'tinytints-ui-images',
    configResolved(config) { building = config.command === 'build'; },
    resolveId(id) { if (id === 'virtual:ui-images') return '\0tinytints-ui-images'; },
    load(id) {
      if (id !== '\0tinytints-ui-images') return;
      const entries = UI_IMAGE_PATHS.map(path => {
        if (!building) return `${JSON.stringify(path)}:${JSON.stringify(path)}`;
        const file = resolve(root, 'public', path.slice(1)), source = readFileSync(file);
        this.addWatchFile(file);
        const hash = createHash('sha256').update(source).digest('hex').slice(0,16);
        const ref = this.emitFile({ type:'asset', fileName:`ui-images/${hash}-${basename(path)}`, source });
        return `${JSON.stringify(path)}:import.meta.ROLLUP_FILE_URL_${ref}`;
      });
      return `export const uiImages=Object.freeze({${entries.join(',')}});`;
    },
  };
}
