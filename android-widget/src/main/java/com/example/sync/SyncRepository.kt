package com.example.sync

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException

object SyncRepository {
    private var mSocket: Socket? = null
    private const val TAG = "SyncRepository"

    fun connectToServer(gatewayUrl: String) {
        try {
            val opts = IO.Options().apply {
                transports = arrayOf("websocket")
                reconnection = true
            }
            mSocket = IO.socket(gatewayUrl, opts)
            
            mSocket?.on(Socket.EVENT_CONNECT) {
                Log.d(TAG, "Conectado de forma segura al gateway de Electron")
            }?.on("time_sync") { args ->
                val data = args as JSONObject
                Log.d(TAG, "Datos recibidos del motor local: $data")
            }
            
            mSocket?.connect()
        } catch (e: URISyntaxException) {
            Log.e(TAG, "Error crítico de inicialización de red URI: ${e.message}")
        }
    }
}
