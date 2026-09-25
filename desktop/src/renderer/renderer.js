// Sync Engine Hub Desktop Renderer
const metricPort = document.getElementById('metric-port');
const metricProtocol = document.getElementById('metric-protocol');
const metricClients = document.getElementById('metric-clients');
const metricMessages = document.getElementById('metric-messages');
const metricIps = document.getElementById('metric-ips');
const clientBadge = document.getElementById('client-badge');
const clientsContainer = document.getElementById('clients-container');
const consoleStream = document.getElementById('console-stream');
const broadcastInput = document.getElementById('broadcast-input');
const broadcastBtn = document.getElementById('broadcast-btn');
const clearLogsBtn = document.getElementById('clear-logs-btn');
const serverStatusText = document.getElementById('server-status-text');

let clientsMap = new Map();
let messageCount = 0;

function appendLog(text, type = 'system') {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  const now = new Date().toTimeString().split(' ')[0];
  line.textContent = `[${now}] ${text}`;
  consoleStream.appendChild(line);
  consoleStream.scrollTop = consoleStream.scrollHeight;
}

function updateClientsUI() {
  const count = clientsMap.size;
  metricClients.textContent = count;
  clientBadge.textContent = `${count} Active`;

  if (count === 0) {
    clientsContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📱</span>
        <p>No Android Hub nodes connected yet.</p>
        <p class="empty-hint">Launch Android module or connect to <code>ws://&lt;your-ip&gt;:8123</code></p>
      </div>
    `;
    return;
  }

  clientsContainer.innerHTML = '';
  clientsMap.forEach((client) => {
    const row = document.createElement('div');
    row.className = 'client-row';
    row.innerHTML = `
      <div class="client-meta">
        <span class="client-name">${client.id}</span>
        <span class="client-time">Remote IP: ${client.ip} | Connected: ${new Date(client.connectedAt).toLocaleTimeString()}</span>
      </div>
      <span class="client-tag">HUB NODE</span>
    `;
    clientsContainer.appendChild(row);
  });
}

// Initial fetch from main
if (window.syncEngine) {
  window.syncEngine.getServerInfo().then((info) => {
    metricPort.textContent = info.port;
    metricProtocol.textContent = `ws://0.0.0.0:${info.port}`;
    metricMessages.textContent = info.totalMessages;

    if (info.localIps && info.localIps.length > 0) {
      metricIps.innerHTML = info.localIps
        .map((item) => `<span class="ip-tag">${item.address}</span>`)
        .join('');
    }
  });

  // Event Listeners from WebSocket Server via IPC
  window.syncEngine.onServerStatus((data) => {
    if (data.status === 'ONLINE') {
      serverStatusText.textContent = `PORT :${data.port} ONLINE`;
      appendLog(`WebSocket Server initialized on port ${data.port}`, 'system');
      if (data.localIps) {
        metricIps.innerHTML = data.localIps
          .map((item) => `<span class="ip-tag">${item.address}</span>`)
          .join('');
      }
    } else {
      serverStatusText.textContent = `PORT :${data.port} ERROR`;
      appendLog(`WebSocket Server error: ${data.error}`, 'error');
    }
  });

  window.syncEngine.onClientConnected((data) => {
    clientsMap.set(data.client.id, data.client);
    updateClientsUI();
    appendLog(`[CONNECT] Android / Hub client connected: ${data.client.id} (${data.client.ip})`, 'inbound');
  });

  window.syncEngine.onClientDisconnected((data) => {
    clientsMap.delete(data.clientId);
    updateClientsUI();
    appendLog(`[DISCONNECT] Client disconnected: ${data.clientId}`, 'warning');
  });

  window.syncEngine.onMessageReceived((data) => {
    messageCount = data.totalMessages;
    metricMessages.textContent = messageCount;
    appendLog(`[RECV ${data.clientId}] ${JSON.stringify(data.payload)}`, 'inbound');
  });

  window.syncEngine.onMessageSent((data) => {
    appendLog(`[BROADCAST -> ${data.target}] (${data.sentCount} clients): ${JSON.stringify(data.payload)}`, 'outbound');
  });

  // Actions
  broadcastBtn.addEventListener('click', async () => {
    const text = broadcastInput.value.trim();
    if (!text) return;
    try {
      await window.syncEngine.broadcastMessage(text);
    } catch (err) {
      appendLog(`Failed to broadcast: ${err.message}`, 'error');
    }
  });

  clearLogsBtn.addEventListener('click', () => {
    consoleStream.innerHTML = '';
    appendLog('Console stream cleared.', 'system');
  });
}
