import { PGlite } from '@electric-sql/pglite';
import { DatabaseAdapter } from '../../src/config/databaseAdapter.js';
import { migratePostgres } from '../../src/config/postgres.js';

// PGlite runs real PostgreSQL in-process. Serialize access to emulate a leased
// session; the hosted driver uses pg.Pool with separate client connections.
export async function postgresFixture() {
  const engine = await PGlite.create();
  let tail = Promise.resolve();
  const acquire = async () => {
    const previous = tail;
    let release;
    tail = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    return release;
  };
  const query = async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], fields: [] };
    // pg accepts multiple unparameterized statements; PGlite uses exec for these.
    if (!params.length && /;\s*\S/.test(sql)) return engine.exec(sql);
    return engine.query(sql, params);
  };
  const pool = {
    async query(sql, params) {
      const release = await acquire();
      try {
        return await query(sql, params);
      } finally {
        release();
      }
    },
    async connect() {
      const release = await acquire();
      return { query, release };
    },
    async end() {
      await engine.close();
    },
  };
  await migratePostgres(pool);
  return new DatabaseAdapter({ pool });
}
