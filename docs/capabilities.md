# Memoria Técnica: Capacidades del Dispositivo, Privacidad y Fallbacks Funcionales

## 1. Arquitectura y Enfoque de Capacidades en PWA

El incremento de la Semana 6 dota a la PWA de inspecciones de laboratorio de capacidades nativas del hardware y del sistema operativo (Cámara, Geolocalización y Notificaciones), manteniendo de forma rigurosa los principios de **permisos mínimos (*least privilege*)**, **acción explícita del usuario (*user gesture*)**, **minimización de datos (*data minimization*)** y **degradación funcional elegante (*graceful fallback*)**.

La meta fundamental es que la aplicación sea 100% resiliente: ninguna denegación de permisos ni ausencia de hardware debe romper el flujo de inspección ni generar excepciones no controladas.

---

## 2. Matriz de Permisos Mínimos (Least Privilege)

| Capacidad / API | Momento de Solicitud | Justificación Técnica | Permiso Solicitado | Mitigación de Privacidad y Recursos |
|---|---|---|---|---|
| **Cámara** (`MediaDevices.getUserMedia`) | Exclusivamente tras pulsar "Tomar foto de evidencia" | Obtener registro visual directo del estado de los equipos e instalaciones del laboratorio | `camera` | Solo activa el sensor bajo acción intencional. Tras capturar la evidencia o ante un fallo, se invoca `releaseCameraStream` deteniendo todos los `MediaStreamTracks`, lo que apaga de inmediato el indicador físico de cámara. |
| **Geolocalización** (`Geolocation.getCurrentPosition`) | Bajo demanda al registrar o guardar la inspección | Obtener las coordenadas geográficas puntuales del laboratorio para validar la presencia en sitio | `geolocation` | Lectura única puntual (*one-shot*). Se prohíbe el uso de `watchPosition` para evitar rastreo continuo invasivo de la persona inspectora y ahorro de batería. Timeout estricto de 5000ms. |
| **Notificaciones** (`Notification.requestPermission`) | Tras acción del usuario al configurar alertas o enviar inspección | Notificar cambios de estado en segundo plano, confirmaciones de guardado y alertas de incidentes | `notifications` | Solicitud contextual nunca forzada en el arranque. Si el permiso no es concedido, no se insiste y se redirige de forma transparente a avisos visuales en pantalla (*in-app notification*). |

---

## 3. Justificación Técnica del Momento de Solicitud (Just-in-Time Consent)

Los navegadores modernos y las directrices de experiencia de usuario rechazan la solicitud masiva de permisos en la carga inicial (`onMount` / carga de página). Solicitar permisos en frío provoca una alta tasa de rechazo por desconfianza del usuario y puede provocar bloqueos automáticos por heurísticas de abuso del navegador.

En nuestra arquitectura:
1. **Cámara:** Se solicita dentro de `requestCameraAccess()` solo cuando el inspector decide adjuntar evidencia fotográfica interactiva.
2. **Geolocalización:** Se solicita dentro de `requestCurrentPosition()` durante la confirmación del reporte, limitando la ventana de acceso a un máximo de 5 segundos.
3. **Notificaciones:** Se solicita dentro de `requestNotificationPermission()` de manera contextual, permitiendo que la interfaz continúe operando si el usuario decide declinarla.

---

## 4. Estrategia de Minimización de Datos y Privacidad

Para garantizar el cumplimiento ético y la protección de datos:
- **Sin rastreo continuo:** La geolocalización no monitorea trayectorias. Aplica `enableHighAccuracy: false` por defecto para limitar la recolección a la celda aproximada y `maximumAge: 60000` para reutilizar lecturas recientes si existen, minimizando consultas redundantes al sensor GPS.
- **Liberación inmediata de hardware:** En la captura multimedia, la función `releaseCameraStream(stream)` recorre `stream.getTracks()` ejecutando `track.stop()`, garantizando que la cámara web o del dispositivo móvil no permanezca encendida en segundo plano.
- **Aislamiento de red:** No se envían coordenadas ni capturas a servicios externos de analítica o rastreo. Las operaciones operan en un entorno controlado con datos sintéticos.

