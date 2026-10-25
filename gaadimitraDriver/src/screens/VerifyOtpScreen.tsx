import React, { useState, useRef, useEffect } from 'react';
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
  DriverVerifyOtpScreenNavigationProp,
  DriverVerifyOtpScreenRouteProp,
} from '../types/navigation';
import {
  BackArrowIcon,
  VerifyBadgeIcon,
  RefreshOtpIcon,
  ClockTimerIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendOtp, verifyOtp, clearVerifyError } from '../store/slices/authSlice';
import { storageService } from '../services/storage';
import { isAccessTokenExpired } from '../utils/token';
import { notificationService } from '../services/notificationService';

export const VerifyOtpScreen: React.FC = () => {
  const navigation = useNavigation<DriverVerifyOtpScreenNavigationProp>();
  const route = useRoute<DriverVerifyOtpScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { isVerifying, verifyError } = useAppSelector((state) => state.auth);
  const { colors, isDark } = useTheme();
  const rawPhone = route.params?.phoneNumber || '-';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(58);
  const [isResendActive, setIsResendActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const token = storageService.getString('auth_token');
    if (token && !isAccessTokenExpired(token)) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'DriverHome', params: {} }],
      });
    }
  }, [navigation]);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendActive(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (errorMsg) setErrorMsg('');
    if (verifyError) dispatch(clearVerifyError());
    const newOtp = [...otp];

    // Handle multi-character paste (e.g. 6 digits paste)
    if (value.length > 1) {
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit input
    const cleanDigit = value.replace(/[^0-9]/g, '');
    newOtp[index] = cleanDigit;
    setOtp(newOtp);

    // Auto move to next input if digit entered
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP');
      return;
    }

    try {
      const resultAction = await dispatch(
        verifyOtp({
          phone: rawPhone,
          otp: fullOtp,
          role: 'driver',
        })
      );

      if (verifyOtp.fulfilled.match(resultAction)) {
        // Driver already registered & verified: Open Home page directly!
        dispatch(clearVerifyError());
        setErrorMsg('');
        notificationService.syncDeviceToken();
        navigation.reset({
          index: 0,
          routes: [{ name: 'DriverHome', params: {} }],
        });
      } else if (verifyOtp.rejected.match(resultAction)) {
        const payload = resultAction.payload;
        const errorCode = payload?.code;
        const errorText = payload?.message || '';

        // If user is not registered yet in the backend, open Personal Details to complete registration
        if (
          errorCode === 'USER_NOT_FOUND' ||
          errorText.toLowerCase().includes('not registered')
        ) {
          dispatch(clearVerifyError());
          setErrorMsg('');
          navigation.navigate('DriverPersonalDetails', {
            phoneNumber: rawPhone,
          });
        } else {
          setErrorMsg(errorText || 'Failed to verify OTP. Please try again.');
        }
      }
    } catch (err) {
      console.warn('verifyOtp failed:', err);
    }
  };


  const handleResend = async () => {
    if (!isResendActive) return;
    try {
      await dispatch(sendOtp({ phone: rawPhone, role: 'driver' })).unwrap();
    } catch (err: any) {
      setErrorMsg(err || 'Failed to resend OTP');
    }
    setTimer(30);
    setIsResendActive(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };


  const isComplete = otp.join('').length === 6;

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

            {/* Center Content */}
            <View className="items-center mt-6">
              {/* Verify Badge Icon */}
              <View className="mb-6">
                <VerifyBadgeIcon size={76} />
              </View>

              {/* Title */}
              <Text style={{ color: colors.text }} className="text-[26px] font-extrabold text-center tracking-tight">
                Verify your number
              </Text>

              {/* Subtitle */}
              <Text style={{ color: colors.textMuted }} className="text-sm text-center mt-2 leading-5">
                Enter the 6-digit OTP sent to{'\n'}your mobile number.
              </Text>

              {/* 6-Digit OTP Boxes */}
              <View className="w-full flex-row justify-between items-center mt-8 px-1">
                {otp.map((digit, index) => {
                  const isFocused =
                    otp.findIndex((d) => d === '') === index ||
                    (otp.every((d) => d !== '') && index === 5);

                  return (
                    <View
                      key={index}
                      style={{
                        borderColor: digit
                          ? colors.primary
                          : isFocused
                            ? colors.primary
                            : colors.border,
                        backgroundColor: digit
                          ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                          : isFocused
                            ? colors.surface
                            : colors.surfaceSecondary,
                      }}
                      className="w-[48px] h-[54px] rounded-xl border items-center justify-center"
                    >
                      <TextInput
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus={true}
                        autoFocus={index === 0}
                        style={{ color: colors.text }}
                        className="w-full h-full text-center text-xl font-bold"
                      />
                    </View>
                  );
                })}
              </View>

              {errorMsg || verifyError ? (
                <Text className="text-rose-500 text-xs mt-3 text-center">
                  {errorMsg || verifyError}
                </Text>
              ) : null}
            </View>

            {/* Bottom Actions */}
            <View className="w-full mt-auto pt-8">
              {/* Verify & Continue Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleVerify}
                disabled={!isComplete || isVerifying}
                style={{
                  backgroundColor: colors.primary,
                  opacity: isComplete && !isVerifying ? 1 : 0.6,
                }}
                className="w-full py-4 px-6 rounded-xl items-center justify-center shadow-md"
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Verify & Continue
                  </Text>
                )}
              </TouchableOpacity>


              {/* Resend OTP Outline Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResend}
                disabled={!isResendActive}
                style={{
                  backgroundColor: isResendActive ? colors.surface : colors.surfaceSecondary,
                  borderColor: colors.border,
                  opacity: isResendActive ? 1 : 0.6,
                }}
                className="w-full py-3.5 px-6 rounded-xl border mt-3 flex-row items-center justify-center"
              >
                <RefreshOtpIcon size={16} color={colors.primary} />
                <Text style={{ color: colors.primary }} className="font-semibold text-sm ml-2">
                  Resend OTP
                </Text>
              </TouchableOpacity>

              {/* Resend Timer Text */}
              <View className="flex-row items-center justify-center mt-4">
                <ClockTimerIcon size={14} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted }} className="text-xs ml-2 font-medium">
                  {timer > 0 ? `Resend in ${timer}s` : 'You can resend now'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const DriverVerifyOtpScreen = VerifyOtpScreen;
export default VerifyOtpScreen;
