import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverServiceSelectScreenNavigationProp,
  DriverServiceSelectScreenRouteProp,
  ServiceOption,
} from '../types/navigation';
import {
  BackArrowIcon,
  ArrowRightIcon,
  CheckmarkBadge,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchServices } from '../store/slices/serviceSlice';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export const ServiceSelectScreen: React.FC = () => {
  const navigation = useNavigation<DriverServiceSelectScreenNavigationProp>();
  const route = useRoute<DriverServiceSelectScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const driverData = route.params?.driverData;

  const dispatch = useAppDispatch();
  const { services, isLoading, error: fetchError } = useAppSelector((state) => state.service);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  const loadServices = async () => {
    await dispatch(fetchServices());
  };

  useEffect(() => {
    loadServices();
  }, [dispatch]);

  useEffect(() => {
    if (services.length > 0) {
      setSelectedServiceId((prev) => {
        const exists = services.some((s) => (s.id || s._id) === prev);
        return exists ? prev : (services[0].id || services[0]._id || '');
      });
    } else {
      setSelectedServiceId('');
    }
  }, [services]);

  const formatTitle = (title: string) => {
    if (!title) return '';
    const trimmed = title.trim();
    if (trimmed.toLowerCase() === 'e-riksha' || trimmed.toLowerCase() === 'e-rickshaw') {
      return 'E-Rickshaw';
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  const renderFallbackIcon = (title: string, color: string) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('truck') || lower.includes('goods') || lower.includes('cargo')) {
      return (
        <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="7" width="14" height="12" rx="2" stroke={color} strokeWidth="1.8" />
          <Path d="M16 11H20L22 14V19H16V11Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <Circle cx="6" cy="19" r="2" fill={color} />
          <Circle cx="18" cy="19" r="2" fill={color} />
        </Svg>
      );
    }
    if (lower.includes('riksha') || lower.includes('rickshaw') || lower.includes('auto')) {
      return (
        <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 17H19M5 17C3.5 17 2 15.5 2 14V11L4 6C4.5 4.5 6 4 7 4H17C18 4 19.5 4.5 20 6L22 11V14C22 15.5 20.5 17 19 17"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <Circle cx="7.5" cy="16.5" r="1.5" fill={color} />
          <Circle cx="16.5" cy="16.5" r="1.5" fill={color} />
          <Path d="M9 4L8 8H16L15 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </Svg>
      );
    }
    return (
      <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
        <Path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  };

  const handleContinue = () => {
    const chosen = services.find((s) => (s.id || s._id) === selectedServiceId);
    if (!chosen) {
      Alert.alert('Select Service', 'Please select a service to continue.');
      return;
    }

    const selectedService: ServiceOption = {
      id: chosen.id || chosen._id || '',
      name: formatTitle(chosen.title),
      category: chosen.description || chosen.title,
      description: chosen.description,
      image: chosen.image || undefined,
    };

    // Navigate to next screen: DriverVehicleSelect
    navigation.navigate('DriverVehicleSelect', {
      driverData,
      selectedService,
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
              await loadServices();
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
              What service do you provide?
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-sm mt-1 font-normal">
              Select the service type for your bookings.
            </Text>
          </View>

          {/* Loading Indicator */}
          {isLoading ? (
            <View className="py-16 items-center justify-center flex-1">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-3">
                Loading available services...
              </Text>
            </View>
          ) : (
            <>
              {/* Error / Offline Retry notice if any */}
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
                    onPress={loadServices}
                    className="px-2 py-1 bg-red-500 rounded-md"
                  >
                    <Text className="text-white text-[11px] font-bold">Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Empty State */}
              {services.length === 0 && !fetchError && (
                <View className="py-16 items-center justify-center flex-1">
                  <Text style={{ color: colors.textMuted }} className="text-sm font-medium mb-3 text-center">
                    No services found.
                  </Text>
                  <TouchableOpacity
                    onPress={loadServices}
                    className="px-4 py-2 bg-blue-600 rounded-lg"
                  >
                    <Text className="text-white text-xs font-bold">Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 3 Columns Service Grid */}
              {services.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  {services.map((service) => {
                    const serviceId = service.id || service._id || '';
                    const isSelected = selectedServiceId === serviceId;

                    return (
                      <TouchableOpacity
                        key={serviceId}
                        activeOpacity={0.8}
                        onPress={() => setSelectedServiceId(serviceId)}
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

                        {/* Illustration / Image Area */}
                        <View className="flex-1 items-center justify-center pt-1 w-full overflow-hidden">
                          {service.image ? (
                            <Image
                              source={{ uri: service.image }}
                              style={{ width: 48, height: 48 }}
                              resizeMode="contain"
                            />
                          ) : (
                            renderFallbackIcon(service.title, isSelected ? colors.primary : colors.textSecondary)
                          )}
                        </View>

                        {/* Service Title */}
                        <View className="items-center justify-center min-h-[30px] w-full px-1">
                          <Text
                            style={{
                              color: isSelected ? colors.primary : colors.text,
                            }}
                            className="text-center font-bold leading-tight text-xs"
                            numberOfLines={2}
                          >
                            {formatTitle(service.title)}
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
              disabled={isLoading || !selectedServiceId}
              onPress={handleContinue}
              style={{
                backgroundColor: isLoading || !selectedServiceId ? '#94A3B8' : colors.primary,
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
    </SafeAreaView>
  );
};

export const DriverServiceSelectScreen = ServiceSelectScreen;
export default ServiceSelectScreen;

