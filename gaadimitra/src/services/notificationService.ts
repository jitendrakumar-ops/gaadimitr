import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onTokenRefresh,
  getAPNSToken,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  AuthorizationStatus,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import { authService, STORAGE_KEYS } from './authService';
import { storageService } from './storage';
import { toast } from '../components/common/ToastNotification';
import { displayHeadsUpNotification, requestNotificationPermission } from '../utils/notificationUtil';

class NotificationService {
  private isInitialized = false;
  private unsubscribeTokenRefresh: (() => void) | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;

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
        try {
          await storageService.ready();
          return storageService.getString(STORAGE_KEYS.DEVICE_TOKEN) || null;
        } catch {
          return null;
        }
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
          await storageService.ready();
          storageService.setString(STORAGE_KEYS.DEVICE_TOKEN, fcmToken);
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
      await storageService.ready();
      return storageService.getString(STORAGE_KEYS.DEVICE_TOKEN) || null;
    } catch {
      return null;
    }
  }

  /**
   * Primary entry point when user is logged in:
   * Gets device token and saves to backend (/auth/device-token)
   */
  async syncDeviceToken(): Promise<string | null> {
    try {
      await storageService.ready();
      const stored = authService.getStoredAuth();

      // Only sync if user is logged in
      if (!stored.accessToken) {
        if (__DEV__) {
          console.log('ℹ️ [NotificationService] User not logged in, skipping device-token sync.');
        }
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

  private messageListeners: ((remoteMessage: RemoteMessage) => void)[] = [];

  /**
   * Subscribe to incoming notifications (foreground / data messages)
   * Returns an unsubscribe function.
   */
  addListener(listener: (remoteMessage: RemoteMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener);
    };
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
              await storageService.ready();
              storageService.setString(STORAGE_KEYS.DEVICE_TOKEN, newToken);
            } catch {}

            const stored = authService.getStoredAuth();
            if (stored.accessToken) {
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

          const notif = remoteMessage.notification;
          const data = (remoteMessage.data || {}) as Record<string, any>;
          const title = notif?.title || data.title || 'GaadiMitra';
          const body = notif?.body || data.body || data.message || '';

          // Display Notifee heads-up notification
          try {
            const notificationId = remoteMessage.messageId || data.notificationId || String(Date.now());
            await displayHeadsUpNotification(
              title,
              body || 'You have a new update',
              notificationId,
              data
            );
          } catch (notifErr) {
            if (__DEV__) {
              console.warn('⚠️ [NotificationService] Notifee display error:', notifErr);
            }
          }

          if (body && typeof body === 'string') {
            const isAccepted =
              data.type === 'booking_accepted' ||
              title.toLowerCase().includes('accept') ||
              body.toLowerCase().includes('accept');

            if (isAccepted) {
              toast.showSuccess(body, title, 5000);
            } else {
              toast.showInfo(body, title, 4000);
            }
          }

          // Notify all custom active screen listeners
          this.messageListeners.forEach((listener) => {
            try {
              listener(remoteMessage);
            } catch (err) {
              if (__DEV__) {
                console.warn('⚠️ [NotificationService] Listener error:', err);
              }
            }
          });
        });
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn('⚠️ [NotificationService] Error setting onMessage listener:', err?.message || err);
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
    this.messageListeners = [];
    this.isInitialized = false;
  }
}

export const notificationService = new NotificationService();
