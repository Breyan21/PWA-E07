// src/lib/notifications/client.ts

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export interface NotificationPayload {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  badge?: string;
  data?: unknown;
}

export interface InAppNotification {
  id: string;
  title: string;
  body?: string;
  timestamp: number;
  type: 'info' | 'warning' | 'success';
}

export interface NotificationResult {
  success: boolean;
  permission: NotificationPermissionState;
  fallbackTriggered: boolean;
  isInAppFallback: boolean;
  inAppMessage: InAppNotification | null;
  notification: Notification | null;
  error?: string;
}

export type InAppNotificationHandler = (notification: InAppNotification) => void;

/**
 * Comprueba si el entorno y el navegador soportan la API de Notificaciones.
 * Seguro para Server-Side Rendering (SSR).
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' &&
         typeof Notification !== 'undefined' &&
         typeof Notification.requestPermission === 'function';
}

/**
 * Obtiene el estado actual del permiso de notificaciones sin solicitarlo.
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Solicita permiso al usuario para enviar notificaciones.
 * Principio de permisos mínimos: debe ejecutarse únicamente ante una acción o gesto
 * explícito del usuario (por ejemplo, al activar las alertas de cambio de estado).
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    // Manejo de navegadores legacy que usan callback en vez de promesa
    return new Promise((resolve) => {
      try {
        Notification.requestPermission((status) => {
          resolve(status);
        });
      } catch {
        resolve('denied');
      }
    });
  }
}

/**
 * Genera un mensaje estructurado para fallback in-app.
 */
export function createInAppFallbackMessage(
  payload: NotificationPayload,
  type: 'info' | 'warning' | 'success' = 'info'
): InAppNotification {
  return {
    id: `in-app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: payload.title,
    body: payload.body,
    timestamp: Date.now(),
    type
  };
}

/**
 * Despacha una notificación de inspección.
 * Si el permiso no fue concedido ('denied' o 'default') o la API no está soportada,
 * se activa automáticamente el fallback in-app (aviso visual en pantalla) sin arrojar errores.
 */
export async function showInspectionNotification(
  payload: NotificationPayload,
  onInAppFallback?: InAppNotificationHandler
): Promise<NotificationResult> {
  if (!isNotificationSupported()) {
    const inAppMessage = createInAppFallbackMessage(payload, 'warning');
    if (onInAppFallback) {
      onInAppFallback(inAppMessage);
    }
    dispatchInAppCustomEvent(inAppMessage);

    return {
      success: false,
      permission: 'unsupported',
      fallbackTriggered: true,
      isInAppFallback: true,
      inAppMessage,
      notification: null,
      error: 'La API de Notificaciones no está soportada en este entorno.'
    };
  }

  const currentPermission = Notification.permission;

  if (currentPermission !== 'granted') {
    const inAppMessage = createInAppFallbackMessage(payload, 'info');
    if (onInAppFallback) {
      onInAppFallback(inAppMessage);
    }
    dispatchInAppCustomEvent(inAppMessage);

    return {
      success: false,
      permission: currentPermission,
      fallbackTriggered: true,
      isInAppFallback: true,
      inAppMessage,
      notification: null,
      error: currentPermission === 'denied'
        ? 'Permiso de notificaciones denegado por el usuario.'
        : 'Permiso de notificaciones no solicitado o pendiente de confirmación.'
    };
  }

  try {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      tag: payload.tag,
      badge: payload.badge,
      data: payload.data
    });

    return {
      success: true,
      permission: 'granted',
      fallbackTriggered: false,
      isInAppFallback: false,
      inAppMessage: null,
      notification
    };
  } catch (error: unknown) {
    // En ciertos navegadores móviles, new Notification() arroja error y requiere ServiceWorkerRegistration
    const inAppMessage = createInAppFallbackMessage(payload, 'warning');
    if (onInAppFallback) {
      onInAppFallback(inAppMessage);
    }
    dispatchInAppCustomEvent(inAppMessage);

    const errorMessage = error instanceof Error ? error.message : 'Error al instanciar la notificación nativa.';

    return {
      success: false,
      permission: 'granted',
      fallbackTriggered: true,
      isInAppFallback: true,
      inAppMessage,
      notification: null,
      error: errorMessage
    };
  }
}

/**
 * Dispara un CustomEvent en window si está en navegador para que cualquier componente
 * visual (Toast/Banner) pueda suscribirse sin acoplamiento directo.
 */
function dispatchInAppCustomEvent(inAppMessage: InAppNotification): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(
        new CustomEvent('inspection-in-app-notification', {
          detail: inAppMessage
        })
      );
    } catch {
      // Entornos donde CustomEvent no esté disponible o restringido
    }
  }
}
