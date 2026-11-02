# Inventario de privacidad y tratamiento de datos

## 1. Objetivo y alcance

Este inventario describe los datos que el código actual de CheckUp muestra, captura o puede solicitar para su demostración de inspecciones de mantenimiento de laboratorios. Distingue los registros sintéticos precargados de la entrada validada que una persona introduce y de las capacidades de dispositivo que operan bajo acción explícita sin persistencia de evidencias sensibles.

El contexto de la actividad considera a la Universidad Tecnológica de Tehuacán como sujeto obligado mexicano y solicita tomar en cuenta los principios de la LGPDPPSO. La institución debe confirmar, con su área jurídica o responsable de protección de datos, la normativa vigente y aplicable, el aviso de privacidad, las finalidades institucionales, las bases de tratamiento y los instrumentos de retención antes de tratar información real. Este inventario es técnico y no sustituye esa determinación.

## 2. Sistemas y almacenamiento observados

- **Datos de demostración:** arreglos estáticos en `src/lib/data/inspections.ts` y `src/app/inspecciones/[id]/page.tsx`; se representan en páginas públicas.
- **Formulario local:** título (validado entre 3 y 120 caracteres, sanitizado y con filtro de PII), estado, identificador sintético y fecha en `localStorage` del origen bajo cuotas de seguridad. La interfaz dispone de un botón de purga local de datos conforme al derecho de supresión (LGPDPPSO).
- **Cola de sincronización:** existe una estructura y lógica en memoria en `src/lib/sync/queue.ts`, no integrada al formulario ni persistida en almacenamiento web.
- **Cache Storage:** el Service Worker conserva recursos de aplicación; no hay indicio de que conserve registros del formulario.
- **IndexedDB:** no se encontró uso.
- **Servidor/API:** no se encontró un endpoint de negocio ni transmisión de registros de inspección. La interfaz cambia el estado local al pulsar sincronizar; no envía los registros.

## 3. Inventario de categorías de datos

