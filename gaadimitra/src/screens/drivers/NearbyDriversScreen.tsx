import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  NearbyDriversScreenNavigationProp,
  NearbyDriversScreenRouteProp,
  DriverInfo,
} from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import {
  ChevronDownIcon,
  StarIcon,
  PhoneIcon,
  DriverAvatarPortrait,
  LocationMarkerIcon,
  CheckCircleIcon,
  XCircleIcon,
  CarBadgeIcon,
} from '../../assets/icons/Icons';
import {
  getCityCoordinates,
  geocodeAddress,
  GOOGLE_MAPS_API_KEY,
  Coordinates,
} from '../../utils/mapConfig';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector, fetchNearbyDrivers } from '../../store';
import { storageService } from '../../services/storage';
import { toast } from '../../components/common/ToastNotification';
import { confirmDialog } from '../../components/common/CustomAlertModal';

export const NearbyDriversScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NearbyDriversScreenNavigationProp>();
  const route = useRoute<NearbyDriversScreenRouteProp>();
  const dispatch = useAppDispatch();

  const categoryTitle = route.params?.categoryTitle || 'Drivers';
  const selectedCity =
    route.params?.selectedCity ||
    storageService.getString('user_selected_city') ||
    'Current Location';
  const serviceId = route.params?.serviceId;
  const vehicleId = route.params?.vehicleId;

  // Redux: nearby drivers state from POST /drivers/nearby
  const { nearbyDrivers, isLoading, error } = useAppSelector((state) => state.drivers);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [showRadiusModal, setShowRadiusModal] = useState<boolean>(false);
  const [selectedDriverIndex, setSelectedDriverIndex] = useState<number>(0);


  const radiusOptions = [
    { label: 'Within 2 km', value: 2 },
    { label: 'Within 5 km', value: 5 },
    { label: 'Within 10 km', value: 10 },
    { label: 'Within 25 km', value: 25 },
    { label: 'Within 50 km', value: 50 },
  ];

  // Base coordinates for selected location (dynamically resolved via Google Geocoding API)
  const [centerCoords, setCenterCoords] = useState<Coordinates>(() =>
    getCityCoordinates(selectedCity)
  );

  useEffect(() => {
    let isMounted = true;
    if (selectedCity && selectedCity !== 'Detecting location...') {
      geocodeAddress(selectedCity).then((coords) => {
        if (isMounted && coords) {
          setCenterCoords(coords);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Haversine formula to compute distance in km
  const computeDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Dispatch fetchNearbyDrivers API call with (serviceId, vehicleId, pickuplocation, distance)
  const loadNearbyDrivers = useCallback(() => {
    dispatch(
      fetchNearbyDrivers({
        serviceId: serviceId || undefined,
        vehicleId: vehicleId || undefined,
        pickuplocation: {
          latitude: centerCoords.latitude,
          longitude: centerCoords.longitude,
          address: selectedCity,
        },
        distance: selectedRadius,
      })
    );
  }, [dispatch, serviceId, vehicleId, centerCoords, selectedCity, selectedRadius]);

  useEffect(() => {
    loadNearbyDrivers();
  }, [loadNearbyDrivers]);

  // Map live API driver items into display format (no fake fallback data)
  const driversList: (DriverInfo & { lat: number; lng: number })[] = useMemo(() => {
    if (!nearbyDrivers || nearbyDrivers.length === 0) {
      return [];
    }

    return nearbyDrivers.map((driver, idx) => {
      // Geo coordinates [longitude, latitude] in GeoJSON Point format
      const lat = driver.currentLocation?.coordinates?.[1] ?? centerCoords.latitude;
      const lng = driver.currentLocation?.coordinates?.[0] ?? centerCoords.longitude;

      const dist = computeDistanceKm(centerCoords.latitude, centerCoords.longitude, lat, lng);
      const distanceStr = dist < 0.1 ? 'Nearby (50m)' : `${dist.toFixed(1)} km away`;


      const avatarBgList = ['#EFF6FF', '#F1F5F9', '#ECFDF5', '#FEF3C7'];

      return {
        id: driver._id || driver.id || `drv_${idx}`,
        name: driver.userId?.name || `Driver Partner #${idx + 1}`,
        phone: driver.userId?.phone || '',
        avatarSeed: String(idx + 1),
        profileImage: driver.userId?.profileImage,
        avatarBg: avatarBgList[idx % avatarBgList.length],
        rating: (driver.rating || 4.8).toFixed(1),
        totalRides: driver.totalTripsCount || 0,
        experienceYears: driver.experienceYears ?? driver.userId?.experienceYears ?? 3,
        distance: distanceStr,
        isVerified: driver.isVerified ?? true,
        vehicleModel: driver.vehicleModel,
        vehiclePlate: driver.vehicleNo || 'BR01--XXXX',
        hasAc: driver.type,
        seatingCapacity: driver.seating ? `${driver.seating} Seats` : "",
        driverVehicleImg: driver.vehicleImages,
        lat,
        lng,
      };
    });
  }, [nearbyDrivers, centerCoords, categoryTitle]);

  // Keep selectedDriverIndex in bounds
  useEffect(() => {
    if (selectedDriverIndex >= driversList.length) {
      setSelectedDriverIndex(0);
    }
  }, [driversList.length, selectedDriverIndex]);



  const handleCallDriver = (driver: DriverInfo) => {
    if (!driver.phone) {
      toast.showError('This driver does not have a public phone number.', 'No Phone Number');
      return;
    }

    confirmDialog.show({
      title: `Call ${driver.name}`,
      message: `Do you want to place a direct phone call to ${driver.name} (${driver.phone})?`,
      confirmText: 'Call Now',
      cancelText: 'Cancel',
      icon: 'phone',
      onConfirm: () => {
        Linking.openURL(`tel:${driver.phone}`).catch(() => {
          toast.showInfo(`Direct number: ${driver.phone}`, 'Phone Dialer');
        });
      },
    });
  };

  const handleOpenProfile = (driver: DriverInfo) => {
    navigation.navigate('DriverProfile', {
      driver,
      driverId: driver.id,
      selectedCity,
    });
  };


  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header Bar */}
      <HeaderBar
        onBackPress={() => navigation.goBack()}
        title={categoryTitle}
        className="border-b"
        style={{ borderBottomColor: colors.border }}
        rightSlotClassName="w-auto"
        rightElement={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowRadiusModal(true)}
            className="flex-row items-center p-2 rounded-full"
          >
            <Text style={{ color: colors.text }} className="text-xs font-bold ml-1.5 mr-1">
              {selectedRadius} km
            </Text>
            <ChevronDownIcon size={14} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Location & View Mode Switcher */}
      <View
        style={{ backgroundColor: colors.card, borderBottomColor: colors.border }}
        className="flex-row items-center justify-between px-4 py-2.5 border-b"
      >
        <View className="flex-row items-center flex-1 pr-2">
          <LocationMarkerIcon size={14} color={colors.primary} />
          <Text
            numberOfLines={1}
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold ml-1.5"
          >
            {selectedCity}
          </Text>
        </View>

        {/* List / Map Toggle Tabs */}
        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="flex-row p-0.5 rounded-lg border"
        >
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={{
              backgroundColor: viewMode === 'list' ? colors.primary : 'transparent',
            }}
            className="px-3 py-1 rounded-md"
          >
            <Text
              style={{
                color: viewMode === 'list' ? '#FFFFFF' : colors.textSecondary,
              }}
              className="text-xs font-bold"
            >
              List
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Main Content Area */}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading && driversList.length > 0}
            onRefresh={loadNearbyDrivers}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Single Clean Loading State */}
        {isLoading && driversList.length === 0 ? (
          <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mt-3">
              Finding nearby drivers...
            </Text>
            <Text style={{ color: colors.placeholder }} className="text-xs mt-1">
              Searching within {selectedRadius} km
            </Text>
          </View>
        ) : error && driversList.length === 0 ? (
          /* Error State */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Text style={{ color: colors.text }} className="text-base font-bold text-center">
              Unable to find drivers
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1.5 mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadNearbyDrivers}
              style={{ backgroundColor: colors.primary }}
              className="px-5 py-2.5 rounded-xl"
            >
              <Text className="text-white text-xs font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : driversList.length === 0 ? (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View
              style={{ backgroundColor: `${colors.primary}15` }}
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
            >
              <LocationMarkerIcon size={30} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text }} className="text-base font-bold text-center">
              No Drivers Found Nearby
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1.5 mb-5 max-w-[280px]">
              No online drivers found within {selectedRadius} km for {categoryTitle}. Try expanding your search radius.
            </Text>
            <View className="flex-row items-center">
              {selectedRadius < 25 && (
                <TouchableOpacity
                  onPress={() => setSelectedRadius(25)}
                  style={{ backgroundColor: colors.primary }}
                  className="px-4 py-2.5 rounded-xl mr-2"
                >
                  <Text className="text-white text-xs font-bold">Search 25 km</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={loadNearbyDrivers}
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
                className="px-4 py-2.5 rounded-xl border"
              >
                <Text style={{ color: colors.text }} className="text-xs font-bold">Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Live Drivers List */
          driversList.map(driver => (
            <TouchableOpacity
              key={driver.id}
              activeOpacity={0.85}
              onPress={() => handleOpenProfile(driver)}
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-xl p-4 mb-3 border shadow-sm"
            >
              {/* Top Row: Avatar, Name, Rating, Specs */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <DriverAvatarPortrait
                    size={48}
                    imageUrl={driver.profileImage}
                    seed={driver.avatarSeed}
                    bg={driver.avatarBg}
                    showVerified={false}
                  />

                  <View className="ml-3 flex-1">
                    <Text
                      style={{ color: colors.text }}
                      className="text-base font-extrabold"
                    >
                      {driver.name}
                    </Text>
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="text-xs font-bold mt-0.5"
                    >
                      {driver.vehicleModel}
                    </Text>
                    <Text
                      style={{ color: colors.placeholder }}
                      className="text-[11px] font-semibold mt-0.5"
                    >
                      {driver.hasAc} {" "}
                      {driver.seatingCapacity}
                    </Text>
                  </View>
                </View>

                {/* Rating Badge */}
                <View className="flex-row items-center px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
                  <StarIcon size={14} color="#F59E0B" />
                  <Text className="text-xs font-bold text-amber-700 ml-1">
                    {driver.rating}
                  </Text>
                </View>
              </View>

              {/* Divider Line */}
              <View style={{ backgroundColor: colors.border }} className="h-[1px] mb-3" />

              {/* Bottom Row: Distance, Verified, and Call CTA */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="flex-row items-center mr-2.5">
                    <LocationMarkerIcon size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold ml-1">
                      {driver.distance}
                    </Text>
                  </View>

                  <View className={`flex-row items-center px-2 py-0.5 rounded-full ${driver.isVerified ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                    {driver.isVerified ? <CheckCircleIcon size={12} color="#10B981" /> : <XCircleIcon size={12} color="#ef4444" />}
                    <Text className={`text-[10px] font-bold ml-1 ${driver.isVerified ? "text-emerald-700" : "text-red-700"}`}>
                      {driver.isVerified ? "Verified" : "Not Verified"}
                    </Text>
                  </View>
                </View>

                {/* Call Driver Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleCallDriver(driver)}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.primary,
                  }}
                  className="flex-row items-center px-3.5 py-1.5 rounded-xl border"
                >
                  <PhoneIcon size={13} color={colors.primary} />
                  <Text style={{ color: colors.primary }} className="text-xs font-extrabold ml-1.5">
                    Call Driver
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>


      {/* Radius Filter Modal */}
      <Modal
        visible={showRadiusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <View className="flex-1 justify-end bg-black/45">
          <View style={{ backgroundColor: colors.card }} className="rounded-t-3xl p-6">
            <View
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between pb-3 border-b"
            >
              <Text
                style={{ color: colors.text }}
                className="text-base font-extrabold"
              >
                Filter Search Distance
              </Text>
              <TouchableOpacity
                onPress={() => setShowRadiusModal(false)}
                className="p-1"
              >
                <Text style={{ color: colors.textSecondary }} className="text-base font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-3">
              {radiusOptions.map(opt => {
                const isSelected = selectedRadius === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedRadius(opt.value);
                      setShowRadiusModal(false);
                    }}
                    style={{
                      backgroundColor: isSelected ? `${colors.primary}18` : 'transparent',
                      borderColor: isSelected ? colors.primary : 'transparent',
                    }}
                    className="flex-row items-center justify-between py-3.5 px-3 rounded-xl mb-1.5 border"
                  >
                    <Text
                      style={{
                        color: isSelected ? colors.primary : colors.text,
                      }}
                      className={`text-sm ${isSelected ? 'font-bold' : 'font-semibold'
                        }`}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <CheckCircleIcon size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
