import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { DriverPhoneLoginScreenNavigationProp } from '../types/navigation';
import {
  BackArrowIcon,
  PhoneBadgeIcon,
  ArrowRightIcon,
  ShieldLockIcon,
  IndiaFlagIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendOtp, clearAuthError } from '../store/slices/authSlice';
import { storageService } from '../services/storage';
import { isAccessTokenExpired } from '../utils/token';

export const PhoneLoginScreen: React.FC = () => {
  const navigation = useNavigation<DriverPhoneLoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error: authError } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = storageService.getString('auth_token');
    const refreshToken = storageService.getString('refresh_token');
    const hasValidSession =
      Boolean(token && !isAccessTokenExpired(token)) ||
      Boolean(refreshToken && !isAccessTokenExpired(refreshToken));

    if (hasValidSession) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'DriverHome', params: {} }],
      });
    }
  }, [navigation]);

  const handlePhoneChange = (text: string) => {
    // Only allow digits and max 10
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    if (errorMessage) setErrorMessage('');
    if (authError) dispatch(clearAuthError());
  };

  const handleContinue = async () => {
    if (phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const resultAction = await dispatch(
        sendOtp({
          phone: phoneNumber,
          role: 'driver',
        })
      );

      if (sendOtp.fulfilled.match(resultAction)) {
        navigation.navigate('DriverVerifyOtp', {
          phoneNumber,
          countryCode: '+91',
        });
      }
    } catch (err) {
      console.warn('sendOtp failed:', err);
    }
  };

  const displayError = errorMessage || authError;
  const isButtonEnabled = phoneNumber.length === 10 && !isLoading;


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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-2 pb-6 justify-between">
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

            {/* Center Content: Icon + Titles */}
            <View className="items-center mt-6">
              {/* Phone Badge Icon */}
              <View className="mb-6">
                <PhoneBadgeIcon size={76} />
              </View>

              {/* Heading */}
              <Text style={{ color: colors.text }} className="text-[26px] font-extrabold text-center leading-8">
                Create your{'\n'}driver account
              </Text>

              {/* Subheading */}
              <Text style={{ color: colors.textMuted }} className="text-sm text-center mt-2 font-normal">
                Enter your mobile number to continue.
              </Text>

              {/* Single Unified Mobile Input Box */}
              <View
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                }}
                className="w-full mt-8 flex-row items-center border rounded-xl px-4 py-3"
              >
                {/* Indian Flag + Country Code */}
                <View style={{ borderRightColor: colors.borderLight }} className="flex-row items-center pr-3 border-r mr-3">
                  <View className="mr-2 shadow-sm">
                    <IndiaFlagIcon width={22} height={15} />
                  </View>
                  <Text style={{ color: colors.text }} className="text-base font-bold mr-1">
                    +91
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-[10px]">▼</Text>
                </View>

                {/* Number TextInput */}
                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter mobile number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  style={{ color: colors.text }}
                  className="flex-1 text-base font-medium p-0"
                  autoFocus={true}
                />
                {phoneNumber.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setPhoneNumber('')}
                    className="p-1 ml-1"
                  >
                    <Text style={{ color: colors.textMuted }} className="font-bold text-xs">✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {displayError ? (
                <Text className="text-rose-500 text-xs mt-2 self-start pl-1">
                  {displayError}
                </Text>
              ) : null}
            </View>

            {/* Bottom Button & Legal Disclaimer */}
            <View className="w-full mt-auto pt-8">
              {/* Primary Continue Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleContinue}
                disabled={!isButtonEnabled}
                style={{
                  backgroundColor: colors.primary,
                  opacity: isButtonEnabled ? 1 : 0.6,
                }}
                className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-500/25"
              >
                {isLoading ? (
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


              {/* Terms and Privacy Footer */}
              <View className="flex-row items-center justify-center mt-5 px-4">
                <ShieldLockIcon size={16} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted }} className="text-xs ml-2 text-center leading-4 font-normal">
                  By continuing, you agree to our{' '}
                  <Text style={{ color: colors.text }} className="font-bold underline">
                    Terms & Privacy Policy.
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const DriverPhoneLoginScreen = PhoneLoginScreen;
export default PhoneLoginScreen;
