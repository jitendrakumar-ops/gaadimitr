import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SplashScreenNavigationProp } from '../../types/navigation';
import { SplashIllustration } from '../../components/illustrations/SplashIllustration';
import { useAppDispatch } from '../../store';
import { checkAuthSession } from '../../store/slices/authSlice';
import { storageService } from '../../services/storage';
import { authService, isTokenExpired } from '../../services/authService';
import { notificationService } from '../../services/notificationService';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const runAuthCheckAndNavigate = async () => {
      // 1. Min splash duration for smooth logo animation
      const minTimerPromise = new Promise((resolve) => setTimeout(() => resolve(true), 1400));

      // 2. Call live backend /api/v1/users/me check
      const authCheckPromise = dispatch(checkAuthSession());

      // Wait for both timer and backend profile check
      const [, authResult] = await Promise.all([minTimerPromise, authCheckPromise]);

      if (!isMounted || hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      // Check if backend confirmed valid profile
      if (checkAuthSession.fulfilled.match(authResult)) {
        if (__DEV__) {
          console.log('✅ [Splash] Active session confirmed by /users/me. Navigating to HomeDashboard.');
        }
        // Save FCM device token to /auth/device-token
        notificationService.syncDeviceToken().catch(() => {});

        navigation.replace('HomeDashboard', {
          user: authResult.payload,
        });
      } else {
        // Backend call failed (network error / server down).
        // Fallback: if stored tokens are still valid, keep user logged in (offline-first).
        const stored = authService.getStoredAuth();
        if (stored.accessToken && stored.user && !isTokenExpired(stored.accessToken)) {
          if (__DEV__) {
            console.log('⚡ [Splash] Network check failed but stored session valid. Navigating to HomeDashboard.');
          }
          // Save FCM device token to /auth/device-token
          notificationService.syncDeviceToken().catch(() => {});

          navigation.replace('HomeDashboard', {
            user: stored.user,
          });
        } else {
          if (__DEV__) {
            console.log('ℹ️ [Splash] No valid session found. Navigating to login/onboarding.');
          }
          const hasCompletedOnboarding =
            storageService.getString('has_completed_onboarding') === 'true';
          if (hasCompletedOnboarding) {
            navigation.replace('PhoneLogin');
          } else {
            navigation.replace('Onboarding');
          }
        }
      }
    };

    runAuthCheckAndNavigate();

    return () => {
      isMounted = false;
    };
  }, [navigation, dispatch]);

  const handleSkip = () => {
    // If user taps screen early, let the flow complete
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-600 justify-between">
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleSkip}
        className="flex-1 justify-between py-12 px-6"
      >
        {/* Top Header / Brand Emblem */}
        <View className="items-center mt-12">
          {/* Circular Logo Emblem from Assets */}
          <View className="mb-4 w-20 h-20 rounded-full bg-white items-center justify-center overflow-hidden border-2 border-white/30">
            <Image
              source={require('../../assets/icons/logo.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Brand Name */}
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            Gaadimitra
          </Text>

          {/* Subtitle / Tagline */}
          <Text className="text-sm font-medium text-blue-100 text-center mt-2 leading-relaxed max-w-[240px]">
            Find a ride. Talk directly.{'\n'}Ride your way.
          </Text>
        </View>

        {/* Skyline & Driving Car Illustration */}
        <View className="items-center justify-center my-6">
          <SplashIllustration width={320} height={140} />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
