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
