La guía permite equipos de hasta tres, pero cada integrante debe poder defender una decisión y prueba propia. Este reparto cubre todos los entregables, evita duplicar archivos y mantiene evidencia individual clara. 

|**Integrante**|**Responsabilidad**|**Archivos principales**|
|---|---|---|
|**1**|Estrategia de caché y<br>service worker|public/sw.js, opcionalmente<br>public/offline.html|
|**2**|Registro, actualización e<br>integración con la app|src/lib/pwa/register-service-worker.ts,<br>componente cliente de registro y ajuste<br>mínimo de src/app/layout.tsx|
|**3**|Pruebas, documentación<br>y verificación|tests/service-worker.spec.ts,<br>tests/offline.spec.ts, docs/cache-strategy.md,<br>README.md|



# **Integrante 1 — Service worker y caché** 

Implementa public/sw.js y, si se requiere un fallback independiente, public/offline.html. 

Debe definir: 

- Cachés con versión, por ejemplo: 

   - checkup-precache-v1 

   - checkup-runtime-v1 

- Precache de recursos seguros y públicos: 

   - / 

   - /manifest.webmanifest 

   - /icons/icon-192.png 

   - /icons/icon-512.png 

   - /icons/icon-512-maskable.png 

   - /offline.html 

- Solo cachear solicitudes GET y del mismo origen. 

- Nunca cachear credenciales, respuestas de autenticación, solicitudes POST ni datos potencialmente sensibles. 

- Navegación con estrategia network-first; si no existe red, responder con una versión previamente cacheada o con /offline.html. 

- Recursos estáticos de Next.js con estrategia cache-first o stale-while-revalidate. 

- Limpieza de cachés obsoletas durante activate. 

- Invalidación controlada mediante mensaje, por ejemplo CLEAR_RUNTIME_CACHE. 

- No usar skipWaiting() automático: una actualización no debe reemplazar una versión mientras una persona está usando la aplicación. 

Commit sugerido: 

feat: agregar service worker y estrategia de cache 

Decisión que debe poder explicar: por qué se cachean únicamente recursos públicos y por qué una actualización espera activación controlada. 

# **Integrante 2 — Registro y actualización segura** 

Implementa: 

- src/lib/pwa/register-service-worker.ts 

- Un componente cliente adicional, por ejemplo: 

   - src/components/service-worker-registration.tsx 

- Ajuste mínimo de src/app/layout.tsx para cargar ese componente cliente. 

Responsabilidades: 

- Registrar /sw.js únicamente en navegadores compatibles y en producción o bajo la condición definida por el equipo. 

- Registrar errores de instalación/registro mediante console.error con mensaje claro. 

- Detectar updatefound y el estado installed. 

- Informar que existe una actualización disponible, sin recargar automáticamente. 

- Ofrecer una acción explícita para actualizar, por ejemplo un botón “Actualizar aplicación”. 

- Enviar el mensaje de invalidación controlada al worker solo cuando corresponda. 

- Manejar la ausencia de navigator.serviceWorker sin bloquear la carga del shell. 

Commit sugerido: 

feat: registrar service worker y manejar actualizaciones 

Decisión que debe poder explicar: por qué la actualización requiere acción del usuario y por qué el fallo de registro no impide usar la app online. 

# **Integrante 3 — Pruebas, documentación y reproducibilidad** 

Implementa: 

- tests/service-worker.spec.ts 

- tests/offline.spec.ts 

- docs/cache-strategy.md 

- README.md 

Las pruebas deben ser reproducibles y fallar ante regresiones reales. Como mínimo deben verificar: 

|**Prueba**|**Regresión que debe detectar**|
|---|---|
|**Service worker existe y tiene listeners de install,**<br>**activate y fetch**|Se eliminó parte del ciclo de<br>vida|
|**El precache contiene manifest, iconos y fallback**|Se omite un recurso crítico|
|**Solo se cachean solicitudes GET del mismo origen**|Se vuelve a cachear<br>información insegura|
|**La navegación tiene fallback offline**|Una consulta falla<br>completamente sin red|
|**Los nombres de caché están versionados y se**<br>**limpian versiones anteriores**|La app acumula cachés<br>obsoletas|
|**Existe mecanismo de actualización/invalidation**<br>**controlada**|Se pierde la estrategia segura<br>de actualización|



docs/cache-strategy.md debe explicar: 

- Qué se precachea y qué se cachea en tiempo de ejecución. 

- Estrategia de navegación y fallback. 

- Qué datos nunca se cachean. 

- Ciclo de actualización, invalidación y limpieza. 

- Riesgos: datos obsoletos, conflictos, aumento de almacenamiento, compatibilidad. 

- Límites: no afirmar sincronización de registros ni soporte offline completo si no existe. 

El README.md debe registrar: 

- Versiones de Node y npm. 

- npm ci. 

- Comando de pruebas y verificación. 

- Cómo comprobar offline desde DevTools. 

- Resultado real de la verificación. 

- Supuestos y límites de la implementación. 

Commit sugerido: 

test: cubrir cache offline y documentar estrategia 

Decisión que debe poder explicar: cómo las pruebas detectan una regresión del fallback y por qué no dependen de servicios externos. 

# **Acuerdo técnico previo obligatorio** 

Antes de empezar, los tres deben acordar y documentar estos valores para evitar incompatibilidades: 

Versión inicial de caché: checkup-v1 

Precache: /, manifest, tres iconos y /offline.html 

Navegación: network-first con fallback 

Estáticos del mismo origen: cache-first o stale-while-revalidate 

Método no cacheable: POST 

Mensaje de invalidación: CLEAR_RUNTIME_CACHE 

Actualización: aviso al usuario; nunca recarga automática 

# **Dependencias y orden de integración** 

Los tres pueden comenzar en paralelo, pero hay dos dependencias claras: 

1. El integrante 1 define los nombres de caché, recursos y mensaje de invalidación. 

2. El integrante 2 usa ese contrato para registrar y comunicar actualizaciones. 

3. El integrante 3 puede preparar pruebas y documentación desde el inicio, pero debe completarlas cuando el worker y registro estén integrados. 

Orden recomendado: 

Día 1: acuerdo técnico y ramas individuales 

Días 1-3: integrantes 1 y 2 implementan en paralelo 

Días 2-4: integrante 3 prepara pruebas y documentación 

Día 4: integrar worker + registro 

Días 5-6: completar y corregir pruebas/documentación 

Día 7: npm ci, make verify/equivalente, Actions y evidencia individual 

Cada integrante debe añadir su propia sección a evidence/individual.md con: commit SHA, contribución, decisión técnica, prueba ejecutada y resultado, limitación, uso de IA y validación humana. 

