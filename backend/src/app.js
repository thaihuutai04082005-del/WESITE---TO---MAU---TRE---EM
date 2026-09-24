// Ứng dụng Express: gom các route REST dưới /api.
import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { env, REPO_ROOT } from './config/env.js';
import { PLANS, RANK_TIERS, GACHA_RATES, GACHA_COST, ARENA_REWARDS, ARENA_ROOM_SIZE, MISSION_RUBY, TRADE_DAILY_LIMIT, RUBRIC, AVATARS, COLLAB_MAX_PLAYERS } from './config/constants.js';
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

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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
      collabMaxPlayers: COLLAB_MAX_PLAYERS,
      avatars: AVATARS,
      payments: providerStatus(),
      googleClientId: env.googleClientId || null,
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
  app.use('/api', notFoundHandler);

  // Công cụ quản trị nội dung (trang tĩnh).
  app.use('/admin', express.static(join(REPO_ROOT, 'admin-cms')));

  // Production: phục vụ luôn bản build của frontend (SPA).
  const dist = join(REPO_ROOT, 'frontend', 'dist');
  if (existsSync(dist)) {
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get(/^\/(?!api|socket\.io|admin).*/, (_req, res) => res.sendFile(join(dist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
