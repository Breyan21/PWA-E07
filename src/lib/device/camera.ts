// src/lib/device/camera.ts

export interface CameraResult {
  success: boolean;
  stream: MediaStream | null;
  error?: string;
  fallbackTriggered: boolean;
}

// Verifica si el navegador soporta la API de MediaDevices
export function isCameraSupported(): boolean {
  return typeof navigator !== 'undefined' &&
         !!navigator.mediaDevices &&
         !!navigator.mediaDevices.getUserMedia;
}

/**
 * Solicita acceso a la cámara. Debe ser llamada SOLO tras un gesto explícito del usuario.
 */
export async function requestCameraAccess(): Promise<CameraResult> {
  if (!isCameraSupported()) {
    return {
      success: false,
      stream: null,
      error: 'La API de cámara no está soportada en este entorno.',
      fallbackTriggered: true
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    return {
      success: true,
      stream,
      fallbackTriggered: false
    };
  } catch (error: unknown) {
    const name = (error as { name?: string } | null)?.name;
    let errorMessage = 'Error desconocido al acceder a la cámara.';

    if (name === 'NotAllowedError') {
      errorMessage = 'Permiso de cámara denegado por el usuario.';
    } else if (name === 'NotFoundError') {
      errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
    } else if (name === 'NotReadableError') {
      errorMessage = 'La cámara ya está siendo usada por otra aplicación.';
    }

    return {
      success: false,
      stream: null,
      error: errorMessage,
      fallbackTriggered: true
    };
  }
}

/**
 * Libera todos los tracks del MediaStream para apagar el indicador de grabación.
 */
export function releaseCameraStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
