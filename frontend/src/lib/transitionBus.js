// Cờ dùng chung giữa các hiệu ứng chuyển màn hình để chúng không chạy chồng lên nhau.
// screenEnterUntil: mốc thời gian (ms) — đổi trang trước mốc này thì trang mới hiện lên bằng hiệu ứng mờ dần nhẹ (xem Layout).
export const transitionBus = { skipRainbow: false, screenEnterUntil: 0 };

/** Bật hiệu ứng "trang mới mờ dần hiện lên" cho lần đổi trang ngay sau đây (hết hạn sau `ms` nếu không đổi trang). */
export const armScreenEnter = (ms = 1500) => {
  transitionBus.screenEnterUntil = Date.now() + ms;
};
