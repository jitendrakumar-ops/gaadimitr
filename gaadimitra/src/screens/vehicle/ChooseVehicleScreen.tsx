import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChooseVehicleScreenNavigationProp,
  ChooseVehicleScreenRouteProp,
} from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import {
  Car5SeaterGraphic,
  CheckCircleIcon,
} from '../../assets/icons/Icons';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../theme';
import { useAppDispatch, useAppSelector, fetchVehicles } from '../../store';
import { storageService } from '../../services/storage';

export const ChooseVehicleScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<ChooseVehicleScreenNavigationProp>();
  const route = useRoute<ChooseVehicleScreenRouteProp>();
  const dispatch = useAppDispatch();

  const selectedCity =
    route.params?.selectedCity ||
    storageService.getString('user_selected_city') ||
    'Current Location';
  const serviceId = route.params?.serviceId || route.params?.initialCategoryId;
  const serviceTitle = route.params?.serviceTitle;

  // Redux: live vehicles state from GET /vehicles?serviceId=...
  const { vehicles, isLoading, error } = useAppSelector((state) => state.vehicles);
  const [selectedId, setSelectedId] = useState<string>('');
  console.log("vehicles", vehicles)
  const loadVehicles = useCallback(() => {
    dispatch(
      fetchVehicles({
        serviceId: serviceId || undefined,
        isActive: true,
      })
    );
  }, [dispatch, serviceId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Auto-select first vehicle when data arrives
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      if (!selectedId || !vehicles.some(v => v.id === selectedId)) {
        setSelectedId(vehicles[0].id);
      }
    }
  }, [vehicles, selectedId]);

  const handleProceed = () => {
    const currentVehicle = vehicles.find(v => v.id === selectedId);
    const resolvedServiceId =
      serviceId ||
      (typeof currentVehicle?.serviceId === 'string'
        ? currentVehicle.serviceId
        : currentVehicle?.serviceId?.id) ||
      undefined;

    navigation.navigate('NearbyDrivers', {
      categoryId: selectedId,
      categoryTitle: currentVehicle?.title || serviceTitle || 'Cars',
      selectedCity,
      serviceId: resolvedServiceId,
      vehicleId: selectedId || undefined,
    });
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <HeaderBar
        onBackPress={() => navigation.goBack()}
        title={serviceTitle ? `Choose ${serviceTitle}` : 'Choose Vehicle'}
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />

      {/* Main Body */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadVehicles}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Loading State */}
        {isLoading && vehicles.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mt-3">
              Loading vehicles...
            </Text>
          </View>
        ) : error && vehicles.length === 0 ? (
          /* Error State */
          <View className="flex-1 items-center justify-center py-16 px-4">
            <Text style={{ color: colors.text }} className="text-base font-bold text-center">
              Unable to load vehicles
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1 mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadVehicles}
              style={{ backgroundColor: colors.primary }}
              className="px-5 py-2.5 rounded-xl"
            >
              <Text className="text-white text-xs font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : vehicles.length === 0 ? (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20 px-4">
            <View
              style={{ backgroundColor: `${colors.primary}15` }}
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
            >
              <Car5SeaterGraphic width={40} height={24} />
            </View>
            <Text style={{ color: colors.text }} className="text-base font-bold text-center">
              No Vehicles Available
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs text-center mt-1.5 max-w-[260px]">
              {serviceTitle
                ? `No vehicles found under "${serviceTitle}". Please select another service category.`
                : 'No vehicles found for this category.'}
            </Text>
          </View>
        ) : (
          /* 2-Column Grid of Live Vehicles from /vehicles API */
          <View className="flex-row flex-wrap -mx-1.5">
            {vehicles && vehicles?.map(vehicle => {
              const isSelected = selectedId === vehicle.id;
              const capacityText = vehicle.seat
                ? `${vehicle.seat} Passengers`
                : vehicle.type || 'Standard';
              const priceText = vehicle.fee ? `₹${vehicle.fee} / km` : null;

              return (
                <View key={vehicle.id} className="w-1/2 p-1.5">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedId(vehicle.id)}
                    style={{
                      backgroundColor: isSelected ? `${colors.primary}18` : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    }}
                    className="rounded-xl p-4 items-center justify-between min-h-[160px] relative shadow-sm"
                  >
                    {/* Top-Right Checkmark Badge when Selected */}
                    {isSelected && (
                      <View className="absolute top-2.5 right-2.5">
                        <CheckCircleIcon size={18} color={colors.primary} />
                      </View>
                    )}

                    {/* Vehicle Graphic / Image from S3 */}
                    <View className="h-16 items-center justify-center my-1 w-full">
                      {vehicle.image ? (
                        <Image
                          source={{ uri: vehicle.image }}
                          style={{ width: 90, height: 54 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Car5SeaterGraphic width={80} height={48} />
                      )}
                    </View>

                    {/* Title, Capacity & Price */}
                    <View className="items-center mt-1 w-full">
                      <Text
                        numberOfLines={1}
                        style={{
                          color: isSelected ? colors.primary : colors.text,
                        }}
                        className="text-sm font-bold text-center"
                      >
                        {vehicle.title}
                      </Text>
                      {vehicle.seat && (
                        <Text
                          numberOfLines={1}
                          style={{ color: colors.textSecondary }}
                          className="text-xs font-medium mt-0.5 text-center"
                        >
                          {vehicle.seat + " Passengers"}
                        </Text>)}

                      <Text
                        numberOfLines={1}
                        style={{ color: colors.primary }}
                        className="text-[11px] font-extrabold mt-1 text-center"
                      >
                        {vehicle.title}
                      </Text>

                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View
        style={{
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        }}
        className="p-5 border-t"
      >
        <Button
          title="Find Nearby Vehicles"
          variant="primary"
          size="lg"
          disabled={vehicles.length === 0 || !selectedId}
          onPress={handleProceed}
          className="w-full shadow-md"
        />
      </View>
    </SafeAreaView>
  );
};
