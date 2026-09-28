# Evidencia individual del equipo

> Un solo archivo compartido. Repitan la sección siguiente por cada integrante; cada persona escribe y explica su propia evidencia. Se aceptan evidencias previas equivalentes. El SHA final se entrega en Classroom después del último commit, para evitar modificar el commit que se está identificando.

- Grupo y equipo: A E07
- Repositorio del equipo: https://github.com/Breyan21/PWA-E07.git

## Integrante: José Miguel Jiménez Enríquez

- **Mi contribución concreta y enlace a archivo, commit anterior o revisión:** Me encargué de definir el producto futuro y sus límites. Para ello, completé el archivo `docs/requirements.md` desarrollando el problema, dos escenarios principales (uno con conectividad intermitente), requisitos funcionales (RF) con condiciones de aceptación, requisitos no funcionales (RNF) medibles y los datos sintéticos. Enlace a mi commit: https://github.com/Breyan21/PWA-E07/commit/661be91
- **Decisión que puedo explicar y por qué:** Elegí documentar específicamente el escenario de "Conectividad intermitente" porque es el verdadero problema a resolver en los laboratorios de la UTT. El personal de mantenimiento frecuentemente pierde la señal de internet dentro de los laboratorios, por lo que era crucial establecer el requisito funcional (RF-02) donde el usuario guarda el hallazgo localmente y la aplicación le notifica. Es importante aclarar que estos escenarios offline y de sincronización son requisitos futuros y **no están implementados** en el starter actual de la Semana 1.
- **Comando o prueba proporcionada que ejecuté:** Ejecuté `npm run verify` para validar el entorno y generar el reporte final después de agregar mi documentación.
- **Resultado real que observé:** El comando terminó exitosamente (código 0) y el reporte `reports/verification.json` confirmó la existencia de mi archivo `requirements.md`.
- **Qué verifica esa prueba y qué no verifica:** La prueba verifica automáticamente que el archivo de requisitos existe en la estructura y que el proyecto compila. Sin embargo, **no verifica** la calidad académica de mi análisis, la coherencia de mis escenarios propuestos, ni garantiza que los requisitos futuros definidos realmente funcionen en código.
- **Limitación, dificultad o riesgo que identifiqué:** Un riesgo que identifiqué al redactar los requisitos fue no diferenciar claramente lo que se entrega hoy de lo que se entregará después. Tuve cuidado en aclarar en el documento qué acciones (como listar) corresponden a la Semana 1 y qué acciones (como el guardado offline) son metas a futuro, para evitar prometer cosas que aún no están programadas.
- **Uso de IA:** Se utilizó Antigravity (IA) como apoyo para estructurar el formato de los escenarios y requisitos funcionales de acuerdo a la plantilla y rúbrica. Revisé detalladamente el texto generado para asegurar que el contexto de los laboratorios de la UTT fuera realista y que cumpliera con las instrucciones de la actividad.

## Integrante: Breyan Sebastián Matías Lira

- Mi contribución concreta y enlace: Elaboré `docs/decision-record.md`,
  incluyendo la comparación entre PWA, web tradicional, app nativa y
  multiplataforma; decisión, riesgos, mitigaciones y plan de validación.
  Commit: `9d7c1fc1a9acc1c6ce4d8168625b64140c259db9`.
- Decisión que puedo explicar y por qué: Se eligió una PWA con Next.js
  porque permite iniciar como aplicación web y evolucionar hacia captura
  local y sincronización ante conectividad intermitente. Esto no significa
  que el modo offline ya esté implementado.
- Limitación, dificultad o riesgo que identifiqué: La persistencia local,
  la sincronización y la resolución de conflictos deben implementarse y
  probarse en semanas posteriores.
- Uso de IA: Utilicé Codex para proponer una estructura inicial del ADR;
  revisé el contenido, lo adapté al caso de inspecciones y puedo explicar
  la decisión documentada.

## Integrante: Eduardo Lezama Zárate

