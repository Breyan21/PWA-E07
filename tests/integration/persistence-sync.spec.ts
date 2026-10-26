import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncQueue } from '@/lib/sync/queue';
import {
  createSyncOperation,
  getPendingOperations,
  type InspectionRecord,
  type SyncOperation
} from '@/lib/storage/schema';

// Fixture sintético: no hay datos reales.
const inspection: InspectionRecord = {
  id: 'insp-int-001',
  title: 'Inspección sintética de integración',
  status: 'attention',
  date: '2026-10-25',
  inspectorId: 'user-test',
  version: 1,
  updatedAt: 1000
};

// Almacén local simulado (equivale a localStorage/IndexedDB sin navegador).
function createLocalStore() {
  const operations: SyncOperation[] = [];
  return {
    operations,
    saveOffline(op: SyncOperation) {
      operations.push(op);
    }
  };
}

describe('Integración: persistencia offline y sincronización sin duplicados', () => {
  let store: ReturnType<typeof createLocalStore>;
  let queue: SyncQueue;

  beforeEach(() => {
    store = createLocalStore();
    queue = new SyncQueue({ maxRetries: 3, baseDelayMs: 0, maxDelayMs: 0 });
  });

  it('guardar sin conexión persiste la inspección como operación pendiente en el esquema', () => {
    const op = createSyncOperation('CREATE', inspection);
    store.saveOffline(op);
    queue.enqueue(op);

    const pending = getPendingOperations(store.operations);
    expect(pending).toHaveLength(1);
    expect(pending[0].payload).toEqual(inspection);
    expect(pending[0].status).toBe('pending');
    expect(queue.getPending()).toHaveLength(1);
  });

  it('reintentar la misma operación no crea duplicado en el destino remoto', async () => {
    const remote = vi.fn(async (_op: SyncOperation) => true);
    const op = createSyncOperation('CREATE', inspection);
    store.saveOffline(op);

    queue.enqueue(op);
    await queue.processQueue(remote);

    // Reintento de la misma operación (misma mutationId): debe descartarse.
    expect(queue.enqueue(op)).toBe(false);
    const second = await queue.processQueue(remote);

    expect(remote).toHaveBeenCalledTimes(1);
    expect(second.total).toBe(0);
    expect(queue.getQueue()).toHaveLength(1);
    expect(queue.getQueue()[0].status).toBe('synced');
  });

  it('un fallo remoto transitorio reintenta y termina con una sola entrega exitosa', async () => {
    const delivered: string[] = [];
    const remote = vi
      .fn<(op: SyncOperation) => Promise<boolean>>()
      .mockRejectedValueOnce(new Error('503 simulado'))
      .mockImplementation(async (op) => {
        delivered.push(op.mutationId);
        return true;
      });
    const op = createSyncOperation('CREATE', inspection);
    queue.enqueue(op);

    const first = await queue.processQueue(remote);
    expect(first.retried).toBe(1);
    const second = await queue.processQueue(remote);
    expect(second.succeeded).toBe(1);
    await queue.processQueue(remote);

    expect(delivered).toEqual([op.mutationId]);
    expect(remote).toHaveBeenCalledTimes(2);
  });
});