// src/lib/security/validator.ts
// Reglas estrictas de validacion de entradas, esquemas y sanitizacion de inspecciones.

import { detectSensitiveData, normalizeCleanText, stripHtml } from './sanitizer';

export interface InspectionSecurityInput {
  title?: unknown;
  status?: unknown;
  syncStatus?: unknown;
  id?: unknown;
  createdAt?: unknown;
}

export interface SecurityValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: {
    id: string;
    title: string;
    status: 'ok' | 'attention';
    syncStatus: 'pending' | 'synced';
    createdAt: string;
  };
}

const ALLOWED_STATUSES = ['ok', 'attention'] as const;
const ALLOWED_SYNC_STATUSES = ['pending', 'synced'] as const;

// Limites cuantitativos de longitud acordes con el modelo de amenazas (STR-T1)
export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 120;

const UUID_OR_SYNTHETIC_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^inspection-[a-zA-Z0-9_-]{4,64}$/;

/**
 * Valida un titulo de inspeccion asegurando limites de longitud,
 * ausencia de etiquetas ejecutables y ausencia de PII no consentida.
 */
export function validateInspectionTitle(rawTitle: unknown): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  if (typeof rawTitle !== 'string') {
    return { valid: false, sanitized: '', error: 'El titulo debe ser una cadena de texto.' };
  }

  // Sanitizar quitando HTML y normalizando espacios
  const stripped = stripHtml(rawTitle);
  const normalized = normalizeCleanText(stripped);

  if (normalized.length < TITLE_MIN_LENGTH) {
    return {
      valid: false,
      sanitized: normalized,
      error: `El titulo debe contener al menos ${TITLE_MIN_LENGTH} caracteres validos.`
    };
  }

  if (normalized.length > TITLE_MAX_LENGTH) {
    return {
      valid: false,
      sanitized: normalized.slice(0, TITLE_MAX_LENGTH),
      error: `El titulo excede el maximo de ${TITLE_MAX_LENGTH} caracteres permitidos.`
    };
  }

  // Comprobar ausencia de datos personales identificables conforme a la LGPDPPSO
  const sensitiveCheck = detectSensitiveData(normalized);
  if (sensitiveCheck.detected) {
    return {
      valid: false,
      sanitized: normalized,
      error: `Se detectaron datos personales (${sensitiveCheck.types.join(', ')}). Use unicamente datos sinteticos institucionales.`
    };
  }

  return { valid: true, sanitized: normalized };
}

/**
 * Valida de forma integral el payload de una inspeccion local o sincronizable.
 */
export function validateInspectionSecurity(input: unknown): SecurityValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['El cuerpo de la inspeccion debe ser un objeto valido.'] };
  }

  const record = input as InspectionSecurityInput;

  // 1. Validacion de titulo
  const titleValidation = validateInspectionTitle(record.title);
  if (!titleValidation.valid) {
    errors.push(titleValidation.error ?? 'Titulo invalido.');
  }

  // 2. Validacion de estado
  if (
    typeof record.status !== 'string' ||
    !ALLOWED_STATUSES.includes(record.status as (typeof ALLOWED_STATUSES)[number])
  ) {
    errors.push(`Estado invalido. Debe ser uno de: ${ALLOWED_STATUSES.join(', ')}.`);
  }

  // 3. Validacion de estado de sincronizacion (opcional o por defecto 'pending')
  const syncStatus = record.syncStatus ?? 'pending';
  if (
    typeof syncStatus !== 'string' ||
    !ALLOWED_SYNC_STATUSES.includes(syncStatus as (typeof ALLOWED_SYNC_STATUSES)[number])
  ) {
    errors.push(`syncStatus invalido. Debe ser uno de: ${ALLOWED_SYNC_STATUSES.join(', ')}.`);
  }

  // 4. Validacion de identificador
  let id = typeof record.id === 'string' ? record.id.trim() : '';
  if (!id) {
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `inspection-${Date.now()}`;
  } else if (!UUID_OR_SYNTHETIC_REGEX.test(id)) {
    errors.push('Identificador invalido: debe cumplir formato UUID o prefijo sintetico.');
  }

  // 5. Validacion de fecha
  let createdAt = typeof record.createdAt === 'string' ? record.createdAt : '';
  if (!createdAt) {
    createdAt = new Date().toISOString();
  } else {
    const timestamp = Date.parse(createdAt);
    if (Number.isNaN(timestamp)) {
      errors.push('Fecha de creacion invalida (debe ser formato ISO 8601).');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitized: {
      id,
      title: titleValidation.sanitized,
      status: record.status as (typeof ALLOWED_STATUSES)[number],
      syncStatus: syncStatus as (typeof ALLOWED_SYNC_STATUSES)[number],
      createdAt
    }
  };
}

