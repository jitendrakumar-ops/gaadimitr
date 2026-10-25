import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
  Switch,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  Animated,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  DriverHomeScreenNavigationProp,
  DriverHomeScreenRouteProp,
} from '../types/navigation';
import { useTheme } from '../theme';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchDriverProfile,
  updateDriverStatus,
  updateDriverLocation,
} from '../store/slices/driverSlice';
import { fetchBookingSummary, fetchActiveBooking, clearCurrentBooking } from '../store/slices/bookingSlice';
import { bookingService } from '../services/bookingService';
import { BookingItem } from '../types/booking';
import { detectCurrentLocationWithGps } from '../utils/mapConfig';
import { storageService } from '../services/storage';
import { notificationService, isRideRequestNotification } from '../services/notificationService';
import { soundService } from '../services/soundService';


export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<DriverHomeScreenNavigationProp>();
  const route = useRoute<DriverHomeScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();

  const { driverProfile } = useAppSelector((state) => state.driver);
  const { summary, activeBooking, } = useAppSelector((state) => state.booking);
  const authUser = useAppSelector((state) => state.auth.user);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Animation hooks for Sticky Active Ride Popup
  const slideAnim = useRef(new Animated.Value(220)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Continuous pulse beacon animation loop
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 2.4,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseScale, pulseOpacity]);

  // Slide-in and fade-in entry when activeBooking appears
  useEffect(() => {
    if (activeBooking) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(220);
      fadeAnim.setValue(0);
    }
  }, [activeBooking, slideAnim, fadeAnim]);

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchDriverProfile()),
      dispatch(fetchBookingSummary('today')),
      dispatch(fetchActiveBooking()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadData();
    notificationService.syncDeviceToken();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const driverData = route.params?.driverData;


  const fullName =
    driverData?.fullName ||
    driverProfile?.user?.name ||
    driverProfile?.name ||
    authUser?.name ||
    'Driver';
  const firstName = fullName.trim().split(' ')[0] || 'Driver';

  const isOnline = driverProfile?.onlineStatus === 'online';
  const [isUpdatingStatusLocal, setIsUpdatingStatusLocal] = useState<boolean>(false);
  const [hasActiveRequest, setHasActiveRequest] = useState<boolean>(false);

  // Incoming ride notification data from Firebase
  const [incomingRide, setIncomingRide] = useState<Record<string, string> | null>(null);

  const playRideSound = useCallback(() => {
    soundService.playRideSound();
  }, []);

  const stopSound = useCallback(() => {
    soundService.stopSound();
  }, []);

  const dismissIncomingRide = useCallback(() => {
    stopSound();
    setHasActiveRequest(false);
    setIncomingRide(null);
    dispatch(clearCurrentBooking());
    notificationService.clearPendingRideRequest();
  }, [stopSound, dispatch]);

  const isCheckingPendingRef = useRef<boolean>(false);
  const hasActiveRequestRef = useRef<boolean>(false);
  const incomingRideRef = useRef<Record<string, string> | null>(null);
  const lastAlertedCancelledIdRef = useRef<string>('');

  useEffect(() => {
    hasActiveRequestRef.current = hasActiveRequest;
    incomingRideRef.current = incomingRide;
  }, [hasActiveRequest, incomingRide]);

  // Check for any pending ride request from local storage (e.g. notification arrived while app was closed or in background)
  const checkPendingRideRequest = useCallback(async () => {
    // Concurrency lock: prevent multiple parallel executions
    if (isCheckingPendingRef.current) return;
    isCheckingPendingRef.current = true;

    try {
      const pending = notificationService.getPendingRideRequest();

      // If no pending ride in storage (or was deleted due to cancellation in background)
      if (!pending) {
        if (hasActiveRequestRef.current || incomingRideRef.current) {
          console.log('🧹 [HomeScreen] Pending ride cleared in storage/background, dismissing popup');
          setIncomingRide(null);
          setHasActiveRequest(false);
          stopSound();
        }
        return;
      }

      // Check if this ride was recorded as cancelled while app was in background
      const bId = pending.bookingId || pending._id || pending.id;
      const lastCancelledId = storageService.getString('last_cancelled_ride_id');
      if (bId && lastCancelledId && String(bId) === String(lastCancelledId)) {
        console.log('❌ [HomeScreen] Pending ride was cancelled in background, clearing:', bId);
        notificationService.clearPendingRideRequest();
        storageService.delete('last_cancelled_ride_id');
        setIncomingRide(null);
        setHasActiveRequest(false);
        stopSound();
        return;
      }

      if (!isRideRequestNotification(pending)) {
        notificationService.clearPendingRideRequest();
        setIncomingRide(null);
        setHasActiveRequest(false);
        stopSound();
        return;
      }

      // CRITICAL: Verify with backend FIRST before displaying the card or ringing!
      // This prevents flashing a ride that was already cancelled while driver was away.
      if (bId && !String(bId).startsWith('req_')) {
        try {
          const res = await bookingService.getBookingById(bId);
          if (res?.data) {
            const status = res.data.status;
            // If already cancelled, rejected, accepted by someone else, or completed
            if (status !== 'requested') {
              console.log('ℹ️ [HomeScreen] Booking is no longer in requested state:', status);
              notificationService.clearPendingRideRequest();
              setIncomingRide(null);
              setHasActiveRequest(false);
              stopSound();
              return;
            }
          }
        } catch (err: any) {
          if (err?.status === 404 || err?.message?.toLowerCase().includes('not found')) {
            console.log('ℹ️ [HomeScreen] Booking not found on server, clearing:', bId);
            notificationService.clearPendingRideRequest();
            setIncomingRide(null);
            setHasActiveRequest(false);
            stopSound();
            return;
          }
        }
      }

      // ONLY IF IT IS GENUINELY STILL IN 'requested' STATE, SHOW IT!
      console.log('🚖 [HomeScreen] Verified active ride request from storage, displaying:', pending.bookingId || bId);
      setIncomingRide(pending);
      setHasActiveRequest(true);
      playRideSound();
    } catch (err) {
      console.warn('⚠️ [HomeScreen] Error checking pending ride request:', err);
    } finally {
      isCheckingPendingRef.current = false;
    }
  }, [playRideSound, stopSound]);

  // Check pending request on focus (screen comes to top)
  useFocusEffect(
    useCallback(() => {
      dispatch(clearCurrentBooking());
      checkPendingRideRequest();
    }, [checkPendingRideRequest, dispatch])
  );

  // Check pending request whenever app enters foreground / active state
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 [HomeScreen] App became active, checking for pending ride request...');
        checkPendingRideRequest();
        loadData();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [checkPendingRideRequest, loadData]);



  // Live verification: if customer cancels or request expires while driver is viewing incoming ride popup, dismiss it cleanly
  useFocusEffect(
    useCallback(() => {
      if (!incomingRide || !hasActiveRequest) return;
      const bId = incomingRide.bookingId || incomingRide._id || incomingRide.id;
      if (!bId || String(bId).startsWith('req_')) return;

      let timer: any = null;
      let isStopped = false;

      const checkLiveStatus = async () => {
        if (isStopped) return;
        try {
          const res = await bookingService.getBookingById(bId);
          if (res?.data) {
            const status = res.data.status;
            if (status !== 'requested') {
              console.log('ℹ️ [HomeScreen] Incoming ride cancelled or expired:', status);
              isStopped = true;
              if (timer) clearInterval(timer);
              notificationService.clearPendingRideRequest();
              storageService.delete('pending_ride_request');
              setIncomingRide(null);
              setHasActiveRequest(false);
              stopSound();
              return;
            }
          }
        } catch (err: any) {
          if (err?.status === 404 || err?.message?.toLowerCase().includes('not found')) {
            isStopped = true;
            if (timer) clearInterval(timer);
            notificationService.clearPendingRideRequest();
            storageService.delete('pending_ride_request');
            setIncomingRide(null);
            setHasActiveRequest(false);
            stopSound();
          }
        }
      };

      timer = setInterval(checkLiveStatus, 5000);

      return () => {
        isStopped = true;
        if (timer) clearInterval(timer);
      };
    }, [incomingRide, hasActiveRequest, stopSound])
  );


  // Glowing pulse animation for highlighted card
  useEffect(() => {
    let glowLoop: Animated.CompositeAnimation | null = null;
    if (incomingRide && hasActiveRequest) {
      glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: false,
          }),
        ])
      );
      glowLoop.start();
    } else {
      glowAnim.setValue(0);
    }
    return () => {
      glowLoop?.stop();
    };
  }, [incomingRide, hasActiveRequest, glowAnim]);

  // Subscribe to Firebase foreground notifications
  useEffect(() => {
    notificationService.setupListeners();

    // 1. Ride / Booking Requests (Incoming Popup + Sound)
    const unsubscribeRide = notificationService.onRideRequest((data) => {
      // Strictly verify notification type is a ride/booking request
      if (!isRideRequestNotification(data)) {
        console.log('ℹ️ [HomeScreen] Ignored non-request notification:', data?.type);
        return;
      }
      console.log('🚖 [HomeScreen] Incoming ride request from Firebase:', data);
      setIncomingRide(data);
      setHasActiveRequest(true);
      playRideSound();
    });

    // 2. Booking Payment Notifications (Refresh data, do NOT show incoming popup)
    const unsubscribePayment = notificationService.onPaymentReceived((data) => {
      console.log('💰 [HomeScreen] Payment notification received:', data);
      // Automatically refresh today's earnings and active booking
      dispatch(fetchBookingSummary());
      dispatch(fetchActiveBooking());

      const amount = data.amount || '';
      const bookingNumber = data.bookingNumber || '';
      const method = (data.paymentMethod || 'UPI').toUpperCase();

      Alert.alert(
        'Payment Received 💰',
        `₹${amount} payment received for booking ${bookingNumber ? '#' + bookingNumber : ''} via ${method}.`,
        [{ text: 'OK' }]
      );
    });

    // 3. Ride Cancelled Notification (dismiss popup & stop sound immediately)
    const unsubscribeCancelled = notificationService.onRideCancelled((data) => {
      console.log('❌ [HomeScreen] Real-time ride cancelled notification received:', data);
      notificationService.clearPendingRideRequest();
      storageService.delete('pending_ride_request');
      dispatch(clearCurrentBooking());
      setIncomingRide(null);
      setHasActiveRequest(false);
      stopSound();

      const notifBookingId = String(data?.bookingId || data?._id || data?.id || '').trim();
      // Only alert once per cancelled booking ID
      if (notifBookingId && lastAlertedCancelledIdRef.current === notifBookingId) {
        return;
      }
      if (notifBookingId) {
        lastAlertedCancelledIdRef.current = notifBookingId;
      }
    });

    return () => {
      unsubscribeRide();
      unsubscribePayment();
      unsubscribeCancelled();
      stopSound();
    };
  }, [dispatch, playRideSound, stopSound]);


  // Online Duration Tracking for Today
  const driverId = driverProfile?.id || driverProfile?._id || authUser?.id || 'driver';
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  const getTodayStorageKey = () => `driver_online_secs_${driverId}_${getTodayDateStr()}`;
  const getLastOnlineStartKey = () => `driver_last_online_start_${driverId}`;

  const formatOnlineDuration = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds <= 0) return '0m';
    const totalMins = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins}m`;
  };

  const [onlineSecondsToday, setOnlineSecondsToday] = useState<number>(() => {
    try {
      const todayKey = `driver_online_secs_${driverProfile?.id || driverProfile?._id || authUser?.id || 'driver'}_${new Date().toISOString().split('T')[0]}`;
      return storageService.getObject<number>(todayKey) || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const todayKey = getTodayStorageKey();
    const startKey = getLastOnlineStartKey();
    let saved = storageService.getObject<number>(todayKey) || 0;

    if (isOnline) {
      const lastStart = storageService.getObject<number>(startKey);
      const now = Date.now();
      if (lastStart && lastStart > 0) {
        const elapsed = Math.floor((now - lastStart) / 1000);
        if (elapsed > 0 && elapsed < 86400) {
          saved += elapsed;
          storageService.setObject(todayKey, saved);
        }
      }
      storageService.setObject(startKey, now);
      setOnlineSecondsToday(saved);

      const interval = setInterval(() => {
        setOnlineSecondsToday((prev) => {
          const updated = prev + 1;
          if (updated % 5 === 0) {
            storageService.setObject(todayKey, updated);
          }
          return updated;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else {
      storageService.delete(startKey);
      setOnlineSecondsToday(saved);
    }
  }, [isOnline, driverId]);

  const displayOnlineTime =
    (summary as any)?.onlineTime ||
    (summary as any)?.todayOnlineTime ||
    (driverProfile as any)?.todayOnlineTime ||
    formatOnlineDuration(onlineSecondsToday);

  const handleToggleOnlineStatus = async (newVal: boolean) => {
    if (isUpdatingStatusLocal) return;

    try {
      setIsUpdatingStatusLocal(true);

      if (newVal) {
        // Going online:
        // 1. Get GPS coordinates
        let coords = { latitude: 0, longitude: 0 };
        try {
          const loc = await detectCurrentLocationWithGps();
          if (loc?.latitude && loc?.longitude) {
            coords = loc;
          }
        } catch (locErr) {
          console.warn('GPS location fetch error:', locErr);
        }

        // 2. Call /drivers/location API
        try {
          await dispatch(
            updateDriverLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
              heading: 0,
            })
          ).unwrap();
        } catch (locApiErr) {
          console.warn('Location API update error:', locApiErr);
        }

        // 3. Call /drivers/status API with 'online'
        storageService.setObject(getLastOnlineStartKey(), Date.now());
        await dispatch(updateDriverStatus('online')).unwrap();
      } else {
        // Going offline: Call /drivers/status API with 'offline'
        const startKey = getLastOnlineStartKey();
        const lastStart = storageService.getObject<number>(startKey);
        if (lastStart && lastStart > 0) {
          const elapsed = Math.floor((Date.now() - lastStart) / 1000);
          if (elapsed > 0 && elapsed < 86400) {
            const todayKey = getTodayStorageKey();
            const saved = (storageService.getObject<number>(todayKey) || 0) + elapsed;
            storageService.setObject(todayKey, saved);
            setOnlineSecondsToday(saved);
          }
        }
        storageService.delete(startKey);
        await dispatch(updateDriverStatus('offline')).unwrap();
      }
    } catch (err: any) {
      console.warn('Status toggle error:', err);
      const errMsg =
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to update online status. Please check your vehicle registration.';
      Alert.alert('Online Status', errMsg);
    } finally {
      setIsUpdatingStatusLocal(false);
    }
  };

  const formatTripTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      if (isToday) {
        return `Today, ${timeStr}`;
      }
      const day = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
      return `${day}, ${timeStr}`;
    } catch {
      return 'Recent';
    }
  };

  const handleTripPress = (trip: BookingItem) => {
    const customerName =
      typeof trip.userId === 'object' && trip.userId?.name
        ? trip.userId.name
        : 'Customer';

    const customerPhone =
      typeof trip.userId === 'object' && trip.userId?.phone
        ? trip.userId.phone
        : '';

    const vehicleName =
      typeof trip.vehicleId === 'object' && trip.vehicleId?.title
        ? trip.vehicleId.title
        : '';

    const pickupAddress =
      trip.pickupLocation?.title || trip.pickupLocation?.address || 'Pickup Point';

    const dropAddress =
      trip.dropLocation?.title || trip.dropLocation?.address || 'Drop Point';

    const fareNumeric = Number(trip.fare) || 0;
    const tokenNumeric = Number(trip.tokenMoney) || Math.round(fareNumeric * 0.1);

    navigation.navigate('RideDetails', {
      ride: {
        id: trip._id,
        bookingId: `#${trip.bookingNumber || trip._id.slice(-6).toUpperCase()}`,
        customer: customerName,
        phone: customerPhone,
        from: pickupAddress,
        to: dropAddress,
        date: formatTripTime(trip.completedAt || trip.createdAt),
        fare: `₹${fareNumeric.toLocaleString('en-IN')}`,
        token: `₹${tokenNumeric.toLocaleString('en-IN')}`,
        paymentMode:
          trip.paymentMethod === 'cash'
            ? 'Cash at Drop'
            : trip.paymentMethod
              ? `${trip.paymentMethod.toUpperCase()} at Drop`
              : 'Cash at Drop',
        vehicle: vehicleName,
        status: 'Completed',
        distance: trip.distance ? `${trip.distance} km` : '12.4 km',
        duration: '28 mins',
        baseFare: `₹${Math.min(100, fareNumeric || 100)}`,
        distanceFare: `₹${Math.max(0, fareNumeric - 100)}`,
        customerRating: trip.rating ? `${trip.rating}` : '5.0',
      },
    });
  };

  const handleActiveRidePress = (trip: BookingItem) => {
    const status = trip.status;

    if (status === 'requested') {
      navigation.navigate('DriverRideRequestPreview', {
        requestId: trip._id,
      });
    } else if (status === 'accepted') {
      navigation.navigate('DriverRideAccepted', {
        requestId: trip._id,

      });
    } else {
      navigation.navigate('DriverRideConfirmed', {
        requestId: trip._id,
      });
    }
  };

  const handleCallCustomer = (phone?: string) => {
    if (!phone) {
      Alert.alert('Call Customer', 'Phone number not available for this customer.');
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
      Alert.alert('Call Customer', `Could not open dialer for ${phone}`);
    });
  };




  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      {/* ======================================================== */}
      {/* HEADER: Full-width ImageBackground wrapping both sections  */}
      {/* ======================================================== */}
      <ImageBackground
        source={isDark ? require('../assets/images/header-bg-dark.png') : require('../assets/images/header-bg.png')}
        resizeMode="cover"
        style={{ minHeight: 100, overflow: 'hidden' }}
      >
        {/* {isDark && (
          <View
            style={{
              ...{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
              backgroundColor: 'rgba(11, 15, 25, 0.65)',
            }}
          />
        )} */}

        <View
          className="flex-row items-center justify-between px-4"
          style={{ minHeight: 110, paddingTop: 30 }}
        >
          {/* LEFT: Driver Avatar + Name + Status */}
          <View className="flex-row items-center" style={{ marginTop: 15 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => (navigation as any).navigate('DriverProfileDetails')}
              className="relative mr-3"
            >
              <View className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm">
                <Image
                  source={
                    authUser?.profileImage
                      ? { uri: authUser.profileImage }
                      : require('../assets/images/driver_rahul.jpg')
                  }
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              {/* Online / Offline Dot */}
              <View
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
              />
            </TouchableOpacity>

            {/* Greeting, Name & Status */}
            <View>
              <Text className="text-xl font-black dark:text-white text-slate-900 tracking-tight">
                {firstName}
              </Text>
              {/* ONLINE Status Pill */}
              <View className="flex-row items-center mt-1">
                <View
                  className={`flex-row items-center px-2 py-0.5 rounded-full border ${isOnline
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-100 border-slate-200'
                    }`}
                >
                  <View
                    className={`w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                  />
                  <Text
                    className={`text-xs font-bold ${isOnline ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                  >
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* RIGHT: Online Toggle Pill */}
          <View className="items-end">
            <View
              style={{ backgroundColor: colors.surface }}
              className="rounded-full px-3 py-1.5 flex-row items-center shadow-md"
            >
              {isUpdatingStatusLocal ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
              ) : null}
              <Text style={{ color: colors.text }} className="text-xs font-bold mr-2">
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              <Switch
                value={isOnline}
                disabled={isUpdatingStatusLocal}
                onValueChange={handleToggleOnlineStatus}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: activeBooking ? 210 : 32 }}
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 1. Today's Earnings & Performance Hero Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => (navigation as any).navigate('Earnings')}
          className="bg-[#1350F2] rounded-xl p-5 mb-4"
        >
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                Today's Earnings
              </Text>
              <Text className="text-3xl font-black text-white mt-1 tracking-tight">
                ₹{(summary?.totalEarning ?? 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View className="bg-white/15 px-3 py-1 rounded-full flex-row items-center">
              <Text className="text-amber-300 text-sm font-black mr-1">★</Text>
              <Text className="text-white text-xs font-bold">{driverProfile?.rating} ({driverProfile?.totalRatingsCount})</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-white/15">
            <View className="flex-row items-center">
              <Text className="text-xs font-medium text-blue-100">Trips: </Text>
              <Text className="text-xs font-bold text-white">
                {summary?.totalCompletedTrips ?? 0} Completed
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs font-medium text-blue-100">Online: </Text>
              <Text className="text-xs font-bold text-white">{displayOnlineTime}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Live Ride Request Area */}
        {incomingRide && hasActiveRequest ? (
          /* ========= INCOMING RIDE POPUP — HIGHLIGHTED ========= */
          <Animated.View
            style={[
              {
                borderRadius: 20,
                marginBottom: 16,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#F97316', '#FDE68A'],
                }),
                shadowColor: '#F97316',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 18,
                elevation: 16,
              },
            ]}
          >
            {/* Orange Gradient Header Strip */}
            <View
              style={{
                backgroundColor: '#EA580C',
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Pulsing bell icon */}
                <Animated.View
                  style={{
                    transform: [{
                      scale: glowAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] }),
                    }],
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🔔</Text>
                </Animated.View>
                <View>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }}>
                    INCOMING RIDE REQUEST
                  </Text>
                  {incomingRide?.bookingNumber ? (
                    <Text style={{ color: '#FED7AA', fontSize: 10, fontWeight: '700', marginTop: 1 }}>
                      #{incomingRide.bookingNumber}
                    </Text>
                  ) : null}
                </View>
              </View>
              <TouchableOpacity
                onPress={dismissIncomingRide}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Card Body */}
            <View style={{ backgroundColor: isDark ? '#1C1917' : '#FFF7ED', padding: 16 }}>

              {/* Customer Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                {incomingRide?.userImage ? (
                  <Image
                    source={{ uri: incomingRide.userImage }}
                    style={{ width: 52, height: 52, borderRadius: 26, marginRight: 12, borderWidth: 2, borderColor: '#F97316' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#FED7AA', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 2, borderColor: '#F97316' }}>
                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#EA580C' }}>
                      {(incomingRide?.userName || 'C').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: isDark ? '#FFF' : '#1C1917', fontWeight: '900', fontSize: 16 }}>
                    {incomingRide?.userName || 'Customer'}
                  </Text>
                  {incomingRide?.serviceTitle ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Text style={{ backgroundColor: '#FED7AA', color: '#9A3412', fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                        {incomingRide.serviceTitle}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Route */}
              <View style={{ backgroundColor: isDark ? '#292524' : '#FFEDD5', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ alignItems: 'center', marginRight: 10, paddingTop: 2 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#16A34A' }} />
                    <View style={{ width: 2, height: 22, backgroundColor: '#D1D5DB', marginVertical: 2 }} />
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#DC2626' }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? '#D1FAE5' : '#15803D', fontWeight: '700', fontSize: 12 }} numberOfLines={2}>
                      {incomingRide?.pickupAddress || 'Pickup Point'}
                    </Text>
                    <View style={{ height: 18 }} />
                    <Text style={{ color: isDark ? '#FCA5A5' : '#B91C1C', fontWeight: '700', fontSize: 12 }} numberOfLines={2}>
                      {incomingRide?.dropAddress || 'Drop Point'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fare Row */}
              <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#292524' : '#FFF', borderRadius: 12, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: isDark ? '#44403C' : '#FED7AA' }}>
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRightWidth: 1, borderRightColor: isDark ? '#44403C' : '#FED7AA' }}>
                  <Text style={{ color: isDark ? '#A8A29E' : '#92400E', fontSize: 10, fontWeight: '700' }}>Total Fare</Text>
                  <Text style={{ color: isDark ? '#FFF' : '#1C1917', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                    ₹{Number(incomingRide?.fare || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRightWidth: 1, borderRightColor: isDark ? '#44403C' : '#FED7AA' }}>
                  <Text style={{ color: isDark ? '#A8A29E' : '#92400E', fontSize: 10, fontWeight: '700' }}>Token</Text>
                  <Text style={{ color: '#EA580C', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                    ₹{Number(incomingRide?.tokenMoney || 0).toLocaleString('en-IN')}*
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ color: isDark ? '#A8A29E' : '#92400E', fontSize: 10, fontWeight: '700' }}>Remaining</Text>
                  <Text style={{ color: isDark ? '#FFF' : '#1C1917', fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                    ₹{Math.max(0, Number(incomingRide?.fare || 0) - Number(incomingRide?.tokenMoney || 0)).toLocaleString('en-IN')}*
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => {
                    stopSound();
                    notificationService.clearPendingRideRequest();
                    setIncomingRide(null);
                    setHasActiveRequest(false);
                    navigation.navigate('DriverRideRequestPreview', { requestId: incomingRide?.bookingId || incomingRide?._id || '' });
                  }}
                  style={{ flex: 1, backgroundColor: '#EA580C', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#EA580C', shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14, marginRight: 6 }}>View Request</Text>
                  <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={dismissIncomingRide}
                  style={{ backgroundColor: isDark ? '#292524' : '#FEE2E2', borderRadius: 14, width: 80, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}
                >
                  <Text style={{ color: isDark ? '#A8A29E' : '#9A3412', fontWeight: '800', fontSize: 12 }}>Later</Text>
                </TouchableOpacity>
              </View>

            </View>
          </Animated.View>
        ) : null}


        {/* 5. High Demand Hotspot Card */}
        <View
          style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
            borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7',
          }}
          className="rounded-xl p-4 mb-4 flex-row items-center border"
        >
          <View className="w-9 h-9 rounded-lg bg-amber-500/20 items-center justify-center mr-3">
            <Text className="text-base">🔥</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-amber-500">
              High Demand Zone Active (1.5x)
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-[11px] mt-1 leading-snug">
              Patna Junction, Bailey Road & Airport are seeing high rider enquiries.
            </Text>
          </View>
        </View>

        {/* 6. Recent Trips Widget */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl p-4 border"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider">
              Recent Completed Trips
            </Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Rides')}>
              <Text style={{ color: colors.primary }} className="text-xs font-bold">
                Passbook
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            {!summary?.list || summary.list.length === 0 ? (
              <View className="py-5 items-center justify-center">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-medium text-center">
                  No completed trips for today yet.
                </Text>
              </View>
            ) : (
              summary.list.map((trip, idx) => {
                const customerName =
                  typeof trip.userId === 'object' && trip.userId?.name
                    ? trip.userId.name
                    : 'Customer';
                const fromAddress =
                  trip.pickupLocation?.title || trip.pickupLocation?.address || 'Pickup Point';
                const toAddress =
                  trip.dropLocation?.title || trip.dropLocation?.address || 'Drop Point';
                const tripTime = formatTripTime(trip.completedAt || trip.createdAt);
                const fareFormatted = `₹${(Number(trip.fare) || 0).toLocaleString('en-IN')}`;
                const paymentBadge =
                  trip.paymentStatus === 'paid'
                    ? 'Paid'
                    : trip.paymentMethod
                      ? trip.paymentMethod.toUpperCase()
                      : 'Completed';

                return (
                  <TouchableOpacity
                    key={trip._id}
                    activeOpacity={0.7}
                    onPress={() => handleTripPress(trip)}
                    style={{
                      borderBottomColor: colors.borderLight,
                      borderBottomWidth: idx < summary.list.length - 1 ? 1 : 0,
                    }}
                    className="flex-row items-center justify-between py-2.5"
                  >
                    <View className="flex-1 mr-2">
                      <Text style={{ color: colors.text }} className="text-sm font-bold" numberOfLines={1}>
                        {customerName}
                      </Text>
                      <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5" numberOfLines={1}>
                        {fromAddress} ➔ {toAddress}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-[11px] mt-0.5">
                        {tripTime}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text style={{ color: colors.text }} className="text-sm font-black">
                        {fareFormatted}
                      </Text>
                      <View className="bg-emerald-500/10 px-2 py-0.5 rounded mt-1">
                        <Text className="text-[10px] font-bold text-emerald-600">
                          {paymentBadge}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* If no active booking, show subtle empty radar/status card inside ScrollView */}

      </ScrollView>

      {/* ======================================================== */}
      {/* STICKY BOTTOM ACTIVE RIDE CARD (Animated & Highlighted)  */}
      {/* ======================================================== */}
      {activeBooking && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 2,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: '#10B981',
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.28,
            shadowRadius: 16,
            elevation: 24,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 14,
          }}
        >
          {/* Top Grab Handle */}
          <View className="items-center mb-2">
            <View className="w-12 h-1 rounded-full bg-emerald-500/40" />
          </View>

          {/* Header Row: Status, Live Pulse Indicator, Booking Number */}
          <View
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between pb-2.5 border-b"
          >
            <View className="flex-row items-center">
              {/* Pulsing Live Radar Indicator */}
              <View className="relative w-5 h-5 items-center justify-center mr-2">
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: '#10B981',
                    transform: [{ scale: pulseScale }],
                    opacity: pulseOpacity,
                  }}
                />
                <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
              </View>

              {/* Status Badge */}
              <View

                className="flex-row items-center border-green-300 px-2.5 py-0.5 bg-green-500/10 rounded-full mr-2 shadow-xs"
              >
                <View

                  className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-800"
                />
                <Text

                  className="text-[11px] font-black tracking-tight text-green-800"
                >
                  {activeBooking.status.toUpperCase()}
                </Text>
              </View>

              {/* LIVE Pill */}
              <View className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40">
                <Text className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">LIVE</Text>
              </View>
            </View>

            {/* Booking Number & Refresh */}
            <View className="flex-row items-center">
              <View className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mr-2">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-mono font-bold">
                  #{activeBooking.bookingNumber || activeBooking._id.slice(-6).toUpperCase()}
                </Text>
              </View>

            </View>
          </View>

          {/* Customer & Route Highlight Row */}
          <View
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-2.5 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="relative mr-2.5">
                <View className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center overflow-hidden border-2 border-emerald-500/60 shadow-sm">
                  {typeof activeBooking.userId === 'object' && activeBooking.userId?.profileImage ? (
                    <Image
                      source={{ uri: activeBooking.userId.profileImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-base font-black text-blue-600 dark:text-blue-300">
                      {typeof activeBooking.userId === 'object' && activeBooking.userId?.name
                        ? activeBooking.userId.name.charAt(0).toUpperCase()
                        : 'C'}
                    </Text>
                  )}
                </View>
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
              </View>

              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-sm font-black tracking-tight" numberOfLines={1}>
                  {typeof activeBooking.userId === 'object' && activeBooking.userId?.name
                    ? activeBooking.userId.name
                    : 'Customer'}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium" numberOfLines={1}>
                    {activeBooking.pickupLocation?.title || activeBooking.pickupLocation?.address || 'Pickup'}
                  </Text>
                  <Text className="text-emerald-500 font-bold mx-1 text-xs">➔</Text>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium" numberOfLines={1}>
                    {activeBooking.dropLocation?.title || activeBooking.dropLocation?.address || 'Drop'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Call Button with glowing emerald pill */}
            {typeof activeBooking.userId === 'object' && activeBooking.userId?.phone ? (
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() =>
                  handleCallCustomer(
                    typeof activeBooking.userId === 'object' ? activeBooking.userId?.phone : undefined
                  )
                }
                className="bg-emerald-500 px-3.5 py-2 rounded-xl flex-row items-center shadow-md shadow-emerald-500/30"
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="mr-1.5">
                  <Path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text className="text-white text-xs font-black">CALL</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Fare Summary & Action Buttons */}
          <View className="flex-row items-center justify-between pt-2.5">
            <View className="mr-2">
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">
                Collect Cash / Fare
              </Text>
              <View className="flex-row items-baseline mt-0.5">
                <Text style={{ color: colors.text }} className="text-base font-black">
                  ₹{(Number(activeBooking.fare) || 0).toLocaleString('en-IN')}
                </Text>
                <View className="ml-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    Token: ₹{Math.max(0, (Number(activeBooking.tokenMoney) || 0)).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center flex-1 justify-end">


              {/* Trip Details Highlight Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleActiveRidePress(activeBooking)}
                style={{ backgroundColor: colors.primary }}
                className="px-4 py-2.5 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-500/30"
              >
                <Text className="text-white font-black text-xs mr-1.5">
                  Trip Details
                </Text>
                <Text className="text-white text-xs font-bold">➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export const DriverHomeScreen = HomeScreen;
export default HomeScreen;
