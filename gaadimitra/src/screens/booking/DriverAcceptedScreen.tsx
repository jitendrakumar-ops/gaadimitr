import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
  BackHandler,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverAcceptedScreenNavigationProp,
  DriverAcceptedScreenRouteProp,
  DriverInfo,
  TripInfoData,
} from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import { CelebrationBadge } from '../../components/booking/CelebrationBadge';
import { DriverSummaryCard } from '../../components/booking/DriverSummaryCard';
import { FareSummaryTable } from '../../components/booking/FareSummaryTable';
import { InfoNoteBox } from '../../components/booking/InfoNoteBox';
import { CheckCircleIcon, LockFilledIcon, CarBadgeIcon, ClockOutlineIcon, CrossCircleIcon } from '../../assets/icons/Icons';
import { useTheme } from '../../theme';
import { ridesService } from '../../services/rides';
import { bookingService } from '../../services/bookingService';
import { driverService } from '../../services/driverService';
import { notificationService } from '../../services/notificationService';
import {
  useAppDispatch,
  useAppSelector,
  setActiveRide,
  setSelectedDriver,
  updateActiveRideStatus,
  cancelBooking,
  payBookingToken,
} from '../../store';
import { toast } from '../../components/common/ToastNotification';

const CANCEL_REASONS = [
  'Driver is taking too long',
  'Driver asked to cancel',
  'Changed my mind / No longer needed',
  'Selected wrong pickup or drop location',
  'Found another vehicle / cab',
  'Other',
];

