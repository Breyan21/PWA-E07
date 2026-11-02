import { describe, expect, it } from 'vitest';
import {
  buildCspHeader,
  buildPermissionsPolicyHeader,
  detectSensitiveData,
  escapeHtml,
  getCapabilityPurpose,
  getSecurityHeaders,
  maskSensitiveData,
  MAX_STORED_INSPECTIONS,
  normalizeCleanText,
  stripHtml,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  validateInspectionSecurity,
  validateInspectionTitle
} from '@/lib/security';

describe('src/lib/security - Modulo de Seguridad y Privacidad', () => {
  describe('Sanitizer y Prevencion de XSS / PII', () => {
    it('escapa entidades HTML criticas para evitar XSS reflejado', () => {
      const input = '<script>alert("xss")</script>&"\'/';
      const escaped = escapeHtml(input);
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&#x2F;');
    });

    it('elimina etiquetas ejecutables e iframes con stripHtml', () => {
      const input = '<b>Revision</b><script>fetch("http://malicioso")</script><iframe src="evil.com"></iframe>';
      const stripped = stripHtml(input);
      expect(stripped).toBe('Revision');
    });

    it('normaliza espacios y elimina caracteres de control invisibles', () => {
      const input = 'Revision   con \u200Bespacios\uFEFF   multiples  ';
      expect(normalizeCleanText(input)).toBe('Revision con espacios multiples');
    });

    it('detecta presencia de datos personales (CURP, RFC, emails, telefonos)', () => {
      expect(detectSensitiveData('Reporte de Juan: JMEL780101HMCRRL01').detected).toBe(true);
      expect(detectSensitiveData('Contacto: docente@tehuacan.edu.mx').detected).toBe(true);
      expect(detectSensitiveData('Inspeccion de mesa de quimica sintetico').detected).toBe(false);
    });

    it('enmascara datos personales detectados', () => {
      const masked = maskSensitiveData('Atendido por test@example.com con CURP AAAA000000HDFRRR00');
      expect(masked).toContain('[CORREO_SINTETICO_REMITIDO]');
      expect(masked).toContain('[DATO_SINTETICO_REMITIDO_LGPDPPSO]');
      expect(masked).not.toContain('test@example.com');
    });
  });

  describe('Validator y Esquemas de Inspeccion', () => {
    it('valida titulos entre 3 y 120 caracteres', () => {
      expect(validateInspectionTitle('ab').valid).toBe(false);
      expect(validateInspectionTitle('abc').valid).toBe(true);

      const longTitle = 'a'.repeat(TITLE_MAX_LENGTH + 1);
      expect(validateInspectionTitle(longTitle).valid).toBe(false);
    });

    it('sanea y acepta titulos con etiquetas HTML inocuas convirtiendolas a texto limpio', () => {
      const result = validateInspectionTitle('<span>Inspeccion Quimica</span>');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Inspeccion Quimica');
    });

    it('rechaza titulos que contengan datos personales reales (LGPDPPSO)', () => {
      const result = validateInspectionTitle('Inspeccion asignada a correo@tehuacan.edu.mx');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('datos personales');
    });

    it('valida payload completo de inspeccion y asigna valores sinteticos por defecto', () => {
      const valid = validateInspectionSecurity({
        title: 'Revision de laboratorio 01',
        status: 'ok',
        syncStatus: 'pending'
      });
      expect(valid.valid).toBe(true);
      expect(valid.sanitized?.id).toBeDefined();
      expect(valid.sanitized?.createdAt).toBeDefined();
    });

    it('rechaza estados no permitidos', () => {
      const invalid = validateInspectionSecurity({
        title: 'Revision',
        status: 'invalido'
      });
      expect(invalid.valid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Headers HTTP y Politicas CSP', () => {
    it('genera Content-Security-Policy con directivas restrictivas', () => {
      const csp = buildCspHeader();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
    });

    it('genera Permissions-Policy restringiendo camara y geolocalizacion al propio origen', () => {
      const permissions = buildPermissionsPolicyHeader();
      expect(permissions).toContain('camera=(self)');
      expect(permissions).toContain('geolocation=(self)');
      expect(permissions).toContain('microphone=()');
    });

    it('retorna la coleccion completa de cabeceras de seguridad requeridas', () => {
      const headers = getSecurityHeaders();
      const keys = headers.map((h) => h.key);
      expect(keys).toContain('Content-Security-Policy');
      expect(keys).toContain('X-Frame-Options');
      expect(keys).toContain('X-Content-Type-Options');
      expect(keys).toContain('Referrer-Policy');
      expect(keys).toContain('Permissions-Policy');
      expect(keys).toContain('Strict-Transport-Security');
    });
  });

  describe('Politicas de Mínimo Privilegio (Permissions)', () => {
    it('obtiene la finalidad justificada para cada capacidad', () => {
      expect(getCapabilityPurpose('camera')).toContain('Verificacion fotografica sintetica');
      expect(getCapabilityPurpose('geolocation')).toContain('UT Tehuacan');
    });
  });
});
