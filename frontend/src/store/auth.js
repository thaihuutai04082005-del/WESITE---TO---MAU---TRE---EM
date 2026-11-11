// Trạng thái đăng nhập & hồ sơ bé.
import { create } from 'zustand';
import { api, configureApi } from '../services/api';
import { closeSocket } from '../services/socket';
import i18n from '../i18n';
import { useUi } from './ui';
import { publicPage } from '../../../shared/publicRoutes.mjs';
import { clearCreatedEditor } from '../lib/createdEditor';
import { clearHistoryCache } from '../lib/historyCache';

const TOKEN_KEY = 'btm.token';
// Hồ sơ lần trước (chỉ để HIỆN giao diện ngay khi mở web; quyền luôn do máy chủ kiểm tra ở từng request).
const SESSION_KEY = 'btm.session';
const readSession = (token) => {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return s && s.token === token && s.user ? s : null;
  } catch {
    return null;
  }
};
const writeSession = (value) => {
  try {
    if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* chế độ riêng tư */
  }
};
let booting = null;
const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const useAuth = create((set, get) => ({
  token: readToken(),
  user: null,
  plan: null,
  unread: 0,
  ready: false,
  meta: null,

  async boot() {
    if (booting) return booting;
    // Public content must not wait for a sleeping or unavailable API.
    if (!get().token && publicPage(window.location.pathname)) set({ ready: true });
    // Đã đăng nhập từ trước: hiện ngay giao diện theo hồ sơ lần trước, làm mới ở nền — không bắt bé chờ máy chủ thức dậy.
    const cached = get().token ? readSession(get().token) : null;
    if (cached) {
      set({ user: cached.user, plan: cached.plan ?? null, unread: cached.unread ?? 0, ready: true });
      if (cached.user.language && cached.user.language !== i18n.language) i18n.changeLanguage(cached.user.language);
    }
    booting = Promise.all([
      api.get('/meta').then((meta) => set({ meta })).catch(() => {}),
      get().token
        ? get().refresh().catch((err) => {
            // Mạng/máy chủ tạm lỗi mà đã có hồ sơ cũ thì giữ nguyên; token hỏng/hết hạn (401) thì đăng xuất.
            if (!cached || err?.status === 401) get().logout();
          })
        : Promise.resolve(),
    ]).then(() => set({ ready: true })).finally(() => { booting = null; });
    return booting;
  },

  applySession(s, { keepToken = false } = {}) {
    // Làm mới hồ sơ thì giữ token cũ: đổi token sẽ khiến kết nối realtime (phòng thi, phòng tô chung) bị tạo lại.
    const token = keepToken && get().token ? get().token : s.token;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* chế độ riêng tư */
    }
    set({ token, user: s.user, plan: s.plan, unread: s.unread ?? 0 });
    if (s.user?.language && s.user.language !== i18n.language) i18n.changeLanguage(s.user.language);
    if (s.events?.length) useUi.getState().pushEvents(s.events);
  },

  async refresh() {
    const s = await api.get('/auth/me');
    get().applySession(s, { keepToken: true });
    return s;
  },

  setUser(user) {
    set({ user });
  },
  setPlan(plan) {
    set((state) => ({ plan, user: state.user ? { ...state.user, vip: !!plan?.vip } : null }));
  },

  async syncPlan() {
    const token = get().token;
    if (!token) return;
    const result = await api.get('/subscription');
    if (get().token === token) get().setPlan(result.plan);
  },
  setUnread(unread) {
    set({ unread });
  },

  async updateProfile(fields) {
    const { user } = await api.put('/users/me', fields);
    set({ user });
    if (fields.language) i18n.changeLanguage(fields.language);
    return user;
  },

  logout() {
    clearCreatedEditor();
    clearHistoryCache();
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* bỏ qua */
    }
    writeSession(null);
    closeSocket();
    set({ token: null, user: null, plan: null, unread: 0 });
  },
}));

// Lưu hồ sơ mới nhất mỗi khi đổi (đổi tên, ảnh đại diện, gói…) để lần mở web sau hiện đúng ngay.
useAuth.subscribe((st, prev) => {
  if (st.token && st.user && (st.user !== prev.user || st.plan !== prev.plan || st.token !== prev.token)) {
    writeSession({ token: st.token, user: st.user, plan: st.plan, unread: st.unread });
  }
});

configureApi({ getToken: () => useAuth.getState().token, unauthorized: () => useAuth.getState().logout() });