| Tipo de dato | Ejemplo sintético | Finalidad | Origen | Almacenamiento | Tiempo o criterio de retención | Procedimiento de eliminación | Riesgo de exposición |
|---|---|---|---|---|---|---|---|
| Registro de demostración | `inspection-001`, `Laboratorio de Redes`, estado `ok`, fecha `2026-08-28` | Mostrar listado, búsqueda, filtros y detalle | Arreglos estáticos del código | Código entregado al navegador y memoria de la página | Mientras esa versión del código esté publicada; no es una retención de datos personales | Retirar o reemplazar el registro en una versión del código | Bajo si permanece sintético; los datos son públicos para quien descargue la aplicación |
| Título del formulario | `Revisión sintética de laboratorio` | Probar captura y persistencia local bajo controles de minimización | Entrada manual de la persona usuaria sujeta a validación (3 a 120 caracteres), sanitización anti-XSS y detección de PII | `localStorage` del navegador bajo la clave del flujo local (`checkup:offline-inspections`) con cuota máxima de 100 registros | Persiste hasta su depuración manual o limpieza del navegador; no hay política de caducidad automática de servidor | Botón de purga local en la interfaz ("Limpiar datos locales (Supresión LGPDPPSO)") o limpieza del perfil del navegador. La purga en servidor permanece pendiente al no haber API remota | Bajo a medio; la validación y el filtro de PII impiden guardar CURP, RFC, correos o teléfonos, pero el almacenamiento local carece de cifrado en reposo |
| Estado del formulario | `attention` | Representar condición de demostración | Selección en el formulario | Junto con el registro en `localStorage` | Mismo criterio que el título | Botón de purga local en la interfaz o limpieza del perfil del navegador | Bajo por sí solo; puede adquirir contexto institucional al asociarse con otro dato |
| Identificador y fecha local | UUID aleatorio y fecha ISO de creación | Distinguir y ordenar registros locales | Navegador al guardar el formulario | Junto con el registro en `localStorage` | Mismo criterio que el registro | Botón de purga local en la interfaz o limpieza del perfil del navegador | Bajo a medio; la fecha puede revelar actividad y el identificador no es una identidad, pero enlaza elementos del registro |
| Responsable de demostración | `Técnica A` | Mostrar un campo ilustrativo en el listado | Arreglo sintético del código | Código y página renderizada | Mientras el dato exista en la versión publicada | Retirar o sustituir el ejemplo en el código | Bajo si sigue siendo ficticio; no se debe reemplazar por nombres reales sin revisar finalidad y base aplicable |
| Ubicación | `18.4627, -97.3928` como respaldo sintético | Probar fallback de ubicación | Constante sintética; alternativamente, API del navegador al pulsar el botón | La función obtiene coordenadas reales bajo permiso, pero el flujo actual no las guarda ni las adjunta al registro; la respuesta se descarta tras mostrar un mensaje | No se observa persistencia de coordenadas en la aplicación | No hay dato local que eliminar en el flujo actual; al cambiarlo, verificar que permisos y estado temporal se liberen | Medio si se captura ubicación real; el acceso depende del permiso del navegador y puede revelar presencia |
| Fotografía o archivo | No hay foto guardada; el selector acepta un archivo de imagen sintético | Interfaz prevista para probar evidencia visual | Cámara bajo acción explícita o selección manual de archivo | El stream de cámara se libera tras la comprobación; el selector no tiene manejador para leer, enviar o guardar el archivo | No se observa almacenamiento de imagen | No hay imagen persistida por el flujo actual. Si se implementa captura, definir borrado del archivo y copias temporales | Medio a alto si en el futuro se almacena; una imagen puede mostrar personas, pantallas, documentos o características del laboratorio |
| Telemetría técnica | Estado online/offline y eventos de ciclo de vida del Service Worker | Adaptar mensajes de interfaz y diagnosticar registro/actualización | API de red del navegador y eventos locales | Estado temporal de React y mensajes en consola; no se encontró colector analítico externo | Estado efímero; la consola puede permanecer en herramientas locales del navegador | Cerrar o limpiar la consola/sesión; no se observa procedimiento central de retención porque no hay recolección remota | Bajo en lo observado; mensajes de error podrían revelar detalles técnicos si se exportan fuera del dispositivo |
| Registro de auditoría | No existe un historial durable implementado; `createdAt` es una fecha local del formulario | No hay finalidad de auditoría satisfecha actualmente | Fecha generada por el navegador; cola de sincronización en memoria en un módulo no conectado | Registro local del formulario, sin eventos de modificación separados; cola en memoria | No hay política de auditoría ni retención configurada | Botón de purga local en la interfaz o limpieza del perfil; no existe un mecanismo para purgar un historial de auditoría de servidor | Medio si se interpreta la fecha local como evidencia confiable; puede cambiarse y no identifica al autor |
| Permisos del dispositivo | Concesión o denegación de cámara/ubicación | Permitir una prueba puntual de la capacidad elegida | Decisión de la persona usuaria administrada por el navegador | El permiso lo administra el navegador; la aplicación no mantiene un registro propio del permiso | Según controles del navegador y la configuración del dispositivo | Revocar desde la configuración de permisos del navegador o del dispositivo | Bajo en el código observado; la concesión habilita el acceso a la capacidad, no autoriza el tratamiento institucional |

## 4. Datos y capacidades: existencia real frente a intención

### Inspecciones

Los registros visibles de listado y detalle están escritos en el código como ejemplos sintéticos. El formulario añade registros locales con título validado, estado, identificador sintético y fecha. No están vinculados a un servidor, y el botón “Sincronizar pendientes” solo cambia su estado local.

### Ubicación

El módulo solicita una lectura puntual al pulsar el control de ubicación y devuelve coordenadas actuales si el navegador las entrega; si no, ofrece un punto sintético fijo. En el componente, el resultado no se incorpora al registro ni se persiste. Por tanto, la ubicación real puede ser accedida transitoriamente por el código, pero no se observa almacenamiento de esas coordenadas.

### Fotografías

