import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { env } from '../src/config/env.js';
import { setDb, initializeDatabase } from '../src/config/db.js';
import { createApp } from '../src/app.js';
import { _peekCaptcha } from '../src/services/captcha.js';
import { seedAll, seedPicturesIfNeeded } from '../../database/seeds/seed.js';
import { postgresFixture } from './helpers/postgres.js';

test('A fresh email signup, password, saved art, card and plan survive closing and reopening PostgreSQL on disk', { timeout: 60000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'tinytints-pg-persistence-'));
  const originalEnv = { ...env };
  let db;
  let server;
  let base;
  Object.assign(env, { isProd: false, isTest: true, exposeDevOtp: true, phoneOtpEnabled: false,
    smtp: {}, sms: {}, brevo: {}, twilio: {}, paypal: {}, momo: {}, sepay: {}, admin: { password: '' } });
  const serve = async () => {
    server = createServer(createApp());
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}/api`;
  };
  const stop = async () => {
    if (!server) return;
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    server = null;
  };
  const request = async (method, path, body, token) => {
    const response = await fetch(base + path, { method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };
  try {
    db = await postgresFixture(join(directory, 'database'));
    setDb(db);
    await initializeDatabase();
    await seedAll();
    await serve();
    const captcha = (await request('GET', '/auth/captcha')).body;
    const signup = await request('POST', '/auth/register/start', {
      username: 'Persistent.Email', password: 'Keep12345', contactType: 'email',
      contact: 'persistence@example.invalid', language: 'vi',
      captchaId: captcha.captchaId, captchaText: _peekCaptcha(captcha.captchaId),
    });
    assert.equal(signup.status, 200);
    assert.equal((await request('POST', '/auth/register/verify', {
      registrationId: signup.body.registrationId, code: signup.body.devCode,
    })).status, 201);
    const login = await request('POST', '/auth/login', { username: 'Persistent.Email', password: 'Keep12345' });
    assert.equal(login.status, 200);
    const userId = login.body.user.id;
    assert.equal((await request('PUT', '/users/me', { nickname: 'Bé giữ tranh' }, login.body.token)).status, 200);
    const before = await db.prepare('SELECT password_hash,friend_code,guardian_contact FROM users WHERE id=?').get(userId);
    const picture = await db.prepare('SELECT id FROM pictures WHERE is_card=0 AND hidden=0 ORDER BY id LIMIT 1').get();
    const art = await request('POST', '/artworks', { pictureId: picture.id, mode: 'free' }, login.body.token);
    assert.equal(art.status, 201);
    const artId = art.body.artwork.id;
    const savedData = JSON.stringify({ fills: { saved: '#ff0000' }, strokes: [], stickers: [] });
    await db.prepare("UPDATE artworks SET data=?,status='completed' WHERE id=?").run(savedData, artId);
    const card = await db.prepare('SELECT id FROM pictures WHERE is_card=1 AND hidden=0 LIMIT 1').get();
    const owned = await db.prepare("INSERT INTO user_cards (user_id,picture_id,source) VALUES (?,?,'gacha') RETURNING id").get(userId, card.id);
    const endsAt = new Date(Date.now() + 30 * 86400000).toISOString();
    const subscription = await db.prepare("INSERT INTO subscriptions (user_id,plan,starts_at,ends_at) VALUES (?,'month',?,?) RETURNING id")
      .get(userId, new Date().toISOString(), endsAt);
    const migrations = await db.prepare('SELECT name FROM _postgres_migrations ORDER BY name').all();
    await stop();
    await db.close(); db = null;

    // A new engine and new HTTP server reuse only the persisted database directory.
    db = await postgresFixture(join(directory, 'database'));
    setDb(db);
    await initializeDatabase();
    assert.equal(await seedPicturesIfNeeded(), 0);
    await serve();
    const again = await request('POST', '/auth/login', { username: ' persistent.email ', password: 'Keep12345' });
    assert.equal(again.status, 200);
    assert.equal(again.body.user.id, userId);
    assert.deepEqual(await db.prepare('SELECT password_hash,friend_code,guardian_contact FROM users WHERE id=?').get(userId), before);
    assert.equal((await db.prepare('SELECT data FROM artworks WHERE id=? AND user_id=?').get(artId, userId)).data, savedData);
    assert.equal((await request('GET', `/artworks/${artId}`, undefined, again.body.token)).status, 200);
    assert.equal((await db.prepare('SELECT picture_id FROM user_cards WHERE id=? AND user_id=?').get(owned.id, userId)).picture_id, card.id);
    assert.equal((await db.prepare('SELECT ends_at FROM subscriptions WHERE id=? AND user_id=?').get(subscription.id, userId)).ends_at, endsAt);
    assert.deepEqual(await db.prepare('SELECT name FROM _postgres_migrations ORDER BY name').all(), migrations);
    assert.equal((await request('POST', '/auth/login', { username: 'Persistent.Email', password: 'Wrong12345' })).status, 401);
  } finally {
    await stop();
    await db?.close();
    Object.assign(env, originalEnv);
    rmSync(directory, { recursive: true, force: true });
  }
});

test('Supabase public API roles cannot read or mutate backend account tables, while the backend owner retains access', async () => {
  const db = await postgresFixture();
  let client;
  try {
    await db.exec(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
      GRANT USAGE ON SCHEMA public TO anon, authenticated;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
      ALTER TABLE users DISABLE ROW LEVEL SECURITY;`);
    await db.prepare("INSERT INTO users (username,password_hash,friend_code) VALUES ('private-user','private-test-hash','PRIVTEST')").run();
    // Model Supabase's pre-existing API grants, then apply the production migration.
    await db.exec(readFileSync(new URL('../../database/postgres/003_private_backend_tables.sql', import.meta.url), 'utf8'));
    client = await db.pool.connect();
    for (const role of ['anon', 'authenticated']) {
      await client.query(`SET ROLE ${role}`);
      for (const sql of ['SELECT password_hash FROM users', 'DELETE FROM users', 'TRUNCATE users', 'SELECT * FROM otp_codes']) {
        await assert.rejects(client.query(sql), error => error.code === '42501');
      }
      await client.query('RESET ROLE');
    }
    client.release(); client = null;
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM users').get()).n, 1);
    await db.prepare("UPDATE users SET nickname='Backend still works' WHERE username='private-user'").run();
    assert.equal((await db.prepare("SELECT nickname FROM users WHERE username='private-user'").get()).nickname, 'Backend still works');
  } finally {
    if (client) {
      await client.query('RESET ROLE');
      client.release();
    }
    await db.close();
  }
});
