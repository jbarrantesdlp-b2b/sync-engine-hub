# Sync Engine → APK (Google Antigravity)

Pega esto en el agente de Antigravity. No reescribas el diseño web: genera una **app Android nativa** instalable.

## Objetivo

APK de **Barrantes Co. / Sync Engine** con un **widget de escritorio** (Glance / AppWidget) y una Activity mínima. El usuario debe poder:

1. Instalar el APK (sideload).
2. Mantener pulsado el escritorio → Widgets → Sync Engine → soltar el reloj.
3. Ver hora local, halo de plasma púrpura animado (o redibujado cada minuto), Pasos y Clima en **—** hasta que haya datos reales del teléfono.

## Diseño (no negociable)

- Tarjeta oscura `#1a1a1a`, esquinas ~28dp, números blancos `#f4f4f4` muy grandes `HH:mm` (sin segundos).
- Halo: anillo púrpura `#9b4dff` / `#c48cff` alrededor de la hora, con corriente que recorre el aro (no cian, no blanco quemado).
- Debajo, 2 columnas centradas: 👟 Pasos | ☀️ Clima. Valores reales o "—". Nunca inventar 22° ni pasos fake.
- Sin fondo de dunas, sin wallpaper azul, sin lista de dispositivos, sin IA, sin bienvenida.
- Marca: logo Barrantes Co. (archivos en `public/brand-kit/` y `public/media/logo-full.png`).
- Tamaños de widget: 2×2 y 4×2 (redimensionable).

Referencias visuales en el proyecto:

- `public/widget-reloj.png`
- `src/components/suite/poster-widgets.tsx`
- `src/components/suite/energy-halo.tsx`

## Datos

- Hora: reloj del sistema (`TextClock` / `Glance`).
- Pasos: Health Connect si el usuario concede permiso; si no, "—".
- Clima: no llamar APIs de demo. Solo temperatura si hay fuente real del dispositivo o un proveedor con permiso; si no, "—".
- Offline: atenuar Pasos/Clima y mostrar "Sin conexión".

## Entrega

- Kotlin + Jetpack Compose + Glance App Widget.
- `applicationId`: `co.barrantes.syncengine`
- Generar **APK firmado debug** listo para sideload.
- Indicar la ruta exacta del `.apk` al terminar.
- Target SDK actual, minSdk 26.

## No hacer

- No envolver la web de Grok en un WebView (el halo y el widget de Android no funcionan así).
- No pedir Play Store.
- No inventar cifras de salud ni clima.
