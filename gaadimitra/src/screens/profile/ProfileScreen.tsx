import React from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import {
  UserSingleIcon,
  LocationMarkerIcon,
  HeartOutlineSimpleIcon,
  ChevronRightIcon,
  CarFrontIcon,
  QuestionCircleIcon,
  WarningTriangleIcon,
  DocumentTextIcon,
  ShieldCheckAltIcon,
  LogOutIcon,
  CameraBadgeIcon,
  SettingsGearIcon,
} from '../../assets/icons/Icons';
import { storageService } from '../../services/storage';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector, logout } from '../../store';
import { confirmDialog } from '../../components/common/CustomAlertModal';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    confirmDialog.show({
      title: 'Log Out',
      message: 'Are you sure you want to log out of GaadiMitra?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      isDestructive: true,
      icon: 'logout',
      onConfirm: () => {
        dispatch(logout());
        storageService.clearAll();
        navigation.reset({
          index: 0,
          routes: [{ name: 'PhoneLogin' }],
        });
      },
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header Bar */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }}
        className="px-5 py-3.5 flex-row items-center justify-between border-b"
      >
        <Text
          style={{ color: colors.text }}
          className="text-2xl font-black tracking-tight"
        >
          Profile
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Settings')}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="w-10 h-10 rounded-xl items-center justify-center border"
        >
          <SettingsGearIcon size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="p-4 rounded-xl border mb-5 flex-row items-center"
        >
          {/* Avatar with Camera Icon Overlay */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalDetails')}
            className="relative mr-4"
          >
            <View
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
              className="w-16 h-16 rounded-full overflow-hidden border items-center justify-center"
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../assets/images/driver_rahul.jpg')}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Camera badge overlay */}
            <View
              style={{ backgroundColor: colors.primary }}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-sm"
            >
              <CameraBadgeIcon size={11} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* User Details */}
          <View className="flex-1">
            <Text
              style={{ color: colors.text }}
              className="text-lg font-bold leading-tight"
            >
              {user?.name || 'GaadiMitra User'}
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs font-semibold mt-0.5 tracking-wider"
            >
              {user?.phone || user?.phoneNumber || '+91 XXXXX XXXXX'}
            </Text>
          </View>
        </View>

        {/* Section 1: ACCOUNT */}
        <View className="mb-4">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1"
          >
            ACCOUNT
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border overflow-hidden"
          >
            {/* Personal Details */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PersonalDetails')}
              style={{ borderBottomColor: colors.border }}
              className="p-3.5 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <UserSingleIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Personal Details
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>

            {/* Saved Locations */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SavedLocations')}
              style={{ borderBottomColor: colors.border }}
              className="p-3.5 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <LocationMarkerIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Saved Locations
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>

            {/* Emergency Contact */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EmergencyContact')}
              className="p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <HeartOutlineSimpleIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Emergency Contact
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: ACTIVITY */}
        <View className="mb-4">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1"
          >
            ACTIVITY
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border overflow-hidden"
          >
            {/* My Rides */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => (navigation as any).navigate('MyRides')}
              style={{ borderBottomColor: colors.border }}
              className="p-3.5 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <CarFrontIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  My Rides
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>

            {/* Contacted Drivers */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => (navigation as any).navigate('Contact')}
              className="p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <UserSingleIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Contacted Drivers
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: PREFERENCES & SETTINGS */}
        <View className="mb-4">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1"
          >
            PREFERENCES
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border overflow-hidden"
          >
            {/* App Settings & Theme */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Settings')}
              className="p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <SettingsGearIcon size={19} color={colors.primary} />
                </View>
                <View className="ml-2 flex-1">
                  <Text
                    style={{ color: colors.text }}
                    className="text-sm font-bold"
                  >
                    Settings & Theme
                  </Text>
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-xs mt-0.5"
                  >
                    Theme mode, notifications & app settings
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: `${colors.primary}20` }}
                  className="px-2.5 py-1 rounded-full mr-2"
                >
                  <Text
                    style={{ color: colors.primary }}
                    className="text-[11px] font-bold capitalize"
                  >
                    {themeMode}
                  </Text>
                </View>
                <ChevronRightIcon size={16} color={colors.disabled} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: SUPPORT */}
        <View className="mb-4">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1"
          >
            SUPPORT
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border overflow-hidden"
          >
            {/* Help & Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpAndSupport', {})}
              style={{ borderBottomColor: colors.border }}
              className="p-3.5 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <QuestionCircleIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Help & Support
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>

            {/* Report an Issue */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpAndSupport', {})}
              className="p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <WarningTriangleIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Report an Issue
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 4: LEGAL */}
        <View className="mb-4">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1"
          >
            LEGAL
          </Text>
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border overflow-hidden"
          >
            {/* Terms & Conditions */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TermsAndConditions')}
              style={{ borderBottomColor: colors.border }}
              className="p-3.5 flex-row items-center justify-between border-b"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <DocumentTextIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Terms & Conditions
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              className="p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-8 items-center">
                  <ShieldCheckAltIcon size={18} color={colors.icon} />
                </View>
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold ml-2"
                >
                  Privacy Policy
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.disabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 5: LOGOUT ACTION */}
        <View className="mt-2 mb-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={{
              backgroundColor: `${colors.error}15`,
              borderColor: `${colors.error}35`,
            }}
            className="p-4 rounded-xl border flex-row items-center justify-center"
          >
            <LogOutIcon size={18} color={colors.error} />
            <Text
              style={{ color: colors.error }}
              className="text-base font-bold ml-2 tracking-wide"
            >
              Log Out
            </Text>
          </TouchableOpacity>

          {/* App Version Tag */}
          <Text
            style={{ color: colors.placeholder }}
            className="text-[11px] text-center font-medium mt-4 tracking-wider"
          >
            GaadiMitra v1.0.0 (Build 102)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
