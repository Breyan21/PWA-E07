// src/lib/security/storage-guard.ts
// Guardas de seguridad para almacenamiento local (localStorage), prevencion de DoS y derecho de supresion.

import { validateInspectionSecurity } from './validator';

export const INSPECTIONS_STORAGE_KEY = 'checkup:offline-inspections';
export const MAX_STORED_INSPECTIONS = 100;
export const MAX_STORAGE_PAYLOAD_BYTES = 512 * 1024; // 512 KB limite preventivo

export interface StoredRecord {
  id: string;
  title: string;
  status: 'ok' | 'attention';
  syncStatus: 'pending' | 'synced';
  createdAt: string;
}

/**
 * Reviver seguro para JSON.parse que previene ataques de contaminacion de prototipo (Prototype Pollution).
 */
function secureJsonReviver(key: string, value: unknown): unknown {
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return undefined;
  }
  return value;
}

/**
 * Lee de forma segura y filtra los registros de inspeccion desde el almacenamiento local.
 */
export function readSecureInspections(): StoredRecord[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(INSPECTIONS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw, secureJsonReviver);
    if (!Array.isArray(parsed)) return [];

    const validatedRecords: StoredRecord[] = [];

    for (const item of parsed) {
      const validation = validateInspectionSecurity(item);
      if (validation.valid && validation.sanitized) {
        validatedRecords.push(validation.sanitized);
      }
    }

    return validatedRecords;
  } catch {
    // Si los datos estan corruptos o fueron manipulados externamente, retorna vacio
    return [];
  }
}

/**
 * Guarda registros validados en almacenamiento local aplicando limites de cuota (STR-D1).
 */
export function writeSecureInspections(records: StoredRecord[]): {
  success: boolean;
  count: number;
  error?: string;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, count: 0, error: 'Almacenamiento no disponible en este entorno.' };
  }

  // Aplicar cota maxima para prevenir denegacion de servicio local
  const boundedRecords = records.slice(0, MAX_STORED_INSPECTIONS);
  const serialized = JSON.stringify(boundedRecords);

  if (new Blob([serialized]).size > MAX_STORAGE_PAYLOAD_BYTES) {
    return {
      success: false,
      count: 0,
      error: `La carga util excede la cuota maxima de seguridad de ${MAX_STORAGE_PAYLOAD_BYTES / 1024} KB.`
    };
  }

  try {
    window.localStorage.setItem(INSPECTIONS_STORAGE_KEY, serialized);
    return { success: true, count: boundedRecords.length };
  } catch {
    return { success: false, count: 0, error: 'Error de cuota o permiso al escribir en almacenamiento local.' };
  }
}

/**
 * Procedimiento de eliminacion local verificable (Derecho de Supresion / Cancelacion LGPDPPSO).
 */
export function purgeLocalInspections(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.removeItem(INSPECTIONS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

