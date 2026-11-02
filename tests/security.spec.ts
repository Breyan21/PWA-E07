// tests/security.spec.ts
// Suite determinista de pruebas de seguridad y privacidad para la Semana 9.
// Ejecutable en Node.js mediante: npx --yes tsx tests/security.spec.ts
// Utiliza exclusivamente node:assert/strict y datos 100 % sinteticos.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  auditCapabilityPermission,
  buildCspHeader,
  buildPermissionsPolicyHeader,
  CAPABILITY_POLICIES,
  CSP_DIRECTIVES,
  detectSensitiveData,
  escapeHtml,
  getCapabilityPurpose,
  getSecurityHeaders,
  INSPECTIONS_STORAGE_KEY,
  maskSensitiveData,
  MAX_STORAGE_PAYLOAD_BYTES,
  MAX_STORED_INSPECTIONS,
  normalizeCleanText,
  PERMISSIONS_POLICY_DIRECTIVES,
  purgeLocalInspections,
  readSecureInspections,
  StoredRecord,
  stripHtml,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  validateInspectionSecurity,
  validateInspectionTitle,
  writeSecureInspections
} from '../src/lib/security';

async function runSecuritySuite(): Promise<void> {
  console.log('--- Iniciando suite de pruebas de seguridad y privacidad (Semana 9) ---');

  // ---------------------------------------------------------------------------
  // 1. Sanitizacion y neutralizacion de vectores XSS
  // ---------------------------------------------------------------------------
  console.log('[1/7] Verificando sanitizacion y neutralizacion de XSS...');

  // Escape de caracteres especiales
  const rawXssPayload = '<script>alert("xss")</script>&"\'/';
  const escaped = escapeHtml(rawXssPayload);
  assert.equal(escaped.includes('<'), false, 'No debe contener caracter < sin escapar');
  assert.equal(escaped.includes('>'), false, 'No debe contener caracter > sin escapar');
  assert.equal(escaped.includes('&lt;script&gt;'), true, 'Debe escapar <script> a entidades HTML');
  assert.equal(escaped.includes('&amp;'), true, 'Debe escapar & a &amp;');
  assert.equal(escaped.includes('&#x2F;'), true, 'Debe escapar / a &#x2F;');

  // Eliminacion de etiquetas ejecutables, iframes y pseudoprotocolos
  const maliciousMarkup = 'Laboratorio 01<script>fetch("http://sitio-inseguro.local")</script><iframe src="//inseguro.local"></iframe>';
  const strippedMarkup = stripHtml(maliciousMarkup);
  assert.equal(strippedMarkup, 'Laboratorio 01', 'Debe eliminar por completo bloques de script e iframes');

  const pseudoProtocolInput = 'javascript:eval("inyeccion")';
  const sanitizedProtocol = stripHtml(pseudoProtocolInput);
  assert.equal(sanitizedProtocol.toLowerCase().includes('javascript:'), false, 'Debe remover el pseudoprotocolo javascript:');

  // Normalizacion de espacios y caracteres invisibles
  const invisibleCharsInput = 'Inspeccion   con  \u200Bespacios\uFEFF   irregulares  ';
  const normalizedText = normalizeCleanText(invisibleCharsInput);
  assert.equal(normalizedText, 'Inspeccion con espacios irregulares', 'Debe colapsar espacios y suprimir caracteres de control zero-width');

  console.log('  -> Sanitizacion XSS: PASS');

  // ---------------------------------------------------------------------------
  // 2. Validacion de esquemas y limites cuantitativos de entrada
  // ---------------------------------------------------------------------------
  console.log('[2/7] Verificando limites cuantitativos y validacion de esquemas...');

  // Longitud minima (TITLE_MIN_LENGTH = 3)
  const shortTitleRes = validateInspectionTitle('ab');
  assert.equal(shortTitleRes.valid, false, 'Debe rechazar titulos con longitud menor a 3 caracteres');
  assert.ok(shortTitleRes.error?.includes(String(TITLE_MIN_LENGTH)), 'El mensaje de error debe indicar la cota minima');

  // Longitud maxima (TITLE_MAX_LENGTH = 120)
  const longTitleInput = 'A'.repeat(TITLE_MAX_LENGTH + 1);
  const longTitleRes = validateInspectionTitle(longTitleInput);
  assert.equal(longTitleRes.valid, false, 'Debe rechazar titulos que excedan 120 caracteres');
  assert.ok(longTitleRes.error?.includes(String(TITLE_MAX_LENGTH)), 'El mensaje de error debe indicar la cota maxima');

  // Titulo valido con marcado inocuo que se normaliza
  const validMarkupTitle = '<span>Mantenimiento de Redes</span>';
  const validMarkupRes = validateInspectionTitle(validMarkupTitle);
  assert.equal(validMarkupRes.valid, true, 'Debe admitir titulos validos');
  assert.equal(validMarkupRes.sanitized, 'Mantenimiento de Redes', 'Debe sanitizar el titulo a texto plano');

  // Validacion integral de payload: rechazo de estados no permitidos
  const invalidStatusPayload = {
    title: 'Revision de laboratorio',
    status: 'estado_no_permitido'
  };
  const invalidStatusRes = validateInspectionSecurity(invalidStatusPayload);
  assert.equal(invalidStatusRes.valid, false, 'Debe rechazar estados fuera de la lista permitida');
  assert.ok(invalidStatusRes.errors.length > 0, 'Debe reportar errores explicitos');

  // Validacion integral de payload: identificador sintético valido y fecha ISO
  const validPayload = {
    id: 'inspection-laboratorio-01',
    title: 'Revision estructural de mesas de trabajo',
    status: 'ok',
    syncStatus: 'pending',
    createdAt: '2026-11-01T20:00:00.000Z'
  };
  const validPayloadRes = validateInspectionSecurity(validPayload);
  assert.equal(validPayloadRes.valid, true, 'Debe validar un payload que cumple el esquema');
  assert.equal(validPayloadRes.sanitized?.id, 'inspection-laboratorio-01');
  assert.equal(validPayloadRes.sanitized?.status, 'ok');
  assert.equal(validPayloadRes.sanitized?.syncStatus, 'pending');

  // Validacion integral de payload: rechazo de fecha corrupta
  const corruptDatePayload = {
    title: 'Revision estructural',
    status: 'ok',
    createdAt: 'fecha-no-valida-31-02-2026'
  };
  const corruptDateRes = validateInspectionSecurity(corruptDatePayload);
  assert.equal(corruptDateRes.valid, false, 'Debe rechazar fechas que no cumplan ISO 8601');

  console.log('  -> Limites y esquemas de entrada: PASS');

  // ---------------------------------------------------------------------------
  // 3. Deteccion y minimizacion de PII conforme a la LGPDPPSO
  // ---------------------------------------------------------------------------
  console.log('[3/7] Verificando deteccion y minimizacion de datos personales (PII)...');

  // Deteccion de identificadores sinteticos mexicanos
  const curpCheck = detectSensitiveData('Registro asignado al responsable ABCD010203HDFRRN01 en laboratorio');
  assert.equal(curpCheck.detected, true, 'Debe detectar patron de CURP');
  assert.ok(curpCheck.types.includes('curp'), 'Debe catalogar el tipo como curp');

  const rfcCheck = detectSensitiveData('Facturacion asignada a ABCD010203AB1');
  assert.equal(rfcCheck.detected, true, 'Debe detectar patron de RFC');
  assert.ok(rfcCheck.types.includes('rfc'), 'Debe catalogar el tipo como rfc');

  const emailCheck = detectSensitiveData('Contacto de envio: inspector.laboratorio@tehuacan.edu.mx');
  assert.equal(emailCheck.detected, true, 'Debe detectar correo electronico');
  assert.ok(emailCheck.types.includes('email'), 'Debe catalogar el tipo como email');

  const phoneCheck = detectSensitiveData('Llamar al telefono de campo: 2381234567');
  assert.equal(phoneCheck.detected, true, 'Debe detectar telefono');
  assert.ok(phoneCheck.types.includes('telefono'), 'Debe catalogar el tipo como telefono');

  const safeCheck = detectSensitiveData('Inspeccion de mesa de quimica numero 4');
  assert.equal(safeCheck.detected, false, 'No debe marcar falsos positivos en texto descriptivo de laboratorio');

  // Enmascaramiento preventivo de PII
  const unmaskedText = 'Inspector ABCD010203HDFRRN01 notificar a correo@tehuacan.edu.mx tel 2381234567';
  const maskedText = maskSensitiveData(unmaskedText);
  assert.equal(maskedText.includes('ABCD010203HDFRRN01'), false, 'El texto enmascarado no debe contener la CURP');
  assert.equal(maskedText.includes('correo@tehuacan.edu.mx'), false, 'El texto enmascarado no debe contener el correo');
  assert.ok(maskedText.includes('[DATO_SINTETICO_REMITIDO_LGPDPPSO]'), 'Debe incluir la etiqueta de remision sintetica');
  assert.ok(maskedText.includes('[CORREO_SINTETICO_REMITIDO]'), 'Debe incluir la etiqueta de correo sintetico');

  // Rechazo estricto en validacion de titulos ante presencia de PII
  const piiTitleRes = validateInspectionTitle('Revision asignada a juan.perez@tehuacan.edu.mx en laboratorio');
  assert.equal(piiTitleRes.valid, false, 'Debe rechazar titulos que incorporen datos personales');
  assert.ok(piiTitleRes.error?.includes('datos personales'), 'Debe emitir mensaje de advertencia de datos personales');

  console.log('  -> Proteccion de PII y LGPDPPSO: PASS');

  // ---------------------------------------------------------------------------
  // 4. Cabeceras HTTP reales de next.config.mjs y politicas CSP
  // ---------------------------------------------------------------------------
  console.log('[4/7] Verificando cabeceras de seguridad reales en next.config.mjs...');

  const nextConfigPath = resolve(process.cwd(), 'next.config.mjs');
  const nextConfigModule = await import(pathToFileURL(nextConfigPath).href);
  const nextConfig = nextConfigModule.default;

  assert.ok(typeof nextConfig.headers === 'function', 'next.config.mjs debe exportar una funcion headers()');

  const configuredHeadersList = await nextConfig.headers();
  assert.ok(Array.isArray(configuredHeadersList), 'headers() debe resolver a un arreglo');
  assert.ok(configuredHeadersList.length > 0, 'Debe contener al menos una regla de cabeceras');

  const rootRule = configuredHeadersList.find((rule: { source: string }) => rule.source === '/:path*');
  assert.ok(rootRule, 'Debe existir una regla que aplique a /:path*');

  const headersMap = new Map<string, string>();
  for (const entry of rootRule.headers as Array<{ key: string; value: string }>) {
    headersMap.set(entry.key, entry.value);
  }

  // Comprobacion exhaustiva de cabeceras obligatorias
  assert.ok(headersMap.has('Content-Security-Policy'), 'Debe definir Content-Security-Policy');
  const cspValue = headersMap.get('Content-Security-Policy') ?? '';
  assert.ok(cspValue.includes("default-src 'self'"), 'CSP debe restringir default-src a self');
  assert.ok(cspValue.includes("frame-ancestors 'none'"), 'CSP debe bloquear incrustacion mediante frame-ancestors none');
  assert.ok(cspValue.includes("object-src 'none'"), 'CSP debe deshabilitar plugins y objetos con object-src none');
  assert.ok(cspValue.includes("base-uri 'self'"), 'CSP debe restringir base-uri a self');
  assert.ok(cspValue.includes('upgrade-insecure-requests'), 'CSP debe exigir upgrade-insecure-requests');

  // Resto de cabeceras de transporte y proteccion del navegador
  assert.equal(headersMap.get('X-Frame-Options'), 'DENY', 'X-Frame-Options debe ser DENY');
  assert.equal(headersMap.get('X-Content-Type-Options'), 'nosniff', 'X-Content-Type-Options debe ser nosniff');
  assert.equal(headersMap.get('Referrer-Policy'), 'strict-origin-when-cross-origin', 'Referrer-Policy debe ser strict-origin-when-cross-origin');

  const permissionsPolicyValue = headersMap.get('Permissions-Policy') ?? '';
  assert.ok(permissionsPolicyValue.includes('camera=(self)'), 'Permissions-Policy debe aislar camara a self');
  assert.ok(permissionsPolicyValue.includes('geolocation=(self)'), 'Permissions-Policy debe aislar geolocalizacion a self');
  assert.ok(permissionsPolicyValue.includes('microphone=()'), 'Permissions-Policy debe bloquear microfono');

  const hstsValue = headersMap.get('Strict-Transport-Security') ?? '';
  assert.ok(hstsValue.includes('max-age=63072000'), 'HSTS debe tener vigencia de 2 anos (63072000 segundos)');
  assert.ok(hstsValue.includes('includeSubDomains'), 'HSTS debe incluir subdominios');

  console.log('  -> Cabeceras HTTP y CSP en next.config.mjs: PASS');

  // ---------------------------------------------------------------------------
  // 5. Politicas de permisos y principio de minimo privilegio
  // ---------------------------------------------------------------------------
  console.log('[5/7] Verificando politicas de permisos y degradacion elegante...');

  // Declaracion formal de finalidades institucionales
  assert.ok(CAPABILITY_POLICIES.camera, 'Debe existir politica declarada para camara');
  assert.ok(CAPABILITY_POLICIES.geolocation, 'Debe existir politica declarada para geolocalizacion');
  assert.equal(CAPABILITY_POLICIES.camera.transientOnly, true, 'Camara debe ser exclusivamente de uso transitorio');
  assert.equal(CAPABILITY_POLICIES.camera.requiresExplicitGesture, true, 'Camara debe exigir accion explicita de la persona usuaria');

  const cameraPurpose = getCapabilityPurpose('camera');
  assert.ok(cameraPurpose.length > 10, 'La finalidad de camara debe estar documentada');
  const geoPurpose = getCapabilityPurpose('geolocation');
  assert.ok(geoPurpose.length > 10, 'La finalidad de geolocalizacion debe estar documentada');

  // Degradacion segura en entorno sin DOM (Node puro)
  const auditCameraRes = await auditCapabilityPermission('camera');
  assert.equal(auditCameraRes.capability, 'camera');
  assert.equal(auditCameraRes.state, 'unsupported', 'En entorno Node debe degradar a unsupported');
  assert.equal(auditCameraRes.fallbackActive, true, 'En entorno no soportado el fallback debe activarse');

  console.log('  -> Politicas de permisos y minimo privilegio: PASS');

  // ---------------------------------------------------------------------------
  // 6. Almacenamiento local, cuotas, prototype pollution y purga
  // ---------------------------------------------------------------------------
  console.log('[6/7] Verificando almacenamiento local (storage-guard)...');

  // 6.1 Degradacion segura sin DOM (Node puro)
  const noDomRead = readSecureInspections();
  assert.deepEqual(noDomRead, [], 'Sin DOM, readSecureInspections debe retornar arreglo vacio de forma segura');

  const noDomWrite = writeSecureInspections([]);
  assert.equal(noDomWrite.success, false, 'Sin DOM, writeSecureInspections debe retornar fallo controlado');

  const noDomPurge = purgeLocalInspections();
  assert.equal(noDomPurge, false, 'Sin DOM, purgeLocalInspections debe retornar false');

  // 6.2 Comportamiento funcional mediante simulacion de almacenamiento en memoria
  const memoryStore = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (key: string): string | null => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      memoryStore.set(key, value);
    },
    removeItem: (key: string): void => {
      memoryStore.delete(key);
    },
    clear: (): void => {
      memoryStore.clear();
    }
  };

  // Montar mock de window en globalThis
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: mockLocalStorage
  };

  try {
    // A) Guardar y leer registros legitimos
    const testRecord: StoredRecord = {
      id: 'inspection-sintetica-001',
      title: 'Mantenimiento preventivo de aire acondicionado',
      status: 'ok',
      syncStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    const writeResult = writeSecureInspections([testRecord]);
    assert.equal(writeResult.success, true, 'Debe guardar registros validos en el almacenamiento');
    assert.equal(writeResult.count, 1, 'Debe confirmar 1 registro almacenado');

    const readRecords = readSecureInspections();
    assert.equal(readRecords.length, 1, 'Debe recuperar el registro almacenado');
    assert.equal(readRecords[0].id, 'inspection-sintetica-001');
    assert.equal(readRecords[0].title, 'Mantenimiento preventivo de aire acondicionado');

    // B) Proteccion contra Prototype Pollution en JSON almacenado
    const pollutedPayload = JSON.stringify([
      {
        __proto__: { isAdmin: true },
        constructor: { prototype: { injected: true } },
        id: 'inspection-sintetica-002',
        title: 'Revision de laboratorio con intento de polucion',
        status: 'attention',
        syncStatus: 'pending',
        createdAt: new Date().toISOString()
      }
    ]);
    mockLocalStorage.setItem(INSPECTIONS_STORAGE_KEY, pollutedPayload);

    const parsedPolluted = readSecureInspections();
    assert.equal(parsedPolluted.length, 1, 'Debe procesar la entrada');
    assert.equal((Object.prototype as { isAdmin?: boolean }).isAdmin, undefined, 'No debe contaminar Object.prototype con isAdmin');
    assert.equal((Object.prototype as { injected?: boolean }).injected, undefined, 'No debe contaminar Object.prototype con injected');

    // C) Aislamiento contra datos personales en almacenamiento local
    const piiStoredPayload = JSON.stringify([
      {
        id: 'inspection-sintetica-003',
        title: 'Reporte con correo expuesto usuario@tehuacan.edu.mx',
        status: 'ok',
        syncStatus: 'pending',
        createdAt: new Date().toISOString()
      }
    ]);
    mockLocalStorage.setItem(INSPECTIONS_STORAGE_KEY, piiStoredPayload);
    const piiReadRes = readSecureInspections();
    assert.equal(piiReadRes.length, 0, 'readSecureInspections debe filtrar registros locales que contengan PII');

    // D) Cota maxima de almacenamiento cuantitativo (MAX_STORED_INSPECTIONS = 100)
    const excessiveRecords: StoredRecord[] = [];
    for (let i = 0; i < 110; i++) {
      excessiveRecords.push({
        id: `inspection-item-${i}`,
        title: `Revision sintetica ${i}`,
        status: 'ok',
        syncStatus: 'synced',
        createdAt: new Date().toISOString()
      });
    }
    const boundedWrite = writeSecureInspections(excessiveRecords);
    assert.equal(boundedWrite.success, true);
    assert.equal(boundedWrite.count, MAX_STORED_INSPECTIONS, 'Debe truncar la persistencia al maximo de 100 registros');

    // E) Procedimiento de eliminacion verificable (Derecho de Supresion LGPDPPSO)
    const purgeSuccess = purgeLocalInspections();
    assert.equal(purgeSuccess, true, 'purgeLocalInspections debe retornar true tras eliminar');
    assert.equal(mockLocalStorage.getItem(INSPECTIONS_STORAGE_KEY), null, 'La clave de almacenamiento debe quedar removida');
    assert.deepEqual(readSecureInspections(), [], 'Tras la purga, la lectura debe retornar arreglo vacio');
  } finally {
    // Desmontar mock para restaurar aislamiento de globalThis
    delete (globalThis as { window?: unknown }).window;
  }

  console.log('  -> Almacenamiento seguro, cuotas y purga: PASS');

  // ---------------------------------------------------------------------------
  // 7. Verificacion de directivas en public/robots.txt
  // ---------------------------------------------------------------------------
  console.log('[7/7] Verificando desaliento de indexacion en public/robots.txt...');

  const robotsPath = resolve(process.cwd(), 'public', 'robots.txt');
  const robotsContent = readFileSync(robotsPath, 'utf8');

  assert.ok(robotsContent.includes('User-agent: *'), 'robots.txt debe incluir directiva User-agent: *');
  assert.ok(
    robotsContent.includes('Disallow: /inspecciones'),
    'robots.txt debe desalentar el rastreo de la ruta operativa /inspecciones'
  );

  console.log('  -> robots.txt: PASS');

  console.log('\n=== Todos los controles de seguridad y privacidad verificados con éxito (PASS) ===');
}

runSecuritySuite().catch((error: unknown) => {
  console.error('\n[FALLO EN TESTS DE SEGURIDAD]:', error);
  process.exit(1);
});