- Mi contribución concreta y enlace: lo que hice fue documentar las versiones exactas que utilizamos para asegurar que cualquier otra persona pueda clonar e instalar el proyecto sin enfrentar errores de compatibilidad. Commit: `06c9d6a73427422d6575d98b6f3a593884615918`.
- Decisión que puedo explicar y por qué: el uso de `npm ci` para que todo el equipo instale las versiones exactas del proyecto y evitar que a alguien le falle por tener un paquete distinto.
- Comando o prueba proporcionada que ejecuté: `npm run verify`.
- Resultado real que observé: El comando se ejecutó de principio a fin sin lanzar errores en la terminal. Completó las pruebas de estructura, generó el build optimizado de Next.js y finalmente creó el archivo de reporte en la ruta `reports/verification.json`.
- Qué verifica esa prueba y qué no verifica: Esta prueba sí verifica que tengamos los archivos obligatorios en su lugar y que el proyecto se pueda compilar sin romperse. Lo que NO verifica es la redacción o análisis de los documentos que entregamos, ni tampoco prueba si la aplicación es capaz de funcionar y guardar datos cuando se corta el internet.
- Limitación, dificultad o riesgo identificado: La principal limitación técnica actual es que nuestro proyecto (el starter) todavía funciona como una página web tradicional y no como una PWA. Aún nos falta integrar el archivo manifest, el service worker y la sincronización de datos locales, por lo que si el usuario pierde la conexión ahora mismo, la aplicación simplemente fallará.
- Uso de IA: Utilicé herramientas de inteligencia artificial como apoyo para expandir mi redacción, organizar las ideas derivadas de los resultados de mi terminal y estructurar esta evidencia de manera más completa. 

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.

## Integrante: José Miguel Jiménez Enríquez (Semana 2)

- Mi contribución concreta y enlace: Me encargué de asegurar la calidad y reproducibilidad del proyecto para la Semana 2. Creé el archivo de pruebas `tests/manifest.spec.ts` para verificar el Web Manifest y actualicé la documentación en el `README.md`.
- Decisión que puedo explicar y por qué: Decidí escribir la prueba de manifest utilizando el módulo nativo `node:assert/strict` de Node.js en lugar de instalar frameworks pesados como Jest o Playwright. Esto permite mantener las dependencias del proyecto al mínimo, asegurando que la prueba se ejecute muy rápido (y de forma compatible con Node 22+).
- Comando o prueba proporcionada que ejecuté: `node --experimental-strip-types tests/manifest.spec.ts` y `bash public-tests/check.sh`
- Resultado real que observé: El script de bash verificó correctamente la existencia estructural de los nuevos archivos y no arrojó secretos (PUBLIC_OK). Por su parte, la prueba nativa comprobó que el manifest existe, tiene todas sus llaves (`name`, `icons`, `display`, etc) y que los iconos físicos de hecho existen en la carpeta public. El resultado impreso fue `manifest.spec.ts: PASS`.
- Limitación, dificultad o riesgo identificado: Un riesgo que identifiqué fue correr un archivo `.ts` nativamente sin una herramienta preconfigurada. La limitación actual es que la prueba requiere Node 22 (por `--experimental-strip-types`) o ser transpilada, lo cual documenté explícitamente en el README para que cualquiera pueda ejecutarla. Además, el manifest nos permite instalar, pero aún no somos una "verdadera" PWA offline porque no hay Service Worker.
- Uso de IA: Utilicé Antigravity (IA) como pair programmer para ayudarme a entender la división de tareas, sincronizar el repositorio del equipo (copiando los workflows base) y agilizar la sintaxis de las pruebas en Node. Revisé y me cercioré de que los comandos propuestos fueran correctos y comprendo toda la lógica de validación del test generado.

## Integrante: Eduardo Lezama Zárate (Semana 2)

- Mi contribución concreta y enlace: Hice el componente AppShell para que la página esté bien estructurada y manejé los estados visuales.
- Decisión que puedo explicar y por qué: Para mostrar los estados (carga, error, etc.), implementé una estructura que nos permite simular cómo se verá la app en las diferentes fases de carga de datos sin tener que conectarnos a una base de datos real.
- Comando o prueba proporcionada que ejecuté: Usé la tecla Tab para navegar por la página sin el ratón.
- Resultado real que observé: Comprobé que el menú y los enlaces se seleccionan bien y que al interactuar con ellos el contenido es accesible por teclado sin romper el diseño.
- Limitación, dificultad o riesgo identificado: El botón de Error de conexión o los estados visuales son solo una simulación visual. Como todavía no configuramos la parte que trabaja sin internet, la aplicación no puede detectar por sí sola si el dispositivo se queda sin wifi. Además, puedo cambiar rápido los textos, los colores de las alertas de error, o hacer que las tarjetas de las inspecciones se acomoden diferente en la pantalla modificando el archivo page.tsx.
- Uso de IA: Usé inteligencia artificial para ayudarme a juntar los componentes de React con el código CSS que ya existía, revisando que el diseño original de la página no se desacomodara.

