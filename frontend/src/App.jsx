import { lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './store/auth';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';

// Mỗi trang là một gói JS riêng: lần đầu vào web chỉ tải trang chủ (nhẹ, mở nhanh); các trang khác tải khi cần
// và được tải sẵn ở chế độ nền khi trình duyệt rảnh, nên chuyển trang vẫn tức thì.
const PAGES = {
  Login: () => import('./pages/Account/Login'),
  Register: () => import('./pages/Account/Register'),
  Forgot: () => import('./pages/Account/Forgot'),
  Welcome: () => import('./pages/Account/Welcome'),
  Profile: () => import('./pages/Account/Profile'),
  SignatureStudio: () => import('./pages/Account/SignatureStudio'),
  Hall: () => import('./pages/Exhibition/Hall'),
  Review: () => import('./pages/Exhibition/Review'),
  Collection: () => import('./pages/Collection/Collection'),
  ShowcasePage: () => import('./pages/Exhibition/ShowcasePage'),
  ThemeSelector: () => import('./pages/ThemeSelector/ThemeSelector'),
  ObjectSelector: () => import('./pages/ObjectSelector/ObjectSelector'),
  ColoringScreen: () => import('./pages/ColoringScreen/ColoringScreen'),
  History: () => import('./pages/History/History'),
  Plans: () => import('./pages/Payment/Plans'),
  PaymentResult: () => import('./pages/Payment/PaymentResult'),
  ArenaLobby: () => import('./pages/Arena/ArenaLobby'),
  ArenaRoom: () => import('./pages/Arena/ArenaRoom'),
  Progression: () => import('./pages/Progression/Progression'),
  Gacha: () => import('./pages/Gacha/Gacha'),
  Shop: () => import('./pages/Shop/Shop'),
  Friends: () => import('./pages/Social/Friends'),
  Together: () => import('./pages/Collaborative/Together'),
  TogetherRoom: () => import('./pages/Collaborative/TogetherRoom'),
  StorybookList: () => import('./pages/Storybook/StorybookList'),
  StorybookEditor: () => import('./pages/Storybook/StorybookEditor'),
  StorybookView: () => import('./pages/Storybook/StorybookView'),
  SharedStorybook: () => import('./pages/Storybook/SharedStorybook'),
};
const page = (name) => lazy(PAGES[name]);
const Login = page('Login');
const Register = page('Register');
const Forgot = page('Forgot');
const Welcome = page('Welcome');
const Profile = page('Profile');
const SignatureStudio = page('SignatureStudio');
const Hall = page('Hall');
const Review = page('Review');
const Collection = page('Collection');
const ShowcasePage = page('ShowcasePage');
const ThemeSelector = page('ThemeSelector');
const ObjectSelector = page('ObjectSelector');
const ColoringScreen = page('ColoringScreen');
const History = page('History');
const Plans = page('Plans');
const PaymentResult = page('PaymentResult');
const ArenaLobby = page('ArenaLobby');
const ArenaRoom = page('ArenaRoom');
const Progression = page('Progression');
const Gacha = page('Gacha');
const Shop = page('Shop');
const Friends = page('Friends');
const Together = page('Together');
const TogetherRoom = page('TogetherRoom');
const StorybookList = page('StorybookList');
const StorybookEditor = page('StorybookEditor');
const StorybookView = page('StorybookView');
const SharedStorybook = page('SharedStorybook');

/** Tải sẵn mã của mọi trang khi trình duyệt rảnh (sau khi trang đầu đã hiện xong). */
function preloadPages() {
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
  const loaders = Object.values(PAGES);
  const next = () => {
    const load = loaders.shift();
    if (load) load().catch(() => {}).finally(() => idle(next));
  };
  setTimeout(() => idle(next), 2500);
}

function RequireAuth({ children }) {
  const user = useAuth((s) => s.user);
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

function GuestOnly({ children }) {
  const user = useAuth((s) => s.user);
  return user ? <Navigate to="/" replace /> : children;
}

function NotFound() {
  const { t } = useTranslation();
  return <div className="page text-center text-xl text-muted">{t('common.notFound')}</div>;
}

export default function App() {
  const ready = useAuth((s) => s.ready);
  const boot = useAuth((s) => s.boot);
  useEffect(() => {
    boot();
    preloadPages();
  }, [boot]);
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <img src="/favicon.svg" alt="" className="h-20 w-20 animate-bounce" />
      </div>
    );
  }
  const auth = (el) => <RequireAuth>{el}</RequireAuth>;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="forgot" element={<GuestOnly><Forgot /></GuestOnly>} />
          <Route path="plans" element={<Plans />} />
          <Route path="shared/:token" element={<SharedStorybook />} />
          <Route path="welcome" element={auth(<Welcome />)} />
          <Route path="profile" element={auth(<Profile />)} />
          <Route path="signature" element={auth(<SignatureStudio />)} />
          <Route path="collection" element={auth(<Collection />)} />
          <Route path="exhibition" element={auth(<Hall />)} />
          <Route path="exhibition/review" element={auth(<Review />)} />
          <Route path="showcase/:userId" element={auth(<ShowcasePage />)} />
          <Route path="color" element={auth(<ThemeSelector />)} />
          <Route path="color/:theme" element={auth(<ObjectSelector />)} />
          <Route path="draw/:id" element={auth(<ColoringScreen />)} />
          <Route path="history" element={auth(<History />)} />
          <Route path="payment/result" element={auth(<PaymentResult />)} />
          <Route path="arena" element={auth(<ArenaLobby />)} />
          <Route path="arena/room" element={auth(<ArenaRoom />)} />
          <Route path="missions" element={auth(<Progression />)} />
          <Route path="gacha" element={auth(<Gacha />)} />
          <Route path="shop" element={auth(<Shop />)} />
          <Route path="friends" element={auth(<Friends />)} />
          <Route path="together" element={auth(<Together />)} />
          <Route path="together/:code" element={auth(<TogetherRoom />)} />
          <Route path="storybooks" element={auth(<StorybookList />)} />
          <Route path="storybooks/new" element={auth(<StorybookEditor />)} />
          <Route path="storybooks/:id" element={auth(<StorybookView />)} />
          <Route path="storybooks/:id/edit" element={auth(<StorybookEditor />)} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
