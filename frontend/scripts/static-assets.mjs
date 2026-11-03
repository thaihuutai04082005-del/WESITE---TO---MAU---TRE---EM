import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isAppPath } from '../../shared/publicRoutes.mjs';

export async function staticAssetPaths(directory, prefix = '') {
  const root = directory instanceof URL ? fileURLToPath(directory) : directory;
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) return staticAssetPaths(join(root, entry.name), path);
    return entry.isFile() ? [path] : [];
  }));
  return nested.flat().sort();
}

export function assertNoAppAssetCollisions(paths) {
  const collisions = paths.filter(isAppPath);
  if (collisions.length) {
    throw new Error(`Static assets would be rewritten into app HTML. Move them outside application routes: ${collisions.join(', ')}`);
  }
}
