package com.barrantes.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class WidgetHourProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            // Resolución canónica del layout del widget de reloj de energía
            val views = RemoteViews(context.packageName, R.layout.widget_hour)
            
            // Intent para forzar la actualización táctil nativa
            val syncIntent = Intent(context, WidgetHourProvider::class.java).apply {
                action = "com.barrantes.widget.ACTION_FORCE_SYNC"
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, 0, syncIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // Vincular el evento de clic al TextClock principal de la hora
            views.setOnClickPendingIntent(R.id.widget_clock_hour, pendingIntent)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.barrantes.widget.ACTION_FORCE_SYNC" || intent.action == "android.appwidget.action.APPWIDGET_UPDATE") {
            // Inicializar el receptor nativo de sincronización
            val serviceIntent = Intent(context, SyncBackgroundService::class.java)
            context.startService(serviceIntent)
        }
    }
}
