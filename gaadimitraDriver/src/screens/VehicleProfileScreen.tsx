import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppSelector } from '../store/hooks';

export const VehicleProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { driverProfile } = useAppSelector((state) => state.driver);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const rawImages = driverProfile?.vehicleImages || [];
  const photos = rawImages.map((uri: string, idx: number) => ({
    title: idx === 0 ? 'Front View' : idx === 1 ? 'Side Angle' : idx === 2 ? 'Rear View' : `Photo ${idx + 1}`,
    uri,
  }));

  const vehicleData = {
    serviceId: (driverProfile?.serviceId as any)?.title || (typeof driverProfile?.serviceId === 'string' ? driverProfile?.serviceId : '-'),
    vehicle: (driverProfile?.vehicleId as any)?.title || (typeof driverProfile?.vehicleId === 'string' ? driverProfile?.vehicleId : '-'),
    vehicleModel: driverProfile?.vehicleModel || driverProfile?.vehicle?.model || '-',
    vehicleNo: driverProfile?.vehicleNo || driverProfile?.vehicle?.vehicleNo || '-',
    model: driverProfile?.vehicleModel || driverProfile?.vehicle?.model || '-',
    registrationNumber: driverProfile?.vehicleNo || driverProfile?.vehicle?.vehicleNo || '-',
    category: driverProfile?.type
      ? `Commercial ${driverProfile.type}${driverProfile?.seating ? ` (${driverProfile.seating}+1 Seater)` : ''}`
      : '-',
    color: driverProfile?.color || driverProfile?.vehicle?.color || '-',
    year: driverProfile?.manufacturingYear ? String(driverProfile.manufacturingYear) : '-',
    seatingCapacity: driverProfile?.seating
      ? `${driverProfile.seating} Passengers + 1 Driver`
      : '-',
    acType: driverProfile?.type || '-',
    photos,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="px-4 py-3.5 border-b flex-row items-center justify-between "
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={{ color: colors.text }} className="text-base font-black tracking-tight">
          Vehicle Details
        </Text>

        <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          <Text className="text-[10px] font-black text-emerald-600 uppercase">
            Active
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Vehicle Hero Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <View className="flex-row items-center mb-3">
            <View
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
              }}
              className="w-12 h-12 rounded-xl border items-center justify-center mr-3.5"
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 17H19M5 17C3.5 17 2 15.5 2 14V11L4 6C4.5 4.5 6 4 7 4H17C18 4 19.5 4.5 20 6L22 11V14C22 15.5 20.5 17 19 17"
                  stroke={colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <Circle cx="7.5" cy="16.5" r="1.5" fill={colors.primary} />
                <Circle cx="16.5" cy="16.5" r="1.5" fill={colors.primary} />
              </Svg>
            </View>

            <View className="flex-1">
              <Text style={{ color: colors.text }} className="text-base font-black">
                {vehicleData.model}
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium mt-0.5">
                {vehicleData.category}
              </Text>
            </View>
          </View>

          {/* Registration Number License Plate */}
          <View
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFBEB',
              borderColor: isDark ? colors.border : '#0F172A',
            }}
            className="border-[1px] rounded-xl p-2.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="bg-blue-600 px-1.5 py-1 rounded mr-2 items-center">
                <Text className="text-[8px] font-black text-white">IND</Text>
              </View>
              <Text style={{ color: colors.text }} className="text-base font-black tracking-widest font-mono">
                {vehicleData.registrationNumber}
              </Text>
            </View>

            <View className="bg-emerald-500/15 px-2 py-0.5 rounded">
              <Text className="text-[10px] font-bold text-emerald-600">
                Verified RC
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Key Specifications */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Vehicle Specifications
          </Text>

          <View className="space-y-2.5">
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Service</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{vehicleData.serviceId}</Text>
            </View>
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Vehicle Type</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{vehicleData.vehicle}</Text>
            </View>
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Vehicle Model</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{vehicleData.vehicleModel}</Text>
            </View>

            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Vehicle Number</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold font-mono uppercase">{vehicleData.vehicleNo}</Text>
            </View>

            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Model Year</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{vehicleData.year}</Text>
            </View>

            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Seating Capacity</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{vehicleData.seatingCapacity}</Text>
            </View>

            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Vehicle Color</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{vehicleData.color}</Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Vehicle Type</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{vehicleData.acType}</Text>
            </View>
          </View>
        </View>

        {/* 4. Vehicle Photos Gallery */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Vehicle Photos (Tap to Zoom)
          </Text>

          {vehicleData.photos.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {vehicleData.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => setPreviewImageUri(photo.uri)}
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  }}
                  className="w-[48%] mb-3 rounded-xl overflow-hidden border"
                >
                  <Image
                    source={{ uri: photo.uri }}
                    className="w-full h-28"
                    resizeMode="cover"
                  />
                  <View className="bg-black/75 py-1.5 items-center">
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {photo.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View
              style={{ backgroundColor: colors.surfaceSecondary }}
              className="py-6 px-4 rounded-xl items-center justify-center"
            >
              <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">
                No vehicle photos uploaded
              </Text>
            </View>
          )}
        </View>


        {/* 6. Safety Inspection Badge */}
        <View
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          className="p-4 border rounded-xl flex-row items-center"
        >
          <View className="w-9 h-9 rounded-full bg-emerald-500/15 items-center justify-center mr-3">
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              Vehicle Inspection Verified
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-[11px] mt-0.5 leading-relaxed font-medium">
              This vehicle has passed all platform physical safety and roadworthiness inspections.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Image Zoom Preview Modal */}
      <Modal
        visible={previewImageUri !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View className="flex-1 bg-black justify-center items-center p-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPreviewImageUri(null)}
            className="absolute top-12 right-6 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Text className="text-white font-black text-base">✕</Text>
          </TouchableOpacity>

          {previewImageUri && (
            <Image
              source={{ uri: previewImageUri }}
              className="w-full h-[70%]"
              resizeMode="contain"
            />
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPreviewImageUri(null)}
            className="mt-6 bg-white/20 px-6 py-2.5 rounded-full border border-white/30"
          >
            <Text className="text-white font-bold text-xs">Tap to Dismiss</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export const DriverVehicleProfileScreen = VehicleProfileScreen;
export default VehicleProfileScreen;
