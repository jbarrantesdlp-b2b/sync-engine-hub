package com.barrantes.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.widget.RemoteViewsService

class AgendaWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory = AgendaFactory(applicationContext)
}

private class AgendaFactory(
    private val context: Context,
) : RemoteViewsService.RemoteViewsFactory {
    private var items: List<AgendaItem> = emptyList()
    private var loading = false

    override fun onCreate() = Unit

    override fun onDataSetChanged() {
        items = AgendaStore.snapshot()
        val app = context.applicationContext
        AgendaStore.refresh(app) {
            val manager = AppWidgetManager.getInstance(app)
            val ids = manager.getAppWidgetIds(ComponentName(app, AgendaWidgetProvider::class.java))
            if (ids.isNotEmpty()) manager.notifyAppWidgetViewDataChanged(ids, R.id.agenda_list)
        }
        loading = items.isEmpty() && AgendaStore.isReading()
    }

    override fun onDestroy() {
        items = emptyList()
        loading = false
    }

    override fun getCount(): Int = if (loading) 1 else items.size

    override fun getViewAt(position: Int): RemoteViews {
        if (loading) return RemoteViews(context.packageName, R.layout.widget_agenda_loading)
        val item = items[position]
        val fill = Intent().putExtra(AgendaWidgetProvider.EXTRA_ID, item.id)
        return RemoteViews(context.packageName, R.layout.widget_agenda_item).apply {
            setTextViewText(R.id.agenda_time, item.time)
            setTextViewText(R.id.agenda_title, item.title)
            setOnClickFillInIntent(R.id.agenda_row, fill)
        }
    }

    override fun getLoadingView(): RemoteViews = RemoteViews(context.packageName, R.layout.widget_agenda_loading)

    override fun getViewTypeCount(): Int = 2

    override fun getItemId(position: Int): Long = if (loading) -1L else items[position].id

    override fun hasStableIds(): Boolean = true
}
