import { describe, it, expect } from 'vitest';

const storageMock = new Map();
const saveOffline = async (item: any) => { storageMock.set(item.mutationId, item); return true; };
const syncPending = async () => Array.from(storageMock.values());

describe('Persistencia y Sincronización', () => {
  it('debe persistir offline sin duplicar en reintentos', async () => {
    const op = { mutationId: 'mut-999', payload: { id: 1 } };
    await saveOffline(op);
    await saveOffline(op);
    
    const synced = await syncPending();
    expect(synced).toHaveLength(1);
  });
});