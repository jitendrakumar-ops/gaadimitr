import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  BackHandler,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import {
  DriverRideConfirmedNavigationProp,
  DriverRideConfirmedRouteProp,
} from '../types/navigation';
import {
  BackArrowIcon,
} from '../assets/icons/DriverIcons';

import { useTheme } from '../theme';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBookingById,
  driverArrivedAction,
  startTripAction,
  completeTripAction,
  clearCurrentBooking,
} from '../store/slices/bookingSlice';
import { BookingItem } from '../types/booking';
import { notificationService } from '../services/notificationService';

type TripStage = 'CONFIRMED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';

// Helper to extract coordinates safely from BookingLocation
const extractCoords = (loc: any): { lat: number; lng: number } | null => {
  if (!loc) return null;

  // 1. Array coordinates: [lng, lat] (standard GeoJSON) or [lat, lng]
  if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    const val0 = Number(loc.coordinates[0]);
    const val1 = Number(loc.coordinates[1]);
    if (!isNaN(val0) && !isNaN(val1) && (val0 !== 0 || val1 !== 0)) {
      // In India, lat is ~8 to ~38, lng is ~68 to ~98
      if (Math.abs(val0) > 40 && Math.abs(val1) < 40) {
        return { lat: val1, lng: val0 };
      }
      if (Math.abs(val1) > 40 && Math.abs(val0) < 40) {
        return { lat: val0, lng: val1 };
      }
      // GeoJSON standard: [longitude, latitude]
      return { lat: val1, lng: val0 };
    }
  }

  // 2. Object coordinates: { lat, lng } or { latitude, longitude }
  if (loc.coordinates && typeof loc.coordinates === 'object') {
    const cLat = Number(loc.coordinates.latitude ?? loc.coordinates.lat);
    const cLng = Number(loc.coordinates.longitude ?? loc.coordinates.lng);
    if (!isNaN(cLat) && !isNaN(cLng) && (cLat !== 0 || cLng !== 0)) {
      return { lat: cLat, lng: cLng };
    }
  }

  // 3. Direct latitude / longitude on loc object
  const directLat = Number(loc.latitude ?? loc.lat);
  const directLng = Number(loc.longitude ?? loc.lng);
  if (!isNaN(directLat) && !isNaN(directLng) && (directLat !== 0 || directLng !== 0)) {
    return { lat: directLat, lng: directLng };
  }

  return null;
};

