process.env.DB_FILE = ':memory:';
process.env.NODE_ENV = 'test';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { env } from '../src/config/env.js';
import { getDb } from '../src/config/db.js';
import { createApp } from '../src/app.js';
import { issueOtp } from '../src/services/otp.js';

// Never use externally configured messaging accounts in test runs.
env.brevo = {};
env.twilio = {};

const configModule = new URL('../src/config/env.js', import.meta.url).href;
function productionConfig(overrides = {}) {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
    const {env} = await import(${JSON.stringify(configModule)});
    console.log(JSON.stringify({otp:env.exposeDevOtp,mock:env.paymentMock,api:env.apiPublicUrl}));
  `,
      ],
      {
        env: {
          ...process.env,
          NODE_ENV: 'production',
          JWT_SECRET: 'test-only-production-config-secret',
          EXPOSE_DEV_OTP: 'true',
          PAYMENT_MOCK: 'true',
          API_PUBLIC_URL: '',
          RENDER_EXTERNAL_URL: 'https://generated-api.onrender.com',
          ...overrides,
        },
        encoding: 'utf8',
      },
    ),
  );
}

test('Production refuses simulated OTP/payments and uses the Render-assigned callback URL', () => {
  assert.deepEqual(productionConfig(), { otp: false, mock: false, api: 'https://generated-api.onrender.com' });
  assert.equal(productionConfig({ API_PUBLIC_URL: 'https://api.example.com' }).api, 'https://api.example.com');
});

test('Missing OTP delivery fails clearly and does not leave an unsent code or a cooldown', async () => {
  const old = { smtp: env.smtp, sms: env.sms, exposeDevOtp: env.exposeDevOtp, isProd: env.isProd };
  env.smtp = {};
  env.sms = {};
  env.isProd = true;
  // Even a mistakenly enabled test flag cannot expose a production OTP.
  env.exposeDevOtp = true;
  try {
    for (let i = 0; i < 2; i++) {
      await assert.rejects(issueOtp({ purpose: 'register', type: 'phone', target: '+12025550199' }), {
        status: 503,
        code: 'otp_delivery_unavailable',
      });
      assert.equal((await getDb().prepare('SELECT COUNT(*) AS n FROM otp_codes WHERE target = ?').get('+12025550199')).n, 0);
    }
  } finally {
    Object.assign(env, old);
  }
});

test('Delivery failure cleans up the OTP and returns a safe, translated error', async () => {
  const old = { sms: env.sms, exposeDevOtp: env.exposeDevOtp };
  const realFetch = globalThis.fetch;
  env.sms = { url: 'https://sms.example.test/send' };
  env.exposeDevOtp = false;
  globalThis.fetch = async () => {
    throw new Error('Provider connection failed');
  };
  try {
    await assert.rejects(issueOtp({ purpose: 'reset', type: 'phone', target: '+12025550198' }), { status: 503, code: 'otp_delivery_unavailable' });
    assert.equal((await getDb().prepare('SELECT COUNT(*) AS n FROM otp_codes WHERE target = ?').get('+12025550198')).n, 0);
  } finally {
    globalThis.fetch = realFetch;
    Object.assign(env, old);
  }
});

test('The hosted API serves CAPTCHA and CORS to the Cloudflare production origin', async () => {
  const oldOrigins = env.corsOrigins;
  env.corsOrigins = ['https://tinytints.pages.dev'];
  const server = createServer(createApp());
  env.corsOrigins = oldOrigins;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${base}/api/auth/captcha`, { headers: { Origin: 'https://tinytints.pages.dev' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://tinytints.pages.dev');
    const captcha = await response.json();
    assert.ok(captcha.captchaId);
    assert.match(captcha.svg, /^<svg/);
    const forbiddenOrigin = await fetch(`${base}/api/auth/captcha`, { headers: { Origin: 'https://unrelated.example' } });
    assert.equal(forbiddenOrigin.headers.get('access-control-allow-origin'), null);
    const health = await fetch(`${base}/api/health`);
    assert.deepEqual(await health.json(), { ok: true });
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
