import { lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './store/auth';
import ServerWaking from './components/Layout/ServerWaking';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import { loadObjectSelector, loadColoringScreen, loadTogetherRoom, loadHistory } from './lib/coloringScreens';
const Login = lazy(() => import('./pages/Account/Login'));
const Register = lazy(() => import('./pages/Account/Register'));
const Forgot = lazy(() => import('./pages/Account/Forgot'));
const Welcome = lazy(() => import('./pages/Account/Welcome'));
const Profile = lazy(() => import('./pages/Account/Profile'));
const SignatureStudio = lazy(() => import('./pages/Account/SignatureStudio'));
const Hall = lazy(() => import('./pages/Exhibition/Hall'));
const Review = lazy(() => import('./pages/Exhibition/Review'));
const Collection = lazy(() => import('./pages/Collection/Collection'));
const ShowcasePage = lazy(() => import('./pages/Exhibition/ShowcasePage'));
const ThemeSelector = lazy(() => import('./pages/ThemeSelector/ThemeSelector'));
const ObjectSelector = lazy(loadObjectSelector);
const ColoringScreen = lazy(loadColoringScreen);
const History = lazy(loadHistory);
const Plans = lazy(() => import('./pages/Payment/Plans'));
const PaymentResult = lazy(() => import('./pages/Payment/PaymentResult'));
const ArenaLobby = lazy(() => import('./pages/Arena/ArenaLobby'));
const ArenaRoom = lazy(() => import('./pages/Arena/ArenaRoom'));
const Progression = lazy(() => import('./pages/Progression/Progression'));
const Gacha = lazy(() => import('./pages/Gacha/Gacha'));
const Shop = lazy(() => import('./pages/Shop/Shop'));
const Friends = lazy(() => import('./pages/Social/Friends'));
const Together = lazy(() => import('./pages/Collaborative/Together'));
const TogetherRoom = lazy(loadTogetherRoom);
const StorybookList = lazy(() => import('./pages/Storybook/StorybookList'));
const StorybookEditor = lazy(() => import('./pages/Storybook/StorybookEditor'));
const StorybookView = lazy(() => import('./pages/Storybook/StorybookView'));
const SharedStorybook = lazy(() => import('./pages/Storybook/SharedStorybook'));
import SiteSeo from './components/SiteSeo';
const PublicInfo = lazy(() => import('./pages/PublicInfo'));
import { PUBLIC_ROUTES, LEGACY_APP_PATHS, APP_SHELL_PATH } from '../../shared/publicRoutes.mjs';

function RecoverAppEntry() {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/', search, hash }} replace />;
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
  }, [boot]);
  useEffect(() => {
    if (ready) document.getElementById('seo-content')?.remove();
  }, [ready]);
  if (!ready) {
    // Keep the readable HTML visible while the app initializes (including slow APIs).
    if (document.getElementById('seo-content')) return null;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <img src="/favicon.svg" alt="" className="h-20 w-20 animate-bounce" />
        <ServerWaking inline />
      </div>
    );
  }
  const auth = (el) => <RequireAuth>{el}</RequireAuth>;
  return (
    <BrowserRouter>
      <SiteSeo />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {[...LEGACY_APP_PATHS, APP_SHELL_PATH].map((path) => <Route key={path} path={path.slice(1)} element={<RecoverAppEntry />} />)}
          <Route path="vi" element={<Home />} />
          {PUBLIC_ROUTES.filter((page) => page.kind !== 'home').map((page) => (
            <Route key={page.path} path={page.path.slice(1)} element={<PublicInfo />} />
          ))}
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
