import { spawn } from 'node:child_process';

/**
 * Local development: API (Express :5000) + Vite (usually :5173).
 * Register/login need both; Vite alone proxies /api to a dead port and looks "unreachable".
 */
const children = [];

function run(command, args, label) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  children.push(child);
  child.on('exit', (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
    }
  });
  return child;
}

run('node', ['server/server.js'], 'api');
run('npx', ['vite'], 'vite');

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
