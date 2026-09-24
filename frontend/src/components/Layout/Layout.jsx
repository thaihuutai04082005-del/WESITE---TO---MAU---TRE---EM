// Khung trang: thanh điều hướng (desktop) + thanh dưới (mobile), chuyển ngôn ngữ, thông báo, popup phần thưởng.
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { useUi } from '../../store/ui';
import { getSocket } from '../../services/socket';
import Avatar from '../Avatar/Avatar';
import { formatDateTime } from '../../lib/format';
import Icon from '../Icon';
import Toasts from './Toasts';
import EventPopup from './EventPopup';
import UpgradeModal from './UpgradeModal';
import NotificationBell from './NotificationBell';
import LanguageSwitch from './LanguageSwitch';

export const NAV = [
  { to: '/', icon: 'home', key: 'home', end: true },
  { to: '/color', icon: 'palette', key: 'color' },
  { to: '/history', icon: 'history', key: 'history' },
  { to: '/arena', icon: 'trophy', key: 'arena' },
  { to: '/missions', icon: 'target', key: 'missions' },
  { to: '/gacha', icon: 'gift', key: 'gacha' },
  { to: '/shop', icon: 'shop', key: 'shop' },
  { to: '/friends', icon: 'users', key: 'friends' },
  { to: '/together', icon: 'heart', key: 'together' },
  { to: '/storybooks', icon: 'book', key: 'storybooks' },
];
const MOBILE_MAIN = ['home', 'color', 'arena', 'history'];
const DESKTOP_MAIN = ['color', 'history', 'arena', 'missions', 'gacha', 'together'];
// Các sự kiện này đã có popup phần thưởng riêng → không hiện thêm toast.
const POPUP_TYPES = new Set(['mission_complete', 'level_up', 'rank_up']);

export default function Layout() {
  const { t, i18n } = useTranslation();
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const setUnread = useAuth((s) => s.setUnread);
  const toast = useUi((s) => s.toast);
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenu(false), [loc.pathname]);

  // Thông báo realtime (lời mời kết bạn, đề nghị đổi thẻ, gói được kích hoạt…).
  useEffect(() => {
    if (!token || !user) return;
    const s = getSocket(token);
    const onNote = (n) => {
      setUnread(useAuth.getState().unread + 1);
      if (POPUP_TYPES.has(n.type)) return;
      toast(t(`notifications.${n.type}`, { ...flatten(n.data, i18n.language), date: formatDateTime(n.data?.deleteAt || n.data?.endsAt, i18n.language), defaultValue: t('notifications.generic') }));
    };
    s.on('notification', onNote);
    return () => s.off('notification', onNote);
  }, [token, user, setUnread, toast, t, i18n.language]);

  useEffect(() => {
    if (user?.needsNickname && loc.pathname !== '/welcome') navigate('/welcome');
  }, [user, loc.pathname, navigate]);

  const fullBleed = loc.pathname.startsWith('/draw/');

  return (
    <div className="min-h-screen bg-white">
      <header className="no-print sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-extrabold text-primary">
            <img src="/favicon.svg" alt="" className="h-9 w-9" />
            <span className="hidden sm:inline">{t('app.name')}</span>
          </Link>
          {user && (
            <nav className="ml-4 hidden flex-1 items-center gap-1 overflow-x-auto lg:flex">
              {NAV.filter((n) => DESKTOP_MAIN.includes(n.key)).map((n) => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) => `whitespace-nowrap rounded-xl px-3 py-2 font-bold ${isActive ? 'bg-primary-light text-primary-dark' : 'text-muted hover:text-ink'}`}>
                  {t(`nav.${n.key}`)}
                </NavLink>
              ))}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitch />
            {user ? (
              <>
                <span className="chip hidden sm:inline-flex" title="Ruby">
                  <Icon name="ruby" size={16} /> {user.ruby}
                </span>
                <NotificationBell />
                <Link to="/profile" className="flex items-center gap-2" data-testid="nav-profile">
                  <Avatar avatar={user.avatar} frame={user.avatarFrame} size={44} />
                </Link>
                <button type="button" className="btn-ghost min-h-11 px-3" onClick={() => setMenu(true)} aria-label={t('nav.menu')} data-testid="nav-menu">
                  <Icon name="menu" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost min-h-11 px-4 text-base">
                  {t('auth.login')}
                </Link>
                <Link to="/register" className="btn-primary hidden min-h-11 px-4 text-base sm:inline-flex">
                  {t('auth.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={fullBleed ? '' : ''}>
        <Outlet />
      </main>

      {user && (
        <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {NAV.filter((n) => MOBILE_MAIN.includes(n.key)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
              <Icon name={n.icon} />
              {t(`nav.${n.key}`)}
            </NavLink>
          ))}
          <button type="button" onClick={() => setMenu(true)} className="flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold text-muted">
            <Icon name="menu" />
            {t('nav.more')}
          </button>
        </nav>
      )}

      {menu && (
        <div className="fixed inset-0 z-50 bg-ink/40" onClick={() => setMenu(false)}>
          <div className="animate-float-up absolute inset-x-0 bottom-0 grid grid-cols-3 gap-2 rounded-t-3xl bg-white p-4 pb-8 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20 sm:w-[26rem] sm:rounded-3xl sm:pb-4" onClick={(e) => e.stopPropagation()}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className="card flex min-h-20 flex-col items-center justify-center gap-1 p-2 text-center text-sm font-bold">
                <Icon name={n.icon} />
                {t(`nav.${n.key}`)}
              </NavLink>
            ))}
            <NavLink to="/plans" className="card flex min-h-20 flex-col items-center justify-center gap-1 p-2 text-center text-sm font-bold text-coral">
              <Icon name="star" />
              {t('nav.plans')}
            </NavLink>
            <NavLink to="/profile" className="card flex min-h-20 flex-col items-center justify-center gap-1 p-2 text-center text-sm font-bold">
              <Icon name="user" />
              {t('nav.profile')}
            </NavLink>
          </div>
        </div>
      )}

      <Toasts />
      <EventPopup />
      <UpgradeModal />
    </div>
  );
}

function flatten(data = {}, lang = 'vi') {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object') {
      if ('nickname' in v) out[k] = v.nickname;
      else if ('vi' in v) out[k] = v[lang] ?? v.vi;
    } else out[k] = v;
  }
  return out;
}
export { flatten };
