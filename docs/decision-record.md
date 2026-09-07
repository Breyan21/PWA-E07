# ADR-001 — Decisión sobre la estrategia de aplicación

## Estado

Aceptada por el equipo (Semana 1).

## Contexto y restricciones

El proyecto consiste en una aplicación para realizar inspecciones de mantenimiento en laboratorios de la UTT. Los usuarios principales utilizarán dispositivos móviles (teléfonos o tablets) mientras se mueven por distintos edificios. Existe la limitante crítica de que la conectividad a internet es intermitente o nula en ciertas áreas. Los datos a utilizar son sintéticos y el alcance del curso está centrado en desarrollo web progresivo. 

## Alternativas consideradas

| Criterio | PWA (Elegida) | Web Tradicional | App Nativa | App Multiplataforma (React Native / Flutter) |
|---|---|---|---|---|
| **Instalación** | Instalable desde el navegador sin pasar por tiendas. | No instalable. Requiere abrir el navegador siempre. | Instalable vía App Store/Google Play (requiere aprobaciones). | Instalable vía tiendas (requiere aprobaciones). |
| **Conexión intermitente (Offline)** | Soportado mediante Service Workers e IndexedDB. | No soportado por defecto (falla al perder conexión). | Soportado plenamente. | Soportado plenamente. |
| **Distribución** | Actualizaciones automáticas inmediatas por URL. | Actualizaciones inmediatas. | Distribución lenta y dependiente de tiendas. | Distribución dependiente de tiendas. |
| **Costo de desarrollo** | Bajo (reutiliza conocimientos web, un solo código). | Bajo. | Muy alto (requiere equipos para iOS y Android). | Medio (un solo código pero curva de aprendizaje diferente). |
| **Capacidades del dispositivo** | Limitadas (pero suficientes para formularios y cámara básica). | Muy limitadas. | Completas. | Casi completas. |

## Decisión

Justificamos el uso de una **Progressive Web App (PWA)** utilizando el stack provisto (Next.js y React). La PWA resulta adecuada porque soluciona el problema de la conexión intermitente mediante tecnologías web estándar (Service Workers) sin incurrir en los altos costos de tiempo y despliegue asociados a las aplicaciones nativas o multiplataforma. Dado que el sistema solo requiere capturar texto y estados, las capacidades del dispositivo ofrecidas por los navegadores modernos son más que suficientes.

## Consecuencias y riesgos

- **Beneficios:** Rápida iteración, despliegue inmediato mediante Vercel u otros servicios web, sin intermediarios (tiendas de aplicaciones), soporte nativo en el curso.
- **Costos/Riesgos:** La persistencia offline exige el diseño cuidadoso de una estrategia de sincronización y resolución de conflictos de datos. Además, el soporte de PWA en iOS a veces puede ser ligeramente inconsistente en comparación con Android.
- **Mitigación:** Documentar y planear la lógica de sincronización antes de implementarla. Probar constantemente en ambos sistemas operativos móviles (Android/iOS) usando navegadores web.

## Validación

Esta decisión se validará en las semanas posteriores cuando se implemente el manifest, el Service Worker y el almacenamiento local. La prueba clave será activar el modo avión en un dispositivo móvil real, registrar un hallazgo y confirmar que la aplicación no falla y mantiene los datos guardados en la base de datos local (IndexedDB) para su posterior sincronización.
