import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBookings,
  refreshBookings,
  setStatusFilter,
} from '../store/slices/bookingSlice';
import { BookingItem } from '../types/booking';

type TabType = 'All' | 'Completed' | 'Cancelled';

export const RidesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<TabType>('All');

  const {
    bookings,
    pagination,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    page,
  } = useAppSelector((state) => state.booking);


  const getBackendStatus = useCallback((tab: TabType): string | undefined => {
    switch (tab) {
      case 'Completed':
        return 'tripCompleted';
      case 'Cancelled':
        return 'cancelled';
      case 'All':
      default:
        return undefined;
    }
  }, []);

  // Fetch bookings when activeTab changes
  useEffect(() => {
    const status = getBackendStatus(activeTab);
    dispatch(setStatusFilter(status));
    dispatch(fetchBookings({ page: 1, limit: 10, status }));
  }, [activeTab, dispatch, getBackendStatus]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    const status = getBackendStatus(activeTab);
    dispatch(refreshBookings({ limit: 10, status }));
  }, [activeTab, dispatch, getBackendStatus]);

  // Load more pagination handler
  const onLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isLoadingMore && !isLoading) {
      const status = getBackendStatus(activeTab);
      dispatch(fetchBookings({ page: page + 1, limit: 10, status }));
    }
  }, [pagination, isLoadingMore, isLoading, activeTab, page, dispatch, getBackendStatus]);

  /**
   * Format date display helper
   */
  const formatBookingDate = (dateStr?: string) => {
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
      const day = d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
      return `${day}, ${timeStr}`;
    } catch {
      return 'Recent';
    }
  };

  /**
   * Status UI helper
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tripCompleted':
        return {
          label: 'Completed',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-500',
          dot: 'bg-emerald-500',
        };
      case 'cancelled':
      case 'rejected':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          text: 'text-rose-500',
          dot: 'bg-rose-500',
        };
      case 'tripStarted':
        return {
          label: 'In Progress',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-500',
          dot: 'bg-blue-500',
        };
      case 'accepted':
      case 'driverArriving':
      case 'driverArrived':
        return {
          label: 'Active',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-500',
          dot: 'bg-amber-500',
        };
      default:
        return {
          label: status || 'Requested',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          text: 'text-slate-400',
          dot: 'bg-slate-400',
        };
    }
  };

  /**
   * Navigate to RideDetails screen
   */

  const handleRidePress = (trip: BookingItem) => {
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
        : 'Assigned Vehicle';

    const pickupAddress =
      trip.pickupLocation?.title || trip.pickupLocation?.address || 'Pickup Point';

    const dropAddress =
      trip.dropLocation?.title || trip.dropLocation?.address || 'Drop Point';

    const fareNumeric = Number(trip.fare) || 0;
    const tokenNumeric = Number(trip.tokenMoney) || Math.round(fareNumeric * 0.1);

    const isCancelled = trip.status === 'cancelled' || trip.status === 'rejected';

    navigation.navigate('RideDetails', {
      ride: {
        id: trip._id,
        bookingId: `#${trip.bookingNumber || trip._id.slice(-6).toUpperCase()}`,
        customer: customerName,
        phone: customerPhone,
        from: pickupAddress,
        to: dropAddress,
        date: formatBookingDate(trip.createdAt),
        fare: `₹${fareNumeric}`,
        token: `₹${tokenNumeric}`,
        paymentMode:
          trip.paymentMethod === 'cash'
            ? 'Cash at Drop'
            : trip.paymentMethod?.toUpperCase() || 'Cash',
        vehicle: vehicleName,
        status: trip.status === 'tripCompleted' ? 'Completed' : isCancelled ? 'Cancelled' : trip.status,
        reason: trip.cancellationReason || undefined,
        distance: trip.distance ? `${trip.distance} km` : '0 km',
        duration: isCancelled ? 'Cancelled' : '0 mins',
        baseFare: `₹${Math.min(100, fareNumeric || 100)}`,
        distanceFare: `₹${Math.max(0, fareNumeric - 100)}`,
        customerRating: trip.rating ? `${trip.rating}` : '0.0',
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="px-5 pt-3 pb-3 border-b flex-row items-center justify-between"
      >
        <View>
          <Text style={{ color: colors.text }} className="text-lg font-extrabold tracking-tight">
            Ride History
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium mt-1">
            {pagination ? `${pagination.total} total rides found` : 'Loading your rides...'}
          </Text>
        </View>

        {pagination ? (
          <View
            style={{
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
            }}
            className="px-3 py-1 rounded-full border"
          >
            <Text style={{ color: colors.primary }} className="text-[10px] font-bold">
              Page {pagination.page} of {pagination.totalPages || 1}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Tabs: All, Completed, Cancelled */}
      <View className="flex-row px-5 pt-3 pb-1">
        {(['All', 'Completed', 'Cancelled',] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.75}
              onPress={() => setActiveTab(tab)}
              style={{
                backgroundColor: isActive
                  ? tab === 'Cancelled'
                    ? '#E11D48'
                    : colors.primary
                  : colors.surface,
                borderColor: isActive
                  ? tab === 'Cancelled'
                    ? '#E11D48'
                    : colors.primary
                  : colors.border,
              }}
              className="flex-1 py-2 rounded-xl mr-2 items-center justify-center border"
            >
              <Text
                style={{
                  color: isActive ? '#FFFFFF' : colors.textSecondary,
                }}
                className="text-xs font-bold"
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error Notice if any */}
      {error && (
        <View className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex-row items-center justify-between">
          <Text className="text-xs text-rose-500 font-medium flex-1 mr-2">{error}</Text>
          <TouchableOpacity
            onPress={() => {
              const status = getBackendStatus(activeTab);
              dispatch(fetchBookings({ page: 1, limit: 10, status }));
            }}
            className="px-3 py-1 bg-rose-500 rounded-lg"
          >
            <Text className="text-xs font-bold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main List ScrollView */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Initial Loading State */}
        {isLoading && bookings.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-3">
              Fetching bookings from server...
            </Text>
          </View>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-4">
            <View
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
              }}
              className="w-16 h-16 rounded-full border items-center justify-center mb-4"
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="4" width="18" height="18" rx="2" stroke={colors.primary} strokeWidth="2" />
                <Path d="M16 2V6M8 2V6M3 10H21" stroke={colors.primary} strokeWidth="2" />
                <Circle cx="12" cy="15" r="2" fill={colors.primary} />
              </Svg>
            </View>
            <Text style={{ color: colors.text }} className="text-base font-bold text-center mb-1">
              No {activeTab} Rides Found
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs text-center leading-5 max-w-[260px] mb-5">
              {activeTab === 'Completed'
                ? 'Completed rides and trip earnings will appear here once finished.'
                : activeTab === 'Cancelled'
                  ? 'Cancelled or rejected ride requests will be recorded here.'
                  : 'No ride bookings have been assigned to your profile yet.'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onRefresh}
              style={{ backgroundColor: colors.primary }}
              className="px-5 py-2.5 rounded-xl flex-row items-center"
            >
              <Text className="text-white text-xs font-bold">Refresh Rides</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Bookings List */
          <View>
            {bookings.map((trip) => {
              const badge = getStatusBadge(trip.status);
              const customerName =
                typeof trip.userId === 'object' && trip.userId?.name
                  ? trip.userId.name
                  : 'Rider';

              const bookingNo = `#${trip.bookingNumber || trip._id.slice(-6).toUpperCase()}`;
              const vehicleName =
                typeof trip.vehicleId === 'object' && trip.vehicleId?.title
                  ? trip.vehicleId.title
                  : 'Vehicle';

              const pickupText =
                trip.pickupLocation?.title || trip.pickupLocation?.address || 'Pickup Point';
              const dropText =
                trip.dropLocation?.title || trip.dropLocation?.address || 'Drop Point';

              const fareText = `₹${trip.fare ?? 0}`;
              const isCancelled = trip.status === 'cancelled' || trip.status === 'rejected';

              return (
                <TouchableOpacity
                  key={trip._id}
                  activeOpacity={0.85}
                  onPress={() => handleRidePress(trip)}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                  className="rounded-xl border p-4 mb-3"
                >
                  {/* Header: Customer, Booking ID & Status */}
                  <View
                    style={{ borderBottomColor: colors.borderLight }}
                    className="flex-row items-center justify-between pb-3 border-b"
                  >
                    <View className="flex-1 mr-2">
                      <Text style={{ color: colors.text }} className="text-xs font-bold" numberOfLines={1}>
                        {customerName}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-[10px] font-mono mt-0.5">
                        {bookingNo} • {vehicleName}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        style={{ color: isCancelled ? colors.textMuted : colors.text }}
                        className={`text-base font-black ${isCancelled ? 'line-through' : ''}`}
                      >
                        {fareText}
                      </Text>
                      <View className={`${badge.bg} px-2 py-0.5 rounded mt-1 flex-row items-center border ${badge.border}`}>
                        <View className={`w-1.5 h-1.5 rounded-full ${badge.dot} mr-1`} />
                        <Text className={`text-[9px] font-extrabold ${badge.text}`}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Route: Pickup & Drop */}
                  <View
                    style={{ backgroundColor: colors.surfaceSecondary }}
                    className="mt-3 p-3 rounded-xl"
                  >
                    <View className="flex-row items-center mb-1">
                      <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      <Text
                        style={{ color: colors.text }}
                        className="text-xs font-bold flex-1"
                        numberOfLines={1}
                      >
                        {pickupText}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: colors.border }} className="w-0.5 h-2.5 ml-1 my-0.5" />
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
                      <Text
                        style={{ color: colors.text }}
                        className="text-xs font-bold flex-1"
                        numberOfLines={1}
                      >
                        {dropText}
                      </Text>
                    </View>
                  </View>

                  {/* Cancellation Reason if cancelled */}
                  {isCancelled && trip.cancellationReason && (
                    <View className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <Text className="text-[10px] text-rose-500 font-medium" numberOfLines={2}>
                        Reason: {trip.cancellationReason}
                      </Text>
                    </View>
                  )}

                  {/* Footer / Payment Details */}
                  <View
                    style={{ borderTopColor: colors.borderLight }}
                    className="flex-row items-center justify-between mt-3 pt-2 border-t"
                  >
                    <View className="flex-row items-center">
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-1.5">
                        <Rect x="3" y="4" width="18" height="18" rx="2" stroke={colors.textMuted} strokeWidth="2" />
                        <Path d="M16 2V6M8 2V6M3 10H21" stroke={colors.textMuted} strokeWidth="2" />
                      </Svg>
                      <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium">
                        {formatBookingDate(trip.createdAt)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <View
                        style={{ backgroundColor: colors.surfaceSecondary }}
                        className="px-2 py-0.5 rounded mr-2"
                      >
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-semibold">
                          {trip.paymentMethod === 'cash' ? 'Cash at Drop' : trip.paymentMethod?.toUpperCase() || 'Cash'}
                        </Text>
                      </View>
                      <Text style={{ color: colors.primary }} className="text-[11px] font-bold">Details ➔</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Pagination / Load More Button */}
            {pagination?.hasNextPage && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onLoadMore}
                disabled={isLoadingMore}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="py-3 rounded-xl border items-center justify-center mt-2 mb-4 flex-row"
              >
                {isLoadingMore ? (
                  <>
                    <ActivityIndicator size="small" color={colors.primary} className="mr-2" />
                    <Text style={{ color: colors.primary }} className="text-xs font-bold">
                      Loading more rides...
                    </Text>
                  </>
                ) : (
                  <Text style={{ color: colors.primary }} className="text-xs font-bold">
                    Load More Rides (Page {page + 1} of {pagination.totalPages})
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RidesScreen;
