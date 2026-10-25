import { Alert } from 'react-native';
import { storageService } from '../services/storage';
import { resetToLogin } from '../navigation/navigationRef';

let isHandlingForbidden = false;
let dispatchLogoutCallback: (() => void) | null = null;

export const setLogoutDispatcher = (callback: () => void) => {
  dispatchLogoutCallback = callback;
};

/**
 * Checks whether an HTTP response or JSON payload matches the forbidden driver error:
 * {
 *   "success": false,
 *   "message": "Forbidden: Access restricted to drivers",
 *   "code": "FORBIDDEN",
 *   "data": null
 * }
 */
export function isForbiddenDriverAccess(responseStatus?: number, data?: any): boolean {
  if (!data && responseStatus !== 403) return false;

  const code = (data?.code || '').toString().toUpperCase();
  const message = (data?.message || '').toString().toLowerCase();

  // Explicit check for code FORBIDDEN
  if (code === 'FORBIDDEN') {
    return true;
  }

  // Explicit check for Access restricted to drivers
  if (message.includes('access restricted to drivers') || message.includes('restricted to drivers')) {
    return true;
  }

  // 403 Forbidden HTTP status
  if (responseStatus === 403 && (message.includes('forbidden') || !message)) {
    return true;
  }

  return false;
}

/**
 * Automatically logs out the driver, clears tokens & storage,
 * and redirects to the DriverPhoneLogin screen.
 */
export const handleForbiddenAccess = (message?: string) => {
  if (isHandlingForbidden) {
    return;
  }
  isHandlingForbidden = true;

  console.warn('⛔ [Auth] Forbidden access restricted to drivers. Logging out and redirecting to login page...');

  // 1. Clear persistent storage tokens & profile data
  try {
    storageService.delete('auth_token');
    storageService.delete('refresh_token');
    storageService.delete('user_data');
    storageService.delete('driver_data');
  } catch (err) {
    console.warn('Error clearing storage on forbidden:', err);
  }

  // 2. Dispatch logout to Redux store
  if (dispatchLogoutCallback) {
    try {
      dispatchLogoutCallback();
    } catch (err) {
      console.warn('Failed to dispatch Redux logout:', err);
    }
  } else {
    try {
      const { store } = require('../store');
      const { logout } = require('../store/slices/authSlice');
      const { clearDriverProfile } = require('../store/slices/driverSlice');
      store.dispatch(logout());
      store.dispatch(clearDriverProfile());
    } catch (err) {
      console.warn('Fallback store logout failed:', err);
    }
  }

  // 3. Reset navigation to Login (DriverPhoneLogin)
  resetToLogin();

  // 4. Alert user
  const displayMsg = message || 'Forbidden: Access restricted to drivers';
  Alert.alert('Access Restricted', displayMsg, [{ text: 'OK' }]);

  // Reset debounce lock after 2 seconds
  setTimeout(() => {
    isHandlingForbidden = false;
  }, 2000);
};
