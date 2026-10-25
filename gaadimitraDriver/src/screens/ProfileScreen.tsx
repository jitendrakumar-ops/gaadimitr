import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDriverProfile, clearDriverProfile } from '../store/slices/driverSlice';
import { logout } from '../store/slices/authSlice';


export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark, themeMode } = useTheme();
  const dispatch = useAppDispatch();

  const { driverProfile, isLoading, fetchError } = useAppSelector((state) => state.driver);
  const authUser = useAppSelector((state) => state.auth.user);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchDriverProfile());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchDriverProfile()).unwrap();
    } catch {
      // Handled via redux state
    } finally {
      setRefreshing(false);
    }
  };




  const partnerId =
    (driverProfile?._id ? `GM-${String(driverProfile._id).slice(-6).toUpperCase()}` : '')

  const initials = authUser?.name.trim()
    ? authUser?.name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : '-';


  const isOnline =
    driverProfile?.onlineStatus?.toLowerCase() === 'active' ||
    driverProfile?.onlineStatus?.toLowerCase() === 'online';


  const ChevronRight = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={colors.textMuted}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your GaadiMitra Driver Partner account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            dispatch(clearDriverProfile());
            navigation.reset({
              index: 0,
              routes: [{ name: 'DriverPhoneLogin' }],
            });
          },
        },
      ]
    );
  };

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
        className="px-5 pt-4 pb-4 flex-row items-center justify-between"
      >
        <View>
          <Text style={{ color: colors.text }} className="text-xl font-extrabold tracking-tight">
            Profile
          </Text>
          {partnerId ? (
            <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-1">
              Partner ID: {partnerId}
            </Text>
          ) : null}
        </View>

        {driverProfile?.onlineStatus && driverProfile?.onlineStatus !== '-' ? (
          <View
            style={{
              backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(113, 113, 122, 0.1)',
              borderColor: isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(113, 113, 122, 0.3)',
            }}
            className="border px-3 py-1 rounded-full flex-row items-center"
          >
            <View
              style={{
                backgroundColor: isOnline ? '#10B981' : '#A1A1AA',
              }}
              className="w-2 h-2 rounded-full mr-2"
            />
            <Text
              style={{
                color: isOnline ? '#059669' : '#71717A',
              }}
              className="text-xs font-black uppercase"
            >
              {driverProfile?.onlineStatus}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Error Notice with Retry */}
        {fetchError ? (
          <View
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
              borderColor: isDark ? '#B91C1C' : '#FECACA',
            }}
            className="border p-3 rounded-xl mb-4 flex-row items-center justify-between"
          >
            <Text style={{ color: colors.danger }} className="text-xs font-semibold flex-1 mr-2">
              {fetchError}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => dispatch(fetchDriverProfile())}
              className="bg-red-500 px-3 py-1.5 rounded-lg"
            >
              <Text className="text-white text-xs font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 1. Driver Profile Hero Card (Tap to View Full Profile) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => (navigation as any).navigate('DriverProfileDetails')}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          {/* Top Profile Details */}
          <View
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between pb-4 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="relative mr-4">
                <View
                  style={{
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                    borderColor: colors.primary,
                  }}
                  className="w-16 h-16 rounded-xl border-2 items-center justify-center overflow-hidden"
                >
                  {authUser?.profileImage ? (
                    <Image
                      source={{ uri: authUser?.profileImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ color: colors.primary }} className="text-xl font-black tracking-wider font-mono">
                      {initials}
                    </Text>
                  )}
                </View>
                <View
                  style={{ borderColor: colors.surface }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 items-center justify-center"
                >
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: colors.text }} className="text-lg font-black tracking-tight mr-2">
                    {authUser?.name || '-'}
                  </Text>
                  <View
                    style={{
                      backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(113, 113, 122, 0.1)',
                      borderColor: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(113, 113, 122, 0.2)',
                    }}
                    className="border px-2 py-0.5 rounded"
                  >
                    <Text
                      style={{
                        color: isOnline ? '#059669' : '#71717A',
                      }}
                      className="text-[10px] font-black uppercase"
                    >
                      {driverProfile?.onlineStatus}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-1 font-mono">
                  {authUser?.phone || '-'}
                </Text>

                <View className="flex-row items-center mt-2">
                  {partnerId ? (
                    <View
                      style={{
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                        borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                      }}
                      className="border px-2 py-0.5 rounded-md mr-2"
                    >
                      <Text style={{ color: colors.primary }} className="text-xs font-bold">
                        ID: {partnerId}
                      </Text>
                    </View>
                  ) : null}

                  {driverProfile?.rating !== null ? (
                    <View className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex-row items-center">
                      <Text className="text-xs font-black text-amber-500 mr-1">★ {driverProfile?.rating || 0}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <ChevronRight />
          </View>

          {/* Bottom Metric Strip */}
          <View className="flex-row items-center justify-between pt-3 px-1">
            <View style={{ borderRightColor: colors.borderLight }} className="items-center flex-1 border-r">
              <Text style={{ color: colors.text }} className="text-sm font-black">{driverProfile?.totalTripsCount || 0}</Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase mt-1">
                Total Rides
              </Text>
            </View>

            <View style={{ borderRightColor: colors.borderLight }} className="items-center flex-1 border-r">
              <Text className="text-sm font-black text-emerald-500">{driverProfile?.totalRatingsCount || 0}</Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase mt-1">
                Total Rating
              </Text>
            </View>

            <View className="items-center flex-1">
              <Text style={{ color: colors.primary }} className="text-sm font-black">{driverProfile?.vehicleModel || '-'}</Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase mt-1">
                {driverProfile?.type || '-'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Section: Profile, Documents & Vehicle */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-black uppercase tracking-wider mb-2 ml-1">
            Documents & Vehicle
          </Text>

          {/* Profile Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverProfileDetails')}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-3 px-1 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="w-9 h-9 rounded-xl border items-center justify-center mr-3"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="8" r="4" stroke={colors.primary} strokeWidth="1.8" />
                  <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Profile
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Document Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverDocuments')}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-3 px-1 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="w-9 h-9 rounded-xl border items-center justify-center mr-3"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Document
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Vehicle Info */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverVehicleProfile')}
            className="flex-row items-center justify-between py-3 px-1"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }}
                className="w-9 h-9 rounded-xl border items-center justify-center mr-3"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 17H19M5 17C3.5 17 2 15.5 2 14V11L4 6C4.5 4.5 6 4 7 4H17C18 4 19.5 4.5 20 6L22 11V14C22 15.5 20.5 17 19 17" stroke={colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" />
                  <Circle cx="7.5" cy="16.5" r="1.5" fill={colors.textSecondary} />
                  <Circle cx="16.5" cy="16.5" r="1.5" fill={colors.textSecondary} />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Vehicle Details
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>
        </View>

        {/* 3. Section: Payment & Subscription */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-black uppercase tracking-wider mb-2 ml-1">
            Earnings & Plans
          </Text>

          {/* Payment */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('Earnings')}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-3 px-1 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mr-3">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect x="2" y="6" width="20" height="12" rx="2" stroke="#10B981" strokeWidth="1.8" />
                  <Circle cx="12" cy="12" r="2.5" stroke="#10B981" strokeWidth="1.8" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Earnings
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Subscription */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverSubscription')}
            className="flex-row items-center justify-between py-3 px-1"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 items-center justify-center mr-3">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Subscription
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>
        </View>

        {/* 4. Section: Rides & Referrals */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-black uppercase tracking-wider mb-2 ml-1">
            Rides & Rewards
          </Text>

          {/* My Rides */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('Rides')}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-3 px-1 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 items-center justify-center mr-3">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                My Rides
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Refer and Earn */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverReferEarn')}
            className="flex-row items-center justify-between py-3 px-1"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center mr-3">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 12v10H4V12M2 7h20v5H2V7zm10-5v5m0 0a2.5 2.5 0 10-5 0 2.5 2.5 0 105 0zm0 0a2.5 2.5 0 115 0 2.5 2.5 0 11-5 0z" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Refer and Earn
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>
        </View>

        {/* 5. Section: App Settings & Preferences */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-black uppercase tracking-wider mb-2 ml-1">
            Preferences & Support
          </Text>

          {/* Settings */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverSettings')}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-3 px-1 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }}
                className="w-9 h-9 rounded-xl border items-center justify-center mr-3"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="3" stroke={colors.textSecondary} strokeWidth="1.8" />
                  <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={colors.textSecondary} strokeWidth="1.8" />
                </Svg>
              </View>
              <View>
                <Text style={{ color: colors.text }} className="text-sm font-bold">
                  Settings
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[10px]">
                  Theme: {themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark 🌙' : 'Light ☀️'}
                </Text>
              </View>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverHelpSupport')}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-3 px-1 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mr-3">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="#10B981" strokeWidth="1.8" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Help & Support
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (navigation as any).navigate('DriverTerms')}
            className="flex-row items-center justify-between py-3 px-1"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }}
                className="w-9 h-9 rounded-xl border items-center justify-center mr-3"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.textSecondary} strokeWidth="1.8" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                Terms & Conditions
              </Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>
        </View>

        {/* 6. Log Out Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleLogout}
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? '#7F1D1D' : '#FECDD3',
          }}
          className="border rounded-xl p-4 flex-row items-center justify-center mb-6"
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
            <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-bold text-rose-500">
            Log Out
          </Text>
        </TouchableOpacity>

        <Text style={{ color: colors.textMuted }} className="text-xs font-semibold text-center pb-2">
          GaadiMitra Driver Partner v2.4.0 • Made with ❤️ in India
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
