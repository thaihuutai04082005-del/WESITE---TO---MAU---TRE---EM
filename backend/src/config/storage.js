import { isAbsolute, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { REPO_ROOT } from './env.js';

const within = (directory, file) => {
  const path = relative(directory, file);
  return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`));
};

/** Render's application filesystem is disposable, including backend/data and /tmp. */
export function assertDatabaseStorage(config, runtime = process.env) {
  const onRender = runtime.RENDER === 'true' || runtime.RENDER_SERVICE_ID || runtime.RENDER_EXTERNAL_URL;
  if (!config.isProd || !onRender || config.databaseUrl) return;

  // SQLite remains available on an explicitly configured, mounted paid disk.
  // The operator must attach that disk; a directory name alone cannot make it persistent.
  const directory = config.sqlitePersistentDir;
  if (directory && isAbsolute(directory) && isAbsolute(config.dbFile)) {
    const mount = resolve(directory);
    const file = resolve(config.dbFile);
    if (mount !== resolve('/') && !within(tmpdir(), mount) && !within(REPO_ROOT, mount)
        && file !== mount && within(mount, file)) return;
  }

  throw new Error(
    'Persistent database required on Render. Refusing to open SQLite on disposable storage. '
    + 'Configure DATABASE_URL for PostgreSQL, '
    + 'or attach a persistent disk and set SQLITE_PERSISTENT_DIR and DB_FILE inside its mount.',
  );
}
