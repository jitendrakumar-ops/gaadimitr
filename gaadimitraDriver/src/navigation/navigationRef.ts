import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Reset navigation stack to DriverPhoneLogin (Login screen)
 */
export function resetToLogin() {
  const tryReset = (retryCount = 0) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'DriverPhoneLogin' }],
        })
      );
    } else if (retryCount < 10) {
      setTimeout(() => tryReset(retryCount + 1), 100);
    }
  };

  tryReset();
}
