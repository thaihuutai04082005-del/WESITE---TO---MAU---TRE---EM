// Warm transition images in idle time. Share one small queue across effects so
// mounting several transitions does not start dozens of downloads/decodes at once.
const done = new Set();
const pending = new Set();
const queue = [];
const CONCURRENCY = 2;
let active = 0;
let scheduled = false;

function schedule() {
  if (scheduled || !queue.length || active >= CONCURRENCY) return;
  scheduled = true;
  const run = () => {
    scheduled = false;
    while (queue.length && active < CONCURRENCY) {
      const src = queue.shift();
      active++;
      const img = new Image();
      img.decoding = 'async';
      img.fetchPriority = 'low';
      // Use load/error listeners before setting src (also covers cached images).
      const loaded = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      img.src = src;
      loaded.then(() => img.decode?.()).then(() => done.add(src)).catch(() => {
        // Do not mark failures done: a later visit can try again.
      }).finally(() => {
        img.onload = null;
        img.onerror = null;
        pending.delete(src);
        active--;
        schedule();
      });
    }
  };
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 2500 });
  else setTimeout(run, 800);
}

export function preloadImages(urls) {
  for (const src of urls) {
    if (done.has(src) || pending.has(src)) continue;
    pending.add(src);
    queue.push(src);
  }
  schedule();
}
