package com.barrantes.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.provider.Settings
import android.widget.RemoteViews

class DashWidgetProvider : SyncWidgetProvider() {
    override fun views(context: Context, id: Int): RemoteViews {
        val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val max = audio.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1)
        val volume = audio.getStreamVolume(AudioManager.STREAM_MUSIC) * 100 / max
        val raw = Settings.System.getInt(context.contentResolver, Settings.System.SCREEN_BRIGHTNESS, -1)
        val bright = if (raw < 0) -1 else (raw * 100 / 255).coerceIn(0, 100)
        val ids = AppWidgetManager.getInstance(context)
            .getAppWidgetIds(ComponentName(context, DashWidgetProvider::class.java))
        val refresh = Intent(context, DashWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        }
        val pending = PendingIntent.getBroadcast(
            context,
            3,
            refresh,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return RemoteViews(context.packageName, R.layout.widget_dash).apply {
            setProgressBar(R.id.volume_bar, 100, volume, false)
            setTextViewText(R.id.volume_value, volume.toString())
            if (bright < 0) {
                setProgressBar(R.id.bright_bar, 100, 0, false)
                setTextViewText(R.id.bright_value, "—")
            } else {
                setProgressBar(R.id.bright_bar, 100, bright, false)
                setTextViewText(R.id.bright_value, bright.toString())
            }
            setOnClickPendingIntent(R.id.dash_root, pending)
        }
    }
}
