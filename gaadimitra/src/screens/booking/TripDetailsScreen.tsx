import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  TripDetailsScreenNavigationProp,
  TripDetailsScreenRouteProp,
  DriverInfo,
  TripInfoData,
} from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import { InfoNoteBox } from '../../components/booking/InfoNoteBox';
import { DriverSummaryCard } from '../../components/booking/DriverSummaryCard';
import {
  CalendarOutlineIcon,
  ClockOutlineIcon,
  UsersIcon,
  CarBadgeIcon,
  PaperPlaneIcon,
} from '../../assets/icons/Icons';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { createBooking } from '../../store/slices/bookingSlice';
import { toast } from '../../components/common/ToastNotification';

export const TripDetailsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<TripDetailsScreenNavigationProp>();
  const route = useRoute<TripDetailsScreenRouteProp>();

  const dispatch = useAppDispatch();
  const [isSending, setIsSending] = useState(false);

  const { selectedDriver } = useAppSelector((state) => state.drivers);

  const driver: DriverInfo | null = React.useMemo(() => {
    if (route.params?.driver) {
      return route.params.driver;
    }
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
        seatingCapacity: selectedDriver.seating ? `${selectedDriver.seating} Seats` : (vehicle?.seat ? `${vehicle.seat} Seats` : '4 Seats'),
        driverVehicleImg: selectedDriver.vehicleImages,
        vehicleImage: (selectedDriver.vehicleImages && selectedDriver.vehicleImages.length > 0)
          ? selectedDriver.vehicleImages[0]
          : (vehicle?.image || null),
      };
    }
    return null;
  }, [route.params?.driver, selectedDriver]);

  const agreedFare = route.params?.agreedFare || 0;

  const tripInfo: TripInfoData = route.params?.tripInfo || {
    pickupLocation: route.params?.selectedCity || '',
    destination: '',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    pickupTime: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    passengers: driver?.seatingCapacity || '4 Seats',
    vehicleModel: driver?.vehicleModel || '',
  };

  const handleSendRequest = async () => {
    if (!driver || isSending) {
      return;
    }

    const driverId = driver.id || (driver as any)._id;
    if (!driverId) {
      toast.showError('Driver ID not found', 'Error');
      return;
    }

    const formatLocation = (loc: any) => ({
      type: 'Point' as const,
      coordinates: (Array.isArray(loc?.coordinates)
        ? loc.coordinates
        : [loc?.longitude || 0, loc?.latitude || 0]) as [number, number],
      address: loc?.address || (typeof loc === 'string' ? loc : ''),
      title: loc?.title || loc?.address || (typeof loc === 'string' ? loc : ''),
    });

    const pickupCoords = route.params?.pickupCoords;
    const dropCoords = route.params?.dropCoords;

    const pickupParam = pickupCoords
      ? {
        longitude: pickupCoords.longitude,
        latitude: pickupCoords.latitude,
        address: tripInfo.pickupLocation,
        title: tripInfo.pickupLocation,
      }
      : tripInfo.pickupLocation;

    const dropParam = dropCoords
      ? {
        longitude: dropCoords.longitude,
        latitude: dropCoords.latitude,
        address: tripInfo.destination,
        title: tripInfo.destination,
      }
      : tripInfo.destination;

    const pickup = formatLocation(pickupParam);
    const drop = formatLocation(dropParam);

    setIsSending(true);
    try {
      const resultAction = await dispatch(
        createBooking({
          driverId,
          pickupLocation: pickup,
          dropLocation: drop,
          fare: agreedFare,
        })
      );

      if (createBooking.rejected.match(resultAction)) {
        toast.showError((resultAction.payload as string) || 'Failed to create booking', 'Booking Error');
        setIsSending(false);
        return;
      }

      const bookingData = resultAction.payload;
      const createdBookingId =
        bookingData?._id || bookingData?.bookingId || bookingData?.id || route.params?.bookingId || `#RIDE${Date.now().toString().slice(-5)}`;

      navigation.navigate('DriverAccepted', {
        driver: driver || undefined,
        agreedFare,
        tripInfo,
        bookingToken: 200,
        bookingId: createdBookingId,
        status: bookingData?.status || 'requested',
      });
    } catch (err: any) {
      toast.showError(err.message || 'Failed to create booking', 'Booking Error');
    } finally {
      setIsSending(false);
    }
  };

  if (!driver) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderBar
          onBackPress={() => navigation.goBack()}
          title="Trip details"
          className="border-b"
          style={{ borderBottomColor: colors.border }}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: colors.text }} className="text-base font-bold text-center">
            Driver details not found
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: colors.primary }}
            className="mt-4 px-6 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Go Back</Text>
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
      <HeaderBar
        onBackPress={() => navigation.goBack()}
        title="Trip details"
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Driver Card */}
          <DriverSummaryCard driver={driver} className="mb-4" />

          {/* Route Timeline Card */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="p-4 rounded-xl border mb-4"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-3.5">
              Route
            </Text>

            <View className="flex-row items-start">
              <View className="items-center mr-3 mt-0.5">
                <View
                  style={{
                    borderColor: colors.primary,
                    backgroundColor: colors.card,
                  }}
                  className="w-3.5 h-3.5 rounded-full border-2"
                />
                <View style={{ backgroundColor: colors.border }} className="w-0.5 h-9 my-1" />
                <View className="w-3.5 h-3.5 rounded-full bg-red-500" />
              </View>

              <View className="flex-1">
                <View className="mb-4">
                  <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider">
                    Pickup
                  </Text>
                  <Text style={{ color: colors.text }} className="text-sm font-extrabold mt-0.5">
                    {tripInfo.pickupLocation}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider">
                    Drop
                  </Text>
                  <Text style={{ color: colors.text }} className="text-sm font-extrabold mt-0.5">
                    {tripInfo.destination}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Trip Detail Chips */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="p-4 rounded-xl border mb-4"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-3.5">
              Trip Details
            </Text>

            <View className="flex-row flex-wrap -mx-1.5">
              <View className="w-1/2 px-1.5 mb-3">
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                >
                  <View className="flex-row items-center mb-1.5">
                    <CalendarOutlineIcon size={14} color={colors.primary} />
                    <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider ml-1.5">
                      Date
                    </Text>
                  </View>
                  <Text style={{ color: colors.text }} className="text-sm font-extrabold" numberOfLines={1}>
                    {tripInfo.date}
                  </Text>
                </View>
              </View>

              <View className="w-1/2 px-1.5 mb-3">
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                >
                  <View className="flex-row items-center mb-1.5">
                    <ClockOutlineIcon size={14} color={colors.primary} />
                    <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider ml-1.5">
                      Pickup Time
                    </Text>
                  </View>
                  <Text style={{ color: colors.text }} className="text-sm font-extrabold" numberOfLines={1}>
                    {tripInfo.pickupTime}
                  </Text>
                </View>
              </View>

              <View className="w-1/2 px-1.5">
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                >
                  <View className="flex-row items-center mb-1.5">
                    <UsersIcon size={14} color={colors.primary} />
                    <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider ml-1.5">
                      Passengers
                    </Text>
                  </View>
                  <Text style={{ color: colors.text }} className="text-sm font-extrabold" numberOfLines={1}>
                    {tripInfo.passengers}
                  </Text>
                </View>
              </View>

              <View className="w-1/2 px-1.5">
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                >
                  <View className="flex-row items-center mb-1.5">
                    <CarBadgeIcon size={14} color={colors.primary} />
                    <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider ml-1.5">
                      Vehicle
                    </Text>
                  </View>
                  <Text style={{ color: colors.text }} className="text-sm font-extrabold" numberOfLines={1}>
                    {tripInfo.vehicleModel}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Fare Highlight Card */}
          <View
            style={{
              backgroundColor: `${colors.primary}15`,
              borderColor: `${colors.primary}40`,
            }}
            className="p-4 rounded-xl border mb-4 flex-row items-center justify-between"
          >
            <View>
              <Text style={{ color: colors.primary }} className="text-[11px] font-bold uppercase tracking-wider">
                Total Agreed Fare
              </Text>
              <Text style={{ color: colors.text }} className="text-2xl font-black mt-0.5">
                ₹{agreedFare.toLocaleString('en-IN')}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.card,
                borderColor: `${colors.primary}40`,
              }}
              className="px-3 py-1.5 rounded-full border"
            >
              <Text style={{ color: colors.primary }} className="text-[11px] font-bold">
                Pay after ride
              </Text>
            </View>
          </View>

          {/* Info Notice Box */}
          <InfoNoteBox
            subtitle="Your request will be sent to the driver. No payment is required at this stage."
            className="mb-4"
          />
        </View>
      </ScrollView>

      {/* Sticky bottom CTA, stays fixed while trip details scroll */}
      <View
        style={{
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        }}
        className="px-5 pt-3 pb-4 border-t"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSendRequest}
          disabled={isSending}
          style={{ backgroundColor: colors.primary }}
          className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
        >
          {isSending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <View className="mr-2">
                <PaperPlaneIcon size={18} color="#FFFFFF" />
              </View>
              <Text className="text-white text-base font-extrabold tracking-wide">
                Send Confirmation Request
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
