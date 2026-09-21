# Estrategia de Caché y Service Worker (Semana 03)

Este documento describe las decisiones arquitectónicas respecto a la gestión del almacenamiento en caché de la PWA "CheckUp", así como el ciclo de vida de nuestro Service Worker y los límites actuales de la aplicación.

## 1. Contenido Cacheado

### Precache (Caché Inicial)
Durante la fase de `install` del Service Worker, almacenamos proactivamente en la caché `checkup-precache-v1` los recursos críticos necesarios para que la aplicación muestre al menos una interfaz mínima si no hay red:
- `/` (Ruta raíz / App Shell inicial)
- `/manifest.webmanifest`
- Íconos principales (`/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-512-maskable.png`)
- `/offline.html` (Página de fallback dedicada)

### Runtime Cache (Caché en Tiempo de Ejecución)
A medida que el usuario navega, interceptamos las solicitudes de red para almacenar recursos adicionales en la caché `checkup-runtime-v1`:
- Archivos estáticos generados por Next.js (`/_next/*`).
- Imágenes adicionales u otros recursos estáticos.

## 2. Estrategias de Red (Estrategia de Navegación y Fallback)

Dependiendo del tipo de solicitud, el Service Worker aplica distintas estrategias:

- **Navegación (Network-first con Fallback Offline):** 
  Cuando el usuario solicita páginas completas (`request.mode === 'navigate'`), intentamos siempre descargar la versión más reciente desde la red. Si la red falla (ausencia de conectividad), buscamos en la caché. Si la ruta solicitada no está en caché, devolvemos la página `/offline.html` de fallback para informar al usuario que no tiene conexión, sin mostrar el dinosaurio del navegador.

- **Recursos estáticos (Stale-while-revalidate):** 
  Para assets como CSS, JS y ciertas imágenes, servimos inmediatamente la copia desde la caché para asegurar velocidad (si existe), y *en segundo plano* intentamos descargar una versión actualizada desde la red para guardarla silenciosamente en caché y usarla en la próxima visita.

## 3. Exclusiones: Lo que NUNCA se Cachea

Por razones de seguridad y consistencia de datos, existen reglas estrictas que impiden almacenar cierta información:
- **Métodos distintos a GET:** Solicitudes POST, PUT, DELETE están ignoradas explícitamente (`request.method !== 'GET'`).
- **Cross-origin:** No se cachean respuestas de APIs o servidores de terceros (`url.origin !== self.location.origin`).
- **Credenciales y Datos Sensibles:** En versiones futuras, las respuestas de autenticación serán explícitamente ignoradas.

## 4. Ciclo de Actualización, Invalidación y Limpieza

- **Limpieza (Activate):** Durante la fase de `activate`, el Service Worker compara los nombres de caché registrados actualmente en el dispositivo contra sus listas activas. Cualquier caché que no pertenezca a la versión actual es eliminada para liberar almacenamiento.
- **Actualización Controlada:** Hemos omitido la llamada automática a `skipWaiting()` en la instalación. Esto significa que si liberamos una nueva versión de la app, el nuevo Service Worker se instalará, pero quedará "en espera".
- **Invalidación:** La aplicación le informa al usuario que existe una nueva versión mediante un banner o botón. Cuando el usuario hace clic en "Actualizar", la aplicación envía un mensaje (`CLEAR_RUNTIME_CACHE`) para purgar la caché dinámica actual y un mensaje `SKIP_WAITING` obligando al nuevo worker a tomar el control y recargar la página limpia.

## 5. Riesgos

- **Datos obsoletos (Stale Data):** Dado que algunos assets utilizan *Stale-while-revalidate*, un usuario podría ver una versión ligeramente antigua de un recurso por unos milisegundos hasta que se recargue o se navegue de nuevo.
- **Aumento de Almacenamiento:** El *Runtime Cache* puede crecer si el usuario visita muchas rutas distintas. 
- **Compatibilidad:** Algunos navegadores muy antiguos (o navegadores en modo incógnito severo) pueden restringir el tamaño o disponibilidad del API de Cache Storage.
- **Conflictos de versión:** Si los nombres de caché no se gestionan cuidadosamente al lanzar versiones nuevas, los usuarios podrían quedar atascados en versiones rotas.

## 6. Supuestos y Límites Actuales

> [!WARNING]
> **No existe sincronización offline real de registros aún.**
> Aunque la aplicación se puede instalar, cuenta con un Service Worker, intercepta navegación y muestra una página offline, esto **NO** significa que la aplicación sea capaz de guardar formularios (registros de mantenimiento) sin internet y sincronizarlos después. El soporte offline completo mediante colas de background sync será implementado en las semanas posteriores.
