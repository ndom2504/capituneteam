package com.example.capitune.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = White,
    onPrimary = Black,
    secondary = LightGrey,
    onSecondary = White,
    background = Black,
    onBackground = PrimaryTextDark,
    surface = Black,
    onSurface = PrimaryTextDark,
    outline = BorderGreyDark
)

private val LightColorScheme = lightColorScheme(
    primary = Black,
    onPrimary = White,
    secondary = DarkGrey,
    onSecondary = White,
    background = White,
    onBackground = PrimaryTextLight,
    surface = White,
    onSurface = PrimaryTextLight,
    outline = BorderGreyLight
)

@Composable
fun CapituneTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Disable dynamic color to maintain the minimalist black/white brand identity
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
