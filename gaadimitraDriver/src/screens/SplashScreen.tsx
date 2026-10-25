import React, { useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SplashScreenNavigationProp } from '../types/navigation';
import { useTheme } from '../theme';
import { storageService } from '../services/storage';
import { apiClient } from '../services/api';
import { isAccessTokenExpired } from '../utils/token';
import { notificationService } from '../services/notificationService';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { colors } = useTheme();

  const navigateNext = async () => {
    const token = storageService.getString('auth_token');
    const refreshToken = storageService.getString('refresh_token');

    const isTokenValid = Boolean(token && !isAccessTokenExpired(token));
    console.log('🔍 [SplashScreen] accessToken exists:', !!token, 'valid:', isTokenValid);

    // 1. If accessToken is still valid and not expired -> directly login to DriverHome
    if (isTokenValid) {
      notificationService.syncDeviceToken();
      navigation.reset({
        index: 0,
        routes: [{ name: 'DriverHome', params: {} }],
      });
      return;
    }

    // 2. If accessToken is expired or missing, attempt refresh using refreshToken
    if (refreshToken && !isAccessTokenExpired(refreshToken)) {
      console.log('🔄 [SplashScreen] Access token expired, refreshing with refreshToken...');
      try {
        const refreshed = await apiClient.refreshToken();
        if (refreshed?.accessToken) {
          console.log('✅ [SplashScreen] Token refreshed successfully, navigating to DriverHome');
          notificationService.syncDeviceToken();
          navigation.reset({
            index: 0,
            routes: [{ name: 'DriverHome', params: {} }],
          });
          return;
        }
      } catch (err) {
        console.warn('❌ [SplashScreen] Token refresh failed:', err);
      }
    }

    // 3. Both tokens missing or expired -> clear session & go to Onboarding
    if (token || refreshToken) {
      storageService.delete('auth_token');
      storageService.delete('refresh_token');
      storageService.delete('user_data');
      storageService.delete('driver_data');
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'DriverOnboarding' }],
    });
  };

  useEffect(() => {
    const token = storageService.getString('auth_token');
    const refreshToken = storageService.getString('refresh_token');
    const hasPossibleSession = Boolean(
      (token && !isAccessTokenExpired(token)) ||
      (refreshToken && !isAccessTokenExpired(refreshToken))
    );

    // If user has a valid access token or refresh token, transition directly after brief splash
    const timer = setTimeout(() => {
      navigateNext();
    }, hasPossibleSession ? 600 : 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const handlePress = () => {
    navigateNext();
  };

  return (
    <ImageBackground
      source={require('../assets/images/image-1.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          className="flex-1 justify-between items-center px-6 pt-10 pb-6"
        >
          {/* Center Branding Area */}
          <View className="items-center mt-12">
            {/* Logo */}
            <View className="shadow-lg shadow-black/20">
              <Image
                source={require('../assets/icons/logo-white.png')}
                style={{ width: 84, height: 84 }}
                resizeMode="contain"
              />
            </View>

            {/* Brand Name */}
            <Text className="text-3xl font-extrabold text-white tracking-tight mt-4">
              Gaadimitra
            </Text>

            {/* DRIVER Pill Badge */}
            <View className="mt-2 bg-white px-4 py-1 rounded-full shadow-sm">
              <Text style={{ color: colors.primary }} className="font-black text-xs tracking-widest">
                DRIVER
              </Text>
            </View>

            {/* Tagline / Subtitles */}
            <View className="mt-6 items-center">
              <Text className="text-white font-semibold text-base tracking-wide text-center">
                Drive more.
              </Text>
              <Text className="text-blue-100 font-medium text-sm text-center mt-1">
                Get genuine local enquiries.
              </Text>
            </View>
          </View>


        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

export const DriverSplashScreen = SplashScreen;
export default SplashScreen;
