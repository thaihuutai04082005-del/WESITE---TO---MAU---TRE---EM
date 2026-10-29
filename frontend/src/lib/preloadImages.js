// Nạp sẵn (và giải mã) các hình của hiệu ứng chuyển màn hình ngay khi vào trang, để lúc hiệu ứng chạy các hình đã nằm trong bộ nhớ
// và không bị giật / hiện trễ giữa chừng. Gọi một lần cho mỗi hiệu ứng; chạy lúc rảnh để không làm chậm trang chủ.
const done = new Set();

export function preloadImages(urls) {
  const run = () => {
    urls.forEach((src) => {
      if (done.has(src)) return;
      done.add(src);
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
    });
  };
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 2500 });
  else setTimeout(run, 800);
}
