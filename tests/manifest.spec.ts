import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

async function runTest() {
  const manifestPath = resolve(root, "public/manifest.webmanifest");
  
  // 1. Verificar que existe public/manifest.webmanifest
  try {
    await access(manifestPath);
  } catch (err) {
    assert.fail("El archivo public/manifest.webmanifest no existe.");
  }
  
  const manifestRaw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw);

  // 2. Validar los campos requeridos
  assert.ok(manifest.name, "Manifest debe tener la propiedad 'name'");
  assert.ok(manifest.icons && Array.isArray(manifest.icons) && manifest.icons.length > 0, "Manifest debe tener la propiedad 'icons'");
  assert.ok(manifest.display, "Manifest debe tener la propiedad 'display'");
  assert.ok(manifest.scope, "Manifest debe tener la propiedad 'scope'");
  assert.ok(manifest.start_url, "Manifest debe tener la propiedad 'start_url'");

  // 3. Comprobar que las rutas de iconos existen
  for (const icon of manifest.icons) {
    // Eliminamos el slash inicial si lo tiene para resolver correctamente
    const srcPath = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
    const iconPath = resolve(root, "public", srcPath);
    try {
      await access(iconPath);
    } catch (e) {
      assert.fail(`El icono declarado en manifest no existe en la ruta física: ${iconPath}`);
    }
  }

  console.log("manifest.spec.ts: PASS");
}

runTest().catch(err => {
  console.error("manifest.spec.ts: FAILED");
  console.error(err);
  process.exit(1);
});
