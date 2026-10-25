import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
  getAPNSToken,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  AuthorizationStatus,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { authService } from './authService';
import { storageService } from './storage';
import { displayHeadsUpNotification, requestNotificationPermission } from '../utils/notificationUtil';

type NotificationListener = (data: Record<string, string>) => void;

/**
 * Helper to determine if a notification payload represents a ride / booking request
 */
export const isRideRequestNotification = (data?: Record<string, string> | any): boolean => {
  if (!data) return false;
  const type = String(data.type || '').trim().toLowerCase();

  // Non-request types must NEVER be treated as incoming ride requests
  if (
    type.includes('payment') ||
    type.includes('cancel') ||
    type.includes('complete') ||
    type.includes('chat') ||
    type.includes('status')
  ) {
    return false;
  }

  // Only allowed request types
  if (
    type === 'request' ||
    type === 'booking_request' ||
    type === 'ride_request' ||
    type === 'new_booking' ||
    type === 'new_booking_request' ||
    type === 'ride_booking_request' ||
    type.includes('request') ||
    type.includes('booking')
  ) {
    return true;
  }

  // Fallback: If type is missing or generic, but booking details are present
  if ((data.bookingId || data._id) && (data.pickupAddress || data.fare)) {
    return true;
  }

  return false;
};

/**
 * Helper to determine if a notification payload represents a ride cancellation
 */
export const isRideCancelledNotification = (data?: Record<string, string> | any): boolean => {
  if (!data) return false;
  const type = String(data.type || '').trim().toLowerCase();
  return (
    type.includes('cancel') ||
    type === 'booking_cancelled' ||
    type === 'ride_cancelled' ||
    type === 'ride_cancel' ||
    type === 'trip_cancelled' ||
    type === 'ride_request_cancelled'
  );
};

class NotificationService {
  private isInitialized = false;
  private unsubscribeTokenRefresh: (() => void) | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;
  private unsubscribeOnNotificationOpenedApp: (() => void) | null = null;
  private rideRequestListeners: Set<NotificationListener> = new Set();
  private paymentReceivedListeners: Set<NotificationListener> = new Set();
  private rideCancelledListeners: Set<NotificationListener> = new Set();

  /**
   * Register a listener to receive ride cancelled notifications
   */
  onRideCancelled(listener: NotificationListener): () => void {
    this.rideCancelledListeners.add(listener);
    return () => this.rideCancelledListeners.delete(listener);
  }

  private notifyRideCancelledListeners(data: Record<string, string>) {
    this.rideCancelledListeners.forEach((l) => l(data));
  }

  /**
   * Save a pending ride request into local storage with timestamp
   */
  savePendingRideRequest(data: Record<string, string>): void {
    try {
      if (!isRideRequestNotification(data)) return;
      storageService.setObject('pending_ride_request', {
        ...data,
        receivedAt: Date.now(),
      });
      if (__DEV__) {
        console.log('💾 [NotificationService] Saved pending ride request to storage:', data);
      }
    } catch (err) {
      console.warn('⚠️ [NotificationService] Failed to save pending ride request:', err);
    }
  }

  /**
   * Retrieve active pending ride request from local storage if not expired
   * Kept active for up to 15 minutes (900,000 ms)
   */
  getPendingRideRequest(): Record<string, string> | null {
    try {
      const pending = storageService.getObject<any>('pending_ride_request');
      if (!pending) return null;

      const receivedAt = Number(pending.receivedAt) || 0;
      const now = Date.now();
      const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

      if (receivedAt > 0 && now - receivedAt > MAX_AGE_MS) {
        if (__DEV__) {
          console.log('⏳ [NotificationService] Pending ride request expired, clearing storage');
        }
        this.clearPendingRideRequest();
        return null;
      }

      return pending;
    } catch (err) {
      console.warn('⚠️ [NotificationService] Error getting pending ride request:', err);
      return null;
    }
  }

  /**
   * Clear pending ride request from storage
   */
  clearPendingRideRequest(): void {
    try {
      storageService.delete('pending_ride_request');
      if (__DEV__) {
        console.log('🗑️ [NotificationService] Cleared pending ride request from storage');
      }
    } catch (err) {
      console.warn('⚠️ [NotificationService] Error clearing pending ride request:', err);
    }
  }

  /**
   * Register a listener to receive incoming ride request notifications
   */
  onRideRequest(listener: NotificationListener): () => void {
    this.rideRequestListeners.add(listener);
    return () => this.rideRequestListeners.delete(listener);
  }

  private notifyRideRequestListeners(data: Record<string, string>) {
    this.rideRequestListeners.forEach((l) => l(data));
  }

