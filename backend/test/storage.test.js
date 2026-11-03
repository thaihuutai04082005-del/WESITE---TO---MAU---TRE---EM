import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { snapshotDatabase } from '../../scripts/sqlite-backup.mjs';

test('Backup and restore preserve committed WAL data, account IDs and artwork relations', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tinytints-storage-'));
  const original = join(dir, 'original.db');
  let live;
  let restored;
  try {
    live = new DatabaseSync(original);
    live.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE users(id INTEGER PRIMARY KEY, password_hash TEXT);
      CREATE TABLE artworks(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), data TEXT);
      INSERT INTO users VALUES(42, 'test-hash');
      INSERT INTO artworks VALUES(7,42,'{"fills":{"a":"#ff0000"}}');`);
    const copy = join(dir, 'private', 'backup.db');
    await snapshotDatabase(original, copy);
    live.exec('DELETE FROM artworks; DELETE FROM users;');
    const target = join(dir, 'restored.db');
    await snapshotDatabase(copy, target);
    restored = new DatabaseSync(target);
    assert.equal(restored.prepare('SELECT password_hash FROM users WHERE id=42').get().password_hash, 'test-hash');
    assert.equal(restored.prepare('SELECT user_id FROM artworks WHERE id=7').get().user_id, 42);
    assert.equal(restored.prepare('SELECT data FROM artworks WHERE id=7').get().data, '{"fills":{"a":"#ff0000"}}');
    assert.equal(statSync(copy).mode & 0o777, 0o600);
    await assert.rejects(snapshotDatabase(copy, target), { code: 'EEXIST' });
    assert.equal(restored.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1);
    await assert.rejects(snapshotDatabase(copy, copy), /must differ/);
    const missing = join(dir, 'missing.db');
    await assert.rejects(snapshotDatabase(missing, join(dir, 'new.db')), { code: 'ENOENT' });
    assert.equal(existsSync(missing), false);
    writeFileSync(join(dir, 'corrupt.db'), 'not a database');
    await assert.rejects(snapshotDatabase(join(dir, 'corrupt.db'), join(dir, 'bad-copy.db')));
    assert.equal(existsSync(join(dir, 'bad-copy.db')), false);
  } finally {
    restored?.close();
    live?.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
