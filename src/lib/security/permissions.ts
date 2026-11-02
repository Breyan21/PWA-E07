// src/lib/security/permissions.ts
// Gestion de politicas de minimo privilegio y degradacion elegante de permisos.

export type DeviceCapability = 'camera' | 'geolocation';

export interface PermissionPolicy {
  capability: DeviceCapability;
  purpose: string;
  transientOnly: boolean;
  requiresExplicitGesture: boolean;
}

export const CAPABILITY_POLICIES: Record<DeviceCapability, PermissionPolicy> = {
  camera: {
    capability: 'camera',
    purpose: 'Verificacion fotografica sintetica de activos de laboratorio sin transmision remota.',
    transientOnly: true,
    requiresExplicitGesture: true
  },
  geolocation: {
    capability: 'geolocation',
    purpose: 'Verificacion de proximidad a instalaciones de la UT Tehuacan bajo solicitud expresa.',
    transientOnly: true,
    requiresExplicitGesture: true
  }
};

export interface CapabilityAuditStatus {
  capability: DeviceCapability;
  state: 'granted' | 'denied' | 'prompt' | 'unsupported';
  fallbackActive: boolean;
}

/**
 * Consulta de manera segura el estado del permiso en el navegador con soporte de degradacion.
 */
export async function auditCapabilityPermission(
  capability: DeviceCapability
): Promise<CapabilityAuditStatus> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { capability, state: 'unsupported', fallbackActive: true };
  }

  // Comprobar soporte de la Permissions API
  if (!('permissions' in navigator) || typeof navigator.permissions?.query !== 'function') {
    return { capability, state: 'prompt', fallbackActive: false };
  }

  try {
    const permissionName = capability === 'camera' ? ('camera' as PermissionName) : ('geolocation' as PermissionName);
    const result = await navigator.permissions.query({ name: permissionName });
    return {
      capability,
      state: result.state,
      fallbackActive: result.state === 'denied'
    };
  } catch {
    // Si la API del navegador falla o restringe la consulta, asume prompt seguro
    return { capability, state: 'prompt', fallbackActive: false };
  }
}

/**
 * Obtiene la justificacion de tratamiento conforme al principio de licitud de la LGPDPPSO.
 */
export function getCapabilityPurpose(capability: DeviceCapability): string {
  return CAPABILITY_POLICIES[capability]?.purpose ?? 'Uso no documentado.';
}

