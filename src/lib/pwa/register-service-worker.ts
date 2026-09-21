/**
 * Módulo de registro, ciclo de vida y actualización segura del Service Worker.
 * Responsabilidad: Integrante 2 (Registro, actualización e integración con la app).
 */

export interface RegisterServiceWorkerOptions {
  /** Ruta relativa del archivo del Service Worker. Por defecto '/sw.js'. */
  swPath?: string;
  /** Alcance del Service Worker. Por defecto '/'. */
  scope?: string;
  /** Forzar registro independientemente del entorno (útil para pruebas locales). */
  force?: boolean;
  /** Callback ejecutado cuando el Service Worker se instala y cachea por primera vez. */
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  /** Callback ejecutado cuando se detecta una nueva versión lista para instalarse/activarse. */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  /** Callback opcional para manejar errores en el registro. */
  onError?: (error: unknown) => void;
}

/**
 * Registra el Service Worker de forma segura y no bloqueante.
 * Solo se ejecuta en el navegador, en entornos compatibles y en producción
 * (o cuando la opción force es verdadera).
 */
export async function registerServiceWorker(
  options: RegisterServiceWorkerOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  // Manejo de ausencia de navigator.serviceWorker o ejecución en servidor (SSR):
  // no bloquea la carga del shell de la aplicación.
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const {
    swPath = '/sw.js',
    scope = '/',
    force = false,
    onSuccess,
    onUpdate,
    onError
  } = options;

  // Condición de entorno definida por el equipo:
  // producción o forzado explícito (para desarrollo y pruebas locales).
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldRegister = force || isProduction;

  if (!shouldRegister) {
    // En desarrollo no registramos por defecto para no interferir con Fast Refresh,
    // a menos que se fuerce explícitamente.
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath, { scope });

    // Caso 1: Ya existe un worker esperando ser activado
    if (registration.waiting && navigator.serviceWorker.controller) {
      console.info('[PWA] Service Worker en espera detectado. Actualización disponible.');
      onUpdate?.(registration);
    }

    // Caso 2: Detectar ciclo de vida y actualizaciones entrantes
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // Existe un controlador activo previo: se trata de una actualización
            console.info('[PWA] Nueva versión disponible instalada (esperando confirmación del usuario).');
            onUpdate?.(registration);
          } else {
            // Primer registro: contenido precacheado para consulta offline
            console.info('[PWA] Contenido precacheado exitosamente para uso offline.');
            onSuccess?.(registration);
          }
        }
      });
    });

    return registration;
  } catch (error) {
    // Registrar errores de instalación/registro mediante console.error con mensaje claro
    console.error('[PWA] Error al registrar el Service Worker (/sw.js):', error);
    onError?.(error);
    return null;
  }
}

/**
 * Aplica una actualización disponible de manera explícita y controlada tras la acción del usuario.
 * Envía el mensaje de invalidación de caché (CLEAR_RUNTIME_CACHE) y solicita activación (SKIP_WAITING).
 */
export function applyUpdate(
  registration: ServiceWorkerRegistration,
  options: { clearRuntimeCache?: boolean } = { clearRuntimeCache: true }
): void {
  const waitingWorker = registration.waiting;
  if (!waitingWorker) {
    console.warn('[PWA] No hay ningún Service Worker en espera para activar.');
    return;
  }

  // Enviar mensaje de invalidación controlada al worker antes de transferir control
  if (options.clearRuntimeCache) {
    waitingWorker.postMessage({ type: 'CLEAR_RUNTIME_CACHE' });
  }

  // Ordenar al nuevo worker que tome el control
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Envía el mensaje de invalidación de caché en tiempo de ejecución al worker activo.
 */
export function clearRuntimeCache(registration?: ServiceWorkerRegistration | null): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const target = registration?.active || navigator.serviceWorker.controller;
  if (target) {
    target.postMessage({ type: 'CLEAR_RUNTIME_CACHE' });
    console.info('[PWA] Mensaje CLEAR_RUNTIME_CACHE enviado.');
  }
}

/**
 * Escucha el evento 'controllerchange' para recargar la aplicación una vez que el
 * nuevo Service Worker toma el control tras la confirmación de actualización.
 * Retorna una función para cancelar la suscripción.
 */
export function onControllerChange(callback: () => void): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = () => {
    callback();
  };

  navigator.serviceWorker.addEventListener('controllerchange', handler);
  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handler);
  };
}

/**
 * Desregistra todos los Service Workers registrados (utilizado para limpieza y pruebas).
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return await registration.unregister();
    }
    return false;
  } catch (error) {
    console.error('[PWA] Error al desregistrar Service Worker:', error);
    return false;
  }
}
