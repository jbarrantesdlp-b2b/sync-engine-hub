package com.barrantes.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

data class AgendaItem(
    val id: Long,
    val time: String,
    val title: String,
)

object AgendaStore {
    private val executor = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "agenda-factory").apply { isDaemon = true }
    }
    private val gate = Any()
    private val reading = AtomicBoolean(false)
    private var memory: List<AgendaItem> = emptyList()
    private var storedGen = 0
    private var seenGen = -1

    fun snapshot(): List<AgendaItem> = synchronized(gate) { memory.toList() }

    fun isReading(): Boolean = reading.get()

    fun refresh(context: Context, onLoaded: () -> Unit) {
        val stale = synchronized(gate) { seenGen != storedGen }
        if (!stale || !reading.compareAndSet(false, true)) return
        val app = context.applicationContext
        executor.execute {
            val loaded = read(app)
            synchronized(gate) {
                memory = loaded
                seenGen = storedGen
            }
            reading.set(false)
            onLoaded()
        }
    }

    fun save(context: Context, items: List<AgendaItem>) {
        val raw = items.joinToString("\n") { "${it.id}\t${it.time}\t${it.title.replace('\n', ' ')}" }
        WidgetFiles.write(context, "agenda.txt", raw)
        synchronized(gate) { storedGen += 1 }
        notifyWidgets(context)
    }

    private fun read(context: Context): List<AgendaItem> {
        val raw = WidgetFiles.read(context, "agenda.txt") ?: return emptyList()
        return raw.lineSequence().mapNotNull { line ->
            val parts = line.split('\t')
            if (parts.size < 3) return@mapNotNull null
            val id = parts[0].toLongOrNull() ?: return@mapNotNull null
            AgendaItem(id, parts[1], parts[2])
        }.toList()
    }

    private fun notifyWidgets(context: Context) {
        val manager = AppWidgetManager.getInstance(context)
        val ids = manager.getAppWidgetIds(ComponentName(context, AgendaWidgetProvider::class.java))
        if (ids.isNotEmpty()) manager.notifyAppWidgetViewDataChanged(ids, R.id.agenda_list)
    }
}
