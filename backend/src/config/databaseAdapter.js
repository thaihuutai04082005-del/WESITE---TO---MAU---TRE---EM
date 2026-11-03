import { AsyncLocalStorage } from 'node:async_hooks';

/** Keep the existing SQL/row interface while all I/O is awaited. */
export class DatabaseAdapter {
  context = new AsyncLocalStorage();
  tail = Promise.resolve();
  constructor({ sqlite, pool }) {
    this.sqlite = sqlite;
    this.pool = pool;
    this.dialect = pool ? 'postgres' : 'sqlite';
  }
  get isTransaction() {
    return !!this.context.getStore();
  }
  async exclusive(fn) {
    const previous = this.tail;
    let release;
    this.tail = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  }
  async query(sql, values = [], mode = 'all') {
    if (this.sqlite) {
      const execute = () => (mode === 'exec' ? this.sqlite.exec(sql) : this.sqlite.prepare(sql)[mode](...values));
      return this.isTransaction ? execute() : this.exclusive(execute);
    }
    const client = this.context.getStore()?.client || this.pool;
    const result = await client.query(postgresSql(sql, mode), values);
    if (mode === 'exec') return;
    const rows = result.rows.map((row) => {
      const out = { ...row };
      for (const field of result.fields || [])
        if (field.dataTypeID === 20 && out[field.name] != null) {
          const number = Number(out[field.name]);
          if (!Number.isSafeInteger(number)) throw new Error('Database integer exceeds the supported range');
          out[field.name] = number;
        }
      return out;
    });
    if (mode === 'get') return rows[0];
    if (mode === 'run') return { changes: result.rowCount ?? result.affectedRows ?? rows.length, lastInsertRowid: rows[0]?.id ?? 0 };
    return rows;
  }
  prepare(sql) {
    return Object.fromEntries(['all', 'get', 'run'].map((mode) => [mode, (...values) => this.query(sql, values, mode)]));
  }
  exec(sql) {
    return this.query(sql, [], 'exec');
  }
  async transaction(fn) {
    if (this.isTransaction) return fn(this);
    if (this.sqlite)
      return this.exclusive(() =>
        this.context.run({ afterCommit: [] }, async () => {
          this.sqlite.exec('BEGIN IMMEDIATE');
          try {
            const result = await fn(this);
            this.sqlite.exec('COMMIT');
            this.flushAfterCommit();
            return result;
          } catch (error) {
            this.sqlite.exec('ROLLBACK');
            throw error;
          }
        }),
      );
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Preserve SQLite's serialized application transactions across server instances.
      await client.query('SELECT pg_advisory_xact_lock(847294102)');
      return await this.context.run({ client, afterCommit: [] }, async () => {
        try {
          const result = await fn(this);
          await client.query('COMMIT');
          this.flushAfterCommit();
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      });
    } finally {
      client.release();
    }
  }
  flushAfterCommit() {
    for (const callback of this.context.getStore().afterCommit) {
      try {
        callback();
      } catch {
        console.error('[database] post-commit notification failed');
      }
    }
  }
  afterCommit(fn) {
    const context = this.context.getStore();
    if (context) context.afterCommit.push(fn);
    else fn();
  }
  async close() {
    if (this.sqlite) this.sqlite.close();
    else await this.pool.end();
  }
}

/** Translate placeholders outside strings/comments, never interpolate user values. */
export function postgresSql(input, mode = 'all') {
  let sql = input.trim().replace(/;\s*$/, '');
  const ignore = /^INSERT\s+OR\s+IGNORE\s+/i.test(sql);
  sql = sql.replace(/^INSERT\s+OR\s+IGNORE\s+/i, 'INSERT ');
  const table = sql.match(/^INSERT\s+INTO\s+([a-z_]+)/i)?.[1];
  // PostgreSQL requires the current table to disambiguate it from EXCLUDED.
  if (table) sql = sql.replace(/\bSET value = value \+/i, `SET value = ${table}.value +`);
  let out = '',
    quote = null,
    comment = null,
    parameter = 0;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i],
      next = sql[i + 1];
    if (comment) {
      out += c;
      if (comment === 'line' && c === '\n') comment = null;
      else if (comment === 'block' && c === '*' && next === '/') {
        out += next;
        i++;
        comment = null;
      }
      continue;
    }
    if (quote) {
      out += c;
      if (c === quote) {
        if (next === quote) {
          out += next;
          i++;
        } else quote = null;
      }
      continue;
    }
    if (c === '-' && next === '-') {
      comment = 'line';
      out += c + next;
      i++;
    } else if (c === '/' && next === '*') {
      comment = 'block';
      out += c + next;
      i++;
    } else if (c === "'" || c === '"') {
      quote = c;
      out += c;
    } else out += c === '?' ? `$${++parameter}` : c;
  }
  if (ignore) out += ' ON CONFLICT DO NOTHING';
  if (mode === 'run' && table && !/\bRETURNING\b/i.test(out)) out += ' RETURNING *';
  return out;
}
