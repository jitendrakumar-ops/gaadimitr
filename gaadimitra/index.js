import './global.css';
import { AppRegistry } from 'react-native';
import { startNetworkLogging } from 'react-native-network-logger';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { displayHeadsUpNotification } from './src/utils/notificationUtil';
import App from './App';
import { name as appName } from './app.json';

// Start network logging for debugging
startNetworkLogging();

// Register background message handler for FCM push notifications
try {
  const messaging = getMessaging();
  if (messaging && typeof setBackgroundMessageHandler === 'function') {
    setBackgroundMessageHandler(messaging, async (remoteMessage) => {
      if (!remoteMessage) return;
      if (__DEV__) {
        console.log('🔔 [FCM Background] Message received:', remoteMessage);
      }
      const notif = remoteMessage.notification;
      const data = remoteMessage.data || {};
      const title = notif?.title || data.title || 'GaadiMitra';
      const body = notif?.body || data.body || data.message || 'New update received';
      const notificationId = remoteMessage.messageId || data.notificationId || String(Date.now());
      await displayHeadsUpNotification(title, body, notificationId, data);
    });
  }
} catch (err) {
  if (__DEV__) {
    console.warn('⚠️ [FCM Background] Registration skipped:', err);
  }
}

AppRegistry.registerComponent(appName, () => App);
