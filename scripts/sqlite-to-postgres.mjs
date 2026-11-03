import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { statSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseAdapter } from '../backend/src/config/databaseAdapter.js';
import { createPostgresPool, migratePostgres } from '../backend/src/config/postgres.js';
import { REPO_ROOT } from '../backend/src/config/env.js';

const ident = (name) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) throw new Error('Unsupported database identifier');
  return `"${name}"`;
};
const tableOrder = () =>
  readdirSync(join(REPO_ROOT, 'database', 'postgres'))
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .flatMap((name) =>
      [...readFileSync(join(REPO_ROOT, 'database', 'postgres', name), 'utf8').matchAll(/CREATE TABLE\s+"?([a-z_]+)"?\s*\(/gi)].map(
        (match) => match[1],
      ),
    );
const digestRows = (hash, rows, columns) => {
  for (const row of rows) hash.update(JSON.stringify(columns.map((column) => row[column])) + '\n');
};

/** Import a private SQLite backup into an EMPTY PostgreSQL app schema. Never read the live Render filesystem. */
export async function importSqlite(sourcePath, target) {
  if (!statSync(sourcePath).isFile()) throw new Error('SQLite source must be a file');
  const source = new DatabaseSync(sourcePath, { readOnly: true });
  try {
    source.exec('BEGIN');
    if (source.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok' || source.prepare('PRAGMA foreign_key_check').all().length)
      throw new Error('SQLite backup failed integrity checks');
    const order = tableOrder();
    const tables = source
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '_migrations'")
      .all()
      .map((row) => row.name);
    if (tables.some((name) => !order.includes(name))) throw new Error('SQLite has unsupported tables; no data imported');
    await migratePostgres(target.pool);
    return await target.transaction(async () => {
      await target.exec(`LOCK TABLE ${order.map(ident).join(', ')} IN ACCESS EXCLUSIVE MODE`);
      for (const table of order)
        if ((await target.prepare(`SELECT COUNT(*) AS n FROM ${ident(table)}`).get()).n)
          throw new Error('PostgreSQL target is not empty; no data imported');
      const report = [];
      for (const table of order) {
        if (!tables.includes(table)) continue;
        const info = source.prepare(`PRAGMA table_info(${ident(table)})`).all();
        const columns = info.map((column) => column.name);
        const targetColumns = (
          await target.prepare("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ?").all(table)
        ).map((row) => row.column_name);
        if (columns.some((column) => !targetColumns.includes(column))) throw new Error('SQLite contains unsupported columns; import rolled back');
        const primary = info
          .filter((column) => column.pk)
          .sort((a, b) => a.pk - b.pk)
          .map((column) => column.name);
        if (!primary.length) throw new Error('Source table lacks a primary key; import rolled back');
        const ordering = (collation) =>
          primary
            .map(
              (column) =>
                ident(column) +
                (info
                  .find((entry) => entry.name === column)
                  .type.toUpperCase()
                  .includes('TEXT')
                  ? ` COLLATE ${collation}`
                  : ''),
            )
            .join(', ');
        const select = `SELECT ${columns.map(ident).join(', ')} FROM ${ident(table)} ORDER BY ${ordering('BINARY')} LIMIT ? OFFSET ?`;
        const targetSelect = `SELECT ${columns.map(ident).join(', ')} FROM ${ident(table)} ORDER BY ${ordering('\"C\"')} LIMIT ? OFFSET ?`;
        const expected = createHash('sha256');
        let count = 0;
        for (;;) {
          const rows = source.prepare(select).all(50, count);
          if (!rows.length) break;
          digestRows(expected, rows, columns);
          const placeholders = rows.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
          await target
            .prepare(`INSERT INTO ${ident(table)} (${columns.map(ident).join(',')}) VALUES ${placeholders}`)
            .run(...rows.flatMap((row) => columns.map((column) => row[column])));
          count += rows.length;
        }
        const actual = createHash('sha256');
        let copied = 0;
        for (;;) {
          const rows = await target.prepare(targetSelect).all(50, copied);
          if (!rows.length) break;
          digestRows(actual, rows, columns);
          copied += rows.length;
        }
        const checksum = expected.digest('hex');
        if (copied !== count || actual.digest('hex') !== checksum) throw new Error('Imported data checksum mismatch; import rolled back');
        report.push({ table, rows: count, checksum });
      }
      // Explicitly imported IDs must not collide with the next generated ID.
      const identities = await target
        .prepare("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND is_identity = 'YES'")
        .all();
      for (const { table_name: table, column_name: column } of identities) {
        const { maximum } = await target.prepare(`SELECT COALESCE(MAX(${ident(column)}), 0) AS maximum FROM ${ident(table)}`).get();
        await target.prepare('SELECT setval(pg_get_serial_sequence(?, ?), ?, ?)').get(`public.${table}`, column, Math.max(1, maximum), maximum > 0);
      }
      return { imported: true, source: 'SQLite backup supplied by operator; not necessarily the online Render database', tables: report };
    });
  } finally {
    try {
      source.exec('ROLLBACK');
    } finally {
      source.close();
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  let target;
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--import-backup') throw new Error('usage');
    target = new DatabaseAdapter({ pool: createPostgresPool(process.env.DATABASE_URL || '', process.env.PGPASSWORD) });
    console.log(JSON.stringify(await importSqlite(process.argv[3], target), null, 2));
  } catch (error) {
    const safe = [
      'PostgreSQL target is not empty; no data imported',
      'SQLite backup failed integrity checks',
      'SQLite has unsupported tables; no data imported',
      'SQLite contains unsupported columns; import rolled back',
      'Source table lacks a primary key; import rolled back',
      'Imported data checksum mismatch; import rolled back',
    ];
    console.error(
      safe.includes(error.message)
        ? error.message
        : 'Import failed. Check the backup, private connection settings and database access. No credential values are logged.',
    );
    console.error('Usage: node --env-file=backend/.env scripts/sqlite-to-postgres.mjs --import-backup PATH_TO_PRIVATE_BACKUP_DB');
    process.exitCode = 1;
  } finally {
    await target?.close();
  }
}
