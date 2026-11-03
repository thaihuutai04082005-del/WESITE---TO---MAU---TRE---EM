import pg from 'pg';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './env.js';

export function postgresOptions(connectionString, password) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('Invalid DATABASE_URL');
  }
  if (password) url.password = encodeURIComponent(password);
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !url.hostname ||
    !url.username ||
    !url.password ||
    (!password && /YOUR-PASSWORD/i.test(connectionString))
  )
    throw new Error('DATABASE_URL requires PostgreSQL credentials');
  // These URI parameters can silently override node-postgres TLS options.
  for (const name of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'ssl']) url.searchParams.delete(name);
  return {
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: true },
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    statement_timeout: 30000,
    application_name: 'tinytints',
  };
}
export const createPostgresPool = (connectionString, password) => {
  const pool = new pg.Pool(postgresOptions(connectionString, password));
  pool.on('error', () => console.error('[database] idle PostgreSQL connection failed'));
  return pool;
};

export async function migratePostgres(pool) {
  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');
    await conn.query('SELECT pg_advisory_xact_lock(847294103)');
    await conn.query('CREATE TABLE IF NOT EXISTS _postgres_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
    const done = new Set((await conn.query('SELECT name FROM _postgres_migrations')).rows.map((row) => row.name));
    const dir = join(REPO_ROOT, 'database', 'postgres');
    for (const name of readdirSync(dir)
      .filter((name) => name.endsWith('.sql'))
      .sort()) {
      if (done.has(name)) continue;
      await conn.query(readFileSync(join(dir, name), 'utf8'));
      await conn.query('INSERT INTO _postgres_migrations (name, applied_at) VALUES ($1, $2)', [name, new Date().toISOString()]);
    }
    await conn.query('COMMIT');
  } catch (error) {
    await conn.query('ROLLBACK');
    throw error;
  } finally {
    conn.release();
  }
}
