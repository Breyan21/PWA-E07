# Estrategia de pruebas · Semana 8 (PWA-E07)

Autor de este documento: José Miguel Jiménez Enríquez (Integrante 3).
Stack: Vitest 5 (unitarias, integración, cobertura V8) + Playwright (E2E en Chromium).

## 1. Diagnóstico inicial (inicio de la semana, rama `main` @ `9c67c66`)

| Hallazgo | Impacto | Acción |
| --- | --- | --- |
| `npm ci` funciona (con 5 vulnerabilidades reportadas por `npm audit` tras agregar ESLint 8: 4 altas, 1 crítica; ya había 2 (1 alta, 1 crítica) antes; no se aplicó `--force`). | AC-01 OK | Documentado. |
| `package.json` no tenía `test:unit`, `test:integration`, `test:coverage`; `npm test` no ejecutaba Vitest. | No se podía ejecutar la capa Vitest por script | Scripts unificados. |
| No existía ESLint ni `npm run lint`. | El CI no podía ejecutar lint | Se agregó `eslint@8` + `eslint-config-next` y `.eslintrc.json`. |
| `tests/unit/*` y `tests/integration/*` probaban **copias simuladas** de `SyncQueue` y `validateInspection` definidas dentro del propio test. | Un defecto en `src/lib/sync/queue.ts` **no habría sido detectado** | Las pruebas ahora importan `@/lib/sync/queue`, `@/lib/storage/schema` y el nuevo `@/lib/domain/validation`. |
| No existía `validateInspection` en `src/` (la validación estaba solo en el formulario). | No había regla de dominio testeable | Se creó `src/lib/domain/validation.ts` (código nuevo, sin tocar la UI). |
| No existía workflow `academic-evaluation.yml`. | AC-03 | Creado. |
| `make verify` solo ejecutaba `npm run verify` (`npm test` histórico + build). | No incluía lint, tipos, Vitest ni E2E | `make verify` → `npm run verify:all`. |
| Vitest 5 requiere Node ≥ 22.12 y jsdom 30 ≥ 24.15. | Node 20 rompería el CI | CI y README usan Node 24. |

## 2. Matriz de riesgos vs. capa de prueba

| Riesgo | Capa | Prueba (archivo) | Qué se afirma |
| --- | --- | --- | --- |
| Captura inválida (título vacío, estado fuera de `ok`/`attention`, fecha mal formada) | **Unitaria** | `tests/unit/validation.spec.ts` | `validateInspection` devuelve `valid` y la lista exacta de campos erróneos. |
| Persistencia y reconexión | **Integración** (+ E2E del flujo) | `tests/integration/persistence-sync.spec.ts`, `tests/e2e/inspection-flow.spec.ts` | La operación guardada offline queda `pending` con su payload; tras reconectar se sincroniza. En E2E: recarga sin pérdida y 1 sola inspección. |
| Duplicado de sincronización | **Unitaria + Integración** (+ E2E) | `tests/unit/queue-idempotence.spec.ts`, `tests/integration/persistence-sync.spec.ts` | Misma `mutationId` ⇒ `enqueue` devuelve `false`; el remoto simulado (`vi.fn()`) se invoca 1 sola vez. |
| Permisos del dispositivo denegados | **E2E** | `tests/e2e/device-fallbacks.spec.ts` | Con `clearPermissions()` el flujo activa el fallback y permite guardar. |

## 3. Justificación técnica Vitest + Playwright

- **Vitest** (unitarias/integración): corre en Node en milisegundos, permite `vi.fn()` para controlar la respuesta remota, y genera cobertura V8 sin configuración adicional. Es adecuado para lógica determinista (`SyncQueue`, validación, esquema).
- **Playwright** (E2E): solo un navegador real permite cortar la red (`context.setOffline`), recargar con Service Worker y denegar permisos (`clearPermissions`). Eso no se puede verificar leyendo código ni en memoria.
- **Pirámide:** muchas pruebas rápidas abajo (14 en Vitest), solo 2 E2E para el flujo crítico. Las pruebas de semanas 1–6 (`tests/*.spec.ts`) se conservan en `npm run test:legacy`.

## 4. Comandos exactos de reproducción

Node 24 (≥ 24.15 recomendado).