El componente permite solicitar acceso a cámara y libera el stream tras comprobarlo, sin capturar un fotograma. En caso de fallback aparece un selector de imagen sintética, pero no tiene lógica que procese el archivo. No hay fotografía guardada ni enviada en el flujo actual.

### Telemetría técnica

No se encontró integración de analítica ni envío a un recolector externo. La interfaz consulta `navigator.onLine` para mostrar el estado de conexión y los módulos del Service Worker escriben mensajes de diagnóstico en la consola. No se encontró un repositorio central de eventos.

### Registros de auditoría

No hay una bitácora durable de eventos o de atribución. La fecha local del registro no constituye una evidencia verificable. La cola de sincronización definida en código mantiene información en memoria y no está conectada al flujo visual.

## 5. Principios de tratamiento y minimización

En el contexto indicado por la actividad, el diseño debe documentar y respetar los principios aplicables de licitud, finalidad, lealtad, consentimiento cuando corresponda, calidad, proporcionalidad, información y responsabilidad. Su aplicación concreta, así como el marco vigente para la institución, debe confirmarse institucionalmente.

- **Finalidad:** limitar el prototipo a demostrar captura, consulta y comportamiento de conectividad. No reutilizar títulos, ubicaciones ni imágenes para otras finalidades.
- **Proporcionalidad y minimización:** solicitar solo los campos indispensables. La captura actual necesita título y estado; no necesita identidad real, ubicación precisa ni imagen para demostrar su funcionamiento. Se bloquea la captura de identificadores personales en el cliente.
- **Calidad:** no presentar valores sintéticos como observaciones reales ni tratar un estado local como confirmación de servidor.
- **Información y decisión:** explicar antes de solicitar una capacidad del dispositivo qué se consultará y qué no se guardará. La decisión del navegador sobre un permiso no reemplaza el deber de información institucional.
- **Responsabilidad:** documentar responsables, aviso de privacidad, accesos, retención, eliminación y respuesta a incidentes antes de un piloto con datos reales.

## 6. Justificación de datos exclusivamente sintéticos

El proyecto declara que sus registros son sintéticos y usa nombres de laboratorio y responsables ficticios en el código. Los datos sintéticos permiten probar pantallas, filtros, persistencia local y fallbacks sin exponer información de estudiantes, docentes o personal.

Esta decisión se refuerza técnicamente en el cliente mediante el módulo de validación (`src/lib/security/validator.ts` y `sanitizer.ts`), que analiza activamente el texto ingresado para neutralizar inyecciones de código y detectar identificadores personales (CURP, RFC, correos y números telefónicos), impidiendo el registro si se detectan datos reales. No obstante, en un entorno de producción este control debe replicarse obligatoriamente del lado del servidor.

## 7. Ciclo de vida y retención

1. **Generación:** ejemplos de inspecciones y responsable se mantienen como datos estáticos del código; el formulario crea un identificador y una fecha en el navegador.
2. **Captura:** la persona escribe un título y selecciona un estado. El código valida el título (3 a 120 caracteres), aplica sanitización anti-XSS y rechaza identificadores personales reconocibles (CURP, RFC, correo, teléfono).
3. **Uso:** la interfaz presenta los registros y permite consultar su estado local. Búsqueda y filtros operan en memoria.
4. **Persistencia:** el formulario serializa la lista en `localStorage` bajo cuota de seguridad (máximo 100 registros y límite de 512 KB). No se observa persistencia en IndexedDB ni API de inspecciones.
5. **Sincronización aparente:** al pulsar el botón, los registros pendientes cambian a `synced` localmente cuando hay conexión; no se transmite el contenido. El texto de interfaz no debe tomarse como prueba de recepción remota.
6. **Retención:** no hay vencimiento ni política institucional de retención configurada en el servidor. En el cliente, los registros permanecen hasta su eliminación manual o limpieza del navegador.
7. **Eliminación:** la interfaz incorpora un botón de purga local ("Limpiar datos locales (Supresión LGPDPPSO)") que elimina la clave de inspecciones en el navegador y reinicia el estado. Para una versión operativa con backend, se requerirá un endpoint seguro de supresión y criterios institucionales aprobados.