## Integrante: Breyan Sebastián Matías Lira (Semana 2)

- Mi contribución concreta y enlace: Configuré la estructura global de la PWA. Añadí el archivo `public/manifest.webmanifest` definiendo las propiedades de instalación y los iconos. También integré estos metadatos en `src/app/layout.tsx`.
- Decisión que puedo explicar y por qué: Decidí establecer el `display` como `standalone` para garantizar que la aplicación se sienta nativa al ser instalada.
- Comando o prueba proporcionada que ejecuté: Ejecución local (`npm run dev`) y revisión de DevTools.
- Resultado real que observé: Revisé las DevTools (Application > Manifest) y comprobé que el navegador reconoce correctamente el archivo, detecta los iconos generados y declara que la aplicación es instalable sin errores.
- Limitación, dificultad o riesgo identificado: El manifest está listo y permite la instalación en dispositivos, pero si perdemos conexión, la aplicación no funcionará offline hasta que configuremos un Service Worker en las próximas semanas.
- Uso de IA: Utilicé asistentes de IA para validar que el formato JSON del webmanifest cumpliera con el estándar de PWA y para configurar correctamente las rutas de los iconos sin romper el layout en Next.js.




## Integrante: Eduardo Lezama Zárate (Semana 3)

- Mi contribución concreta y enlace: Creación del Service Worker (sw.js) para manejar el guardado local y diseño de la pantalla sin conexión (offline.html). 
Enlace / Commit SHA: 1cc32b04464fd750a48c4b6969ea384d1e287b66
- Decisión que puedo explicar y por qué: Decidí que solo se guarden cosas públicas como logos y la vista básica y nada de datos privados para que no nos roben información. También hice que la app no se actualice de golpe, para no cerrarle o reiniciarle la pantalla en la cara a la persona que la esté usando.
- Comando o prueba proporcionada que ejecuté: Desde las herramientas de desarrollo del navegador (DevTools), fui a la pestaña Network y cambié la conexión a Offline. Sin internet, navegué por la página y luego intenté entrar a un enlace inventado.
- Resultado real que observé:La página principal siguió cargando perfectamente desde la memoria del navegador. Al entrar al enlace equivocado, el sistema detectó la falla y me mostró correctamente mi pantalla de "Sin conexión a Internet".
- Limitación, dificultad o riesgo identificado: El problema es que el espacio que usamos para guardar la página no tiene un límite. Si se usa mucho, le podemos llenar la memoria del teléfono al usuario sin darnos cuenta.
- **Uso de IA: Utilicé para entender cómo interceptar la falta de internet. Validé todo manualmente apagando la red de mi navegador para comprobar que funcionara correctamente.

## Integrante: Breyan Sebastián Matías Lira (Semana 3)

- Mi contribución concreta y enlace: Implementé la lógica de registro, ciclo de vida y actualización segura del Service Worker (`src/lib/pwa/register-service-worker.ts`), el componente cliente con interfaz de actualización explícita (`src/components/service-worker-registration.tsx`) y su integración no bloqueante en el layout raíz (`src/app/layout.tsx`). Enlace / Commit SHA: `c78d6e7a250dfbf0aba206148d6cd922863d81dc`.
- Decisión que puedo explicar y por qué: Decidí que cuando haya una versión nueva, la app no se actualice ni se recargue sola. En su lugar, le mostramos un aviso con un botón para actualizar cuando el usuario quiera, evitando interrumpirlo o que pierda los datos de la inspección que esté llenando en ese momento. También aseguré que si el registro del Service Worker llega a fallar o el navegador no lo soporta, la aplicación no se rompa y se pueda seguir usando normalmente en línea.
- Comando o prueba proporcionada que ejecuté:
  1. `npm run build`: Para validar la compilación limpia de Next.js, tipos de TypeScript y empaquetado del componente en producción.
  2. `npm run verify`: Para ejecutar la suite de verificación técnica de la estructura del proyecto.
  3. Pruebas de ciclo de vida en Node.js: Validando el retorno seguro en SSR (`null`), detección de worker en espera (`waiting`), y el envío de mensajes `{ type: 'CLEAR_RUNTIME_CACHE' }` y `{ type: 'SKIP_WAITING' }`.
