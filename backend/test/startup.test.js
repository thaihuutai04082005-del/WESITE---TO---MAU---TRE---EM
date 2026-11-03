import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('Production entry point seeds SQLite, starts background jobs and serves HTTP', { timeout: 30000 }, async () => {
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const directory = mkdtempSync(join(tmpdir(), 'tinytints-production-'));
  const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'src/server.js'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), DB_FILE: join(directory, 'app.db'),
      JWT_SECRET: 'isolated-production-test-secret-123456789', DATABASE_URL: '', PGPASSWORD: '', NODE_EXTRA_CA_CERTS: '', ADMIN_PASSWORD: '',
      PAYPAL_CLIENT_ID: '', PAYPAL_CLIENT_SECRET: '', PAYPAL_WEBHOOK_ID: '',
      BREVO_API_KEY: '', TWILIO_AUTH_TOKEN: '', SEPAY_API_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  try {
    let healthy = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      if (child.exitCode !== null) assert.fail(`Production exited with ${child.exitCode}: ${output}`);
      try {
        const result = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(500) });
        if (result.ok) { healthy = true; break; }
      } catch { /* wait for initial seed */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(healthy, `Production never became healthy: ${output}`);
    assert.match(output, /API đang chạy/);
    const meta = await (await fetch(`http://127.0.0.1:${port}/api/meta`)).json();
    assert.equal(meta.payments.mockAllowed, false);
  } finally {
    child.kill('SIGTERM');
    await exited;
    rmSync(directory, { recursive: true, force: true });
  }
});
