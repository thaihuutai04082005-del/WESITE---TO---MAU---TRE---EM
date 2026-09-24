// Kết nối SQLite (node:sqlite có sẵn trong Node ≥ 22.5) + chạy migration trong database/migrations.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { env, REPO_ROOT } from './env.js';

let db;

export function openDb(file = env.dbFile) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const conn = new DatabaseSync(file);
  conn.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  migrate(conn);
  return conn;
}

export function migrate(conn) {
  conn.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  const dir = join(REPO_ROOT, 'database', 'migrations');
  const done = new Set(conn.prepare('SELECT name FROM _migrations').all().map((r) => r.name));
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    if (done.has(name)) continue;
    conn.exec('BEGIN');
    try {
      conn.exec(readFileSync(join(dir, name), 'utf8'));
      conn.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(name, new Date().toISOString());
      conn.exec('COMMIT');
    } catch (err) {
      conn.exec('ROLLBACK');
      throw new Error(`Migration ${name} lỗi: ${err.message}`);
    }
  }
}

export function getDb() {
  if (!db) db = openDb();
  return db;
}

/** Dùng trong test: thay DB mặc định. */
export function setDb(conn) {
  db = conn;
}

/** Chạy fn trong một transaction; tự rollback khi lỗi. */
export function tx(fn) {
  const conn = getDb();
  if (conn.isTransaction) return fn(conn);
  conn.exec('BEGIN IMMEDIATE');
  try {
    const out = fn(conn);
    conn.exec('COMMIT');
    return out;
  } catch (err) {
    conn.exec('ROLLBACK');
    throw err;
  }
}

export const now = () => new Date().toISOString();
export const parseJson = (s, fallback = null) => {
  if (s == null) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};
