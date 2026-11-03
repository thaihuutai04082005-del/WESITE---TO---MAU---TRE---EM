import { createHash } from 'node:crypto';

export const PREVIEW_SIZE = 420;
export const PREVIEW_QUALITY = 82;

/** Build and API use the same content revision, so changed art never reuses a stale image. */
export function picturePreviewPaths(picture, regions) {
  const revision = createHash('sha256').update(`v1:${PREVIEW_SIZE}:${PREVIEW_QUALITY}:`)
    .update(picture.svg).update(JSON.stringify(regions.map(({ id, color }) => [id, color])))
    .digest('hex').slice(0, 16);
  const base = `/picture-previews/${encodeURIComponent(picture.slug)}-${revision}`;
  return { color: `${base}.webp`, outline: `${base}-outline.webp` };
}
