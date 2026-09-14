# Evidencia individual del equipo

- Grupo y equipo: 10 A, Equipo 07
- Repositorio del equipo: https://github.com/Breyan21/PWA-E07

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
