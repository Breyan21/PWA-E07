import assert from "node:assert/strict";
import {
  requestCameraAccess,
  isCameraSupported,
  releaseCameraStream
} from "../src/lib/device/camera";
import {
  requestCurrentPosition,
  isGeolocationSupported,
  SYNTHETIC_FALLBACK_COORDINATES
} from "../src/lib/device/geolocation";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showInspectionNotification,
  InAppNotification
} from "../src/lib/notifications/client";

// Envoltura mínima estilo expect sobre node:assert (el proyecto no usa Jest/Vitest)
function expect<T>(actual: T) {
  return {
    toBe(expected: T, message?: string) {
      assert.strictEqual(actual, expected, message);
    },
    toBeNull(message?: string) {
      assert.strictEqual(actual, null, message);
    },
    toBeTruthy(message?: string) {
      assert.ok(actual, message);
    },
    toBeFalsy(message?: string) {
      assert.ok(!actual, message);
    }
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

// Reemplaza window y Notification globales de forma controlada y devuelve función para restaurarlos
interface MockNotificationEnvOptions {
  permission?: NotificationPermission;
  requestPermissionFn?: () => Promise<NotificationPermission>;
  shouldThrowOnConstruct?: boolean;
}

function mockNotificationEnvironment(options: MockNotificationEnvOptions = {}): () => void {
  const origWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const origNotification = Object.getOwnPropertyDescriptor(globalThis, "Notification");

  const permissionVal = options.permission ?? "default";

  class MockNotification {
    static permission: NotificationPermission = permissionVal;
    static requestPermission = options.requestPermissionFn ?? (async () => permissionVal);

    title: string;
    options?: unknown;

    constructor(title: string, opts?: unknown) {
      if (options.shouldThrowOnConstruct) {
        throw new Error("Illegal constructor: use ServiceWorkerRegistration.showNotification instead");
      }
      this.title = title;
      this.options = opts;
    }
  }

  const mockWindow = {
    Notification: MockNotification,
    dispatchEvent: () => true,
  };

  Object.defineProperty(globalThis, "window", {
    value: mockWindow,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "Notification", {
    value: MockNotification,
    configurable: true,
    writable: true,
  });

  return () => {
    if (origWindow) {
      Object.defineProperty(globalThis, "window", origWindow);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
    if (origNotification) {
      Object.defineProperty(globalThis, "Notification", origNotification);
    } else {
      delete (globalThis as { Notification?: unknown }).Notification;
    }
  };
}

// ==================== TESTS DE CÁMARA ====================

async function testCameraSupportDetection() {
  const restoreEmpty = mockNavigator({});
  try {
    expect(isCameraSupported()).toBe(false, "isCameraSupported debe ser false sin mediaDevices");
  } finally {
    restoreEmpty();
  }

  const restoreSupported = mockNavigator({
    mediaDevices: {
      getUserMedia: () => Promise.resolve({} as MediaStream)
    }
  });
  try {
    expect(isCameraSupported()).toBe(true, "isCameraSupported debe ser true con getUserMedia disponible");
  } finally {
    restoreSupported();
  }
}

async function testCameraFallbackOnPermissionDenied() {
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

async function testCameraSuccessAndStreamRelease() {
  let stoppedTracks = 0;
  const mockTrack = {
    stop: () => {
      stoppedTracks++;
    }
  };
  const mockStream = {
    getTracks: () => [mockTrack, mockTrack]
  } as unknown as MediaStream;

  const restore = mockNavigator({
    mediaDevices: {
      getUserMedia: () => Promise.resolve(mockStream)
    }
  });

  try {
    const result = await requestCameraAccess();

    expect(result.success).toBe(true, "success debe ser true cuando el acceso es concedido");
    expect(result.fallbackTriggered).toBe(false, "fallbackTriggered debe ser false");
    expect(result.stream !== null).toBe(true, "stream debe existir");

    releaseCameraStream(result.stream);
    expect(stoppedTracks).toBe(2, "Todos los tracks del stream deben haberse detenido");
  } finally {
    restore();
  }
}

// ==================== TESTS DE GEOLOCALIZACIÓN ====================

async function testGeolocationSupportDetection() {
  const restoreEmpty = mockNavigator({});
  try {
    expect(isGeolocationSupported()).toBe(false, "isGeolocationSupported debe ser false sin geolocation");
  } finally {
    restoreEmpty();
  }

  const restoreSupported = mockNavigator({
    geolocation: {
      getCurrentPosition: () => {}
    }
  });
  try {
    expect(isGeolocationSupported()).toBe(true, "isGeolocationSupported debe ser true con getCurrentPosition");
  } finally {
    restoreSupported();
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

// ==================== TESTS DE NOTIFICACIONES ====================

async function testNotificationSupportDetection() {
  // Entorno sin window ni Notification (SSR o Node puro)
  expect(isNotificationSupported()).toBe(false, "isNotificationSupported debe ser false en Node puro");
  expect(getNotificationPermission()).toBe("unsupported", "getNotificationPermission debe ser 'unsupported'");

  const restoreSupported = mockNotificationEnvironment({ permission: "default" });
  try {
    expect(isNotificationSupported()).toBe(true, "isNotificationSupported debe ser true con Notification mockeado");
    expect(getNotificationPermission()).toBe("default", "getNotificationPermission debe retornar 'default'");
  } finally {
    restoreSupported();
  }
}

async function testNotificationPermissionRequest() {
  const restoreGranted = mockNotificationEnvironment({
    requestPermissionFn: async () => "granted"
  });
  try {
    const permission = await requestNotificationPermission();
    expect(permission).toBe("granted", "requestNotificationPermission debe retornar 'granted'");
  } finally {
    restoreGranted();
  }

  const restoreDenied = mockNotificationEnvironment({
    requestPermissionFn: async () => "denied"
  });
  try {
    const permission = await requestNotificationPermission();
    expect(permission).toBe("denied", "requestNotificationPermission debe retornar 'denied'");
  } finally {
    restoreDenied();
  }
}

async function testNotificationSuccessOnGranted() {
  const restore = mockNotificationEnvironment({ permission: "granted" });

  try {
    const payload = {
      title: "Inspección Registrada",
      body: "La inspección del Laboratorio 2 fue guardada correctamente."
    };

    const result = await showInspectionNotification(payload);

    expect(result.success).toBe(true, "success debe ser true cuando el permiso es granted");
    expect(result.permission).toBe("granted", "permission debe ser 'granted'");
    expect(result.fallbackTriggered).toBe(false, "fallbackTriggered debe ser false");
    expect(result.isInAppFallback).toBe(false, "isInAppFallback debe ser false");
    expect(result.inAppMessage).toBeNull("inAppMessage debe ser null");
    expect(result.notification !== null).toBe(true, "debe instanciarse el objeto Notification nativo");
    expect((result.notification as unknown as { title: string }).title).toBe(payload.title);
  } finally {
    restore();
  }
}

async function testNotificationFallbackOnPermissionDenied() {
  const restore = mockNotificationEnvironment({ permission: "denied" });

  try {
    const payload = {
      title: "Alerta de Mantenimiento",
      body: "Se detectó fuga de agua en el Laboratorio 1."
    };

    let inAppHandled: InAppNotification | null = null;
    const result = await showInspectionNotification(payload, (msg) => {
      inAppHandled = msg;
    });

    expect(result.success).toBe(false, "success debe ser false cuando el permiso está denegado");
    expect(result.permission).toBe("denied", "permission debe ser 'denied'");
    expect(result.fallbackTriggered).toBe(true, "fallbackTriggered debe ser true ante permiso denegado");
    expect(result.isInAppFallback).toBe(true, "isInAppFallback debe ser true");
    expect(result.notification).toBeNull("notification nativa debe ser null");
    expect(result.inAppMessage !== null).toBe(true, "inAppMessage debe haberse generado");
    expect(result.inAppMessage?.title).toBe(payload.title);
    expect(result.inAppMessage?.body).toBe(payload.body);
    expect(result.error).toBe("Permiso de notificaciones denegado por el usuario.");

    expect(inAppHandled !== null).toBe(true, "El handler callback in-app debe haberse ejecutado");
    expect((inAppHandled as unknown as InAppNotification)?.title).toBe(payload.title);
  } finally {
    restore();
  }
}

async function testNotificationFallbackOnUnsupported() {
  // Sin mock: entorno Node puro sin window ni Notification
  const payload = {
    title: "Aviso de Sistema",
    body: "Sincronización en segundo plano completada."
  };

  let inAppHandled: InAppNotification | null = null;
  const result = await showInspectionNotification(payload, (msg) => {
    inAppHandled = msg;
  });

  expect(result.success).toBe(false, "success debe ser false en entorno no soportado");
  expect(result.permission).toBe("unsupported", "permission debe ser 'unsupported'");
  expect(result.fallbackTriggered).toBe(true, "fallbackTriggered debe ser true en entorno no soportado");
  expect(result.isInAppFallback).toBe(true, "isInAppFallback debe ser true");
  expect(result.inAppMessage !== null).toBe(true, "inAppMessage debe generarse correctamente");
  expect(result.inAppMessage?.title).toBe(payload.title);
  expect(inAppHandled !== null).toBe(true, "handler in-app debe ejecutarse");
}

async function testNotificationFallbackOnConstructorError() {
  const restore = mockNotificationEnvironment({
    permission: "granted",
    shouldThrowOnConstruct: true
  });

  try {
    const payload = {
      title: "Notificación Móvil",
      body: "Prueba de fallo al instanciar Notification directamente."
    };

    const result = await showInspectionNotification(payload);

    expect(result.success).toBe(false, "success debe ser false si el constructor arroja excepción");
    expect(result.fallbackTriggered).toBe(true, "fallbackTriggered debe ser true ante fallo del constructor");
    expect(result.isInAppFallback).toBe(true, "isInAppFallback debe ser true");
    expect(result.inAppMessage !== null).toBe(true, "debe generarse un mensaje in-app como respaldo");
    expect(result.notification).toBeNull("notification debe ser null ante error");
  } finally {
    restore();
  }
}

// ==================== EJECUCIÓN PRINCIPAL ====================

async function runTest() {
  console.log("Iniciando suite integral de capacidades de dispositivo y notificaciones...");

  // Cámara
  await testCameraSupportDetection();
  console.log("✓ Cámara: detección de soporte (soportado vs no soportado)");
  await testCameraFallbackOnPermissionDenied();
  console.log("✓ Cámara: fallback ante NotAllowedError");
  await testCameraSuccessAndStreamRelease();
  console.log("✓ Cámara: acceso exitoso y liberación de tracks (releaseCameraStream)");

  // Geolocalización
  await testGeolocationSupportDetection();
  console.log("✓ Geolocalización: detección de soporte (soportado vs no soportado)");
  await testGeolocationFallbackOnPermissionDenied();
  console.log("✓ Geolocalización: fallback ante PERMISSION_DENIED");
  await testGeolocationSuccess();
  console.log("✓ Geolocalización: obtención exitosa de coordenadas");
  await testGeolocationUnsupported();
  console.log("✓ Geolocalización: fallback ante entorno no soportado");

  // Notificaciones
  await testNotificationSupportDetection();
  console.log("✓ Notificaciones: detección de soporte (soportado vs SSR/Node)");
  await testNotificationPermissionRequest();
  console.log("✓ Notificaciones: solicitud de permisos (granted y denied)");
  await testNotificationSuccessOnGranted();
  console.log("✓ Notificaciones: despacho exitoso cuando el permiso es concedido");
  await testNotificationFallbackOnPermissionDenied();
  console.log("✓ Notificaciones: fallback in-app ante permiso denegado por el usuario");
  await testNotificationFallbackOnUnsupported();
  console.log("✓ Notificaciones: fallback in-app ante entorno no soportado");
  await testNotificationFallbackOnConstructorError();
  console.log("✓ Notificaciones: fallback in-app ante fallo al instanciar API");

  console.log("\ncapabilities.spec.ts: PASS (Todas las pruebas de capacidades concluyeron con éxito)");
}

runTest().catch((err) => {
  console.error("Error en capabilities.spec.ts:", err);
  process.exit(1);
});
