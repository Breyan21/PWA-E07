import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "../../../components/app-shell";

type InspectionStatus = "ok" | "attention";

type InspectionDetail = {
  id: string;
  title: string;
  status: InspectionStatus;
  date: string;
};

type PageProps = {
  params: { id: string };
};

// Datos sintéticos: no contienen información real de personas ni laboratorios.
const mockInspections: InspectionDetail[] = [
  { id: "inspection-001", title: "Laboratorio de Redes", status: "ok", date: "2026-08-28" },
  { id: "inspection-002", title: "Laboratorio de Electrónica", status: "attention", date: "2026-08-27" },
  { id: "inspection-003", title: "Laboratorio de Software", status: "ok", date: "2026-08-26" }
];

const statusLabels: Record<InspectionStatus, string> = {
  ok: "Sin incidencias",
  attention: "Requiere atención"
};

// Consulta simulada en el servidor con latencia de red para que el estado de carga sea visible.
async function getInspectionById(id: string): Promise<InspectionDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockInspections.find((inspection) => inspection.id === id) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const inspection = await getInspectionById(params.id);
  return { title: inspection ? inspection.title : "Inspección no encontrada" };
}

export default async function InspeccionDetallePage({ params }: PageProps) {
  const inspection = await getInspectionById(params.id);

  // Manejo de error en servidor: un ID inexistente (p. ej. inspection-999) responde 404
  // desde el servidor, sin llegar a renderizar nada que el cliente tenga que hidratar.
  if (!inspection) {
    notFound();
  }

  return (
    <AppShell>
      <div className="page-shell">
        <article
          className="inspection-card"
          aria-labelledby="detail-heading"
          style={{ margin: "0 auto", maxWidth: "720px" }}
        >
          <header style={{ borderBottom: "1px solid var(--line)", marginBottom: "18px", paddingBottom: "14px" }}>
            <p className="eyebrow" style={{ color: "var(--accent)" }}>Detalle de inspección</p>
            <h1 id="detail-heading">{inspection.title}</h1>
            <p className="muted">ID: {inspection.id}</p>
          </header>

          <span className={`badge badge-${inspection.status}`}>{statusLabels[inspection.status]}</span>

          <dl>
            <div>
              <dt>Ubicación</dt>
              <dd>{inspection.title}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{statusLabels[inspection.status]}</dd>
            </div>
            <div>
              <dt>Fecha de registro</dt>
              <dd>
                <time dateTime={inspection.date}>{inspection.date}</time>
              </dd>
            </div>
          </dl>
        </article>

        <p className="footer">
          <Link href="/">← Volver a inspecciones</Link>
        </p>
      </div>
    </AppShell>
  );
}
