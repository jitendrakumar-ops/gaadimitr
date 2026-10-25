import { NativeModules, Platform } from 'react-native';

const { NavigationBarModule } = NativeModules;

/**
 * Dynamically set the Android phone's bottom system navigation bar color
 * to match the app's bottom tab bar or background color seamlessly.
 */
export const setSystemNavigationBarColor = (
  colorHex: string,
  isLightIcons: boolean = true
) => {
  if (Platform.OS === 'android' && NavigationBarModule?.setColor) {
    try {
      NavigationBarModule.setColor(colorHex, isLightIcons);
    } catch {
      // Ignore fallback
    }
  }
};
