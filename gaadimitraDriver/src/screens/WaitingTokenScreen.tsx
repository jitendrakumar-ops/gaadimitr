import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
    Alert,
    BackHandler,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import {
    DriverRideAcceptedNavigationProp,
    DriverRideAcceptedRouteProp,
} from '../types/navigation';
import {
    BackArrowIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBookingById, cancelBookingAction, clearCurrentBooking } from '../store/slices/bookingSlice';
import { BookingItem } from '../types/booking';
import { notificationService } from '../services/notificationService';
import { soundService } from '../services/soundService';

const toText = (value: any, fallback = ''): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object' && typeof value.title === 'string') return value.title;
    return fallback;
};

export const WaitingTokenScreen: React.FC = () => {
    const navigation = useNavigation<DriverRideAcceptedNavigationProp>();
    const route = useRoute<DriverRideAcceptedRouteProp>();
    const { colors, isDark } = useTheme();
    const dispatch = useAppDispatch();

    const currentBooking = useAppSelector((state) => state.booking.currentBooking);
    const isCurrentBookingLoading = useAppSelector((state) => state.booking.isCurrentBookingLoading);

    const bookingId: string | undefined =
        route.params?.requestId || (route.params as any)?.bookingId;

    const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);
    const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const [isTokenReceived, setIsTokenReceived] = useState<boolean>(false);
    const [paymentData, setPaymentData] = useState<Record<string, string> | null>(null);

    const mountedRef = useRef<boolean>(true);
    const fetchingRef = useRef<boolean>(false);
    const paymentHandledRef = useRef<boolean>(false);
    const cancelledHandledRef = useRef<boolean>(false);
    const navigatingRef = useRef<boolean>(false);

    // CRITICAL: reset ALL guards on every mount so screen never freezes on re-entry
    useEffect(() => {
        soundService.stopSound();
        mountedRef.current = true;
        navigatingRef.current = false;
        paymentHandledRef.current = false;
        cancelledHandledRef.current = false;
        fetchingRef.current = false;
        return () => {
            mountedRef.current = false;
            soundService.stopSound();
        };
    }, []);

    const safeFetchBooking = useCallback(async () => {
        if (!bookingId || fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            await dispatch(fetchBookingById(bookingId));
        } catch (err) {
            console.warn('[WaitingTokenScreen] fetch error:', err);
        } finally {
            fetchingRef.current = false;
        }
    }, [bookingId, dispatch]);

    // Initial fetch — marks initialFetchDone when complete
    useEffect(() => {
        if (!bookingId) { setInitialFetchDone(true); return; }
        let cancelled = false;
        (async () => {
            await safeFetchBooking();
            if (!cancelled && mountedRef.current) setInitialFetchDone(true);
        })();
        return () => { cancelled = true; };
    }, [bookingId, safeFetchBooking]);

    // Silent polling — ONLY runs while screen is actively focused, stops on blur / token received / expired
    useFocusEffect(
        useCallback(() => {
            if (!bookingId || isTokenReceived || isExpired || !initialFetchDone) return;
            const interval = setInterval(() => {
                safeFetchBooking();
            }, 6000);
            return () => clearInterval(interval);
        }, [bookingId, isTokenReceived, isExpired, initialFetchDone, safeFetchBooking])
    );

    const isMatchingBooking = Boolean(
        bookingId &&
        currentBooking &&
        (currentBooking._id === bookingId || (currentBooking as any)?.id === bookingId)
    );

    const booking: BookingItem | null = isMatchingBooking ? currentBooking : null;

    // ONLY show full-screen loader before the very first result — never on poll
    const isLoading = !initialFetchDone && isCurrentBookingLoading;

    // Detect payment from booking data (poll result)
    const paidFromBooking =
        booking?.paymentStatus === 'paid' ||
        (booking as any)?.isTokenPaid === true ||
        (booking as any)?.tokenPaid === true ||
        booking?.status === 'confirmed';

    useEffect(() => {
        if (paidFromBooking && !isTokenReceived) {
            setIsTokenReceived(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paidFromBooking]);

    // Detect cancellation strictly for THIS booking
    const isCancelledFromBooking =
        isMatchingBooking &&
        (booking?.status === 'cancelled' || booking?.status === 'rejected');

    useEffect(() => {
        if (isCancelledFromBooking && mountedRef.current && !cancelledHandledRef.current) {
            cancelledHandledRef.current = true;
            dispatch(clearCurrentBooking());
            notificationService.clearPendingRideRequest();
            const reason = (booking as any)?.cancellationReason || 'Customer has cancelled this ride request.';
            navigation.navigate('DriverHome', {});
            Alert.alert('Ride Cancelled ❌', reason, [{ text: 'OK' }]);
        }
    }, [isCancelledFromBooking, booking, navigation, dispatch]);

    // Hardware back button
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('DriverHome', {});
                }
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

    // Countdown timer
    useEffect(() => {
        if (isTokenReceived || isExpired) return;
        const timer = setInterval(() => {
            setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isTokenReceived, isExpired]);

    useEffect(() => {
        if (secondsRemaining === 0 && !isTokenReceived) setIsExpired(true);
    }, [secondsRemaining, isTokenReceived]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const bookingUser = booking?.userId && typeof booking.userId === 'object' ? (booking.userId as any) : null;
    const customerName = toText(bookingUser?.name || (booking as any)?.customerName, 'Customer');
    const customerPhone = toText(bookingUser?.phone || (booking as any)?.customerPhone, '');
    const customerAvatar = toText(bookingUser?.profileImage || (booking as any)?.customerAvatar, '');

    const fareNumeric = Number(booking?.fare) || 0;
    const tokenNumeric = Number(booking?.tokenMoney) || Math.round(fareNumeric * 0.1);
    const remainingNumeric = Math.max(0, fareNumeric - tokenNumeric);
    const paidAmount = Number(paymentData?.amount) || tokenNumeric;
    const paymentMethodText = toText(paymentData?.paymentMethod || (booking as any)?.paymentMethod, 'UPI').toUpperCase();

    const handleBack = () => {
        if (navigation.canGoBack()) { navigation.goBack(); }
        else { navigation.navigate('DriverHome', {}); }
    };

    // Navigate to DriverRideConfirmed — guard against double-tap but ALWAYS release
    const handleTokenReceived = () => {
        if (navigatingRef.current) return;
        navigatingRef.current = true;
        const targetId = bookingId || (currentBooking as any)?._id || '';
        try {
            navigation.replace('DriverRideConfirmed', { requestId: targetId });
        } catch {
            navigation.navigate('DriverRideConfirmed', { requestId: targetId });
        }
        // Release guard — if screen is still mounted (navigation failed), user can retry
        setTimeout(() => {
            if (mountedRef.current) navigatingRef.current = false;
        }, 2000);
    };

    // Firebase payment notification
    useEffect(() => {
        const unsubscribe = notificationService.onPaymentReceived((data: any) => {
            if (paymentHandledRef.current || !mountedRef.current) return;
            const notifBookingId = String(data?.bookingId || data?._id || '').trim();
            const currentId = String(bookingId || '').trim();
            const matches =
                !currentId || !notifBookingId ||
                notifBookingId === currentId ||
                notifBookingId.includes(currentId) ||
                currentId.includes(notifBookingId);
            if (!matches) return;
            paymentHandledRef.current = true;
            setPaymentData(data ?? null);
            setIsTokenReceived(true);
            safeFetchBooking();
        });
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [bookingId, safeFetchBooking]);

    // Firebase ride cancelled notification: immediately return to DriverHome
    useEffect(() => {
        const unsubscribe = notificationService.onRideCancelled((data: any) => {
            if (cancelledHandledRef.current || !mountedRef.current) return;
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
            const reason = data?.message || data?.body || 'Customer has cancelled this ride request.';
            navigation.navigate('DriverHome', {});
            Alert.alert('Ride Cancelled ❌', reason, [{ text: 'OK' }]);
        });
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [bookingId, navigation, dispatch]);

    const handleCancelWait = () => {
        Alert.alert('Cancel Waiting?', 'Are you sure you want to cancel this ride request?', [
            { text: 'Continue Waiting', style: 'cancel' },
            {
                text: 'Cancel Ride', style: 'destructive',
                onPress: async () => {
                    try {
                        if (bookingId) {
                            await dispatch(cancelBookingAction({ bookingId, reason: 'Driver cancelled while waiting for token' })).unwrap();
                        }
                    } catch (err) { console.warn('Cancel error:', err); }
                    Alert.alert('Ride Cancelled', 'The ride request has been cancelled.', [
                        { text: 'OK', onPress: () => navigation.navigate('DriverHome', {}) },
                    ]);
                },
            },
        ]);
    };

    const handleCall = () => {
        if (customerPhone) {
            Linking.openURL(`tel:${customerPhone.replace(/\s+/g, '')}`).catch(() => {
                Alert.alert('Calling Customer', `Unable to call ${customerName}.`);
            });
        } else {
            Alert.alert('Calling Customer', `Phone number not available for ${customerName}.`, [{ text: 'OK' }]);
        }
    };

    // ── Expired screen ──
    if (isExpired && !isTokenReceived) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
                <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />
                <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: isDark ? 'rgba(225,29,72,0.15)' : '#FFE4E6', borderColor: isDark ? 'rgba(225,29,72,0.3)' : '#FECDD3', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1 }}>
                        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                            <Circle cx="12" cy="12" r="10" stroke="#E11D48" strokeWidth="2" />
                            <Path d="M15 9L9 15M9 9L15 15" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
                        </Svg>
                    </View>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>Token Payment Time Expired</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18, maxWidth: 280 }}>
                        The customer {customerName} did not complete the token payment within 10 minutes. This ride request has been automatically cancelled.
                    </Text>
                    <TouchableOpacity activeOpacity={0.88} onPress={() => navigation.navigate('DriverHome', {})} style={{ backgroundColor: colors.primary, width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 24 }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Back to Driver Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Main screen ──
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

            {/* Header */}
            <View style={{ backgroundColor: colors.surface, borderBottomColor: colors.borderLight, borderBottomWidth: 1, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, marginRight: 8 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <BackArrowIcon size={22} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>
                            {isTokenReceived ? 'Token Received 🎉' : 'Waiting for Token'}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }} numberOfLines={1}>
                            {isTokenReceived ? 'Payment verified successfully' : '10-minute payment window active'}
                        </Text>
                    </View>
                </View>

                {isTokenReceived ? (
                    <View style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7', borderColor: isDark ? 'rgba(34,197,94,0.3)' : '#86EFAC', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 }} />
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#059669' }}>Paid ✓</Text>
                    </View>
                ) : (
                    <View style={{ backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7', borderColor: isDark ? 'rgba(245,158,11,0.3)' : '#FDE68A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B', marginRight: 8 }} />
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#F59E0B' }}>{formatTime(secondsRemaining)}</Text>
                    </View>
                )}
            </View>

            {/* Body */}
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 12 }}>Loading booking details...</Text>
                </View>
            ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* 1. Hero Card */}
                    {isTokenReceived ? (
                        <View style={{ backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#059669' : '#86EFAC', borderRadius: 16, borderWidth: 2, padding: 20, marginBottom: 16, alignItems: 'center' }}>
                            <View style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.25)' : '#D1FAE5', borderColor: '#10B981', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2 }}>
                                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                                    <Circle cx="12" cy="12" r="10" fill="#10B981" />
                                    <Path d="M8 12.5L10.5 15L16 9.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            </View>
                            <View style={{ backgroundColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.4)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 2, borderRadius: 20, marginBottom: 4 }}>
                                <Text style={{ fontSize: 10, fontWeight: '900', color: isDark ? '#6EE7B7' : '#065F46', textTransform: 'uppercase', letterSpacing: 1.5 }}>TOKEN PAYMENT RECEIVED</Text>
                            </View>
                            <Text style={{ color: isDark ? '#FFFFFF' : '#065F46', fontSize: 32, fontWeight: '900', marginTop: 4 }}>
                                ₹{paidAmount.toLocaleString('en-IN')}
                            </Text>
                            <Text style={{ color: isDark ? '#A7F3D0' : '#047857', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 2 }}>
                                Paid via {paymentMethodText}
                            </Text>
                            <Text style={{ color: isDark ? '#D1FAE5' : '#065F46', fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 18, paddingHorizontal: 12, fontWeight: '500' }}>
                                Customer <Text style={{ fontWeight: '800' }}>{customerName}</Text> ne advance token amount pay kar diya hai. Booking confirm karne ke liye neeche diye gaye button par click karein.
                            </Text>
                            {paymentData?.transactionId ? (
                                <View style={{ marginTop: 12, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' }}>
                                    <Text style={{ color: isDark ? '#6EE7B7' : '#047857', fontSize: 10 }}>Txn ID: {toText(paymentData.transactionId)}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, alignItems: 'center' }}>
                            <View style={{ backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                    <Circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" />
                                    <Path d="M12 6V12L16 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                                </Svg>
                            </View>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 1.5 }}>Awaiting Token Payment</Text>
                            <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900', marginTop: 4 }}>{formatTime(secondsRemaining)}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18, paddingHorizontal: 12 }}>
                                Customer <Text style={{ color: colors.text, fontWeight: '700' }}>{customerName}</Text> has 10 minutes to pay the ₹{tokenNumeric.toLocaleString('en-IN')} token. Once paid, the booking will be confirmed automatically.
                            </Text>
                            <View style={{ backgroundColor: colors.surfaceSecondary, width: '100%', height: 8, borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
                                <View style={{ backgroundColor: '#F59E0B', height: '100%', borderRadius: 4, width: `${(secondsRemaining / 600) * 100}%` as any }} />
                            </View>
                        </View>
                    )}

                    {/* 2. Customer & Route Card */}
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 }}>
                        <View style={{ borderBottomColor: colors.borderLight, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                                {customerAvatar ? (
                                    <Image source={{ uri: customerAvatar }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 1, borderColor: colors.borderLight }} resizeMode="cover" />
                                ) : (
                                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: isDark ? 'rgba(59,130,246,0.3)' : '#DBEAFE' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#93C5FD' : '#2563EB' }}>{customerName.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                                <View>
                                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{customerName}</Text>
                                    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
                                        Booking #{toText(booking?.bookingNumber) || toText((booking as any)?._id).slice(-6).toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity activeOpacity={0.7} onPress={handleCall} style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : '#EFF6FF', borderColor: isDark ? 'rgba(59,130,246,0.3)' : '#DBEAFE', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                                    <Path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4741 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5901 20.9046 21.733 20.6407 21.8214C20.3769 21.9099 20.0974 21.942 19.82 21.9157C16.7428 21.5815 13.787 20.5292 11.19 18.8419C8.77382 17.2917 6.70828 15.2262 5.15808 12.81C3.46513 10.2033 2.41243 7.23668 2.0843 4.14999C2.05799 3.87321 2.08985 3.59431 2.17787 3.33089C2.26589 3.06747 2.40808 2.82562 2.59573 2.62061C2.78338 2.41559 3.01209 2.25206 3.26685 2.14041C3.52161 2.02876 3.79672 1.9715 4.075 1.97232H7.075C7.56299 1.96753 8.03541 2.14057 8.40461 2.4593C8.77382 2.77803 9.01463 3.22129 9.08333 3.70666C9.21124 4.6117 9.43265 5.49896 9.74308 6.35332C9.8784 6.72312 9.89745 7.1264 9.79782 7.5073C9.69818 7.88819 9.48427 8.22851 9.18333 8.48332L7.91333 9.75332C9.35123 12.2818 11.4582 14.3888 13.9867 15.8267L15.2567 14.5567C15.5115 14.2557 15.8518 14.0418 16.2327 13.9422C16.6136 13.8425 17.0169 13.8616 17.3867 13.9969C18.241 14.3073 19.1283 14.5287 20.0333 14.6567C20.524 14.7259 20.9715 14.9714 21.2911 15.3468C21.6108 15.7222 21.7808 16.2023 21.77 16.6967L22 16.92Z" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Call</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ backgroundColor: colors.surfaceSecondary, marginTop: 12, padding: 12, borderRadius: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 }} />
                                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', flex: 1 }}>{toText(booking?.pickupLocation?.title)}</Text>
                            </View>
                            <View style={{ backgroundColor: colors.border, width: 4, height: 12, marginLeft: 4, marginVertical: 4 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F43F5E', marginRight: 8 }} />
                                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', flex: 1 }}>{toText(booking?.dropLocation?.title)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* 3. Fare Summary */}
                    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Fare Summary</Text>
                        <View style={{ borderBottomColor: colors.borderLight, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Total Agreed Fare</Text>
                            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>₹{fareNumeric.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={{ borderBottomColor: colors.borderLight, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: isTokenReceived ? '#10B981' : '#F59E0B' }}>
                                {isTokenReceived ? 'Token Paid ✓' : `Token to be Paid (${toText((currentBooking?.vehicleId as any)?.fee, '10')}%)`}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: isTokenReceived ? '#10B981' : '#F59E0B' }}>₹{paidAmount.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingTop: 8 }}>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Remaining to Collect</Text>
                            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>₹{remainingNumeric.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>

                    {/* 4. Action Buttons */}
                    <View style={{ marginTop: 8, marginBottom: 24 }}>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={handleTokenReceived}
                            style={{ backgroundColor: isTokenReceived ? '#10B981' : colors.primary, width: '100%', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 4 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
                                <Circle cx="12" cy="12" r="10" fill="#FFFFFF" />
                                <Path d="M8 12L11 15L16 9" stroke={isTokenReceived ? '#10B981' : colors.primary} strokeWidth="2.5" strokeLinecap="round" />
                            </Svg>
                            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14 }}>
                                {isTokenReceived ? 'Token Received — Proceed to Ride ➔' : 'Token Received (Confirm Booking)'}
                            </Text>
                        </TouchableOpacity>

                        {!isTokenReceived && (
                            <TouchableOpacity activeOpacity={0.7} onPress={handleCancelWait} style={{ backgroundColor: colors.surfaceSecondary, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 12 }}>Cancel Waiting</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export const RideAcceptedScreen = WaitingTokenScreen;
export const WaitingToken = WaitingTokenScreen;

export default WaitingTokenScreen;
