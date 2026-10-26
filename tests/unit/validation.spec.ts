import { describe, it, expect } from 'vitest';
import { validateInspection } from '@/lib/domain/validation';

describe('Reglas de Validación de Inspección', () => {
  it('debe aceptar una inspección válida', () => {
    expect(validateInspection({ title: 'Lab A', status: 'ok', date: '2026-10-25' })).toEqual({
      valid: true,
      errors: []
    });
    expect(validateInspection({ title: 'Lab B', status: 'attention', date: '2026-01-31' }).valid).toBe(true);
  });

  it('debe rechazar una inspección sin título (o solo espacios)', () => {
    expect(validateInspection({ status: 'ok', date: '2026-10-25' }).errors).toEqual(['title']);
    expect(validateInspection({ title: '   ', status: 'ok', date: '2026-10-25' }).errors).toEqual(['title']);
  });

  it('debe rechazar un estado fuera de ok | attention', () => {
    const result = validateInspection({ title: 'Lab B', status: 'critical', date: '2026-10-25' });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['status']);
  });

  it('debe rechazar fechas mal formadas', () => {
    expect(validateInspection({ title: 'Lab C', status: 'ok', date: 'fecha-invalida' }).errors).toEqual(['date']);
    expect(validateInspection({ title: 'Lab C', status: 'ok', date: '2026-13-45' }).errors).toEqual(['date']);
    expect(validateInspection({ title: 'Lab C', status: 'ok' }).errors).toEqual(['date']);
  });

  it('debe acumular todos los errores de una captura totalmente inválida', () => {
    expect(validateInspection({}).errors).toEqual(['title', 'status', 'date']);
  });
});