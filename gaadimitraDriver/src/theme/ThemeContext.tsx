import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import {
  DefaultTheme,
  DarkTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { ThemeColors, lightColors, darkColors } from './colors';
import { storageService } from '../services/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  navigationTheme: NavigationTheme;
}

const THEME_STORAGE_KEY = 'gm_driver_theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from storage or default to system
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = storageService.getString(THEME_STORAGE_KEY) as ThemeMode | undefined;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() || 'light'
  );

  // Listen to OS system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: nextScheme }) => {
      setSystemScheme(nextScheme);
    });
    return () => subscription.remove();
  }, []);

  // Determine active dark state
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  // Sync with NativeWind's color scheme
  useEffect(() => {
    try {
      if (nwColorScheme?.set) {
        nwColorScheme.set(isDark ? 'dark' : 'light');
      }
    } catch {
      // safe fallback if css interop differs
    }
  }, [isDark]);

  // Handler to set theme mode and persist
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      storageService.setString(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme mode to storage:', e);
    }
  }, []);

  // Quick toggle between light & dark
  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  // Pick color palette
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  // Build matching React Navigation Theme
  const navigationTheme: NavigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      dark: isDark,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [isDark, colors]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark,
      colors,
      setThemeMode,
      toggleTheme,
      navigationTheme,
    }),
    [themeMode, isDark, colors, setThemeMode, toggleTheme, navigationTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
