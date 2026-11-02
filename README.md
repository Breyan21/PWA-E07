# PWA de Inspecciones de Laboratorio (PWA-E07)

Aplicación Web Progresiva (Next.js 14) para el registro de inspecciones de mantenimiento en laboratorios de la Universidad Tecnológica de Tehuacán (UTT), con captura offline, cola de sincronización idempotente, fallbacks de capacidades de dispositivo (cámara, geolocalización, notificaciones) y controles de seguridad y privacidad aplicada (Semana 9). Datos 100 % sintéticos.

---

## Requisitos

- **Node.js 24** (versión recomendada $\ge$ 24.13.0). Compatible con CI (`ubuntu-latest` con Node 24).
- **npm 10+** (o versión bundled de Node 24).

---

## Instalación limpia

```bash
npm ci
```

Para entornos de integración continua desatendidos (criterio AC-01):
```bash
npm ci --ignore-scripts --no-audit --no-fund
```

---

## Arranque del proyecto

```bash
npm run dev                      # Modo desarrollo en http://localhost:3000
npm run build && npm run start   # Compilación y ejecución de producción
```

---

## Pruebas por capa y comandos

| Capa / Alcance | Comando | Qué ejecuta |
| :--- | :--- | :--- |
| **Seguridad y Privacidad** | `npm run test:security` | Suite determinista (`tests/security.spec.ts`) con `node:assert/strict`: validación anti-XSS, límites cuantitativos, filtro de PII (LGPDPPSO), cabeceras de `next.config.mjs`, permisos, `storage-guard` (cuota, reviver contra prototype pollution, purga) y `robots.txt`. |
| **Unitarias (Vitest)** | `npm run test:unit` | Vitest sobre `tests/unit/`: validación de entrada, deduplicación de cola y controles de seguridad modular. |
| **Integración (Vitest)** | `npm run test:integration` | Vitest sobre `tests/integration/`: persistencia offline y no duplicación con destino simulado. |
| **Cobertura (V8)** | `npm run test:coverage` | Vitest con cobertura V8 sobre `src/lib`; genera `coverage/` (no versionado). |
| **E2E (Playwright)** | `npm run test:e2e` | Playwright en Chromium: ciclo offline $\rightarrow$ recarga $\rightarrow$ reconexión sin duplicados y fallbacks con permisos denegados. |
| **Históricas (Sem. 1–6 y 9)** | `npm run test:legacy` | Pruebas de compatibilidad con `node:assert`: `starter`, `rendering`, `sync`, `capabilities` y `test:security`. |
| **Suite completa** | `npm test` | En ejecución normal corre: `test:security`, Vitest (unit + integración) y Playwright (`scripts/test.mjs`). Con `--run` (modo CI de evaluación formativa AC-03) delega directamente en `test:legacy`. |

> **Nota para Playwright:** Para ejecutar E2E en un entorno nuevo, instale previamente el navegador: `npx playwright install --with-deps chromium`.

---

## Calidad estática y compilación

```bash
npm run lint          # ESLint con reglas de next/core-web-vitals
npm run typecheck     # Verificación estricta de tipos de TypeScript (tsc --noEmit)
npm run build         # Compilación de producción optimizada de Next.js
```

---

## Verificación global

```bash
make verify
```

O su equivalente multiplataforma en npm:
```bash
npm run verify:all
```

El pipeline local ejecuta en secuencia: `lint` $\rightarrow$ `typecheck` $\rightarrow$ `build` $\rightarrow$ `test:coverage` $\rightarrow$ `test:legacy` (incluyendo `test:security`) $\rightarrow$ `test:e2e` $\rightarrow$ `scripts/verify.mjs` (generando `reports/verification.json`). Si cualquier etapa falla, el comando termina con código distinto de 0.

---

## Arquitectura de Seguridad y Privacidad (Semana 9)

En cumplimiento de los objetivos de la Semana 9 y el marco de la **Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO)** para la UTT:

