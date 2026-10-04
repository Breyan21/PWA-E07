import { type InspectionRecord } from '../storage/schema';

export type ConflictResolution = 'CLIENT_WINS' | 'SERVER_WINS';

export interface ConflictPolicyResult {
  resolution: ConflictResolution;
  mergedRecord: InspectionRecord;
  reason: string;
}

/**
 * Resuelve un conflicto entre un registro local (cliente) y uno remoto (servidor)
 * utilizando la política determinista Last-Write-Wins (LWW) basada en updatedAt y version.
 */
export function resolveConflict(
  clientRecord: InspectionRecord,
  serverRecord: InspectionRecord
): ConflictPolicyResult {
  // 1. Fallback principal: Si las versiones son diferentes, gana la versión mayor.
  if (clientRecord.version > serverRecord.version) {
    return {
      resolution: 'CLIENT_WINS',
      mergedRecord: clientRecord,
      reason: 'El cliente posee una versión lógicamente posterior (version mayor)'
    };
  }
  
  if (serverRecord.version > clientRecord.version) {
    return {
      resolution: 'SERVER_WINS',
      mergedRecord: serverRecord,
      reason: 'El servidor posee una versión lógicamente posterior (version mayor)'
    };
  }

  // 2. LWW puro: Si las versiones coinciden, gana el que tenga el timestamp más reciente.
  if (clientRecord.updatedAt > serverRecord.updatedAt) {
    return {
      resolution: 'CLIENT_WINS',
      mergedRecord: clientRecord,
      reason: 'Empate de versiones: el cliente tiene una marca de tiempo (updatedAt) más reciente'
    };
  }

  if (serverRecord.updatedAt > clientRecord.updatedAt) {
    return {
      resolution: 'SERVER_WINS',
      mergedRecord: serverRecord,
      reason: 'Empate de versiones: el servidor tiene una marca de tiempo (updatedAt) más reciente'
    };
  }

  // 3. Empate absoluto (misma versión y mismo timestamp): Prioridad al servidor (Fallback seguro)
  return {
    resolution: 'SERVER_WINS',
    mergedRecord: serverRecord,
    reason: 'Empate absoluto: se da prioridad al servidor como fuente de verdad'
  };
}
