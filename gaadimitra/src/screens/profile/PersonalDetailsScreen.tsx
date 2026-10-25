import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CameraBadgeIcon, CheckCircleIcon } from '../../assets/icons/Icons';
import { HeaderBar } from '../../components/common/HeaderBar';
import { useTheme } from '../../theme';
import { confirmDialog } from '../../components/common/CustomAlertModal';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  updateProfile,
  uploadProfileImage,
  checkAuthSession,
} from '../../store/slices/authSlice';
import { storageService } from '../../services/storage';
import { toast } from '../../components/common/ToastNotification';

export const PersonalDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Form states initialized with live user data
  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNumber] = useState(user?.phone || user?.phoneNumber || '+91 XXXXX XXXXX');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [city, setCity] = useState(storageService.getString('user_city') || 'Patna, Bihar');

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Sync state whenever Redux user updates
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.gender) {
        const g = user.gender.toLowerCase();
        if (g === 'female') setGender('Female');
        else if (g === 'other') setGender('Other');
        else setGender('Male');
      }
    }
  }, [user]);

  // Fetch latest profile from backend on screen load
  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  // Handle Photo Picker
  const handlePhotoOptions = () => {
    confirmDialog.showOptions({
      title: 'Change Profile Photo',
      message: 'Select a photo source',
      icon: 'camera',
      options: [
        {
          text: 'Take Photo',
          onPress: openCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {},
        },
      ],
    });
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        saveToPhotos: false,
      });
      processImageSelection(result);
    } catch (err: any) {
      toast.showError(err.message || 'Unable to access camera', 'Camera Error');
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1,
      });
      processImageSelection(result);
    } catch (err: any) {
      toast.showError(err.message || 'Unable to open photo gallery', 'Gallery Error');
    }
  };

  const processImageSelection = async (result: any) => {
    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.uri) {
      toast.showError('Invalid photo selected', 'Error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await dispatch(
        uploadProfileImage({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
        })
      ).unwrap();

      toast.showSuccess('Profile photo updated successfully!', 'Success');
    } catch (err: any) {
      toast.showError(err || 'Failed to upload profile photo', 'Upload Failed');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle Save Personal Details
  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast.showError('Please enter your full name.', 'Required Field');
      return;
    }

    setIsSaving(true);
    try {
      // Save city locally
      storageService.setString('user_city', city.trim());

      // Update name, email, gender on backend
      await dispatch(
        updateProfile({
          name: trimmedName,
          email: email.trim() || null,
          gender: gender.toLowerCase() as 'male' | 'female' | 'other',
        })
      ).unwrap();

      toast.showSuccess('Your personal details have been updated successfully.', 'Success');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err || 'Failed to update personal details. Please try again.', 'Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const profileImageUrl = user?.profileImage;

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Navigation Bar */}
      <HeaderBar
        onBackPress={() => navigation.goBack()}
        title="Personal Details"
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Edit Section */}
          <View className="items-center mb-6">
            <View className="relative">
              <View
                style={{
                  borderColor: colors.primary,
                  backgroundColor: colors.surface,
                }}
                className="w-24 h-24 rounded-full overflow-hidden border-2 items-center justify-center"
              >
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('../../assets/images/driver_rahul.jpg')}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                )}

                {/* Uploading loading overlay */}
                {isUploadingPhoto && (
                  <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-full">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isUploadingPhoto}
                onPress={handlePhotoOptions}
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.card,
                }}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 items-center justify-center shadow-md"
              >
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <CameraBadgeIcon size={14} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isUploadingPhoto}
              onPress={handlePhotoOptions}
            >
              <Text style={{ color: colors.primary }} className="text-xs font-bold mt-2">
                {isUploadingPhoto ? 'Uploading photo...' : 'Change Profile Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields Card */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="p-5 rounded-xl border mb-6 space-y-4"
          >
            {/* Full Name */}
            <View className="mb-4">
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-bold uppercase tracking-wider mb-1.5"
              >
                Full Name
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.placeholder}
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                className="border rounded-xl px-4 py-3 text-sm font-bold"
              />
            </View>

            {/* Phone Number (Verified) */}
            <View className="mb-4">
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-bold uppercase tracking-wider mb-1.5"
              >
                Phone Number
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="border rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text style={{ color: colors.text }} className="text-sm font-bold">
                  {phoneNumber}
                </Text>
                <View className="flex-row items-center px-2 py-0.5 rounded-full bg-emerald-100">
                  <CheckCircleIcon size={12} color="#059669" />
                  <Text className="text-[10px] font-extrabold text-emerald-700 ml-1">
                    Verified
                  </Text>
                </View>
              </View>
            </View>

            {/* Email Address */}
            <View className="mb-4">
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-bold uppercase tracking-wider mb-1.5"
              >
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email address"
                placeholderTextColor={colors.placeholder}
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                className="border rounded-xl px-4 py-3 text-sm font-bold"
              />
            </View>

            {/* Gender Selector */}
            <View className="mb-4">
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-bold uppercase tracking-wider mb-2"
              >
                Gender
              </Text>
              <View className="flex-row">
                {(['Male', 'Female', 'Other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    activeOpacity={0.75}
                    onPress={() => setGender(g)}
                    style={{
                      backgroundColor: gender === g ? `${colors.primary}18` : colors.input,
                      borderColor: gender === g ? colors.primary : colors.border,
                    }}
                    className="flex-1 py-2.5 rounded-xl border items-center justify-center mr-2"
                  >
                    <Text
                      style={{
                        color: gender === g ? colors.primary : colors.text,
                      }}
                      className="text-sm font-bold"
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* City / State */}
            <View>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs font-bold uppercase tracking-wider mb-1.5"
              >
                Primary City
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Enter your city"
                placeholderTextColor={colors.placeholder}
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                className="border rounded-xl px-4 py-3 text-sm font-bold"
              />
            </View>
          </View>

          {/* Save Changes Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isSaving}
            onPress={handleSave}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-3.5 rounded-xl items-center justify-center shadow-sm flex-row"
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white font-bold text-base tracking-wide ml-2">
                  Saving...
                </Text>
              </>
            ) : (
              <Text className="text-white font-bold text-base tracking-wide">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