export const RideConfirmedScreen: React.FC = () => {
  const navigation = useNavigation<DriverRideConfirmedNavigationProp>();
  const route = useRoute<DriverRideConfirmedRouteProp>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { currentBooking, isCurrentBookingLoading } = useAppSelector((state) => state.booking);

  const bookingId = route.params?.requestId;


  // Fetch booking details on mount from Redux
  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(bookingId));
    }
  }, [bookingId, dispatch]);

  const booking: BookingItem | null = currentBooking;
  console.log("ss", currentBooking, booking)
  // Trip execution lifecycle state
  const [stage, setStage] = useState<TripStage>('CONFIRMED');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const cancelledHandledRef = useRef(false);

  // Synchronize stage from live booking status
  useEffect(() => {
    if (!booking?.status || cancelledHandledRef.current) return;
    const st = booking.status;
    if (st === 'cancelled' || st === 'rejected') {
      cancelledHandledRef.current = true;
      dispatch(clearCurrentBooking());
      notificationService.clearPendingRideRequest();
      navigation.navigate('DriverHome', {});
      Alert.alert(
        'Ride Cancelled ❌',
        (booking as any)?.cancellationReason || 'Customer has cancelled this ride.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (st === 'driverArriving' || st === 'driverArrived') {
      setStage('ARRIVED');
    } else if (st === 'tripStarted') {
      setStage('IN_PROGRESS');
    } else if (st === 'tripCompleted') {
      setStage('COMPLETED');
    } else if (st === 'accepted' || st === 'paid') {
      setStage('CONFIRMED');
    }
  }, [booking?.status, booking, navigation, dispatch]);

  // Listen for real-time ride cancelled notification
  useEffect(() => {
    const unsubscribe = notificationService.onRideCancelled((data: any) => {
      if (cancelledHandledRef.current) return;
      const notifBookingId = String(data?.bookingId || data?._id || data?.id || '').trim();
      const currentId = String(bookingId || '').trim();
      if (!currentId || !notifBookingId) return;

      const matches =
        notifBookingId === currentId ||
        notifBookingId.includes(currentId) ||
        currentId.includes(notifBookingId);
      if (!matches) return;

      cancelledHandledRef.current = true;
      dispatch(clearCurrentBooking());
      notificationService.clearPendingRideRequest();
      navigation.navigate('DriverHome', {});
      Alert.alert(
        'Ride Cancelled ❌',
        data?.message || data?.body || 'Customer has cancelled this ride.',
        [{ text: 'OK' }]
      );
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [bookingId, navigation, dispatch]);

  // Derived display fields
  const displayBookingId = booking?._id
    ? '#' + booking._id.slice(-6).toUpperCase()
    : (booking as any)?.bookingId;

  const userObj = typeof booking?.userId === 'object' ? booking.userId : null;
  const customerName = userObj?.name || (booking as any)?.customerName || 'Customer';
  const customerPhone = userObj?.phone || (booking as any)?.customerPhone || '';
  const customerAvatar = userObj?.profileImage || (booking as any)?.customerAvatar || '';
  const customerRating = (booking?.userId as any)?.rating || 4.8;

  const pickupLocation =
    booking?.pickupLocation?.title ||
    booking?.pickupLocation?.address ||
    'Pickup Location';

  const destinationLocation =
    booking?.dropLocation?.title ||
    booking?.dropLocation?.address ||
    'Destination';

  const fareNumeric = Number(booking?.fare) || 0;
  const tokenNumeric =
    Number(booking?.tokenMoney) ||
    Math.round(fareNumeric * 0.1);
  const remainingNumeric = Math.max(0, fareNumeric - tokenNumeric);

  const totalFare = `₹${fareNumeric.toLocaleString('en-IN')}`;
  const tokenFare = `₹${tokenNumeric.toLocaleString('en-IN')}`;
  const remainingFare = `₹${remainingNumeric.toLocaleString('en-IN')}`;

  const distanceText = booking?.distance ? `${booking.distance} km` : '0 km';
  const durationText = (booking as any)?.durationMins || `${Math.round(Number(booking?.distance || 5) * 3)} mins`;

  const vehicleName = (booking?.driverId as any)?.vehicleModel || 'Vehicle';
  const vehiclePlate = (booking?.driverId as any)?.vehicleNo || '';


  // Handle hardware back button navigation - safely return to DriverHome
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (stage === 'IN_PROGRESS') {
          Alert.alert(
            'Trip in Progress',
            'You are currently on an active trip. Complete or end the trip before exiting.',
            [{ text: 'Stay on Trip', style: 'cancel' }]
          );
          return true;
        }
        navigation.navigate('DriverHome', {});
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, stage])
  );

  const handleStartNavigation = async () => {
    const isTripStarted = stage === 'IN_PROGRESS';
    const targetLoc = isTripStarted ? booking?.dropLocation : booking?.pickupLocation;
    const targetAddress = isTripStarted ? destinationLocation : pickupLocation;
    const targetLabel = isTripStarted ? 'Drop Destination' : 'Pickup Location';

    const coords = extractCoords(targetLoc);

    let navUrl = '';
    let webUrl = '';
    let geoUrl = '';

    if (coords && coords.lat && coords.lng) {
      // 1. Android turn-by-turn driving navigation intent
      navUrl = `google.navigation:q=${coords.lat},${coords.lng}&mode=d`;
      // 2. Universal web URL (intercepted by Google Maps app on Android and iOS)
      webUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`;
      // 3. Fallback geo: URI scheme
      geoUrl = `geo:${coords.lat},${coords.lng}?q=${coords.lat},${coords.lng}(${encodeURIComponent(targetLabel)})`;
    } else if (targetAddress && targetAddress !== 'Pickup Location' && targetAddress !== 'Destination') {
      const encoded = encodeURIComponent(targetAddress);
      navUrl = `google.navigation:q=${encoded}&mode=d`;
      webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;
      geoUrl = `geo:0,0?q=${encoded}`;
    } else {
      Alert.alert('Location Missing', 'Coordinates or address not found for this ride.');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const canOpenNav = await Linking.canOpenURL(navUrl).catch(() => false);
        if (canOpenNav) {
          await Linking.openURL(navUrl);
          return;
        }
        const canOpenGeo = await Linking.canOpenURL(geoUrl).catch(() => false);
        if (canOpenGeo) {
          await Linking.openURL(geoUrl);
          return;
        }
      }
      await Linking.openURL(webUrl);
    } catch (err) {
      console.warn('[RideConfirmedScreen] Failed to open Google Maps:', err);
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('Maps Error', 'Could not open Google Maps navigation on this device.');
      });
    }
  };

  const handleCall = () => {
    if (customerPhone) {
      Linking.openURL(`tel:${customerPhone.replace(/\s+/g, '')}`).catch(() => {
        Alert.alert('Calling Customer', `Connecting in-app private call to ${customerName} (${customerPhone})...`);
      });
    } else {
      Alert.alert('Calling Customer', `Connecting in-app private call to ${customerName}...`, [
        { text: 'OK' },
      ]);
    }
  };

  // Step 1: Arrive to Pickup
  const handleArriveToPickup = async () => {
    try {
      setIsActionLoading(true);
      if (bookingId) {
        await dispatch(driverArrivedAction(bookingId)).unwrap();
      }
      setStage('ARRIVED');
      Alert.alert(
        'Arrived at Pickup',
        `Customer ${customerName} has been sent an SMS & app notification that you have arrived at ${pickupLocation}.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Arrive Update Failed', err?.message || 'Could not update arriving status.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Step 2: Open Start Ride OTP Modal
  const handleOpenOtpModal = () => {
    setOtp('');
    setShowOtpModal(true);
  };

  // Step 3: Verify OTP & Start Trip
  const handleVerifyOtpAndStart = async () => {
    const trimmedOtp = otp.trim();
    if (trimmedOtp.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid 4-digit start OTP provided by the passenger.');
      return;
    }
    try {
      setIsActionLoading(true);
      if (bookingId && !bookingId.startsWith('req_')) {
        await dispatch(startTripAction({ bookingId, otp: trimmedOtp })).unwrap();
      }
      setShowOtpModal(false);
      setStage('IN_PROGRESS');
      Alert.alert(
        'Trip Started! 🚗',
        `Trip to ${destinationLocation} is now in progress. Drive safely!`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Start Trip Failed', err?.message || 'Could not start trip.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Step 4: Complete Ride
  const handleCompleteRide = () => {
    setShowCompletionModal(true);
  };

  // Step 5: Final Settlement & Exit
  const handleFinishAndReturnHome = async () => {
    try {
      setIsActionLoading(true);
      if (bookingId) {
        await dispatch(completeTripAction(bookingId)).unwrap();
      }
      setShowCompletionModal(false);
      setStage('COMPLETED');
      Alert.alert(
        'Payment Received & Settled',
        `₹${fareNumeric} credited. Thank you for completing the ride!`,
        [
          {
            text: 'Go to Home Dashboard',
            onPress: () => navigation.navigate('DriverHome', {}),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Completion Failed', err?.message || 'Failed to complete trip.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const isInitialLoading = Boolean(isCurrentBookingLoading && !booking);

  if (isInitialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }} className="text-xs font-medium">
          Loading booking details...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="px-4 py-3 border-b flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DriverHome', {})}
            className="w-9 h-9 items-center justify-center -ml-1 rounded-full mr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackArrowIcon size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: colors.text }} className="text-base font-extrabold">
              {stage === 'CONFIRMED' && 'Booking Confirmed'}
              {stage === 'ARRIVED' && 'Arrived at Pickup'}
              {stage === 'IN_PROGRESS' && 'Trip in Progress'}
              {stage === 'COMPLETED' && 'Ride Completed'}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium">
              Booking ID: {displayBookingId}
            </Text>
          </View>
        </View>

        {/* Dynamic Status Badge */}
        {stage === 'CONFIRMED' && (
          <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-[11px] font-bold text-emerald-600">Token Paid</Text>
          </View>
        )}
        {stage === 'ARRIVED' && (
          <View className="bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
            <Text className="text-[11px] font-bold text-amber-500">At Pickup</Text>
          </View>
        )}
        {stage === 'IN_PROGRESS' && (
          <View
            style={{
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
            }}
            className="px-3 py-1 rounded-full border flex-row items-center"
          >
            <View style={{ backgroundColor: colors.primary }} className="w-2 h-2 rounded-full mr-2" />
            <Text style={{ color: colors.primary }} className="text-[11px] font-bold">On The Way</Text>
          </View>
        )}
        {stage === 'COMPLETED' && (
          <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-[11px] font-bold text-emerald-600">Completed</Text>
          </View>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Stage Progress Header Banner */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          {/* 3-Step Visual Progress Bar */}
          <View className="flex-row items-center justify-between mb-3 px-2">
            {/* Step 1: Confirmed */}
            <View className="items-center">
              <View
                style={{
                  backgroundColor: stage !== 'CONFIRMED' ? '#10B981' : colors.primary,
                }}
                className="w-7 h-7 rounded-full items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
              <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold mt-1">Confirmed</Text>
            </View>

            <View
              style={{
                backgroundColor: stage === 'ARRIVED' || stage === 'IN_PROGRESS' || stage === 'COMPLETED' ? '#10B981' : colors.border,
              }}
              className="flex-1 h-1 mx-2 rounded-full"
            />

            {/* Step 2: Arrived */}
            <View className="items-center">
              <View
                style={{
                  backgroundColor: stage === 'ARRIVED' ? colors.primary : stage === 'IN_PROGRESS' || stage === 'COMPLETED' ? '#10B981' : colors.surfaceSecondary,
                }}
                className="w-7 h-7 rounded-full items-center justify-center"
              >
                <Text
                  style={{
                    color: stage === 'CONFIRMED' ? colors.textMuted : '#FFFFFF',
                  }}
                  className="text-xs font-bold"
                >
                  2
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold mt-1">Arrived</Text>
            </View>

            <View
              style={{
                backgroundColor: stage === 'IN_PROGRESS' || stage === 'COMPLETED' ? '#10B981' : colors.border,
              }}
              className="flex-1 h-1 mx-2 rounded-full"
            />

            {/* Step 3: On Trip */}
            <View className="items-center">
              <View
                style={{
                  backgroundColor: stage === 'IN_PROGRESS' ? colors.primary : stage === 'COMPLETED' ? '#10B981' : colors.surfaceSecondary,
                }}
                className="w-7 h-7 rounded-full items-center justify-center"
              >
                <Text
                  style={{
                    color: stage === 'IN_PROGRESS' || stage === 'COMPLETED' ? '#FFFFFF' : colors.textMuted,
                  }}
                  className="text-xs font-bold"
                >
                  3
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold mt-1">On Trip</Text>
            </View>
          </View>

          {/* Dynamic Stage Message */}
          <View style={{ backgroundColor: colors.surfaceSecondary }} className="rounded-xl p-3 flex-row items-center">
            <View
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              }}
              className="w-7 h-7 rounded-lg items-center justify-center mr-3"
            >
              {stage === 'CONFIRMED' && <Text className="text-xs">📍</Text>}
              {stage === 'ARRIVED' && <Text className="text-xs">👋</Text>}
              {stage === 'IN_PROGRESS' && <Text className="text-xs">🚗</Text>}
              {stage === 'COMPLETED' && <Text className="text-xs">🎉</Text>}
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                {stage === 'CONFIRMED' && `Drive to Pickup (${pickupLocation})`}
                {stage === 'ARRIVED' && 'You have arrived. Ask passenger for start OTP.'}
                {stage === 'IN_PROGRESS' && `Driving to destination: ${destinationLocation}`}
                {stage === 'COMPLETED' && 'Trip completed successfully!'}
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] mt-1">
                {stage === 'CONFIRMED' && 'Tap "Arrived at Pickup" when you reach location.'}
                {stage === 'ARRIVED' && 'Tap "Start Trip" to verify customer OTP and begin.'}
                {stage === 'IN_PROGRESS' && `Collect ${remainingFare} cash/UPI at destination.`}
                {stage === 'COMPLETED' && 'All payments settled.'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Customer Card with Quick Direct Call */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Image
                source={{ uri: customerAvatar }}
                style={{ borderColor: colors.borderLight }}
                className="w-11 h-11 rounded-full mr-3 border"
                resizeMode="cover"
              />
              <View>
                <Text style={{ color: colors.text }} className="text-sm font-extrabold">
                  {customerName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-emerald-500/10 px-2 py-0.5 rounded-full flex-row items-center mr-2 border border-emerald-500/20">
                    <Svg width={9} height={9} viewBox="0 0 24 24" fill="none" className="mr-1">
                      <Circle cx="12" cy="12" r="10" fill="#10B981" />
                      <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                    </Svg>
                    <Text className="text-[9px] font-bold text-emerald-600">
                      Verified Passenger
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold">
                    ★ {customerRating}
                  </Text>
                </View>
              </View>
            </View>

            {/* Direct Call Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleCall}
              style={{
                backgroundColor: isDark ? 'rgba(36, 47, 65, 0.15)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
              }}
              className="border px-3 py-1 rounded-xl flex-row items-center"
            >
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Path
                  d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4741 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5901 20.9046 21.733 20.6407 21.8214C20.3769 21.9099 20.0974 21.942 19.82 21.9157C16.7428 21.5815 13.787 20.5292 11.19 18.8419C8.77382 17.2917 6.70828 15.2262 5.15808 12.81C3.46513 10.2033 2.41243 7.23668 2.0843 4.14999C2.05799 3.87321 2.08985 3.59431 2.17787 3.33089C2.26589 3.06747 2.40808 2.82562 2.59573 2.62061C2.78338 2.41559 3.01209 2.25206 3.26685 2.14041C3.52161 2.02876 3.79672 1.9715 4.075 1.97232H7.075C7.56299 1.96753 8.03541 2.14057 8.40461 2.4593C8.77382 2.77803 9.01463 3.22129 9.08333 3.70666C9.21124 4.6117 9.43265 5.49896 9.74308 6.35332C9.8784 6.72312 9.89745 7.1264 9.79782 7.5073C9.69818 7.88819 9.48427 8.22851 9.18333 8.48332L7.91333 9.75332C9.35123 12.2818 11.4582 14.3888 13.9867 15.8267L15.2567 14.5567C15.5115 14.2557 15.8518 14.0418 16.2327 13.9422C16.6136 13.8425 17.0169 13.8616 17.3867 13.9969C18.241 14.3073 19.1283 14.5287 20.0333 14.6567C20.524 14.7259 20.9715 14.9714 21.2911 15.3468C21.6108 15.7222 21.7808 16.2023 21.77 16.6967L22 16.92Z"
                  stroke={colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={{ color: colors.primary }} className="text-xs font-bold">
                Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Route & Navigation Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider">
              {stage === 'IN_PROGRESS' ? 'Live Driving Route' : 'Trip Route & Location'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleStartNavigation}
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
              }}
              className="px-3 py-1 rounded-md flex-row items-center border"
            >
              <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" className="mr-1">
                <Path d="M3 11L22 2L13 21L11 13L3 11Z" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ color: colors.primary }} className="text-[10px] font-bold">
                Open GPS Maps
              </Text>
            </TouchableOpacity>
          </View>

          {/* Visual Route Timeline */}
          <View style={{ backgroundColor: colors.surfaceSecondary }} className="rounded-xl p-3">
            {/* Pickup */}
            <View className="flex-row items-start">
              <View className="items-center mr-3 mt-1">
                <View className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                <View style={{ backgroundColor: colors.border }} className="w-1 h-6 my-1" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold uppercase">
                  Pickup Location {stage === 'ARRIVED' || stage === 'IN_PROGRESS' ? '(Reached ✓)' : ''}
                </Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                  {pickupLocation}
                </Text>
              </View>
            </View>

            {/* Destination */}
            <View className="flex-row items-start">
              <View className="items-center mr-3 mt-1">
                <View className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold uppercase">
                  Drop Destination
                </Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                  {destinationLocation}
                </Text>
              </View>
            </View>
          </View>

          {/* Timing & Assigned Vehicle */}
          <View style={{ borderTopColor: colors.borderLight }} className="flex-row items-center justify-between mt-3 pt-3 border-t">
            <View>
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-medium">Distance </Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                {distanceText}
              </Text>
            </View>

            <View className="items-end">
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-medium">Vehicle Assigned</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                {vehicleName} ({vehiclePlate})
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Fare & Settlement Summary Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-2"
        >
          <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider mb-3">
            Fare & Payment Settlement
          </Text>

          <View>
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-1 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs">Total Agreed Fare</Text>
              <Text style={{ color: colors.text }} className="text-sm font-black">{totalFare}</Text>
            </View>

            <View className="flex-row justify-between py-1 border-b border-emerald-500/20 bg-emerald-500/10 px-2 rounded-lg mt-1">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-xs font-bold text-emerald-600">Token Paid Online (10%)</Text>
              </View>
              <Text className="text-sm font-black text-emerald-600">{tokenFare}</Text>
            </View>

            <View
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
              }}
              className="flex-row justify-between py-1 px-2 rounded-lg mt-1"
            >
              <View className="flex-row items-center">
                <Text style={{ color: colors.text }} className="text-xs font-bold">Collect at Drop (Cash/UPI)</Text>
              </View>
              <Text style={{ color: colors.primary }} className="text-sm font-black">{remainingFare}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Container */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
        }}
        className="px-5 pt-4 pb-4 border-t"
      >
        {/* Stage 1: Confirmed ➔ Arrive to Pickup */}
        {stage === 'CONFIRMED' && (
          <View>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleArriveToPickup}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 rounded-xl flex-row items-center justify-center shadow-md"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Circle cx="12" cy="9" r="2.5" stroke="#FFFFFF" strokeWidth="2" />
              </Svg>
              <Text className="text-white font-bold text-sm">
                Arrive to Pickup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleStartNavigation}
              style={{ backgroundColor: colors.surfaceSecondary }}
              className="w-full py-3 rounded-xl flex-row items-center justify-center mt-3"
            >
              <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Path d="M3 11L22 2L13 21L11 13L3 11Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ color: colors.text }} className="font-bold text-xs">
                Start GPS Navigation
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stage 2: Arrived ➔ Start Trip (Opens OTP) */}
        {stage === 'ARRIVED' && (
          <View>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleOpenOtpModal}
              className="w-full bg-emerald-600 py-4 rounded-xl flex-row items-center justify-center active:bg-emerald-700"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Path d="M5 12L19 12M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text className="text-white font-bold text-sm">
                Start Trip (Enter OTP)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCall}
              style={{ backgroundColor: colors.surfaceSecondary }}
              className="w-full py-3 rounded-xl flex-row items-center justify-center mt-3"
            >
              <Text style={{ color: colors.text }} className="font-bold text-xs">
                Call Passenger
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stage 3: In Progress ➔ Complete Ride */}
        {stage === 'IN_PROGRESS' && (
          <View>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCompleteRide}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 rounded-xl flex-row items-center justify-center shadow-md"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Circle cx="12" cy="12" r="10" fill="#22C55E" />
                <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              </Svg>
              <Text className="text-white font-bold text-sm">
                Arrived at Destination • Complete Ride
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleStartNavigation}
              style={{ backgroundColor: colors.surfaceSecondary }}
              className="w-full py-3 rounded-xl flex-row items-center justify-center mt-3"
            >
              <Text style={{ color: colors.text }} className="font-bold text-xs">
                Open GPS Destination Route
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stage 4: Completed State */}
        {stage === 'COMPLETED' && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('DriverHome', {})}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-4 rounded-xl flex-row items-center justify-center"
          >
            <Text className="text-white font-bold text-sm">
              Return to Home Dashboard
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MODAL 1: OTP Verification to Start Ride (In-Tree Overlay) */}
      {showOtpModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.modalBackdrop,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            zIndex: 999,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="w-full rounded-xl p-6 border shadow-2xl"
          >
            {/* Header */}
            <View className="items-center mb-4">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="w-12 h-12 rounded-full items-center justify-center mb-2 border"
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="11" width="18" height="11" rx="2" stroke={colors.primary} strokeWidth="2" />
                  <Path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke={colors.primary} strokeWidth="2" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-base font-black text-center">
                Enter Start Ride OTP
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1">
                Ask passenger <Text style={{ color: colors.text }} className="font-bold">{customerName}</Text> for the 4-digit PIN to start the trip.
              </Text>
            </View>

            {/* OTP Input */}
            <View
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.primary,
              }}
              className="border rounded-xl px-4 py-3 mb-4 items-center"
            >
              <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="4-digit OTP"
                placeholderTextColor={colors.textMuted}
                style={{ color: colors.text }}
                className="text-xl font-black tracking-widest text-center w-full py-0"
              />
            </View>

            {/* Modal Actions */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleVerifyOtpAndStart}
              disabled={isActionLoading || otp.trim().length !== 4}
              style={{
                backgroundColor:
                  otp.trim().length === 4 && !isActionLoading
                    ? colors.primary
                    : isDark
                      ? '#374151'
                      : '#D1D5DB',
              }}
              className="w-full py-4 rounded-xl items-center justify-center shadow-md"
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  Verify OTP & Start Ride →
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowOtpModal(false)}
              className="w-full py-3 items-center justify-center mt-1"
            >
              <Text style={{ color: colors.textSecondary }} className="font-bold text-xs">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MODAL 2: Complete Ride & Payment Settlement (In-Tree Overlay) */}
      {showCompletionModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.modalBackdrop,
            justifyContent: 'flex-end',
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowCompletionModal(false)}
            style={{ flex: 1 }}
          />

          <View
            style={{
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            }}
            className="w-full rounded-t-2xl p-5 border-t shadow-2xl"
          >
            {/* Header */}
            <View className="items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-emerald-500/10 items-center justify-center mb-2 border border-emerald-500/20">
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 13L9 17L19 7" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={{ color: colors.text }} className="text-lg font-black text-center">
                Destination Reached!
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1">
                Collect remaining balance & settle trip
              </Text>
            </View>

            {/* Payment Summary Box */}
            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
              className="border rounded-xl p-3 mb-3"
            >
              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-1 border-b">
                <Text style={{ color: colors.textMuted }} className="text-xs">Total Ride Fare</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">{totalFare}</Text>
              </View>
              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-1 border-b">
                <Text className="text-xs text-emerald-600 font-medium">Token Already Paid</Text>
                <Text className="text-xs font-bold text-emerald-600">{tokenFare}</Text>
              </View>
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                }}
                className="flex-row justify-between items-center py-1 rounded-lg px-2 mt-2"
              >
                <View>
                  <Text style={{ color: colors.text }} className="text-xs font-bold">Cash/UPI to Collect</Text>
                  <Text style={{ color: colors.textMuted }} className="text-[9px]">Collect directly from passenger</Text>
                </View>
                <Text style={{ color: colors.primary }} className="text-base font-black">{remainingFare}</Text>
              </View>
            </View>

            {/* Passenger Rating Stars */}
            <View className="items-center mb-4">
              <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-2">
                Rate passenger {customerName}
              </Text>
              <View className="flex-row space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                    className="p-1"
                  >
                    <Text className={`text-xl ${star <= rating ? 'text-amber-400' : 'text-slate-500'}`}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Settle & Finish Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleFinishAndReturnHome}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 rounded-xl flex-row items-center justify-center shadow-md"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Circle cx="12" cy="12" r="10" fill="#22C55E" />
                <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              </Svg>
              <Text className="text-white font-bold text-sm">
                Cash Collected • Complete Ride
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RideConfirmedScreen;
