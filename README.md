# PWA de Inspecciones de Laboratorio (PWA-E07)

Aplicación Web Progresiva (Next.js 14) para el registro de inspecciones de mantenimiento en laboratorios de la UTT, con captura offline, cola de sincronización idempotente y fallbacks de dispositivo (cámara, geolocalización, notificaciones). Datos 100 % sintéticos.

## Requisitos

- **Node.js 24** (≥ 24.15). `vitest@5` exige Node ≥ 22.12 y `jsdom@30` ≥ 24.15. Es la versión usada en CI.
- npm 10+.

## Instalación limpia

```bash
npm ci
```

## Arranque

```bash
npm run dev        # desarrollo en http://localhost:3000
npm run build && npm run start   # producción
```

## Pruebas por capa

| Capa | Comando | Qué ejecuta |
| --- | --- | --- |
| Unitarias | `npm run test:unit` | Vitest sobre `tests/unit/` (validación de captura, cola/idempotencia). |
| Integración | `npm run test:integration` | Vitest sobre `tests/integration/` (persistencia offline + no duplicación con remoto simulado). |
| Cobertura | `npm run test:coverage` | Unit + integración con V8; genera `coverage/` (no se versiona). |
| E2E | `npm run test:e2e` | Playwright en Chromium: offline → recarga → reconexión sin duplicados; fallback con permisos denegados. |
| Todo | `npm test` | Unit + integración, luego E2E (`scripts/test.mjs`; equivale a `vitest run tests/unit tests/integration && playwright test`). Con `--run` (usado por los workflows formativos de las semanas 2-6) solo ejecuta `test:legacy`. |
| Históricas (sem. 1–6) | `npm run test:legacy` | `tests/*.spec.ts` (starter, rendering, sync, capabilities). |

**Servidor E2E:** `playwright.config.ts` arranca la app con `npm run build && npm run start -- --hostname 127.0.0.1 --port 3000`. La primera vez instale el navegador: `npx playwright install --with-deps chromium`. En Windows local usa Chrome instalado (`channel: 'chrome'`); en CI usa Chromium de Playwright.

## Calidad estática y build

```bash
npm run lint          # ESLint (next/core-web-vitals)
npx tsc --noEmit      # comprobación de tipos
npm run build         # build de producción de Next.js
```

## Verificación global

```bash
make verify
```

Ejecuta `npm run verify:all`: `lint` → `tsc --noEmit` → `build` → `test:coverage` → `test:legacy` → `test:e2e` → `npm run verify` (reporte técnico `reports/verification.json`). Termina con código distinto de 0 si cualquier etapa falla. Sin `make`: `npm run verify:all`.

## Integración continua

Workflow: `.github/workflows/academic-evaluation.yml`. Etapas: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:coverage`, `npx playwright install --with-deps chromium`, `npm run test:e2e`. Publica los artefactos `coverage/` y `test-results/` (+ `playwright-report/`) con `if: always()`.

## Documentación

- Estrategia de pruebas, matriz riesgo–capa y defecto controlado: [`docs/test-strategy.md`](docs/test-strategy.md)
- Evidencia individual: [`evidence/individual.md`](evidence/individual.md)
- Capacidades de dispositivo: [`docs/capabilities.md`](docs/capabilities.md)

## Reproducir el defecto controlado

Ver sección 5 de [`docs/test-strategy.md`](docs/test-strategy.md): en una rama temporal, comentar las protecciones de `mutationId` en `SyncQueue.enqueue` (`src/lib/sync/queue.ts`) y ejecutar `npx vitest run tests/unit tests/integration` (falla); al revertir, pasa.

## Decisiones de diseño (semana 6, vigentes)

- **Consentimiento just-in-time:** ninguna API nativa se dispara al cargar; todo requiere un gesto del usuario.
- **Resiliencia:** la denegación de permisos no rompe el registro de una inspección (datos sintéticos / avisos in-app).
- **Minimización de datos:** sin rastreo continuo (`watchPosition` no implementado).
