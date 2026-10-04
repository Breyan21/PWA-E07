# Memoria Técnica: Política de Resolución de Conflictos y Sincronización

## Arquitectura y Estrategia Elegida
Para la PWA de inspecciones se ha implementado una estrategia de resolución de conflictos determinista basada en **Last-Write-Wins (LWW)** combinada con **Vectores de Versión (Version Vectors)**, implementada en `src/lib/sync/conflict-policy.ts`.

## Algoritmos Elegidos
El proceso de resolución sigue un árbol de decisiones determinista:
1. **Colisión de versiones (Version Fallback):** Si las versiones numéricas (que se incrementan en cada operación validada) difieren, gana la entidad con la versión mayor.
2. **LWW por Timestamp (Last-Write-Wins):** Si dos clientes envían mutaciones sobre la misma versión del registro (empate de versión), gana aquel que tenga la marca de tiempo `updatedAt` (Unix Epoch) más reciente.
3. **Empate absoluto:** Si tanto la versión como la marca de tiempo coinciden al milisegundo (o provienen de relojes estropeados iguales), se establece el servidor remoto como fuente de verdad (`SERVER_WINS`).

## Trade-offs: LWW vs 3-Way Merge
- **LWW (Implementado):** 
  - *Ventajas:* Computacionalmente ligero, excelente para almacenamiento offline en móviles, garantiza convergencia eventual sin intervención del usuario.
  - *Desventajas:* Si dos personas editan campos distintos de un registro simultáneamente sin conexión, las ediciones del primero en sincronizar podrían sobreescribirse si el segundo tiene una marca de tiempo más reciente, causando pérdida silenciosa de algunos datos parciales.
- **3-Way Merge (Alternativa descartada):**
  - *Ventajas:* Fusión a nivel de campos; preservaría cambios simultáneos en campos distintos.
  - *Desventajas:* Alto costo de mantenimiento, tamaño en disco inflado al guardar múltiples *ancestros comunes* en IndexedDB/Local Storage de los dispositivos móviles, y potencial necesidad de una UI compleja para forzar al usuario a resolver conflictos manuales cuando no es posible una fusión limpia.

## Manejo de Relojes Desfasados (Clock Skew)
En los sistemas distribuidos (PWA offline), un dispositivo puede tener su reloj atrasado o adelantado respecto al servidor. 
Para mitigar esto, hemos priorizado la **versión lógica (`version`)** antes que la marca de tiempo absoluta. De este modo, si un dispositivo atrasado intenta editar un registro en la versión `5`, pero el servidor ya está en la versión `6`, el servidor ganará el conflicto lógicamente ignorando la mentira del reloj cliente.

## Límites de Almacenamiento y Encolado
La cola de sincronización FIFO (`SyncQueue`) retiene las mutaciones en un arreglo. En producción masiva, esta lista debe migrar a *IndexedDB* (ya que *localStorage* bloquea el hilo principal y limita a ~5MB). Los fallos transitorios reintentan exponencialmente con un máximo configurado (`maxRetries: 3`), mitigando el efecto de *thundering herd* cuando miles de PWAs regresan a la red simultáneamente.
