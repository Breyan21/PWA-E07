# ADR-001 — Estrategia de aplicación para inspecciones de laboratorio

## Estado

**Aprobada por el equipo — 6 de septiembre de 2026.** Esta decisión corresponde al alcance de la Semana 1 y se revisará cuando existan prototipos de operación sin conexión y sincronización.

## Contexto y restricciones

El producto futuro apoyará el registro y la consulta de inspecciones de mantenimiento en laboratorios. Las personas encargadas pueden trabajar desde un teléfono o una computadora y, durante una inspección, pueden tener conexión intermitente o no disponer de ella temporalmente. Por ello, el producto debe poder evolucionar para conservar registros capturados localmente y enviarlos cuando la conexión vuelva a estar disponible.

En esta primera semana el sistema solo muestra tres inspecciones sintéticas. No almacena registros creados por usuarios, no tiene autenticación, no funciona sin conexión y no sincroniza información. Los datos reales de laboratorios, personas o credenciales quedan fuera del alcance actual. El equipo trabajará con un único repositorio y el curso ya proporciona un starter basado en Next.js.

## Alternativas consideradas

| Criterio | PWA | Web tradicional | App nativa | App multiplataforma |
|---|---|---|---|---|
| Instalación | Puede usarse desde el navegador y ofrecer instalación opcional. | Se abre mediante URL; no requiere instalación. | Requiere instalación desde una tienda o distribución administrada. | Requiere instalar una aplicación generada para cada plataforma. |
| Conectividad intermitente | Puede diseñarse con caché, almacenamiento local y sincronización diferida. | Normalmente depende de una conexión activa; offline requeriría trabajo adicional que la acercaría a una PWA. | Puede almacenar datos localmente y sincronizar después. | Puede usar almacenamiento local y sincronización, según el framework. |
| Distribución | Una URL y actualizaciones web; no depende necesariamente de tiendas. | Una URL y actualizaciones inmediatas en el servidor. | Publicación, revisión y actualización por tienda o gestión institucional. | Compilación y distribución para cada plataforma, con posible publicación en tiendas. |
| Desarrollo y mantenimiento | Permite reutilizar el stack web del curso y mantener una base principal. | Menor complejidad inicial, pero no resuelve por sí sola la necesidad de continuidad sin conexión. | Requiere conocimientos, código y pruebas específicos por plataforma si se desarrolla de forma separada. | Comparte parte del código, pero incorpora dependencias, compilación móvil y pruebas por plataforma. |
| Capacidades del dispositivo | Acceso suficiente para formularios, cámara o ubicación cuando el navegador y los permisos lo permitan; existen diferencias entre navegadores. | Capacidades similares en navegador, sin estrategia de instalación u offline definida. | Mayor acceso e integración predecible con el sistema operativo y hardware. | Puede acceder a muchas APIs nativas mediante complementos, con dependencia del framework. |
| Riesgo principal | La operación offline, los conflictos y el soporte entre navegadores deben diseñarse y probarse. | Perder o interrumpir el registro al faltar red. | Mayor costo, tiempos de publicación y mantenimiento por plataforma. | Diferencias entre dispositivos, dependencia de complementos y mayor complejidad de compilación. |

## Decisión

Se elige una **PWA basada en el starter de Next.js** como estrategia para el producto futuro. Esta opción permite comenzar con una aplicación web accesible mediante URL, reutilizar las habilidades y el código del curso, y agregar progresivamente instalación opcional, caché y almacenamiento local. Es apropiada para el escenario de inspecciones porque una persona puede capturar información durante una interrupción de red y el producto podrá conservarla para sincronizarla posteriormente.

La elección no implica que el producto ya sea una PWA completa. En la Semana 1 no se implementarán manifest, service worker, almacenamiento local, cola de cambios ni sincronización. Estas capacidades serán trabajo posterior y deberán verificarse antes de declarar que el sistema funciona offline.

Una app nativa sería preferible si el proyecto necesitara integración intensiva y constante con hardware del dispositivo, funcionamiento homogéneo en un parque controlado de equipos o distribución obligatoria por una tienda institucional. Una solución multiplataforma sería una alternativa si esos requisitos móviles crecieran sin querer mantener dos aplicaciones nativas independientes. La web tradicional sería suficiente si las inspecciones siempre se realizaran con conexión estable y no fuera importante conservar trabajo durante cortes.

## Consecuencias y riesgos

Beneficios esperados:

- Acceso por navegador y actualización centralizada sin distribuir instaladores manualmente.
- Una base de código web para equipos de escritorio y móviles.
- Posibilidad de diseñar continuidad de captura ante conexión intermitente.

Costos, riesgos y mitigaciones:

| Riesgo o costo | Mitigación prevista |
|---|---|
| Un registro local puede perderse o duplicarse al reconectar. | Definir identificadores de registro, estados de sincronización y reglas de conflicto antes de implementar el envío diferido. |
| La caché puede mostrar información desactualizada. | Establecer qué recursos se almacenan, su vigencia y cómo el usuario recibe retroalimentación del estado de conexión y actualización. |
| El soporte de APIs web varía entre navegadores y dispositivos. | Probar las capacidades requeridas en los navegadores y dispositivos declarados por el equipo antes de depender de ellas. |
| Almacenar información de inspecciones en el dispositivo tiene impacto de privacidad. | Mantener datos sintéticos durante el curso, minimizar datos almacenados y definir controles de acceso antes de usar información real. |
| Agregar offline incrementa la complejidad técnica y de pruebas. | Implementar por etapas: primero manifest e instalación, después caché de recursos, captura local y finalmente sincronización controlada. |

## Validación futura

La decisión se revisará mediante un prototipo incremental y pruebas con escenarios definidos en los requisitos del producto:

1. Verificar en un dispositivo y navegador declarados que la aplicación puede instalarse y abrirse después de cerrar el navegador.
2. Con una conexión desactivada de forma controlada, registrar una inspección sintética y comprobar que se conserva localmente sin afirmar que llegó al servidor.
3. Restaurar la conexión y comprobar que el registro se sincroniza una sola vez, conserva sus datos y comunica el resultado al usuario.
4. Probar casos de conflicto, por ejemplo, un mismo registro modificado localmente y en el servidor, para validar la regla de resolución elegida.
5. Revisar accesibilidad, rendimiento y privacidad con los criterios medibles definidos en `docs/requirements.md`.

La decisión seguirá siendo adecuada si estas pruebas permiten continuar una inspección sin conexión, recuperar la información al reconectar y mantener un costo de desarrollo y soporte compatible con las restricciones del curso. Si las pruebas muestran que las capacidades del navegador no cubren los dispositivos o flujos reales, el equipo reevaluará una alternativa nativa o multiplataforma.
