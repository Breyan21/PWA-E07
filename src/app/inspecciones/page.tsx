'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '../../components/app-shell';
import LoadingState from '../../components/loading-state';
import { inspections, type Inspection, type InspectionStatus } from '../../lib/data/inspections';

type FilterStatus = 'all' | InspectionStatus;

export default function InspeccionesPage() {
  const [data, setData] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

  // Función asíncrona para simular petición de red con latencia controlada (700ms)
  const loadInspections = useCallback((shouldFail: boolean = false) => {
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (shouldFail) {
        setError('Error de conexión sintético: no fue posible sincronizar el listado con el servidor.');
        setData([]);
      } else {
        setData(inspections);
        setError(null);
      }
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Carga inicial al montar el componente en el cliente
  useEffect(() => {
    const cancel = loadInspections(simulateFailure);
    return () => cancel();
  }, [loadInspections, simulateFailure]);

  // Filtrado reactivo en cliente (CSR) sin recargar la página
  const filteredInspections = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.location.toLowerCase().includes(query) ||
        item.inspector.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [data, statusFilter, searchTerm]);

  return (
    <AppShell>
      <div className="page-shell">
        <header className="hero" style={{ marginBottom: '28px' }}>
          <p className="eyebrow">Ruta CSR · Client-Side Rendering</p>
          <h1>Listado de inspecciones</h1>
          <p className="lead">
            Esta vista se procesa dinámicamente en el navegador del usuario (CSR), permitiendo
            búsqueda interactiva, filtrado reactivo y recuperación ante fallos de conexión.
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '14px' }}>
            <span className="status">Estrategia: CSR (use client)</span>
            <span className="status">Latencia simulada: 700ms</span>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: simulateFailure ? 'rgba(255, 99, 71, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                border: simulateFailure ? '1px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.3)',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                style={{ cursor: 'pointer' }}
                aria-label="Simular fallo de red para probar recuperación"
              />
              Simular fallo de conexión
            </label>
          </div>
        </header>

        {/* Panel de filtros interactivos en el cliente */}
        <section aria-label="Controles de búsqueda y filtrado" style={{ marginBottom: '28px' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 4px 14px rgba(36, 55, 95, 0.04)'
            }}
          >
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 280px' }}>
                <label
                  htmlFor="search-input"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}
                >
                  Buscar por laboratorio, responsable o descripción:
                </label>
                <input
                  id="search-input"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej. Redes, Software, Técnica A..."
                  disabled={isLoading || error !== null}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    background: 'var(--background)',
                    fontSize: '0.95rem',
                    color: 'var(--ink)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Filtrar por estado:
                </span>
                <div role="group" aria-label="Filtro de estado" style={{ display: 'flex', gap: '8px' }}>
                  {(['all', 'ok', 'attention'] as const).map((status) => {
                    const isActive = statusFilter === status;
                    const labels: Record<FilterStatus, string> = {
                      all: 'Todos',
                      ok: 'Sin incidencias',
                      attention: 'Requiere atención'
                    };
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        disabled={isLoading || error !== null}
                        aria-pressed={isActive}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '999px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: isLoading || error !== null ? 'not-allowed' : 'pointer',
                          border: isActive ? '1px solid var(--accent)' : '1px solid var(--line)',
                          background: isActive ? 'var(--accent)' : 'var(--surface)',
                          color: isActive ? '#ffffff' : 'var(--muted)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {labels[status]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Región de contenido con estados verificables */}
        <section aria-labelledby="results-heading" aria-live="polite">
          {/* 1. Estado de Carga (LoadingState) */}
          {isLoading && (
            <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)' }}>
              <LoadingState message="Recuperando inspecciones desde el cliente (CSR)..." />
            </div>
          )}

          {/* 2. Estado de Error con botón de recuperación (Retry Button) */}
          {!isLoading && error && (
            <div
              role="alert"
              style={{
                background: 'var(--warning-soft)',
                border: '1px solid var(--warning)',
                borderRadius: '16px',
                padding: '36px 24px',
                textAlign: 'center'
              }}
            >
              <h2 style={{ color: 'var(--warning)', fontSize: '1.4rem', marginBottom: '8px' }}>
                Fallo en la comunicación cliente-servidor
              </h2>
              <p style={{ color: 'var(--ink)', maxWidth: '580px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                {error}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSimulateFailure(false);
                    loadInspections(false);
                  }}
                  style={{
                    background: 'var(--warning)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(155, 93, 0, 0.25)'
                  }}
                >
                  ↻ Reintentar recuperación
                </button>
              </div>
            </div>
          )}

          {/* 3. Estado con Datos Renderizados */}
          {!isLoading && !error && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Resultados interactivos</p>
                  <h2 id="results-heading">Inspecciones disponibles</h2>
                </div>
                <span className="count">
                  {filteredInspections.length} de {data.length} registradas
                </span>
              </div>

              {filteredInspections.length === 0 ? (
                <div
                  style={{
                    border: '2px dashed var(--line)',
                    borderRadius: '16px',
                    padding: '48px 20px',
                    textAlign: 'center',
                    background: 'var(--surface)'
                  }}
                >
                  <h3 style={{ color: 'var(--ink)', marginBottom: '8px' }}>No hay coincidencias</h3>
                  <p className="muted" style={{ marginBottom: '16px' }}>
                    Ninguna inspección cumple con los criterios de búsqueda o filtro seleccionados.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)',
                      padding: '8px 16px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="inspection-grid">
                  {filteredInspections.map((inspection) => (
                    <article className="inspection-card" key={inspection.id} tabIndex={0} aria-labelledby={`title-${inspection.id}`}>
                      <div className="card-topline">
                        <span className={`badge badge-${inspection.status}`}>
                          {inspection.statusLabel}
                        </span>
                        <time dateTime={inspection.date} className="muted">
                          {inspection.date}
                        </time>
                      </div>

                      <h3 id={`title-${inspection.id}`}>
                        <Link
                          href={`/inspecciones/${inspection.id}`}
                          style={{ color: 'var(--ink)', textDecoration: 'none' }}
                          title={`Ver detalle SSR de ${inspection.location}`}
                        >
                          {inspection.location} →
                        </Link>
                      </h3>

                      <p>{inspection.summary}</p>

                      <dl>
                        <div>
                          <dt>Responsable</dt>
                          <dd>{inspection.inspector}</dd>
                        </div>
                        <div>
                          <dt>Hallazgos detectados</dt>
                          <dd>{inspection.findings}</dd>
                        </div>
                        <div>
                          <dt>Estrategia de detalle</dt>
                          <dd style={{ color: 'var(--accent)' }}>SSR (Server Component)</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <footer className="footer" style={{ marginTop: '40px', borderTop: '1px solid var(--line)' }}>
          <p>
            <Link href="/" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              ← Volver al inicio
            </Link>
          </p>
          <p className="muted">
            PWA de Inspecciones de Laboratorio · Modo CSR / SSR · Universidad Tecnológica de Tehuacán
          </p>
        </footer>
      </div>
    </AppShell>
  );
}
