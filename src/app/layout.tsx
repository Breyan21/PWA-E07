import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "../components/service-worker-registration";

export const metadata: Metadata = {
  applicationName: "CheckUp",
  title: {
    default: "CheckUp",
    template: "%s | CheckUp"
  },
  description: "Registro sintético de inspecciones de mantenimiento de laboratorio.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
