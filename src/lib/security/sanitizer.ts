// src/lib/security/sanitizer.ts
// Utilidades de saneamiento, escape de entidades HTML y prevencion de fuga de PII.

/**
 * Escapa caracteres especiales de HTML para neutralizar vectores de inyeccion XSS.
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Remueve etiquetas HTML, scripts, iframes y pseudoprotocolos peligrosos.
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    // Elimina bloques de script completos y su contenido
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Elimina bloques de estilo completos y su contenido
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Elimina iframes y objetos
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Elimina cualquier etiqueta HTML remanente
    .replace(/<[^>]+>/g, '')
    // Neutraliza pseudo-protocolos javascript: o data: ejecutables
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remueve caracteres de control (0x00-0x1F, 0x7F) excepto saltos de linea estandar
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Normaliza espacios en blanco y caracteres de control no imprimibles.
 */
export function normalizeCleanText(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Espacios de ancho cero
    .replace(/\s+/g, ' ')
    .trim();
}

// Expresiones regulares para detectar identificadores personales reales mexicanos
const PATTERNS_PII = {
  // CURP mexicana: 4 letras, 6 digitos fecha, 6 alfanumericos
  curp: /[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d/i,
  // RFC mexicano: 3-4 letras, 6 digitos fecha, 3 alfanumericos homoclave
  rfc: /[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A]/i,
  // Correo electronico institucional o personal
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  // Telefono a 10 digitos
  telefono: /(?:\+?52\s?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/
};

export interface SensitiveInspectionCheck {
  detected: boolean;
  types: string[];
}

/**
 * Detecta presencia involuntaria de datos personales identificables (PII)
 * para asegurar el cumplimiento del principio de minimizacion de la LGPDPPSO.
 */
export function detectSensitiveData(input: string): SensitiveInspectionCheck {
  if (typeof input !== 'string') {
    return { detected: false, types: [] };
  }

  const types: string[] = [];

  if (PATTERNS_PII.curp.test(input)) types.push('curp');
  if (PATTERNS_PII.rfc.test(input)) types.push('rfc');
  if (PATTERNS_PII.email.test(input)) types.push('email');
  if (PATTERNS_PII.telefono.test(input)) types.push('telefono');

  return {
    detected: types.length > 0,
    types
  };
}

/**
 * Enmascara datos personales detectados sustituyendolos por un marcador sintético.
 */
export function maskSensitiveData(input: string): string {
  if (typeof input !== 'string') return '';

  let sanitized = input;
  sanitized = sanitized.replace(PATTERNS_PII.curp, '[DATO_SINTETICO_REMITIDO_LGPDPPSO]');
  sanitized = sanitized.replace(PATTERNS_PII.rfc, '[DATO_SINTETICO_REMITIDO_LGPDPPSO]');
  sanitized = sanitized.replace(PATTERNS_PII.email, '[CORREO_SINTETICO_REMITIDO]');
  sanitized = sanitized.replace(PATTERNS_PII.telefono, '[TELEFONO_SINTETICO_REMITIDO]');

  return sanitized;
}

