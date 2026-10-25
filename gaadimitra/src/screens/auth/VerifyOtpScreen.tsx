import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  VerifyOtpScreenNavigationProp,
  VerifyOtpScreenRouteProp,
} from '../../types/navigation';
import { HeaderBar } from '../../components/common/HeaderBar';
import { ShieldCheckBadgeIcon, AlertCircleIcon, LockIcon } from '../../assets/icons/Icons';
import { Button } from '../../components/common/Button';
import { OtpInput } from '../../components/common/OtpInput';
import { toast } from '../../components/common/ToastNotification';
import { useTheme } from '../../theme';
import { storageService } from '../../services/storage';
import { notificationService } from '../../services/notificationService';
import {
  useAppDispatch,
  useAppSelector,
  verifyOtp,
  sendOtp,
  clearError,
} from '../../store';

export const VerifyOtpScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<VerifyOtpScreenNavigationProp>();
  const route = useRoute<VerifyOtpScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error: reduxError, devOtp: storeDevOtp } = useAppSelector(
    (state) => state.auth
  );

  const rawPhone = route.params?.phoneNumber || '9876543210';
  const countryCode = route.params?.countryCode || '+91';
  const initialDevOtp = (route.params?.devOtp || storeDevOtp) ?? undefined;

  // Format masked phone number: e.g. +91 98XXXXXX21
  const maskedPhone = `${countryCode} ${rawPhone.slice(0, 2)}XXXXXX${rawPhone.slice(-2)}`;

  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [activeDevOtp, setActiveDevOtp] = useState<string | undefined>(initialDevOtp);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Live countdown timer for OTP resend
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setLocalError('Please enter all 6 digits of the verification code');
      return;
    }

    setLocalError(null);
    const fullPhone = `${countryCode}${rawPhone}`;

    try {
      const deviceToken = await notificationService.getDeviceToken().catch(() => null);

      await dispatch(
        verifyOtp({
          phone: fullPhone,
          otp,
          role: 'user',
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          deviceToken: deviceToken || undefined,
        })
      ).unwrap();

      // Ensure /auth/device-token is synced
      notificationService.syncDeviceToken().catch(() => {});

      storageService.setString('has_completed_onboarding', 'true');

      navigation.navigate('LocationPermission', {
        phoneNumber: rawPhone,
      });
    } catch (err: any) {
      const message = typeof err === 'string' ? err : err?.message || 'Invalid or expired OTP. Please try again.';
      setLocalError(message);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isLoading) return;
    setOtp('');
    setLocalError(null);
    dispatch(clearError());

    const fullPhone = `${countryCode}${rawPhone}`;

    try {
      const result = await dispatch(
        sendOtp({
          phone: fullPhone,
          role: 'user',
        })
      ).unwrap();

      setTimer(result.cooldownSeconds || 60);
      if (result.devOtp) {
        setActiveDevOtp(result.devOtp);
      }
      toast.showSuccess(
        `A new 6-digit OTP has been sent to ${maskedPhone}`,
        'OTP Resent'
      );
    } catch (err: any) {

      const message = typeof err === 'string' ? err : err?.message || 'Failed to resend OTP.';
      setLocalError(message);
      toast.showError(message, 'Failed to Resend OTP');
    }
  };

  const handleAutofillDevOtp = () => {
    if (activeDevOtp) {
      setOtp(activeDevOtp);
      setLocalError(null);
    }
  };

  const displayError = localError || reduxError;

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header */}
      <HeaderBar onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
            justifyContent: 'space-between',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Shield Check Badge */}
            <View className="items-center mt-4 mb-6">
              <ShieldCheckBadgeIcon size={72} />
            </View>

            {/* Header Text */}
            <View className="items-center mb-4">
              <Text style={{ color: colors.text }} className="text-2xl font-extrabold tracking-tight text-center">
                Verify your number
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm font-normal text-center mt-1.5 leading-relaxed">
                Enter the 6-digit OTP sent to{'\n'}
                <Text style={{ color: colors.text }} className="font-bold">{maskedPhone}</Text>
              </Text>
            </View>

            {/* 6-Digit OTP Box Inputs */}
            <OtpInput
              length={6}
              value={otp}
              onChangeOtp={(val) => {
                setOtp(val);
                if (localError) setLocalError(null);
                if (reduxError) dispatch(clearError());
              }}
              disabled={isLoading}
            />

            {/* Dev Mode OTP Quick Autofill helper */}
            {activeDevOtp ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAutofillDevOtp}
                style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}40` }}
                className="flex-row items-center justify-center self-center px-3 py-1.5 rounded-full border mb-4"
              >
                <LockIcon size={14} color={colors.primary} />
                <Text style={{ color: colors.primary }} className="text-xs font-bold ml-1.5">
                  Dev OTP: {activeDevOtp} (Tap to autofill)
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Error Message */}
            {displayError && (
              <View className="flex-row items-center justify-center -mt-2 mb-4">
                <AlertCircleIcon size={14} color={colors.error} />
                <Text style={{ color: colors.error }} className="text-xs ml-1.5 font-medium">
                  {displayError}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="space-y-3 mt-2">
              {/* Primary Verify CTA */}
              <Button
                title="Verify & Continue"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading || otp.length < 6}
                onPress={handleVerify}
                className="w-full shadow-md"
              />

              {/* Resend OTP Button */}
              <View className="mt-3">
                <Button
                  title="Resend OTP"
                  variant="outline"
                  size="md"
                  disabled={timer > 0 || isLoading}
                  onPress={handleResend}
                  className="w-full"
                />
              </View>

              {/* Resend Timer Notice */}
              <View className="items-center justify-center py-4">
                {timer > 0 ? (
                  <Text style={{ color: colors.placeholder }} className="text-xs font-medium">
                    Resend in <Text style={{ color: colors.primary }} className="font-bold">{timer}s</Text>
                  </Text>
                ) : (
                  <Text style={{ color: colors.primary }} className="text-xs font-semibold">
                    Didn't receive code? Tap Resend OTP above
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
