// scripts/test.mjs
// Punto de entrada de `npm test`.
//  - Uso normal (sin argumentos): Suite de seguridad, Vitest (unit + integracion) y Playwright (E2E).
//  - Modo compatibilidad (`--run`): los workflows de evaluacion ejecutan `npm run test -- --run`
//    delegando en `npm run test:legacy`, que incluye la suite de seguridad de la semana 9.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const legacyMode = args.includes('--run');

function run(command, commandArgs) {
  console.log(`\n> ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (legacyMode) {
  run('npm', ['run', 'test:legacy']);
} else {
  run('npm', ['run', 'test:security']);
  run('npx', ['vitest', 'run', 'tests/unit', 'tests/integration']);
  run('npx', ['playwright', 'test', ...args]);
}
