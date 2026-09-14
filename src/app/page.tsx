'use client';
import { useState } from 'react';
import { inspections } from "../lib/data/inspections";
import AppShell from "../components/app-shell";

type AppState = 'loading' | 'error' | 'empty' | 'data';

export default function HomePage() {
  const [currentState, setCurrentState] = useState<AppState>('data');

  return (
    <AppShell>
      <div className="page-shell">
        <header className="hero">
          <p className="eyebrow">Proyecto base · Semana 1</p>
          <h1>Inspecciones de laboratorio</h1>
          <p className="lead">
            Registro de mantenimiento para trabajar con conectividad intermitente.
            Los datos mostrados son sintéticos.
          </p>
          <span className="status">Estado del starter: ejecutable · PWA configurada</span>
          
          {/* Controles de demostración solicitados por la rúbrica */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentState('loading')} className="status" style={{ cursor: 'pointer', color: 'white' }}>Estado: Carga</button>
            <button onClick={() => setCurrentState('error')} className="status" style={{ cursor: 'pointer', color: 'white' }}>Estado: Error</button>
            <button onClick={() => setCurrentState('empty')} className="status" style={{ cursor: 'pointer', color: 'white' }}>Estado: Vacío</button>
            <button onClick={() => setCurrentState('data')} className="status" style={{ cursor: 'pointer', color: 'white' }}>Estado: Datos</button>
          </div>
        </header>

        <section aria-labelledby="inspections-heading" className="content-section">
          {currentState === 'loading' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3 style={{ color: 'var(--accent)' }}>Cargando inspecciones...</h3>
              <p className="muted">Por favor espera un momento.</p>
            </div>
          )}

          {currentState === 'error' && (
            <div style={{ background: 'var(--warning-soft)', border: '1px solid var(--warning)', borderRadius: '16px', padding: '30px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--warning)' }}>Error de conexión</h3>
              <p className="muted" style={{ marginBottom: '20px' }}>No fue posible sincronizar las inspecciones locales con el servidor.</p>
              <button onClick={() => setCurrentState('loading')} style={{ background: 'var(--warning)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}>
                Reintentar recuperación
              </button>
            </div>
          )}

          {currentState === 'empty' && (
            <div style={{ border: '2px dashed var(--line)', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
              <h3>No hay inspecciones</h3>
              <p className="muted">No se encontraron registros de mantenimiento en este momento.</p>
            </div>
          )}

          {currentState === 'data' && (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Datos de demostración</p>
                  <h2 id="inspections-heading">Inspecciones recientes</h2>
                </div>
                <span className="count">{inspections.length} registros</span>
              </div>

              <div className="inspection-grid">
                {inspections.map((inspection) => (
                  <article className="inspection-card" key={inspection.id}>
                    <div className="card-topline">
                      <span className={`badge badge-${inspection.status}`}>{inspection.statusLabel}</span>
                      <span className="muted">{inspection.date}</span>
                    </div>
                    <h3>{inspection.location}</h3>
                    <p>{inspection.summary}</p>
                    <dl>
                      <div>
                        <dt>Responsable</dt>
                        <dd>{inspection.inspector}</dd>
                      </div>
                      <div>
                        <dt>Hallazgos</dt>
                        <dd>{inspection.findings}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="footer">
          <p>Aplicaciones Web Progresivas · Universidad Tecnológica de Tehuacán</p>
        </footer>
      </div>
    </AppShell>
  );

} 