import assert from "node:assert/strict";
import { SyncQueue } from "../src/lib/sync/queue";
import { createSyncOperation } from "../src/lib/storage/schema";
import { resolveConflict } from "../src/lib/sync/conflict-policy";

async function runTest() {
  console.log("Iniciando tests de SyncQueue y Conflict Policy...");

  // Setup: Creamos una instancia fresca de la cola para los tests
  // Usamos delay en 0 para no demorar los tests innecesariamente
  const queue = new SyncQueue({ maxRetries: 3, baseDelayMs: 0, maxDelayMs: 0 });

  // 1. Encolado y almacenamiento de inspección offline
  const mockInspection = {
    id: "insp-001",
    title: "Test Lab",
    status: "ok" as const,
    date: "2026-10-04",
    inspectorId: "user-1",
    version: 1,
    updatedAt: 1000
  };

  const op1 = createSyncOperation("CREATE", mockInspection);
  const enqueued = queue.enqueue(op1);
  assert.ok(enqueued, "La mutación debería haberse encolado correctamente");
  assert.equal(queue.getPending().length, 1, "Debería haber 1 operación pendiente");

  // 2. Rechazo o descarte de mutación duplicada (idempotencia)
  const enqueuedDuplicate = queue.enqueue(op1);
  assert.equal(enqueuedDuplicate, false, "No debe permitir encolar la misma mutación dos veces (idempotencia)");
  assert.equal(queue.getPending().length, 1, "La cantidad de pendientes no debió aumentar");

  // 3. Mecanismo de reintento exitoso tras fallo transitorio
  let attempt = 0;
  const dispatcher = async (op: any) => {
    attempt++;
    if (attempt === 1) {
      throw new Error("Fallo de red simulado");
    }
    return true;
  };

  const result1 = await queue.processQueue(dispatcher);
  assert.equal(result1.retried, 1, "Debió registrar 1 reintento tras el primer fallo");
  assert.equal(queue.getPending().length, 1, "La operación debe seguir pendiente para el próximo reintento");

  // Segunda ejecución procesará el pending
  const result2 = await queue.processQueue(dispatcher);
  assert.equal(result2.succeeded, 1, "La operación debió tener éxito en el segundo intento");
  assert.equal(queue.getPending().length, 0, "No deben quedar operaciones pendientes");
  assert.ok(queue.isProcessed(op1.mutationId), "La mutación debe estar registrada como procesada");

  // Verificar idempotencia post-proceso: intentar encolar op1 otra vez
  const enqueuedProcessed = queue.enqueue(op1);
  assert.equal(enqueuedProcessed, false, "No debe encolar si ya fue sincronizada exitosamente");

  // 4. Aplicación de la regla de conflicto ante colisión de versiones
  const clientRecord = { ...mockInspection, version: 2, updatedAt: 2000 };
  const serverRecord = { ...mockInspection, version: 2, updatedAt: 1500 }; // Cliente es más reciente

  const conflict1 = resolveConflict(clientRecord, serverRecord);
  assert.equal(conflict1.resolution, "CLIENT_WINS", "Cliente debió ganar por tener updatedAt superior en la misma versión");
  assert.equal(conflict1.mergedRecord.updatedAt, 2000);

  const serverRecordNewer = { ...mockInspection, version: 3, updatedAt: 1500 };
  const conflict2 = resolveConflict(clientRecord, serverRecordNewer);
  assert.equal(conflict2.resolution, "SERVER_WINS", "Servidor debió ganar por tener versión mayor (independiente del updatedAt)");

  console.log("sync.spec.ts: PASS");
}

runTest().catch((err) => {
  console.error("sync.spec.ts: FAILED");
  console.error(err);
  process.exit(1);
});
