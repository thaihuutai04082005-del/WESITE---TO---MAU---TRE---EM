import { pathToFileURL } from 'node:url';
import { createPostgresPool } from '../backend/src/config/postgres.js';

export async function checkPostgres(pool) {
  const conn = await pool.connect();
  try {
    await conn.query('BEGIN READ ONLY');
    const { rows } = await conn.query(
      "SELECT current_setting('server_version') AS version, (SELECT COUNT(*)::integer FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS public_tables",
    );
    await conn.query('ROLLBACK');
    return { connected: true, version: rows[0].version, publicTables: rows[0].public_tables };
  } finally {
    conn.release();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  let pool;
  try {
    pool = createPostgresPool(process.env.DATABASE_URL || '', process.env.PGPASSWORD);
    console.log(JSON.stringify(await checkPostgres(pool), null, 2));
  } catch (error) {
    // Provider messages and URLs can contain credentials. Report only known categories.
    const code = String(error.code || 'connection_failed');
    const known = {
      '28P01': 'Mật khẩu hoặc tên đăng nhập database không đúng.',
      ENOTFOUND: 'Không phân giải được tên máy chủ database.',
      ETIMEDOUT: 'Kết nối database hết thời gian chờ.',
      ECONNREFUSED: 'Máy chủ từ chối kết nối.',
      CERT_HAS_EXPIRED: 'Chứng chỉ TLS đã hết hạn.',
      SELF_SIGNED_CERT_IN_CHAIN: 'Cần cấu hình CA hợp lệ; không tắt xác minh TLS.',
    };
    console.error(known[code] || 'Không kết nối được. Kiểm tra DATABASE_URL, PGPASSWORD, mạng và chứng chỉ TLS.');
    process.exitCode = 1;
  } finally {
    await pool?.end();
  }
}
