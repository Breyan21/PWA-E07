import { describe, it, expect } from 'vitest';
// IMPORTA TU FUNCIÓN REAL AQUÍ:
// import { validateInspection } from '@/lib/domain/validation';

// (Solo si no tienes la función real aún, usa esta simulación mejorada)
const validateInspection = (inspection: any) => {
  if (!inspection.title) return false;
  if (!['ok', 'attention'].includes(inspection.status)) return false;
  if (isNaN(Date.parse(inspection.date))) return false; // Valida fecha
  return true;
};

describe('Reglas de Validación de Inspección', () => {
  it('debe aceptar una inspección válida', () => {
    expect(validateInspection({ title: 'Lab A', status: 'ok', date: '2023-10-25' })).toBe(true);
  });
  
  it('debe rechazar una inspección sin título o estado inválido', () => {
    expect(validateInspection({ status: 'ok', date: '2023-10-25' })).toBe(false);
    expect(validateInspection({ title: 'Lab B', status: 'critical', date: '2023-10-25' })).toBe(false);
  });

  it('debe rechazar una inspección con fecha mal formada', () => {
    expect(validateInspection({ title: 'Lab C', status: 'ok', date: 'fecha-invalida' })).toBe(false);
  });
});