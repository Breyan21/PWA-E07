# Evidencia individual del equipo

> Un solo archivo compartido. Repitan la sección siguiente por cada integrante; cada persona escribe y explica su propia evidencia. Se aceptan evidencias previas equivalentes. El SHA final se entrega en Classroom después del último commit, para evitar modificar el commit que se está identificando.

- Grupo y equipo: A E07
- Repositorio del equipo: https://github.com/Breyan21/PWA-E07.git

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
