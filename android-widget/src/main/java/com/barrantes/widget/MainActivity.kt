package com.barrantes.widget

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Cable
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.syncengine.hub.sync.ConnectionStatus
import com.syncengine.hub.sync.HubWebSocketManager
import com.syncengine.hub.sync.SyncLogEntry
import com.syncengine.hub.ui.theme.NeonAmber
import com.syncengine.hub.ui.theme.NeonCyan
import com.syncengine.hub.ui.theme.NeonEmerald
import com.syncengine.hub.ui.theme.NeonPurple
import com.syncengine.hub.ui.theme.NeonRed
import com.syncengine.hub.ui.theme.OledBlack
import com.syncengine.hub.ui.theme.OledBorder
import com.syncengine.hub.ui.theme.OledCard
import com.syncengine.hub.ui.theme.OledCardElevated
import com.syncengine.hub.ui.theme.OledSurface
import com.syncengine.hub.ui.theme.SyncEngineHubTheme
import com.syncengine.hub.ui.theme.TextMuted
import com.syncengine.hub.ui.theme.TextPrimary
import com.syncengine.hub.ui.theme.TextSecondary
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {

    private val wsManager = HubWebSocketManager()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            SyncEngineHubTheme {
                OledHubScreen(wsManager = wsManager)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        wsManager.disconnect()
    }
}

