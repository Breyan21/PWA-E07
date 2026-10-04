// src/lib/storage/schema.ts

// Estados permitidos para el ciclo de vida de la sincronización definidos en el alcance técnico
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

// Estructura de la entidad sintética (Inspección)
export interface InspectionRecord {
  id: string;
  title: string;
  status: 'ok' | 'attention';
  date: string;
  inspectorId: string;
  version: number;       // Necesario para que el Integrante 3 resuelva conflictos
  updatedAt: number;     // Marca de tiempo para evaluar Last-Write-Wins
}

// Estructura de la operación encolada para la sincronización
export interface SyncOperation {
  mutationId: string;    // ID único para garantizar la idempotencia
  type: 'CREATE' | 'UPDATE';
  payload: InspectionRecord;
  status: SyncStatus;
  timestamp: number;
}

/**
 * Funciones auxiliares de persistencia
 */

// Crea una nueva operación lista para ser encolada
export function createSyncOperation(
  type: 'CREATE' | 'UPDATE', 
  payload: InspectionRecord
): SyncOperation {
  return {
    mutationId: crypto.randomUUID(), // Genera un ID único para evitar duplicados en reintentos
    type,
    payload,
    status: 'pending',
    timestamp: Date.now()
  };
}

// Filtra y lista únicamente las operaciones que están pendientes
export function getPendingOperations(operations: SyncOperation[]): SyncOperation[] {
  return operations.filter(op => op.status === 'pending');
}

// Marca una operación como sincronizada exitosamente
export function markAsSynced(operation: SyncOperation): SyncOperation {
  return {
    ...operation,
    status: 'synced'
  };
}