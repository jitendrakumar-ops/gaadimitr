import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { ToastNotification, ToastType } from '../components/common/ToastNotification';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverVehicleSelectScreenNavigationProp,
  DriverVehicleSelectScreenRouteProp,
  VehicleOption,
} from '../types/navigation';
import {
  BackArrowIcon,
  ArrowRightIcon,
  CheckmarkBadge,
  CarModelIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import { BackendVehicleItem } from '../services/vehicleService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchVehicles } from '../store/slices/vehicleSlice';

export const VehicleSelectScreen: React.FC = () => {
  const navigation = useNavigation<DriverVehicleSelectScreenNavigationProp>();
  const route = useRoute<DriverVehicleSelectScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const driverData = route.params?.driverData;
  const selectedService = route.params?.selectedService;

  const dispatch = useAppDispatch();
  const { vehicles, isLoading, error: fetchError } = useAppSelector((state) => state.vehicle);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('error');

  const showToast = (message: string, type: ToastType = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const loadVehicles = async () => {
    await dispatch(fetchVehicles(selectedService?.id));
  };

  useEffect(() => {
    loadVehicles();
  }, [dispatch, selectedService?.id]);

  useEffect(() => {
    if (vehicles.length > 0) {
      setSelectedVehicleId((prev) => {
        const exists = vehicles.some((v) => (v.id || v._id) === prev);
        return exists ? prev : (vehicles[0].id || vehicles[0]._id || '');
      });
    } else {
      setSelectedVehicleId('');
    }
  }, [vehicles]);

  const formatTitle = (title: string) => {
    if (!title) return '';
    const trimmed = title.trim();
    return trimmed
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const renderVehicleGraphic = (vehicle: BackendVehicleItem) => {
    if (vehicle.image) {
      return (
        <Image
          source={{ uri: vehicle.image }}
          style={{ width: 56, height: 56 }}
          resizeMode="contain"
        />
      );
    }

    return <CarModelIcon size={40} color={colors.primary} />;
  };

  const handleContinue = () => {
    const chosen = vehicles.find((v) => (v.id || v._id) === selectedVehicleId);
    if (!chosen) {
      showToast('Please select a vehicle to continue.', 'error');
      return;
    }

    const seatCount = chosen.seat || chosen.seating;
    const selectedOption: VehicleOption = {
      id: chosen.id || chosen._id || '',
      name: formatTitle(chosen.title),
      category: seatCount ? `${seatCount} Seater` : (chosen.type || 'Commercial / Passenger'),
      iconType: chosen.id || chosen._id || '',
      image: chosen.image || undefined,
      seat: seatCount || undefined,
      fee: chosen.fee || undefined,
      type: chosen.type || undefined,
    };

    navigation.navigate('DriverVehicleDetails', {
      driverData,
      selectedService,
      selectedVehicle: selectedOption,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);
              await loadVehicles();
              setIsRefreshing(false);
            }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View className="flex-1 px-5 pt-2 pb-6 justify-between">
          {/* Top Navigation Bar */}
          <View className="flex-row items-center py-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrowIcon size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Heading & Subheading */}
          <View className="mt-2 mb-6">
            <Text style={{ color: colors.text }} className="text-2xl font-black tracking-tight">
              What vehicle do you drive?
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-sm mt-1 font-normal">
              {selectedService?.name ? `Available vehicles for ${selectedService.name}.` : 'Select the vehicle you want to list.'}
            </Text>
          </View>

          {/* Loading Indicator */}
          {isLoading ? (
            <View className="py-16 items-center justify-center flex-1">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-3">
                Loading vehicles from catalog...
              </Text>
            </View>
          ) : (
            <>
              {/* Error Notice */}
              {fetchError && (
                <View
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
                  }}
                  className="p-3 mb-4 rounded-xl border flex-row items-center justify-between"
                >
                  <Text style={{ color: colors.danger }} className="text-xs flex-1 mr-2">
                    {fetchError}
                  </Text>
                  <TouchableOpacity
                    onPress={loadVehicles}
                    className="px-2 py-1 bg-red-500 rounded-md"
                  >
                    <Text className="text-white text-[11px] font-bold">Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Empty State */}
              {vehicles.length === 0 && !fetchError && (
                <View className="py-16 items-center justify-center flex-1">
                  <Text style={{ color: colors.textMuted }} className="text-sm font-medium mb-3 text-center">
                    No vehicles found.
                  </Text>
                  <TouchableOpacity
                    onPress={loadVehicles}
                    className="px-4 py-2 bg-blue-600 rounded-lg"
                  >
                    <Text className="text-white text-xs font-bold">Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 3x3 Vehicle Grid */}
              {vehicles.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  {vehicles.map((vehicle) => {
                    const vehicleId = vehicle.id || vehicle._id || '';
                    const isSelected = selectedVehicleId === vehicleId;

                    return (
                      <TouchableOpacity
                        key={vehicleId}
                        activeOpacity={0.8}
                        onPress={() => setSelectedVehicleId(vehicleId)}
                        style={{
                          width: '31%',
                          height: 124,
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected
                            ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                            : colors.surface,
                        }}
                        className="rounded-xl mb-4 p-2 items-center justify-between border relative shadow-xs"
                      >
                        {/* Selection Checkmark Top-Right Badge */}
                        {isSelected && (
                          <View className="absolute -top-2 -right-2 z-10">
                            <CheckmarkBadge size={20} />
                          </View>
                        )}

                        {/* Vehicle Graphic Area */}
                        <View className="flex-1 items-center justify-center pt-1 w-full overflow-hidden">
                          {renderVehicleGraphic(vehicle)}
                        </View>

                        {/* Vehicle Name */}
                        <View className="items-center justify-center min-h-[30px] w-full px-1">
                          <Text
                            style={{
                              color: isSelected ? colors.primary : colors.text,
                            }}
                            className="text-center font-bold leading-tight text-xs"
                            numberOfLines={2}
                          >
                            {formatTitle(vehicle.title)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* Bottom Continue Button */}
          <View className="w-full mt-auto pt-6">
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={isLoading || !selectedVehicleId}
              onPress={handleContinue}
              style={{
                backgroundColor: isLoading || !selectedVehicleId ? '#94A3B8' : colors.primary,
              }}
              className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
            >
              <Text className="text-white font-bold text-base mr-2">
                Continue
              </Text>
              <ArrowRightIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* In-App Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

export const DriverVehicleSelectScreen = VehicleSelectScreen;
export default VehicleSelectScreen;

