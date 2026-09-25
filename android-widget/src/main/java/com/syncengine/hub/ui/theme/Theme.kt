package com.syncengine.hub.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val OledDarkColorScheme = darkColorScheme(
    primary = NeonCyan,
    onPrimary = OledBlack,
    secondary = NeonEmerald,
    onSecondary = OledBlack,
    tertiary = NeonPurple,
    background = OledBlack,
    onBackground = TextPrimary,
    surface = OledSurface,
    onSurface = TextPrimary,
    surfaceVariant = OledCard,
    onSurfaceVariant = TextSecondary,
    outline = OledBorder,
    error = NeonRed
)

@Composable
fun SyncEngineHubTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = OledDarkColorScheme,
        typography = Typography,
        content = content
    )
}
