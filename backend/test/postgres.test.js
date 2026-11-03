import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { openDb } from '../src/config/db.js';
import { DatabaseAdapter, postgresSql } from '../src/config/databaseAdapter.js';
import { postgresOptions } from '../src/config/postgres.js';
import { postgresFixture } from './helpers/postgres.js';
import { importSqlite } from '../../scripts/sqlite-to-postgres.mjs';
import { checkPostgres } from '../../scripts/postgres-check.mjs';
let target;
before(async () => {
  target = await postgresFixture();
});
after(async () => {
  await target.close();
});

test('PostgreSQL values stay parameterized; credentials cannot disable TLS verification', () => {
  assert.equal(
    postgresSql("SELECT '?' AS literal, ? AS value -- ?\n/* ? */ WHERE 'a''?' != ?"),
    "SELECT '?' AS literal, $1 AS value -- ?\n/* ? */ WHERE 'a''?' != $2",
  );
  assert.equal(
    postgresSql('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)', 'run'),
    'INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
  );
  const options = postgresOptions('postgresql://postgres.project:[YOUR-PASSWORD]@pooler.example.com:5432/postgres?sslmode=disable', 'p@ss:#%/word');
  assert.equal(options.ssl.rejectUnauthorized, true);
  assert.equal(new URL(options.connectionString).searchParams.has('sslmode'), false);
  assert.equal(decodeURIComponent(new URL(options.connectionString).password), 'p@ss:#%/word');
  assert.throws(() => postgresOptions('postgresql://user:[YOUR-PASSWORD]@host/db'));
  assert.throws(() => postgresOptions('https://user:pass@host/db'));
});

test('SQLite transactions serialize overlapping requests and hide rolled-back writes', async () => {
  const sqlite = new DatabaseAdapter({ sqlite: openDb(':memory:') });
  try {
    const events = [];
    const first = sqlite.transaction(async () => {
      await sqlite.prepare("INSERT INTO app_settings VALUES ('rollback', 'secret')").run();
      sqlite.afterCommit(() => events.push('must not emit'));
      await new Promise((resolve) => setTimeout(resolve, 15));
      throw new Error('rollback');
    });
    const second = sqlite.prepare("SELECT value FROM app_settings WHERE key = 'rollback'").get();
    await assert.rejects(first, /rollback/);
    assert.equal(await second, undefined);
    assert.deepEqual(events, []);
  } finally {
    await sqlite.close();
  }
});

test('A SQLite WAL backup imports exact IDs, password hashes, art, paid plans, and reusable sequences', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tinytints-pg-import-'));
  const path = join(dir, 'backup.db');
  const source = openDb(path);
  try {
    const hash = await bcrypt.hash('secret123', 4);
    source
      .prepare("INSERT INTO users (id, username, password_hash, nickname, friend_code) VALUES (42, 'Mixed.Name', ?, 'Bé Tài', 'TESTCODE')")
      .run(hash);
    source.prepare("INSERT INTO themes (id, slug, name_vi, name_en) VALUES (7, 'theme', 'Chủ đề', 'Theme')").run();
    source.prepare("INSERT INTO objects (id, theme_id, slug, name_vi, name_en) VALUES (8, 7, 'object', 'Mèo', 'Cat')").run();
    source
      .prepare(
        "INSERT INTO pictures (id, object_id, slug, variant_slug, name_vi, name_en, variant_name_vi, variant_name_en, svg, manifest) VALUES (20, 8, 'picture', 'one', 'Mèo', 'Cat', 'Một', 'One', '<svg/>', '{}')",
      )
      .run();
    source
      .prepare("INSERT INTO artworks (id, user_id, picture_id, mode, data, status) VALUES (91, 42, 20, 'free', ?, 'completed')")
      .run('{"fills":{"vùng-1":"#ff0000"}}');
    source
      .prepare(
        "INSERT INTO payments (id, user_id, plan, provider, amount, currency, status, txn_ref) VALUES ('pay-1', 42, 'month', 'paypal', 0.79, 'USD', 'paid', 'paypal:TX1')",
      )
      .run();
    source
      .prepare(
        "INSERT INTO subscriptions (id, user_id, plan, starts_at, ends_at, payment_id) VALUES (99, 42, 'month', '2026-11-03T00:00:00Z', '2026-12-03T00:00:00Z', 'pay-1')",
      )
      .run();
    source.prepare("INSERT INTO app_settings VALUES ('aA', '1'), ('Aa', '2'), ('zz', '3')").run();
    const report = await importSqlite(path, target);
    assert.equal(report.imported, true);
    assert.equal(report.tables.find((row) => row.table === 'artworks').rows, 1);
    const user = await target.prepare('SELECT * FROM users WHERE id = 42').get();
    assert.equal(user.password_hash, hash);
    assert.equal(await bcrypt.compare('secret123', user.password_hash), true);
    assert.equal(user.nickname, 'Bé Tài');
    assert.equal((await target.prepare('SELECT * FROM artworks WHERE id = 91').get()).data, '{"fills":{"vùng-1":"#ff0000"}}');
    assert.equal((await target.prepare('SELECT * FROM subscriptions WHERE id = 99').get()).payment_id, 'pay-1');
    assert.equal((await target.prepare("INSERT INTO users (username, friend_code) VALUES ('next', 'NEXTCODE')").run()).lastInsertRowid, 43);
    await assert.rejects(importSqlite(path, target), /not empty/);
    assert.equal((await target.prepare('SELECT COUNT(*) AS n FROM users').get()).n, 2);
    assert.equal(source.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1, 'source was not modified');
    assert.equal((await checkPostgres(target.pool)).connected, true);
  } finally {
    source.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('PostgreSQL rolls back a partially copied import when any source row violates constraints', async () => {
  const isolated = await postgresFixture();
  const dir = mkdtempSync(join(tmpdir(), 'tinytints-pg-reject-'));
  const path = join(dir, 'invalid.db');
  const source = openDb(path);
  try {
    source.prepare("INSERT INTO users (id, username, friend_code) VALUES (1, 'valid', 'VALID')").run();
    // Older/custom SQLite schema may permit data that the current app rejects.
    source.exec('PRAGMA ignore_check_constraints = ON');
    source.prepare("INSERT INTO payments (id, user_id, plan, provider, amount, currency) VALUES ('invalid', 1, 'invalid', 'paypal', 1, 'USD')").run();
    // The invalid row must be rejected either by the source integrity check or by PostgreSQL; earlier copied users must roll back.
    await assert.rejects(importSqlite(path, isolated), /integrity|check constraint/);
    assert.equal((await isolated.prepare('SELECT COUNT(*) AS n FROM users').get()).n, 0);
  } finally {
    source.close();
    rmSync(dir, { recursive: true, force: true });
    await isolated.close();
  }
});
