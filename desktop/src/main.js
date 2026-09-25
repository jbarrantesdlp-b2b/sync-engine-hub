const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { WebSocketServer, WebSocket } = require('ws');

const WS_PORT = 8123;
let mainWindow = null;
let wss = null;
const clients = new Map();
let messageCounter = 0;

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ interface: name, address: iface.address });
      }
    }
  }
  return addresses;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startWebSocketServer() {
  try {
    wss = new WebSocketServer({ port: WS_PORT });

    wss.on('listening', () => {
      console.log(`[SyncEngine Hub] WebSocket server running on port ${WS_PORT}`);
      emitToRenderer('server-status', {
        status: 'ONLINE',
        port: WS_PORT,
        localIps: getLocalIpAddresses()
      });
    });

    wss.on('connection', (ws, req) => {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const remoteAddress = req.socket.remoteAddress || 'unknown';
      const clientInfo = {
        id: clientId,
        ip: remoteAddress,
        connectedAt: new Date().toISOString()
      };

      clients.set(clientId, { ws, info: clientInfo });
      console.log(`[SyncEngine Hub] Client connected: ${clientId} (${remoteAddress})`);

      emitToRenderer('client-connected', {
        client: clientInfo,
        totalClients: clients.size
      });

      // Send initial welcome & registration handshake
      ws.send(JSON.stringify({
        type: 'SERVER_HELLO',
        clientId: clientId,
        serverTime: Date.now(),
        message: 'Sync Engine Hub Desktop active on port 8123'
      }));

      ws.on('message', (data) => {
        messageCounter++;
        let parsed = null;
        try {
          parsed = JSON.parse(data.toString());
        } catch {
          parsed = { raw: data.toString() };
        }

        emitToRenderer('message-received', {
          clientId,
          payload: parsed,
          totalMessages: messageCounter,
          timestamp: new Date().toISOString()
        });

        // Handle Ping / Sync requests
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({
            type: 'PONG',
            clientId,
            clientTimestamp: parsed.timestamp || null,
            serverTimestamp: Date.now()
          }));
        } else if (parsed.type === 'SYNC_REQUEST') {
          ws.send(JSON.stringify({
            type: 'SYNC_RESPONSE',
            status: 'SUCCESS',
            node: 'DESKTOP-PRIMARY',
            syncedItemsCount: 1,
            timestamp: Date.now()
          }));
        }
      });

      ws.on('close', () => {
        clients.delete(clientId);
        console.log(`[SyncEngine Hub] Client disconnected: ${clientId}`);
        emitToRenderer('client-disconnected', {
          clientId,
          totalClients: clients.size
        });
      });

      ws.on('error', (err) => {
        console.error(`[SyncEngine Hub] Client error (${clientId}):`, err.message);
        emitToRenderer('client-error', {
          clientId,
          error: err.message
        });
      });
    });

    wss.on('error', (err) => {
      console.error('[SyncEngine Hub] WebSocket server error:', err.message);
      emitToRenderer('server-status', {
        status: 'ERROR',
        error: err.message,
        port: WS_PORT
      });
    });
  } catch (err) {
    console.error('Failed to start WebSocket server:', err);
  }
}

function emitToRenderer(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

function broadcastToClients(payload) {
  const serialized = JSON.stringify(payload);
  let count = 0;
  for (const { ws } of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(serialized);
      count++;
    }
  }
  return count;
}

// IPC Handlers
ipcMain.handle('get-server-info', () => {
  return {
    port: WS_PORT,
    localIps: getLocalIpAddresses(),
    totalClients: clients.size,
    totalMessages: messageCounter
  };
});

ipcMain.handle('broadcast-message', (event, message) => {
  const payload = {
    type: 'DESKTOP_BROADCAST',
    message: message || 'Broadcast from Desktop Hub',
    timestamp: Date.now()
  };
  const sentCount = broadcastToClients(payload);
  emitToRenderer('message-sent', {
    target: 'ALL',
    payload,
    sentCount,
    timestamp: new Date().toISOString()
  });
  return { sentCount };
});

app.whenReady().then(() => {
  createWindow();
  startWebSocketServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (wss) {
    wss.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
