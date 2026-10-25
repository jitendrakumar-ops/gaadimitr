import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { PhoneIcon } from '../../assets/icons/Icons';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBookings } from '../../store/slices/bookingSlice';
import { confirmDialog } from '../../components/common/CustomAlertModal';

type FilterKey = 'all' | 'completed' | 'tripCompleted' | 'cancelled';

interface MyRidesViewProps {
  onBookRidePress?: () => void;
}

export const MyRidesView: React.FC<MyRidesViewProps> = ({ onBookRidePress }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { bookingsList, bookingsMeta, isLoadingBookings } = useAppSelector((s) => s.bookings);

  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  /** Load first page, optionally resetting list */
  const load = useCallback(
    (reset = true) => {
      dispatch(fetchBookings({
        page: 1,
        limit: 10,
        status: selectedFilter === 'all' ? undefined : selectedFilter,
        reset,
      }));
    },
    [dispatch, selectedFilter],
  );

  useEffect(() => {
    load(true);
  }, [load]);




  const loadMore = () => {
    if (isLoadingBookings || !bookingsMeta.hasMore) return;
    dispatch(fetchBookings({
      page: bookingsMeta.page + 1,
      limit: bookingsMeta.limit,
      status: selectedFilter === 'all' ? undefined : selectedFilter,
      reset: false,
    }));
  };


  const filterTabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'tripCompleted', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleCallDriver = (ride: any) => {
    const phone = ride.driverId.userId?.phone || ride.driverId?.phone;
    const name = ride.driverId.userId?.name || ride.driverId?.name || 'Driver';
    if (!phone) return;

    confirmDialog.show({
      title: 'Call Driver',
      message: `Do you want to call ${name} (${phone})?`,
      confirmText: 'Call Now',
      cancelText: 'Cancel',
      icon: 'phone',
      onConfirm: () => {
        Linking.openURL(`tel:${phone}`).catch(() => { });
      },
    });
  };

  const handleViewRideDetails = (ride: any) => {
    navigation.navigate('RideDetails', {

      bookingId: ride._id || ride.bookingId || ride.id,
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'tripCompleted':
        return (
          <View className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
            <Text className="text-[11px] font-bold text-emerald-700">Completed</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
            <Text className="text-[11px] font-bold text-red-700">Cancelled</Text>
          </View>
        );
      default:
        return (
          <View className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            <Text className="text-[11px] font-bold text-amber-700">Pending</Text>
          </View>
        );
    }
  };

  return (
    <View className="w-full">
      {/* Filter Tabs */}
      <View className="mb-3.5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 2, flexDirection: 'row' }}
        >
          {filterTabs.map(tab => {
            const isSelected = selectedFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.75}
                onPress={() => setSelectedFilter(tab.key)}
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
                className="h-9 px-3.5 mr-2 rounded-xl flex-row items-center border"
              >
                <Text style={{ color: isSelected ? '#FFFFFF' : colors.text }} className="text-xs font-bold">
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Loading skeleton on first load */}
      {isLoadingBookings && bookingsList.length === 0 ? (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-3">
            Loading your rides...
          </Text>
        </View>
      ) : bookingsList.length === 0 ? (
        <View
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          className="rounded-xl border p-8 items-center justify-center my-3"
        >
          <Text className="text-2xl mb-2">🚗</Text>
          <Text style={{ color: colors.text }} className="text-base font-extrabold mb-1">
            No {selectedFilter !== 'all' ? selectedFilter : ''} rides found
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs text-center mb-5 leading-relaxed">
            Your booked intercity and local rides will appear here in real time.
          </Text>

        </View>
      ) : (
        <View className="pb-4">
          {bookingsList.map((ride, index) => (
            <TouchableOpacity
              key={ride._id || ride.id || ride.bookingNumber || index}
              activeOpacity={0.7}
              onPress={() => handleViewRideDetails(ride)}
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="rounded-xl border p-4 mb-3.5"
            >
              {/* Header */}
              <View style={{ borderBottomColor: colors.border }} className="flex-row items-center justify-between pb-3 border-b">
                <View>
                  <Text style={{ color: colors.text }} className="text-xs font-mono font-black">
                    #{ride.bookingNumber}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-semibold mt-0.5">
                    {ride.createdAt}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text style={{ color: colors.text, borderRightColor: colors.border }} className="text-base font-black border-r pr-2 mr-2">
                    ₹{ride.fare.toLocaleString('en-IN')}
                  </Text>
                  {renderStatusBadge(ride.status)}
                </View>
              </View>

              {/* Driver row */}
              <View className="flex-row items-center justify-between my-3">
                <View className="flex-row items-center flex-1">
                  {ride?.driverId.userId?.profileImage ? (
                    <Image
                      source={{ uri: ride?.driverId.userId.profileImage }}
                      style={{ borderColor: colors.border, width: 44, height: 44, borderRadius: 22 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{ backgroundColor: `${colors.primary}15`, borderColor: colors.border, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>
                        {ride?.driverId.userId.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View className="ml-3 flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-extrabold">{ride?.driverId.userId.name}</Text>
                    <View className="flex-row items-center mt-0.5">
                      <Text className="text-xs font-bold text-amber-500 mr-1">★</Text>
                      <Text style={{ color: colors.text }} className="text-xs font-bold">{ride?.driverId.rating}</Text>
                      {ride?.driverId.vehicleModel ? (
                        <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold ml-2">
                          • {ride?.driverId.vehicleModel}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                {ride?.driverId.userId.phone ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleCallDriver(ride)}
                    style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}40` }}
                    className="w-9 h-9 rounded-full border items-center justify-center ml-2"
                  >
                    <PhoneIcon size={16} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Route */}
              <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-xl p-3 border mb-1">
                <View className="flex-row items-center mb-2">
                  <View style={{ backgroundColor: colors.primary }} className="w-2 h-2 rounded-full mr-2.5" />
                  <Text style={{ color: colors.text }} className="text-xs font-bold flex-1" numberOfLines={1}>
                    {ride.pickupLocation.title}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View style={{ backgroundColor: colors.error }} className="w-2 h-2 rounded-full mr-2.5" />
                  <Text style={{ color: colors.text }} className="text-xs font-bold flex-1" numberOfLines={1}>
                    {ride.dropLocation.title}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Load More */}
          {bookingsMeta.hasMore && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={loadMore}
              style={{ borderColor: colors.border }}
              className="py-3 rounded-xl border items-center mt-1"
            >
              {isLoadingBookings ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{ color: colors.primary }} className="text-xs font-bold">Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
