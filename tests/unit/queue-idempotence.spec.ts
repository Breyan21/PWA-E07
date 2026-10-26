import { describe, it, expect, beforeEach } from 'vitest';
import { SyncQueue } from '@/lib/sync/queue';
import { createSyncOperation, type InspectionRecord } from '@/lib/storage/schema';

const fixture = (id: string): InspectionRecord => ({
  id,
  title: `Inspección sintética ${id}`,
  status: 'ok',
  date: '2026-10-25',
  inspectorId: 'user-test',
  version: 1,
  updatedAt: 1000
});

describe('SyncQueue - Idempotencia, FIFO y Backoff', () => {
  let queue: SyncQueue;
  beforeEach(() => {
    queue = new SyncQueue({ maxRetries: 3, baseDelayMs: 200, maxDelayMs: 2000 });
  });

  it('debe descartar mutaciones duplicadas (idempotencia)', () => {
    const op = createSyncOperation('CREATE', fixture('1'));
    expect(queue.enqueue(op)).toBe(true);
    expect(queue.enqueue(op)).toBe(false);
    expect(queue.getPending()).toHaveLength(1);
  });

  it('debe descartar una mutación ya sincronizada', async () => {
    const op = createSyncOperation('CREATE', fixture('1'));
    queue.enqueue(op);
    await queue.processQueue(async () => true);
    expect(queue.isProcessed(op.mutationId)).toBe(true);
    expect(queue.enqueue(op)).toBe(false);
  });

  it('debe rechazar operaciones sin mutationId', () => {
    const invalid = { ...createSyncOperation('CREATE', fixture('1')), mutationId: '' };
    expect(() => queue.enqueue(invalid)).toThrow(/mutationId/);
  });

  it('debe despachar en orden secuencial (FIFO)', async () => {
    const a = createSyncOperation('CREATE', fixture('A'));
    const b = createSyncOperation('CREATE', fixture('B'));
    queue.enqueue(a);
    queue.enqueue(b);
    expect(queue.getPending().map((o) => o.mutationId)).toEqual([a.mutationId, b.mutationId]);

    const order: string[] = [];
    await queue.processQueue(async (op) => {
      order.push(op.payload.id);
    });
    expect(order).toEqual(['A', 'B']);
  });

  it('debe aplicar retroceso exponencial acotado', () => {
    expect(queue.calculateBackoff(0)).toBe(0);
    expect(queue.calculateBackoff(1)).toBe(200);
    expect(queue.calculateBackoff(2)).toBe(400);
    expect(queue.calculateBackoff(3)).toBe(800);
    expect(queue.calculateBackoff(10)).toBe(2000);
  });

  it('debe marcar como fallida una operación que agota los reintentos', async () => {
    const q = new SyncQueue({ maxRetries: 2, baseDelayMs: 0, maxDelayMs: 0 });
    const op = createSyncOperation('CREATE', fixture('F'));
    q.enqueue(op);
    await q.processQueue(async () => { throw new Error('red caída'); });
    const result = await q.processQueue(async () => { throw new Error('red caída'); });
    expect(result.failed).toBe(1);
    expect(q.getFailed()).toHaveLength(1);
  });
});