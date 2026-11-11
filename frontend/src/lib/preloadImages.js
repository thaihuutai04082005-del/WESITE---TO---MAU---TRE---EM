// Nạp sẵn (và giải mã) các hình của hiệu ứng chuyển màn hình, để lúc hiệu ứng chạy các hình đã nằm trong bộ nhớ
// và không bị giật / hiện trễ giữa chừng. Chỉ bắt đầu SAU khi trang đã tải xong, và tải lần lượt từng hình lúc trình duyệt rảnh
// (~1.2MB) — để không giành đường truyền với nội dung trang bé đang mở.
const done = new Set();
const queue = [];
let running = false;

const idle = (fn) => (typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 300));

function pump() {
  const src = queue.shift();
  if (!src) {
    running = false;
    return;
  }
  const img = new Image();
  img.src = src;
  (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(() => idle(pump));
}

function start() {
  if (running) return;
  running = true;
  idle(pump);
}

export function preloadImages(urls) {
  urls.forEach((src) => {
    if (done.has(src)) return;
    done.add(src);
    queue.push(src);
  });
  if (document.readyState === 'complete') setTimeout(start, 1500);
  else window.addEventListener('load', () => setTimeout(start, 1500), { once: true });
}
