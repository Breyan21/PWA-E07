// src/lib/domain/validation.ts
// Regla de validación de captura de inspección (título, estado y fecha).

export interface InspectionInput {
  title?: unknown;
  status?: unknown;
  date?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ALLOWED_STATUS = ['ok', 'attention'] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida una captura de inspección. Devuelve la lista de errores encontrados.
 */
export function validateInspection(input: InspectionInput): ValidationResult {
  const errors: string[] = [];

  if (typeof input.title !== 'string' || input.title.trim() === '') {
    errors.push('title');
  }
  if (!ALLOWED_STATUS.includes(input.status as (typeof ALLOWED_STATUS)[number])) {
    errors.push('status');
  }
  if (
    typeof input.date !== 'string' ||
    !ISO_DATE.test(input.date) ||
    Number.isNaN(Date.parse(input.date))
  ) {
    errors.push('date');
  }

  return { valid: errors.length === 0, errors };
}
