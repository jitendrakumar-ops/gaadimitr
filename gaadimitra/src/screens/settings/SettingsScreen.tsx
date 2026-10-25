import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SettingsScreenNavigationProp } from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import {
  SunIcon,
  MoonIcon,
  SystemThemeIcon,
  BrandThemeIcon,
  ChevronRightIcon,
  LocationMarkerIcon,
  ShieldSafetyIcon,
  DocumentTextIcon,
} from '../../assets/icons/Icons';
import { useTheme, ThemeMode } from '../../theme';

interface ThemeOptionItem {
  id: ThemeMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();


  const themeOptions: ThemeOptionItem[] = [
    {
      id: 'light',
      label: 'Light Theme',
      description: 'Clean & bright daylight interface',
      icon: <SunIcon size={20} color="#F59E0B" />,
    },
    {
      id: 'dark',
      label: 'Dark Theme',
      description: 'Easy on the eyes in low light',
      icon: <MoonIcon size={20} color="#818CF8" />,
    },
    {
      id: 'system',
      label: 'System Default',
      description: 'Follows your device system appearance',
      icon: <SystemThemeIcon size={20} color={colors.primary} />,
    },
    {
      id: 'brand',
      label: 'Brand Midnight',
      description: 'GaadiMitra signature navy & electric cyan',
      icon: <BrandThemeIcon size={20} color="#38BDF8" />,
    },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Navigation Header */}
      <HeaderBar
        title="Settings"
        onBackPress={() => navigation.goBack()}
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: THEME & APPEARANCE */}
        <View className="mb-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-wider mb-1.5 px-1"
          >
            APPEARANCE & THEME
          </Text>
          <Text
            style={{ color: colors.placeholder }}
            className="text-xs mb-3 px-1"
          >
            Choose your preferred color theme. Applies instantly across all screens.
          </Text>

          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border overflow-hidden shadow-sm"
          >
            {themeOptions.map((opt, idx) => {
              const isSelected = themeMode === opt.id;
              const isLast = idx === themeOptions.length - 1;

              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.7}
                  onPress={() => setThemeMode(opt.id)}
                  style={{
                    borderBottomColor: isLast ? 'transparent' : colors.border,
                    borderBottomWidth: isLast ? 0 : 1,
                    backgroundColor: isSelected ? `${colors.primary}12` : 'transparent',
                  }}
                  className="p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <View
                      style={{
                        backgroundColor: isSelected ? `${colors.primary}20` : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}
                      className="w-10 h-10 rounded-xl items-center justify-center border mr-3"
                    >
                      {opt.icon}
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text
                          style={{
                            color: isSelected ? colors.primary : colors.text,
                          }}
                          className="text-sm font-bold"
                        >
                          {opt.label}
                        </Text>
                        {isSelected && (
                          <View
                            style={{ backgroundColor: `${colors.primary}25` }}
                            className="ml-2 px-2 py-0.5 rounded-full"
                          >
                            <Text
                              style={{ color: colors.primary }}
                              className="text-[10px] font-extrabold"
                            >
                              ACTIVE
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={{ color: colors.textSecondary }}
                        className="text-xs mt-0.5"
                      >
                        {opt.description}
                      </Text>
                    </View>
                  </View>

                  {/* Radio Selection Indicator */}
                  <View
                    style={{
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: 2,
                    }}
                    className="w-5 h-5 rounded-full items-center justify-center"
                  >
                    {isSelected && (
                      <View
                        style={{ backgroundColor: colors.primary }}
                        className="w-2.5 h-2.5 rounded-full"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>



        {/* SECTION 3: PRIVACY & PERMISSIONS */}
        <View className="mb-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-wider mb-2.5 px-1"
          >
            PERMISSIONS & PRIVACY
          </Text>

          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border overflow-hidden shadow-sm"
          >
            {/* Location Permission */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('LocationPermission', {})}
              style={{ borderBottomColor: colors.border }}
              className="p-4 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <LocationMarkerIcon size={18} color={colors.primary} />
                </View>
                <View className="ml-2 flex-1">
                  <Text style={{ color: colors.text }} className="text-sm font-bold">
                    Location Access
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                    Required for GPS driver discovery
                  </Text>
                </View>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              style={{ borderBottomColor: colors.border }}
              className="p-4 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <ShieldSafetyIcon size={18} color={colors.icon} />
                </View>
                <View className="ml-2 flex-1">
                  <Text style={{ color: colors.text }} className="text-sm font-bold">
                    Privacy Policy
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                    How we safeguard your location & phone data
                  </Text>
                </View>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TermsAndConditions')}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <DocumentTextIcon size={18} color={colors.icon} />
                </View>
                <View className="ml-2 flex-1">
                  <Text style={{ color: colors.text }} className="text-sm font-bold">
                    Terms & Conditions
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                    Zero-commission direct booking policies
                  </Text>
                </View>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 4: APP INFO FOOTER */}
        <View className="items-center justify-center pt-2 pb-6">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">
            GaadiMitra Passenger App
          </Text>
          <Text style={{ color: colors.placeholder }} className="text-[11px] mt-1">
            Version 1.0.0 (Build 102) • Production
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
