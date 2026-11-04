// Warm transition images in idle time. Share one small queue across effects so
// mounting several transitions does not start dozens of downloads/decodes at once.
const done = new Set();
const pending = new Set();
const queue = [];
const retain = new Set();
const retained = new Map();
const CONCURRENCY = 2;
let active = 0;
let scheduled = false;
let foreground = 0;
let quietUntil = 0;

/** Give API results and their visible pictures priority over warming unused effects. */
export function pauseImagePreloads() {
  foreground++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    foreground--;
    quietUntil = Date.now() + 500;
    schedule();
  };
}

function schedule() {
  if (scheduled || !queue.length || active >= CONCURRENCY || foreground) return;
  const wait = quietUntil - Date.now();
  if (wait > 0) {
    scheduled = true;
    setTimeout(() => { scheduled = false; schedule(); }, wait);
    return;
  }
  scheduled = true;
  const run = () => {
    scheduled = false;
    if (foreground || Date.now() < quietUntil) { schedule(); return; }
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
      loaded.then(() => img.decode?.()).then(() => {
        done.add(src);
        if (retain.has(src)) retained.set(src, img);
      }).catch(() => {
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

export function preloadImages(urls, options = {}) {
  const added = [];
  for (const src of urls) {
    if (options.retain) {
      retain.add(src);
      if (!retained.has(src)) done.delete(src);
    }
    if (options.priority && pending.has(src)) {
      const index = queue.indexOf(src);
      if (index >= 0) { queue.splice(index,1); added.push(src); }
    }
    if (done.has(src) || pending.has(src)) continue;
    pending.add(src);
    added.push(src);
  }
  if (options.priority) queue.unshift(...added);
  else queue.push(...added);
  schedule();
}
