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
            val views = RemoteViews(context.packageName, R.layout.widget_hour)
            
            val syncIntent = Intent(context, WidgetHourProvider::class.java).apply {
                action = "com.barrantes.widget.ACTION_FORCE_SYNC"
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, 0, syncIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            views.setOnClickPendingIntent(R.id.widget_clock_hour, pendingIntent)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.barrantes.widget.ACTION_FORCE_SYNC" || intent.action == "android.appwidget.action.APPWIDGET_UPDATE") {
            val serviceIntent = Intent(context, SyncBackgroundService::class.java)
            context.startService(serviceIntent)
        }
    }
}
