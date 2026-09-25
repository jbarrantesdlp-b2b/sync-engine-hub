package com.barrantes.syncengine

/** Data Layer paths. The phone writes them; the watch only reads. */
object SyncPaths {
    const val PHONE_BATTERY = "/sync/phone-battery"
    const val LINK = "/sync/link"
    const val STEPS = "/sync/steps"
    const val CONFIG = "/sync/config"
}
