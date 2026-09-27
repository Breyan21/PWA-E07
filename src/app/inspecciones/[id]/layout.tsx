import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { inspections } from "../../../lib/data/inspections";

type LayoutProps = {
  children: ReactNode;
  params: { id: string };
};

// El layout queda fuera del límite de Suspense de loading.tsx: validar aquí el ID
// permite responder con estado HTTP 404 antes de que empiece el streaming.
export default function InspectionLayout({ children, params }: LayoutProps) {
  if (!inspections.some((inspection) => inspection.id === params.id)) {
    notFound();
  }

  return children;
}
