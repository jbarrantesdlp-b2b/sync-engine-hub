package com.barrantes.syncengine.complication

import android.app.Service
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.barrantes.syncengine.SyncPaths
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable

/**
 * Custom complications. They only supply data.
 * The watch face draws the slot. No value means an empty slot, never a fake number.
 */
private fun Service.readInt(path: String, key: String): Int? {
    val buffer = Tasks.await(Wearable.getDataClient(this).dataItems)
    try {
        for (index in 0 until buffer.count) {
            val item = buffer.get(index)
            if (item.uri.path == path) {
                return DataMapItem.fromDataItem(item).dataMap.getInt(key, -1).takeIf { it >= 0 }
            }
        }
        return null
    } finally {
        buffer.release()
    }
}

class PhoneBatteryComplicationService : SuspendingComplicationDataSourceService() {
    override fun getPreviewData(type: ComplicationType): ComplicationData? =
        when (type) {
            ComplicationType.RANGED_VALUE -> ranged(78)
            ComplicationType.SHORT_TEXT -> text("78%")
            else -> null
        }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        val level = readInt(SyncPaths.PHONE_BATTERY, "level")
        return when (request.complicationType) {
            ComplicationType.RANGED_VALUE -> level?.let(::ranged) ?: NoDataComplicationData()
            ComplicationType.SHORT_TEXT -> level?.let { text("$it%") } ?: NoDataComplicationData()
            else -> NoDataComplicationData()
        }
    }
}

class LinkStatusComplicationService : SuspendingComplicationDataSourceService() {
    override fun getPreviewData(type: ComplicationType) = text("Sync")

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        if (request.complicationType != ComplicationType.SHORT_TEXT) return NoDataComplicationData()
        return when (readInt(SyncPaths.LINK, "online")) {
            1 -> text("Sync")
            0 -> text("Sin red")
            else -> NoDataComplicationData()
        }
    }
}

class StepsComplicationService : SuspendingComplicationDataSourceService() {
    override fun getPreviewData(type: ComplicationType) = text("—")

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        if (request.complicationType != ComplicationType.SHORT_TEXT) return NoDataComplicationData()
        val steps = readInt(SyncPaths.STEPS, "count") ?: return NoDataComplicationData()
        return text(steps.toString())
    }
}

private fun text(value: String) = ShortTextComplicationData.Builder(
    text = PlainComplicationText.Builder(value).build(),
    contentDescription = PlainComplicationText.Builder(value).build(),
).build()

private fun ranged(level: Int) = RangedValueComplicationData.Builder(
    value = level.toFloat(),
    min = 0f,
    max = 100f,
    contentDescription = PlainComplicationText.Builder("Batería $level").build(),
).setText(PlainComplicationText.Builder("$level%").build()).build()
