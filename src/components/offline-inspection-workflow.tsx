'use client';

import { FormEvent, useEffect, useState } from 'react';
import { releaseCameraStream, requestCameraAccess } from '../lib/device/camera';
import { requestCurrentPosition } from '../lib/device/geolocation';

type LocalInspection = {
  id: string;
  title: string;
  status: 'ok' | 'attention';
  syncStatus: 'pending' | 'synced';
  createdAt: string;
};

const STORAGE_KEY = 'checkup:offline-inspections';

function readLocalInspections(): LocalInspection[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed as LocalInspection[] : [];
  } catch {
    return [];
  }
}

function writeLocalInspections(records: LocalInspection[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function createInspectionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `inspection-${Date.now()}`;
}

/**
 * Flujo sintético y verificable para registrar inspecciones cuando no hay red.
 * La persistencia local permite que la suite E2E pruebe recarga, reconexión e
 * idempotencia sin enviar datos reales a un servicio remoto.
 */
export default function OfflineInspectionWorkflow() {
  const [records, setRecords] = useState<LocalInspection[]>([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<LocalInspection['status']>('ok');
  const [isOnline, setIsOnline] = useState(true);
  const [message, setMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('Ubicación no solicitada.');
  const [cameraMessage, setCameraMessage] = useState('Cámara no solicitada.');
  const [showCameraFallback, setShowCameraFallback] = useState(false);

  useEffect(() => {
    setRecords(readLocalInspections());
    const updateConnection = () => setIsOnline(navigator.onLine);
    updateConnection();
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  const saveRecords = (nextRecords: LocalInspection[]) => {
    setRecords(nextRecords);
    writeLocalInspections(nextRecords);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const record: LocalInspection = {
      id: createInspectionId(),
      title: normalizedTitle,
      status,
      syncStatus: navigator.onLine ? 'synced' : 'pending',
      createdAt: new Date().toISOString()
    };

    saveRecords([...records, record]);
    setTitle('');
    setMessage(
      record.syncStatus === 'pending'
        ? 'Inspección guardada localmente y pendiente de sincronización.'
        : 'Inspección sincronizada correctamente.'
    );
  };

  const synchronizePending = () => {
    const pending = records.filter((record) => record.syncStatus === 'pending');
    if (!navigator.onLine) {
      setMessage('La sincronización requiere conexión. La inspección sigue pendiente localmente.');
      return;
    }

    const nextRecords = records.map((record) =>
      record.syncStatus === 'pending' ? { ...record, syncStatus: 'synced' as const } : record
    );
    saveRecords(nextRecords);
    setMessage(
      pending.length === 0
        ? 'No hay inspecciones pendientes de sincronización.'
        : `Sincronización completada: ${pending.length} inspección${pending.length === 1 ? '' : 'es'} actualizada${pending.length === 1 ? '' : 's'} sin duplicados.`
    );
  };

  const requestLocation = async () => {
    const result = await requestCurrentPosition({ timeout: 1000, maximumAge: 0 });
    if (result.fallbackTriggered) {
      setLocationMessage('Ubicación sintética UTT activa por falta de permiso o disponibilidad.');
      return;
    }
    setLocationMessage('Ubicación actual capturada bajo solicitud explícita.');
  };

  const requestCamera = async () => {
    const result = await requestCameraAccess();
    if (result.fallbackTriggered) {
      setShowCameraFallback(true);
      setCameraMessage('Fallback de cámara activo: adjunta un archivo sintético para continuar.');
      return;
    }
    releaseCameraStream(result.stream);
    setShowCameraFallback(false);
    setCameraMessage('Cámara disponible; el stream se liberó después de la comprobación.');
  };

  const pendingCount = records.filter((record) => record.syncStatus === 'pending').length;
  const syncedCount = records.filter((record) => record.syncStatus === 'synced').length;

  return (
    <section aria-labelledby="offline-workflow-heading" style={{ marginBottom: '28px' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '16px',
          padding: '20px',
          display: 'grid',
          gap: '16px'
        }}
      >
        <div>
          <p className="eyebrow">Registro sintético verificable</p>
          <h2 id="offline-workflow-heading">Nueva inspección</h2>
          <p className="muted" data-testid="connection-status">
            Estado de red: {isOnline ? 'con conexión' : 'sin conexión'}.
          </p>
        </div>

        <form onSubmit={handleSubmit} aria-label="Registrar inspección sintética" style={{ display: 'grid', gap: '12px' }}>
          <label htmlFor="inspection-title">
            Título de la inspección
          </label>
          <input
            id="inspection-title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Ej. Revisión sintética de laboratorio"
          />

          <label htmlFor="inspection-status">Estado</label>
          <select id="inspection-status" name="status" value={status} onChange={(event) => setStatus(event.target.value as LocalInspection['status'])}>
            <option value="ok">Sin incidencias</option>
            <option value="attention">Requiere atención</option>
          </select>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={requestLocation}>Usar ubicación</button>
            <button type="button" onClick={requestCamera}>Tomar foto de evidencia</button>
            <button type="submit">Guardar inspección</button>
          </div>
        </form>

        <p role="status" aria-live="polite" data-testid="workflow-message">{message}</p>
        <p role="status" aria-live="polite" data-testid="location-fallback-status">{locationMessage}</p>
        <p role="status" aria-live="polite" data-testid="camera-fallback-status">{cameraMessage}</p>

        {showCameraFallback && (
          <label htmlFor="camera-file-fallback">
            Adjuntar evidencia sintética
            <input id="camera-file-fallback" data-testid="camera-file-fallback" type="file" accept="image/*" />
          </label>
        )}

        <div aria-label="Resumen de sincronización">
          <p data-testid="pending-inspection-count">Pendientes: {pendingCount}</p>
          <p data-testid="synced-inspection-count">Sincronizadas: {syncedCount}</p>
          <button type="button" onClick={synchronizePending}>Sincronizar pendientes</button>
        </div>

        <ul aria-label="Inspecciones registradas localmente" data-testid="local-inspection-list">
          {records.map((record) => (
            <li key={record.id} data-testid={`local-inspection-${record.id}`}>
              {record.title} — {record.syncStatus === 'pending' ? 'pendiente local' : 'sincronizada'}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
