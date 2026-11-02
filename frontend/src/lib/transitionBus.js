// Cờ dùng chung giữa các hiệu ứng chuyển màn hình để chúng không chạy chồng lên nhau.
export const transitionBus = { skipRainbow: false, readyAt: 0 };

/** Trang đích báo "đã có đủ dữ liệu, sẵn sàng hiện" — các hiệu ứng chuyển màn hình chờ tín hiệu này rồi mới mở lớp phủ. */
export function pageReady() {
  transitionBus.readyAt = Date.now();
  window.dispatchEvent(new Event('btm:page-ready'));
}
