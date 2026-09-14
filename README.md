# PWA de inspecciones de laboratorio — proyecto del equipo

Este es un proyecto acumulativo: un repositorio privado por equipo durante el curso. En la Semana 2 se implementa el Web Manifest y un App Shell para transformar la aplicación web básica en una PWA instalable con estados visuales.

## Entorno

Entorno verificado:
- **Node.js**: v22.22.2
- **npm**: 10.9.7
- Instrucciones verificadas: Instalación limpia con `npm ci` y servidor local levantado con `npm run dev`.
- Incidencias de entorno: Ninguna incidencia detectada durante la configuración inicial.

## Ejecución e Instalación

Para ejecutar la aplicación localmente con el App Shell:
```bash
npm ci
npm run dev
```

Abran `http://localhost:3000` en su navegador. La aplicación cargará el App Shell con los datos de inspecciones de mantenimiento.

## Supuestos y Límites (Semana 2)

- **Datos y Autenticación**: Los datos visualizados siguen siendo **sintéticos**. No se cuenta con backend real ni mecanismos de autenticación implementados.
- **Instalabilidad**: La aplicación cuenta con un `manifest.webmanifest` válido que permite su **instalación** en navegadores compatibles.
- **Offline y Sincronización**: **NO están implementados**. Aunque la app es instalable, perder la conexión a internet hará que falle, ya que aún no existe un *Service Worker* para cachear recursos ni un mecanismo de sincronización. Los estados de carga/error del App Shell actualmente son demostrativos para la UI.

## Verificación y Pruebas

Para validar los componentes estructurales y el Web Manifest:

```bash
# Verificar estructura y buscar secretos
bash public-tests/check.sh

# Ejecutar las pruebas del manifest y proyecto base
node --experimental-strip-types tests/manifest.spec.ts
```

> **Evidencia de ejecución**: 
> - `bash public-tests/check.sh` arrojó `PUBLIC_OK`.
> - `node tests/manifest.spec.ts` (transpilado o mediante Node 22) arrojó `manifest.spec.ts: PASS`.

## Trabajo y entrega en equipo

Cada integrante registra su evidencia en una sección de `evidence/individual.md`. Todos entregan en Classroom el mismo SHA final y enlaces, identificando su sección. 

## Estructura

- `public/manifest.webmanifest`: Metadatos de la PWA.
- `src/components/app-shell.tsx`: Cascarón visual y navegación.
- `src/app/`: Rutas Next.js y el contenido inyectado en el shell.
- `src/lib/data/`: Inspecciones sintéticas.
- `evidence/`: Evidencia propia de cada integrante.
- `tests/`: Pruebas de validación (ej. manifest).