No se establece un plazo calendario porque no se encontró una política aprobada. La institución debe determinar un plazo o evento de eliminación basado en la finalidad, obligaciones archivísticas aplicables, necesidad operativa y procedimientos documentados.

## 8. Almacenamiento local y conectividad intermitente

`localStorage` persiste entre recargas y está disponible para scripts del mismo origen. No debe considerarse almacenamiento cifrado, almacenamiento institucional controlado ni respaldo. Quien tenga acceso al perfil del navegador puede consultar los datos y un script del mismo origen puede leerlos.

El Service Worker precarga la raíz, el manifiesto, iconos y `offline.html`; además puede guardar recursos estáticos. Las navegaciones usan red primero y, si fallan, la ruta busca una respuesta ya almacenada o muestra la página offline. El worker no guarda registros del formulario y no convierte por sí solo la aplicación en una solución de sincronización offline.

Para uso institucional, se requiere definir el comportamiento ante dispositivo compartido o extraviado, cierres inesperados, cuotas agotadas, limpieza del perfil, actualización del Service Worker y pérdida de conectividad. No almacenar información real mientras esos riesgos no cuenten con medidas y procedimientos aprobados.

## 9. Riesgos y medidas de mitigación

| Riesgo de privacidad | Medida actual | Acción recomendada |
|---|---|---|
| Entrada accidental de información real en el campo libre | El formulario valida longitud (3 a 120 caracteres), sanitiza marcado y rechaza proactivamente CURP, RFC, correos y teléfonos; datos sintéticos | Mantener datos ficticios; replicar reglas de validación en el servidor al implementar APIs |
| Exposición por perfil compartido o extravío del dispositivo | Persistencia en `localStorage` con cuotas cuantitativas (100 registros, 512 KB), deserializador seguro y botón de purga local | Evitar información real; añadir cifrado en reposo si se manejan datos sensibles y documentar retención |
| Interpretar una ubicación real como dato persistido | El módulo puede obtenerla bajo solicitud expresa, pero el componente solo muestra un mensaje transitorio sin guardarla | Mantener ubicación deshabilitada salvo necesidad; si se guarda, minimizar precisión y tiempo y documentar finalidad y eliminación |
| Falsa expectativa de evidencia fotográfica | El control de cámara prueba el acceso y libera las pistas de inmediato; el selector de archivo no procesa la selección | Aclarar el alcance; antes de implementar captura, definir revisión de contenido, tamaño, metadatos, almacenamiento y purga |
| Confundir el indicador de sincronización con recepción institucional | La interfaz solo actualiza estado local | Cambiar la semántica al integrar un servidor; confirmar recepción y mostrar fallos de transferencia |
| Atribución inexacta de cambios | No hay identidad autenticada ni bitácora durable | Incorporar mecanismos institucionales de identidad y auditoría del lado servidor antes de procesos reales |
| Persistencia indefinida por ausencia de retención | Botón de purga local en la interfaz ("Limpiar datos locales (Supresión LGPDPPSO)") para ejercicio de derechos ARCO/LGPDPPSO | Aprobar criterios institucionales y hacer que la eliminación y retención en servidor sean verificables |

## 10. Limitaciones y recomendaciones

- No se verificó un aviso de privacidad, una política institucional de retención ni la clasificación jurídica concreta del tratamiento institucional.
- La aplicación no cuenta con autenticación, autorización, backend de inspecciones, transmisión de registros ni auditoría durable.
- La regla de datos sintéticos está respaldada en cliente por la validación técnica anti-PII y cuotas locales, pero en producción requerirá replicarse en el servidor y formalizarse en un aviso de privacidad institucional.
- El proyecto no implementa persistencia de fotografías o coordenadas; describirlas como parte del inventario no significa que se recolecten o almacenen actualmente.
- Antes de incorporar datos reales, el área responsable debe confirmar normativa vigente, finalidades y base jurídica, proporcionalidad, aviso de privacidad, controles de acceso, conservación, eliminación y gestión de incidentes.
