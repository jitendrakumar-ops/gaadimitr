import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import Svg, { Path, Circle } from 'react-native-svg';

type RideDetailsRouteProp = RouteProp<RootStackParamList, 'RideDetails'>;

export const RideDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RideDetailsRouteProp>();
  const { colors, isDark } = useTheme();

  // Default fallback data if opened without params
  const ride = route.params?.ride
  // Fare calculations
  const numericFare = parseInt(ride.fare.replace(/[^0-9]/g, ''), 10) || 0;
  const numericToken = ride.token;

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `GaadiMitra Ride Receipt\nBooking ID: ${ride.bookingId}\nCustomer: ${ride.customer}\nRoute: ${ride.from} ➔ ${ride.to}\nFare: ${ride.fare}\nStatus: ${ride.status}\nDate: ${ride.date}\n100% Fare Kept by Driver (0% Commission)`,
      });
    } catch {
      Alert.alert('Share', 'Could not share receipt');
    }
  };

  const handleCallCustomer = () => {
    if (ride.phone) {
      Linking.openURL(`tel:${ride.phone.replace(/\s+/g, '')}`).catch(() => {
        Alert.alert('Call', `Call customer at ${ride.phone}`);
      });
    } else {
      Alert.alert('Contact', 'Customer phone number is protected for privacy.');
    }
  };



  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="px-5 pt-3 pb-3 border-b flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3 border"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={colors.text}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <View>
            <Text style={{ color: colors.text }} className="text-base font-black tracking-tight">
              Ride Details
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-[11px] font-mono">
              {ride.bookingId}
            </Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleShareReceipt}
          style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
          }}
          className="px-3 py-1.5 rounded-full border flex-row items-center"
        >
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" className="mr-1.5">
            <Circle cx="18" cy="5" r="3" stroke={colors.primary} strokeWidth="2" />
            <Circle cx="6" cy="12" r="3" stroke={colors.primary} strokeWidth="2" />
            <Circle cx="18" cy="19" r="3" stroke={colors.primary} strokeWidth="2" />
            <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={colors.primary} strokeWidth="2" />
          </Svg>
          <Text style={{ color: colors.primary }} className="text-[11px] font-bold">Receipt</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Route & Location Details Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
          className="rounded-xl p-4 mb-3 border "
        >
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
              borderStyle: 'dashed',
            }}
            className="flex-row items-center justify-between pb-3 mb-3 border-b"
          >
            <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider">
              Route Information
            </Text>
            {ride.distance ? (
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(19, 80, 242, 0.12)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(19, 80, 242, 0.28)' : '#DBEAFE',
                }}
                className="flex-row items-center px-2.5 py-1 rounded-full border"
              >

                <Text style={{ color: colors.primary }} className="text-xs font-black ml-1.5">
                  {ride.distance}
                </Text>
              </View>
            ) : null}

          </View>

          {/* Pickup */}
          <View className="flex-row items-start mb-2">
            <View className="items-center mr-3 mt-1">
              <View className="w-3.5 h-3.5 rounded-full bg-emerald-500 items-center justify-center">
                <View className="w-1.5 h-1.5 rounded-full bg-white" />
              </View>
              {/* Dashed vertical connector line */}
              <View
                style={{
                  width: 1,
                  height: 32,
                  borderLeftWidth: 1.5,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  marginVertical: 2,
                }}
              />
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
                Pickup Location
              </Text>
              <Text style={{ color: colors.text }} className="text-sm font-bold mt-0.5">
                {ride.from}
              </Text>
            </View>
          </View>

          {/* Drop */}
          <View className="flex-row items-start">
            <View className="items-center mr-3 mt-1">
              <View className="w-3.5 h-3.5 rounded-full bg-rose-500 items-center justify-center">
                <View className="w-1.5 h-1.5 rounded-full bg-white" />
              </View>
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
                Drop Location
              </Text>
              <Text style={{ color: colors.text }} className="text-sm font-bold mt-0.5">
                {ride.to}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Customer Info Card with Dashed Border */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
          className="rounded-xl p-4 mb-3 border "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Passenger Details
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {/* Monogram Avatar */}
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: colors.primary,
                  borderStyle: 'dashed',
                }}
                className="w-12 h-12 rounded-full border items-center justify-center mr-3"
              >
                <Text style={{ color: colors.primary }} className="text-base font-black">
                  {ride.customer.substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <View>
                <Text style={{ color: colors.text }} className="text-sm font-extrabold">
                  {ride.customer}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  {/* <Text className="text-xs text-amber-500 font-bold mr-1">★ 4.9</Text> */}
                  <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium">• Verified Passenger</Text>
                </View>
              </View>
            </View>

            {/* Call button */}
            {ride.phone && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCallCustomer}
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderColor: '#10B981',
                  borderStyle: 'dashed',
                }}
                className="w-10 h-10 rounded-full border items-center justify-center"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 4. Fare & Settlement Breakdown Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
          className="rounded-xl p-4 mb-3 border "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Fare & Settlement Summary
          </Text>

          <View className="space-y-2">
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
                borderStyle: 'dashed',
              }}
              className="flex-row items-center justify-between py-2 border-b"
            >
              <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">Base Fare</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{ride.baseFare || '0'}</Text>
            </View>



            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
                borderStyle: 'dashed',
              }}
              className="flex-row items-center justify-between py-2 border-b"
            >
              <View className="flex-row items-center">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">GaadiMitra Platform Fee</Text>
                <View
                  style={{ borderStyle: 'dashed' }}
                  className="ml-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                >
                  <Text className="text-[9px] font-black text-emerald-600">0% Commission</Text>
                </View>
              </View>
              <Text className="text-xs font-black text-emerald-600">₹0</Text>
            </View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                borderStyle: 'dashed',
              }}
              className="flex-row items-center justify-between py-2 border-b"
            >
              <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">Advance Token (Online)</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{numericToken}</Text>
            </View>

            <View className="flex-row items-center justify-between pt-2">
              <View>
                <Text style={{ color: colors.text }} className="text-sm font-black">Driver Total Earning</Text>
                <Text style={{ color: colors.textMuted }} className="text-[10px] font-medium">100% kept by driver</Text>
              </View>
              <Text style={{ color: colors.primary }} className="text-lg font-black">{ride.fare}</Text>
            </View>
          </View>
        </View>

        {/* 5. Vehicle & Trip Details Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderStyle: 'dashed',
          }}
          className="rounded-xl p-4 mb-4 border "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Trip Specifications
          </Text>

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
              borderStyle: 'dashed',
            }}
            className="flex-row items-center justify-between py-1.5 border-b"
          >
            <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Vehicle</Text>
            <Text style={{ color: colors.text }} className="text-xs font-bold">{ride.vehicle || '-'}</Text>
          </View>

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
              borderStyle: 'dashed',
            }}
            className="flex-row items-center justify-between py-1.5 border-b"
          >
            <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Payment Mode</Text>
            <Text style={{ color: colors.text }} className="text-xs font-bold">{ride.paymentMode || 'Cash at Drop'}</Text>
          </View>

          <View className="flex-row items-center justify-between py-1.5">
            <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Booking ID</Text>
            <Text style={{ color: colors.text }} className="text-xs font-mono font-bold">{ride.bookingId}</Text>
          </View>
        </View>

        {/* Need Help Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => (navigation as any).navigate('DriverSupportChat')}
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          className="border py-3 rounded-xl items-center justify-center mb-2"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">
            Need Help with this Ride? Contact Support
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RideDetailsScreen;
