import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

async function runTest() {
  const csrPath = resolve(root, "src/app/inspecciones/page.tsx");
  const ssrPath = resolve(root, "src/app/inspecciones/[id]/page.tsx");
  const loadingPath = resolve(root, "src/components/loading-state.tsx");
  
  // 1. Verificamos que existen los componentes
  await access(csrPath);
  await access(ssrPath);
  await access(loadingPath);

  const csrContent = await readFile(csrPath, "utf8");
  const ssrContent = await readFile(ssrPath, "utf8");
  const loadingContent = await readFile(loadingPath, "utf8");

  // 2. Validar CSR
  assert.match(csrContent, /'use client'|"use client"/, "El listado no es un componente de cliente (CSR)");
  assert.match(csrContent, /LoadingState/, "El CSR no usa LoadingState");
  assert.match(csrContent, /setTimeout/, "El CSR no tiene latencia simulada para el LoadingState");
  assert.match(csrContent, /useState/, "El CSR no maneja estados locales");

  // 3. Validar SSR
  if (ssrContent.includes('use client') || ssrContent.includes('"use client"')) {
    assert.fail("La página de detalle no debe ser 'use client' (debe ser SSR)");
  }
  assert.match(ssrContent, /notFound/, "El SSR no maneja errores 404 (notFound)");
  assert.match(ssrContent, /generateMetadata/, "El SSR no genera metadatos para SEO");

  // 4. Validar Accesibilidad en LoadingState
  assert.match(loadingContent, /role=["']status["']/, "LoadingState no tiene role='status'");
  assert.match(loadingContent, /aria-busy=["']true["']/, "LoadingState no tiene aria-busy='true'");

  console.log("rendering.spec.ts: PASS");
}

runTest().catch(err => {
  console.error("rendering.spec.ts: FAILED");
  console.error(err);
  process.exit(1);
});
