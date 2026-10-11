import assert from "node:assert/strict";
import { requestCameraAccess } from "../src/lib/device/camera";
import {
  requestCurrentPosition,
  SYNTHETIC_FALLBACK_COORDINATES
} from "../src/lib/device/geolocation";

// Envoltura mínima estilo expect sobre node:assert (el proyecto no usa Jest/Vitest)
function expect<T>(actual: T) {
  return {
    toBe(expected: T, message?: string) {
      assert.strictEqual(actual, expected, message);
    },
    toBeNull(message?: string) {
      assert.strictEqual(actual, null, message);
    },
  };
}

// Reemplaza navigator global de forma controlada y devuelve una función para restaurarlo
function mockNavigator(value: unknown): () => void {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    value,
    configurable: true,
    writable: true,
  });
  return () => {
    if (original) {
      Object.defineProperty(globalThis, "navigator", original);
    } else {
      delete (globalThis as { navigator?: unknown }).navigator;
    }
  };
}

async function testCameraFallbackOnPermissionDenied() {
  // Error sintético con el mismo name que lanza el navegador al denegar el permiso
  const deniedError = new Error("Permiso denegado (sintético)");
  deniedError.name = "NotAllowedError";

  let calls = 0;
  const restore = mockNavigator({
    mediaDevices: {
      getUserMedia: (_constraints: MediaStreamConstraints) => {
        calls++;
        return Promise.reject(deniedError);
      },
    },
  });

  try {
    const result = await requestCameraAccess();

    expect(calls).toBe(1, "getUserMedia debe invocarse exactamente una vez");
    expect(result.success).toBe(false, "success debe ser false cuando se niega el permiso");
    expect(result.stream).toBeNull("stream debe ser null cuando se niega el permiso");
    expect(result.fallbackTriggered).toBe(true, "fallbackTriggered debe ser estrictamente true");
    expect(result.error).toBe("Permiso de cámara denegado por el usuario.");
  } finally {
    restore();
  }
}

async function testGeolocationFallbackOnPermissionDenied() {
  let calls = 0;
  const restore = mockNavigator({
    geolocation: {
      getCurrentPosition: (
        _success: PositionCallback,
        error: PositionErrorCallback
      ) => {
        calls++;
        error({
          code: 1, // PERMISSION_DENIED
          message: "User denied Geolocation",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
      }
    }
  });

  try {
    const result = await requestCurrentPosition();

    expect(calls).toBe(1, "getCurrentPosition debe invocarse una vez");
    expect(result.success).toBe(false, "success debe ser false cuando se niega el permiso");
    expect(result.fallbackTriggered).toBe(true, "fallbackTriggered debe ser true");
    expect(result.isSyntheticFallback).toBe(true, "isSyntheticFallback debe ser true");
    expect(result.error).toBe("Permiso de geolocalización denegado por el usuario.");
    expect(result.coords?.latitude).toBe(SYNTHETIC_FALLBACK_COORDINATES.latitude);
    expect(result.coords?.longitude).toBe(SYNTHETIC_FALLBACK_COORDINATES.longitude);
  } finally {
    restore();
  }
}

async function testGeolocationSuccess() {
  let calls = 0;
  const restore = mockNavigator({
    geolocation: {
      getCurrentPosition: (
        success: PositionCallback
      ) => {
        calls++;
        success({
          coords: {
            latitude: 18.5,
            longitude: -97.4,
            accuracy: 25,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        } as GeolocationPosition);
      }
    }
  });

  try {
    const result = await requestCurrentPosition();

    expect(calls).toBe(1, "getCurrentPosition debe invocarse una vez");
    expect(result.success).toBe(true, "success debe ser true");
    expect(result.fallbackTriggered).toBe(false, "fallbackTriggered debe ser false");
    expect(result.isSyntheticFallback).toBe(false, "isSyntheticFallback debe ser false");
    expect(result.coords?.latitude).toBe(18.5);
    expect(result.coords?.longitude).toBe(-97.4);
  } finally {
    restore();
  }
}

async function testGeolocationUnsupported() {
  const restore = mockNavigator({});

  try {
    const result = await requestCurrentPosition();

    expect(result.success).toBe(false, "success debe ser false cuando no hay soporte");
    expect(result.fallbackTriggered).toBe(true, "fallbackTriggered debe ser true");
    expect(result.isSyntheticFallback).toBe(true, "isSyntheticFallback debe ser true");
    expect(result.coords?.latitude).toBe(SYNTHETIC_FALLBACK_COORDINATES.latitude);
  } finally {
    restore();
  }
}

async function runTest() {
  console.log("Iniciando tests de capacidades (cámara y geolocalización)...");
  await testCameraFallbackOnPermissionDenied();
  console.log("✓ Cámara: fallback ante NotAllowedError");
  await testGeolocationFallbackOnPermissionDenied();
  console.log("✓ Geolocalización: fallback ante PERMISSION_DENIED");
  await testGeolocationSuccess();
  console.log("✓ Geolocalización: obtención exitosa de coordenadas");
  await testGeolocationUnsupported();
  console.log("✓ Geolocalización: fallback ante entorno no soportado");
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});

