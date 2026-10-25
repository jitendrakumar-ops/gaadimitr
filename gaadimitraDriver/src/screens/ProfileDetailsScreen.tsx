import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ToastNotification, ToastType } from '../components/common/ToastNotification';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDriverProfile, setDriverProfile } from '../store/slices/driverSlice';
import { updateAuthProfile } from '../store/slices/authSlice';
import { UpdateProfilePayload } from '../types/auth';

export const ProfileDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();

  const { driverProfile } = useAppSelector((state) => state.driver);
  const authUser = useAppSelector((state) => state.auth.user);
  const authPhone = useAppSelector((state) => state.auth.phone);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Profile data states
  const [fullName, setFullName] = useState(
    driverProfile?.user?.name || driverProfile?.name || authUser?.name || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(
    driverProfile?.user?.phone || driverProfile?.user?.phoneNumber || driverProfile?.phone || authUser?.phone || authPhone || ''
  );
  const [email, setEmail] = useState(
    driverProfile?.user?.email || driverProfile?.email || authUser?.email || ''
  );
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [imageError, setImageError] = useState(false);

  const profileImage =
    driverProfile?.profileImage ||
    driverProfile?.user?.profileImage ||
    driverProfile?.profilePhoto ||
    authUser?.profileImage ||
    null;

  useEffect(() => {
    setImageError(false);
  }, [profileImage]);

  useEffect(() => {
    if (!driverProfile) {
      dispatch(fetchDriverProfile());
    }
  }, [dispatch, driverProfile]);

  useEffect(() => {

    setFullName(authUser?.name || driverProfile?.name || '');
    setPhoneNumber(authUser?.phone || authPhone || driverProfile?.phone || '');
    setEmail(authUser?.email || driverProfile?.email || '');

    const gen = driverProfile?.gender || authUser?.gender || '';
    if (gen) {
      const formatted = (gen.charAt(0).toUpperCase() + gen.slice(1).toLowerCase()) as 'Male' | 'Female' | 'Other';
      if (['Male', 'Female', 'Other'].includes(formatted)) {
        setGender(formatted);
      } else {
        setGender('');
      }
    } else {
      setGender('');
    }
  }, [driverProfile, authUser, authPhone]);

  // Draft values during edit
  const [editFullName, setEditFullName] = useState(fullName);
  const [editEmail, setEditEmail] = useState(email);
  const [editGender, setEditGender] = useState(gender);

  const handleStartEdit = () => {
    setEditFullName(fullName);
    setEditEmail(email);
    setEditGender(gender);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmedName = editFullName.trim();
    const trimmedEmail = editEmail.trim();

    if (!trimmedName) {
      showToast('Full Name cannot be empty.', 'error');
      return;
    }
    if (trimmedName.length < 2) {
      showToast('Full Name must be at least 2 characters.', 'error');
      return;
    }
    if (trimmedEmail && !trimmedEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: UpdateProfilePayload = {
        name: trimmedName,
        email: trimmedEmail || null,
        gender: editGender ? (editGender.toLowerCase() as 'male' | 'female' | 'other') : null,
      };

      const result = await dispatch(updateAuthProfile(payload)).unwrap();

      setFullName(trimmedName);
      setEmail(trimmedEmail);
      setGender(editGender);
      setIsEditing(false);

      dispatch(
        setDriverProfile({
          ...(driverProfile || {}),
          name: trimmedName,
          email: trimmedEmail || undefined,
          gender: editGender || undefined,
          user: {
            ...(driverProfile?.user || {}),
            name: trimmedName,
            email: trimmedEmail || undefined,
            gender: editGender || undefined,
          },
        })
      );

      showToast(result?.message || 'Profile details updated successfully!', 'success');
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Failed to update profile details.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerId =
    driverProfile?.partnerId ||
    driverProfile?.driverId ||
    (driverProfile?._id ? `GM-${String(driverProfile._id).slice(-6).toUpperCase()}` : '') ||
    (driverProfile?.id ? `GM-${String(driverProfile.id).slice(-6).toUpperCase()}` : '') ||
    '';



  const joiningDate =
    driverProfile?.createdAt
      ? new Date(driverProfile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '-';

  const rating =
    driverProfile?.rating
      ? `★ ${driverProfile.rating}${driverProfile?.totalRides ? ` (${driverProfile.totalRides} Rides)` : ''}`
      : '-';

  const initials = fullName.trim()
    ? fullName
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
    : '-';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="px-4 py-3 border-b flex-row items-center justify-between"
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
          My Profile
        </Text>

        {isEditing ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleCancelEdit}
            disabled={isSubmitting}
            style={{ backgroundColor: colors.surfaceSecondary }}
            className="px-3 py-1 rounded-full"
          >
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleStartEdit}
            style={{
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
            }}
            className="border px-3 py-1 rounded-full flex-row items-center"
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-1">
              <Path
                d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={{ color: colors.primary }} className="text-xs font-bold">Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Profile Identity Header Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 items-center"
        >
          <View className="relative mb-3">
            <View
              style={{
                height: 60,
                width: 60,
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                borderColor: colors.primary,
              }}
              className="rounded-full border-2 items-center justify-center overflow-hidden"
            >
              {profileImage && !imageError ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={{ color: colors.primary }} className="text-2xl font-black tracking-wider font-mono">
                  {initials}
                </Text>
              )}
            </View>
            <View
              style={{ borderColor: colors.surface }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 items-center justify-center"
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>

          <Text style={{ color: colors.text }} className="text-lg font-black tracking-tight">
            {fullName || '-'}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-1 font-mono">
            {phoneNumber || '-'}
          </Text>

          {partnerId ? (
            <View className="flex-row items-center mt-3">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="border px-3 py-1 rounded-lg mr-2"
              >
                <Text style={{ color: colors.primary }} className="text-xs font-bold">
                  Partner ID: {partnerId}
                </Text>
              </View>
              <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                <Text className="text-xs font-bold text-emerald-600">
                  100% e-KYC Compliant
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 2. Personal Details (Editable Mode & Display Mode) */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider">
              Personal Information
            </Text>

            {!isEditing && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleStartEdit}
                className="flex-row items-center"
              >
                <Text style={{ color: colors.primary }} className="text-xs font-bold">Edit Info ✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View className="space-y-4">
              {/* Full Name */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-1">
                  Full Legal Name
                </Text>
                <TextInput
                  value={editFullName}
                  onChangeText={setEditFullName}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }}
                  className="border rounded-xl px-3 py-3 text-xs font-semibold"
                />
              </View>

              {/* Email */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-1">
                  Email Address
                </Text>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter email address"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }}
                  className="border rounded-xl px-3 py-3 text-xs font-semibold"
                />
              </View>

              {/* Gender */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-2">
                  Gender
                </Text>
                <View className="flex-row space-x-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      activeOpacity={0.8}
                      onPress={() => setEditGender(g)}
                      style={{
                        backgroundColor: editGender === g
                          ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                          : colors.surfaceSecondary,
                        borderColor: editGender === g ? colors.primary : colors.border,
                      }}
                      className="flex-1 py-2 rounded-xl items-center border mr-2"
                    >
                      <Text
                        style={{
                          color: editGender === g ? colors.primary : colors.textSecondary,
                        }}
                        className="text-xs font-bold"
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-2 pt-2">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCancelEdit}
                  disabled={isSubmitting}
                  style={{ backgroundColor: colors.surfaceSecondary }}
                  className="flex-1 py-3 rounded-xl items-center justify-center mr-2"
                >
                  <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSaveEdit}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: colors.primary,
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  className="flex-1 py-3 rounded-xl items-center justify-center flex-row"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-xs font-bold text-white">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
                <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Full Legal Name</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">{fullName || '-'}</Text>
              </View>

              <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
                <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Email Address</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">{email || '-'}</Text>
              </View>

              <View className="flex-row justify-between py-2">
                <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Gender</Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold">{gender || '-'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* 3. Partner Experience & Metrics */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4"
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Partner Background
          </Text>

          <View className="space-y-3">
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Driving Experience</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{driverProfile?.experienceYears} Years</Text>
            </View>

            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Joined GaadiMitra</Text>
              <Text style={{ color: colors.text }} className="text-xs font-bold">{joiningDate}</Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Driver Rating</Text>
              <Text className="text-xs font-bold text-amber-500">{rating}</Text>
            </View>
          </View>
        </View>

        {/* 4. Security Trust Footnote */}
        <View
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          className="p-4 border rounded-xl flex-row items-center"
        >
          <View className="w-9 h-9 rounded-full bg-emerald-500/10 items-center justify-center mr-3">
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              Verified Partner Account
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs mt-1 leading-relaxed font-medium">
              Profile details are verified with Government of India Sarathi and Vahan portals.
            </Text>
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

export const DriverProfileDetailsScreen = ProfileDetailsScreen;
export default ProfileDetailsScreen;

