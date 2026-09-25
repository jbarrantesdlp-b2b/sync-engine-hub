# REGLAS DE INTERFAZ Y WIDGETS NATIVOS — SYNC ENGINE HUB

## 1. Widget de Android Nativo
- **Layout Principal:** `android-widget/src/main/res/layout/widget_hour.xml`
- **Animaciones/Flujo:** Vinculado estrictamente con `energy_flow.xml`.
- **Hora:** Usar un `TextClock` con formato `HH:mm`, `autoSizeTextType="uniform"`, rango de `72sp` a `168sp` y `autoSizeStepGranularity="2sp"`.
- **Fecha:** Usar un segundo `TextClock` con formato `d EEEE yyyy` fijado exactamente a `13sp`.
- **Exclusiones Estrictas:** Queda prohibido incluir barra de día, contador de pasos o información del clima.

## 2. Componentes de la Galería (Escritorio)
- **Componente Principal:** `src/components/studio/hour-piece.tsx`
- **Estilos Globales:** `src/styles.css`
- **Sincronización:** Reflejar idénticos formatos de hora y fecha para asegurar consistencia visual absoluta entre las plataformas.
