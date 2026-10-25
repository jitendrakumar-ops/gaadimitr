import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverSuccessScreenNavigationProp,
  DriverSuccessScreenRouteProp,
} from '../types/navigation';
import {
  DriverHeaderLogo,
  CheckmarkBadge,
  ERickshawIllustration,
  ELoaderIllustration,
  ScorpioIllustration,
  BoleroIllustration,
  FiveSeaterIllustration,
  SevenSeaterIllustration,
  BoleroPickupIllustration,
  MiniLoaderIllustration,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';

export const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<DriverSuccessScreenNavigationProp>();
  const route = useRoute<DriverSuccessScreenRouteProp>();
  const { colors, isDark } = useTheme();

  const driverData = route.params?.driverData || {
    fullName: 'Rahul Sharma',
    phoneNumber: '+91 9876543221',
    city: 'Delhi NCR',
    address: 'Sector 18, Noida',
    emergencyContact: '9811223344',
  };

  const selectedVehicle = route.params?.selectedVehicle || {
    id: 'e_rickshaw',
    name: 'E-Rickshaw',
    category: 'Electric Passenger',
  };

  const [isOnline, setIsOnline] = useState<boolean>(true);

  const getVehicleIllustration = (id: string) => {
    switch (id) {
      case 'e_loader':
        return <ELoaderIllustration size={72} />;
      case 'scorpio':
        return <ScorpioIllustration size={72} />;
      case 'bolero':
        return <BoleroIllustration size={72} />;
      case '5_seater':
        return <FiveSeaterIllustration size={72} />;
      case '7_seater':
        return <SevenSeaterIllustration size={72} />;
      case 'bolero_pickup':
        return <BoleroPickupIllustration size={72} />;
      case 'mini_loader':
        return <MiniLoaderIllustration size={72} />;
      case 'e_rickshaw':
      default:
        return <ERickshawIllustration size={72} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5 pt-3 pb-8">
          {/* Top Header */}
          <View className="flex-row items-center justify-between py-2 mb-4">
            <View className="flex-row items-center">
              <DriverHeaderLogo size={34} />
              <Text style={{ color: colors.primary }} className="text-lg font-black ml-2">
                Gaadimitra DRIVER
              </Text>
            </View>
            <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
              <Text className="text-xs font-bold text-emerald-600">
                Verified Partner
              </Text>
            </View>
          </View>

          {/* Success Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl p-5 border shadow-sm items-center mb-4"
          >
            <View className="w-14 h-14 rounded-full bg-emerald-500/15 items-center justify-center mb-3">
              <CheckmarkBadge size={32} />
            </View>
            <Text style={{ color: colors.text }} className="text-xl font-extrabold text-center">
              Driver Account Activated!
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-xs text-center mt-1">
              Your vehicle is listed. You will start receiving local passenger inquiries.
            </Text>
          </View>

          {/* Online / Offline Toggle Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl p-4 border shadow-sm flex-row items-center justify-between mb-4"
          >
            <View>
              <Text style={{ color: colors.text }} className="text-sm font-bold">
                {isOnline ? '🟢 You are Online' : '⚪ You are Offline'}
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
                {isOnline
                  ? 'Visible to passengers in your area'
                  : 'Turn ON to accept passenger calls'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: isDark ? '#1E3A8A' : '#93C5FD' }}
              thumbColor={isOnline ? colors.primary : (isDark ? '#475569' : '#F1F5F9')}
            />
          </View>

          {/* Listed Vehicle Details */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl p-5 border shadow-sm mb-4"
          >
            <Text style={{ color: colors.textMuted }} className="text-xs font-bold uppercase tracking-wider mb-3">
              Listed Vehicle
            </Text>
            <View className="flex-row items-center">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="w-20 h-16 rounded-xl items-center justify-center mr-4 border"
              >
                {getVehicleIllustration(selectedVehicle.id)}
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-base font-bold">
                  {selectedVehicle.name}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
                  {selectedVehicle.category}
                </Text>
                <View className="mt-2 flex-row items-center">
                  <Text
                    style={{
                      color: colors.primary,
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                    }}
                    className="text-xs font-semibold px-2 py-1 rounded"
                  >
                    Direct Fare Booking
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver Profile Summary */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl p-5 border shadow-sm mb-4"
          >
            <Text style={{ color: colors.textMuted }} className="text-xs font-bold uppercase tracking-wider mb-3">
              Driver Profile
            </Text>
            <View className="space-y-2">
              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-1 border-b">
                <Text style={{ color: colors.textMuted }} className="text-xs">Name</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  {driverData.fullName || 'Rahul Sharma'}
                </Text>
              </View>
              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-1 border-b">
                <Text style={{ color: colors.textMuted }} className="text-xs">Mobile</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  {driverData.phoneNumber || '+91 9876543221'}
                </Text>
              </View>
              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-1 border-b">
                <Text style={{ color: colors.textMuted }} className="text-xs">City</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  {driverData.city || 'Delhi NCR'}
                </Text>
              </View>
              {driverData.address ? (
                <View className="flex-row justify-between py-1">
                  <Text style={{ color: colors.textMuted }} className="text-xs">Address</Text>
                  <Text style={{ color: colors.text }} className="text-xs font-bold text-right max-w-[60%]">
                    {driverData.address}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Restart Flow / Test again */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DriverOnboarding')}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            }}
            className="w-full border py-3.5 rounded-xl items-center justify-center mt-2 shadow-sm"
          >
            <Text style={{ color: colors.primary }} className="font-bold text-sm">
              Restart Onboarding Flow
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const DriverSuccessScreen = SuccessScreen;
export default SuccessScreen;
