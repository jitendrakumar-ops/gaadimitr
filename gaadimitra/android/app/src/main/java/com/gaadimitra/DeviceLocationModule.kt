package com.gaadimitra

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeviceLocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DeviceLocationModule"

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun getCurrentPosition(promise: Promise) {
        val locationManager =
            reactContext.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        if (locationManager == null) {
            promise.reject("UNAVAILABLE", "LocationManager service not available")
            return
        }

        try {
            val isGpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
            val isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

            val providers = listOf(
                LocationManager.GPS_PROVIDER,
                LocationManager.NETWORK_PROVIDER,
                LocationManager.PASSIVE_PROVIDER
            )

            var bestLocation: Location? = null
            for (provider in providers) {
                try {
                    val loc = locationManager.getLastKnownLocation(provider) ?: continue
                    if (bestLocation == null || loc.time > bestLocation.time) {
                        bestLocation = loc
                    }
                } catch (_: Exception) {}
            }

            val now = System.currentTimeMillis()
            // If we have a fresh location (< 60s old) with good accuracy (< 50m), return immediately
            if (bestLocation != null && (now - bestLocation.time) < 60000 && bestLocation.accuracy < 50f) {
                val result = Arguments.createMap().apply {
                    putDouble("latitude", bestLocation.latitude)
                    putDouble("longitude", bestLocation.longitude)
                    putDouble("accuracy", bestLocation.accuracy.toDouble())
                }
                promise.resolve(result)
                return
            }

            val activeProvider = when {
                isGpsEnabled -> LocationManager.GPS_PROVIDER
                isNetworkEnabled -> LocationManager.NETWORK_PROVIDER
                else -> null
            }

            if (activeProvider == null) {
                if (bestLocation != null) {
                    val result = Arguments.createMap().apply {
                        putDouble("latitude", bestLocation.latitude)
                        putDouble("longitude", bestLocation.longitude)
                        putDouble("accuracy", bestLocation.accuracy.toDouble())
                    }
                    promise.resolve(result)
                } else {
                    promise.reject("DISABLED", "GPS and Network location providers are disabled")
                }
                return
            }

            var hasResolved = false
            val listener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    if (!hasResolved) {
                        hasResolved = true
                        try {
                            locationManager.removeUpdates(this)
                        } catch (_: Exception) {}
                        val result = Arguments.createMap().apply {
                            putDouble("latitude", location.latitude)
                            putDouble("longitude", location.longitude)
                            putDouble("accuracy", location.accuracy.toDouble())
                        }
                        promise.resolve(result)
                    }
                }
                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {}
            }

            locationManager.requestLocationUpdates(
                activeProvider,
                0L,
                0f,
                listener,
                Looper.getMainLooper()
            )

            // 6-second timeout safety fallback
            android.os.Handler(Looper.getMainLooper()).postDelayed({
                if (!hasResolved) {
                    hasResolved = true
                    try {
                        locationManager.removeUpdates(listener)
                    } catch (_: Exception) {}

                    if (bestLocation != null) {
                        val result = Arguments.createMap().apply {
                            putDouble("latitude", bestLocation.latitude)
                            putDouble("longitude", bestLocation.longitude)
                            putDouble("accuracy", bestLocation.accuracy.toDouble())
                        }
                        promise.resolve(result)
                    } else {
                        promise.reject("TIMEOUT", "Location request timed out")
                    }
                }
            }, 6000)

        } catch (e: SecurityException) {
            promise.reject("PERMISSION_DENIED", e.message, e)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}
