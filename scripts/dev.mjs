// Chạy song song backend (cổng 4000) và frontend Vite (cổng 5173) cho môi trường phát triển.
import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const procs = [
  ['api', ['run', 'dev', '-w', 'backend']],
  ['web', ['run', 'dev', '-w', 'frontend']],
].map(([name, args]) => {
  // Windows: Node ≥ 20.12 bắt buộc bật shell khi chạy file .cmd; truyền cả câu lệnh để tránh cảnh báo DEP0190.
  const opts = { stdio: ['inherit', 'pipe', 'pipe'] };
  const p = process.platform === 'win32' ? spawn(`${npm} ${args.join(' ')}`, { ...opts, shell: true }) : spawn(npm, args, opts);
  const tag = (chunk) => chunk.toString().split('\n').filter(Boolean).map((l) => `[${name}] ${l}`).join('\n') + '\n';
  p.stdout.on('data', (c) => process.stdout.write(tag(c)));
  p.stderr.on('data', (c) => process.stderr.write(tag(c)));
  p.on('exit', (code) => {
    console.log(`[${name}] đã dừng (mã ${code})`);
    procs.forEach((x) => x !== p && x.kill());
    process.exit(code ?? 0);
  });
  return p;
});

process.on('SIGINT', () => procs.forEach((p) => p.kill('SIGINT')));
