// src/lib/sync/queue.ts
import {
  type SyncOperation,
  type SyncStatus,
  markAsSynced
} from '../storage/schema';

/**
 * Representa una operación encolada con metadatos de reintento y diagnóstico.
 */
export interface QueuedOperation extends SyncOperation {
  retryCount: number;
  lastAttemptAt?: number;
  error?: string;
}

/**
 * Configuración de la cola de sincronización.
 */
export interface SyncQueueOptions {
  maxRetries?: number;   // Límite máximo de reintentos por operación (default: 3)
  baseDelayMs?: number;  // Tiempo base para retroceso exponencial (default: 200ms)
  maxDelayMs?: number;   // Límite superior de espera (default: 2000ms)
}

/**
 * Resumen del resultado del procesamiento de la cola.
 */
export interface SyncQueueResult {
  total: number;
  succeeded: number;
  failed: number;
  retried: number;
  errors: Array<{
    mutationId: string;
    error: string;
    retryCount: number;
  }>;
}

/**
 * Tipo de función despachadora de mutaciones hacia el backend o servicio remoto.
 */
export type MutationDispatcher = (operation: SyncOperation) => Promise<boolean | void>;

/**
 * Gestor de cola de sincronización offline con garantía de orden FIFO,
 * idempotencia por mutationId y resiliencia con retroceso exponencial.
 */
export class SyncQueue {
  private queue: QueuedOperation[] = [];
  private processedMutationIds: Set<string> = new Set();
  private isProcessing: boolean = false;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(options: SyncQueueOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 200;
    this.maxDelayMs = options.maxDelayMs ?? 2000;
  }

  /**
   * Encola una mutación asegurando idempotencia.
   * Si la mutación ya fue procesada o ya está pendiente en la cola,
   * se descarta ordenadamente retornando `false`.
   */
  public enqueue(operation: SyncOperation): boolean {
    if (!operation || !operation.mutationId) {
      throw new Error('Operación inválida: mutationId es obligatorio para garantizar idempotencia');
    }

    // 1. Verificación de idempotencia: descarte si ya fue sincronizada previamente
    if (this.processedMutationIds.has(operation.mutationId)) {
      return false;
    }

    // 2. Verificación de idempotencia en cola: descarte si ya está encolada
    const alreadyQueued = this.queue.some(item => item.mutationId === operation.mutationId);
    if (alreadyQueued) {
      return false;
    }

    // 3. Encolar con metadatos de reintento inicializados
    const queuedItem: QueuedOperation = {
      ...operation,
      status: 'pending',
      retryCount: 0
    };

    this.queue.push(queuedItem);
    return true;
  }

  /**
   * Procesa la cola de mutaciones en orden estricto (FIFO).
   * Aplica reintentos exponenciales ante fallos transitorios y marca como
   * 'failed' cuando una operación supera el límite de intentos (maxRetries).
   */
  public async processQueue(dispatcher?: MutationDispatcher): Promise<SyncQueueResult> {
    if (this.isProcessing) {
      throw new Error('La cola ya se encuentra en proceso de sincronización');
    }

    this.isProcessing = true;

    const result: SyncQueueResult = {
      total: 0,
      succeeded: 0,
      failed: 0,
      retried: 0,
      errors: []
    };

    // Despachador por defecto en caso de no suministrar uno personalizado
    const dispatch: MutationDispatcher = dispatcher ?? (async () => true);

    try {
      // Filtrar operaciones que requieren procesamiento (pending)
      const pendingOps = this.queue.filter(op => op.status === 'pending');
      result.total = pendingOps.length;

      for (const op of pendingOps) {
        op.status = 'syncing';
        op.lastAttemptAt = Date.now();

        try {
          // Despacho de la mutación hacia el destino
          await dispatch(op);

          // Éxito: marcar como sincronizada y registrar en historial idempotente
          op.status = 'synced';
          op.error = undefined;
          this.processedMutationIds.add(op.mutationId);
          result.succeeded++;
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          op.retryCount++;
          op.error = errorMessage;

          if (op.retryCount >= this.maxRetries) {
            // Superó el límite: marcar como fallida definitivamente
            op.status = 'failed';
            result.failed++;
            result.errors.push({
              mutationId: op.mutationId,
              error: errorMessage,
              retryCount: op.retryCount
            });
          } else {
            // Reintento: calcular retroceso exponencial y mantener en pending
            op.status = 'pending';
            result.retried++;

            const backoffDelay = this.calculateBackoff(op.retryCount);
            if (backoffDelay > 0) {
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return result;
  }

  /**
   * Calcula el retardo de retroceso exponencial (exponential backoff).
   * delay = min(baseDelay * 2^(retryCount - 1), maxDelay)
   */
  public calculateBackoff(retryCount: number): number {
    if (retryCount <= 0) return 0;
    const exponential = this.baseDelayMs * Math.pow(2, retryCount - 1);
    return Math.min(exponential, this.maxDelayMs);
  }

  /**
   * Retorna una copia de todas las operaciones actualmente pendientes (FIFO).
   */
  public getPending(): QueuedOperation[] {
    return this.queue.filter(op => op.status === 'pending');
  }

  /**
   * Retorna una copia de las operaciones que han fallado definitivamente.
   */
  public getFailed(): QueuedOperation[] {
    return this.queue.filter(op => op.status === 'failed');
  }

  /**
   * Retorna una copia de todas las operaciones en la cola con sus estados actuales.
   */
  public getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Lista de mutationIds que ya han sido sincronizados exitosamente.
   */
  public getProcessedIds(): string[] {
    return Array.from(this.processedMutationIds);
  }

  /**
   * Comprueba si una mutación ya fue procesada previamente.
   */
  public isProcessed(mutationId: string): boolean {
    return this.processedMutationIds.has(mutationId);
  }

  /**
   * Indica si la cola se está procesando actualmente.
   */
  public getIsProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Reintenta las operaciones fallidas restableciendo su contador y pasándolas a pending.
   */
  public retryFailed(): number {
    const failedOps = this.getFailed();
    for (const op of failedOps) {
      op.status = 'pending';
      op.retryCount = 0;
      op.error = undefined;
    }
    return failedOps.length;
  }

  /**
   * Limpia la cola y el registro de mutaciones procesadas.
   */
  public clear(): void {
    this.queue = [];
    this.processedMutationIds.clear();
    this.isProcessing = false;
  }
}

// Instancia singleton por defecto para el uso en la aplicación
export const syncQueue = new SyncQueue();
