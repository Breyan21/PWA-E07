// src/lib/device/geolocation.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationResult {
  success: boolean;
  coords: Coordinates | null;
  error?: string;
  fallbackTriggered: boolean;
  isSyntheticFallback?: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Coordenadas sintéticas por defecto (Laboratorios UTT) para garantizar degradación funcional sin PII
export const SYNTHETIC_FALLBACK_COORDINATES: Coordinates = {
  latitude: 18.4627,
  longitude: -97.3928,
  accuracy: 100
};

/**
 * Comprueba si el entorno y el navegador soportan la API de geolocalización.
 * Seguro para entornos SSR (donde `navigator` no existe).
 */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' &&
         !!navigator.geolocation &&
         typeof navigator.geolocation.getCurrentPosition === 'function';
}

/**
 * Obtiene las coordenadas sintéticas de respaldo para operaciones offline o cuando se deniega el permiso.
 */
export function getSyntheticFallbackCoordinates(): Coordinates {
  return { ...SYNTHETIC_FALLBACK_COORDINATES };
}

/**
 * Solicita la posición geográfica puntual del usuario.
 * Cumple con el principio de permisos mínimos:
 * - Se ejecuta bajo demanda (lectura única, sin watchPosition continuo invasivo).
 * - Usa timeout acotado (5000ms) y precisión balanceada por defecto para proteger la privacidad.
 * - Provee fallback funcional sintético si la API no existe, expira o el permiso es denegado.
 */
export function requestCurrentPosition(options: GeolocationOptions = {}): Promise<GeolocationResult> {
  const mergedOptions: GeolocationOptions = {
    enableHighAccuracy: false, // Minimización de datos y menor consumo de batería
    timeout: 5000,             // Evita bloqueos indefinidos ante falta de señal GPS
    maximumAge: 60000,         // Reutiliza lecturas recientes para evitar saturar el hardware
    ...options
  };

  if (!isGeolocationSupported()) {
    return Promise.resolve({
      success: false,
      coords: getSyntheticFallbackCoordinates(),
      error: 'La API de geolocalización no está soportada en este entorno.',
      fallbackTriggered: true,
      isSyntheticFallback: true
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          fallbackTriggered: false,
          isSyntheticFallback: false
        });
      },
      (error) => {
        let errorMessage = 'Error desconocido al consultar la ubicación.';

        // Mapeo seguro según especificación W3C Geolocation API
        if (error.code === 1) { // PERMISSION_DENIED
          errorMessage = 'Permiso de geolocalización denegado por el usuario.';
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          errorMessage = 'La posición no está disponible actualmente.';
        } else if (error.code === 3) { // TIMEOUT
          errorMessage = 'Tiempo de espera agotado al consultar la ubicación.';
        }

        resolve({
          success: false,
          coords: getSyntheticFallbackCoordinates(),
          error: errorMessage,
          fallbackTriggered: true,
          isSyntheticFallback: true
        });
      },
      mergedOptions
    );
  });
}
