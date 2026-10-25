import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  FinalizeRideScreenNavigationProp,
  FinalizeRideScreenRouteProp,
  DriverInfo,
  TripInfoData,
} from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import { Input } from '../../components/common/Input';
import { DriverSummaryCard } from '../../components/booking/DriverSummaryCard';
import { toast } from '../../components/common/ToastNotification';
import { InfoNoteBox } from '../../components/booking/InfoNoteBox';
import {
  CheckCircleIcon,
  CrossCircleIcon,
  LocationMarkerIcon,
  FlagIcon,
  SearchIcon,
} from '../../assets/icons/Icons';
import {
  detectCurrentLocationWithGps,
  searchPlacesWithGoogle,
  getPlaceCoordinates,
  geocodeAddress,
  Coordinates,
  PlacePrediction,
} from '../../utils/mapConfig';
import { useTheme } from '../../theme';
import { useAppSelector } from '../../store';

const hasCoordinates = (coordinates: Coordinates | null | undefined) =>
  Boolean(
    coordinates &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    (coordinates.latitude !== 0 || coordinates.longitude !== 0)
  );

export const FinalizeRideScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<FinalizeRideScreenNavigationProp>();
  const route = useRoute<FinalizeRideScreenRouteProp>();

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
        seatingCapacity: selectedDriver.seating ?? `${selectedDriver.seating} Seats`,
        driverVehicleImg: selectedDriver.vehicleImages,
        vehicleImage: (selectedDriver.vehicleImages && selectedDriver.vehicleImages.length > 0)
          ? selectedDriver.vehicleImages[0]
          : (vehicle?.image || null),
      };
    }
    return null;
  }, [route.params?.driver, selectedDriver]);

  const incomingTripInfo = route.params?.tripInfo;

  const [fareText, setFareText] = useState('');
  const [pickupLocation, setPickupLocation] = useState(
    incomingTripInfo?.pickupLocation || route.params?.selectedCity || ''
  );
  const [dropLocation, setDropLocation] = useState(incomingTripInfo?.destination || '');
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(route.params?.pickupCoords || null);
  const [dropCoords, setDropCoords] = useState<Coordinates | null>(route.params?.dropCoords || null);
  const [locationType, setLocationType] = useState<'pickup' | 'drop' | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>([]);
  const pickupSelectionRef = useRef(false);
  const pickupResolutionStartedRef = useRef(false);

  useEffect(() => {
    if (hasCoordinates(route.params?.pickupCoords) || pickupResolutionStartedRef.current) return;
    pickupResolutionStartedRef.current = true;
    let isActive = true;

    const resolvePickupCoordinates = async () => {
      setIsDetectingLocation(true);
      try {
        const existingPickup = incomingTripInfo?.pickupLocation?.trim();
        if (existingPickup) {
          const coords = await geocodeAddress(existingPickup);
          if (!isActive || pickupSelectionRef.current) return;
          if (hasCoordinates(coords)) {
            setPickupCoords(coords);
            return;
          }
        }

        if (!isActive || pickupSelectionRef.current) return;
        const location = await detectCurrentLocationWithGps();
        if (!isActive || pickupSelectionRef.current || !hasCoordinates(location.coordinates)) return;
        setPickupLocation(location.shortLocation);
        setPickupCoords(location.coordinates);
      } catch (error) {
        console.warn('Could not automatically resolve pickup coordinates:', error);
      } finally {
        if (isActive) setIsDetectingLocation(false);
      }
    };

    void resolvePickupCoordinates();
    return () => {
      isActive = false;
      pickupResolutionStartedRef.current = false;
    };
  }, [incomingTripInfo?.pickupLocation, route.params?.pickupCoords]);

  const agreedFare = parseInt(fareText, 10) || 0;
  const isFormValid = pickupLocation.trim().length > 0 && dropLocation.trim().length > 0 && agreedFare > 0;

  // Live dynamic Google Places Autocomplete search (no static/default list)
  useEffect(() => {
    if (!locationQuery.trim() || locationQuery.trim().length < 2) {
      setPlacePredictions([]);
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlacesWithGoogle(locationQuery.trim());
        setPlacePredictions(results);
      } catch (err) {
        console.warn('Google Places autocomplete search error:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationQuery]);

  const closeLocationPicker = () => {
    setLocationType(null);
    setLocationQuery('');
    setPlacePredictions([]);
  };

  const selectLocation = (location: string, coords?: { latitude: number; longitude: number } | null) => {
    if (locationType === 'pickup') {
      pickupSelectionRef.current = true;
      setPickupLocation(location);
      setPickupCoords(hasCoordinates(coords) ? coords! : null);
    } else {
      setDropLocation(location);
      setDropCoords(hasCoordinates(coords) ? coords! : null);
    }
    closeLocationPicker();
  };

  const selectPrediction = async (prediction: PlacePrediction) => {
    const locName = prediction.description;
    const coords = await getPlaceCoordinates(prediction.placeId, locName);
    selectLocation(locName, coords);
  };

  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const geo = await detectCurrentLocationWithGps();
      selectLocation(geo.shortLocation, geo.coordinates);
    } catch {
      toast.showError('Could not detect your location. Please search and select a place.', 'Location Error');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleConfirmRide = async () => {
    if (!isFormValid || !driver) {
      return;
    }

    const resolvedPickupCoords = hasCoordinates(pickupCoords)
      ? pickupCoords
      : await geocodeAddress(pickupLocation.trim());
    if (!resolvedPickupCoords || !hasCoordinates(resolvedPickupCoords)) {
      toast.showError('Could not get pickup coordinates. Please select the pickup location again.', 'Location Error');
      return;
    }

    const now = new Date();
    const formattedDate = incomingTripInfo?.date || now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = incomingTripInfo?.pickupTime || now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

    navigation.navigate('TripDetails', {
      driver,
      tripInfo: {
        pickupLocation: pickupLocation.trim(),
        destination: dropLocation.trim(),
        date: formattedDate,
        pickupTime: formattedTime,
        passengers: incomingTripInfo?.passengers || driver.seatingCapacity || '4 People',
        vehicleModel: driver.vehicleModel || 'Vehicle',
      },
      pickupCoords: resolvedPickupCoords,
      dropCoords: dropCoords || undefined,
      agreedFare,
      selectedCity: route.params?.selectedCity,
    });
  };

  const handleNotConfirmed = () => {
    navigation.navigate('NearbyDrivers', {
      selectedCity: route.params?.selectedCity,
    });
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
          title="Finalize Ride"
          className="border-b"
          style={{ borderBottomColor: colors.border }}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: colors.text }} className="text-base font-bold text-center">
            No driver selected
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('NearbyDrivers', { selectedCity: route.params?.selectedCity })}
            style={{ backgroundColor: colors.primary }}
            className="mt-4 px-6 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Find Nearby Drivers</Text>
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
        title={driver.name}
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Title & Subtitle */}
          <View className="items-center mb-6">
            <Text style={{ color: colors.text }} className="text-2xl font-black tracking-tight text-center">
              Did you finalize this ride?
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-medium mt-1.5 text-center">
              Only confirmed rides become bookings.
            </Text>
          </View>

          {/* Driver Card */}
          <DriverSummaryCard driver={driver} className="mb-5" />

          {/* Trip Route */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="border rounded-xl p-4 mb-5"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-3">
              Trip details
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setLocationType('pickup')}
              className="flex-row items-center"
            >
              <LocationMarkerIcon size={18} color="#2563EB" />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider">
                    Pickup location
                  </Text>
                  <Text className="text-[10px] font-bold text-red-500 ml-1">*</Text>
                </View>
                <Text
                  style={{
                    color: pickupLocation ? colors.text : colors.placeholder,
                  }}
                  className={`text-sm mt-0.5 ${pickupLocation ? 'font-bold' : 'font-semibold'}`}
                  numberOfLines={2}
                >
                  {pickupLocation || 'Select pickup location'}
                </Text>
                <Text className="text-[10px] font-semibold text-blue-600 mt-1">
                  Search and select from map
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ backgroundColor: colors.border }} className="w-px h-4 ml-[8px] my-1" />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setLocationType('drop')}
              className="flex-row items-center"
            >
              <FlagIcon size={18} color="#DC2626" />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: colors.placeholder }} className="text-[10px] font-bold uppercase tracking-wider">
                    Drop location
                  </Text>
                  <Text className="text-[10px] font-bold text-red-500 ml-1">*</Text>
                </View>
                <Text
                  style={{
                    color: dropLocation ? colors.text : colors.placeholder,
                  }}
                  className={`text-sm mt-0.5 ${dropLocation ? 'font-bold' : 'font-semibold'}`}
                >
                  {dropLocation || 'Select drop location'}
                </Text>
                <Text className="text-[10px] font-semibold text-blue-600 mt-1">
                  Search and select from map
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Agreed Fare */}
          <View className="mb-2">
            <Input
              label="Agreed fare"
              value={fareText}
              onChangeText={(text) => setFareText(text.replace(/[^0-9]/g, ''))}
              placeholder="Enter fare amount"
              keyboardType="numeric"
              maxLength={6}
              leftIcon={<Text style={{ color: colors.textSecondary }} className="text-base font-bold">₹</Text>}
              helperText="Enter the amount agreed with the driver."
            />
          </View>

          {/* Private Call Notice */}
          <InfoNoteBox
            title="This was a private call."
            subtitle="A call does not create a booking."
            className="mb-6"
          />
        </View>

        {/* Action CTAs */}
        <View className="space-y-3.5 mt-4">
          {/* Primary Confirm Ride Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirmRide}
            disabled={!isFormValid}
            style={{
              backgroundColor: isFormValid ? colors.primary : colors.disabled,
            }}
            className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md mb-3"
          >
            <View className="mr-2">
              <CheckCircleIcon size={19} color="#FFFFFF" />
            </View>
            <Text className="text-white text-base font-extrabold tracking-wide">
              Confirm & Continue
            </Text>
          </TouchableOpacity>

          {/* Secondary Not Confirmed Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleNotConfirmed}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="w-full py-3.5 px-6 rounded-xl border flex-row items-center justify-center"
          >
            <View className="mr-2">
              <CrossCircleIcon size={18} color={colors.textSecondary} />
            </View>
            <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide">
              Not Confirmed
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={locationType !== null}
        animationType="slide"
        transparent
        onRequestClose={closeLocationPicker}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <View style={{ backgroundColor: colors.card }} className="rounded-t-3xl p-5 max-h-[85%]">
            <View
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between pb-3 border-b"
            >
              <View>
                <Text style={{ color: colors.text }} className="text-lg font-bold">
                  Select {locationType === 'pickup' ? 'pickup' : 'drop'} location
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                  Search a place and select it from the map results
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeLocationPicker}
                style={{ backgroundColor: colors.surface }}
                className="p-2 rounded-full"
              >
                <Text style={{ color: colors.textSecondary }} className="font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                borderColor: colors.border,
                backgroundColor: colors.input,
              }}
              className="my-3 flex-row items-center border rounded-xl px-3.5 h-12"
            >
              <SearchIcon size={18} color={colors.placeholder} />
              <TextInput
                value={locationQuery}
                onChangeText={setLocationQuery}
                placeholder="Search city, station, airport, area..."
                placeholderTextColor={colors.placeholder}
                autoCorrect={false}
                style={{ color: colors.text }}
                className="flex-1 ml-2.5 text-sm font-semibold h-full p-0"
              />
              {isSearchingPlaces ? (
                <ActivityIndicator size="small" color={colors.primary} className="mr-1" />
              ) : locationQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setLocationQuery('');
                    setPlacePredictions([]);
                  }}
                  className="p-1"
                >
                  <Text style={{ color: colors.placeholder }} className="text-xs font-bold">✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {locationType === 'pickup' && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                style={{
                  backgroundColor: `${colors.primary}15`,
                  borderColor: `${colors.primary}30`,
                }}
                className="flex-row items-center p-3 mb-2 rounded-xl border"
              >
                <View style={{ backgroundColor: colors.primary }} className="w-8 h-8 rounded-full items-center justify-center mr-2.5">
                  {isDetectingLocation ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <LocationMarkerIcon size={16} color="#FFFFFF" />
                  )}
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.primary }} className="text-xs font-bold">
                    {isDetectingLocation ? 'Detecting GPS Location via Google Maps...' : 'Use Current GPS Location'}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px]">
                    Detect your pickup point automatically
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {locationQuery.trim().length >= 2 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {isSearchingPlaces && placePredictions.length === 0 ? (
                  <View className="py-8 items-center justify-center">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-2">
                      Searching Google Maps...
                    </Text>
                  </View>
                ) : placePredictions.length === 0 ? (
                  <View className="py-6 items-center justify-center px-4">
                    <Text style={{ color: colors.textSecondary }} className="text-xs text-center mb-3">
                      No Google Maps results found for "{locationQuery.trim()}".
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        geocodeAddress(locationQuery.trim());
                        selectLocation(locationQuery.trim());
                      }}
                      style={{ backgroundColor: colors.primary }}
                      className="px-5 py-2.5 rounded-xl"
                    >
                      <Text className="text-white text-xs font-bold">Use "{locationQuery.trim()}" directly</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1">
                      Google Maps Suggestions
                    </Text>
                    {placePredictions.map(pred => {
                      const isSelected = pred.description === (locationType === 'pickup' ? pickupLocation : dropLocation);
                      return (
                        <TouchableOpacity
                          key={pred.placeId}
                          activeOpacity={0.7}
                          onPress={() => selectPrediction(pred)}
                          style={{
                            borderBottomColor: colors.border,
                            backgroundColor: isSelected ? `${colors.primary}18` : 'transparent',
                          }}
                          className={`flex-row items-center py-3.5 px-2 border-b ${isSelected ? 'rounded-lg' : ''}`}
                        >
                          <LocationMarkerIcon size={18} color={isSelected ? colors.primary : colors.placeholder} />
                          <View className="flex-1 ml-3 pr-2">
                            <Text
                              style={{ color: isSelected ? colors.primary : colors.text }}
                              className={`text-sm ${isSelected ? 'font-bold' : 'font-semibold'}`}
                              numberOfLines={1}
                            >
                              {pred.mainText}
                            </Text>
                            {pred.secondaryText ? (
                              <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5" numberOfLines={1}>
                                {pred.secondaryText}
                              </Text>
                            ) : null}
                          </View>
                          {isSelected && <CheckCircleIcon size={16} color={colors.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </>
                )}
              </ScrollView>
            ) : (
              <View className="py-8 items-center justify-center px-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs text-center leading-relaxed">
                  Type 2 or more characters in the search bar above to search any city, landmark, or address in India live on Google Maps.
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};
