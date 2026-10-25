import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import {
  BackArrowIcon,
  IdCardIcon,
  CameraPhotoIcon,
} from '../assets/icons/DriverIcons';
import { pickFromCamera, pickFromGallery } from '../utils/imagePicker';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { uploadSpecificDocument } from '../store/slices/documentSlice';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadIdProof'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'UploadIdProof'>;

export const UploadIdProofScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const initialData = route.params?.initialData;

  const dispatch = useAppDispatch();
  const { isUploading: isSubmittingDoc, error: docError } = useAppSelector((state) => state.document);

  const [idNumber, setIdNumber] = useState(initialData?.cardNo || '');
  const [frontImageUri, setFrontImageUri] = useState<string | null>(
    initialData?.frontImageUri || null
  );
  const [backImageUri, setBackImageUri] = useState<string | null>(
    initialData?.backImageUri || null
  );

  const [activePhotoSlot, setActivePhotoSlot] = useState<'front' | 'back' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectSource = async (source: 'camera' | 'gallery') => {
    if (!activePhotoSlot) return;
    setIsUploading(true);

    try {
      let uri: string | null = null;
      if (source === 'camera') {
        uri = await pickFromCamera();
      } else {
        uri = await pickFromGallery();
      }

      if (uri) {
        if (activePhotoSlot === 'front') setFrontImageUri(uri);
        if (activePhotoSlot === 'back') setBackImageUri(uri);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsUploading(false);
      setActivePhotoSlot(null);
    }
  };

  const handleSave = async () => {
    if (!idNumber.trim()) {
      setErrorMsg('Please enter your Aadhaar Card number');
      return;
    }

    setErrorMsg('');

    const formData = new FormData();
    formData.append('cardNo', idNumber.trim().toUpperCase());

    if (frontImageUri && !frontImageUri.startsWith('http')) {
      const filename = frontImageUri.split('/').pop() || 'id_front.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      formData.append('frontPhoto', {
        uri: Platform.OS === 'ios' ? frontImageUri.replace('file://', '') : frontImageUri,
        name: filename,
        type: ext === 'png' ? 'image/png' : 'image/jpeg',
      } as any);
    }

    if (backImageUri && !backImageUri.startsWith('http')) {
      const filename = backImageUri.split('/').pop() || 'id_back.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      formData.append('backPhoto', {
        uri: Platform.OS === 'ios' ? backImageUri.replace('file://', '') : backImageUri,
        name: filename,
        type: ext === 'png' ? 'image/png' : 'image/jpeg',
      } as any);
    }

    const resultAction = await dispatch(
      uploadSpecificDocument({ docType: 'aadharCard', formData })
    );

    if (uploadSpecificDocument.fulfilled.match(resultAction)) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('DriverVerifyDocuments', {
          updatedDoc: {
            id: 'id_proof',
            docNumber: idNumber.trim().toUpperCase(),
            frontImageUri,
            backImageUri,
          },
        });
      }
    } else {
      const msg = (resultAction.payload as string) || 'Failed to upload Identity document';
      setErrorMsg(msg);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Header */}
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
          Aadhaar Card
        </Text>
        <View className="w-10" />
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
          <View className="px-5 pt-4 pb-6 flex-1 justify-between">
            <View className="space-y-4">
              {/* Top info */}
              <View
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }}
                className="border rounded-xl p-4 flex-row items-center"
              >
                <View
                  style={{
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE',
                  }}
                  className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                >
                  <IdCardIcon size={18} color="#0284C7" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="text-xs font-semibold">
                    Aadhaar Card Details
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-[11px] mt-1">
                    Enter your Aadhaar number and upload clear front & back photos
                  </Text>
                </View>
              </View>

              {/* 1. Aadhaar Card Number */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Aadhaar Card Number <Text className="text-rose-500">*</Text>
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-3"
                >
                  <TextInput
                    value={idNumber}
                    onChangeText={(val) => {
                      setIdNumber(val.toUpperCase());
                      setErrorMsg('');
                    }}
                    placeholder="12-digit Aadhaar Number (e.g. 2345 6789 0123)"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium p-0"
                  />
                </View>
              </View>

              {/* 2. Document Photos (Front & Back) */}
              <View className="pt-2">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Aadhaar Card Photos (Front & Back)
                </Text>

                <View className="flex-row space-x-3">
                  {/* Front Photo Slot */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setActivePhotoSlot('front')}
                    style={{
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    }}
                    className="flex-1 border border-dashed rounded-xl p-4 items-center justify-center h-32 overflow-hidden mr-2"
                  >
                    {frontImageUri ? (
                      <Image
                        source={{ uri: frontImageUri }}
                        className="w-full h-full rounded-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <CameraPhotoIcon size={20} color={colors.primary} />
                        <Text style={{ color: colors.text }} className="text-xs font-semibold mt-2">
                          Front Side
                        </Text>
                        <Text style={{ color: colors.textMuted }} className="text-[10px] mt-1">
                          + Tap to upload
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Back Photo Slot */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setActivePhotoSlot('back')}
                    style={{
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    }}
                    className="flex-1 border border-dashed rounded-xl p-4 items-center justify-center h-32 overflow-hidden ml-2"
                  >
                    {backImageUri ? (
                      <Image
                        source={{ uri: backImageUri }}
                        className="w-full h-full rounded-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <CameraPhotoIcon size={20} color={colors.primary} />
                        <Text style={{ color: colors.text }} className="text-xs font-semibold mt-2">
                          Back Side
                        </Text>
                        <Text style={{ color: colors.textMuted }} className="text-[10px] mt-1">
                          + Tap to upload
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {(errorMsg || docError) ? (
                <Text className="text-xs font-semibold text-rose-500 ml-1">
                  {errorMsg || docError}
                </Text>
              ) : null}
            </View>

            {/* Save Button */}
            <View className="mt-8">
              <TouchableOpacity
                activeOpacity={0.88}
                disabled={isSubmittingDoc}
                onPress={handleSave}
                style={{ backgroundColor: isSubmittingDoc ? '#94A3B8' : colors.primary }}
                className="w-full py-4 px-6 rounded-xl items-center justify-center shadow-md"
              >
                {isSubmittingDoc ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Save & Continue
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal for Photo Selection */}
      <Modal
        visible={activePhotoSlot !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActivePhotoSlot(null)}
      >
        <View style={{ backgroundColor: colors.modalBackdrop }} className="flex-1 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setActivePhotoSlot(null)}
            className="flex-1"
          />

          <View style={{ backgroundColor: colors.surface }} className="rounded-t-2xl p-5 pb-8 shadow-2xl">
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between items-center pb-3 border-b mb-4">
              <Text style={{ color: colors.text }} className="text-base font-bold">
                Upload {activePhotoSlot === 'front' ? 'Front' : 'Back'} Side Photo
              </Text>
              <TouchableOpacity
                onPress={() => setActivePhotoSlot(null)}
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
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
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
                      Capture live photo of ID card
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectSource('gallery')}
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }}
                  className="flex-row items-center border rounded-xl p-4 mt-2"
                >
                  <View className="w-9 h-9 rounded-lg bg-emerald-500/15 items-center justify-center mr-3">
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
                      Select photo from device storage
                    </Text>
                  </View>
                </TouchableOpacity>

                {((activePhotoSlot === 'front' && frontImageUri) ||
                  (activePhotoSlot === 'back' && backImageUri)) && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (activePhotoSlot === 'front') setFrontImageUri(null);
                      if (activePhotoSlot === 'back') setBackImageUri(null);
                      setActivePhotoSlot(null);
                    }}
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

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActivePhotoSlot(null)}
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
    </SafeAreaView>
  );
};
