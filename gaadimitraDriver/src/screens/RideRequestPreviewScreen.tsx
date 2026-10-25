import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverRideRequestPreviewNavigationProp,
  DriverRideRequestPreviewRouteProp,
} from '../types/navigation';
import {
  BackArrowIcon,
} from '../assets/icons/DriverIcons';
import { getRideById } from '../utils/rideRequests';
import { useTheme } from '../theme';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBookingById,
  acceptBookingAction,
  rejectBookingAction,
  clearCurrentBooking,
} from '../store/slices/bookingSlice';
import { notificationService } from '../services/notificationService';
import { soundService } from '../services/soundService';

export const RideRequestPreviewScreen: React.FC = () => {
  const navigation = useNavigation<DriverRideRequestPreviewNavigationProp>();
  const route = useRoute<DriverRideRequestPreviewRouteProp>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { currentBooking, isCurrentBookingLoading } = useAppSelector((state) => state.booking);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const bookingId = route.params?.requestId;

  // Immediately stop ringing sound when preview screen is opened
  useEffect(() => {
    soundService.stopSound();
    return () => {
      soundService.stopSound();
    };
  }, []);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(bookingId));
    }
  }, [bookingId, dispatch]);

  const isMatchingBooking = Boolean(
    bookingId &&
    currentBooking &&
    (currentBooking._id === bookingId || (currentBooking as any)?.id === bookingId)
  );

  const booking = isMatchingBooking ? currentBooking : null;
  const isLoading = Boolean(isCurrentBookingLoading && !booking);

  const cancelledHandledRef = useRef(false);

  // If live booking data indicates ride was cancelled (strictly for this bookingId)
  useEffect(() => {
    if (
      isMatchingBooking &&
      (booking?.status === 'cancelled' || booking?.status === 'rejected') &&
      !cancelledHandledRef.current
    ) {
      cancelledHandledRef.current = true;
      dispatch(clearCurrentBooking());
      notificationService.clearPendingRideRequest();
      navigation.navigate('DriverHome', {});
      Alert.alert(
        'Ride Cancelled ❌',
        (booking as any)?.cancellationReason || 'This ride request has been cancelled by customer.',
        [{ text: 'OK' }]
      );
    }
  }, [isMatchingBooking, booking?.status, booking, navigation, dispatch]);

  // Real-time cancellation push notification while viewing preview
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
        data?.message || data?.body || 'Customer has cancelled this ride request.',
        [{ text: 'OK' }]
      );
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [bookingId, navigation, dispatch]);

  const bookingUser = currentBooking?.userId && typeof currentBooking.userId === 'object' ? (currentBooking.userId as any) : null;
  const customerName = bookingUser?.name || 'Customer';
  const customerPhone = bookingUser?.phone || '';
  const customerAvatar = bookingUser?.profileImage || null;


  const fareNumeric = Number(currentBooking?.fare) || 0;
  const tokenNumeric =
    Number(currentBooking?.tokenMoney) ||

    Math.round(fareNumeric * 0.1);
  const remainingNumeric = Math.max(0, fareNumeric - tokenNumeric);


  function formateDate(date: string) {
    return new Date(date).toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }



  const handleAccept = async () => {
    if (isSubmitting) return;
    try {
      soundService.stopSound();
      setIsSubmitting(true);
      const bId = bookingId || (route.params as any)?.requestId || booking?._id;
      if (bId) {
        await dispatch(acceptBookingAction(bId)).unwrap();
      }
      soundService.stopSound();
      notificationService.clearPendingRideRequest();
      navigation.navigate('DriverRideAccepted', { requestId: bId });
    } catch (err: any) {
      Alert.alert('Accept Booking', err?.message || 'Failed to accept booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    soundService.stopSound();
    Alert.alert(
      'Reject Request?',
      'Are you sure you want to reject this ride request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              soundService.stopSound();
              const bId = booking?._id || (route.params as any)?.requestId;
              if (bId) {
                await dispatch(rejectBookingAction(bId)).unwrap();
              }
            } catch (err) {
              console.warn('Reject booking error:', err);
            }
            notificationService.clearPendingRideRequest();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (customerPhone) {
      Linking.openURL(`tel:${customerPhone.replace(/\s+/g, '')}`).catch(() => {
        Alert.alert('Calling Customer', `Connecting to ${customerName} (${customerPhone})...`);
      });
    } else {
      Alert.alert('Calling Customer', `Connecting in-app private call to ${customerName}...`, [
        { text: 'OK' },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Clean Top Navigation Bar */}
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
            onPress={() => navigation.goBack()}
            className="w-9 h-9 items-center justify-center -ml-1 rounded-full mr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackArrowIcon size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: colors.text }} className="text-base font-extrabold">
              Ride Request Details
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium">
              Review trip details before accepting
            </Text>
          </View>
        </View>

        {/* Tag */}
        <View
          style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
          }}
          className="px-3 py-1 rounded-md border"
        >
          <Text style={{ color: colors.primary }} className="text-[10px] font-bold">
            Active Request
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-3">
            Loading ride request details...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Customer Profile Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 flex-row items-center justify-between mb-4"
          >
            <View className="flex-row items-center flex-1 mr-2">
              {customerAvatar ? (
                <Image
                  source={{ uri: customerAvatar }}
                  style={{ borderColor: colors.borderLight }}
                  className="w-11 h-11 rounded-full mr-3 border"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3 border border-blue-200 dark:border-blue-700">
                  <Text className="text-base font-bold text-blue-600 dark:text-blue-300">
                    {customerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-sm font-extrabold" numberOfLines={1}>
                  {customerName}
                </Text>
                <View className="flex-row items-center mt-1">

                  <View className="bg-emerald-500/10 px-2 py-0.5 rounded">
                    <Text className="text-[9px] font-bold text-emerald-600">
                      Verified
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCall}
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
              }}
              className="w-8 h-8 rounded-full items-center justify-center border"
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4741 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5901 20.9046 21.733 20.6407 21.8214C20.3769 21.9099 20.0974 21.942 19.82 21.9157C16.7428 21.5815 13.787 20.5292 11.19 18.8419C8.77382 17.2917 6.70828 15.2262 5.15808 12.81C3.46513 10.2033 2.41243 7.23668 2.0843 4.14999C2.05799 3.87321 2.08985 3.59431 2.17787 3.33089C2.26589 3.06747 2.40808 2.82562 2.59573 2.62061C2.78338 2.41559 3.01209 2.25206 3.26685 2.14041C3.52161 2.02876 3.79672 1.9715 4.075 1.97232H7.075C7.56299 1.96753 8.03541 2.14057 8.40461 2.4593C8.77382 2.77803 9.01463 3.22129 9.08333 3.70666C9.21124 4.6117 9.43265 5.49896 9.74308 6.35332C9.8784 6.72312 9.89745 7.1264 9.79782 7.5073C9.69818 7.88819 9.48427 8.22851 9.18333 8.48332L7.91333 9.75332C9.35123 12.2818 11.4582 14.3888 13.9867 15.8267L15.2567 14.5567C15.5115 14.2557 15.8518 14.0418 16.2327 13.9422C16.6136 13.8425 17.0169 13.8616 17.3867 13.9969C18.241 14.3073 19.1283 14.5287 20.0333 14.6567C20.524 14.7259 20.9715 14.9714 21.2911 15.3468C21.6108 15.7222 21.7808 16.2023 21.77 16.6967L22 16.92Z"
                  stroke={colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* 2. Route Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mb-4"
          >
            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider mb-3">
              Route Details
            </Text>

            <View style={{ backgroundColor: colors.surfaceSecondary }} className="rounded-xl p-3">
              {/* Pickup */}
              <View className="flex-row items-start">
                <View className="items-center mr-3 mt-1">
                  <View className="w-3 h-3 rounded-full bg-emerald-500" />
                  <View style={{ backgroundColor: colors.border }} className="w-1 h-6 my-1" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold uppercase">
                    Pickup Location
                  </Text>
                  <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                    {currentBooking?.pickupLocation?.title || 'Pickup Location'}
                  </Text>
                </View>
              </View>

              {/* Destination */}
              <View className="flex-row items-start">
                <View className="items-center mr-3 mt-1">
                  <View className="w-3 h-3 rounded-full bg-rose-500" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold uppercase">
                    Destination Drop
                  </Text>
                  <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                    {currentBooking?.dropLocation?.title || 'Drop Location'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Date, Distance & Time Bar */}
            <View style={{ borderTopColor: colors.borderLight }} className="flex-row items-center justify-between mt-3 pt-3 border-t">
              <View>
                <Text style={{ color: colors.textMuted }} className="text-[10px] font-medium">Pickup Date & Time</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                  {formateDate(booking?.createdAt || '')}
                </Text>
              </View>

              <View className="items-end">
                <Text style={{ color: colors.textMuted }} className="text-[10px] font-medium">Distance </Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                  {currentBooking?.distance} KM
                </Text>
              </View>
            </View>
          </View>

          {/* 3. Fare Breakdown Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mb-4"
          >
            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider mb-3">
              Fare & Token Split
            </Text>

            <View>
              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-1 border-b">
                <Text style={{ color: colors.textMuted }} className="text-xs">Total Ride Fare</Text>
                <Text style={{ color: colors.text }} className="text-sm font-black">
                  ₹{fareNumeric.toLocaleString('en-IN')}
                </Text>
              </View>

              <View className="flex-row justify-between py-1 border-b border-emerald-500/20 bg-emerald-500/10 px-2 rounded-lg mt-1">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-xs font-bold text-emerald-600">Token Advance</Text>
                </View>
                <Text className="text-sm font-black text-emerald-600">
                  ₹{tokenNumeric.toLocaleString('en-IN')}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                }}
                className="flex-row justify-between py-1 px-2 rounded-lg mt-1"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: colors.text }} className="text-xs font-bold">Collect at Drop</Text>
                </View>
                <Text style={{ color: colors.primary }} className="text-sm font-black">
                  ₹{remainingNumeric.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          {/* 4. Action Buttons (Accept / Reject) */}
          <View className="space-y-3">
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={isSubmitting}
              onPress={handleAccept}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 rounded-xl flex-row items-center justify-center shadow-md"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm mr-2">
                    Accept Ride Request
                  </Text>
                  <Text className="text-white text-sm">➔</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isSubmitting}
              onPress={handleReject}
              className="w-full py-3 items-center justify-center mt-1"
            >
              <Text className="text-rose-500 font-bold text-xs">
                Reject / Ignore
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RideRequestPreviewScreen;
