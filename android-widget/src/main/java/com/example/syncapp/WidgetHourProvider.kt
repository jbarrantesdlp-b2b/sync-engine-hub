package com.example.syncapp

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class WidgetHourProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            // Resolución nativa correcta usando la clase R generada
            val views = RemoteViews(context.packageName, R.layout.widget_hour)
            
            val syncIntent = Intent(context, WidgetHourProvider::class.java).apply {
                action = "com.example.syncapp.ACTION_FORCE_SYNC"
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, 0, syncIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // Resolución nativa del identificador del reloj de la hora
            views.setOnClickPendingIntent(R.id.widget_clock_hour, pendingIntent)
            
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.example.syncapp.ACTION_FORCE_SYNC") {
            val serviceIntent = Intent(context, SyncBackgroundService::class.java)
            context.startService(serviceIntent)
        }
    }
}
