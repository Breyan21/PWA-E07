# Decisión Técnica: Renderizado CSR vs SSR

## 1. Matriz Comparativa CSR vs SSR

| Criterio | CSR (Client-Side Rendering) - Listado | SSR (Server-Side Rendering) - Detalle |
| :--- | :--- | :--- |
| **Métricas de carga (TTFB)** | Muy rápido. El servidor responde con un esqueleto HTML vacío y el bundle JS. | Dependiente del servidor y la base de datos (latencia simulada). Mayor tiempo de respuesta inicial. |
| **Métricas de carga (FCP)** | Lento. El navegador debe descargar, procesar y ejecutar JavaScript antes de pintar contenido útil. | Rápido. El navegador pinta el contenido inmediatamente al recibir el HTML renderizado desde el servidor. |
| **Métricas de carga (LCP estimado)** | Más lento. Depende de las peticiones de datos adicionales desde el cliente y la velocidad de red. | Más rápido. El contenido principal ya viene embebido en el HTML inicial. |
| **Complejidad de Mantenimiento** | Alta en gestión de estados (`isLoading`, `error`, sincronización reactiva de filtros y búsqueda). | Baja. Se enfoca en lógica de servidor lineal (consultar datos, responder HTML/Error) sin manejar estado interactivo. |
| **Resiliencia / Modo Offline (PWA)** | Excelente potencial. Si el bundle JS ya está en caché, la aplicación puede interceptar errores de red y mostrar un botón de reintento, o en el futuro consultar IndexedDB. | Pobre. Si no hay conexión al momento de navegar, la petición al servidor fallará a nivel de red, a menos que el Service Worker provea un fallback de navegación muy sofisticado. |
| **Impacto en Accesibilidad** | Requiere esfuerzo explícito. Se debe gestionar `aria-live` para anunciar actualizaciones dinámicas y manejar `role="status"` o `role="alert"` ante errores de carga reactivos. | Más sencillo y robusto por defecto. El HTML semántico inicial ya contiene los datos, facilitando a los lectores de pantalla interpretar la página entera desde la carga inicial. |

## 2. Trade-offs y Decisión Arquitectónica

Se decidió implementar un enfoque mixto (estrategia híbrida) en el mismo dominio para maximizar la experiencia del usuario y cumplir los requisitos técnicos:

- **Listado interactivo (CSR):** Las búsquedas y filtros en el lado del cliente evitan parpadeos molestos en pantalla al no realizar recargas de página completas por cada tecla pulsada. Aceptamos un FCP inicial penalizado a cambio de una experiencia post-carga altamente interactiva y dinámica.
- **Vista de detalle (SSR):** Un usuario que abre un enlace directo de una inspección requiere una carga inicial veloz de la información. El renderizado desde el servidor asegura que el contenido crucial (estado, hallazgos) sea visible casi al instante (FCP bajo) y rastreable por motores de búsqueda, a cambio de una mayor dependencia de conexión continua en el momento de acceso.

## 3. Pruebas y Validación

La estrategia mixta ha sido validada exhaustivamente mediante pruebas de análisis estático (`tests/rendering.spec.ts`) para garantizar que:
- La vista de CSR (`src/app/inspecciones/page.tsx`) posee estados interactivos reactivos (`useState`, `'use client'`) e integra el componente de accesibilidad `LoadingState`.
- La vista de SSR (`src/app/inspecciones/[id]/page.tsx`) se abstiene de usar directivas de cliente y delega explícitamente el manejo de identificadores inexistentes al servidor (utilizando `notFound()`).
