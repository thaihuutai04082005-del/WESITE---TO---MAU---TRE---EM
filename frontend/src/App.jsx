import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './store/auth';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Account/Login';
import Register from './pages/Account/Register';
import Forgot from './pages/Account/Forgot';
import Welcome from './pages/Account/Welcome';
import Profile from './pages/Account/Profile';
import ThemeSelector from './pages/ThemeSelector/ThemeSelector';
import ObjectSelector from './pages/ObjectSelector/ObjectSelector';
import PoseSelector from './pages/PoseSelector/PoseSelector';
import ColoringScreen from './pages/ColoringScreen/ColoringScreen';
import History from './pages/History/History';
import Plans from './pages/Payment/Plans';
import PaymentResult from './pages/Payment/PaymentResult';
import ArenaLobby from './pages/Arena/ArenaLobby';
import ArenaRoom from './pages/Arena/ArenaRoom';
import Progression from './pages/Progression/Progression';
import Gacha from './pages/Gacha/Gacha';
import Shop from './pages/Shop/Shop';
import Friends from './pages/Social/Friends';
import Together from './pages/Collaborative/Together';
import TogetherRoom from './pages/Collaborative/TogetherRoom';
import StorybookList from './pages/Storybook/StorybookList';
import StorybookEditor from './pages/Storybook/StorybookEditor';
import StorybookView from './pages/Storybook/StorybookView';
import SharedStorybook from './pages/Storybook/SharedStorybook';

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
          <Route path="color" element={auth(<ThemeSelector />)} />
          <Route path="color/:theme" element={auth(<ObjectSelector />)} />
          <Route path="color/:theme/:object" element={auth(<PoseSelector />)} />
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
