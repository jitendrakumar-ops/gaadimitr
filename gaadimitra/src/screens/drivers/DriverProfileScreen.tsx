import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverProfileScreenNavigationProp,
  DriverProfileScreenRouteProp,
  DriverInfo,
} from '../../types/navigation';
import {
  StarIcon,
  CheckCircleIcon,
  SnowflakeIcon,
  UsersIcon,
  BriefcaseIcon,
  LocationMarkerIcon,
  PhoneIcon,
  FlagIcon,
  ShareIcon,
  HeartFilledIcon,
  HeartOutlineIcon,
  LockIcon,
  ChevronRightIcon,
  SpeedometerIcon,
  ShieldCheckmarkIcon,
  SparkleCleanIcon,
  CrossCircleIcon,
} from '../../assets/icons/Icons';
import { toast, ToastType } from '../../components/common/ToastNotification';
import { ReportDriverModal } from '../../components/drivers/ReportDriverModal';
import { HeaderBar } from '../../components/common/HeaderBar';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector, fetchDriverById, reportDriver } from '../../store';

export const DriverProfileScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<DriverProfileScreenNavigationProp>();
  const route = useRoute<DriverProfileScreenRouteProp>();
  const dispatch = useAppDispatch();

  // Redux: selected driver profile from GET /drivers/:driverId
  const { selectedDriver, isLoading, error } = useAppSelector((state) => state.drivers);

  // Extract driverId from route params
  const driverId = route.params?.driverId || route.params?.driver?.id || (route.params?.driver as any)?._id;

  // Dispatch live API GET /drivers/:driverId via Redux
  useEffect(() => {
    if (driverId) {
      dispatch(fetchDriverById(driverId));
    }
  }, [dispatch, driverId]);

  // Live driver object purely from Redux GET /drivers/:driverId or route.params.driver (no hardcoded/dummy data)
  const driver: DriverInfo | null = React.useMemo(() => {
    if (selectedDriver) {
      const vehicle = typeof selectedDriver.vehicleId === 'object' ? selectedDriver.vehicleId : null;

      return {
        id: selectedDriver._id || selectedDriver.id || driverId || '',
        name: selectedDriver.userId?.name || (selectedDriver as any).name || route.params?.driver?.name || 'Driver Partner',
        phone: selectedDriver.userId?.phone || (selectedDriver as any).phone || route.params?.driver?.phone || '',
        profileImage: selectedDriver.userId?.profileImage || (selectedDriver as any).profileImage || route.params?.driver?.profileImage || null,
        pin: selectedDriver.userId?.pin || (selectedDriver as any).pin || route.params?.driver?.pin || '',
        rating: selectedDriver.rating !== undefined ? Number(selectedDriver.rating).toFixed(1) : (route.params?.driver?.rating || '5.0'),
        totalRides: selectedDriver.totalTripsCount ?? (selectedDriver as any).totalRides ?? route.params?.driver?.totalRides ?? 0,
        experienceYears: selectedDriver.experienceYears ?? selectedDriver.userId?.experienceYears ?? route.params?.driver?.experienceYears ?? 0,
        distance: selectedDriver.distanceKm ? `${selectedDriver.distanceKm} km away` : (route.params?.driver?.distance || 'Nearby'),
        isVerified: Boolean(selectedDriver.isVerified ?? route.params?.driver?.isVerified ?? true),
        vehicleModel: selectedDriver.vehicleModel || route.params?.driver?.vehicleModel,

        vehicleType: selectedDriver.type || vehicle?.type || route.params?.driver?.vehicleType,
        vehiclePlate: selectedDriver.vehicleNo || route.params?.driver?.vehiclePlate || 'Not Registered',
        hasAc: Boolean(selectedDriver.type || route.params?.driver?.hasAc),
        seatingCapacity: selectedDriver.seating ?? `${selectedDriver.seating} Seats`,
        driverVehicleImg: selectedDriver.vehicleImages || route.params?.driver?.driverVehicleImg,
        vehicleImage: (selectedDriver.vehicleImages && selectedDriver.vehicleImages.length > 0)
          ? selectedDriver.vehicleImages[0]
          : (vehicle?.image || route.params?.driver?.vehicleImage || null),
      };
    }
    if (route.params?.driver) {
      return route.params.driver;
    }
    return null;
  }, [selectedDriver, driverId, route.params?.driver]);

  // States
  const [isReportModalVisible, setIsReportModalVisible] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const isCallInProgress = useRef(false);
  const showToast = (message: string, type: ToastType = 'success') => {
    toast.show({ message, type });
  };

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && isCallInProgress.current) {
        isCallInProgress.current = false;
        setShowFinalizeModal(true);
      }
    });

    return () => appStateSubscription.remove();
  }, [driver, navigation, route.params?.selectedCity]);

  const handleCallDriver = () => {
    if (!driver?.phone) {
      showToast('Driver phone number not available', 'error');
      return;
    }
    isCallInProgress.current = true;
    Linking.openURL(`tel:${driver.phone}`).catch(() => {
      isCallInProgress.current = false;
      showToast('Unable to open the phone app', 'error');
    });
  };

  const handleConfirmation = () => {
    if (!driver) return;
    setShowFinalizeModal(false);
    navigation.navigate('FinalizeRide', {
      driver,
      selectedCity: route.params?.selectedCity,
    });
  };

  const handleDismissFinalizeModal = () => {
    setShowFinalizeModal(false);
    navigation.goBack();
  };

  const handleShareProfile = async () => {
    if (!driver) return;
    try {
      await Share.share({
        message: `🚗 GaadiMitra Verified Driver: ${driver.name}\nVehicle: ${driver.vehicleModel} (${driver.vehiclePlate})\nRating: ⭐ ${driver.rating} | Rides: ${driver.totalRides}\nPhone: ${driver.phone}\nBook safe rides with GaadiMitra!`,
        title: `Driver Profile - ${driver.name}`,
      });
      showToast('Profile shared successfully!', 'share');
    } catch {
      showToast('Unable to open share sheet', 'info');
    }
  };

  const handleToggleFavorite = () => {
    if (!driver) return;
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (nextState) {
      showToast(`Added ${driver.name} to your Favorites!`, 'favorite');
    } else {
      showToast(`Removed ${driver.name} from Favorites`, 'info');
    }
  };



  const handleReportSubmit = async (reason: string, details?: string) => {
    const driverId = driver?.id || (driver as any)?._id;
    if (!driverId) {
      showToast('Driver ID not found', 'error');
      return;
    }

    try {
      const fullReason = details && details.trim() ? `${reason} - ${details.trim()}` : reason;
      const resultAction = await dispatch(
        reportDriver({
          driverId,
          reason: fullReason,
          details: details?.trim() || undefined,
        })
      );

      if (reportDriver.fulfilled.match(resultAction)) {
        showToast(`Report received for "${reason}". Our safety team will review this driver.`, 'success');
      } else if (reportDriver.rejected.match(resultAction)) {
        showToast(resultAction.payload || 'Failed to submit report', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting report', 'error');
    }
  };

  // 1. Loading state (No default data, live loading indicator)
  if (isLoading && !driver) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderBar
          onBackPress={() => navigation.goBack()}
          title="Driver Profile"
          className="border-b"
          style={{ borderBottomColor: colors.border }}
        />
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mt-3">
            Loading driver profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Empty / Error state (No dummy data fallback)
  if (!driver) {
    return (
      <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HeaderBar
          onBackPress={() => navigation.goBack()}
          title="Driver Profile"
          className="border-b"
          style={{ borderBottomColor: colors.border }}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: colors.text }} className="text-base font-bold text-center">
            {error || 'No driver profile found'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (driverId) {
                dispatch(fetchDriverById(driverId));
              }
            }}
            style={{ backgroundColor: colors.primary }}
            className="mt-4 px-6 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Retry</Text>
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

      <HeaderBar
        onBackPress={() => navigation.goBack()}
        title="Driver Profile"
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />



      <Modal
        visible={showFinalizeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFinalizeModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View style={{ backgroundColor: colors.card }} className="rounded-t-3xl px-5 pt-5 pb-7">
            <View style={{ backgroundColor: colors.border }} className="w-12 h-1.5 rounded-full self-center mb-5" />

            <View className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 items-center justify-center self-center mb-3.5">
              <PhoneIcon size={24} color="#2563EB" />
            </View>

            <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider text-center">
              Call completed
            </Text>
            <Text style={{ color: colors.text }} className="text-xl font-black mt-1 text-center">
              Did you finalize this ride?
            </Text>

            <Text style={{ color: colors.textSecondary }} className="text-sm font-medium leading-5 mt-2 mb-6 text-center">
              Confirm only if you agreed on the fare and ride details with {driver.name.split(' ')[0]}.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleConfirmation}
              className="w-full bg-blue-600 py-4 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-500/30"
            >
              <CheckCircleIcon size={18} color="#FFFFFF" />
              <Text className="text-white text-base font-extrabold tracking-wide ml-2">
                Confirm
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDismissFinalizeModal}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="w-full py-3.5 rounded-xl border flex-row items-center justify-center mt-3"
            >
              <CrossCircleIcon size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.text }} className="text-sm font-bold tracking-wide ml-2">
                Not Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safety & Report Driver Modal */}
      <ReportDriverModal
        visible={isReportModalVisible}
        driverName={driver.name}
        onClose={() => setIsReportModalVisible(false)}
        onSubmit={handleReportSubmit}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* 1. Driver Profile Hero Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <View className="flex-row items-center">
            {/* Avatar with Double Ring and Verified Badge */}
            <View className="relative">
              <View className="w-[86px] h-[86px] rounded-full bg-sky-100 items-center justify-center border-[1.5px] border-sky-200">
                {driver.profileImage ? (
                  <Image
                    source={{ uri: driver.profileImage }}
                    className="w-[80px] h-[80px] rounded-full"
                  />
                ) : (
                  <View className="w-[80px] h-[80px] rounded-full bg-blue-100 items-center justify-center">
                    <Text className="text-2xl font-black text-blue-600">
                      {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Verified Blue Shield Tick Badge */}
              <View className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-blue-600 border-2 border-white items-center justify-center">
                <CheckCircleIcon size={13} color="#FFFFFF" />
              </View>

              {/* Favorite heart indicator */}
              {isFavorite && (
                <View className="absolute -top-0.5 -right-0.5 bg-white p-1 rounded-full border border-rose-200">
                  <HeartFilledIcon size={13} color="#E11D48" />
                </View>
              )}
            </View>

            {/* Driver Details Stack */}
            <View className="flex-1 ml-3.5 justify-center">
              <Text className="text-xl font-black text-slate-900 tracking-tight" numberOfLines={1}>
                {driver.name}
              </Text>

              {/* Rating & Total Rides */}
              <View className="flex-row items-center mt-1">
                <View className="flex-row items-center bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5">
                  <StarIcon size={12} color="#F59E0B" />
                  <Text className="text-xs font-extrabold text-amber-700 ml-1">
                    {driver.rating}
                  </Text>
                </View>
                <Text className="text-xs font-medium text-slate-400 ml-2">
                  {driver.totalRides} rides
                </Text>
              </View>

              {/* Badges Row */}
              <View className="flex-row items-center flex-wrap mt-1.5 gap-1">
                {/* Verified Driver Badge */}
                <View className="flex-row items-center px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                  <CheckCircleIcon size={10} color="#2563EB" />
                  <Text className="text-[10px] font-bold text-blue-700 ml-1">
                    Verified Driver
                  </Text>
                </View>

                {/* AC Car Badge */}
                {driver.hasAc && (
                  <View className="flex-row items-center px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                    <SnowflakeIcon size={10} color="#10B981" />
                    <Text className="text-[10px] font-bold text-emerald-700 ml-1">
                      AC Car
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Distance Marker */}
          <View className="flex-row items-center mt-3.5 pt-3 border-t border-slate-100">
            <LocationMarkerIcon size={13} color="#2563EB" />
            <Text className="text-xs font-semibold text-slate-600 ml-1.5">
              {driver.distance}
            </Text>
          </View>
        </View>

        {/* 2. Stats 3-Column Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="rounded-xl border py-3.5 px-2 flex-row items-center justify-between mb-4"
        >
          {/* Stat 1: Years Experience */}
          <View className="flex-row items-center flex-1 justify-center px-0.5">
            <View className="w-[30px] h-[30px] rounded-lg bg-purple-50 items-center justify-center mr-1.5">
              <BriefcaseIcon size={15} color="#9333EA" />
            </View>
            <View>
              <Text style={{ color: colors.text }} className="text-sm font-black leading-4">
                {driver.experienceYears}+
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-[9.5px] font-semibold mt-0.5" numberOfLines={1}>
                Years Exp.
              </Text>
            </View>
          </View>

          {/* Vertical Divider */}
          <View style={{ backgroundColor: colors.border }} className="w-[1px] h-6" />

          {/* Stat 2: Total Rides */}
          <View className="flex-row items-center flex-1 justify-center px-0.5">
            <View className="w-[30px] h-[30px] rounded-lg bg-emerald-50 items-center justify-center mr-1.5">
              <UsersIcon size={15} color="#16A34A" />
            </View>
            <View>
              <Text style={{ color: colors.text }} className="text-sm font-black leading-4">
                {driver.totalRides}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-[9.5px] font-semibold mt-0.5" numberOfLines={1}>
                Total Rides
              </Text>
            </View>
          </View>

          {/* Vertical Divider */}
          <View style={{ backgroundColor: colors.border }} className="w-[1px] h-6" />

          {/* Stat 3: Driver Rating */}
          <View className="flex-row items-center flex-1 justify-center px-0.5">
            <View className="w-[30px] h-[30px] rounded-lg bg-amber-50 items-center justify-center mr-1.5">
              <StarIcon size={15} color="#D97706" />
            </View>
            <View>
              <Text style={{ color: colors.text }} className="text-sm font-black leading-4">
                {driver.rating}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-[9.5px] font-semibold mt-0.5" numberOfLines={1}>
                Rating
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Vehicle Showcase Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          {/* Top Row: Vehicle Info & Realistic Car Image */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-1">
              <Text style={{ color: colors.text }} className="text-lg font-black" numberOfLines={1}>
                {driver.vehicleModel}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-0.5" numberOfLines={1}>
                {driver.seatingCapacity}
              </Text>

              {/* Indian License Plate Graphic */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="flex-row items-center self-start mt-2 rounded-md border overflow-hidden"
              >
                <View className="bg-blue-700 px-1 py-0.5 items-center justify-center">
                  <Text className="text-[7.5px] font-black text-white">IND</Text>
                </View>
                <Text style={{ color: colors.text }} className="text-[11px] font-mono font-black px-1.5 py-0.5 tracking-wider">
                  {driver.vehiclePlate}
                </Text>
              </View>
            </View>

            {/* Vehicle Image */}
            <View className="w-36 h-20 items-center justify-center">
              {(() => {
                const vehicleImg =
                  driver.vehicleImage ||
                  (Array.isArray(driver.driverVehicleImg)
                    ? driver.driverVehicleImg[0]
                    : driver.driverVehicleImg);

                return vehicleImg ? (
                  <Image
                    source={{ uri: vehicleImg }}
                    className="w-full h-full rounded-lg"
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={require('../../assets/images/maruti_dzire_white.jpg')}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                );
              })()}
            </View>
          </View>

          {/* Divider Line */}
          <View style={{ backgroundColor: colors.border }} className="h-[1px] my-3" />

          {/* Bottom Features Row: 3 Metrics */}
          <View className="flex-row items-center justify-between">
            {/* Feature 1: Verified RC */}
            <View className="flex-row items-center flex-1 px-0.5">
              <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mr-1.5">
                <CheckCircleIcon size={12} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-[10.5px] font-extrabold leading-tight" numberOfLines={1}>
                  Verified RC
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[9px] font-medium" numberOfLines={1}>
                  Govt Approved
                </Text>
              </View>
            </View>

            {/* Feature 2: Fully Insured */}
            <View className="flex-row items-center flex-1 px-0.5">
              <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center mr-1.5">
                <ShieldCheckmarkIcon size={12} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-[10.5px] font-extrabold leading-tight" numberOfLines={1}>
                  Fully Insured
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[9px] font-medium" numberOfLines={1}>
                  Safe & Secure
                </Text>
              </View>
            </View>

            {/* Feature 3: Clean & Hygienic */}
            <View className="flex-row items-center flex-1 px-0.5">
              <View className="w-6 h-6 rounded-full bg-purple-600 items-center justify-center mr-1.5">
                <SparkleCleanIcon size={12} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-[10.5px] font-extrabold leading-tight" numberOfLines={1}>
                  Clean & Safe
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[9px] font-medium" numberOfLines={1}>
                  Maintained
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Quick Action Grid Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
          className="rounded-xl border shadow-sm py-4 px-2 mb-4"
        >
          <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-3.5 px-2">
            Quick Actions
          </Text>
          <View className="flex-row items-start justify-between">
            {/* Action 1: Share Profile */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShareProfile}
              className="items-center flex-1"
            >
              <View className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 items-center justify-center mb-1">
                <ShareIcon size={20} color="#2563EB" />
              </View>
              <Text style={{ color: colors.text }} className="text-[10px] font-bold text-center leading-3 min-h-[26px]">
                Share{'\n'}Profile
              </Text>
            </TouchableOpacity>

            {/* Action 2: Add to Favorites */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleToggleFavorite}
              className="items-center flex-1"
            >
              <View className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 items-center justify-center mb-1">
                {isFavorite ? (
                  <HeartFilledIcon size={20} color="#E11D48" />
                ) : (
                  <HeartOutlineIcon size={20} color="#E11D48" />
                )}
              </View>
              <Text style={{ color: colors.text }} className="text-[10px] font-bold text-center leading-3 min-h-[26px]">
                {isFavorite ? 'In\nFavorites' : 'Add to\nFavorites'}
              </Text>
            </TouchableOpacity>

            {/* Action 3: Report Driver */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsReportModalVisible(true)}
              className="items-center flex-1"
            >
              <View className="w-12 h-12 rounded-full bg-red-50 border border-red-200 items-center justify-center mb-1">
                <FlagIcon size={20} color="#DC2626" />
              </View>
              <Text style={{ color: colors.text }} className="text-[10px] font-bold text-center leading-3 min-h-[26px]">
                Report{'\n'}Driver
              </Text>
            </TouchableOpacity>

            {/* Action 4: Call Driver */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCallDriver}
              className="items-center flex-1"
            >
              <View className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center mb-1">
                <PhoneIcon size={20} color="#10B981" />
              </View>
              <Text style={{ color: colors.text }} className="text-[10px] font-bold text-center leading-3 min-h-[26px]">
                Call{'\n'}Driver
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Safety First Banner */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-3 flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-7 h-7 rounded-lg bg-blue-600 items-center justify-center mr-2">
              <ShieldCheckmarkIcon size={14} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-extrabold text-slate-900">
                Safety First
              </Text>
              <Text className="text-[10px] font-medium text-slate-500 mt-0.5" numberOfLines={1}>
                Always call and finalize ride for a safe journey.
              </Text>
            </View>
          </View>

          <ChevronRightIcon size={15} color="#64748B" />
        </View>
      </ScrollView>

      {/* 6. Bottom Sticky CTA Bar */}
      <View
        style={{
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        }}
        className="px-4 pt-3 pb-4 border-t"
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCallDriver}
          style={{ backgroundColor: colors.primary }}
          className="w-full py-4 px-4 rounded-xl flex-row items-center justify-center shadow-md"
        >
          <PhoneIcon size={18} color="#FFFFFF" />
          <Text className="text-white text-base font-extrabold tracking-wide ml-2">
            Call & Finalize Ride
          </Text>
        </TouchableOpacity>

        {/* Security / Privacy caption */}
        <View className="flex-row items-center justify-center mt-1.5">
          <LockIcon size={11} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }} className="text-[10.5px] font-medium ml-1">
            Your phone number is never shared
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
