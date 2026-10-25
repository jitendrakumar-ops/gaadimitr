import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverVehicleDetailsScreenNavigationProp,
  DriverVehicleDetailsScreenRouteProp,
} from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateDriverProfile } from '../store/slices/driverSlice';
import { UpdateDriverPayload } from '../types/driver';
import {
  BackArrowIcon,
  ArrowRightIcon,
  CarModelIcon,
  LicensePlateSpecIcon,
  CalendarYearIcon,
  WeightLoadIcon,
  AcFanIcon,
  ColorPaletteIcon,
  BoleroPickupIllustration,
  ERickshawIllustration,
  ELoaderIllustration,
  ScorpioIllustration,
  BoleroIllustration,
  FiveSeaterIllustration,
  SevenSeaterIllustration,
  MiniLoaderIllustration,
} from '../assets/icons/DriverIcons';
import { ChevronDownIcon } from '../assets/icons/Icons';
import { useTheme } from '../theme';

const VEHICLE_COLORS = [
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Silver', hex: '#D1D5DB' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Black', hex: '#1F2937' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Other', hex: '#8B5CF6' },
];

export const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation<DriverVehicleDetailsScreenNavigationProp>();
  const route = useRoute<DriverVehicleDetailsScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const { driverData, selectedService, selectedVehicle } = route.params || {};

  const dispatch = useAppDispatch();
  const { isUpdating, error: driverError } = useAppSelector((state) => state.driver);

  const vehicleName = selectedVehicle?.name || 'Bolero Pickup';

  // Fillable form state
  const [model, setModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [year, setYear] = useState('');
  const [capacity, setCapacity] = useState('');
  const [acType, setAcType] = useState<'AC' | 'Non-AC'>('Non-AC');
  const [color, setColor] = useState('');
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const getVehicleIllustration = (typeId?: string) => {
    switch (typeId) {
      case 'bolero':
        return <BoleroIllustration size={58} />;
      case 'scorpio':
        return <ScorpioIllustration size={58} />;
      case 'e_loader':
        return <ELoaderIllustration size={58} />;
      case '5_seater':
        return <FiveSeaterIllustration size={58} />;
      case '7_seater':
        return <SevenSeaterIllustration size={58} />;
      case 'mini_loader':
        return <MiniLoaderIllustration size={58} />;
      case 'e_rickshaw':
        return <ERickshawIllustration size={58} />;
      case 'bolero_pickup':
      default:
        return <BoleroPickupIllustration size={58} />;
    }
  };

  const handleSelectColor = (selected: string) => {
    if (selected === 'Other') {
      setIsCustom(true);
      setColor(customColor || 'Other');
      setShowColorDropdown(true);
    } else {
      setIsCustom(false);
      setColor(selected);
      setShowColorDropdown(false);
    }
  };

  const handleContinue = async () => {
    const trimmedModel = model.trim();
    const trimmedNumber = vehicleNumber.trim().toUpperCase();

    if (trimmedModel.length < 2) {
      setErrorMessage('Vehicle model must be at least 2 characters');
      return;
    }
    if (trimmedNumber.length < 2) {
      setErrorMessage('Vehicle number must be at least 2 characters');
      return;
    }

    let parsedYear: number | null = null;
    if (year.trim()) {
      const y = parseInt(year.trim(), 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(y) || y < 1980 || y > currentYear + 1) {
        setErrorMessage(`Manufacturing year must be between 1980 and ${currentYear + 1}`);
        return;
      }
      parsedYear = y;
    }

    let parsedSeating: number | null = null;
    if (capacity.trim()) {
      const match = capacity.match(/\d+/);
      if (match) {
        const s = parseInt(match[0], 10);
        if (s >= 1 && s <= 20) {
          parsedSeating = s;
        }
      }
    }
    if (!parsedSeating && selectedVehicle?.seat) {
      const s = Number(selectedVehicle.seat);
      if (s >= 1 && s <= 20) {
        parsedSeating = s;
      }
    }

    const finalColor = isCustom ? (customColor.trim() || 'Other') : color;

    // MongoDB ObjectId validation helper
    const isValidObjectId = (id?: string) =>
      typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

    const payload: UpdateDriverPayload = {
      vehicleModel: trimmedModel,
      vehicleNo: trimmedNumber,
      color: finalColor && finalColor.trim().length >= 2 ? finalColor.trim() : null,
      type: acType || selectedVehicle?.type || null,
      manufacturingYear: parsedYear,
      seating: parsedSeating,
    };

    if (isValidObjectId(selectedService?.id)) {
      payload.serviceId = selectedService!.id;
    }
    if (isValidObjectId(selectedVehicle?.id)) {
      payload.vehicleId = selectedVehicle!.id;
    }

    setErrorMessage('');

    const resultAction = await dispatch(updateDriverProfile(payload));

    if (updateDriverProfile.fulfilled.match(resultAction)) {
      navigation.navigate('DriverAddVehiclePhotos', {
        driverData,
        selectedService,
        selectedVehicle,
        vehicleDetails: {
          model: trimmedModel,
          number: trimmedNumber,
          year: year.trim(),
          capacity: capacity.trim(),
          acType,
          color: finalColor,
        },
      });
    } else {
      const msg = (resultAction.payload as string) || 'Failed to update vehicle details';
      setErrorMessage(msg);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
          borderBottomWidth: 1,
        }}
        className="flex-row items-center px-4 py-2"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-1 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-lg font-bold ml-2">
          Vehicle details
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pt-3 pb-6">
            {/* Selected Vehicle Banner Card */}
            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
              className="border rounded-xl p-4 flex-row items-center justify-between mb-4"
            >
              <View>
                <Text style={{ color: colors.textMuted }} className="text-xs font-medium">
                  Selected Vehicle
                </Text>
                <Text style={{ color: colors.text }} className="text-lg font-black mt-1">
                  {vehicleName}
                </Text>
              </View>
              <View style={{ width: 72, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                {getVehicleIllustration(selectedVehicle?.id)}
              </View>
            </View>

            {/* Fillable Form Fields */}
            <View className="space-y-4 mb-5">
              {/* 1. Vehicle Model */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Vehicle Model
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-4"
                >
                  <CarModelIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={model}
                    onChangeText={(val) => {
                      setModel(val);
                      setErrorMessage('');
                    }}
                    placeholder="Enter vehicle model "
                    placeholderTextColor={colors.textMuted}
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {/* 2. Vehicle Number */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Vehicle Number
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-4"
                >
                  <LicensePlateSpecIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={vehicleNumber}
                    onChangeText={(val) => {
                      setVehicleNumber(val.toUpperCase());
                      setErrorMessage('');
                    }}
                    placeholder="Enter vehicle number (e.g. BR01GA1234)"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {/* 3. Manufacturing Year */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Manufacturing Year
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-4"
                >
                  <CalendarYearIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={year}
                    onChangeText={setYear}
                    placeholder="Enter year (e.g. 2021)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {/* 4. Seating / Load Capacity */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Seating / Load Capacity
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-4"
                >
                  <WeightLoadIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={capacity}
                    onChangeText={setCapacity}
                    placeholder="Enter capacity (e.g. 1000 kg or 4 Seats)"
                    placeholderTextColor={colors.textMuted}
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {/* 5. AC / Non-AC Selector */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  AC / Non-AC
                </Text>
                <View className="flex-row items-center space-x-3">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setAcType('Non-AC')}
                    style={{
                      borderColor: acType === 'Non-AC' ? colors.primary : colors.border,
                      backgroundColor: acType === 'Non-AC'
                        ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                        : colors.surfaceSecondary,
                    }}
                    className="flex-1 py-4 rounded-xl border flex-row items-center justify-center mr-2"
                  >
                    <AcFanIcon size={16} color={acType === 'Non-AC' ? colors.primary : colors.textMuted} />
                    <Text
                      style={{
                        color: acType === 'Non-AC' ? colors.primary : colors.textSecondary,
                      }}
                      className="text-xs font-bold ml-2"
                    >
                      Non-AC
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setAcType('AC')}
                    style={{
                      borderColor: acType === 'AC' ? colors.primary : colors.border,
                      backgroundColor: acType === 'AC'
                        ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                        : colors.surfaceSecondary,
                    }}
                    className="flex-1 py-4 rounded-xl border flex-row items-center justify-center"
                  >
                    <AcFanIcon size={16} color={acType === 'AC' ? colors.primary : colors.textMuted} />
                    <Text
                      style={{
                        color: acType === 'AC' ? colors.primary : colors.textSecondary,
                      }}
                      className="text-xs font-bold ml-2"
                    >
                      AC
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6. Vehicle Color Select Bar */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Vehicle Color
                </Text>

                {/* Main Select Bar / Dropdown Trigger */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowColorDropdown(!showColorDropdown)}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: showColorDropdown ? colors.primary : colors.inputBorder,
                  }}
                  className="flex-row items-center justify-between border rounded-xl px-4 py-3.5"
                >
                  <View className="flex-row items-center flex-1">
                    {color && color !== 'Other' ? (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor:
                            VEHICLE_COLORS.find(
                              (c) => c.name.toLowerCase() === color.toLowerCase()
                            )?.hex || colors.primary,
                          borderWidth: color.toLowerCase() === 'white' ? 1.5 : 0,
                          borderColor: colors.border,
                        }}
                      />
                    ) : (
                      <ColorPaletteIcon size={18} color={colors.textMuted} />
                    )}

                    <Text
                      style={{
                        color: color ? colors.text : colors.textMuted,
                      }}
                      className="text-sm font-medium ml-3 flex-1"
                    >
                      {color
                        ? isCustom
                          ? `Other (${customColor || 'Type below'})`
                          : color
                        : 'Select vehicle color'}
                    </Text>
                  </View>

                  <View
                    style={{
                      transform: [{ rotate: showColorDropdown ? '180deg' : '0deg' }],
                    }}
                  >
                    <ChevronDownIcon size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>

                {/* Quick-Select Color Bar (Horizontal Scroll) */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-2.5"
                  contentContainerStyle={{ paddingVertical: 2, paddingHorizontal: 1 }}
                >
                  {VEHICLE_COLORS.map((item) => {
                    const isSelected =
                      item.name === 'Other'
                        ? isCustom
                        : color.toLowerCase() === item.name.toLowerCase();

                    return (
                      <TouchableOpacity
                        key={item.name}
                        activeOpacity={0.7}
                        onPress={() => handleSelectColor(item.name)}
                        style={{
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(59, 130, 246, 0.15)'
                              : '#EFF6FF'
                            : colors.surfaceSecondary,
                          borderWidth: isSelected ? 1.5 : 1,
                        }}
                        className="flex-row items-center px-3 py-1.5 rounded-full mr-2"
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: item.hex,
                            borderWidth: item.border ? 1 : 0,
                            borderColor: colors.border,
                            marginRight: 6,
                          }}
                        />
                        <Text
                          style={{
                            color: isSelected ? colors.primary : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          }}
                          className="text-xs"
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Dropdown Options Grid when Select Bar is open */}
                {showColorDropdown && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                    className="border rounded-xl p-3 mt-2.5 shadow-sm"
                  >
                    <Text
                      style={{ color: colors.textMuted }}
                      className="text-[11px] font-semibold mb-2.5 ml-1"
                    >
                      Choose vehicle color
                    </Text>

                    <View className="flex-row flex-wrap justify-between">
                      {VEHICLE_COLORS.map((item) => {
                        const isSelected =
                          item.name === 'Other'
                            ? isCustom
                            : color.toLowerCase() === item.name.toLowerCase();

                        return (
                          <TouchableOpacity
                            key={item.name}
                            activeOpacity={0.7}
                            onPress={() => handleSelectColor(item.name)}
                            style={{
                              width: '48%',
                              borderColor: isSelected ? colors.primary : colors.borderLight,
                              backgroundColor: isSelected
                                ? isDark
                                  ? 'rgba(59, 130, 246, 0.15)'
                                  : '#EFF6FF'
                                : colors.surfaceSecondary,
                              borderWidth: isSelected ? 1.5 : 1,
                            }}
                            className="flex-row items-center p-2.5 rounded-lg mb-2"
                          >
                            <View
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: item.hex,
                                borderWidth: item.border ? 1 : 0,
                                borderColor: colors.border,
                                marginRight: 8,
                              }}
                            />
                            <Text
                              style={{
                                color: isSelected ? colors.primary : colors.text,
                                fontWeight: isSelected ? '700' : '500',
                              }}
                              className="text-xs flex-1"
                            >
                              {item.name}
                            </Text>
                            {isSelected && (
                              <View
                                style={{ backgroundColor: colors.primary }}
                                className="w-4 h-4 rounded-full items-center justify-center ml-1"
                              >
                                <Text className="text-white text-[9px] font-bold">✓</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Custom Color Input for "Other" */}
                    {isCustom && (
                      <View
                        className="mt-2 pt-2.5 border-t"
                        style={{ borderTopColor: colors.borderLight }}
                      >
                        <Text
                          style={{ color: colors.textSecondary }}
                          className="text-xs font-semibold mb-1.5 ml-1"
                        >
                          Enter custom color name
                        </Text>
                        <View
                          style={{
                            backgroundColor: colors.inputBg,
                            borderColor: colors.primary,
                          }}
                          className="flex-row items-center border rounded-lg px-3 py-2.5"
                        >
                          <TextInput
                            value={customColor}
                            onChangeText={(val) => {
                              setCustomColor(val);
                              setColor(val);
                            }}
                            placeholder="e.g. Golden, Cherry Red, Navy Blue"
                            placeholderTextColor={colors.textMuted}
                            autoFocus
                            style={{ color: colors.text }}
                            className="flex-1 text-xs font-medium p-0"
                          />
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {(errorMessage || driverError) ? (
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
                }}
                className="p-3 mb-4 rounded-xl border"
              >
                <Text style={{ color: colors.danger }} className="text-xs font-medium">
                  {errorMessage || driverError}
                </Text>
              </View>
            ) : null}

            {/* Continue Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={isUpdating}
              onPress={handleContinue}
              style={{ backgroundColor: isUpdating ? '#94A3B8' : colors.primary }}
              className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">
                    Continue
                  </Text>
                  <ArrowRightIcon size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const DriverVehicleDetailsScreen = VehicleDetailsScreen;
