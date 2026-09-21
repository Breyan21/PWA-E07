# PWA de inspecciones de laboratorio — proyecto del equipo

Este es un proyecto acumulativo: un repositorio privado por equipo durante el curso. En la Semana 3 se implementa el Service Worker, caché estática, caché dinámica, estrategias de red (fallback offline) y mecanismo de actualización segura.

## Entorno Verificado

- **Node.js**: v22.22.2 (Mínimo recomendado 20+)
- **npm**: 10.9.7

## Ejecución e Instalación

Para asegurar dependencias limpias y ejecutar la aplicación localmente:
```bash
npm ci
npm run build
npm run start
```
*(Nota: Para probar el Service Worker de forma óptima, se recomienda correr la versión de producción o habilitar la carga forzada en el registro del SW durante `npm run dev`)*.

Abran `http://localhost:3000` en su navegador. La aplicación cargará el App Shell e instalará el Service Worker en segundo plano.

## Verificación y Pruebas

Para validar los componentes estructurales, el Web Manifest y el Service Worker:

```bash
# Verificar estructura requerida por Semana 3
bash public-tests/check.sh

# Correr las pruebas específicas de la Semana 3 (Offline y Service Worker)
node --experimental-strip-types tests/service-worker.spec.ts
node --experimental-strip-types tests/offline.spec.ts

# Validación global y compilación del proyecto (Equivalente a make verify)
npm run verify
```

> **Resultado real de verificación:** 
> - `bash public-tests/check.sh` arrojó `PUBLIC_OK`.
> - Las pruebas `service-worker.spec.ts` y `offline.spec.ts` imprimieron `PASS`.
> - `npm run verify` terminó correctamente el build y no detectó fallos.

## Comprobar funcionamiento Offline (DevTools)

Puedes verificar el soporte Offline y el fallback desde cualquier navegador Chromium (Chrome, Edge):
1. Abre tu aplicación en el navegador y presiona `F12` para abrir las DevTools.
2. Navega a la pestaña **Application** (o Aplicación).
3. En la barra lateral izquierda, selecciona **Service Workers**.
4. Activa la casilla de verificación **Offline**.
5. Recarga la página (`F5`).
6. Si intentas navegar a una ruta que no ha sido cacheada, observarás la pantalla genérica de `offline.html` en lugar del clásico dinosaurio sin conexión.

## Supuestos y Límites de la Implementación (Semana 3)

- **Instalabilidad:** La aplicación cuenta con manifest y Service Worker registrados correctamente, lo que permite su instalación en el dispositivo.
- **Navegación Offline:** Si se pierde la conexión, la app cargará los recursos precacheados o el fallback `offline.html`. 
- **LIMITACIÓN CRÍTICA (Background Sync):** Actualmente **NO HAY** sincronización de formularios. Si un usuario intenta enviar un registro de inspección estando offline, la petición fallará. La sincronización real y las colas locales se implementarán en próximas entregas. No existen credenciales ni tokens almacenados.
