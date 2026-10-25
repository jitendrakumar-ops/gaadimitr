import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path, Circle } from 'react-native-svg';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  // 2. Language state
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'हिन्दी' | 'বাংলা'>('English');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // 3. Sound & Alert states
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [vibrationAlerts, setVibrationAlerts] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState<'High' | 'Normal' | 'Mute'>('High');

  const ChevronRight = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={colors.textMuted}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
        className="px-4 py-3.5 flex-row items-center justify-between "
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={22} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={{ color: colors.text }}
          className="text-base font-black tracking-tight"
        >
          Settings
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
      >

        {/* ======================================================== */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-3.5 "
        >
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-black uppercase tracking-wider mb-1"
          >
            Theme & Appearance
          </Text>
          <Text
            style={{ color: colors.textMuted }}
            className="text-[11px] mb-3"
          >
            {themeMode === 'system'
              ? `Following device settings (${isDark ? 'Dark mode' : 'Light mode'})`
              : `${themeMode === 'dark' ? 'Dark mode' : 'Light mode'} active`}
          </Text>

          <View
            style={{ backgroundColor: colors.surfaceSecondary }}
            className="flex-row p-1 rounded-xl"
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setThemeMode('light')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: themeMode === 'light' ? colors.surface : 'transparent',
                shadowColor: isDark ? '#000' : '#64748B',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: themeMode === 'light' ? 0.15 : 0,
                shadowRadius: 2,
                elevation: themeMode === 'light' ? 2 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: themeMode === 'light' ? colors.primary : colors.textMuted,
                }}
              >
                ☀️ Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setThemeMode('dark')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: themeMode === 'dark' ? (isDark ? colors.surfaceElevated : colors.surface) : 'transparent',
                shadowColor: isDark ? '#000' : '#64748B',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: themeMode === 'dark' ? 0.15 : 0,
                shadowRadius: 2,
                elevation: themeMode === 'dark' ? 2 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: themeMode === 'dark' ? colors.primary : colors.textMuted,
                }}
              >
                🌙 Dark
              </Text>
            </TouchableOpacity>


          </View>
        </View>

        {/* ======================================================== */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-3.5 "
        >
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-black uppercase tracking-wider mb-2"
          >
            Language
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsLanguageModalOpen(true)}
            className="flex-row items-center justify-between py-2"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: colors.primaryLight }}
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={colors.primary} strokeWidth="1.8" />
                  <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={colors.primary} strokeWidth="1.8" />
                </Svg>
              </View>
              <View>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  App Language
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5">
                  Current: {selectedLanguage}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text style={{ color: colors.primary }} className="text-xs font-bold mr-1.5">Change</Text>
              <ChevronRight />
            </View>
          </TouchableOpacity>
        </View>


        {/* ======================================================== */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-black uppercase tracking-wider mb-2"
          >
            Sound & Alerts
          </Text>

          {/* Ride Request Sound */}
          <View
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-2.5 border-b"
          >
            <View className="flex-1 mr-2">
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                Ride Request Sound
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5">
                Play sound for new incoming trip opportunities
              </Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: colors.border, true: '#93C5FD' }}
              thumbColor={soundAlerts ? colors.primary : colors.surfaceSecondary}
            />
          </View>

          {/* Vibration */}
          <View
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-2.5 border-b"
          >
            <View className="flex-1 mr-2">
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                Vibration Alert
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5">
                Vibrate phone on new ride request
              </Text>
            </View>
            <Switch
              value={vibrationAlerts}
              onValueChange={setVibrationAlerts}
              trackColor={{ false: colors.border, true: '#93C5FD' }}
              thumbColor={vibrationAlerts ? colors.primary : colors.surfaceSecondary}
            />
          </View>

          {/* Voice Volume */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              const nextVol = voiceVolume === 'High' ? 'Normal' : voiceVolume === 'Normal' ? 'Mute' : 'High';
              setVoiceVolume(nextVol);
            }}
            className="flex-row items-center justify-between py-2.5"
          >
            <View className="flex-1 mr-2">
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                Sound Volume
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5">
                Speaker volume for alerts
              </Text>
            </View>
            <View
              style={{ backgroundColor: colors.surfaceSecondary }}
              className="px-2.5 py-1 rounded-md"
            >
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                {voiceVolume}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text
          style={{ color: colors.textMuted }}
          className="text-[10px] font-semibold text-center pb-2"
        >
          GaadiMitra Driver v2.4.0
        </Text>
      </ScrollView>

      {/* LANGUAGE SELECTOR MODAL */}
      <Modal
        visible={isLanguageModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLanguageModalOpen(false)}
      >
        <View
          style={{ backgroundColor: colors.modalBackdrop }}
          className="flex-1 justify-center items-center p-5"
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl w-full max-w-sm p-5 shadow-2xl border"
          >
            <View
              style={{ borderBottomColor: colors.borderLight }}
              className="flex-row justify-between items-center pb-3 border-b mb-4"
            >
              <Text style={{ color: colors.text }} className="text-base font-black">
                Select App Language
              </Text>
              <TouchableOpacity
                onPress={() => setIsLanguageModalOpen(false)}
                style={{ backgroundColor: colors.surfaceSecondary }}
                className="w-7 h-7 rounded-full items-center justify-center"
              >
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            {(['English', 'हिन्दी', 'বাংলা'] as const).map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setIsLanguageModalOpen(false);
                    Alert.alert('Language Updated', `App language set to: ${lang}`);
                  }}
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primaryLight : colors.surfaceSecondary,
                  }}
                  className="flex-row items-center justify-between p-3.5 rounded-xl mb-2 border"
                >
                  <Text
                    style={{
                      color: isSelected ? colors.primary : colors.text,
                    }}
                    className="text-sm font-bold"
                  >
                    {lang}
                  </Text>
                  {isSelected && (
                    <View
                      style={{ backgroundColor: colors.primary }}
                      className="w-5 h-5 rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-[10px] font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export const DriverSettingsScreen = SettingsScreen;
export default SettingsScreen;