- Resultado real que observé:
  1. `npm run build` completó con éxito (código de salida 0), compilando la ruta `/` en 10.6 kB sin advertencias de tipos.
  2. `npm run verify` finalizó con status `"pass"` en la verificación técnica.
  3. La prueba de ciclo de vida confirmó que al ejecutar `applyUpdate`, el worker en espera recibe la orden de invalidar caché y tomar el control (`skipWaiting`), y el evento `controllerchange` dispara la recarga limpia.
- Limitación, dificultad o riesgo identificado: Si la persona usuaria pospone indefinidamente la actualización mediante "Más tarde", continuará ejecutando una versión en caché que podría quedar desfasada frente a cambios en la API del backend o en esquemas de datos futuros. Además, si el usuario tiene múltiples pestañas abiertas simultáneamente, se debe contemplar la coordinación entre clientes para que todas las pestañas adopten el nuevo worker de forma sincronizada.
- Uso de IA y validación humana: Utilicé Antigravity (IA) como asistente de pair programming para diseñar la arquitectura del ciclo de vida del Service Worker según las especificaciones del W3C y armar la interfaz accesible del componente con los estilos del proyecto. Validación humana: Revisé minuciosamente el código para asegurar que no existieran recargas automáticas destructivas, verifiqué los mensajes de consola requeridos, ejecuté la compilación y pruebas locales, y validé que la solución responde exactamente a los criterios de evaluación de la Semana 3.

## Integrante: José Miguel Jiménez Enríquez (Semana 3)

- Mi contribución concreta y enlace: Redacté la estrategia de caché detallada (`docs/cache-strategy.md`), creé los archivos de validación estática (`tests/service-worker.spec.ts` y `tests/offline.spec.ts`) y actualicé las instrucciones y límites técnicos en el `README.md`.
- Decisión que puedo explicar y por qué: Decidí mantener la validación estática en Node.js (usando `node:assert/strict`) para analizar directamente el contenido del archivo `sw.js`. Al no depender de navegadores *headless* o herramientas complejas de simulación de red, garantizamos que las pruebas sean ultraligeras, deterministas y altamente reproducibles en el entorno de evaluación CI, sin inflar las dependencias del proyecto.
- Comando o prueba proporcionada que ejecuté: Ejecuté `node --experimental-strip-types tests/service-worker.spec.ts` y `node --experimental-strip-types tests/offline.spec.ts` de forma local, seguidos por `npm run verify`.
- Resultado real que observé: Las pruebas de Node marcaron `PASS` exitosamente comprobando el precache, la versión de cachés, el rechazo de peticiones cross-origin/no-GET, y el mecanismo de actualización. Posteriormente, `npm run verify` compiló la app sin errores.
- Limitación, dificultad o riesgo identificado: Probar Service Workers de manera estática (con Regex/AST) tiene el riesgo de que cualquier cambio menor de formato en el código de Lalo/Breyan podría hacer fallar el test, a diferencia de una prueba *End-to-End* en navegador. Por otro lado, un límite fuerte de nuestra app hoy es que, aunque aparenta funcionar "offline", fallará si el usuario intenta enviar un formulario o inspección sin red, ya que no tenemos Background Sync.
- Uso de IA: Utilicé asistencia de IA para ayudarme a trazar los patrones de expresiones regulares requeridos para el análisis estático de las pruebas y estructurar la documentación de la caché; validé los scripts ejecutándolos localmente para confirmar que logran atrapar fallas si se elimina parte del Service Worker.

## Integrante: Eduardo Lezama Zárate (Semana 4)


