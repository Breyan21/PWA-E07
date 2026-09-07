# Requisitos del producto — documento del equipo

## 1. Problema y contexto

Las inspecciones de mantenimiento de los laboratorios en la UTT suelen verse interrumpidas o dificultadas por la falta de una conexión a internet estable. Esto provoca que los encargados de inspección no puedan registrar hallazgos al momento, lo que dificulta dar seguimiento oportuno a las fallas o incidentes. El problema que se busca resolver es permitir el registro de datos de inspección de forma persistente, superando los límites de la conectividad intermitente. Queda fuera del alcance inicial la sincronización en tiempo real y la autenticación compleja de usuarios.

## 2. Usuarios y escenarios

**Usuario principal:** Personal encargado de mantenimiento e inspección de laboratorios.

**Escenario 1 (Con conexión):**
- **Situación inicial:** El encargado realiza una inspección y tiene conexión a internet.
- **Acción:** Accede a la PWA, revisa los registros actuales y añade un nuevo hallazgo de laboratorio.
- **Resultado esperado:** El hallazgo se registra y se refleja en el listado de inspecciones de manera inmediata.

**Escenario 2 (Conectividad intermitente - Futuro):**
- **Situación inicial:** El encargado está en un laboratorio con mala señal de internet y detecta un hallazgo importante.
- **Acción:** Registra el hallazgo en la aplicación a pesar de no tener conexión, esperando que se guarde localmente.
- **Resultado esperado:** La aplicación guarda el hallazgo y notifica que se enviará cuando la conexión se restablezca.

## 3. Requisitos funcionales

| ID | Acción del producto | Condición observable de aceptación | Ahora o futuro |
|---|---|---|---|
| RF-01 | Mostrar los registros sintéticos del starter | Al abrir la página se ven las tres inspecciones proporcionadas | Semana 1 |
| RF-02 | Guardar una nueva inspección sin conexión | Al guardar datos válidos sin internet, aparece un registro localmente que se conserva al recargar | Futuro |
| RF-03 | Sincronizar inspecciones locales | Al recuperar la conexión, los registros locales se envían al servidor y se confirma su guardado | Futuro |

## 4. Requisitos no funcionales

- **Reproducibilidad:** En una copia limpia, con las versiones declaradas de Node y npm, ejecutar `npm ci` y `npm run verify` debe terminar con código 0. Se comprueba mediante CI y de forma local antes de entregar.
- **Rendimiento:** Con más de 100 registros sintéticos en el dispositivo móvil, el listado debe cargar en menos de 2 segundos. Se validará futuramente usando Lighthouse y pruebas en dispositivos reales bajo la red de la universidad.
- **Operación offline (Futuro):** La aplicación debe cargar la interfaz y permitir ver las últimas inspecciones descargadas aunque se active el modo avión. Se comprobará usando las herramientas de desarrollador del navegador simulando modo offline.

## 5. Datos sintéticos y límites

La aplicación utilizará información ficticia referente a laboratorios (por ejemplo: "Laboratorio A", "Centro de Cómputo B") y hallazgos genéricos (por ejemplo: "Cable de red dañado", "Proyector sin señal"). No se incluirán datos reales de estudiantes, personal administrativo ni credenciales de acceso reales. Toda identificación académica de este equipo se manejará exclusivamente en la entrega y el repositorio privado, no en la interfaz del producto.

## 6. Criterios de aceptación de la Semana 1

- **Prueba del starter:** Ejecutar `npm test` finaliza correctamente y valida la existencia de la UI inicial.
- **Build exitoso:** Ejecutar `npm run build` genera la versión de producción sin errores.
- **Requisitos verificables:** El documento actual (`docs/requirements.md`) define usuarios, escenarios y límites de manera clara.
- **Comparación de alternativas:** El documento (`docs/decision-record.md`) justifica correctamente la elección de PWA.
