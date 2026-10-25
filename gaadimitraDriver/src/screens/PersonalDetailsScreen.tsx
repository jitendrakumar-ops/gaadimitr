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
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverPersonalDetailsScreenNavigationProp,
  DriverPersonalDetailsScreenRouteProp,
} from '../types/navigation';
import {
  BackArrowIcon,
  ProfileBadgeIcon,
  UserInputIcon,
  PhoneInputIcon,
  CameraPhotoIcon,
  HomeAddressIcon,
  ArrowRightIcon,
  ShieldLockIcon,
  MailInputIcon,
  GenderInputIcon,
} from '../assets/icons/DriverIcons';
import { pickFromCamera, pickFromGallery } from '../utils/imagePicker';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerDriver } from '../store/slices/authSlice';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storage';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

export const PersonalDetailsScreen: React.FC = () => {
  const navigation = useNavigation<DriverPersonalDetailsScreenNavigationProp>();
  const route = useRoute<DriverPersonalDetailsScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const rawPhone = route.params?.phoneNumber || '';

  // Form state matching backend registerDriverSchema
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(`+91 ${rawPhone}`);
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real Profile Photo URI
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPhotoSource = async (source: 'camera' | 'gallery') => {
    setIsUploadingPhoto(true);
    try {
      let uri: string | null = null;
      if (source === 'camera') {
        uri = await pickFromCamera();
      } else {
        uri = await pickFromGallery();
      }

      if (uri) {
        setProfilePhotoUri(uri);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsUploadingPhoto(false);
      setIsPhotoModalVisible(false);
    }
  };

  const handleContinue = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters)');
      return;
    }

    const cleanedPhoneDigits = phone.replace(/[^0-9]/g, '');
    if (cleanedPhoneDigits.length < 10) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }

    if (!address.trim() || address.trim().length < 3) {
      setErrorMsg('Please enter your full address (at least 3 characters)');
      return;
    }

    if (!emergencyContact.trim() || emergencyContact.trim().length < 3) {
      setErrorMsg('Please enter an emergency contact number (at least 3 characters)');
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const fullAddress = address.trim();
      const formattedPhone = cleanedPhoneDigits.length === 10
        ? `+91${cleanedPhoneDigits}`
        : `+${cleanedPhoneDigits}`;

      const cachedDeviceToken = storageService.getString('device_token');

      const resultAction = await dispatch(
        registerDriver({
          name: fullName.trim(),
          phone: formattedPhone,
          address: fullAddress,
          emergencyContact: emergencyContact.trim(),
          email: email.trim() || undefined,
          gender: (gender as 'male' | 'female' | 'other') || undefined,
          profileImageUri: profilePhotoUri || undefined,
          deviceToken: cachedDeviceToken || undefined,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        })
      );

      if (registerDriver.fulfilled.match(resultAction)) {
        notificationService.syncDeviceToken();
        const respData = resultAction.payload;
        const user = respData?.data?.user || respData?.user;
        const driver = respData?.data?.driver || respData?.driver;

        navigation.navigate('DriverServiceSelect', {
          driverData: {
            fullName: user?.name || fullName.trim(),
            phoneNumber: user?.phone || phone.trim(),
            profilePhotoUri: user?.profileImage || profilePhotoUri || undefined,
            address: address.trim(),
            emergencyContact: emergencyContact.trim(),
            email: user?.email || (email.trim() || undefined),
            gender: (user?.gender as any) || (gender || undefined),
            driverId: driver?.id,
            userId: user?.id,
            pin: respData?.data?.pin || respData?.pin,
          },
        });
      } else {
        const errorText = (resultAction.payload as string) || '';
        // If user is already registered in DB, navigate forward with current data
        if (errorText.toLowerCase().includes('already registered')) {
          navigation.navigate('DriverServiceSelect', {
            driverData: {
              fullName: fullName.trim(),
              phoneNumber: phone,
              profilePhotoUri: profilePhotoUri || undefined,
              address: address.trim(),
              emergencyContact: emergencyContact.trim(),
              email: email.trim() || undefined,
              gender: (gender as any) || undefined,
            },
          });
        } else {
          setErrorMsg(errorText || 'Registration failed. Please check your inputs and try again.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

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

            {/* Header / Avatar Badge */}
            <View className="items-center mt-2">
              <View className="mb-3">
                {profilePhotoUri ? (
                  <View
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 38,
                      borderWidth: 2.5,
                      borderColor: colors.primary,
                      overflow: 'hidden',
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      source={{ uri: profilePhotoUri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <ProfileBadgeIcon size={68} />
                )}
              </View>
              <Text style={{ color: colors.text }} className="text-2xl font-extrabold text-center">
                Tell us about yourself
              </Text>
            </View>

            {/* Form Fields Container */}
            <View className="w-full mt-6 space-y-4">
              {/* 1. Full Name */}
              <View className="mb-3">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Full Name
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-3"
                >
                  <UserInputIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={fullName}
                    onChangeText={(val) => {
                      setFullName(val);
                      setErrorMsg('');
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textMuted}
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {/* 2. Mobile Number */}
              <View className="mb-3">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Mobile Number
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-3"
                >
                  <PhoneInputIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 98XXXXXX21"
                    placeholderTextColor={colors.textMuted}
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                    editable={true}
                  />
                </View>
              </View>

              {/* 3. Email Address (Optional - from backend registerDriverSchema) */}
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-2 ml-1">
                  <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
                    Email Address
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium">
                    Optional
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-3"
                >
                  <MailInputIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      setErrorMsg('');
                    }}
                    placeholder="e.g. driver@gaadimitra.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {/* 4. Gender (Optional - from backend registerDriverSchema) */}
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-2 ml-1">
                  <View className="flex-row items-center">
                    <GenderInputIcon size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold ml-1.5">
                      Gender
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium">
                    Optional
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {(['male', 'female', 'other'] as const).map((item) => {
                    const isSelected = gender === item;
                    const label = item.charAt(0).toUpperCase() + item.slice(1);
                    return (
                      <TouchableOpacity
                        key={item}
                        activeOpacity={0.75}
                        onPress={() => {
                          setGender(isSelected ? '' : item);
                          setErrorMsg('');
                        }}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          borderWidth: 1.5,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected
                            ? (isDark ? 'rgba(59, 130, 246, 0.25)' : '#EFF6FF')
                            : colors.inputBg,
                          borderColor: isSelected ? colors.primary : colors.inputBorder,
                          marginRight: item !== 'other' ? 8 : 0,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.primary : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          }}
                          className="text-xs"
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. Profile Photo Upload Card */}
              <View className="mb-3">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Profile Photo
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsPhotoModalVisible(true)}
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }}
                  className="flex-row items-center justify-between border rounded-xl p-3"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        overflow: 'hidden',
                      }}
                    >
                      {profilePhotoUri ? (
                        <Image
                          source={{ uri: profilePhotoUri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <CameraPhotoIcon size={20} color={colors.primary} />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: colors.text }} className="text-sm font-semibold">
                        {profilePhotoUri ? 'Photo Selected ✓' : 'Upload Photo'}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-[11px] mt-1">
                        {profilePhotoUri ? 'Tap to change photo' : 'JPG, PNG up to 5MB'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.textMuted }} className="text-lg font-bold mr-1">›</Text>
                </TouchableOpacity>
              </View>

              {/* 4. Address */}
              <View className="mb-3">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Address
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-3"
                >
                  <HomeAddressIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter your full address"
                    placeholderTextColor={colors.textMuted}
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {/* 6. Emergency Contact */}
              <View className="mb-3">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2 ml-1">
                  Emergency Contact
                </Text>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  }}
                  className="flex-row items-center border rounded-xl px-4 py-3"
                >
                  <PhoneInputIcon size={18} color={colors.textMuted} />
                  <TextInput
                    value={emergencyContact}
                    onChangeText={setEmergencyContact}
                    placeholder="Enter emergency contact number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    style={{ color: colors.text }}
                    className="flex-1 text-sm font-medium ml-3 p-0"
                  />
                </View>
              </View>

              {errorMsg ? (
                <Text className="text-rose-500 text-xs ml-1">{errorMsg}</Text>
              ) : null}
            </View>

            {/* Bottom Continue Button */}
            <View className="w-full mt-6 pt-2">
              <TouchableOpacity
                activeOpacity={0.88}
                disabled={isSubmitting || isAuthLoading}
                onPress={handleContinue}
                style={{ backgroundColor: (isSubmitting || isAuthLoading) ? '#94A3B8' : colors.primary }}
                className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-500/25"
              >
                {(isSubmitting || isAuthLoading) ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-white font-bold text-base ml-2">
                      Registering Driver...
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text className="text-white font-bold text-base mr-2">
                      Register & Continue
                    </Text>
                    <ArrowRightIcon size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Profile Photo Picker Modal with Permission Prompt */}
      <Modal
        visible={isPhotoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={{ backgroundColor: colors.modalBackdrop }} className="flex-1 justify-end">
          <View style={{ backgroundColor: colors.surface }} className="rounded-t-3xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-3">
              <Text style={{ color: colors.text }} className="text-lg font-bold">
                Upload Profile Photo
              </Text>
              <TouchableOpacity
                onPress={() => setIsPhotoModalVisible(false)}
                className="p-1"
              >
                <Text style={{ color: colors.textMuted }} className="text-base font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Permission explanation banner */}
            <View
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
              }}
              className="border rounded-xl p-3 mb-4 flex-row items-center"
            >
              <ShieldLockIcon size={18} color={colors.primary} />
              <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium ml-2 flex-1 leading-4">
                Please allow camera or storage permission to capture and upload your profile photo.
              </Text>
            </View>

            {isUploadingPhoto ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mt-3">
                  Requesting permission & opening photo...
                </Text>
              </View>
            ) : (
              <View className="space-y-3 pt-1">
                {/* 1. Camera with Permission */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectPhotoSource('camera')}
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
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  >
                    <CameraPhotoIcon size={20} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold">
                      Take Photo with Camera
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
                      Allow camera access & take live picture
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted }} className="font-bold text-base">›</Text>
                </TouchableOpacity>

                {/* 2. Gallery with Permission */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectPhotoSource('gallery')}
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }}
                  className="flex-row items-center border rounded-xl p-4 mt-2"
                >
                  <View className="w-10 h-10 rounded-full bg-emerald-500/15 items-center justify-center mr-4">
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#10B981" strokeWidth="2" />
                      <Circle cx="8.5" cy="8.5" r="1.5" fill="#10B981" />
                      <Path d="M21 15L16 10L5 21" stroke="#10B981" strokeWidth="2" />
                    </Svg>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold">
                      Choose from Gallery
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
                      Allow photo access & select from storage
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted }} className="font-bold text-base">›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export const DriverPersonalDetailsScreen = PersonalDetailsScreen;
export default PersonalDetailsScreen;
