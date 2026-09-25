package com.barrantes.widget

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.IOException

object WidgetFiles {
    fun write(context: Context, name: String, text: String) {
        val dest = file(context, name)
        val tmp = File(dest.parentFile, dest.name + ".tmp")
        tmp.writeText(text)
        if (!tmp.renameTo(dest)) {
            dest.writeText(text)
            tmp.delete()
        }
    }

    fun read(context: Context, name: String): String? {
        val dest = file(context, name)
        if (!dest.exists()) return null
        return dest.readText()
    }

    fun importMedia(context: Context, source: Uri, name: String): File? {
        if (source.scheme != "content") return null
        return try {
            val dest = file(context, name)
            context.contentResolver.openInputStream(source).use { input ->
                if (input == null) return null
                dest.outputStream().use { output -> input.copyTo(output) }
            }
            dest
        } catch (_: SecurityException) {
            null
        } catch (_: IOException) {
            null
        }
    }

    private fun file(context: Context, name: String): File {
        val clean = name.substringAfterLast('/').substringAfterLast('\\')
        require(clean.isNotEmpty() && clean != "." && clean != "..")
        val dir = File(context.filesDir, "widget").apply { mkdirs() }
        val dest = File(dir, clean)
        require(dest.canonicalFile.parentFile == dir.canonicalFile)
        return dest
    }
}
