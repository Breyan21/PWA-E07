import Link from 'next/link';
import { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: 'var(--ink)', fontSize: '1.2rem' }}>CheckUp PWA</strong>
          <nav aria-label="Navegación principal">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li>
                <Link href="/" style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 'bold' }}>
                  Inicio
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}