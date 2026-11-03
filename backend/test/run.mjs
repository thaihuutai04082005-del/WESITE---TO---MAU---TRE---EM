import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const postgres = process.argv.includes('--postgres');
const args = ['--disable-warning=ExperimentalWarning'];
if (postgres) args.push('--import', fileURLToPath(new URL('./helpers/use-postgres.js', import.meta.url)));
args.push(
  '--test',
  ...(postgres
    ? ['test/api.test.js']
    : readdirSync(new URL('.', import.meta.url))
        .filter((name) => name.endsWith('.test.js'))
        .map((name) => `test/${name}`)),
);
const child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: '', PGPASSWORD: '' } });
child.on('error', () => {
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
