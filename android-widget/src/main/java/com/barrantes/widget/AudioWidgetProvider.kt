package com.barrantes.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class AudioWidgetProvider : SyncWidgetProvider() {
    override fun views(context: Context, id: Int): RemoteViews {
        val ids = AppWidgetManager.getInstance(context)
            .getAppWidgetIds(ComponentName(context, AudioWidgetProvider::class.java))
        val refresh = Intent(context, AudioWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        }
        val pending = PendingIntent.getBroadcast(
            context,
            2,
            refresh,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return RemoteViews(context.packageName, R.layout.widget_audio).apply {
            setTextViewText(R.id.audio_title, "Sin sesión")
            setTextViewText(R.id.audio_artist, "—")
            setTextViewText(R.id.audio_prev, "Anterior")
            setTextViewText(R.id.audio_play, "Play")
            setTextViewText(R.id.audio_next, "Siguiente")
            setOnClickPendingIntent(R.id.audio_play, pending)
        }
    }
}
