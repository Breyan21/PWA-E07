import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

async function runTest() {
  const swPath = resolve(root, "public/sw.js");
  
  // 1. Verificar que existe public/sw.js
  try {
    await access(swPath);
  } catch (err) {
    assert.fail("El archivo public/sw.js no existe.");
  }
  
  const swRaw = await readFile(swPath, "utf8");

  // 2. Service worker existe y tiene listeners de install, activate y fetch
  assert.match(swRaw, /addEventListener\(['"`]install['"`]/, "No tiene listener de install");
  assert.match(swRaw, /addEventListener\(['"`]activate['"`]/, "No tiene listener de activate");
  assert.match(swRaw, /addEventListener\(['"`]fetch['"`]/, "No tiene listener de fetch");

  // 3. El precache contiene manifest, iconos y fallback
  assert.match(swRaw, /manifest\.webmanifest/, "El precache debe incluir el manifest");
  assert.match(swRaw, /offline\.html/, "El precache debe incluir el fallback offline.html");
  assert.match(swRaw, /icon-192\.png/, "El precache debe incluir al menos un icono");

  // 4. Solo se cachean solicitudes GET del mismo origen
  // Verificamos que contenga condicionales rechazando métodos distintos a GET y orígenes distintos
  assert.match(swRaw, /method\s*!==\s*['"`]GET['"`]/i, "Debe rechazar solicitudes que no sean GET");
  assert.match(swRaw, /origin\s*!==\s*self\.location\.origin/i, "Debe rechazar solicitudes cross-origin");

  // 5. Los nombres de caché están versionados y se limpian versiones anteriores
  assert.match(swRaw, /CACHE_VERSION\s*=\s*['"`]v\d+['"`]/i, "Las cachés deben estar versionadas");
  assert.match(swRaw, /\$\{CACHE_VERSION\}/, "Los nombres de caché deben usar la variable versionada");
  assert.match(swRaw, /caches\.delete\(/, "Debe limpiar cachés anteriores (caches.delete)");

  // 6. Existe mecanismo de actualización/invalidation controlada
  assert.match(swRaw, /addEventListener\(['"`]message['"`]/, "No tiene listener de message para invalidación");
  assert.match(swRaw, /CLEAR_RUNTIME_CACHE|SKIP_WAITING/, "No contiene el mecanismo de CLEAR_RUNTIME_CACHE o SKIP_WAITING");

  console.log("service-worker.spec.ts: PASS");
}

runTest().catch(err => {
  console.error("service-worker.spec.ts: FAILED");
  console.error(err);
  process.exit(1);
});
