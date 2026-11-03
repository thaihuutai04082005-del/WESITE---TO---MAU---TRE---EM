import { setDb } from '../../src/config/db.js';
import { postgresFixture } from './postgres.js';
const db = await postgresFixture();
setDb(db);
process.once('beforeExit', async () => {
  await db.close();
});