- Mi contribución concreta y enlace: Desarrollé la ruta de detalle en servidor (`src/app/inspecciones/[id]/page.tsx`) y el componente de estado de carga accesible (`src/components/loading-state.tsx`). Enlace / SHA: f89fb6d7e8cb343e108b54e13cc37a80531b1a93
- Decisión que puedo explicar y por qué: La vista de detalle se beneficia enormemente del Server-Side Rendering (SSR) porque permite una carga inicial directa con el HTML ya construido, mejora el SEO al exponer los datos de la inspección a los motores de búsqueda, y reduce el tamaño del bundle de JavaScript que se envía al cliente.
- Comando o prueba ejecutada: Ejecuté localmente `npm run build`, seguido de `npm run test --if-present -- --run` para verificar la suite de pruebas, y comprobé manualmente la vista de detalle y el caso de error 404 navegando a `/inspecciones/inspection-999` (como alternativa en Windows a `make verify`).
- Resultado real que observé:El proyecto compiló sin errores de hidratación (`hydration mismatch`). Al solicitar un ID inexistente, el servidor respondió correctamente con la página 404 sin romper la aplicación.
- Qué verifica esa prueba y qué no verifica: La compilación verifica que el código del servidor no tenga dependencias del cliente (como `useState`). La prueba manual verifica que la navegación funcione, pero no verifica automáticamente el tiempo exacto de TTFB en una conexión real con alta latencia.
- Limitación, dificultad o riesgo identificado: El riesgo del SSR es que dependemos completamente del tiempo de respuesta del servidor (TTFB); si la consulta a la base de datos es lenta, el usuario verá una pantalla en blanco antes de recibir el HTML, a diferencia del CSR donde vería un esqueleto de carga inmediatamente.
- Uso de IA: utilicé Gemini como asistente para analisar el componente de carga asegurando que incluyera los atributos de accesibilidad (`role="status"`, `aria-busy="true"`) requeridos en la rúbrica y para validar el manejo de la función `notFound()` en el App Router de Next.js. la implementación  y las pruebas en el navegador las realicé yo.

## Integrante: Breyan Sebastián Matías Lira (Semana 4)

- Mi contribución concreta y enlace: Desarrollé la ruta de listado interactiva en cliente (`src/app/inspecciones/page.tsx`), integrando la gestión de estados (`data`, `isLoading`, `error`), retardo sintético de red (700ms), filtrado reactivo por estado y búsqueda en tiempo real, junto con el mecanismo de simulación de fallo de red y el botón de recuperación/reintento ("Retry Button"). Enlace / Commit SHA: `8390d1a4b3b435129c220a17fb02a5146fd35460` (commit corto: `8390d1a`).
- Decisión que puedo explicar y por qué: Se seleccionó Client-Side Rendering (CSR) con `'use client'` para la vista de listado porque es una interfaz altamente interactiva donde el usuario necesita buscar en tiempo real, alternar filtros por estado y manipular datos sin incurrir en viajes de ida y vuelta al servidor ni recargar la página. Además, permite gestionar estados de carga progresivos (`LoadingState`) y presentar mecanismos locales de recuperación ante fallos de conexión (botón de reintento), fundamentales para el contexto de conectividad intermitente de la PWA.
- Comando o prueba ejecutada:
  1. `npm run build`: Para comprobar la compilación limpia de la ruta CSR, la división de bundles (3.7 kB First Load JS) y la validación estricta de tipos de TypeScript.
  2. `npm run test`: Para validar la suite de pruebas del proyecto.
  3. Navegación manual y de accesibilidad con teclado (Tab, Shift+Tab, Enter) probando:
     - Estado de carga inicial con retardo de 700ms mostrando el componente `LoadingState`.
     - Filtrado interactivo por estado ("Todos", "Sin incidencias", "Requiere atención") y buscador por texto.
     - Simulación deliberada de fallo de conexión activando el checkbox "Simular fallo de conexión", verificando la alerta visual y recuperando el flujo exitosamente con el botón "Reintentar recuperación".
     - Navegación hacia las rutas de detalle `/inspecciones/[id]`.
