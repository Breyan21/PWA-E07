'use client';

import { useEffect, useState } from 'react';
import {
  registerServiceWorker,
  applyUpdate,
  onControllerChange
} from '../lib/pwa/register-service-worker';

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Escuchar el cambio de controlador (activación del nuevo Service Worker)
    // para recargar la aplicación limpiamente cuando el usuario confirme la actualización.
    const unsubscribe = onControllerChange(() => {
      console.info('[PWA] Nuevo Service Worker activado. Recargando para aplicar cambios...');
      window.location.reload();
    });

    // 2. Registrar el Service Worker con callbacks para ciclo de vida
    registerServiceWorker({
      onUpdate: (registration) => {
        setSwRegistration(registration);
        setUpdateAvailable(true);
      },
      onSuccess: () => {
        console.info('[PWA] Aplicación lista para operar offline.');
      },
      onError: (error) => {
        console.error('[PWA] Registro fallido:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdate = () => {
    if (!swRegistration) return;
    setIsUpdating(true);
    // Acción explícita del usuario: envía invalidación de caché de runtime y solicita skipWaiting
    applyUpdate(swRegistration, { clearRuntimeCache: true });
  };

  const handleDismiss = () => {
    // Permite al usuario continuar su trabajo actual sin forzar la actualización
    setIsDismissed(true);
  };

  if (!updateAvailable || isDismissed) {
    return null;
  }

  return (
    <aside
      id="pwa-update-banner"
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        backgroundColor: 'var(--surface, #ffffff)',
        color: 'var(--ink, #172033)',
        border: '1px solid var(--line, #dce3ef)',
        borderRadius: '16px',
        boxShadow: '0 12px 32px rgba(23, 32, 51, 0.15), 0 2px 6px rgba(23, 32, 51, 0.08)',
        padding: '20px',
        animation: 'pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          aria-hidden="true"
          style={{
            backgroundColor: 'var(--accent-soft, #e9edff)',
            color: 'var(--accent, #3156d3)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
          ↻
        </div>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: '0 0 4px',
              fontSize: '0.98rem',
              fontWeight: 700,
              color: 'var(--ink, #172033)'
            }}
          >
            Nueva versión disponible
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--muted, #64708a)',
              lineHeight: 1.45
            }}
          >
            Se ha preparado una actualización de CheckUp. Puedes aplicarla ahora para cargar las últimas mejoras.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          marginTop: '6px'
        }}
      >
        <button
          type="button"
          id="pwa-dismiss-button"
          onClick={handleDismiss}
          disabled={isUpdating}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted, #64708a)',
            padding: '8px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          Más tarde
        </button>
        <button
          type="button"
          id="pwa-update-button"
          onClick={handleUpdate}
          disabled={isUpdating}
          style={{
            backgroundColor: isUpdating ? 'var(--muted, #64708a)' : 'var(--accent, #3156d3)',
            color: '#ffffff',
            border: 'none',
            padding: '8px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderRadius: '8px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(49, 86, 211, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.15s ease, background-color 0.2s ease'
          }}
        >
          {isUpdating ? 'Actualizando...' : 'Actualizar aplicación'}
        </button>
      </div>

      <style jsx>{`
        @keyframes pwaSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </aside>
  );
}