1. **Cabeceras HTTP de seguridad (`next.config.mjs` / `src/lib/security/headers.ts`):**
   - `Content-Security-Policy`: directivas base restrictivas (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `upgrade-insecure-requests`), permitiendo `'unsafe-inline'` para compatibilidad de estilos y scripts en Next.js.
   - `X-Frame-Options`: `DENY` para neutralizar ataques de clickjacking.
   - `X-Content-Type-Options`: `nosniff` contra ataques de confusión de tipos MIME.
   - `Referrer-Policy`: `strict-origin-when-cross-origin`.
   - `Permissions-Policy`: restringe `camera=(self)`, `geolocation=(self)` y bloquea `microphone=()`, `payment=()`, `usb=()`.
   - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload` (HSTS).

2. **Saneamiento y validación estricta (`src/lib/security/validator.ts` y `sanitizer.ts`):**
   - Límites cuantitativos: longitud de título entre 3 y 120 caracteres.
   - Neutralización anti-XSS: supresión de etiquetas `<script>`, `<iframe>`, `<style>`, `<object>`, pseudoprotocolos `javascript:` y escape de entidades HTML.
   - Detección preventiva de PII: expresiones regulares para detectar CURP, RFC, correos electrónicos y números telefónicos mexicanos, bloqueando el guardado de datos personales.

3. **Almacenamiento seguro y derechos ARCO (`src/lib/security/storage-guard.ts`):**
   - Cuota cuantitativa: límite de 100 registros (`MAX_STORED_INSPECTIONS`) y máximo 512 KB para evitar denegación de servicio local (DoS).
   - Deserializador seguro: reviver JSON que neutraliza vectores de *Prototype Pollution* suprimiendo llaves `__proto__`, `constructor` y `prototype`.
   - Derecho de supresión: función `purgeLocalInspections()` y botón en interfaz para eliminar registros locales de forma verificable.

4. **Desaliento de indexación (`public/robots.txt`):**
   - Directiva `Disallow: /inspecciones` para comunicar a rastreadores cooperativos la preferencia de no indexar las vistas de captura y listado operativo.

---

## Matriz Amenaza $\rightarrow$ Control $\rightarrow$ Prueba

| Amenaza (STRIDE) | Activo | Control implementado | Prueba / Evidencia verificable |
| :--- | :--- | :--- | :--- |
| **STR-T1 (Tampering)** | Integridad de inspecciones locales | Validación de esquema, límites de 3 a 120 caracteres y sanitización anti-XSS (`validator.ts`, `sanitizer.ts`). | `tests/security.spec.ts` (bloques 1 y 2) y `tests/unit/security-controls.spec.ts`. |
| **STR-T2 (Tampering)** | Recursos de la PWA | Cabeceras de seguridad y CSP con orígenes base en `next.config.mjs`. | `tests/security.spec.ts` (bloque 4). |
| **STR-I1 (Information Disclosure)** | Datos personales / PII | Detección preventiva de CURP, RFC, email y teléfono; datos exclusivamente sintéticos y botón de purga local (LGPDPPSO). | `tests/security.spec.ts` (bloques 3 y 6) e inventario en `docs/privacy-data-inventory.md`. |
| **STR-I2 (Information Disclosure)** | Rutas operativas | Exclusión en `public/robots.txt` (`Disallow: /inspecciones`). | `tests/security.spec.ts` (bloque 7). |
| **STR-D1 (Denial of Service)** | Cuota de almacenamiento | Cuota máxima de 100 registros, cota de 512 KB y reviver contra prototype pollution (`storage-guard.ts`). | `tests/security.spec.ts` (bloque 6). |
| **STR-E2 (Elevation of Privilege)** | Permisos de hardware | `Permissions-Policy` (`camera=(self)`, `geolocation=(self)`), solicitud just-in-time y liberación inmediata de pistas de cámara. | `tests/security.spec.ts` (bloques 4 y 5) y `tests/capabilities.spec.ts`. |

---

## Supuestos y límites técnicos

- **Controles en cliente:** Los controles de sanitización, cuotas locales y detección de PII operan actualmente en el navegador. En una versión con servidor de backend, estos controles deben replicarse obligatoriamente del lado servidor para evitar elusión por peticiones HTTP directas.
- **Sin backend de inspecciones:** La aplicación no cuenta actualmente con API REST remota ni base de datos centralizada de inspecciones.
- **Sin auditoría durable institucional:** La fecha de creación (`createdAt`) proviene del dispositivo cliente y no constituye una bitácora forense autoritativa.
- **Datos 100 % sintéticos:** Queda estrictamente prohibido introducir datos personales reales de estudiantes, docentes o personal en el prototipo.
- **Alcance de robots.txt:** Comunica preferencias a motores de búsqueda cooperativos; no constituye un mecanismo de control de acceso ni autenticación de red.

---

## Documentación y entregables de la actividad

- **Modelo de amenazas (STRIDE):** [`docs/threat-model.md`](docs/threat-model.md)
- **Inventario de privacidad y datos (LGPDPPSO):** [`docs/privacy-data-inventory.md`](docs/privacy-data-inventory.md)
- **Módulos de seguridad:** [`src/lib/security/`](src/lib/security/)
- **Suite de pruebas de seguridad:** [`tests/security.spec.ts`](tests/security.spec.ts)
- **Directivas de rastreo:** [`public/robots.txt`](public/robots.txt)
- **Evidencias individuales del equipo:** [`evidence/individual.md`](evidence/individual.md)
