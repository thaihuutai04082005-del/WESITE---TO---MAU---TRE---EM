// Ứng dụng Express: gom các route REST dưới /api.
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { env, REPO_ROOT } from './config/env.js';
import { PLANS, RANK_TIERS, GACHA_RATES, GACHA_COST, ARENA_REWARDS, ARENA_ROOM_SIZE, MISSION_RUBY, TRADE_DAILY_LIMIT, TRADE_LIMITS, STORYBOOK_LIMITS, RUBRIC, AVATARS, COLLAB_MAX_PLAYERS } from './config/constants.js';
import { providerStatus } from './services/payments/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errors.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import coloringRoutes from './routes/coloring.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import arenaRoutes from './routes/arena.routes.js';
import progressionRoutes from './routes/progression.routes.js';
import gachaRoutes from './routes/gacha.routes.js';
import shopRoutes from './routes/shop.routes.js';
import socialRoutes from './routes/social.routes.js';
import storybookRoutes from './routes/storybook.routes.js';
import adminRoutes from './routes/admin.routes.js';
import exhibitionRoutes from './routes/exhibition.routes.js';
import { PUBLIC_ROUTES, isAppPath, APP_SHELL_FILE, APP_SHELL_PATH, LEGACY_APP_PATHS } from '../../shared/publicRoutes.mjs';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(cors({ origin: env.corsOrigins, credentials: true, maxAge: 600 }));
  app.use(compression({ threshold: 1024, level: 4 }));
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (/^\/(api|admin|socket\.io)(\/|$)/.test(req.path)) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (/^\/api(?:\/|$)/.test(req.path)) {
      res.setHeader('Cache-Control', 'private, no-store');
      res.vary('Authorization');
    }
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/meta', (_req, res) =>
    res.json({
      plans: PLANS,
      rankTiers: RANK_TIERS,
      gacha: { rates: GACHA_RATES, cost: GACHA_COST },
      arena: { rewards: ARENA_REWARDS, roomSize: ARENA_ROOM_SIZE, rubric: RUBRIC, durationSec: env.arena.durationSec },
      missionRuby: MISSION_RUBY,
      tradeDailyLimit: TRADE_DAILY_LIMIT,
      tradeLimits: TRADE_LIMITS,
      storybookLimits: STORYBOOK_LIMITS,
      collabMaxPlayers: COLLAB_MAX_PLAYERS,
      avatars: AVATARS,
      payments: providerStatus(),
      googleClientId: env.googleClientId || null,
      auth: { phoneOtpEnabled: env.phoneOtpEnabled },
      picturePreviews: true,
      pictureAccessEnforced: true,
      artworkEditorBootstrap: true,
    }),
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api', coloringRoutes);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/arena', arenaRoutes);
  app.use('/api/progression', progressionRoutes);
  app.use('/api/gacha', gachaRoutes);
  app.use('/api/shop', shopRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/storybooks', storybookRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/exhibition', exhibitionRoutes);
  app.use('/api', notFoundHandler);

  // Công cụ quản trị nội dung (trang tĩnh).
  app.use('/admin', express.static(join(REPO_ROOT, 'admin-cms')));

  // Production: phục vụ luôn bản build của frontend (SPA).
  const dist = join(REPO_ROOT, 'frontend', 'dist');
  if (existsSync(dist)) {
    app.use((req, res, next) => {
      const path = req.path.replace(/\/+$/, '') || '/';
      const legacyImage = path.match(/^\/together\/([a-z-]+\.webp)$/);
      if (legacyImage && existsSync(join(dist, 'animations', 'together', legacyImage[1]))) {
        return res.redirect(301, `/animations/together/${legacyImage[1]}${req.originalUrl.slice(req.path.length)}`);
      }
      if (isAppPath(path) || [APP_SHELL_PATH, ...LEGACY_APP_PATHS, '/404.html'].includes(path)) res.setHeader('X-Robots-Tag', 'noindex, follow');
      if (LEGACY_APP_PATHS.includes(path)) return res.redirect(302, `/${req.originalUrl.slice(req.path.length)}`);
      if (path === APP_SHELL_PATH) res.type('html');
      next();
    });
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get(/^\/(?!api|socket\.io|admin).*/, (req, res) => {
      const path = req.path.replace(/\/+$/, '') || '/';
      const page = PUBLIC_ROUTES.find((item) => item.path === path);
      if (page) return res.sendFile(join(dist, page.file));
      if (isAppPath(path)) {
        res.setHeader('X-Robots-Tag', 'noindex, follow');
        return res.type('html').sendFile(join(dist, APP_SHELL_FILE));
      }
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      return res.status(404).sendFile(join(dist, '404.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
