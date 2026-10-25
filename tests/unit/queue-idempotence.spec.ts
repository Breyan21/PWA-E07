import { describe, it, expect, beforeEach } from 'vitest';
// IMPORTA TU CLASE REAL AQUÍ:
// import { SyncQueue } from '@/lib/sync/queue';

class SyncQueue {
  private items = new Map();
  private retryCounts = new Map();

  enqueue(item: any) {
    if (this.items.has(item.mutationId)) return false;
    this.items.set(item.mutationId, item);
    this.retryCounts.set(item.mutationId, 0);
    return true;
  }
  
  getPending() { return Array.from(this.items.values()); }
  
  // Fórmula de retroceso exponencial (base 2)
  getBackoffTime(mutationId: string) {
    const retries = this.retryCounts.get(mutationId) || 0;
    return Math.pow(2, retries) * 1000;
  }

  incrementRetry(mutationId: string) {
    const current = this.retryCounts.get(mutationId) || 0;
    this.retryCounts.set(mutationId, current + 1);
  }
}

describe('SyncQueue - Idempotencia, FIFO y Backoff', () => {
  let queue: SyncQueue;
  beforeEach(() => { queue = new SyncQueue(); });

  it('debe descartar mutaciones duplicadas (Idempotencia)', () => {
    const op = { mutationId: 'mut-123', data: 'test' };
    expect(queue.enqueue(op)).toBe(true);
    expect(queue.enqueue(op)).toBe(false); // Falla el duplicado
  });

  it('debe mantener el orden secuencial (FIFO)', () => {
    queue.enqueue({ mutationId: '1', data: 'A' });
    queue.enqueue({ mutationId: '2', data: 'B' });
    const pending = queue.getPending();
    expect(pending[0].mutationId).toBe('1');
    expect(pending[1].mutationId).toBe('2');
  });

  it('debe aplicar la fórmula de retroceso exponencial ante reintentos', () => {
    queue.enqueue({ mutationId: 'mut-fail', data: 'test' });
    expect(queue.getBackoffTime('mut-fail')).toBe(1000); // 2^0 * 1000
    
    queue.incrementRetry('mut-fail');
    expect(queue.getBackoffTime('mut-fail')).toBe(2000); // 2^1 * 1000
  });
});