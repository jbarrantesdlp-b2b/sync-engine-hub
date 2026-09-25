package com.example.sync

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

class SyncBackgroundService : Service() {
    private const val TAG = "SyncBackgroundService"

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Servicio de sincronización asíncrono inicializado")
        
        // Enlace directo al bus local usando la IP de tu tarjeta Wi-Fi física
        SyncRepository.connectToServer("http://192.168.1.49:3000") 
        
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
