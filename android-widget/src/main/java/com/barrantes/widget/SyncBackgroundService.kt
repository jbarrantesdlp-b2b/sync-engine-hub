package com.barrantes.widget

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.sun.net.httpserver.HttpServer
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpExchange
import java.io.IOException
import java.net.InetSocketAddress

class SyncBackgroundService : Service() {
    private var server: HttpServer? = null
    private val TAG = "SyncBackgroundService"

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Inicializando servidor HTTP nativo en segundo plano")
        if (server == null) {
            try {
                // Abre el puerto 8080 en el dispositivo móvil para recibir el push directo de la hora
                server = HttpServer.create(InetSocketAddress(8080), 0)
                server?.createContext("/sync", TimeSyncHandler())
                server?.executor = null
                server?.start()
                Log.d(TAG, "Servidor web del widget activo en el puerto 8080")
            } catch (e: IOException) {
                Log.e(TAG, "Error fatal al abrir el socket HTTP nativo: ${e.message}")
            }
        }
        return START_STICKY
    }

    private class TimeSyncHandler : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            if ("POST" == exchange.requestMethod) {
                val response = "{\"status\":\"synced\"}"
                exchange.sendResponseHeaders(200, response.length.toLong())
                val os = exchange.responseBody
                os.write(response.toByteArray())
                os.close()
                Log.d("TimeSyncHandler", "Push de datos procesado con éxito en el widget")
            } else {
                exchange.sendResponseHeaders(405, -1)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        server?.stop(0)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
