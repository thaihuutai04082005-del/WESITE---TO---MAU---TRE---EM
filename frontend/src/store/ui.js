// Thông báo nổi (toast) và hàng đợi popup phần thưởng (hoàn thành nhiệm vụ, lên cấp, thăng hạng).
import { create } from 'zustand';

let seq = 0;

export const useUi = create((set, get) => ({
  toasts: [],
  events: [],
  upgradeOpen: false,

  toast(message, kind = 'info') {
    const id = ++seq;
    set({ toasts: [...get().toasts, { id, message, kind }] });
    setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 3500);
  },
  pushEvents(list) {
    if (!list?.length) return;
    set({ events: [...get().events, ...list.map((e) => ({ ...e, _id: ++seq }))] });
  },
  shiftEvent() {
    set({ events: get().events.slice(1) });
  },
  openUpgrade(open = true) {
    set({ upgradeOpen: open });
  },
}));
