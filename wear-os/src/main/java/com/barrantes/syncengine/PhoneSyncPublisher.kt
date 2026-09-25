package com.barrantes.syncengine

import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable

/**
 * Runs on the phone. Pushes only real values.
 * Steps stay unpublished until Health Connect provides a count.
 */
class PhoneSyncPublisher(private val context: android.content.Context) {
    fun publishBattery(level: Int) = put(SyncPaths.PHONE_BATTERY) { putInt("level", level.coerceIn(0, 100)) }

    fun publishLink(online: Boolean) = put(SyncPaths.LINK) { putInt("online", if (online) 1 else 0) }

    fun publishSteps(count: Int) = put(SyncPaths.STEPS) { putInt("count", count.coerceAtLeast(0)) }

    private fun put(path: String, fill: com.google.android.gms.wearable.DataMap.() -> Unit) {
        val request = PutDataMapRequest.create(path).apply {
            dataMap.fill()
            dataMap.putLong("at", System.currentTimeMillis())
        }.asPutDataRequest().setUrgent()
        Wearable.getDataClient(context).putDataItem(request)
    }
}
