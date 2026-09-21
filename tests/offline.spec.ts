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

  // 2. La navegación tiene fallback offline
  // Buscamos que valide modo navegación y responda con offline.html si la red falla
  assert.match(swRaw, /mode\s*===\s*['"`]navigate['"`]/, "No tiene validación para request.mode === 'navigate'");
  assert.match(swRaw, /caches\.match\(['"`]\/offline\.html['"`]\)/, "No tiene el fallback directo a caches.match('/offline.html')");
  
  // Verificamos de forma general que exista un catch para el fetch o un catch general en esa sección
  assert.match(swRaw, /fetch\(.+\)\.catch\(/, "No tiene un catch en el fetch principal de navegación para disparar el fallback");

  console.log("offline.spec.ts: PASS");
}

runTest().catch(err => {
  console.error("offline.spec.ts: FAILED");
  console.error(err);
  process.exit(1);
});