| Etapa | Comando |
| --- | --- |
| Instalación limpia | `npm ci` |
| Lint | `npm run lint` |
| Tipos | `npx tsc --noEmit` |
| Build | `npm run build` |
| Unitarias | `npm run test:unit` |
| Integración | `npm run test:integration` |
| Unit + integración con cobertura (`coverage/`) | `npm run test:coverage` |
| Navegador para E2E | `npx playwright install --with-deps chromium` |
| E2E | `npm run test:e2e` |
| Todo (Vitest + E2E) | `npm test` |
| Verificación global | `make verify` (= `npm run verify:all`) |

**Servidor E2E:** `playwright.config.ts` (`webServer`) ejecuta `npm run build && npm run start -- --hostname 127.0.0.1 --port 3000` y espera `http://127.0.0.1:3000`. En CI no reutiliza servidores existentes.

**Pipeline:** `.github/workflows/academic-evaluation.yml` ejecuta en orden `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build` → `npm run test:coverage` → `npx playwright install --with-deps chromium` → `npm run test:e2e`. Ninguna etapa usa `continue-on-error`. Los artefactos `coverage` y `test-results` (incluye `playwright-report/`) se suben con `if: always()`.

## 5. Experimento del defecto controlado

Rama temporal local: `test/defecto-controlado-duplicados` (nunca integrada a la rama de entrega).

**Cambio único** en `src/lib/sync/queue.ts` (método `enqueue`): se comentaron las dos protecciones de duplicado por `mutationId` (`processedMutationIds.has(...)` y `alreadyQueued`). Commit del defecto: `cd6d181`. Commit de reversión: `c98d0e4` (el árbol de `src/` queda idéntico al de `b69dceb`; `git diff b69dceb c98d0e4` está vacío).

**Comando:** `npx vitest run tests/unit tests/integration`

### Estado ROJO (defecto activo) — salida real, exit code 1

```
 FAIL  tests/integration/persistence-sync.spec.ts > Integración: ... > reintentar la misma operación no crea duplicado en el destino remoto
AssertionError: expected true to be false // Object.is equality
     62|     expect(queue.enqueue(op)).toBe(false);

 FAIL  tests/unit/queue-idempotence.spec.ts > SyncQueue - Idempotencia, FIFO y Backoff > debe descartar mutaciones duplicadas (idempotencia)
AssertionError: expected true to be false // Object.is equality
     24|     expect(queue.enqueue(op)).toBe(false);

 FAIL  tests/unit/queue-idempotence.spec.ts > SyncQueue - Idempotencia, FIFO y Backoff > debe descartar una mutación ya sincronizada
AssertionError: expected true to be false // Object.is equality
     33|     expect(queue.enqueue(op)).toBe(false);

 Test Files  2 failed | 1 passed (3)
      Tests  3 failed | 11 passed (14)
```

### Estado VERDE (defecto revertido) — salida real, exit code 0

```
 ✓ tests/unit/validation.spec.ts (5 tests)
 ✓ tests/unit/queue-idempotence.spec.ts (6 tests)
 ✓ tests/integration/persistence-sync.spec.ts (3 tests)

 Test Files  3 passed (3)
      Tests  14 passed (14)
```

### Enlaces de trazabilidad

| Estado | Commit | Ejecución de Actions |
| --- | --- | --- |
| Fallo (defecto) | `cd6d181`; rama `test/defecto-controlado-duplicados` en el SHA `ff8ec18` (estado actual + defecto reaplicado) | [Run en ROJO](https://github.com/Breyan21/PWA-E07/actions/runs/40266586281): falla el paso `npm run test:coverage` |
| Recuperación | `c98d0e4` (revert local); rama de entrega en el SHA `b830e9d` (mismo `src/` sin defecto) | [Run en VERDE](https://github.com/Breyan21/PWA-E07/actions/runs/40266046397): las 7 etapas y los artefactos pasan |

> Nota: `test/defecto-controlado-duplicados` es solo evidencia del experimento y **no se integra** a `main` ni a la rama de entrega. En el run en rojo, `npm ci`, lint, `tsc` y build pasan y falla únicamente `test:coverage`, es decir, la prueba detecta el defecto. Los runs de verde y rojo comparten el mismo código excepto `src/lib/sync/queue.ts`.

## 6. Límites

- Las pruebas de Vitest validan lógica en memoria; no prueban IndexedDB/localStorage reales ni el Service Worker (eso cubre E2E).
- El remoto es un `vi.fn()`: no hay backend real.
- E2E corre solo en Chromium headless; no cubre dispositivos táctiles ni permisos físicos reales.
- La cobertura es informativa (≈30 % global sobre `src/lib`); `camera.ts`, `geolocation.ts` y `notifications` están cubiertos por las pruebas históricas (`test:legacy`), que no entran en el reporte V8.
