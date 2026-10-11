import assert from "node:assert/strict";
import { requestCameraAccess } from "../src/lib/device/camera";

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

async function runTest() {
  console.log("Iniciando tests de capacidades (cámara)...");
  await testCameraFallbackOnPermissionDenied();
  console.log("✓ Cámara: fallback ante NotAllowedError");
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
