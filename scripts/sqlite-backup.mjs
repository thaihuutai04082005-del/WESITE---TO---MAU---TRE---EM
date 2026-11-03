// Run on the machine holding the source database. A backup includes account data:
// keep it private and outside Git. Restore only while the application is stopped.
import { DatabaseSync, backup } from 'node:sqlite';
import { chmodSync, closeSync, linkSync, mkdirSync, openSync, rmSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export async function snapshotDatabase(source, destination) {
  source = resolve(source);
  destination = resolve(destination);
  if (source === destination) throw new Error('Source and destination must differ');
  if (!statSync(source).isFile()) throw new Error('Source must be an existing database file');
  mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
  const stage = `${destination}.partial-${randomUUID()}`;
  let input;
  let output;
  try {
    // Reserve the staging file privately before SQLite writes any account data.
    closeSync(openSync(stage, 'wx', 0o600));
    input = new DatabaseSync(source, { readOnly: true });
    // SQLite's online backup API reads a consistent snapshot, including WAL data.
    await backup(input, stage);
    chmodSync(stage, 0o600);
    output = new DatabaseSync(stage, { readOnly: true });
    const check = output.prepare('PRAGMA integrity_check').all();
    if (check.length !== 1 || check[0].integrity_check !== 'ok') throw new Error('Database integrity check failed');
    if (output.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Database foreign-key check failed');
    output.close();
    output = null;
    // Atomic publication that refuses to replace an existing backup/database.
    linkSync(stage, destination);
    return destination;
  } finally {
    output?.close();
    input?.close();
    rmSync(stage, { force: true });
    rmSync(`${stage}-wal`, { force: true });
    rmSync(`${stage}-shm`, { force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [, , source, destination] = process.argv;
  if (!source || !destination || process.argv.length !== 4) {
    console.error('Usage: node scripts/sqlite-backup.mjs SOURCE_DB NEW_BACKUP_OR_RESTORE_FILE');
    process.exitCode = 1;
  } else {
    try {
      await snapshotDatabase(source, destination);
      console.log('SQLite snapshot created and integrity checked. Existing destinations are never overwritten.');
    } catch (error) {
      console.error(`SQLite snapshot failed: ${error.code || error.message}`);
      process.exitCode = 1;
    }
  }
}