export const DriverAcceptedScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<DriverAcceptedScreenNavigationProp>();
  const route = useRoute<DriverAcceptedScreenRouteProp>();
  const dispatch = useAppDispatch();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'wallet'>('upi');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const initialStatus = ((route.params as any)?.status || 'requested').toLowerCase();
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus);
  const [liveBookingData, setLiveBookingData] = useState<any>(null);

  const isDriverAccepted =
    currentStatus !== 'requested' &&
    currentStatus !== 'pending' &&
    currentStatus !== '' &&
    currentStatus !== 'cancelled' &&
    currentStatus !== 'rejected';

  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const currentStatusRef = useRef(currentStatus);
  const requestedBookingIdsRef = useRef(new Set<string>());
  const requestedDriverIdsRef = useRef(new Set<string>());

  const { selectedDriver } = useAppSelector((state) => state.drivers);
  const { activeBooking, currentBooking } = useAppSelector((state) => state.bookings);

  const rawBookingId =
    route.params?.bookingId ||
    activeBooking?._id ||
    activeBooking?.id ||
    currentBooking?._id ||
    currentBooking?.id ||
    '';
  const bookingId = rawBookingId || `#RIDE${Date.now().toString().slice(-5)}`;

  const driver: DriverInfo | null = React.useMemo(() => {
    // 1. Check if backend returned populated driver in live booking
 

   
    if (selectedDriver) {
      const vehicle = typeof selectedDriver.vehicleId === 'object' ? selectedDriver.vehicleId : null;
      return {
        id: selectedDriver._id || selectedDriver.id || '',
        name: selectedDriver.userId?.name || (selectedDriver as any).name || 'Driver Partner',
        phone: selectedDriver.userId?.phone || (selectedDriver as any).phone || '',
        profileImage: selectedDriver.userId?.profileImage || (selectedDriver as any).profileImage || null,
        pin: selectedDriver.userId?.pin || (selectedDriver as any).pin || '',
        rating: selectedDriver.rating !== undefined ? Number(selectedDriver.rating).toFixed(1) : '5.0',
        totalRides: selectedDriver.totalTripsCount ?? (selectedDriver as any).totalRides ?? 0,
        experienceYears: selectedDriver.experienceYears ?? selectedDriver.userId?.experienceYears ?? 0,
        distance: selectedDriver.distanceKm ? `${selectedDriver.distanceKm} km away` : 'Nearby',
        isVerified: Boolean(selectedDriver.isVerified ?? true),
        vehicleModel: selectedDriver.vehicleModel || 'Vehicle',
        vehicleType: selectedDriver.type || vehicle?.type || 'Car',
        vehiclePlate: selectedDriver.vehicleNo || 'Not Registered',
        hasAc: Boolean(selectedDriver.type),
        seatingCapacity: selectedDriver.seating ?? `${selectedDriver.seating} Seats`,
        driverVehicleImg: selectedDriver.vehicleImages,
        vehicleImage: (selectedDriver.vehicleImages && selectedDriver.vehicleImages.length > 0)
          ? selectedDriver.vehicleImages[0]
          : (vehicle?.image || null),
      };
    }
    return null;
  }, [liveBookingData?.driverId, route.params?.driver, selectedDriver]);

  const agreedFare = route.params?.agreedFare || liveBookingData?.fare || 0;
  const bookingToken =
    liveBookingData?.tokenMoney;
  const name = route.params?.name;
  const phone = route.params?.phone;

  const tripInfo: TripInfoData = route.params?.tripInfo || {
    pickupLocation: '',
    destination: '',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    pickupTime: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    passengers: driver?.seatingCapacity || '4 Seats',
    vehicleModel: driver?.vehicleModel || '',
  };

  const driverFirstName = driver?.name?.split(' ')[0] || 'Driver';
  const driverFirstNameRef = useRef(driverFirstName);
  const remainingFare = Math.max(0, agreedFare - bookingToken);

  useEffect(() => {
    currentStatusRef.current = currentStatus;
  }, [currentStatus]);

  useEffect(() => {
    driverFirstNameRef.current = driverFirstName;
  }, [driverFirstName]);

  // Navigate directly to Home
  const handleGoHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeDashboard' }],
    });
  }, [navigation]);

  // Handle hardware Android back button to go directly to Home
  useEffect(() => {
    const backAction = () => {
      handleGoHome();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [handleGoHome]);
  const handleCancelRequest = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Other') {
      if (!otherReason.trim()) {
        toast.showError('Please enter a cancellation reason.', 'Reason Required');
        return;
      }
      finalReason = otherReason.trim();
    }

    setIsCancelling(true);
    try {
      const idToCancel = rawBookingId || bookingId;
      if (idToCancel && !idToCancel.startsWith('#')) {
        await dispatch(cancelBooking({ bookingId: idToCancel, reason: finalReason })).unwrap();
      }
    } catch (err: any) {
      console.log('Cancel booking error/warning:', err);
    } finally {
      ridesService.updateRideStatus(bookingId, 'cancelled');
      dispatch(updateActiveRideStatus({ bookingId, status: 'cancelled' }));
      setIsCancelling(false);
      setShowCancelModal(false);
      handleGoHome();
    }
  };

  const renderCancelModal = () => (
    <Modal
      visible={showCancelModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        if (!isCancelling) setShowCancelModal(false);
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View
          style={{ backgroundColor: colors.card }}
          className="rounded-t-3xl p-6 shadow-2xl max-h-[85%]"
        >
          {/* Sheet Handle */}
          <View className="items-center mb-4">
            <View style={{ backgroundColor: colors.border }} className="w-12 h-1.5 rounded-full mb-3" />
            <Text style={{ color: colors.text }} className="text-xl font-black">
              Cancel Ride Request
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs mt-1 text-center">
              Please choose a reason for cancellation
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            {CANCEL_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  activeOpacity={0.7}
                  onPress={() => setSelectedReason(reason)}
                  style={{
                    backgroundColor: isSelected ? `${colors.primary}12` : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                  className="p-3.5 rounded-xl border flex-row items-center justify-between mb-2.5"
                >
                  <Text
                    style={{ color: isSelected ? colors.primary : colors.text }}
                    className="text-xs font-semibold flex-1 mr-2"
                  >
                    {reason}
                  </Text>
                  <View
                    style={{
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    }}
                    className="w-5 h-5 rounded-full border items-center justify-center"
                  >
                    {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Custom Reason Input if "Other" is selected */}
            {selectedReason === 'Other' && (
              <View className="mt-1 mb-2">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-1.5">
                  Enter your reason:
                </Text>
                <TextInput
                  value={otherReason}
                  onChangeText={setOtherReason}
                  placeholder="Tell us why you are cancelling..."
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={3}
                  maxLength={250}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    textAlignVertical: 'top',
                  }}
                  className="p-3 rounded-xl border text-xs min-h-[70px]"
                />
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="pt-2">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleConfirmCancel}
              disabled={isCancelling}
              style={{
                backgroundColor: '#DC2626',
                shadowColor: '#DC2626',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 5,
              }}
              className="w-full py-4 rounded-xl flex-row items-center justify-center border border-red-500 mb-2.5"
            >
              {isCancelling ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-white text-sm font-extrabold ml-2">
                    Cancelling Ride...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <CrossCircleIcon size={18} color="#FFFFFF" />
                  <Text className="text-white text-base font-black tracking-wide ml-2">
                    Cancel Ride
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isCancelling}
              onPress={() => setShowCancelModal(false)}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="w-full py-3.5 rounded-xl items-center justify-center border"
            >
              <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">
                Don't Cancel (Keep Request)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Real-time Status Sync from Server
  const handleStatusUpdate = useCallback(
    (b: any) => {
      const st = (b?.status || '').toLowerCase();
      if (!st) return;

      setLiveBookingData((current: any) => ({ ...(current || {}), ...b }));

      if (st !== currentStatusRef.current) {
        if (__DEV__) {
          console.log(`🚕 [DriverAcceptedScreen] Status updated from "${currentStatusRef.current}" to "${st}"`);
        }
        setCurrentStatus(st);
        ridesService.updateRideStatus(bookingId, st as any);
        dispatch(updateActiveRideStatus({ bookingId, status: st as any }));

        if (st === 'accepted') {
          toast.showSuccess(
            `${driverFirstNameRef.current} has accepted your ride request! Complete token payment to confirm.`,
            'Driver Accepted! 🎉',
            5000
          );
        } else if (st === 'cancelled' || st === 'rejected') {
          toast.showError('This ride request was cancelled or declined by driver.', 'Ride Declined');
        }
      }
    },
    [bookingId, dispatch]
  );

  const checkBookingStatus = useCallback(async () => {
    const idToFetch = rawBookingId;
    if (!idToFetch || idToFetch.startsWith('#') || requestedBookingIdsRef.current.has(idToFetch)) return;
    requestedBookingIdsRef.current.add(idToFetch);

    try {
      const res = await bookingService.getBookingById(idToFetch);
      const b = res?.booking || res?.data || res;
      if (!b?.status) return;

      handleStatusUpdate(b);

      const driverIdToFetch = typeof b.driverId === 'object'
        ? b.driverId?._id || b.driverId?.id
        : b.driverId;

      if (!driverIdToFetch || requestedDriverIdsRef.current.has(driverIdToFetch)) return;
      requestedDriverIdsRef.current.add(driverIdToFetch);

      try {
        const driverRes = await driverService.getDriverById(driverIdToFetch);
        const driverUser: Record<string, any> = driverRes?.userId || {};
        const bookingUser: Record<string, any> = b?.userId || {};
        const userId = {
          ...(driverUser._id || bookingUser._id ? { _id: driverUser._id || bookingUser._id } : {}),
          ...(driverUser.id || bookingUser.id || driverUser._id || bookingUser._id
            ? { id: driverUser.id || bookingUser.id || driverUser._id || bookingUser._id }
            : {}),
          name: driverUser.name || bookingUser.name || 'Driver Partner',
          phone: driverUser.phone || bookingUser.phone || '',
          profileImage: driverUser.profileImage || bookingUser.profileImage || null,
          pin: driverUser.pin ?? bookingUser.pin ?? driverRes?.pin ?? b?.pin ?? '',
          experienceYears: driverUser.experienceYears ?? bookingUser.experienceYears ?? null,
        };

        dispatch(setSelectedDriver({
          ...(driverRes || {}),
          _id: driverRes?._id || driverIdToFetch,
          id: driverRes?.id || driverIdToFetch,
          pin: driverRes?.pin ?? driverUser.pin ?? bookingUser.pin ?? b?.pin ?? '',
          userId,
          vehicleId: driverRes?.vehicleId || b?.vehicleId || null,
          vehicleModel: driverRes?.vehicleModel || b?.driverId?.vehicleModel || b?.vehicleId?.title || 'Vehicle',
          vehicleNo: driverRes?.vehicleNo || b?.driverId?.vehicleNo || 'Not Registered',
          rating: driverRes?.rating ?? b?.driverId?.rating ?? 5,
          seating: driverRes?.seating ?? b?.vehicleId?.seat ?? null,
          type: driverRes?.type || b?.vehicleId?.type || '',
          vehicleImages: driverRes?.vehicleImages || (b?.vehicleId?.image ? [b.vehicleId.image] : []),
        }));
      } catch (driverErr) {
        if (__DEV__) {
          console.log('Error fetching driver profile by driverId:', driverErr);
        }
      }
    } catch (err) {
      if (__DEV__) {
        console.log('Error checking booking status by ID:', err);
      }
    }
  }, [rawBookingId, handleStatusUpdate]);

  // Initial check on mount
  useEffect(() => {
    if (!rawBookingId || rawBookingId.startsWith('#')) return;
    checkBookingStatus();
  }, [rawBookingId, checkBookingStatus]);

  useEffect(() => {
    const unsubscribe = notificationService.addListener((remoteMessage) => {
      const data = remoteMessage.data || {};
      const type = String(data.type || '').toLowerCase();
      const status = String(data.status || '').toLowerCase();
      const title = remoteMessage.notification?.title || String(data.title || '');
      const body = remoteMessage.notification?.body || String(data.body || data.message || '');
      const isAccepted =
        type === 'booking_accepted' ||
        type === 'driver_accepted' ||
        status === 'accepted' ||
        title.toLowerCase().includes('accept') ||
        body.toLowerCase().includes('accept');

      if (!isAccepted) return;

      const notificationBookingId = String(data.bookingId || data.booking_id || '');
      if (notificationBookingId && notificationBookingId !== rawBookingId) return;

      handleStatusUpdate({
        status: status || 'accepted',
        bookingId: notificationBookingId || rawBookingId,
      });
    });

    return unsubscribe;
  }, [handleStatusUpdate, rawBookingId]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    if (!isDriverAccepted) {
      pulse.start();
    }

    return () => pulse.stop();
  }, [isDriverAccepted, pulseAnimation]);

  const handlePayToken = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    try {
      if (rawBookingId) {
        await dispatch(
          payBookingToken({
            bookingId: rawBookingId,
            paymentMethod: selectedMethod,
            amount: Number(bookingToken) || 0,
          })
        ).unwrap();
      }

      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      ridesService.updateRideStatus(bookingId, 'active');
      dispatch(updateActiveRideStatus({ bookingId, status: 'active' }));
      toast.showSuccess('Booking token payment successful!');
      navigation.navigate('RideConfirmed', {
        driver: driver || undefined,
        agreedFare,
        tripInfo,
        bookingToken,
        bookingId,
      });
    } catch (err: any) {
      setIsProcessingPayment(false);
      const errMsg =
        err?.message ||
        (typeof err === 'string' ? err : 'Failed to process payment. Please try again.');
      toast.showError(errMsg);
      Alert.alert('Payment Error', errMsg);
    }
  };

  // If driver cancelled or declined
  if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-center items-center px-6">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderBar onBackPress={handleGoHome} />
        <View className="flex-1 items-center justify-center w-full px-4">
          <View style={{ backgroundColor: '#FEE2E2', padding: 22, borderRadius: 50, marginBottom: 16 }}>
            <CrossCircleIcon size={44} color="#DC2626" />
          </View>
          <Text style={{ color: colors.text }} className="text-xl font-black text-center">
            Ride Request {currentStatus === 'rejected' ? 'Declined' : 'Cancelled'}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-2 mb-6 max-w-[280px] leading-5">
            The driver was unable to accept this request. Please try requesting another vehicle or driver.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoHome}
            style={{ backgroundColor: colors.primary }}
            className="px-6 py-3.5 rounded-xl w-full items-center shadow-md"
          >
            <Text className="text-white font-bold text-sm">Find Another Driver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!driver) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderBar onBackPress={handleGoHome} />
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: colors.text }} className="text-base font-bold text-center">
            Booking information not available
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleGoHome}
            style={{ backgroundColor: colors.primary }}
            className="mt-4 px-6 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isDriverAccepted) {
    const pulseScale = pulseAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.08],
    });
    const ring1Scale = pulseAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });
    const ring1Opacity = pulseAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    });
    const ring2Scale = pulseAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.0],
    });
    const ring2Opacity = pulseAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0],
    });

    return (
      <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderBar onBackPress={handleGoHome} />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero sonar animation ─────────────────── */}
          <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 28 }}>
            {/* Ring 2 — farthest */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                width: 96, height: 96, borderRadius: 48,
                backgroundColor: `${colors.primary}20`,
                transform: [{ scale: ring2Scale }],
                opacity: ring2Opacity,
              }}
            />
            {/* Ring 1 */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                width: 96, height: 96, borderRadius: 48,
                backgroundColor: `${colors.primary}35`,
                transform: [{ scale: ring1Scale }],
                opacity: ring1Opacity,
              }}
            />
            {/* Core button */}
            <Animated.View
              style={{
                width: 96, height: 96, borderRadius: 48,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pulseScale }],
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 14,
                elevation: 10,
              }}
            >
              <ClockOutlineIcon size={40} color="#FFFFFF" strokeWidth={2.2} />
            </Animated.View>
          </View>

          {/* ── Title ─────────────────────────────────── */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text
              style={{ color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}
            >
              Waiting for Acceptance
            </Text>

            {/* Live searching badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
                backgroundColor: `${colors.primary}12`,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
                Contacting {driverFirstName}...
              </Text>
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                fontWeight: '500',
                textAlign: 'center',
                marginTop: 12,
                lineHeight: 20,
                paddingHorizontal: 8,
              }}
            >
              Booking details will appear here as soon as the driver accepts your request.
            </Text>
          </View>

          {/* ── Driver card ───────────────────────────── */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isDark ? 0.25 : 0.07,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            {/* Label row */}
            <Text
              style={{
                color: colors.placeholder,
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Requested Driver
            </Text>

            {/* Driver row */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Photo / vehicle thumbnail */}
              <View
                style={{
                  width: 56, height: 56,
                  borderRadius: 16,
                  backgroundColor: `${colors.primary}10`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}25`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  overflow: 'hidden',
                }}
              >
                {driver.vehicleImage ? (
                  <Image source={{ uri: driver.vehicleImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <CarBadgeIcon size={26} color={colors.primary} />
                )}
              </View>

              {/* Name + vehicle */}
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>
                  {driver.name || name || 'Driver'}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500', marginTop: 2 }} numberOfLines={1}>
                  {[driver.vehicleModel, driver.vehiclePlate && driver.vehiclePlate !== 'Not Registered' ? driver.vehiclePlate : null]
                    .filter(Boolean).join('  ·  ') || 'Vehicle info loading...'}
                </Text>
              </View>

              {/* Pending badge */}
              <View
                style={{
                  backgroundColor: '#FFFBEB',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#FCD34D',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: '#D97706', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
                  PENDING
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

            {/* Status row */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                Checking driver availability...
              </Text>
            </View>
          </View>

          {/* ── Eta hint ──────────────────────────────── */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginBottom: 20,
            }}
          >
            <ClockOutlineIcon size={14} color={colors.placeholder} strokeWidth={2} />
            <Text style={{ color: colors.placeholder, fontSize: 12, fontWeight: '500', marginLeft: 8 }}>
              This usually takes less than a minute
            </Text>
          </View>

          {/* ── Cancel button ─────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCancelRequest}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 13,
            }}
          >
            <CrossCircleIcon size={15} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginLeft: 7 }}>
              Cancel Request
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {renderCancelModal()}
      </SafeAreaView>
    );
  }
console.log('🚕 [DriverAcceptedScreen] Rendering driver accepted screen with driver:', driver);

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Navigation Bar */}
      <HeaderBar onBackPress={handleGoHome} />

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
          {/* Confetti & Green Success Checkmark */}
          <CelebrationBadge size={105} />

          {/* Title & Subtitle */}
          <View className="items-center mb-4">
            <Text style={{ color: colors.text }} className="text-2xl font-black tracking-tight text-center">
              Driver accepted
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-medium mt-1 text-center">
              {driverFirstName} has accepted your request.
            </Text>
          </View>

          {/* Driver Card */}
          <DriverSummaryCard driver={driver} className="mb-3.5" />

          {/* Driver Accepted Status Banner */}
          <View className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 mb-3.5 items-center">
            <View className="flex-row items-center">
              <CheckCircleIcon size={16} color="#15803D" />
              <Text className="text-xs font-extrabold text-emerald-800 ml-1.5">
                Driver Accepted
              </Text>
            </View>
            <Text className="text-[11px] font-medium text-emerald-700 mt-0.5 text-center">
              Complete your token payment to confirm the booking.
            </Text>
          </View>

          {/* Fare Summary Card */}
          <FareSummaryTable
            totalAgreedFare={agreedFare}
            tokenAmount={bookingToken}
            tokenLabel="Booking Token (Pay Now)"
            className="mb-3.5"
          />

          {/* Info Notice Box */}
          <InfoNoteBox
            subtitle={`Pay ₹${bookingToken} token to confirm your booking. You will pay ₹${remainingFare.toLocaleString(
              'en-IN'
            )} directly to the driver after the ride.`}
            className="mb-4"
          />
        </View>

        {/* Bottom Sticky Action Button */}
        <View className="mt-2">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePayToken}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
          >
            <View className="mr-2">
              <LockFilledIcon size={18} color="#FFFFFF" />
            </View>
            <Text className="text-white text-base font-extrabold tracking-wide">
              Pay ₹{bookingToken} Token
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCancelRequest}
            className="mt-3 py-2 items-center justify-center"
          >
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">
              Cancel Request
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive Token Payment Modal Sheet */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View style={{ backgroundColor: colors.card }} className="rounded-t-3xl p-6 shadow-2xl">
            <View className="items-center mb-4">
              <View style={{ backgroundColor: colors.border }} className="w-12 h-1.5 rounded-full mb-3" />
              <Text style={{ color: colors.text }} className="text-xl font-black">
                Pay Booking Token
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">
                Fast and secure payment via UPI, Card, or NetBanking
              </Text>
            </View>

            {/* Token Amount Box */}
            <View
              style={{
                backgroundColor: `${colors.primary}15`,
                borderColor: `${colors.primary}40`,
              }}
              className="p-4 rounded-xl border items-center justify-center mb-4"
            >
              <Text style={{ color: colors.primary }} className="text-xs font-bold uppercase tracking-wider">
                Token Amount Payable
              </Text>
              <Text style={{ color: colors.text }} className="text-3xl font-black mt-0.5">
                ₹{bookingToken}
              </Text>
            </View>

            {/* Payment Options */}
            <View className="space-y-2 mb-6">
              {[
                { id: 'upi', title: 'UPI (GPay / PhonePe / Paytm)', subtitle: 'Instant 1-click token pay' },
                { id: 'card', title: 'Debit / Credit Card', subtitle: 'Visa, MasterCard, RuPay' },
                { id: 'wallet', title: 'Wallets / NetBanking', subtitle: 'Airtel, Amazon Pay, SBI, HDFC' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setSelectedMethod(opt.id as any)}
                  style={{
                    backgroundColor: selectedMethod === opt.id ? `${colors.primary}15` : colors.surface,
                    borderColor: selectedMethod === opt.id ? colors.primary : colors.border,
                  }}
                  className="p-3.5 rounded-xl border flex-row items-center justify-between mb-2"
                >
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-xs font-bold">
                      {opt.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] mt-0.5">
                      {opt.subtitle}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderColor: selectedMethod === opt.id ? colors.primary : colors.border,
                      backgroundColor: selectedMethod === opt.id ? colors.primary : 'transparent',
                    }}
                    className="w-5 h-5 rounded-full border items-center justify-center"
                  >
                    {selectedMethod === opt.id && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Confirm Payment CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleConfirmPayment}
              disabled={isProcessingPayment}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 rounded-xl items-center justify-center shadow-md mb-2"
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-base font-extrabold">
                  Confirm & Pay ₹{bookingToken}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              className="py-2.5 items-center"
            >
              <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderCancelModal()}
    </SafeAreaView>
  );
};
