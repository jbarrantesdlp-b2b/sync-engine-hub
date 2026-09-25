package com.barrantes.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class AgendaWidgetProvider : SyncWidgetProvider() {
    override fun views(context: Context, id: Int): RemoteViews {
        val service = Intent(context, AgendaWidgetService::class.java).apply {
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
            data = Uri.parse(toUri(Intent.URI_INTENT_SCHEME))
        }
        val open = Intent(context, AgendaWidgetProvider::class.java).setAction(ACTION_OPEN)
        val template = PendingIntent.getBroadcast(
            context,
            0,
            open,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE,
        )
        return RemoteViews(context.packageName, R.layout.widget_agenda).apply {
            setRemoteAdapter(R.id.agenda_list, service)
            setEmptyView(R.id.agenda_list, R.id.agenda_empty)
            setPendingIntentTemplate(R.id.agenda_list, template)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_OPEN) return
        super.onReceive(context, intent)
    }

    companion object {
        const val ACTION_OPEN = "com.barrantes.widget.OPEN_AGENDA"
        const val EXTRA_ID = "agenda_id"
    }
}