- Resultado real que observé: `npm run build` completó con éxito (código de salida 0), identificando `/inspecciones` como ruta pre-renderizada estática del lado del cliente y `/inspecciones/[id]` como SSR dinámica en servidor. La interactividad de filtros y búsqueda respondió de manera instantánea en el navegador, y al forzar el fallo de red, la interfaz mostró correctamente el estado de error (`role="alert"`) y se recuperó sin recargar la página completa al pulsar "Reintentar recuperación".
- Qué verifica esa prueba y qué no verifica: Verifica que el componente no genera errores de sintaxis, tipos o discrepancias de hidratación (`hydration mismatch`), que los estados de carga y error son accesibles y operables, y que el usuario puede recuperarse del error sin perder el estado de la aplicación. No verifica el comportamiento ante condiciones de red reales en dispositivos móviles de gama baja con JavaScript fuertemente estrangulado (CPU throttling).
- Limitación, dificultad o riesgo identificado: La principal limitación técnica de CSR radica en el costo de descarga y ejecución del bundle de JavaScript en el cliente: en redes muy lentas o dispositivos con recursos limitados, el First Contentful Paint (FCP) y Time to Interactive (TTI) se ven penalizados en comparación con SSR, ya que el navegador no puede renderizar el contenido hasta que el bundle JS haya sido descargado, parseado y ejecutado. Si el usuario tiene JavaScript deshabilitado o bloqueado, la vista no renderizará datos.
- Uso de IA y validación humana: Utilicé Antigravity (IA) como asistente de pair programming para diseñar la estructura de los estados (`isLoading`, `error`, `data`) con React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`), y para implementar la navegación accesible por teclado y atributos ARIA (`role="alert"`, `aria-live="polite"`, `aria-pressed`). Validación humana: Revisé y ajusté los tiempos de latencia simulada (700ms), verifiqué la compatibilidad con los tokens de diseño de `globals.css`, ejecuté `npm run build` en consola confirmando código 0 y comprobé manualmente los flujos de carga, filtrado, error y reintento en el navegador.

## Integrante: José Miguel Jiménez Enríquez (Semana 4)

- **Mi contribución concreta y enlace:** Creé la suite automatizada de pruebas `tests/rendering.spec.ts` y documenté el análisis y reporte de ingeniería en `docs/rendering-decision.md`. También actualicé el `README.md` con las instrucciones de ejecución y coordiné la recopilación de evidencias en `evidence/individual.md`. (El commit SHA se añade al entregar tras pushear la rama).
- **Decisión que puedo explicar y por qué:** Decidí usar validación de AST y expresiones regulares con `node:assert/strict` nativo para `tests/rendering.spec.ts` en lugar de instalar un framework *End-to-End* como Playwright. Esto fue elegido para maximizar la velocidad de la suite en el CI y evitar problemas de configuración y descarga de binarios de navegadores. Además, el script fue diseñado para correr velozmente en modo pipeline.
- **Comando o prueba ejecutada:** Ejecuté localmente `npm run build`, seguido de `npm test -- --run` y `bash public-tests/check.sh`.
- **Resultado real que observé:** El comando `npm run build` identificó correctamente la generación estática y la página renderizada por servidor con éxito; `npm test -- --run` finalizó marcando `rendering.spec.ts: PASS` (verificando la estructura, las directivas y la semántica CSR/SSR), y `check.sh` emitió `PUBLIC_OK`.
- **Qué verifica esa prueba y qué no verifica:** La suite `rendering.spec.ts` verifica determinísticamente que `[id]/page.tsx` no esté usando directivas de cliente y contenga manejo de `notFound()`, y que `inspecciones/page.tsx` realmente sea `'use client'` e invoque correctamente al `LoadingState`. Sin embargo, no verifica la funcionalidad interactiva en tiempo real (que el input filtre elementos) en un navegador real.
- **Limitación, dificultad o riesgo identificado:** Un riesgo importante de usar análisis estático para validar código React (mediante Regex) es la fragilidad. Si mis compañeros modifican sutilmente el formateo, importan los componentes con alias distintos o abstraen la directiva `'use client'` a un layout padre, la prueba podría arrojar un falso positivo/negativo y fallar el flujo de Integración Continua, a pesar de que el código sea completamente funcional en producción.
- **Uso de IA:** Se utilizó la IA (Antigravity) como asistente para el desarrollo integral: generé la plantilla inicial del test estático validando el uso de `node:assert/strict`, obtuve la estructura base comparativa CSR vs SSR del ADR que posteriormente amplié y refine, y ajusté las instrucciones de actualización en el `README.md`. Todo fue validado humanamente ejecutando localmente el código de test y verificando el cumplimiento de la rúbrica.
