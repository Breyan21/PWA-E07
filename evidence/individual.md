# Evidencia individual del equipo

> Un solo archivo compartido. Repitan la sección siguiente por cada integrante; cada persona escribe y explica su propia evidencia. Se aceptan evidencias previas equivalentes. El SHA final se entrega en Classroom después del último commit, para evitar modificar el commit que se está identificando.

- Grupo y equipo:
- Repositorio del equipo:

## Integrante: escribir nombre

- Mi contribución concreta y enlace a archivo, commit anterior o revisión:
- Decisión que puedo explicar y por qué:
- Comando o prueba proporcionada que ejecuté:
- Resultado real que observé:
- Qué verifica esa prueba y qué no verifica:
- Limitación, dificultad o riesgo que identifiqué:
- Uso de IA: herramienta, propósito, partes influenciadas y validación propia (o «no utilicé IA»):

## Integrante: Eduardo Lezama Zárate

- Mi contribución concreta y enlace: lo que hice fue documentar las versiones exactas que utilizamos para asegurar que cualquier otra persona pueda clonar e instalar el proyecto sin enfrentar errores de compatibilidad. Commit: `06c9d6a73427422d6575d98b6f3a593884615918`.
- Decisión que puedo explicar y por qué: el uso de `npm ci` para que todo el equipo instale las versiones exactas del proyecto y evitar que a alguien le falle por tener un paquete distinto.
- Comando o prueba proporcionada que ejecuté: `npm run verify`.
- Resultado real que observé: El comando se ejecutó de principio a fin sin lanzar errores en la terminal. Completó las pruebas de estructura, generó el build optimizado de Next.js y finalmente creó el archivo de reporte en la ruta `reports/verification.json`.
- Qué verifica esa prueba y qué no verifica: Esta prueba sí verifica que tengamos los archivos obligatorios en su lugar y que el proyecto se pueda compilar sin romperse. Lo que NO verifica es la redacción o análisis de los documentos que entregamos, ni tampoco prueba si la aplicación es capaz de funcionar y guardar datos cuando se corta el internet.
- Limitación, dificultad o riesgo identificado: La principal limitación técnica actual es que nuestro proyecto (el starter) todavía funciona como una página web tradicional y no como una PWA. Aún nos falta integrar el archivo manifest, el service worker y la sincronización de datos locales, por lo que si el usuario pierde la conexión ahora mismo, la aplicación simplemente fallará.
- Uso de IA: Utilicé herramientas de inteligencia artificial como apoyo para expandir mi redacción, organizar las ideas derivadas de los resultados de mi terminal y estructurar esta evidencia de manera más completa. 

> No necesitan inventar un error ni escribir pruebas nuevas. «Ejecuté npm test» es insuficiente como explicación: indiquen qué observa la prueba y qué comportamiento queda fuera.
