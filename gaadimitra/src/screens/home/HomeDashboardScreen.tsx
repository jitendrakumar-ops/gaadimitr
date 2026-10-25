import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  HomeDashboardNavigationProp,
  HomeDashboardRouteProp,
} from '../../types/navigation';
import {
  BellNotificationIcon,
  LocationMarkerIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SedanCarGraphic,
  SuvGraphic,
  Mpv7SeaterGraphic,
  TravellerGraphic,
  CheckCircleIcon,
  SearchIcon,
  CarBadgeIcon,
} from '../../assets/icons/Icons';
import { VehicleCard, VehicleCategory } from '../../components/home/VehicleCard';
import {
  detectCurrentLocationWithGps,
  searchPlacesWithGoogle,
  getPlaceCoordinates,
  geocodeAddress,
  PlacePrediction,
} from '../../utils/mapConfig';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector, fetchServices, fetchActiveBooking } from '../../store';
import { storageService } from '../../services/storage';
import { toast } from '../../components/common/ToastNotification';

export const HomeDashboardScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<HomeDashboardNavigationProp>();
  const route = useRoute<HomeDashboardRouteProp>();
  const dispatch = useAppDispatch();

  // Redux: live services state from GET /services
  const { services, isLoading, error } = useAppSelector((state) => state.services);
  // Redux: live active booking state from GET /bookings/active
  const { activeBooking } = useAppSelector((state) => state.bookings);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchActiveBooking());
    }, [dispatch])
  );

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchActiveBooking());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(fetchServices());
    dispatch(fetchActiveBooking());
  }, [dispatch]);

  // Direct active ride data from GET /bookings/active API
  const activeRide = Array.isArray(activeBooking?.data)
    ? (activeBooking.data.length > 0 ? activeBooking.data[0] : null)
    : (Array.isArray(activeBooking)
      ? (activeBooking.length > 0 ? activeBooking[0] : null)
      : (activeBooking?.data || activeBooking));

  const hasActiveRide = Boolean(
    activeRide &&
    (activeRide._id || activeRide.id || activeRide.bookingId) &&
    activeRide.status !== 'completed' &&
    activeRide.status !== 'cancelled'
  );



  const handleOpenActiveRide = () => {
    if (!activeRide) return;
    const isPending = activeRide.status === 'pending' || activeRide.status === 'requested' || activeRide.status === 'accepted';
    navigation.navigate(isPending ? 'DriverAccepted' : 'RideConfirmed', {
      bookingId: activeRide._id || activeRide.id || activeRide.bookingId,
      driver: activeRide.driverId || activeRide.driver,
      name: activeBooking.userId.name,
      phone: activeBooking.userId.phone,
      userId: activeBooking.userId._id,
      pin: activeBooking?.userId?.pin || activeRide?.userId?.pin || '',
      agreedFare: activeRide.fare || 0,
      bookingToken: activeRide.tokenMoney || 0,
      tripInfo: {
        pickupLocation: activeRide.pickupLocation?.address || activeRide.pickupLocation?.title || (typeof activeRide.pickupLocation === 'string' ? activeRide.pickupLocation : ''),
        destination: activeRide.dropLocation?.address || activeRide.dropLocation?.title || (typeof activeRide.dropLocation === 'string' ? activeRide.dropLocation : ''),
      },
      status: activeRide.status,
    } as any);
  };

  const [selectedCity, setSelectedCity] = useState(
    route.params?.selectedCity || storageService.getString('user_selected_city') || 'Detecting location...'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>([]);

  // Live Google Places autocomplete search with debounce
  useEffect(() => {
    if (!citySearchQuery.trim() || citySearchQuery.trim().length < 2) {
      setPlacePredictions([]);
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlacesWithGoogle(citySearchQuery.trim());
        setPlacePredictions(results);
      } catch (err) {
        console.warn('Live Google Places search error:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [citySearchQuery]);

  // Auto-detect live location on initial mount if not provided from route or saved storage
  useEffect(() => {
    if (route.params?.selectedCity) {
      setSelectedCity(route.params.selectedCity);
      storageService.setString('user_selected_city', route.params.selectedCity);
      return;
    }

    const stored = storageService.getString('user_selected_city');
    if (stored && stored !== 'Detecting location...' && stored !== 'Sector 19, Noida') {
      setSelectedCity(stored);
    }

    // Call live device GPS via detectCurrentLocationWithGps()
    setIsDetectingLocation(true);
    detectCurrentLocationWithGps()
      .then((geo) => {
        if (geo?.shortLocation) {
          setSelectedCity(geo.shortLocation);
          storageService.setString('user_selected_city', geo.shortLocation);
        }
      })
      .catch((err) => {
        console.warn('Auto location detect error:', err);
      })
      .finally(() => {
        setIsDetectingLocation(false);
      });
  }, [route.params?.selectedCity]);

  const handleDetectGpsLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const geo = await detectCurrentLocationWithGps();
      if (geo?.shortLocation) {
        setSelectedCity(geo.shortLocation);
        storageService.setString('user_selected_city', geo.shortLocation);
        setShowCityModal(false);
        setCitySearchQuery('');
        setPlacePredictions([]);
      } else {
        toast.showInfo('Location detected. Please select or confirm your city.', 'GPS Notice');
      }
    } catch (err) {
      toast.showError('Could not detect location. Please select manually.', 'GPS Error');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Time-based greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning ☀️';
    if (hours < 17) return 'Good afternoon 👋';
    return 'Good evening 🌙';
  };

  // Dynamic services from Redux /services/ API (no fallback to default/mock data)
  const displayCategories: VehicleCategory[] = useMemo(() => {
    if (!services || services.length === 0) {
      return [];
    }
    const fallbackGraphics = [
      <SedanCarGraphic width={100} height={55} />,
      <SuvGraphic width={100} height={55} />,
      <Mpv7SeaterGraphic width={100} height={55} />,
      <TravellerGraphic width={100} height={55} />,
    ];
    return services.map((srv, idx) => ({
      id: srv.id,
      title: srv.title,
      capacity: srv.description || 'Direct Call',
      description: srv.description,
      image: srv.image,
      graphic: fallbackGraphics[idx % fallbackGraphics.length],
    }));
  }, [services]);

  // Automatically keep selectedCategory in sync with loaded services
  useEffect(() => {
    if (displayCategories.length > 0) {
      if (!selectedCategory || !displayCategories.some(cat => cat.id === selectedCategory)) {
        setSelectedCategory(displayCategories[0].id);
      }
    }
  }, [displayCategories, selectedCategory]);









  const handleNotificationPress = () => {
    toast.showInfo(
      `You have 2 new driver inquiries near ${selectedCity}.`,
      'Notifications'
    );
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    const cityName = prediction.description;
    setSelectedCity(cityName);
    storageService.setString('user_selected_city', cityName);
    setShowCityModal(false);
    setCitySearchQuery('');
    setPlacePredictions([]);

    // Fetch and cache coordinates in background via Google Places / Geocode API
    getPlaceCoordinates(prediction.placeId, cityName);
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    storageService.setString('user_selected_city', city);
    setShowCityModal(false);
    setCitySearchQuery('');
    setPlacePredictions([]);

    geocodeAddress(city);
  };

  const handleCustomCitySubmit = () => {
    if (citySearchQuery.trim().length > 0) {
      handleSelectCity(citySearchQuery.trim());
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Main Container */}
      <View className="flex-1 justify-between">
        {/* 1. Header Bar */}
        <View
          style={{
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          }}
          className="px-5 pt-3 pb-4 border-b"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              {/* Greeting */}
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
                {getGreeting()}
              </Text>

              {/* Location Selector Chip */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowCityModal(true)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                className="flex-row items-center mt-1 self-start max-w-full"
              >
                <LocationMarkerIcon size={16} color={colors.primary} />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ color: colors.primary, flexShrink: 1 }}
                  className="text-base font-extrabold ml-1.5 mr-1"
                >
                  {isDetectingLocation && (!selectedCity || selectedCity === 'Detecting location...')
                    ? 'Detecting GPS...'
                    : selectedCity}
                </Text>
                <ChevronDownIcon size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleNotificationPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="w-10 h-10 rounded-full border items-center justify-center"
            >
              <BellNotificationIcon size={20} color={colors.text} hasUnread={true} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Main Content Area */}
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isLoading && displayCategories.length > 0}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View>
            {/* Section Title */}
            <View className="mb-3.5">
              <Text
                style={{ color: colors.text }}
                className="text-lg font-extrabold tracking-tight"
              >
                What do you need today?
              </Text>
            </View>

            {/* Dynamic Services / Vehicle Categories Grid */}
            {isLoading && displayCategories.length === 0 ? (
              <View className="py-14 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-3">
                  Loading services...
                </Text>
              </View>
            ) : error && displayCategories.length === 0 ? (
              <View
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="p-6 rounded-xl border items-center justify-center mb-6"
              >
                <Text style={{ color: colors.text }} className="text-base font-bold text-center">
                  Unable to load services
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1 mb-4">
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={() => dispatch(fetchServices())}
                  style={{ backgroundColor: colors.primary }}
                  className="px-5 py-2.5 rounded-xl"
                >
                  <Text className="text-white text-xs font-bold">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : displayCategories.length === 0 ? (
              <View
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="p-6 rounded-xl border items-center justify-center mb-6"
              >
                <Text style={{ color: colors.text }} className="text-base font-bold text-center">
                  No Services Available
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1 mb-4">
                  No vehicle services found. Pull down to refresh.
                </Text>
                <TouchableOpacity
                  onPress={() => dispatch(fetchServices())}
                  style={{ backgroundColor: colors.primary }}
                  className="px-5 py-2.5 rounded-xl"
                >
                  <Text className="text-white text-xs font-bold">Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row flex-wrap -mx-1.5 mb-6">
                {displayCategories.map(cat => (
                  <View key={cat.id} className="w-1/2 p-1.5">
                    <VehicleCard
                      category={cat}
                      isSelected={selectedCategory === cat.id}
                      onSelect={id => {
                        setSelectedCategory(id);
                        navigation.navigate('ChooseVehicle', {
                          selectedCity,
                          serviceId: id,
                          serviceTitle: cat.title,
                        });
                      }}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Primary Action Button: Find Nearby Vehicles */}
            {displayCategories.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  const chosenCat = displayCategories.find(c => c.id === selectedCategory) || displayCategories[0];
                  if (!chosenCat) return;
                  navigation.navigate('ChooseVehicle', {
                    selectedCity,
                    serviceId: chosenCat?.id,
                    serviceTitle: chosenCat?.title,
                  });
                }}
                className="w-full bg-blue-600 py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-500 mb-6"
              >
                <Text className="text-white text-base font-bold tracking-wide mr-2">
                  Find Nearby Vehicles
                </Text>
                <ChevronRightIcon size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}


            {/* Verified Drivers Info Banner */}
            <View
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="p-4 rounded-xl border shadow-sm mb-4"
            >
              <View className="flex-row items-center mb-1.5">
                <CheckCircleIcon size={16} color="#10B981" />
                <Text
                  style={{ color: colors.text }}
                  className="text-xs font-bold ml-2 uppercase tracking-wider"
                >
                  Direct Marketplace Guarantee
                </Text>
              </View>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs leading-relaxed"
              >
                Call & negotiate directly with vehicle owners. No surge pricing, hidden platform fees, or middlemen commission cuts.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Current & Active Ride Banner at Bottom (from GET /bookings/active API) */}
        {hasActiveRide && activeRide ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            }}
            className="border-t px-4 py-2.5 shadow-2xl"
          >
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleOpenActiveRide}
              style={{
                backgroundColor: colors.surface,
                borderColor: activeRide.status === 'pending' ? '#F59E0B' : '#10B981',
              }}
              className="rounded-xl border p-3 shadow-sm"
            >
              {/* Header: Status Pill & Fare */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-1.5 ${activeRide.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                  />
                  <Text
                    className={`text-[10px] font-black uppercase tracking-wider ${activeRide.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                  >
                    {activeRide.status === 'pending' ? 'Waiting for Driver...' : 'Ride Confirmed'}
                  </Text>
                </View>

                <View className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                  <Text className="text-xs font-black text-blue-700">
                    ₹{activeRide.fare || 0}
                  </Text>
                </View>
              </View>

              {/* Driver & Vehicle Details */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 items-center justify-center mr-2.5 overflow-hidden">
                    {activeRide.driverId?.userId?.profileImage || activeRide.driverId?.profileImage ? (
                      <Image
                        source={{ uri: activeRide.driverId?.userId?.profileImage || activeRide.driverId?.profileImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <CarBadgeIcon size={20} color={colors.primary} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-black mr-1.5" numberOfLines={1}>
                      {activeRide.driverId?.userId?.name || activeRide.driverId?.name || (typeof activeRide.driverName === 'string' ? activeRide.driverName : 'Driver Partner')}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium mt-0.5" numberOfLines={1}>
                      {activeRide.driverId?.vehicleModel || activeRide.driverId?.vehicleNo || 'Vehicle'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center px-3 py-1.5 rounded-xl bg-blue-600 shadow-sm">
                  <Text className="text-white text-xs font-bold mr-1">
                    {activeRide.status === 'pending' ? 'View' : 'Track'}
                  </Text>
                  <ChevronRightIcon size={12} color="#FFFFFF" />
                </View>
              </View>

              {/* Pickup & Destination Route */}
              <View
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                className="flex-row items-center mt-2 px-2.5 py-1.5 rounded-lg border"
              >
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                <Text style={{ color: colors.text }} className="text-[10px] font-medium flex-1" numberOfLines={1}>
                  {activeRide.pickupLocation?.address || activeRide.pickupLocation?.title || (typeof activeRide.pickupLocation === 'string' ? activeRide.pickupLocation : 'Pickup')}
                </Text>
                <Text style={{ color: colors.placeholder }} className="mx-1 text-[9px]">➔</Text>
                <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                <Text style={{ color: colors.text }} className="text-[10px] font-medium flex-1" numberOfLines={1}>
                  {activeRide.dropLocation?.address || activeRide.dropLocation?.title || (typeof activeRide.dropLocation === 'string' ? activeRide.dropLocation : 'Drop')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Searchable Location Selector Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <View
            style={{ backgroundColor: colors.card }}
            className="rounded-t-3xl p-6 max-h-[85%]"
          >
            {/* Modal Header */}
            <View
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between pb-3 border-b"
            >
              <View>
                <Text
                  style={{ color: colors.text }}
                  className="text-lg font-bold"
                >
                  Change Location
                </Text>
                <Text
                  style={{ color: colors.textSecondary }}
                  className="text-xs mt-0.5"
                >
                  Search city, landmark or type custom area
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowCityModal(false);
                  setCitySearchQuery('');
                }}
                style={{ backgroundColor: colors.surface }}
                className="p-1.5 rounded-full"
              >
                <Text style={{ color: colors.textSecondary }} className="font-bold text-sm">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Live Search Input Bar */}
            <View
              style={{
                borderColor: colors.border,
                backgroundColor: colors.input,
              }}
              className="my-3 flex-row items-center border rounded-xl px-3.5 h-12"
            >
              <SearchIcon size={18} color={colors.textSecondary} />
              <TextInput
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                placeholder="Search city, station, landmark, area..."
                placeholderTextColor={colors.placeholder}
                returnKeyType="search"
                onSubmitEditing={handleCustomCitySubmit}
                autoCorrect={false}
                style={{ color: colors.text }}
                className="flex-1 ml-2.5 text-sm font-semibold h-full p-0"
              />
              {isSearchingPlaces ? (
                <ActivityIndicator size="small" color={colors.primary} className="mr-1" />
              ) : citySearchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setCitySearchQuery('');
                    setPlacePredictions([]);
                  }}
                  className="p-1"
                >
                  <Text className="text-xs font-bold text-slate-400">✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* If searching via Google Places (query >= 2 chars) */}
            {citySearchQuery.trim().length >= 2 ? (
              <ScrollView
                className="mt-1"
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
                      No Google Maps results found for "{citySearchQuery.trim()}".
                    </Text>
                    <TouchableOpacity
                      onPress={handleCustomCitySubmit}
                      style={{ backgroundColor: colors.primary }}
                      className="px-5 py-2.5 rounded-xl"
                    >
                      <Text className="text-white text-xs font-bold">Use "{citySearchQuery.trim()}" directly</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1">
                      Google Maps Suggestions
                    </Text>
                    {placePredictions.map(pred => (
                      <TouchableOpacity
                        key={pred.placeId}
                        activeOpacity={0.7}
                        onPress={() => handleSelectPrediction(pred)}
                        style={{
                          borderBottomColor: colors.border,
                          backgroundColor: selectedCity === pred.description ? `${colors.primary}15` : 'transparent',
                        }}
                        className="flex-row items-center py-3 px-2 border-b rounded-lg"
                      >
                        <View
                          style={{ backgroundColor: `${colors.primary}15` }}
                          className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        >
                          <LocationMarkerIcon size={16} color={colors.primary} />
                        </View>
                        <View className="flex-1 pr-2">
                          <Text
                            style={{ color: colors.text }}
                            className="text-sm font-bold"
                            numberOfLines={1}
                          >
                            {pred.mainText}
                          </Text>
                          {pred.secondaryText ? (
                            <Text
                              style={{ color: colors.textSecondary }}
                              className="text-xs mt-0.5"
                              numberOfLines={1}
                            >
                              {pred.secondaryText}
                            </Text>
                          ) : null}
                        </View>
                        <ChevronRightIcon size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            ) : (
              /* Default View (query < 2 chars): GPS button + Live Map Search prompt */
              <ScrollView
                className="mt-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Quick Option: Use Current GPS Location */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDetectGpsLocation}
                  disabled={isDetectingLocation}
                  style={{
                    backgroundColor: `${colors.primary}15`,
                    borderColor: `${colors.primary}30`,
                  }}
                  className="flex-row items-center p-3 mb-3 rounded-xl border"
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
                      Detect live location via Google Geolocation & Geocoding
                    </Text>
                  </View>
                </TouchableOpacity>

                {selectedCity && selectedCity !== 'Detecting location...' ? (
                  <View className="mt-2 mb-4">
                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1">
                      Currently Selected Location
                    </Text>
                    <View
                      style={{
                        borderColor: colors.border,
                        backgroundColor: `${colors.primary}10`,
                      }}
                      className="flex-row items-center p-3 rounded-xl border"
                    >
                      <LocationMarkerIcon size={18} color={colors.primary} />
                      <Text style={{ color: colors.text }} className="text-sm font-bold ml-2.5 flex-1" numberOfLines={1}>
                        {selectedCity}
                      </Text>
                      <CheckCircleIcon size={16} color={colors.primary} />
                    </View>
                  </View>
                ) : null}

                <View className="py-6 items-center justify-center px-4">
                  <Text style={{ color: colors.textSecondary }} className="text-xs text-center leading-relaxed">
                    Type 2 or more characters in the search bar above to search any city, landmark, or address in India live on Google Maps.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};
