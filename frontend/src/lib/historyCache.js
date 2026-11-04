import { api } from '../services/api.js';

// Account-scoped display snapshots only. Each visit still fetches current metadata;
// permissions, full artwork data and subscription responses are never cached here.
let owner = null, active = 0;
const lists = new Map(), images = new Map(), queue = [];
const MAX_BYTES = 12 * 1024 * 1024, MAX_IMAGES = 80;
export const historyPath = (filter = 'all', files = false) =>
  `/artworks?progress=1${files ? '&thumbnails=0&initialThumbnails=4' : ''}${filter === 'all' ? '' : `&status=${filter}`}`;

export function clearHistoryCache() {
  owner = null; lists.clear();
  for (const entry of images.values()) if (entry.url) URL.revokeObjectURL(entry.url);
  images.clear();
  for (const job of queue.splice(0)) job.reject(new Error('account_changed'));
}
function account(token) {
  if (owner !== token) { clearHistoryCache(); owner = token; }
}
export function historySnapshot(token, filter, files) {
  account(token);
  const entry = lists.get(historyPath(filter, files));
  return entry && Date.now()-entry.time < 30000 ? entry.items : null;
}
export async function loadHistoryItems(token, filter, files) {
  account(token);
  const path = historyPath(filter, files), result = await api.get(path);
  if (owner === token) lists.set(path, { items:result.artworks, time:Date.now() });
  return result.artworks;
}
export function invalidateHistory() { lists.clear(); }

function prune() {
  let bytes = [...images.values()].reduce((n, entry) => n+(entry.bytes || 0), 0);
  for (const [key, entry] of images) {
    if (bytes <= MAX_BYTES && images.size <= MAX_IMAGES) break;
    if (entry.users || !entry.url) continue;
    bytes -= entry.bytes; URL.revokeObjectURL(entry.url); images.delete(key);
  }
}
function drain() {
  while (active < 4 && queue.length) {
    const job = queue.shift(); active++;
    (async () => {
      if (owner !== job.token) throw new Error('account_changed');
      const blob = await api.blob(`/artworks/${job.id}/thumbnail?version=${encodeURIComponent(job.version)}`);
      if (owner !== job.token || images.get(job.key) !== job.entry) throw new Error('account_changed');
      if (!/^image\/(png|jpeg)$/.test(blob.type)) throw new Error('invalid_thumbnail');
      job.entry.bytes = blob.size; job.entry.url = URL.createObjectURL(blob);
      job.resolve(job.entry.url);
    })().catch(error => {
      if (images.get(job.key) === job.entry) images.delete(job.key);
      job.reject(error);
    }).finally(() => { active--; prune(); drain(); });
  }
}
export function acquireHistoryThumbnail(token, id, version) {
  account(token);
  const key = JSON.stringify([token,id,version]);
  let entry = images.get(key);
  if (!entry) {
    entry = { users:0 };
    entry.promise = new Promise((resolve,reject) => queue.push({ key,entry,token,id,version,resolve,reject }));
    images.set(key, entry);
  } else { images.delete(key); images.set(key, entry); }
  entry.users++;
  drain();
  let released = false;
  return { promise:entry.promise, release() {
    if (released) return;
    released = true; entry.users--; prune();
  } };
}
