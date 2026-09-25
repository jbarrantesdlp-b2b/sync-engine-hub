package com.syncengine.hub.sync

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit

enum class ConnectionStatus {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    ERROR
}

data class SyncLogEntry(
    val timestamp: Long = System.currentTimeMillis(),
    val tag: String,
    val message: String,
    val isError: Boolean = false
)

class HubWebSocketManager(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.IO)
) {
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .connectTimeout(5, TimeUnit.SECONDS)
        .build()

    private var activeWebSocket: WebSocket? = null

    private val _status = MutableStateFlow(ConnectionStatus.DISCONNECTED)
    val status: StateFlow<ConnectionStatus> = _status.asStateFlow()

    private val _lastPingLatency = MutableStateFlow<Long?>(null)
    val lastPingLatency: StateFlow<Long?> = _lastPingLatency.asStateFlow()

    private val _packetsReceived = MutableStateFlow(0)
    val packetsReceived: StateFlow<Int> = _packetsReceived.asStateFlow()

    private val _packetsSent = MutableStateFlow(0)
    val packetsSent: StateFlow<Int> = _packetsSent.asStateFlow()

    private val _logs = MutableStateFlow<List<SyncLogEntry>>(emptyList())
    val logs: StateFlow<List<SyncLogEntry>> = _logs.asStateFlow()

    private var pingStartTime: Long = 0L

    fun connect(host: String = "10.0.2.2", port: Int = 8123) {
        if (_status.value == ConnectionStatus.CONNECTED || _status.value == ConnectionStatus.CONNECTING) {
            return
        }

        val url = "ws://$host:$port"
        addLog("SYS", "Connecting to desktop node at $url...")
        _status.value = ConnectionStatus.CONNECTING

        val request = Request.Builder().url(url).build()
        activeWebSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                _status.value = ConnectionStatus.CONNECTED
                addLog("NET", "Connected to Desktop Server on port $port")
                // Send registration handshake
                val registerPayload = """{"type":"DEVICE_REGISTER","platform":"ANDROID_HUB","appId":"com.syncengine.hub"}"""
                sendRaw(registerPayload)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                _packetsReceived.value += 1
                if (text.contains("\"PONG\"") && pingStartTime > 0) {
                    val latency = System.currentTimeMillis() - pingStartTime
                    _lastPingLatency.value = latency
                    addLog("PONG", "Latency: ${latency}ms")
                } else {
                    addLog("RECV", text.take(120))
                }
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                _status.value = ConnectionStatus.DISCONNECTED
                addLog("NET", "Closing connection: $reason (code $code)")
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                _status.value = ConnectionStatus.DISCONNECTED
                addLog("NET", "Closed connection")
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                _status.value = ConnectionStatus.ERROR
                addLog("ERR", t.message ?: "Connection error", isError = true)
            }
        })
    }

    fun disconnect() {
        activeWebSocket?.close(1000, "User disconnected")
        activeWebSocket = null
        _status.value = ConnectionStatus.DISCONNECTED
        addLog("SYS", "Disconnected from desktop")
    }

    fun sendPing() {
        if (_status.value != ConnectionStatus.CONNECTED) {
            addLog("WARN", "Cannot send ping: Not connected to :8123")
            return
        }
        pingStartTime = System.currentTimeMillis()
        val payload = """{"type":"PING","timestamp":$pingStartTime}"""
        sendRaw(payload)
    }

    fun triggerSync() {
        if (_status.value != ConnectionStatus.CONNECTED) {
            addLog("WARN", "Cannot sync: Not connected to desktop")
            return
        }
        val timestamp = System.currentTimeMillis()
        val payload = """{"type":"SYNC_REQUEST","source":"ANDROID_HUB","timestamp":$timestamp}"""
        sendRaw(payload)
        addLog("SYNC", "Sync trigger sent to desktop")
    }

    private fun sendRaw(payload: String) {
        activeWebSocket?.let { ws ->
            val success = ws.send(payload)
            if (success) {
                _packetsSent.value += 1
            }
        }
    }

    fun clearLogs() {
        _logs.value = emptyList()
    }

    private fun addLog(tag: String, message: String, isError: Boolean = false) {
        val entry = SyncLogEntry(tag = tag, message = message, isError = isError)
        _logs.value = (_logs.value + entry).takeLast(60)
    }
}
