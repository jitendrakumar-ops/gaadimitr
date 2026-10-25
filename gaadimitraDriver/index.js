// Polyfill nativeCallSyncHook for React Native 0.85+ New Architecture
if (typeof global.nativeCallSyncHook === 'undefined') {
  global.nativeCallSyncHook = () => {};
}

import './global.css';
import { AppRegistry } from 'react-native';
import { startNetworkLogging } from 'react-native-network-logger';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { displayHeadsUpNotification } from './src/utils/notificationUtil';
import { storageService } from './src/services/storage';
import { isRideRequestNotification, isRideCancelledNotification } from './src/services/notificationService';
import App from './App';
import { name as appName } from './app.json';

// Start network logging for debugging
startNetworkLogging();

// Register background push notification handler using Notifee & save pending ride
try {
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    if (!remoteMessage) return;
    const data = remoteMessage.data || {};
    const notifType = String(data.type || '').trim().toLowerCase();
    const isCancelled = isRideCancelledNotification(data) || notifType.includes('cancel');

    // 1. If ride request:
    if (isRideRequestNotification(data)) {
      const notifId = data.bookingId ? `ride_${data.bookingId}` : 'incoming_ride_request';
      try {
        storageService.setObject('pending_ride_request', {
          ...data,
          receivedAt: Date.now(),
        });
        console.log('💾 [index.js] Saved pending ride request in background:', data);
      } catch (err) {
        console.warn('⚠️ [index.js] Error saving pending ride request:', err);
      }

      const title = remoteMessage.notification?.title || data.title || 'New Ride Request 🚖';
      const body =
        remoteMessage.notification?.body ||
        data.body ||
        data.message ||
        (data.pickupAddress ? `${data.pickupAddress} ➔ ${data.dropAddress || ''}` : 'New ride request available');

      await displayHeadsUpNotification(title, body, notifId, data);
    }
    // 2. If ride cancelled in background:
    else if (isCancelled) {
      try {
        // Clear pending ride from storage so app does not show it on reopen
        storageService.delete('pending_ride_request');
        const cancelledId = data.bookingId || data._id || data.id || '';
        if (cancelledId) {
          storageService.setString('last_cancelled_ride_id', cancelledId);
        }
        console.log('❌ [index.js] Background: cleared pending ride request for cancelled ride:', cancelledId);

        // Cancel previous incoming ride notification banner
        await notifee.cancelNotification('incoming_ride_request');
        if (cancelledId) {
          await notifee.cancelNotification(`ride_${cancelledId}`);
        }
      } catch (err) {
        console.warn('⚠️ [index.js] Error cancelling notification in background:', err);
      }

      const title = remoteMessage.notification?.title || data.title || 'Ride Cancelled ❌';
      const body =
        remoteMessage.notification?.body ||
        data.body ||
        data.message ||
        'Customer has cancelled the ride request.';
      const cancelNotifId = `cancelled_${data.bookingId || Date.now()}`;
      await displayHeadsUpNotification(title, body, cancelNotifId, data);
    }
    // 3. Other notification types like payment
    else {
      const title =
        remoteMessage.notification?.title ||
        data.title ||
        (notifType.includes('payment') ? 'Payment Received 💰' : 'Gaadimitra Driver');

      const body =
        remoteMessage.notification?.body ||
        data.body ||
        data.message ||
        (notifType.includes('payment')
          ? `₹${data.amount || ''} payment received for #${data.bookingNumber || ''}`
          : 'New update received');

      const notificationId = remoteMessage.messageId || data.notificationId || String(Date.now());
      await displayHeadsUpNotification(title, body, notificationId, data);
    }
  });
} catch (e) {
  // Ignored
}

// Background event handler for Notifee (user interacts with notification banner while in background)
try {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS && detail?.notification?.data) {
      const data = detail.notification.data;
      if (isRideRequestNotification(data)) {
        try {
          storageService.setObject('pending_ride_request', {
            ...data,
            receivedAt: Date.now(),
          });
          console.log('👆 [index.js] Saved pending ride on notification press in background');
        } catch {}
      } else if (isRideCancelledNotification(data)) {
        try {
          storageService.delete('pending_ride_request');
          console.log('👆 [index.js] Cleared pending ride on cancel notification press in background');
        } catch {}
      }
    }
  });
} catch (e) {
  // Ignored
}

AppRegistry.registerComponent(appName, () => App);