  /**
   * Register a listener to receive payment received notifications
   */
  onPaymentReceived(listener: NotificationListener): () => void {
    this.paymentReceivedListeners.add(listener);
    return () => this.paymentReceivedListeners.delete(listener);
  }

  private notifyPaymentReceivedListeners(data: Record<string, string>) {
    this.paymentReceivedListeners.forEach((l) => l(data));
  }

  /**
   * Safe getter for Firebase messaging instance to prevent crashes if native module isn't loaded
   */
  private getMessagingInstance() {
    try {
      if (typeof getMessaging === 'function') {
        return getMessaging();
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('⚠️ [NotificationService] Firebase messaging module not available yet:', err?.message || err);
      }
    }
    return null;
  }

  /**
   * Request push notification permissions (Android 13+ POST_NOTIFICATIONS & iOS)
   */
  async requestPermission(): Promise<boolean> {
    try {
      await requestNotificationPermission();

      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        if (typeof androidVersion === 'number' && androidVersion >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }

      if (Platform.OS === 'ios') {
        const messaging = this.getMessagingInstance();
        if (!messaging) return false;
        const authStatus = await requestPermission(messaging);
        return (
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('⚠️ [NotificationService] Permission request failed:', err?.message || err);
      }
    }
    return false;
  }

  /**
   * Retrieve current FCM device token safely
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      await this.requestPermission();
      const messaging = this.getMessagingInstance();

      if (!messaging) {
        return storageService.getString('device_token') || null;
      }

      if (Platform.OS === 'ios') {
        const apnsToken = await getAPNSToken(messaging);
        if (!apnsToken) {
          if (__DEV__) {
            console.log('ℹ️ [NotificationService] APNS token not available yet.');
          }
          return null;
        }

        if (!isDeviceRegisteredForRemoteMessages(messaging)) {
          await registerDeviceForRemoteMessages(messaging);
        }
      }

      const fcmToken = await getToken(messaging);
      if (fcmToken) {
        if (__DEV__) {
          console.log('📲 [NotificationService] FCM Device Token obtained:', fcmToken);
        }
        try {
          storageService.setString('device_token', fcmToken);
        } catch {}
        return fcmToken;
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('⚠️ [NotificationService] Error getting FCM token:', err?.message || err);
      }
    }

    // Fallback: return cached device token if present
    try {
      return storageService.getString('device_token') || null;
    } catch {
      return null;
    }
  }

  /**
   * Primary entry point when driver logs in or opens the app:
   * Gets device token and saves to backend (/auth/device-token)
   */
  async syncDeviceToken(): Promise<string | null> {
    try {
      const token = storageService.getString('auth_token');

      // Only sync with backend if driver is logged in
      if (!token) {
        if (__DEV__) {
          console.log('ℹ️ [NotificationService] Driver not logged in yet. Pre-fetching token for local cache.');
        }
        await this.getDeviceToken();
        return null;
      }

      const deviceToken = await this.getDeviceToken();
      if (deviceToken) {
        await authService.updateDeviceToken(deviceToken);
        return deviceToken;
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('❌ [NotificationService] syncDeviceToken failed:', err?.message || err);
      }
    }
    return null;
  }

  /**
   * Setup listeners for token refresh and foreground push notifications
   */
  setupListeners() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen for FCM token refresh
    try {
      const messaging = this.getMessagingInstance();
      if (messaging) {
        this.unsubscribeTokenRefresh = onTokenRefresh(messaging, async (newToken: string) => {
          if (__DEV__) {
            console.log('🔄 [NotificationService] FCM Token refreshed:', newToken);
          }
          if (newToken) {
            try {
              storageService.setString('device_token', newToken);
            } catch {}

            const token = storageService.getString('auth_token');
            if (token) {
              await authService.updateDeviceToken(newToken);
            }
          }
        });
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('⚠️ [NotificationService] Error setting onTokenRefresh listener:', err?.message || err);
      }
    }

    // Listen for incoming foreground messages
    try {
      const messaging = this.getMessagingInstance();
      if (messaging) {
        this.unsubscribeOnMessage = onMessage(messaging, async (remoteMessage: RemoteMessage) => {
          if (__DEV__) {
            console.log('🔔 [NotificationService] Foreground message received:', remoteMessage);
          }
          // Strictly forward based on notification type
          const data = (remoteMessage.data || {}) as Record<string, string>;

          // Display heads-up notification banner via Notifee
          try {
            const notifType = String(data.type || '').trim().toLowerCase();
            const title =
              remoteMessage.notification?.title ||
              data.title ||
              (isRideRequestNotification(data)
                ? 'New Ride Request 🚖'
                : notifType.includes('payment')
                ? 'Payment Received 💰'
                : 'Gaadimitra Driver');

            const body =
              remoteMessage.notification?.body ||
              data.body ||
              data.message ||
              (notifType.includes('payment')
                ? `₹${data.amount || ''} payment received for #${data.bookingNumber || ''}`
                : data.pickupAddress
                ? `${data.pickupAddress} ➔ ${data.dropAddress || ''}`
                : 'You have a new update');

            const notificationId = remoteMessage.messageId || data.notificationId || String(Date.now());

            await displayHeadsUpNotification(title, body, notificationId, data);
          } catch (notifErr) {
            console.warn('⚠️ [NotificationService] Failed to display Notifee notification:', notifErr);
          }

          if (isRideRequestNotification(data)) {
            if (__DEV__) {
              console.log('🚖 [NotificationService] Valid ride request notification:', data);
            }
            this.savePendingRideRequest(data);
            this.notifyRideRequestListeners(data);
          } else if (isRideCancelledNotification(data)) {
            if (__DEV__) {
              console.log('❌ [NotificationService] Ride cancelled notification received:', data);
            }
            this.clearPendingRideRequest();
            this.notifyRideCancelledListeners(data);
          } else {
            const notifType = String(data.type || '').trim().toLowerCase();
            if (notifType === 'booking_payment_received' || notifType.includes('payment')) {
              if (__DEV__) {
                console.log('💰 [NotificationService] Payment received notification:', data);
              }
              this.notifyPaymentReceivedListeners(data);
            } else {
              if (__DEV__) {
                console.log('ℹ️ [NotificationService] Ignored non-request notification type:', data.type);
              }
            }
          }
        });

        // 3. Listen for notification opened while app was in background
        this.unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage: RemoteMessage) => {
          if (__DEV__) {
            console.log('📱 [NotificationService] onNotificationOpenedApp received:', remoteMessage);
          }
          const data = (remoteMessage?.data || {}) as Record<string, string>;
          if (isRideRequestNotification(data)) {
            this.savePendingRideRequest(data);
            this.notifyRideRequestListeners(data);
          } else if (isRideCancelledNotification(data)) {
            this.clearPendingRideRequest();
            this.notifyRideCancelledListeners(data);
          }
        });

        // 4. Check if app was opened from completely quit state by tapping notification
        getInitialNotification(messaging).then((remoteMessage) => {
          if (remoteMessage) {
            if (__DEV__) {
              console.log('🚀 [NotificationService] getInitialNotification received:', remoteMessage);
            }
            const data = (remoteMessage.data || {}) as Record<string, string>;
            if (isRideRequestNotification(data)) {
              this.savePendingRideRequest(data);
              this.notifyRideRequestListeners(data);
            } else if (isRideCancelledNotification(data)) {
              this.clearPendingRideRequest();
              this.notifyRideCancelledListeners(data);
            }
          }
        }).catch((err) => {
          console.warn('⚠️ [NotificationService] getInitialNotification error:', err);
        });
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('⚠️ [NotificationService] Error setting onMessage listener:', err?.message || err);
      }
    }

    // 5. Notifee local notification events (when driver taps heads-up banner or notification in tray)
    try {
      notifee.getInitialNotification().then((initialNotifee) => {
        if (initialNotifee?.notification?.data) {
          const data = initialNotifee.notification.data as Record<string, string>;
          if (isRideRequestNotification(data)) {
            this.savePendingRideRequest(data);
            this.notifyRideRequestListeners(data);
          } else if (isRideCancelledNotification(data)) {
            this.clearPendingRideRequest();
            this.notifyRideCancelledListeners(data);
          }
        }
      }).catch(() => {});

      notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS && detail?.notification?.data) {
          const data = detail.notification.data as Record<string, string>;
          if (isRideRequestNotification(data)) {
            this.savePendingRideRequest(data);
            this.notifyRideRequestListeners(data);
          } else if (isRideCancelledNotification(data)) {
            this.clearPendingRideRequest();
            this.notifyRideCancelledListeners(data);
          }
        }
      });
    } catch (notifeeErr) {
      if (__DEV__) {
        console.warn('⚠️ [NotificationService] Notifee events error:', notifeeErr);
      }
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.unsubscribeTokenRefresh) {
      this.unsubscribeTokenRefresh();
      this.unsubscribeTokenRefresh = null;
    }
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
      this.unsubscribeOnMessage = null;
    }
    if (this.unsubscribeOnNotificationOpenedApp) {
      this.unsubscribeOnNotificationOpenedApp();
      this.unsubscribeOnNotificationOpenedApp = null;
    }
    this.isInitialized = false;
  }
}

export const notificationService = new NotificationService();
