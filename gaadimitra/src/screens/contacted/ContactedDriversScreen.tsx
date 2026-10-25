import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DriverInfo } from '../../types/navigation';
import {
  PhoneIcon,
} from '../../assets/icons/Icons';
import { useTheme } from '../../theme';
import { confirmDialog } from '../../components/common/CustomAlertModal';

interface ContactedDriverItem {
  id: string;
  driver: DriverInfo;
  calledAt: string;
  agreedPriceApprox: string;
  routeInterest: string;
}

const SAMPLE_CONTACTED: ContactedDriverItem[] = [
  {
    id: 'cnt_1',
    driver: {
      id: 'drv_1',
      name: 'Rahul Kumar',
      phone: '+919876543210',
      rating: '4.8',
      totalRides: 286,
      experienceYears: 5,
      distance: '1.2 km away',
      isVerified: true,
      vehicleModel: 'Maruti Dzire',
      vehicleType: 'Car',
      vehiclePlate: 'BR01AB1234',
      hasAc: true,
      seatingCapacity: '4 Seats',
      pricePerKm: '₹14 / km',
    },
    calledAt: '10 mins ago',
    agreedPriceApprox: '₹1,500',
    routeInterest: 'Patna Junction ➔ Gaya',
  },
  {
    id: 'cnt_2',
    driver: {
      id: 'drv_2',
      name: 'Amit Sharma',
      phone: '+919812345678',
      rating: '4.9',
      totalRides: 412,
      experienceYears: 7,
      distance: '2.5 km away',
      isVerified: true,
      vehicleModel: 'Hyundai Aura',
      vehicleType: 'Car',
      vehiclePlate: 'BR01CD5678',
      hasAc: true,
      seatingCapacity: '4 Seats',
      pricePerKm: '₹13 / km',
    },
    calledAt: 'Yesterday',
    agreedPriceApprox: '₹2,200',
    routeInterest: 'Patna ➔ Muzaffarpur',
  },
  {
    id: 'cnt_3',
    driver: {
      id: 'drv_3',
      name: 'Vikram Singh',
      phone: '+919890123456',
      rating: '4.9',
      totalRides: 520,
      experienceYears: 8,
      distance: 'City Trip',
      isVerified: true,
      vehicleModel: 'Toyota Innova Crysta',
      vehicleType: 'SUV',
      vehiclePlate: 'BR01EF9012',
      hasAc: true,
      seatingCapacity: '7 Seats',
      pricePerKm: '₹22 / km',
    },
    calledAt: '3 days ago',
    agreedPriceApprox: '₹850',
    routeInterest: 'Patna Airport ➔ Rajendra Nagar',
  },
];

export const ContactedDriversScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const [contactedList] = useState<ContactedDriverItem[]>(SAMPLE_CONTACTED);

  const handleCall = (driver: DriverInfo) => {
    confirmDialog.show({
      title: 'Call Driver',
      message: `Do you want to call ${driver.name} (${driver.phone})?`,
      confirmText: 'Call Now',
      cancelText: 'Cancel',
      icon: 'phone',
      onConfirm: () => {
        Linking.openURL(`tel:${driver.phone}`).catch(() => {});
      },
    });
  };

  const handleBookWithDriver = (driver: DriverInfo) => {
    navigation.navigate('FinalizeRide', {
      driver,
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

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }}
        className="px-5 py-3.5 flex-row items-center justify-between border-b"
      >
        <View>
          <Text
            style={{ color: colors.text }}
            className="text-xl font-black tracking-tight"
          >
            Contacted Drivers
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold mt-0.5"
          >
            Direct Calls & Fare Negotiations
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-3">
          {contactedList.map(item => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-xl border p-4 mb-3"
            >
              {/* Top Row: Driver Profile & Time */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <Image
                    source={require('../../assets/images/driver_rahul.jpg')}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      borderColor: colors.border,
                    }}
                    className="border"
                    resizeMode="cover"
                  />
                  <View className="ml-3 flex-1">
                    <Text
                      style={{ color: colors.text }}
                      className="text-base font-extrabold"
                    >
                      {item.driver.name}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <Text className="text-xs font-bold text-amber-500 mr-1">★</Text>
                      <Text
                        style={{ color: colors.text }}
                        className="text-xs font-bold"
                      >
                        {item.driver.rating}
                      </Text>
                      <Text
                        style={{ color: colors.textSecondary }}
                        className="text-xs font-semibold ml-2"
                      >
                        {item.driver.vehicleModel}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{ backgroundColor: colors.surface }}
                  className="px-2.5 py-1 rounded-full"
                >
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-[10px] font-bold"
                  >
                    {item.calledAt}
                  </Text>
                </View>
              </View>

              {/* Route Discussion Card */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="rounded-xl p-3 border mb-3 flex-row items-center justify-between"
              >
                <View className="flex-1 pr-2">
                  <Text
                    style={{ color: colors.placeholder }}
                    className="text-[10px] font-bold uppercase tracking-wider"
                  >
                    Discussed Route
                  </Text>
                  <Text
                    style={{ color: colors.text }}
                    className="text-xs font-bold mt-0.5"
                    numberOfLines={1}
                  >
                    {item.routeInterest}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    style={{ color: colors.placeholder }}
                    className="text-[10px] font-bold uppercase tracking-wider"
                  >
                    Fare
                  </Text>
                  <Text
                    style={{ color: colors.text }}
                    className="text-sm font-black mt-0.5"
                  >
                    {item.agreedPriceApprox}
                  </Text>
                </View>
              </View>

              {/* Actions: Call Back & Finalize */}
              <View className="flex-row items-center pt-1">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCall(item.driver)}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  }}
                  className="flex-1 py-2.5 px-3 border rounded-xl flex-row items-center justify-center mr-2"
                >
                  <PhoneIcon size={15} color={colors.primary} />
                  <Text
                    style={{ color: colors.text }}
                    className="text-xs font-bold ml-1.5"
                  >
                    Call Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleBookWithDriver(item.driver)}
                  style={{ backgroundColor: colors.primary }}
                  className="flex-1 py-2.5 px-3 rounded-xl flex-row items-center justify-center ml-2"
                >
                  <Text className="text-white text-xs font-extrabold">
                    Finalize Ride
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
