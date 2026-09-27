import type { CSSProperties } from "react";

type LoadingStateProps = {
  message?: string;
};

// El proyecto no usa Tailwind: los estilos van en línea con las variables de globals.css
// para que el componente funcione igual en render de servidor (SSR) y de cliente (CSR).
const containerStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  justifyContent: "center",
  padding: "60px 20px"
};

const spinnerStyle: CSSProperties = {
  animation: "loading-state-spin 1s linear infinite",
  border: "4px solid var(--accent-soft, #e9edff)",
  borderTopColor: "var(--accent, #3156d3)",
  borderRadius: "50%",
  height: "48px",
  width: "48px"
};

const messageStyle: CSSProperties = {
  animation: "loading-state-pulse 1.6s ease-in-out infinite",
  color: "var(--muted, #64708a)",
  fontWeight: 700,
  margin: 0
};

const srOnlyStyle: CSSProperties = {
  border: 0,
  clip: "rect(0, 0, 0, 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px"
};

const keyframes = `
@keyframes loading-state-spin { to { transform: rotate(360deg); } }
@keyframes loading-state-pulse { 50% { opacity: .5; } }
@media (prefers-reduced-motion: reduce) {
  [data-loading-state] * { animation: none !important; }
}
`;

export default function LoadingState({ message = "Cargando información..." }: LoadingStateProps) {
  return (
    <div data-loading-state="" role="status" aria-busy="true" aria-live="polite" style={containerStyle}>
      <style>{keyframes}</style>
      <div aria-hidden="true" style={spinnerStyle} />
      <p aria-hidden="true" style={messageStyle}>{message}</p>
      <span style={srOnlyStyle}>Cargando datos, por favor espere.</span>
    </div>
  );
}
