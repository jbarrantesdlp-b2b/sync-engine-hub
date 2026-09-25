package com.barrantes.widget

import android.content.Context
import android.widget.RemoteViews

class OrbitWidgetProvider : SyncWidgetProvider() {
    override fun views(context: Context, id: Int): RemoteViews {
        return RemoteViews(context.packageName, R.layout.widget_clock).apply {
            setImageViewResource(R.id.orbit_halo, R.drawable.halo_track)
            setTextViewText(R.id.steps_value, "—")
            setTextViewText(R.id.weather_value, "—")
        }
    }
}
