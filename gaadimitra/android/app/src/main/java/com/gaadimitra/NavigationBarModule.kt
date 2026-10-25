package com.gaadimitra

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.WindowInsetsController
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NavigationBarModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NavigationBarModule"

    @ReactMethod
    fun setColor(colorHex: String, isLight: Boolean) {
        val activity: Activity? = reactApplicationContext.currentActivity
        if (activity == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        activity.runOnUiThread {
            try {
                val window = activity.window
                window.navigationBarColor = Color.parseColor(colorHex)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    window.isNavigationBarContrastEnforced = false
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    val controller = window.insetsController
                    if (isLight) {
                        controller?.setSystemBarsAppearance(
                            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
                        )
                    } else {
                        controller?.setSystemBarsAppearance(
                            0,
                            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
                        )
                    }
                } else {
                    @Suppress("DEPRECATION")
                    var flags = window.decorView.systemUiVisibility
                    flags = if (isLight) {
                        flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                    } else {
                        flags and View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
                    }
                    @Suppress("DEPRECATION")
                    window.decorView.systemUiVisibility = flags
                }
            } catch (e: Exception) {
                // Ignore parse errors
            }
        }
    }
}
