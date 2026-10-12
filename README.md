# PWA de Inspecciones de Laboratorio - Actividad Semana 6

Aplicación Web Progresiva (PWA) para el registro y auditoría de inspecciones de mantenimiento en los laboratorios de la Universidad Tecnológica de Tehuacán (UTT).

Este incremento (Semana 6: `w06-device-push`) integra capacidades nativas del hardware y del sistema operativo (Cámara, Geolocalización y Notificaciones) bajo los principios de **permisos mínimos (*least privilege*)**, **acción explícita del usuario**, **privacidad y minimización de datos** y **fallbacks funcionales obligatorios**.

---

## Entregables de la Semana 6

1. **Cámara (`src/lib/device/camera.ts`):** Detección de soporte, solicitud bajo demanda de captura interactiva y liberación de recursos de hardware (`MediaStreamTrack.stop()`) con fallback controlado ante permisos denegados.
2. **Geolocalización (`src/lib/device/geolocation.ts`):** Consulta puntual de coordenadas (*one-shot*) con timeout acotado (5000ms), sin rastreo invasivo continuo, y fallback a coordenadas sintéticas de la UTT ante denegación o falta de cobertura.
3. **Notificaciones (`src/lib/notifications/client.ts`):** Verificación contextual de permisos, envío de avisos y mecanismo de fallback in-app (alertas visuales en pantalla) si el usuario rechaza el permiso o el entorno no soporta la API.
4. **Memoria Técnica (`docs/capabilities.md`):** Matriz de permisos, justificación de solicitud, medidas de privacidad y arquitectura de fallbacks.
5. **Suite de Pruebas Automatizadas (`tests/capabilities.spec.ts`):** Pruebas unitarias deterministas que validan detección de APIs, flujos exitosos y activación de fallbacks ante errores y permisos denegados.
6. **Evidencia Individual (`evidence/individual.md`):** Registro de aportaciones, decisiones técnicas, pruebas y justificaciones por integrante.

---

## Comandos de Ejecución y Verificación

### 1. Instalación limpia de dependencias
```bash
npm ci
```

### 2. Ejecución de la suite completa de pruebas
```bash
npm test
```
Ejecuta de forma secuencial y determinista:
- `tests/starter.spec.mjs`: Validación base del starter.
- `tests/rendering.spec.ts`: Validación de directivas de renderizado (CSR vs SSR).
- `tests/sync.spec.ts`: Pruebas de cola de sincronización e idempotencia.
- `tests/capabilities.spec.ts`: Pruebas de capacidades de hardware (cámara, geolocalización) y notificaciones con fallbacks.

### 3. Compilación de producción
```bash
npm run build
```
Valida la integridad de tipos en TypeScript y genera el bundle optimizado de Next.js.

### 4. Verificación técnica de estructura y reporte
```bash
npm run verify
```
Genera el reporte formal en `reports/verification.json`.

### 5. Verificación de checks públicos
```bash
bash public-tests/check.sh
```

---

## Supuestos de Diseño y Decisiones Técnicas

- **Consentimiento Just-In-Time:** Ninguna API nativa se dispara durante la carga inicial de la aplicación. Toda solicitud responde estrictamente a un gesto intencional del usuario.
- **Resiliencia Total:** La denegación de permisos nunca rompe el flujo de registro de una inspección. La aplicación continúa funcionando mediante datos sintéticos o avisos in-app.
- **Minimización de Datos:** No se realizan lecturas en segundo plano ni monitoreo continuo de ubicación (`watchPosition` no implementado por diseño).
