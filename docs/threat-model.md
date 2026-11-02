# Modelo de amenazas de CheckUp

## 1. Contexto y objetivo

Este modelo describe la implementación actual de CheckUp, una PWA de demostración para inspecciones de mantenimiento de laboratorios de la Universidad Tecnológica de Tehuacán. El código y las interfaces declaran el uso de datos sintéticos. El objetivo es identificar riesgos de confidencialidad, integridad y disponibilidad, distinguir controles comprobables de propuestas y definir condiciones mínimas antes de utilizar información o procesos institucionales reales.

El análisis es cualitativo y se basa en los archivos presentes en el repositorio. La probabilidad y el impacto son estimaciones para orientar el trabajo, no resultados de una prueba de penetración. La aplicación no tiene actualmente un servidor de negocio ni una API de inspecciones implementada.

## 2. Arquitectura observada

- **Framework:** Next.js 14 con React 18 y TypeScript. Las rutas se definen en `src/app/`.
- **Rutas:** `/` presenta registros sintéticos; `/inspecciones` ofrece listado, búsqueda y un formulario demostrativo; `/inspecciones/[id]` muestra un detalle de los registros sintéticos. No se encontró una ruta de API de la aplicación.
- **Datos de demostración:** `src/lib/data/inspections.ts` y `src/app/inspecciones/[id]/page.tsx` contienen arreglos de registros estáticos. La búsqueda y los filtros se ejecutan en el navegador.
- **Formulario:** `src/components/offline-inspection-workflow.tsx` guarda un título escrito, estado, identificador aleatorio y fecha de creación en `localStorage`, bajo una clave propia de la aplicación. El título se valida y sanea mediante `src/lib/security/`: límite cuantitativo de 3 a 120 caracteres, sanitización anti-XSS y detección preventiva de datos personales (PII); incorpora botón de purga local de datos conforme a la LGPDPPSO.
- **Persistencia y sincronización:** el formulario usa `localStorage` con cuota máxima (100 registros), límite de tamaño (512 KB) y deserializador protegido contra prototype pollution. No se encontró uso de IndexedDB. `src/lib/sync/queue.ts` implementa una cola en memoria, pero no está conectada al formulario ni a un destino remoto. El botón de sincronización del formulario solo cambia el estado local de los registros pendientes; no envía esos registros.
- **Service Worker:** `public/sw.js` precarga la raíz, el manifiesto, iconos y la página offline; usa red primero para navegación y almacena en tiempo de ejecución recursos estáticos del mismo origen. No cachea solicitudes que no sean GET ni solicitudes de otro origen. La respuesta de navegación no se agrega a la caché en la ruta observada.
- **Cámara y ubicación:** existen módulos para solicitar cámara y ubicación a petición del usuario. La interfaz de cámara abre el flujo y lo libera después de comprobarlo; no toma ni guarda una fotografía. El selector de archivo sintético no tiene lógica de lectura o persistencia. La ubicación real o las coordenadas sintéticas de respaldo se muestran como un mensaje de estado; no se agregan al registro local.
- **Notificaciones:** hay un módulo cliente para notificaciones y fallback visual, pero no se encontró una llamada desde la interfaz actual.
- **Servidor y red:** Next.js entrega la aplicación. No se encontró comunicación de negocio hacia un servidor/API o servicio analítico externo en el flujo de inspección. El Service Worker sí solicita al mismo origen navegaciones y recursos.
- **Autenticación y autorización:** no se encontraron controles de inicio de sesión, roles o autorización de rutas. Las páginas operativas y sus datos de demostración son accesibles desde la aplicación sin una identidad verificada.
- **Cabeceras:** `next.config.mjs` define cabeceras HTTP de seguridad mediante directivas de `src/lib/security/headers.ts`: `Content-Security-Policy` (con directivas base `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` y `Strict-Transport-Security`.

### Funcionalidades reales, previstas y no observadas

| Capacidad | Estado observado |
|---|---|
| Registros sintéticos precargados y vistas de consulta | Implementado |
| Formulario local con título, estado, identificador y fecha | Implementado con validación (3–120 caracteres), sanitización y filtro PII |
| Persistencia de ese formulario en `localStorage` | Implementado con cuota máxima de 100 registros y purga |
| Funcionamiento de la página offline de respaldo y caché de recursos estáticos | Implementado con el alcance descrito; no implica que las rutas de inspección completas estén disponibles sin red |
| Cola de sincronización con reintentos | Módulo de lógica en memoria; no integrado al formulario ni a una API |
| Envío de registros a un servidor | No observado |
| Captura y almacenamiento de fotografías | No observado |
| Persistencia de coordenadas | No observada |
| IndexedDB | No observado |
| Registro de auditoría durable | No observado |
| Inicio de sesión, roles y autorización | No observados |

## 3. Activos

1. **Registros locales del formulario:** título validado, estado, identificador y fecha, persistidos en el perfil del navegador bajo cuota.
2. **Datos de demostración:** identificadores de inspección, laboratorio, fecha, estado, responsable ficticio, hallazgos y resumen, servidos por las páginas.
3. **Código de la aplicación y recursos cacheados:** archivos estáticos, manifiesto, iconos y página offline.
4. **Integridad del estado offline:** contenido de `localStorage`, estados de sincronización y recursos de caché.
5. **Permisos y recursos del dispositivo:** acceso puntual a cámara y geolocalización, solicitado tras acciones explícitas en la interfaz.
6. **Disponibilidad y continuidad:** acceso a las rutas, al formulario y a los datos que el navegador conserva sin conexión.

## 4. Actores y superficies de ataque

### Actores considerados

- Persona usuaria legítima del navegador o dispositivo.
- Persona con acceso físico o a la misma sesión de navegador.
- Usuario que introduce contenido arbitrario en el formulario.
- Script malicioso ejecutado en el origen de la aplicación, por una vulnerabilidad presente o futura.
- Atacante de red que intenta interferir con el tráfico cuando el despliegue no está protegido por HTTPS.
- Operador o atacante que controla el despliegue y puede publicar código o recursos alterados.

### Superficies observadas

- Rutas públicas `/`, `/inspecciones` y `/inspecciones/[id]`.
- Campo de título y selector de estado con validación en cliente.
- Datos persistentes accesibles desde el origen en `localStorage`.
- Service Worker, proceso de actualización y Cache Storage.
- Llamadas de permisos a las API de cámara y geolocalización.
- Solicitudes de navegación y descarga de recursos del mismo origen.

No se identifica una superficie de API de negocio porque no se encontró una ruta ni una solicitud de envío de inspecciones.

## 5. Límites de confianza

| Límite | Flujo y condición real | Riesgo principal |
|---|---|---|
| Navegador ↔ aplicación Next.js del mismo origen | El navegador descarga páginas y recursos; la aplicación también renderiza datos sintéticos. El despliegue y el uso de HTTPS no se verifican en estos archivos. | Alteración del tráfico o de los recursos si el despliegue no protege el transporte y el origen. |
| Página React ↔ almacenamiento del navegador | El formulario lee y escribe `localStorage` desde JavaScript del mismo origen bajo cuotas y filtros de sanitización. | Un script ejecutado en el origen podría leer o alterar esos registros; quien use el mismo perfil también podría acceder a ellos. |
| Navegador ↔ Service Worker | El worker controla navegación y recursos según su alcance `/`, consulta Cache Storage y puede recibir mensajes de actualización. | Un worker o recurso comprometido puede afectar la versión ejecutada; cachés locales pueden conservar recursos hasta su reemplazo o limpieza. |
| Service Worker ↔ Cache Storage | Se guardan recursos de precarga y recursos estáticos que coinciden con las reglas del worker; no se observa caché de respuestas de inspecciones. | Alteración o disponibilidad de recursos locales; la caché no es almacenamiento protegido ni respaldo de registros. |
| Aplicación ↔ IndexedDB | No existe este límite en la implementación encontrada: no se observó IndexedDB. | No aplica al estado actual. No debe describirse como almacén utilizado. |
| Aplicación ↔ servidor/API de negocio | No existe un destino de sincronización de registros en la aplicación actual. Las páginas y el Service Worker solicitan contenido al origen, pero el formulario no transmite inspecciones. | La futura integración requerirá autenticación, autorización, validación de servidor, protección del transporte y resolución explícita de conflictos. |

## 6. Análisis STRIDE

### Spoofing — suplantación

La aplicación no comprueba identidades ni vincula las capturas a una cuenta; el identificador de responsable presente en los ejemplos es sintético. Un usuario puede atribuir localmente un registro a una identidad ficticia o, en una futura integración, enviar cambios como otro usuario si no se incorpora autenticación verificable. Para la demostración con datos sintéticos, la autenticación no está implementada ni es necesaria para el flujo público; antes de tratar registros reales, sí es un control pendiente.

### Tampering — alteración

Los registros del formulario se guardan en `localStorage`, accesible desde el mismo origen. El cliente valida que el título tenga entre 3 y 120 caracteres, elimina etiquetas HTML y filtra datos personales antes de persistir. No obstante, el estado local se puede alterar con herramientas del navegador. La cola tipada de sincronización no es persistencia durable ni sustituye validación de servidor.

### Repudiation — repudio

No hay registro de auditoría durable que permita atribuir de forma verificable la creación o modificación de una inspección. `createdAt` es una fecha local y modificable; no ofrece prueba de identidad, secuencia confiable ni no repudio. La cola de sincronización usa metadatos en memoria y no está conectada al flujo actual.

### Information Disclosure — divulgación de información

Las rutas no requieren autorización. Los registros de demostración son visibles en el código y en las páginas. El título ingresado se conserva en `localStorage` y puede persistir en el dispositivo. Para mitigar fugas accidentales, el formulario detecta y rechaza datos personales sintéticos o reales (CURP, RFC, correos y teléfonos), y ofrece un botón de purga para ejercer el derecho de supresión. La política sintética institucional complementa esta salvaguarda técnica.

### Denial of Service — denegación de servicio

Una cantidad excesiva de registros o payloads sobredimensionados podría agotar el almacenamiento local. La aplicación mitiga esto mediante una cota máxima de 100 registros (`MAX_STORED_INSPECTIONS`) y un límite preventivo de 512 KB por carga útil, además de proteger contra contaminación de prototipos. Las rutas de inspección no se precargan para uso offline completo; si una navegación no está disponible en red ni en caché, el worker recurre a `offline.html`.

### Elevation of Privilege — elevación de privilegios

No existen roles ni funciones protegidas por autorización; en la aplicación actual no hay privilegios diferenciados que elevar. Si se agregan usuarios, funciones de administración o datos reales, exponer rutas por URL sin comprobación del servidor permitiría acceso no autorizado. Cámara y ubicación solo se solicitan tras una acción del usuario y dependen de permisos del navegador, aislados al origen (`self`) mediante `Permissions-Policy`.

## 7. Matriz de amenazas y controles

Escala cualitativa: probabilidad e impacto bajos, medios o altos. El nivel combina ambos para priorizar; no representa una medición estadística. Los riesgos se evalúan pensando tanto en el prototipo como en la transición a datos reales.

| ID | Activo afectado | Amenaza | Impacto | Probabilidad | Nivel de riesgo | Mitigación recomendada | Estado del control |
|---|---|---|---|---|---|---|---|
| STR-S1 | Atribución de registros | No hay verificación de identidad; una captura puede no corresponder a una persona verificable. | Alto si se usan registros institucionales; bajo en la demostración. | Media | Alto antes de producción | Definir identidad institucional y autenticación; asociar identidad en servidor y proteger operaciones por rol. | Pendiente en servidor |
| STR-T1 | Registros en `localStorage` | Alteración manual o por script del título, estado, fecha e identificador. | Medio | Media | Medio | Validar estructura y contenido al leer y escribir; tratar el cliente como no confiable; validar nuevamente en servidor cuando exista. | Parcial — implementado en cliente (validación de esquema, límites 3–120 y sanitización en cliente; pendiente validación en servidor) |
| STR-T2 | Recursos de la PWA | Sustitución o ejecución de recursos alterados desde el origen o durante una actualización comprometida. | Alto | Baja | Medio | Proteger el despliegue y transporte, revisar el proceso de publicación y definir cabeceras de seguridad; probar actualización y limpieza de caché. | Parcial — implementado en cliente (cabeceras HTTP y directivas CSP base en next.config.mjs; pendiente hardening de transporte en infraestructura) |
| STR-R1 | Historial de inspecciones | No poder demostrar quién creó o cambió un registro ni cuándo ocurrió de forma confiable. | Alto para decisiones de mantenimiento | Media | Alto antes de producción | Diseñar auditoría del lado servidor con identidad, fecha confiable, evento y control de acceso; evitar depender del reloj del cliente. | Pendiente en servidor |
| STR-I1 | Texto local y registros | Exposición desde un perfil compartido, dispositivo extraviado o script ejecutado en el origen. | Alto si se introduce información personal o institucional no pública. | Media | Alto | Mantener solo datos sintéticos; agregar política institucional, protección de acceso del dispositivo y mecanismo de eliminación; no almacenar datos reales antes de contar con controles aprobados. | Parcial — implementado en cliente (datos sintéticos, detección/enmascaramiento PII y botón de purga local; pendiente política y backend institucional) |
| STR-I2 | Páginas operativas | Rastreo o consulta de las rutas públicas por indexadores o terceros. | Bajo con ejemplos sintéticos; mayor con datos reales. | Media | Medio | Desalentar rastreo con `robots.txt`; no publicar información protegida y agregar autorización real en servidor antes de manejarla. | Parcial — implementado en cliente (public/robots.txt desalienta el rastreo de /inspecciones; pendiente autorización en servidor) |
| STR-D1 | Persistencia local | Llenado de cuota o dato malformado puede impedir lectura o escritura del formulario. | Medio | Media | Medio | Limitar tamaño y cantidad, informar fallos de persistencia y definir recuperación y exportación/eliminación segura. | Parcial — implementado en cliente (cota de 100 registros, 512 KB y reviver contra prototype pollution en storage-guard; pendiente cuotas de servidor) |
| STR-D2 | Continuidad offline | Una ruta de inspección no disponible en red puede mostrar la página offline en lugar de la vista operativa. | Medio | Media | Medio | Acordar alcance offline; probar rutas reales sin red y ofrecer estados claros sin afirmar que hubo sincronización remota. | Pendiente |
| STR-E1 | Rutas y operaciones futuras | Sin autorización del lado servidor, cualquier persona con acceso a la ruta podría realizar operaciones futuras. | Alto antes de producción | Media | Alto antes de producción | Incorporar autorización por operación y recurso en el servidor; ocultar enlaces no es una defensa. | Pendiente antes de manejar datos reales |
| STR-E2 | Cámara y ubicación | Solicitud de capacidad del dispositivo fuera de una necesidad o sin comprensión de la persona usuaria. | Medio | Baja | Bajo | Mantener solicitud bajo acción explícita, explicación contextual, lectura puntual y fallback sintético; no guardar resultados sin necesidad aprobada. | Parcial — implementado en cliente (solicitud explícita, liberación inmediata de stream y fallback sintético) |

## 8. Controles existentes y recomendados

### Comprobables en el código

- Los datos que se muestran en las vistas están declarados como sintéticos.
- El formulario valida el esquema, impone límites cuantitativos (3 a 120 caracteres), sanitiza vectores HTML/XSS y rechaza datos personales identificables (CURP, RFC, email, teléfono).
- Los registros del formulario se guardan en `localStorage` con cuota máxima (100 registros), límite de 512 KB, deserializador seguro contra prototype pollution y botón de purga local; el código no envía ese contenido a una API.
- El Service Worker limita su manejo a solicitudes GET del mismo origen, precarga recursos públicos y elimina cachés cuyo nombre no pertenezca a la versión activa.
- La cámara y la ubicación se solicitan mediante controles explícitos. El flujo de cámara libera las pistas del dispositivo después de comprobar el acceso.
- `next.config.mjs` define cabeceras HTTP de seguridad (Content-Security-Policy con orígenes base, Permissions-Policy, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- `public/robots.txt` desalienta el rastreo indexado de la ruta operativa `/inspecciones`.

### Recomendaciones no implementadas

1. No usar información real hasta que existan autenticación, autorización en servidor, controles de transporte, validación de entradas en el servidor y procedimientos institucionales aprobados.
2. Aplicar validación de esquema y reglas de negocio del lado servidor a los datos recibidos cuando se implemente una API remota.
3. Definir criterios de retención formal con la institución, sin asumir plazos no aprobados.
4. Definir una política de caché y actualización adecuada para las rutas que deban operar offline; evitar almacenar en caché datos de negocio por defecto.
5. Asegurar el despliegue bajo HTTPS con certificados gestionados en infraestructura de producción.
6. Si se implementa sincronización real, enviar solo los campos necesarios, validar cada operación en el servidor, autenticar al actor, aplicar autorización por recurso y documentar el tratamiento de conflictos.
7. Añadir registro de auditoría protegido y controles de revisión; `createdAt` del navegador no es una fuente autoritativa.
8. Revisar la interfaz de cámara: actualmente ofrece una selección de archivo sin leer ni asociar el archivo y no captura una imagen. No anunciar la persistencia de evidencia hasta implementarla.

## 9. Riesgo residual y limitaciones

- Los datos sintéticos reducen el impacto de exposición en la demostración, complementados con validación anti-PII y purga local en cliente, aunque el entorno carece de cifrado en reposo.
- `localStorage` no cifra ni separa los registros entre personas que comparten el mismo perfil del navegador.
- `robots.txt` comunica preferencias a rastreadores cooperativos desalentando el rastreo; no controla accesos, no impide solicitudes directas y no garantiza que una URL desaparezca de resultados.
- La página offline no confirma que la lista o el formulario de inspecciones puedan abrirse desde cero sin conexión.
- El estado “sincronizada” de la interfaz es local y no demuestra recepción por un servidor.
- No se identificaron medidas de autenticación, autorización, auditoría durable, política institucional de retención ni backend de inspecciones; los controles de cabeceras, validación, cuotas y purga operan exclusivamente en el cliente.
- Este documento es un análisis técnico del prototipo y no una determinación de cumplimiento legal ni una auditoría de seguridad independiente.

## 10. Conclusiones

CheckUp es un prototipo Next.js con registros estáticos sintéticos, un formulario persistido localmente con controles de seguridad en cliente (sanitización anti-XSS, validación cuantitativa de 3 a 120 caracteres, detección de PII, cuotas, purga local y cabeceras HTTP restrictivas en next.config.mjs) y un Service Worker de alcance limitado a navegación y recursos. No es actualmente un sistema de gestión con backend ni sincronización remota de inspecciones. La principal prioridad de seguridad es mantener la prohibición de datos reales mientras no existan controles autoritativos de identidad, autorización, auditoría durable y retención en el servidor. Antes de ampliar el uso, deben implementarse y probarse esos controles en servidor, además de acordar con la institución el alcance offline y las reglas de tratamiento aplicables.
