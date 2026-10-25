export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  divider: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  inputBg: string;
  inputBorder: string;
  tabBar: string;
  tabBarBorder: string;
  tabInactive: string;
  statusBar: 'dark-content' | 'light-content';
  statusBg: string;
  modalBg: string;
  modalBackdrop: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',
  primary: '#1350F2',
  primaryLight: '#EFF6FF',
  primaryDark: '#0D38B1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  tabBar: '#FFFFFF',
  tabBarBorder: '#F1F5F9',
  tabInactive: '#94A3B8',
  statusBar: 'dark-content',
  statusBg: '#FFFFFF',
  modalBg: '#FFFFFF',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: ThemeColors = {
  background: '#0B0F19',
  surface: '#151E2E',
  surfaceSecondary: '#1E293B',
  surfaceElevated: '#243046',
  card: '#151E2E',
  cardBorder: '#273549',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#273549',
  borderLight: '#1E293B',
  divider: '#273549',
  primary: '#3B82F6',
  primaryLight: '#1E3A8A40',
  primaryDark: '#2563EB',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#60A5FA',
  inputBg: '#101623',
  inputBorder: '#273549',
  tabBar: '#0B0F19',
  tabBarBorder: '#1E293B',
  tabInactive: '#64748B',
  statusBar: 'light-content',
  statusBg: '#0B0F19',
  modalBg: '#151E2E',
  modalBackdrop: 'rgba(0, 0, 0, 0.7)',
};
