# 1. Estrategia de Arquitectura Recomendada 

Para cumplir con el requerimiento de comparar **CSR vs. SSR en el mismo dominio** : 

- **Ruta Listado (/inspecciones):** Implementada como **CSR (Client-Side Rendering)** con 'use client', simulación de latencia de red, filtros interactivos por estado (ok / attention), manejo explícito de estados de carga (loading), error y reintento. 

- **Ruta Detalle (/inspecciones/[id]):** Implementada como **SSR (Server-Side Rendering)** mediante un _React Server Component_ con resolución asíncrona de datos sintéticos, validación de identificador (manejo de error 404 / notFound()) y soporte para streaming/suspense. 

- **Componente Compartido:** 

loading-state.tsx utilizado en ambas rutas con semántica accesible (role="status", ariabusy="true"). 

2. Reparto de Responsabilidades por Integrante 

**Integrante 1:** 

**Rol:** _Arquitectura SSR, Componentes de Estado y Resiliencia Visual_ 

- **Entregables principales:** 

• 

src/app/inspecciones/[id]/page.tsx (Ruta SSR del Detalle). 

- 

src/components/loading-state.tsx (Componente modular de estado de carga accesible). 

- **Alcance técnico específico:** 

   - Desarrollar la vista de detalle como Server Component que consulte los datos sintéticos de src/lib/data/inspections.ts. 

   - Diseñar el estado de carga (loading-state.tsx) con esqueletos ( _skeleton screens_ ) o spinner accesible para ser reutilizado en el cliente y en el servidor. 

   - Implementar el manejo de errores en servidor (ej. cuando se solicita un id inexistente como inspection-999, mostrando una pantalla de error/404 sin romper el render). 

   - Evitar advertencias de _hydration mismatch_ . 

- **Evidencia que debe registrar en evidence/individual.md:** 

   - Commit SHA de la ruta detalle y el componente de loading. 

   - Justificación de por qué el detalle se beneficia de SSR (SEO, carga inicial directa, menor bundle de JS enviado al cliente). 

   - Prueba local ejecutada de la vista detalle y del caso de error (404). 

**Integrante 2:** 

**Rol:** _Interactividad Client-Side (CSR), Manejo de Estados y Accesibilidad_ 

- **Entregables principales:** 

   - 

src/app/inspecciones/page.tsx (Ruta CSR del Listado). 

   - Integración del estado de carga y estado de error con recuperación ( _retry button_ ). 

- **Alcance técnico específico:** 

   - Desarrollar la vista de listado con directiva 'use client', gestionando estados con useState y useEffect (data, isLoading, error). 

   - Incorporar una simulación de retardo de red (ej. setTimeout de 500–800ms) para hacer visible y medible el estado de carga (LoadingState). 

   - Agregar interacción en cliente (filtro por estado o buscador) y un botón de "Reintentar" ante fallos de conexión simulados. 

   - Asegurar navegación accesible mediante teclado (tabindex, enlaces a /inspecciones/[id]). 

- **Evidencia que debe registrar en evidence/individual.md:** 

   - Commit SHA de la página de listado CSR. 

- Justificación técnica de por qué el listado utiliza CSR (interactividad reactiva en cliente, filtros sin recargar página). 

- Limitación identificada (ej. impacto en TTFB/FCP si hay mala conexión o JS bloqueado). 

**Integrante 3:** 

**Rol:** _Automatización de Pruebas, Ingeniería Comparativa (ADR) y Verificación CI/CD_ 

- **Entregables principales:** 

• 

tests/rendering.spec.ts (Suite de pruebas automatizadas y deterministas). 

• 

docs/rendering-decision.md (Reporte de decisión técnica, trade-offs y métricas). 

• 

README.md (Actualización con instrucciones de ejecución y evidencia reproducible). 

- Coordinación de 

evidence/individual.md y validación del flujo en 

.github/workflows/week-04-w04-csr-ssr.yml. 

- **Alcance técnico específico:** 

   - Crear pruebas deterministas en tests/rendering.spec.ts (verificando que existan las rutas, que respondan adecuadamente, que manejen datos sintéticos y que fallen ante regresiones). 

   - Redactar en docs/rendering-decision.md la matriz comparativa de CSR vs. SSR: 

      - Métricas de carga (FCP, LCP estimado, TTFB). 

      - Complejidad de mantenimiento y resiliencia ante pérdida de conexión (modo offline en PWA). 

      - Impacto en accesibilidad. 

   - Ejecutar y verificar localmente bash public-tests/check.sh, npm run build y npm test, asegurando código de salida 0 sin secrets ni PII. 

