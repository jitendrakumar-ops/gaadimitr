import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { storageService } from '../services/storage';

export type ThemeMode = 'light' | 'dark' | 'system' | 'brand';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  input: string;
  placeholder: string;
  success: string;
  warning: string;
  error: string;
  overlay: string;
  icon: string;
  disabled: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#2563EB',
  secondary: '#64748B',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  input: '#F8FAFC',
  placeholder: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  overlay: 'rgba(15, 23, 42, 0.45)',
  icon: '#64748B',
  disabled: '#CBD5E1',
};

export const darkColors: ThemeColors = {
  background: '#0B0F19',
  surface: '#151E2E',
  card: '#1E293B',
  primary: '#3B82F6',
  secondary: '#94A3B8',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  input: '#1E293B',
  placeholder: '#64748B',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  overlay: 'rgba(0, 0, 0, 0.75)',
  icon: '#94A3B8',
  disabled: '#475569',
};

export const brandColors: ThemeColors = {
  background: '#070F26',
  surface: '#0F1C3F',
  card: '#162856',
  primary: '#38BDF8',
  secondary: '#93C5FD',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#1E3A8A',
  input: '#0F1C3F',
  placeholder: '#60A5FA',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  overlay: 'rgba(7, 15, 38, 0.8)',
  icon: '#38BDF8',
  disabled: '#1E3A8A',
};

export interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
  navigationTheme: Theme;
}

const THEME_STORAGE_KEY = 'gaadimitra_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useRNColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = storageService.getString(THEME_STORAGE_KEY);
      if (
        saved === 'light' ||
        saved === 'dark' ||
        saved === 'system' ||
        saved === 'brand'
      ) {
        return saved;
      }
    } catch {
      // Ignored
    }
    return 'light';
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      storageService.setString(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignored
    }
  };

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark' || themeMode === 'brand';
  }, [themeMode, systemColorScheme]);

  useEffect(() => {
    if (themeMode === 'system') {
      setColorScheme('system');
    } else if (themeMode === 'dark' || themeMode === 'brand') {
      setColorScheme('dark');
    } else {
      setColorScheme('light');
    }
  }, [themeMode, setColorScheme]);

  const colors = useMemo<ThemeColors>(() => {
    if (themeMode === 'brand') {
      return brandColors;
    }
    if (themeMode === 'dark') {
      return darkColors;
    }
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkColors : lightColors;
    }
    return lightColors;
  }, [themeMode, systemColorScheme]);

  const navigationTheme = useMemo<Theme>(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      dark: isDark,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.error,
      },
    };
  }, [isDark, colors]);

  const value = useMemo<ThemeContextType>(
    () => ({
      themeMode,
      setThemeMode,
      colors,
      isDark,
      navigationTheme,
    }),
    [themeMode, colors, isDark, navigationTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
