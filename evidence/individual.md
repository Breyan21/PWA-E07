# Evidencia individual del equipo

- Grupo y equipo: 10 A, Equipo 07
- Repositorio del equipo: https://github.com/Breyan21/PWA-E07

## Integrante: José Miguel Jiménez Enríquez

- **Mi contribución concreta y enlace a archivo, commit anterior o revisión:** Participé en la estructuración de la documentación inicial, definición de los requisitos y configuración del entorno de trabajo (instalación limpia de dependencias). Enlace al commit de mi contribución: [Reemplazar con enlace al commit en GitHub].
- **Decisión que puedo explicar y por qué:** La justificación del uso de PWA sobre aplicaciones nativas, documentada en `docs/decision-record.md`. Entiendo que la PWA permite manejar la conectividad intermitente (offline) sin la necesidad de publicar en tiendas de apps, lo cual reduce drásticamente la fricción y el tiempo de entrega del proyecto.
- **Comando o prueba proporcionada que ejecuté:** Ejecuté `npm ci`, `npm run dev` y finalmente `npm run verify` para validar el entorno y generar el reporte técnico.
- **Resultado real que observé:** El servidor levantó correctamente en `http://localhost:3000` mostrando las 3 inspecciones sintéticas, y el comando verify terminó exitosamente (código 0), generando el archivo `reports/verification.json`.
- **Qué verifica esa prueba y qué no verifica:** `npm run verify` verifica que la estructura de archivos esté correcta, que las pruebas unitarias pasen y que el build de producción se complete sin errores sintácticos o de configuración. Sin embargo, **no verifica** la calidad de nuestro análisis en la documentación, ni certifica la usabilidad real o el correcto manejo de estado offline, lo cual deberá probarse de forma manual.
- **Limitación, dificultad o riesgo que identifiqué:** Al inicio `npm i` reportó vulnerabilidades de dependencias. Identifiqué el riesgo de forzar un arreglo automático (`npm audit fix`), que podría romper el proyecto starter. La solución fue usar `npm ci` para respetar las versiones exactas del lockfile y asegurar reproducibilidad.
- **Uso de IA:** Se utilizó Antigravity (IA) como asistente para analizar los requisitos de la rúbrica y redactar la documentación (`requirements.md` y `decision-record.md`). Su propósito fue ayudar a organizar la información bajo el formato esperado. Toda la información fue revisada y validada por mí para asegurar que cumple con el contexto de la UTT.
