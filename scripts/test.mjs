// scripts/test.mjs
// Punto de entrada de `npm test`.
//  - Uso normal (sin argumentos): Vitest (unit + integración) y luego Playwright (E2E),
//    equivalente a: vitest run tests/unit tests/integration && playwright test
//  - Modo compatibilidad (`--run`): los workflows formativos de las semanas 2-6 ejecutan
//    `npm run test -- --run` sin instalar navegadores; en ese caso solo se corren las
//    pruebas históricas (`npm run test:legacy`).
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
  run('npx', ['vitest', 'run', 'tests/unit', 'tests/integration']);
  run('npx', ['playwright', 'test', ...args]);
}
