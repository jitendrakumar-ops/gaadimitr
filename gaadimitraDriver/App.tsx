import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ThemeProvider } from './src/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { logout } from './src/store/slices/authSlice';
import { clearDriverProfile } from './src/store/slices/driverSlice';
import { setLogoutDispatcher } from './src/utils/authHandler';

// Register global logout callback for automatic session invalidation & forbidden access
setLogoutDispatcher(() => {
  store.dispatch(logout());
  store.dispatch(clearDriverProfile());
});

const AppContent: React.FC = () => {
  useEffect(() => {
    // 1. Setup push notification listeners (foreground + token refresh)
    notificationService.setupListeners();

    // 2. If driver is logged in and opens the app, sync device token to /auth/device-token
    notificationService.syncDeviceToken();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;

