import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store, useAppDispatch, restoreAuth, logout } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme';
import { setOnUnauthorizedCallback } from './src/services/api';
import { notificationService } from './src/services/notificationService';
import { GlobalToastContainer } from './src/components/common/ToastNotification';
import { GlobalAlertContainer } from './src/components/common/CustomAlertModal';

const RootContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      dispatch(logout());
    });
    dispatch(restoreAuth());

    // Setup push notification listeners (foreground alerts & token refresh)
    notificationService.setupListeners();

    return () => {
      notificationService.cleanup();
    };
  }, [dispatch]);

  return (
    <ThemeProvider>
      <AppNavigator />
      <GlobalToastContainer />
      <GlobalAlertContainer />
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootContent />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