@Composable
fun OledHubScreen(wsManager: HubWebSocketManager) {
    val status by wsManager.status.collectAsState()
    val lastPingLatency by wsManager.lastPingLatency.collectAsState()
    val packetsReceived by wsManager.packetsReceived.collectAsState()
    val packetsSent by wsManager.packetsSent.collectAsState()
    val logs by wsManager.logs.collectAsState()

    var hostInput by remember { mutableStateOf("192.168.1.49") }
    var portInput by remember { mutableStateOf("8123") }

    val listState = rememberLazyListState()

    LaunchedEffect(logs.size) {
        if (logs.isNotEmpty()) {
            listState.animateScrollToItem(logs.size - 1)
        }
    }

    Scaffold(
        containerColor = OledBlack
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Header Bar
            HubHeader(status = status)

            Spacer(modifier = Modifier.height(14.dp))

            // Telemetry Cards Row
            TelemetryRow(
                status = status,
                latency = lastPingLatency,
                recv = packetsReceived,
                sent = packetsSent
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Connection Settings Card
            ConnectionCard(
                host = hostInput,
                port = portInput,
                status = status,
                onHostChange = { hostInput = it },
                onPortChange = { portInput = it },
                onConnectClick = {
                    val port = portInput.toIntOrNull() ?: 8123
                    if (status == ConnectionStatus.CONNECTED || status == ConnectionStatus.CONNECTING) {
                        wsManager.disconnect()
                    } else {
                        wsManager.connect(host = hostInput, port = port)
                    }
                }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Actions Strip
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { wsManager.sendPing() },
                    modifier = Modifier.weight(1f),
                    enabled = status == ConnectionStatus.CONNECTED,
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = NeonCyan
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Speed, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Ping :8123", fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                }

                OutlinedButton(
                    onClick = { wsManager.triggerSync() },
                    modifier = Modifier.weight(1f),
                    enabled = status == ConnectionStatus.CONNECTED,
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = NeonEmerald
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Trigger Sync", fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Event Console Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "REALTIME EVENT STREAM",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary,
                    letterSpacing = 1.sp
                )
                IconButton(
                    onClick = { wsManager.clearLogs() },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        Icons.Default.DeleteSweep,
                        contentDescription = "Clear Logs",
                        tint = TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Console Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(OledSurface)
                    .border(1.dp, OledBorder, RoundedCornerShape(10.dp))
                    .padding(8.dp)
            ) {
                if (logs.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            text = "Awaiting events from Desktop WebSocket node (:8123)...",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        items(logs) { entry ->
                            LogLineItem(entry)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun HubHeader(status: ConnectionStatus) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(OledCardElevated)
                    .border(1.dp, NeonCyan.copy(alpha = 0.4f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.Bolt,
                    contentDescription = null,
                    tint = NeonCyan,
                    modifier = Modifier.size(24.dp)
                )
            }

            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "SYNC ENGINE ",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "HUB",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = NeonCyan,
                        letterSpacing = 1.sp
                    )
                }
                Text(
                    text = "OLED Cyber-Node • Port 8123",
                    fontSize = 11.sp,
                    color = TextSecondary,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // Status Badge
        val (badgeColor, statusLabel) = when (status) {
            ConnectionStatus.CONNECTED -> NeonEmerald to "ONLINE"
            ConnectionStatus.CONNECTING -> NeonCyan to "CONNECTING"
            ConnectionStatus.ERROR -> NeonRed to "ERROR"
            ConnectionStatus.DISCONNECTED -> TextMuted to "OFFLINE"
        }

        Row(
            modifier = Modifier
                .clip(CircleShape)
                .background(OledCard)
                .border(1.dp, badgeColor.copy(alpha = 0.5f), CircleShape)
                .padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .scale(if (status == ConnectionStatus.CONNECTED) pulseScale else 1f)
                    .clip(CircleShape)
                    .background(badgeColor)
            )
            Text(
                text = statusLabel,
                color = badgeColor,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun TelemetryRow(
    status: ConnectionStatus,
    latency: Long?,
    recv: Int,
    sent: Int
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        MetricTile(
            title = "PORT",
            value = "8123",
            sub = "WebSocket",
            modifier = Modifier.weight(1f),
            color = NeonCyan
        )
        MetricTile(
            title = "LATENCY",
            value = if (latency != null) "${latency}ms" else "--",
            sub = "Roundtrip",
            modifier = Modifier.weight(1f),
            color = NeonEmerald
        )
        MetricTile(
            title = "RX / TX",
            value = "$recv/$sent",
            sub = "Packets",
            modifier = Modifier.weight(1f),
            color = NeonPurple
        )
    }
}

@Composable
fun MetricTile(
    title: String,
    value: String,
    sub: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = OledCard),
        shape = RoundedCornerShape(10.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(OledBorder))
    ) {
        Column(
            modifier = Modifier.padding(10.dp)
        ) {
            Text(
                text = title,
                fontFamily = FontFamily.Monospace,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 0.8.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontFamily = FontFamily.Monospace,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = sub,
                fontSize = 10.sp,
                color = TextMuted
            )
        }
    }
}

@Composable
fun ConnectionCard(
    host: String,
    port: String,
    status: ConnectionStatus,
    onHostChange: (String) -> Unit,
    onPortChange: (String) -> Unit,
    onConnectClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = OledCard),
        shape = RoundedCornerShape(12.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(OledBorder))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = "DESKTOP NODE CONNECTION",
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = host,
                    onValueChange = onHostChange,
                    label = { Text("Desktop Host IP", fontSize = 11.sp) },
                    modifier = Modifier.weight(2f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = OledBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = NeonCyan
                    )
                )

                OutlinedTextField(
                    value = port,
                    onValueChange = onPortChange,
                    label = { Text("Port", fontSize = 11.sp) },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = OledBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        cursorColor = NeonCyan
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Presets row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                PresetChip("10.0.2.2 (Emulador)") { onHostChange("10.0.2.2") }
                PresetChip("127.0.0.1 (USB adb)") { onHostChange("127.0.0.1") }
                PresetChip("192.168.1.49 (Wi-Fi)") { onHostChange("192.168.1.49") }
            }

            Spacer(modifier = Modifier.height(10.dp))

            val isConnected = status == ConnectionStatus.CONNECTED || status == ConnectionStatus.CONNECTING
            Button(
                onClick = onConnectClick,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isConnected) NeonRed else NeonCyan,
                    contentColor = OledBlack
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Cable,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isConnected) "DISCONNECT FROM PORT 8123" else "CONNECT TO DESKTOP NODE (:8123)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}

@Composable
fun PresetChip(text: String, onClick: () -> Unit) {
    Text(
        text = text,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(OledSurface)
            .border(1.dp, OledBorder, RoundedCornerShape(4.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 6.dp, vertical = 3.dp),
        color = TextSecondary,
        fontSize = 10.sp,
        fontFamily = FontFamily.Monospace
    )
}

@Composable
fun LogLineItem(entry: SyncLogEntry) {
    val tagColor = when (entry.tag) {
        "NET" -> NeonCyan
        "PONG" -> NeonEmerald
        "SYNC" -> NeonPurple
        "WARN" -> NeonAmber
        "ERR" -> NeonRed
        else -> TextSecondary
    }

    val timeFormatted = remember(entry.timestamp) {
        SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(Date(entry.timestamp))
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = timeFormatted,
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            color = TextMuted
        )
        Text(
            text = "[${entry.tag}]",
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = tagColor
        )
        Text(
            text = entry.message,
            fontFamily = FontFamily.Monospace,
            fontSize = 10.sp,
            color = if (entry.isError) NeonRed else TextPrimary,
            modifier = Modifier.weight(1f)
        )
    }
}
