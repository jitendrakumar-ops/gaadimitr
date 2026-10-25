import React, { useEffect, useRef } from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  RideConfirmedScreenNavigationProp,
  RideConfirmedScreenRouteProp,
  DriverInfo,
  TripInfoData,
} from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import { CelebrationBadge } from '../../components/booking/CelebrationBadge';
import { DriverSummaryCard } from '../../components/booking/DriverSummaryCard';
import { FareSummaryTable } from '../../components/booking/FareSummaryTable';
import { CheckCircleIcon, ArrowRightIcon } from '../../assets/icons/Icons';
import { ridesService } from '../../services/rides';
import { useTheme } from '../../theme';

import { useAppDispatch, useAppSelector, fetchDriverById, setSelectedDriver } from '../../store';

export const RideConfirmedScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<RideConfirmedScreenNavigationProp>();
  const route = useRoute<RideConfirmedScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { selectedDriver } = useAppSelector((state) => state.drivers);
  const routeDriver = route.params?.driver as any;
  const requestedProfileIdsRef = useRef(new Set<string>());

  useEffect(() => {
    if (selectedDriver || !routeDriver || typeof routeDriver !== 'object') return;

    const routeUser = routeDriver.userId && typeof routeDriver.userId === 'object'
      ? routeDriver.userId
      : {};
    dispatch(setSelectedDriver({
      ...routeDriver,
      _id: routeDriver._id || routeDriver.id || '',
      id: routeDriver.id || routeDriver._id || '',
      pin: routeDriver.pin ?? routeUser.pin ?? '',
      userId: {
        ...routeUser,
        name: routeUser.name || routeDriver.name || 'Driver Partner',
        phone: routeUser.phone || routeDriver.phone || '',
        profileImage: routeUser.profileImage || routeDriver.profileImage || null,
        pin: routeUser.pin ?? routeDriver.pin ?? '',
      },
    } as any));
  }, [dispatch, routeDriver, selectedDriver]);

  useEffect(() => {
    const source = selectedDriver || (routeDriver && typeof routeDriver === 'object' ? routeDriver : null);
    if (!source) return;

    const driverUser = source.userId && typeof source.userId === 'object' ? source.userId : null;
    const hasUserProfile = Boolean(
      (driverUser?.name && driverUser.name !== 'Driver Partner') ||
      driverUser?.phone ||
      driverUser?.profileImage
    );
    const driverId = source._id || source.id;
    if (!driverId || hasUserProfile || requestedProfileIdsRef.current.has(driverId)) return;

    requestedProfileIdsRef.current.add(driverId);
    dispatch(fetchDriverById(driverId));
  }, [dispatch, routeDriver, selectedDriver]);

  const driver: DriverInfo | null = React.useMemo(() => {
    const source = selectedDriver || (routeDriver && typeof routeDriver === 'object' ? routeDriver : null);
    if (source) {
      if (!source.userId) {
        return {
          ...source,
          id: source._id || source.id || '',
          name: source.name || 'Driver Partner',
          phone: source.phone || '',
          profileImage: source.profileImage || null,
          pin: route.params?.pin || source.pin || '',
          vehiclePlate: source.vehiclePlate || source.vehicleNo || 'Not Registered',
        } as DriverInfo;
      }

      const vehicle = typeof source.vehicleId === 'object' ? source.vehicleId : null;
      return {
        id: source._id || source.id || '',
        name: source.userId?.name || (source as any).name || 'Driver Partner',
        phone: source.userId?.phone || (source as any).phone || '',
        profileImage: source.userId?.profileImage || (source as any).profileImage || null,
        pin: route.params?.pin || source.userId?.pin || (source as any).pin || '',
        rating: source.rating !== undefined ? Number(source.rating).toFixed(1) : '5.0',
        totalRides: source.totalTripsCount ?? (source as any).totalRides ?? 0,
        experienceYears: source.experienceYears ?? source.userId?.experienceYears ?? 0,
        distance: source.distanceKm ? `${source.distanceKm} km away` : 'Nearby',
        isVerified: Boolean(source.isVerified ?? true),
        vehicleModel: source.vehicleModel || 'Vehicle',
        vehicleType: source.type || vehicle?.type || 'Car',
        vehiclePlate: source.vehicleNo || 'Not Registered',
        hasAc: Boolean(source.type),
        seatingCapacity: source.seating ?? `${source.seating} Seats`,
        driverVehicleImg: source.vehicleImages,
        vehicleImage: (source.vehicleImages && source.vehicleImages.length > 0)
          ? source.vehicleImages[0]
          : (vehicle?.image || null),
      };
    }
    return null;
  }, [route.params?.pin, routeDriver, selectedDriver]);


  const agreedFare = route.params?.agreedFare || 0;
  const bookingToken = route.params?.bookingToken || 0;
  const bookingId = route.params?.bookingId || `#RIDE${Date.now().toString().slice(-5)}`;

  const tripInfo: TripInfoData = route.params?.tripInfo || {
    pickupLocation: '',
    destination: '',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    pickupTime: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    passengers: driver?.seatingCapacity || '4 Seats',
    vehicleModel: driver?.vehicleModel || '',
  };

  console.log('RideConfirmedScreen - driver:', driver,selectedDriver, route.params?.driver);

  useEffect(() => {
    if (driver) {
      ridesService.saveRide({
        bookingId,
        driver,
        tripInfo,
        agreedFare,
        bookingToken,
        status: 'active',
      });
    }
  }, [driver, bookingId, tripInfo, agreedFare, bookingToken]);

  const handleViewMyRide = () => {
    if (!driver) return;
    navigation.navigate('RideDetails', {
      driver,
      agreedFare,
      tripInfo,
      bookingId,
      status: 'Active',
    });
  };

  const handleGoToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeDashboard' }],
    });
  };

  if (!driver) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderBar onBackPress={handleGoToHome} />
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: colors.text }} className="text-base font-bold text-center">
            Ride confirmation information not available
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HomeDashboard', {})}
            style={{ backgroundColor: colors.primary }}
            className="mt-4 px-6 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Navigation Bar */}
      <HeaderBar onBackPress={handleGoToHome} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 0,
          paddingBottom: 24,
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Confetti & Success Checkmark */}
          <CelebrationBadge size={105} />

          {/* Title & Subtitle */}
          <View className="items-center mb-3">
            <Text style={{ color: colors.text }} className="text-2xl font-black tracking-tight text-center">
              Ride confirmed
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-medium mt-1 text-center">
              Your booking is now confirmed.
            </Text>
          </View>

          {/* Booking ID Pill */}
          <View className="items-center mb-4">
            <View className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 flex-row items-center">
              <Text className="text-[11px] font-bold text-emerald-800">
                Booking ID{'  '}
              </Text>
              <Text className="text-xs font-black text-emerald-700 font-mono tracking-wider">
                {bookingId}
              </Text>
            </View>
          </View>

          {/* Driver Card */}
          <DriverSummaryCard driver={driver} className="mb-3.5" />

          {/* Fare Summary Card */}
          <FareSummaryTable
            totalAgreedFare={agreedFare}
            tokenAmount={bookingToken}
            tokenLabel="Token Paid"
            className="mb-3.5"
          />

          {/* Token Adjusted Green Status Pill */}
          <View className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 flex-row items-center justify-center mb-4">
            <CheckCircleIcon size={16} color="#15803D" />
            <Text className="text-xs font-bold text-emerald-800 ml-2">
              ₹{bookingToken} token is adjusted from your total fare.
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="mt-2">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleViewMyRide}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md mb-3"
          >
            <Text className="text-white text-base font-extrabold tracking-wide mr-2">
              View My Ride
            </Text>
            <ArrowRightIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleGoToHome}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="w-full py-3.5 px-6 rounded-xl border items-center justify-center"
          >
            <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
              Go to Home
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
