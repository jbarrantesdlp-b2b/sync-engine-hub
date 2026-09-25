package com.syncengine.hub.widget

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object HubWidgetUpdater {

    fun updateState(
        context: Context,
        status: String = "P2P 8123",
        latency: String = "12ms",
        batteryPct: String? = null
    ) {
        val timeNow = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val actualBattery = batteryPct ?: "${getDeviceBattery(context)}%"

        CoroutineScope(Dispatchers.IO).launch {
            val glanceManager = GlanceAppWidgetManager(context)
            val glanceIds = glanceManager.getGlanceIds(HubGlanceWidget::class.java)

            glanceIds.forEach { glanceId ->
                updateAppWidgetState(context, glanceId) { prefs ->
                    prefs[HubGlanceWidget.KEY_SYNC_STATUS] = status
                    prefs[HubGlanceWidget.KEY_LAST_SYNC_TIME] = timeNow
                    prefs[HubGlanceWidget.KEY_LATENCY] = latency
                    prefs[HubGlanceWidget.KEY_BATTERY_PCT] = actualBattery
                }
                HubGlanceWidget().update(context, glanceId)
            }
        }
    }

    fun getDeviceBattery(context: Context): Int {
        return try {
            val batteryStatus: Intent? = context.registerReceiver(
                null,
                IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            )
            val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            if (level >= 0 && scale > 0) (level * 100 / scale) else 100
        } catch (e: Exception) {
            100
        }
    }
}
