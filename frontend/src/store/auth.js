// Trạng thái đăng nhập & hồ sơ bé.
import { create } from 'zustand';
import { api, configureApi } from '../services/api';
import { closeSocket } from '../services/socket';
import i18n from '../i18n';
import { useUi } from './ui';
import { publicPage } from '../../../shared/publicRoutes.mjs';
import { clearCreatedEditor } from '../lib/createdEditor';

const TOKEN_KEY = 'btm.token';
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
    booting = Promise.all([
      api.get('/meta').then((meta) => set({ meta })).catch(() => {}),
      get().token ? get().refresh().catch(() => get().logout()) : Promise.resolve(),
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
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* bỏ qua */
    }
    closeSocket();
    set({ token: null, user: null, plan: null, unread: 0 });
  },
}));

configureApi({ getToken: () => useAuth.getState().token, unauthorized: () => useAuth.getState().logout() });
