package com.barrantes.widget

import android.content.Context
import android.widget.RemoteViews

class HourWidgetProvider : SyncWidgetProvider() {
    override fun views(context: Context, id: Int): RemoteViews {
        return RemoteViews(context.packageName, R.layout.widget_hour)
    }
}
