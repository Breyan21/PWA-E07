import Link from "next/link";
import AppShell from "../components/app-shell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="page-shell">
        <section className="inspection-card detail-card" aria-labelledby="not-found-heading">
          <p className="eyebrow">Error 404</p>
          <h1 id="not-found-heading">Página no encontrada</h1>
          <p className="muted">La inspección o página solicitada no existe en los datos sintéticos.</p>
          <Link href="/">← Volver a inspecciones</Link>
        </section>
      </div>
    </AppShell>
  );
}
