// src/lib/security/headers.ts
// Configuracion de cabeceras de seguridad HTTP y Content Security Policy (CSP).

export interface SecurityHeaderEntry {
  key: string;
  value: string;
}

export const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': []
};

export const PERMISSIONS_POLICY_DIRECTIVES: Record<string, string> = {
  camera: '(self)',
  geolocation: '(self)',
  microphone: '()',
  payment: '()',
  usb: '()',
  'interest-cohort': '()'
};

/**
 * Compila el diccionario de directivas CSP en una cadena compatible con el estandar W3C.
 */
export function buildCspHeader(directives = CSP_DIRECTIVES): string {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Compila las directivas de Permissions-Policy en el formato de cabecera HTTP.
 */
export function buildPermissionsPolicyHeader(
  policies = PERMISSIONS_POLICY_DIRECTIVES
): string {
  return Object.entries(policies)
    .map(([feature, allowlist]) => `${feature}=${allowlist}`)
    .join(', ');
}

/**
 * Retorna la coleccion completa de cabeceras HTTP de seguridad para Next.js.
 */
export function getSecurityHeaders(): SecurityHeaderEntry[] {
  return [
    {
      key: 'Content-Security-Policy',
      value: buildCspHeader()
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'Permissions-Policy',
      value: buildPermissionsPolicyHeader()
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on'
    }
  ];
}

