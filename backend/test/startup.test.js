import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const productionEnv = (file) => ({
  ...process.env, NODE_ENV: 'production', DB_FILE: file,
  JWT_SECRET: 'isolated-production-test-secret-123456789', DATABASE_URL: '', PGPASSWORD: '', NODE_EXTRA_CA_CERTS: '', ADMIN_PASSWORD: '',
  RENDER: '', RENDER_SERVICE_ID: '', RENDER_EXTERNAL_URL: '', SQLITE_PERSISTENT_DIR: '',
  PAYPAL_CLIENT_ID: '', PAYPAL_CLIENT_SECRET: '', PAYPAL_WEBHOOK_ID: '',
  BREVO_API_KEY: '', TWILIO_AUTH_TOKEN: '', SEPAY_API_KEY: '', PHONE_OTP_ENABLED: 'false',
});

async function startProduction(file) {
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'src/server.js'], {
    cwd, env: { ...productionEnv(file), PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  const stop = async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    await exited;
  };
  const base = `http://127.0.0.1:${port}/api`;
  try {
    for (let attempt = 0; attempt < 150; attempt++) {
      if (child.exitCode !== null) assert.fail(`Production exited with ${child.exitCode}: ${output}`);
      try {
        const result = await fetch(`${base}/health`, { signal: AbortSignal.timeout(500) });
        if (result.ok) return { base, stop, output: () => output };
      } catch { /* wait for initial seed */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.fail(`Production never became healthy: ${output}`);
  } catch (error) {
    await stop();
    throw error;
  }
}

const login = (app, username, password = 'Persist12345') => fetch(`${app.base}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }),
});

test('Production entry point seeds SQLite, starts background jobs and serves HTTP', { timeout: 30000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'tinytints-production-'));
  let app;
  try {
    app = await startProduction(join(directory, 'app.db'));
    assert.match(app.output(), /API đang chạy/);
    assert.match(app.output(), /\[database\] engine=sqlite accounts=0 pictures=0/);
    const meta = await (await fetch(`${app.base}/meta`)).json();
    assert.equal(meta.payments.mockAllowed, false);
  } finally {
    await app?.stop();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('Render without persistent storage stops before creating or seeding a replacement database', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tinytints-unsafe-render-'));
  const file = join(directory, 'new-instance', 'app.db');
  try {
    const child = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', 'src/server.js'], {
      cwd, env: { ...productionEnv(file), RENDER: 'true' }, encoding: 'utf8', timeout: 10000,
    });
    assert.equal(child.signal, null, 'Startup must fail itself, not time out while serving an empty database');
    assert.notEqual(child.status, 0);
    assert.match(child.stderr, /Persistent database required on Render/);
    assert.doesNotMatch(child.stdout, /\[seed\]|API đang chạy/);
    assert.equal(existsSync(join(directory, 'new-instance')), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('Old email and phone accounts keep passwords, art, cards and plans after restart and library cleanup; a different database has no such accounts', { timeout: 45000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'tinytints-account-restart-'));
  const file = join(directory, 'app.db');
  let app;
  let db;
  try {
    app = await startProduction(file);
    const hash = await bcrypt.hash('Persist12345', 4);
    db = new DatabaseSync(file);
    db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    const picture = db.prepare('SELECT id FROM pictures WHERE is_card=0 AND hidden=0 ORDER BY id LIMIT 1').get();
    const card = db.prepare('SELECT id FROM pictures WHERE is_card=1 AND hidden=0 LIMIT 1').get();
    const accounts = ['phone', 'email'].map((type) => {
      const username = `Saved.${type}`;
      const friendCode = `OLD${type.toUpperCase()}`;
      const user = db.prepare('INSERT INTO users (username,password_hash,friend_code,nickname,guardian_type,guardian_contact) VALUES (?,?,?,?,?,?) RETURNING id')
        .get(username, hash, friendCode, 'Old test account', type, type === 'phone' ? '+12025550199' : 'saved@example.invalid');
      const data = JSON.stringify({ fills: { unchanged: '#ff0000' }, strokes: [], stickers: [] });
      const art = db.prepare("INSERT INTO artworks (user_id,picture_id,mode,status,data) VALUES (?,?,'free','completed',?) RETURNING id")
        .get(user.id, picture.id, data);
      return { id: user.id, username, friendCode, artworkId: art.id, data };
    });
    const ownedCard = db.prepare("INSERT INTO user_cards (user_id,picture_id,source) VALUES (?,?,'gacha') RETURNING id").get(accounts[0].id, card.id);
    const end = new Date(Date.now() + 30 * 86400000).toISOString();
    const subscription = db.prepare("INSERT INTO subscriptions (user_id,plan,starts_at,ends_at) VALUES (?,'month',?,?) RETURNING id")
      .get(accounts[1].id, new Date().toISOString(), end);
    for (const account of accounts) assert.equal((await login(app, account.username)).status, 200);
    db.close(); db = null;
    await app.stop(); app = null;

    // Exercise the same library refresh and hidden-art cleanup used by the recent update.
    db = new DatabaseSync(file);
    db.prepare('UPDATE pictures SET asset_hash = NULL WHERE id = ?').run(picture.id);
    db.prepare(`INSERT INTO pictures (object_id,slug,variant_slug,name_vi,name_en,variant_name_vi,variant_name_en,svg,manifest,hidden)
      SELECT object_id,'old-hidden-restart-test',variant_slug,name_vi,name_en,variant_name_vi,variant_name_en,svg,manifest,1 FROM pictures WHERE id = ?`).run(picture.id);
    db.close(); db = null;

    app = await startProduction(file);
    assert.match(app.output(), /\[database\] engine=sqlite accounts=2 pictures=/);
    assert.match(app.output(), /\[seed\] Đã nạp bộ tranh mới/);
    db = new DatabaseSync(file, { readOnly: true });
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM pictures WHERE slug='old-hidden-restart-test'").get().n, 0);
    for (const account of accounts) {
      const response = await login(app, ` ${account.username.toUpperCase()} `);
      assert.equal(response.status, 200);
      const session = await response.json();
      assert.equal(session.user.id, account.id);
      const saved = db.prepare('SELECT password_hash,friend_code FROM users WHERE id=?').get(account.id);
      assert.equal(saved.password_hash, hash);
      assert.equal(saved.friend_code, account.friendCode);
      assert.equal(db.prepare('SELECT data FROM artworks WHERE id=? AND user_id=?').get(account.artworkId, account.id).data, account.data);
      const art = await fetch(`${app.base}/artworks/${account.artworkId}`, { headers: { Authorization: `Bearer ${session.token}` } });
      assert.equal(art.status, 200);
    }
    assert.equal(db.prepare('SELECT picture_id FROM user_cards WHERE id=?').get(ownedCard.id).picture_id, card.id);
    assert.equal(db.prepare('SELECT ends_at FROM subscriptions WHERE id=?').get(subscription.id).ends_at, end);
    db.close(); db = null;
    assert.equal((await login(app, accounts[0].username, 'Wrong12345')).status, 401);
    await app.stop(); app = null;

    // A fresh filesystem can still seed the pictures and look healthy while every old login fails.
    app = await startProduction(join(directory, 'different-instance.db'));
    assert.match(app.output(), /\[database\] engine=sqlite accounts=0 pictures=0/);
    for (const account of accounts) {
      const response = await login(app, account.username);
      assert.equal(response.status, 401);
      assert.equal((await response.json()).error.code, 'invalid_credentials');
    }
  } finally {
    db?.close();
    await app?.stop();
    rmSync(directory, { recursive: true, force: true });
  }
});
