const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('syncEngine', {
  getServerInfo: () => ipcRenderer.invoke('get-server-info'),
  broadcastMessage: (msg) => ipcRenderer.invoke('broadcast-message', msg),

  onServerStatus: (callback) => {
    ipcRenderer.on('server-status', (_, data) => callback(data));
  },
  onClientConnected: (callback) => {
    ipcRenderer.on('client-connected', (_, data) => callback(data));
  },
  onClientDisconnected: (callback) => {
    ipcRenderer.on('client-disconnected', (_, data) => callback(data));
  },
  onMessageReceived: (callback) => {
    ipcRenderer.on('message-received', (_, data) => callback(data));
  },
  onMessageSent: (callback) => {
    ipcRenderer.on('message-sent', (_, data) => callback(data));
  }
});
