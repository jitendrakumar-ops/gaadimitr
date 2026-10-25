import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { ToastNotification, ToastType } from '../components/common/ToastNotification';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverAddVehiclePhotosScreenNavigationProp,
  DriverAddVehiclePhotosScreenRouteProp,
} from '../types/navigation';
import {
  BackArrowIcon,
  ArrowRightIcon,
  CameraPhotoIcon,
} from '../assets/icons/DriverIcons';
import { pickFromCamera, pickFromGallery } from '../utils/imagePicker';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { uploadVehicleImages } from '../store/slices/driverSlice';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

interface PhotoItem {
  id: 'front' | 'side' | 'rear' | 'interior';
  title: string;
  subtitle: string;
  isRequired: boolean;
  imageUri: string | null;
}

export const AddVehiclePhotosScreen: React.FC = () => {
  const navigation = useNavigation<DriverAddVehiclePhotosScreenNavigationProp>();
  const route = useRoute<DriverAddVehiclePhotosScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const { driverData, selectedService, selectedVehicle, vehicleDetails } = route.params || {};

  const dispatch = useAppDispatch();
  const { isUploadingImages, uploadImagesError } = useAppSelector((state) => state.driver);

  const [photosState, setPhotosState] = useState<PhotoItem[]>([
    {
      id: 'front',
      title: 'Front View',
      subtitle: 'Clear view of front with number plate',
      isRequired: true,
      imageUri: null,
    },
    {
      id: 'side',
      title: 'Side View',
      subtitle: 'Full side profile of the vehicle',
      isRequired: true,
      imageUri: null,
    },
    {
      id: 'rear',
      title: 'Rear View',
      subtitle: 'Back view showing rear registration plate',
      isRequired: true,
      imageUri: null,
    },
    {
      id: 'interior',
      title: 'Interior / Cargo Area',
      subtitle: 'Cabin dashboard or cargo carriage bed',
      isRequired: false,
      imageUri: null,
    },
  ]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('error');

  const showToast = (message: string, type: ToastType = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const uploadedCount = photosState.filter((p) => p.imageUri !== null).length;
  const totalCount = photosState.length;

  const handlePhotoPress = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleSelectSource = async (source: 'camera' | 'gallery') => {
    if (selectedPhotoIndex === null) return;
    setIsUploading(true);

    try {
      let uri: string | null = null;
      if (source === 'camera') {
        uri = await pickFromCamera();
      } else {
        uri = await pickFromGallery();
      }

      if (uri) {
        const updated = [...photosState];
        updated[selectedPhotoIndex].imageUri = uri;
        setPhotosState(updated);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsUploading(false);
      setSelectedPhotoIndex(null);
    }
  };

  const handleRemovePhoto = () => {
    if (selectedPhotoIndex === null) return;
    const updated = [...photosState];
    updated[selectedPhotoIndex].imageUri = null;
    setPhotosState(updated);
    setSelectedPhotoIndex(null);
  };

  const handleContinue = async () => {
    const uploadedPhotos = photosState.filter((p) => p.imageUri !== null);

    const missingRequired = photosState.filter((p) => p.isRequired && !p.imageUri);
    if (missingRequired.length > 0) {
      showToast(
        `Please upload required photos: ${missingRequired.map((p) => p.title).join(', ')}.`,
        'error'
      );
      return;
    }

    if (uploadedPhotos.length === 0) {
      showToast('Please upload at least one vehicle photo.', 'error');
      return;
    }

    const formData = new FormData();
    uploadedPhotos.forEach((photo) => {
      if (photo.imageUri) {
        const uri = photo.imageUri;
        const filename = uri.split('/').pop() || `${photo.id}_photo.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

        formData.append('vehicleImages', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: filename,
          type: mimeType,
        } as any);
      }
    });

    const resultAction = await dispatch(uploadVehicleImages(formData));

    if (uploadVehicleImages.fulfilled.match(resultAction)) {
      navigation.navigate('DriverVerifyDocuments', {
        driverData,
        selectedService,
        selectedVehicle,
        vehicleDetails,
      });
    } else {
      const msg = (resultAction.payload as string) || 'Failed to upload vehicle photos. Please try again.';
      showToast(msg, 'error');
    }
  };

  const activePhoto = selectedPhotoIndex !== null ? photosState[selectedPhotoIndex] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-base font-bold">
          Add Vehicle Photos
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4 pb-6 flex-1 justify-between">
          <View>
            {/* Header Subtitle */}
            <View className="mb-5">
              <Text style={{ color: colors.textMuted }} className="text-xs leading-relaxed font-normal">
                Clear photos help customers identify your vehicle and accelerate verification.
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-1">
                {uploadedCount} of {totalCount} photos added
              </Text>
            </View>

            {/* Photo Rows List */}
            <View className="space-y-3">
              {photosState.map((photo, idx) => {
                const isUploaded = !!photo.imageUri;

                return (
                  <TouchableOpacity
                    key={photo.id}
                    activeOpacity={0.7}
                    onPress={() => handlePhotoPress(idx)}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                    className="border rounded-xl p-4 flex-row items-center justify-between mb-3"
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      {/* Thumbnail Box */}
                      <View
                        style={{
                          backgroundColor: colors.surfaceSecondary,
                          borderColor: colors.border,
                        }}
                        className="w-14 h-12 rounded-lg items-center justify-center mr-4 border overflow-hidden"
                      >
                        {isUploaded ? (
                          <Image
                            source={{ uri: photo.imageUri! }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <CameraPhotoIcon size={20} color={colors.textMuted} />
                        )}
                      </View>

                      {/* Info */}
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text style={{ color: colors.text }} className="text-sm font-semibold">
                            {photo.title}
                          </Text>
                          {!photo.isRequired && (
                            <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium ml-2">
                              (Optional)
                            </Text>
                          )}
                        </View>
                        <Text style={{ color: colors.textMuted }} className="text-xs mt-1" numberOfLines={1}>
                          {photo.subtitle}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    {isUploaded ? (
                      <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
                        <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" className="mr-1">
                          <Circle cx="12" cy="12" r="10" fill="#10B981" />
                          <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                        </Svg>
                        <Text className="text-xs font-semibold text-emerald-600">
                          Uploaded
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                          borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                        }}
                        className="flex-row items-center border px-3 py-1 rounded-md"
                      >
                        <Text style={{ color: colors.primary }} className="text-xs font-semibold">
                          Upload
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note Box */}
            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
              className="mt-3 p-4 border rounded-xl flex-row items-start"
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" className="mr-3 mt-1">
                <Circle cx="12" cy="12" r="10" stroke={colors.textMuted} strokeWidth="1.8" />
                <Path d="M12 8V12M12 16H12.01" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={{ color: colors.textSecondary }} className="text-xs flex-1 leading-relaxed">
                Take photos in good lighting. Ensure license plate and vehicle exterior are clearly visible without shadows.
              </Text>
            </View>
          </View>

          {/* Error Banner */}
          {uploadImagesError ? (
            <View
              style={{
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
              }}
              className="mt-4 p-3 rounded-xl border"
            >
              <Text style={{ color: colors.danger }} className="text-xs font-medium">
                {uploadImagesError}
              </Text>
            </View>
          ) : null}

          {/* Continue Button */}
          <View className="mt-8">
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={isUploadingImages}
              onPress={handleContinue}
              style={{ backgroundColor: isUploadingImages ? '#94A3B8' : colors.primary }}
              className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
            >
              {isUploadingImages ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">
                    Continue
                  </Text>
                  <ArrowRightIcon size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Clean Bottom Sheet Modal */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPhotoIndex(null)}
      >
        <View style={{ backgroundColor: colors.modalBackdrop }} className="flex-1 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedPhotoIndex(null)}
            className="flex-1"
          />

          <View style={{ backgroundColor: colors.surface }} className="rounded-t-2xl p-5 pb-8 shadow-2xl">
            {/* Modal Header */}
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between items-center pb-3 border-b mb-4">
              <Text style={{ color: colors.text }} className="text-base font-bold">
                {activePhoto?.title || 'Upload Photo'}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedPhotoIndex(null)}
                style={{ backgroundColor: colors.surfaceSecondary }}
                className="w-7 h-7 rounded-full items-center justify-center"
              >
                <Text style={{ color: colors.textMuted }} className="text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            {isUploading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ color: colors.textSecondary }} className="text-xs font-medium mt-2">
                  Processing image...
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {/* 1. Camera Option */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectSource('camera')}
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }}
                  className="flex-row items-center border rounded-xl p-4"
                >
                  <View
                    style={{
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                    }}
                    className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                  >
                    <CameraPhotoIcon size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-semibold">
                      Take Photo with Camera
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">
                      Capture live photo of vehicle
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Gallery Option */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectSource('gallery')}
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }}
                  className="flex-row items-center border rounded-xl p-4 mt-2"
                >
                  <View className="w-9 h-9 rounded-lg bg-emerald-500/10 items-center justify-center mr-3">
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#10B981" strokeWidth="2" />
                      <Circle cx="8.5" cy="8.5" r="1.5" fill="#10B981" />
                      <Path d="M21 15L16 10L5 21" stroke="#10B981" strokeWidth="2" />
                    </Svg>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-semibold">
                      Choose from Gallery
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">
                      Select photo from device gallery
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Remove Option */}
                {activePhoto?.imageUri && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleRemovePhoto}
                    className="flex-row items-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mt-2"
                  >
                    <View className="w-9 h-9 rounded-lg bg-rose-500/20 items-center justify-center mr-3">
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
                      </Svg>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-rose-500">
                        Remove Uploaded Photo
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Cancel Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedPhotoIndex(null)}
                  style={{ backgroundColor: colors.surfaceSecondary }}
                  className="w-full py-3 rounded-xl items-center justify-center mt-2"
                >
                  <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* In-app Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

export const DriverAddVehiclePhotosScreen = AddVehiclePhotosScreen;
export default AddVehiclePhotosScreen;
