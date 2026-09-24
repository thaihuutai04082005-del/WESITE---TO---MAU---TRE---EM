// Trạng thái đăng nhập & hồ sơ bé.
import { create } from 'zustand';
import { api, configureApi } from '../services/api';
import { closeSocket } from '../services/socket';
import i18n from '../i18n';
import { useUi } from './ui';

const TOKEN_KEY = 'btm.token';
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
    try {
      const meta = await api.get('/meta');
      set({ meta });
    } catch {
      /* backend chưa chạy → trang vẫn hiển thị, lỗi sẽ báo ở thao tác */
    }
    if (get().token) {
      try {
        await get().refresh();
      } catch {
        get().logout();
      }
    }
    set({ ready: true });
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
    set({ plan });
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
