import React, { useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DriverOnboardingScreenNavigationProp } from '../types/navigation';
import {
  DriverHeaderLogo,
  ArrowRightIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import { storageService } from '../services/storage';
import { isAccessTokenExpired } from '../utils/token';

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<DriverOnboardingScreenNavigationProp>();
  const { colors, isDark } = useTheme();

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

  const handleGetStarted = () => {
    navigation.navigate('DriverPhoneLogin');
  };

  const handleLogin = () => {
    navigation.navigate('DriverPhoneLogin');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-4 pb-8 justify-between">
          {/* Top Header Logo & Direct Home Link */}
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center">
              <Image
                source={require('../assets/icons/logo.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
              <View className="flex-row items-center ml-2">
                <Text style={{ color: colors.primary }} className="text-xl font-black tracking-tight">
                  Gaadimitra
                </Text>
                <View style={{ backgroundColor: colors.primary }} className="ml-2 px-2 py-1 rounded">
                  <Text className="text-[10px] font-black text-white tracking-wider">
                    DRIVER
                  </Text>
                </View>
              </View>
            </View>


          </View>

          {/* Hero Title & Subtitle */}
          <View className="mt-8">
            <Text style={{ color: colors.text }} className="text-[28px] font-extrabold leading-[34px] tracking-tight">
              Turn your vehicle{'\n'}into opportunity.
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-sm font-normal mt-3 leading-5">
              List your vehicle, connect with nearby customers and decide your fare directly.
            </Text>
          </View>

          {/* Center Hero Character & Vehicles Illustration */}
          <View className="items-center justify-center my-6">
            <Image
              source={require('../assets/images/image-2.png')}
              style={{ width: Math.min(width - 32, 340), height: 190 }}
              resizeMode="contain"
            />
          </View>

          {/* Bottom Actions */}
          <View className="w-full mt-auto pt-4 space-y-2">
            {/* Get Started Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleGetStarted}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-500/25"
            >
              <Text className="text-white font-bold text-base mr-2">
                Get Started
              </Text>
              <ArrowRightIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>



            {/* Already registered? Login */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogin}
              className="w-full py-2 mt-1 items-center justify-center"
            >
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
                Already registered?{' '}
                <Text style={{ color: colors.primary }} className="font-bold">
                  Login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const DriverOnboardingScreen = OnboardingScreen;
export default OnboardingScreen;