---

## 5. Mapa de Fallbacks Funcionales (Graceful Degradation)

Cada módulo de capacidad cuenta con un fallback estructurado que preserva la continuidad del negocio:

```
[Usuario solicita acción]
         │
         ▼
[¿API soportada en navegador?] ──── No ───► [Activar Fallback Funcional]
         │                                            │
        Sí                                            │
         ▼                                            ▼
[Solicitar permiso bajo demanda]               • Cámara: fallbackTriggered=true, entrada manual/sintética
         │                                     • Geolocation: SYNTHETIC_FALLBACK_COORDINATES (UTT)
    ¿Concedido?                                • Notificaciones: inAppMessage en pantalla
     /        \
   Sí          No (denied/dismissed)
   │            │
   ▼            ▼
[API Nativa]  [Activar Fallback Funcional]
```

### Detalle de Fallbacks por Módulo:

1. **Cámara (`src/lib/device/camera.ts`):**
   - *Escenarios de falla:* API no soportada en el navegador (`navigator.mediaDevices === undefined`), permiso denegado (`NotAllowedError`), cámara ausente (`NotFoundError`), o cámara en uso (`NotReadableError`).
   - *Comportamiento del Fallback:* Retorna `{ success: false, stream: null, fallbackTriggered: true, error: "..." }`. La interfaz puede ofrecer un `<input type="file" capture="environment">` estándar o adjuntar datos sintéticos de muestra sin abortar el formulario de inspección.

2. **Geolocalización (`src/lib/device/geolocation.ts`):**
   - *Escenarios de falla:* Entorno sin soporte (SSR o navegador obsoleto), permiso denegado (`PERMISSION_DENIED` - code 1), posición no disponible (`POSITION_UNAVAILABLE` - code 2), o tiempo de espera agotado (`TIMEOUT` - code 3).
   - *Comportamiento del Fallback:* Retorna `{ success: false, coords: SYNTHETIC_FALLBACK_COORDINATES, fallbackTriggered: true, isSyntheticFallback: true, error: "..." }`. Las coordenadas corresponden al centro de laboratorios de la UTT (Lat: 18.4627, Lon: -97.3928), garantizando que el registro se almacene con una georreferencia válida y transparente.

3. **Notificaciones (`src/lib/notifications/client.ts`):**
   - *Escenarios de falla:* Entorno SSR / Node.js, navegador sin soporte de la API `Notification`, permiso denegado (`permission === 'denied'`), o excepción del constructor nativo en ciertos navegadores móviles.
   - *Comportamiento del Fallback:* Construye un objeto `InAppNotification` con `{ id, title, body, timestamp, type }`, ejecuta el callback `onInAppFallback` provisto y despacha el evento global `inspection-in-app-notification`. El usuario recibe de inmediato una alerta visual en pantalla (banner/toast), asegurando que los cambios de estado sean comunicados.

---

## 6. Límites Técnicos y Riesgos de Entorno

1. **Contexto Seguro Requerido (Secure Context):** Tanto `mediaDevices.getUserMedia` como `navigator.geolocation` exigen conexión bajo HTTPS o `http://localhost`. En redes locales de prueba vía HTTP con IP directa, los navegadores desactivan silenciosamente estas APIs por especificación W3C.
2. **Ambientes Cerrados y Edificios Blindados:** En sótanos o laboratorios cerrados con estructuras metálicas, la señal satelital de GPS es prácticamente nula. El valor configurado de `timeout: 5000` evita bloqueos indefinidos y permite saltar oportunamente al fallback sintético.
3. **Variaciones Móviles en Notificaciones:** En ciertos navegadores móviles (especialmente en Android Chrome), `new Notification()` dentro del contexto de ventana lanza un error de ejecución debido a que el estándar exige dispararlas a través de un Service Worker (`registration.showNotification`). El cliente implementado captura este fallo y activa el fallback in-app, garantizando estabilidad total.
