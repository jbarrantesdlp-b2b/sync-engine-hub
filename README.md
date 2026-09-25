# Sync Engine Hub ⚡

Monorepo de alto rendimiento para **Sync Engine Hub**, compuesto exclusivamente por dos módulos principales:

- **/desktop**: Centro de control en Electron con servidor WebSocket en tiempo real en el puerto `8123`.
- **/android**: Aplicación móvil con interfaz pura Jetpack Compose (Hub OLED) y módulo `:widget` en Jetpack Glance para la pantalla de inicio.

---

## 📁 Arquitectura del Proyecto

```text
sync-engine-hub/
├── .gitignore
├── README.md
├── package.json               # Scripts raíz para orquestar Desktop y dependencias
├── settings.gradle.kts        # Configuración modular Gradle (:android, :widget)
├── build.gradle.kts           # Configuración de plugins (AGP 8.7, Kotlin 2.0 Compose)
├── gradle.properties          # Flags de rendimiento y AndroidX
│
├── desktop/                   # MÓDULO 1: Electron + WebSocket Server (:8123)
│   ├── package.json
│   └── src/
│       ├── main.js            # Electron Main Process + WebSocketServer (puerto 8123)
│       ├── preload.js         # ContextBridge IPC seguro
│       └── renderer/
│           ├── index.html     # Dashboard OLED oscuro con telemetría en tiempo real
│           ├── style.css      # Estética Cyber/OLED True Black
│           └── renderer.js    # Conexión IPC, logs en vivo y emisión de broadcasts
│
└── android/                   # MÓDULO 2: Android Jetpack Compose & Glance
    ├── build.gradle.kts       # Configurado con applicationId = "com.syncengine.hub"
    ├── src/main/
    │   ├── AndroidManifest.xml # Punto de entrada único: MainActivity (sin XML layouts)
    │   └── java/com/syncengine/hub/
    │       ├── MainActivity.kt # Entry point único: Hub OLED en Jetpack Compose
    │       ├── sync/
    │       │   └── HubWebSocketManager.kt # Cliente OkHttp WebSocket hacia ws://<desktop>:8123
    │       └── ui/theme/      # Paleta OLED Negro Puro, Neón Cyan, Emerald y Purple
    │           ├── Color.kt
    │           ├── Theme.kt
    │           └── Type.kt
    │
    └── widget/                # Submódulo :widget (Jetpack Glance)
        ├── build.gradle.kts   # Librería Android con soporte Jetpack Glance
        └── src/main/
            ├── AndroidManifest.xml # Registro de GlanceAppWidgetReceiver
            ├── res/
            │   ├── xml/hub_widget_info.xml # Metadatos de AppWidget (sin layouts XML)
            │   └── values/strings.xml
            └── java/com/syncengine/hub/widget/
                ├── HubGlanceWidget.kt         # Widget declarativo en Jetpack Glance Compose
                ├── HubGlanceWidgetReceiver.kt # GlanceAppWidgetReceiver
                └── HubWidgetUpdater.kt        # Actualización de estado del widget
```

---

## 🚀 Inicio Rápido

### 1. Módulo Desktop (Servidor WebSocket :8123)

```bash
# Instalar dependencias e iniciar Electron
npm run desktop:install
npm run desktop
```

- El servidor WebSocket iniciará automáticamente escuchando en `ws://0.0.0.0:8123`.
- La interfaz de usuario muestra la IP local para conectar el dispositivo móvil o emulador.

### 2. Módulo Android (`com.syncengine.hub`)

- Abre la carpeta en **Android Studio** (Koala / Ladybug o superior).
- Compila y ejecuta en un dispositivo físico o emulador Android:
  - En el emulador Android, el Hub se conecta por defecto a `10.0.2.2:8123`.
  - En un dispositivo físico en la misma red Wi-Fi, ingresa la IP local de tu PC que muestra la app Desktop.
- **Widget de Glance**: Mantén presionada la pantalla de inicio de Android, agrega el widget **Sync Engine Hub Widget** y prueba las acciones táctiles interactivas sin layouts XML antiguos.

---

## 📡 Protocolo WebSocket (:8123)

| Tipo de Mensaje | Origen | Propósito |
| --- | --- | --- |
| `DEVICE_REGISTER` | Android | Handshake de registro de nodo Hub |
| `PING` / `PONG` | Android ↔ Desktop | Medición de latencia de red en tiempo real |
| `SYNC_REQUEST` | Android | Petición de sincronización de datos |
| `DESKTOP_BROADCAST` | Desktop | Emisión masiva de señales hacia todos los clientes |
