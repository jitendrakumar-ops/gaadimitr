import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import { getMessaging, requestPermission as requestFcmPermission } from '@react-native-firebase/messaging';

/**
 * Request notification permissions across Android (including API 33+) and iOS/FCM.
 */
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
      if (apiLevel >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('[requestNotificationPermission] Android POST_NOTIFICATIONS status:', granted);
      }
    }

    // Request FCM permission if default Firebase app is initialized natively
    try {
      const apps = getApps();
      const defaultApp = apps?.find((app) => app.name === '[DEFAULT]');
      if (defaultApp) {
        const messagingInstance = getMessaging(defaultApp);
        const authStatus = await requestFcmPermission(messagingInstance);
        console.log('[requestNotificationPermission] FCM permission status:', authStatus);
      } else {
        console.log('[requestNotificationPermission] Firebase not initialized natively, skipping FCM requestPermission');
      }
    } catch (fcmErr) {
      console.warn('[requestNotificationPermission] FCM permission check failed:', fcmErr);
    }

    // Request Notifee local notification permission
    const notifeeSettings = await notifee.requestPermission();
    console.log('[requestNotificationPermission] Notifee permission settings:', notifeeSettings);
  } catch (error) {
    console.error('[requestNotificationPermission] Error requesting notification permission:', error);
  }
};

/**
 * Utility to display a heads-up (high importance) local notification using Notifee.
 * 
 * @param title Title of the notification
 * @param body Body/message content
 * @param notificationId Optional unique ID. Useful for deduplicating or updating an existing notification banner.
 * @param data Optional payload data
 */
export const displayHeadsUpNotification = async (
  title: string,
  body: string,
  notificationId?: string,
  data?: any
) => {
  try {
    // Request permission just in case
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'Gaadimitra',
      name: 'Ride Updates',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.displayNotification({
      id: notificationId,
      title,
      body,
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (err) {
    console.error('[displayHeadsUpNotification] Failed to display notification:', err);
  }
};
