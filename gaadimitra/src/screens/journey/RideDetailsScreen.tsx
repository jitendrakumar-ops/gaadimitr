import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Share,
  BackHandler,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RideDetailsScreenNavigationProp, RideDetailsScreenRouteProp } from '../../types/navigation';
import {
  PhoneIcon,
  ShareNodesIcon,

  LocationMarkerIcon,
  CalendarDateIcon,
  ClockTimeIcon,
} from '../../assets/icons/Icons';
import { ReportDriverModal } from '../../components/drivers/ReportDriverModal';
import { HeaderBar } from '../../components/common/HeaderBar';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector, reportDriver } from '../../store';
import { fetchBookingById, clearSelectedBooking } from '../../store/slices/bookingSlice';
import { toast } from '../../components/common/ToastNotification';

export const RideDetailsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<RideDetailsScreenNavigationProp>();
  const route = useRoute<RideDetailsScreenRouteProp>();
  const dispatch = useAppDispatch();

  const bookingId = route.params?.bookingId;
  const { selectedBooking, isLoadingBookingDetail, error } = useAppSelector((s) => s.bookings);

  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (bookingId) dispatch(fetchBookingById(bookingId));
    return () => {
      dispatch(clearSelectedBooking());
    };
  }, [dispatch, bookingId]);

  const handleRefresh = useCallback(async () => {
    if (!bookingId) return;
    setRefreshing(true);
    await dispatch(fetchBookingById(bookingId));
    setRefreshing(false);
  }, [dispatch, bookingId]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('HomeDashboard', { screen: 'MyRides' } as any);
  }, [navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  const handleCallDriver = () => {
    const phone = selectedBooking?.driverId?.userId?.phone;
    if (!phone) return toast.showError('Driver phone number is not available.', 'Contact Unavailable');
    Linking.openURL(`tel:${phone}`).catch(() => toast.showError('Unable to initiate call.', 'Error'));
  };

  const handleShareTrip = () => {
    const token = Number(selectedBooking?.tokenMoney ?? selectedBooking?.bookingToken ?? selectedBooking?.tokenAmount ?? selectedBooking?.advanceAmount ?? 0);
    Share.share({
      message: `GaadiMitra Ride:\nBooking: #${selectedBooking?.bookingNumber || selectedBooking?._id || bookingId}\nPickup: ${selectedBooking?.pickupLocation?.title || selectedBooking?.pickupLocation?.address || ''}\nDrop: ${selectedBooking?.dropLocation?.title || selectedBooking?.dropLocation?.address || ''}\nFare: ₹${selectedBooking?.fare || 0}${token > 0 ? `\nToken Paid: ₹${token}` : ''}`,
    }).catch(() => { });
  };

  const handleReportSubmit = async (reason: string, details?: string) => {
    const rawDriver = selectedBooking?.driverId || (selectedBooking as any)?.driver;
    const driverId =
      typeof rawDriver === 'object' && rawDriver !== null
        ? rawDriver._id || rawDriver.id || rawDriver.driverId
        : typeof rawDriver === 'string'
        ? rawDriver
        : null;

    if (!driverId) {
      toast.showError('Driver information not found for this ride.', 'Report Failed');
      return;
    }

    try {
      const fullReason = details && details.trim() ? `${reason} - ${details.trim()}` : reason;
      const resultAction = await dispatch(
        reportDriver({
          driverId: String(driverId),
          reason: fullReason,
          details: details?.trim() || undefined,
        })
      );

      if (reportDriver.fulfilled.match(resultAction)) {
        toast.showSuccess('Thank you for reporting. Our safety team will review this driver.', 'Report Submitted');
      } else if (reportDriver.rejected.match(resultAction)) {
        toast.showError((resultAction.payload as string) || 'Failed to submit report', 'Error');
      }
    } catch (err: any) {
      toast.showError(err?.message || 'Error submitting report', 'Error');
    }
  };



  const status = selectedBooking?.status?.toLowerCase() || 'pending';


  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <HeaderBar onBackPress={handleBack} title="Ride Details" className="border-b" style={{ borderBottomColor: colors.border }} />

      {isLoadingBookingDetail && !selectedBooking && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-3">Loading details...</Text>
        </View>
      ) : error && !selectedBooking ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text style={{ color: colors.text }} className="text-base font-bold mb-2">Failed to load booking</Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs mb-4 text-center">{error}</Text>
          <TouchableOpacity onPress={() => bookingId && dispatch(fetchBookingById(bookingId))} style={{ backgroundColor: colors.primary }} className="px-5 py-2.5 rounded-xl">
            <Text className="text-white text-xs font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        >
          <View>
            {/* Booking ID & Status */}
            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-xl border p-4 mb-4 flex-row justify-between items-center">
              <View>
                <Text style={{ color: colors.placeholder }} className="text-xs font-medium">Booking ID</Text>
                <Text style={{ color: colors.text }} className="text-base font-black mt-0.5">
                  #{selectedBooking?.bookingNumber || selectedBooking?._id?.slice(-6).toUpperCase() || bookingId}
                </Text>
              </View>
              <View className="items-end">
                <Text style={{ color: colors.placeholder }} className="text-xs font-medium mb-1">Status</Text>
                <View className={`px-2.5 py-1 rounded-full border ${status === 'completed' ? 'bg-emerald-50 border-emerald-200' : status === 'cancelled' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <Text className={`text-xs font-extrabold capitalize ${status === 'completed' ? 'text-emerald-700' : status === 'cancelled' ? 'text-red-700' : 'text-blue-700'}`}>
                    {selectedBooking?.status || 'Pending'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Driver & Vehicle */}
            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-xl border p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  {selectedBooking?.driverId.userId?.profileImage ? (
                    <Image source={{ uri: selectedBooking.driverId.userId.profileImage }} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
                  ) : (
                    <View style={{ backgroundColor: `${colors.primary}15`, width: 48, height: 48, borderRadius: 24 }} className="items-center justify-center">
                      <Text style={{ color: colors.primary }} className="text-lg font-bold">
                        {(selectedBooking?.driverId.userId?.name || 'D').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="ml-3 flex-1">
                    <Text style={{ color: colors.text }} className="text-base font-bold" numberOfLines={1}>
                      {selectedBooking?.driverId.userId?.name || 'Driver Not Assigned'}
                    </Text>
                    {selectedBooking?.driverId?.rating && (
                      <View className="flex-row items-center mt-0.5">
                        <Text className="text-amber-500 text-xs mr-1">★</Text>
                        <Text style={{ color: colors.text }} className="text-xs font-bold">{selectedBooking.driverId.rating}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {selectedBooking?.driverId.userId?.phone && (
                  <TouchableOpacity onPress={handleCallDriver} style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}40` }} className="w-10 h-10 rounded-full border items-center justify-center ml-2">
                    <PhoneIcon size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ backgroundColor: colors.border }} className="h-[1px] my-3" />

              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text style={{ color: colors.text }} className="text-sm font-bold">
                    {selectedBooking?.driverId?.vehicleModel || selectedBooking?.serviceId?.title || ''}
                  </Text>
                  {selectedBooking?.driverId?.vehicleNo && (
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-0.5">
                      {selectedBooking.driverId.vehicleNo}
                    </Text>
                  )}
                </View>
                {selectedBooking?.vehicleId?.image ? (
                  <Image source={{ uri: selectedBooking.vehicleId.image }} style={{ width: 80, height: 48 }} resizeMode="contain" />
                ) : (
                  <Image source={require('../../assets/images/maruti_dzire_white.jpg')} style={{ width: 80, height: 48 }} resizeMode="contain" />
                )}
              </View>
            </View>

            {/* Trip Details */}
            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-xl border p-4 mb-4 space-y-3">
              <View className="flex-row items-start">
                <LocationMarkerIcon size={18} color="#2563EB" />
                <View className="ml-3 flex-1">
                  <Text style={{ color: colors.placeholder }} className="text-[11px] font-medium">Pickup</Text>
                  <Text style={{ color: colors.text }} className="text-sm font-bold">
                    {selectedBooking?.pickupLocation?.title || selectedBooking?.pickupLocation?.address || 'N/A'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start pt-1">
                <LocationMarkerIcon size={18} color="#EF4444" />
                <View className="ml-3 flex-1">
                  <Text style={{ color: colors.placeholder }} className="text-[11px] font-medium">Destination</Text>
                  <Text style={{ color: colors.text }} className="text-sm font-bold">
                    {selectedBooking?.dropLocation?.title || selectedBooking?.dropLocation?.address || 'N/A'}
                  </Text>
                </View>
              </View>

              {selectedBooking?.createdAt && (
                <View className="flex-row items-center pt-1">
                  <CalendarDateIcon size={18} color={colors.textSecondary} />
                  <View className="ml-3 flex-row items-center justify-between flex-1">
                    <Text style={{ color: colors.text }} className="text-xs font-medium">
                      {new Date(selectedBooking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    <View className="flex-row items-center">
                      <ClockTimeIcon size={14} color={colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary }} className="text-xs ml-1">
                        {new Date(selectedBooking.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View className="pt-2 border-t space-y-2" style={{ borderTopColor: colors.border }}>
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: colors.placeholder }} className="text-xs font-semibold">Total Fare</Text>
                  <Text style={{ color: colors.text }} className="text-base font-bold">
                    ₹{Number(selectedBooking?.fare || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text style={{ color: colors.placeholder }} className="text-xs font-semibold">Token Money</Text>
                    <View className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40">
                      <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Paid</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold text-emerald-600">
                    ₹{Number(selectedBooking?.tokenMoney ?? selectedBooking?.bookingToken ?? selectedBooking?.tokenAmount ?? selectedBooking?.advanceAmount ?? 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                {Number(selectedBooking?.tokenMoney ?? selectedBooking?.bookingToken ?? selectedBooking?.tokenAmount ?? selectedBooking?.advanceAmount ?? 0) > 0 && (
                  <View className="flex-row items-center justify-between pt-1 border-t border-dashed" style={{ borderTopColor: colors.border }}>
                    <Text style={{ color: colors.placeholder }} className="text-xs font-semibold">Remaining Payable</Text>
                    <Text style={{ color: colors.text }} className="text-base font-black">
                      ₹{Math.max(0, Number(selectedBooking?.fare || 0) - Number(selectedBooking?.tokenMoney ?? selectedBooking?.bookingToken ?? selectedBooking?.tokenAmount ?? selectedBooking?.advanceAmount ?? 0)).toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="pt-2">
            <View className="flex-row items-center mb-3">
              {selectedBooking?.driverId?.userId?.phone && (
                <TouchableOpacity onPress={handleCallDriver} style={{ backgroundColor: colors.primary }} className="flex-1 py-3.5 px-4 rounded-xl flex-row items-center justify-center mr-2">
                  <PhoneIcon size={18} color="#FFFFFF" />
                  <Text className="text-white text-sm font-bold ml-2">Call Driver</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleShareTrip} style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-1 border py-3.5 px-4 rounded-xl flex-row items-center justify-center">
                <ShareNodesIcon size={18} color={colors.primary} />
                <Text style={{ color: colors.primary }} className="text-sm font-bold ml-2">Share Trip</Text>
              </TouchableOpacity>
            </View>


            <TouchableOpacity onPress={() => setShowReportModal(true)} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full border py-3 rounded-xl items-center justify-center">
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">Report Ride Issue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <ReportDriverModal
        visible={showReportModal}
        driverName={selectedBooking?.driverId?.userId?.name || selectedBooking?.driverId?.name || (selectedBooking as any)?.driver?.name || 'Driver'}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
      />
    </SafeAreaView>
  );
};