- **Evidencia que debe registrar en evidence/individual.md:** 

   - Commit SHA de la suite de pruebas y del documento de decisión. 

   - Explicación de qué valida la suite de pruebas y qué comportamiento queda fuera del test unitario. 

   - Riesgo/limitación detectada en la integración y pipeline de CI. 

# 3. Matriz de Cobertura de la Rúbrica (8 Puntos) 

|Criterio|Puntos|<sup>Responsable</sup><br>Principal|<br>Validación / Evidencia Requerida|
|---|---|---|---|
|**AC-01**<br>**Reproducibilidad**|<sup>2 pts</sup>|Integrante 3<br>(apoyado<br>por todo el<br>equipo)|npm ci limpio, lockfile consistente y npm run<br>build sin errores en Node.js.|
|**AC-02**<br>**Implementación**|<sup>3 pts</sup>|Integrante 1<br>(SSR +<br>Loading) &<br>Integrante 2<br>(CSR)|Existencia y funcionalidad verificable de:<br>• src/app/inspecciones/page.tsx<br>• src/app/inspecciones/[id]/page.tsx<br>• src/components/loading-state.tsx|
|**AC-03 Calidad**<br>**Verificable**|2 pts|Integrante 3|tests/rendering.spec.ts ejecutable con npm test<br>-- --run que evalúa datos sintéticos, estados y<br>regresiones.|
|**AC-04 Ingeniería**<br>**y Reporte**|1 pt|Todo el<br>equipo|docs/rendering-<br>decision.md completo, README.md actualizado<br>y secciones individuales<br>en evidence/individual.md.|



4. Flujo de Trabajo en 4 Fases (Secuencia Recomendada) 

# 1. **Fase 1 – Base común y Componente de Carga (Día 1-2):** 

- Integrante 1 implementa 

src/components/loading-state.tsx para que ambos puedan consumirlo. 

- Integrante 3 configura el contrato de prueba base en 

tests/rendering.spec.ts (inicialmente fallando en rojo para TDD). 

# 2. **Fase 2 – Desarrollo de Rutas en Paralelo (Día 3-4):** 

- Integrante 2 desarrolla la página listado CSR ( 

src/app/inspecciones/page.tsx). 

- Integrante 1 desarrolla la página detalle SSR ( 

src/app/inspecciones/[id]/page.tsx). 

# 3. **Fase 3 – Pruebas, Comparación y Documentación (Día 5):** 

- Integrante 3 ajusta y ejecuta tests/rendering.spec.ts hasta tener todas las pruebas en verde. 

- Integrante 3 y el equipo documentan los resultados y mediciones en 

docs/rendering-decision.md. 

# 4. **Fase 4 – Verificación Final y Evidencia Individual (Día 6-7):** 

- Cada integrante llena su apartado en 

evidence/individual.md con su commit específico, decisión, prueba, limitación y declaración de IA. 

- Ejecución local de bash public-tests/check.sh y verificación de que el workflow de GitHub Actions termine exitosamente en verde. 

5. Estructura para evidence/individual.md (Para Cada Integrante) 

Cada integrante debe asegurarse de completar su bloque con la siguiente estructura requerida: 

markdown 

**## Integrante: [Nombre Completo] (Semana 4)** 

- ****Mi contribución concreta y enlace:**** [Explicar archivo desarrollado y enlace al 

- commit SHA]. 

- ****Decisión que puedo explicar y por qué:**** [Justificar la decisión arquitectónica (CSR 

- vs SSR, diseño de loading, enfoque de pruebas, etc.)]. 

- ****Comando o prueba ejecutada:**** [Comando exacto ejecutado, ej: `npm test` o `bash 

- public-tests/check.sh`]. 

- ****Resultado real que observé:**** [Salida en terminal, código 0, pruebas pasadas]. 

- ****Qué verifica esa prueba y qué no verifica:**** [Detalle crítico: qué comprueba y qué 

- limitaciones escapan de la prueba]. 

- ****Limitación, dificultad o riesgo identificado:**** [Riesgo de conectividad, hydration 

- mismatch, latencia, etc.]. 

- ****Uso de IA:**** [Declarar herramienta (ej. Antigravity), propósito exacto, partes asistidas y 

- cómo fue validado humanamente]. 

