package com.barrantes.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent
import androidx.glance.color.ColorProvider
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.ContentScale
import androidx.glance.layout.Row
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import java.time.LocalTime
import java.time.format.DateTimeFormatter

class OrbitGlanceWidget : GlanceAppWidget() {
    override val sizeMode: SizeMode = SizeMode.Responsive(
        setOf(
            DpSize(140.dp, 180.dp),
            DpSize(280.dp, 280.dp),
        ),
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val time = LocalTime.now().format(CLOCK)
        provideContent {
            Column(
                modifier = GlanceModifier.fillMaxSize().padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Image(
                    provider = ImageProvider(R.drawable.halo_track),
                    contentDescription = null,
                    modifier = GlanceModifier.fillMaxWidth(),
                    contentScale = ContentScale.Fit,
                )
                Text(text = time, style = timeStyle)
                Row(modifier = GlanceModifier.fillMaxWidth().padding(top = 8.dp)) {
                    Stat("Pasos")
                    Stat("Clima")
                }
            }
        }
    }

    private companion object {
        val CLOCK: DateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm")
        val timeStyle = TextStyle(
            color = ColorProvider(day = Color(0xFFF4F4F4), night = Color(0xFFF4F4F4)),
            fontSize = 42.sp,
            fontWeight = FontWeight.Medium,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun Stat(label: String, modifier: GlanceModifier = GlanceModifier) {
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            style = TextStyle(color = ColorProvider(day = Color(0xFF8A8A8A), night = Color(0xFF8A8A8A)), fontSize = 11.sp, textAlign = TextAlign.Center),
        )
        Text(
            text = "—",
            style = TextStyle(color = ColorProvider(day = Color(0xFFF4F4F4), night = Color(0xFFF4F4F4)), fontSize = 18.sp, textAlign = TextAlign.Center),
        )
    }
}

class OrbitGlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbitGlanceWidget()
}
