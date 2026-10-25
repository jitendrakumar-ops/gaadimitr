import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenNavigationProp } from '../../types/navigation';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../theme';
import { storageService } from '../../services/storage';

interface SlideItem {
  id: string;
  title: string;
  description: string;
  slideIndex: number;
  image: ImageSourcePropType;
}

export const OnboardingScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides: SlideItem[] = [
    {
      id: 'slide-1',
      slideIndex: 0,
      title: 'Your ride, your choice.',
      image: require('../../assets/images/3rd.png'),
      description:
        'Find nearby verified drivers, talk directly and agree on the fare that works for you.',
    },
    {
      id: 'slide-2',
      slideIndex: 1,
      title: 'Direct Negotiations.',
      image: require('../../assets/images/image2.png'),
      description:
        'Zero commission middleman fees. Negotiate transparently with local vehicle owners.',
    },
    {
      id: 'slide-3',
      slideIndex: 2,
      title: 'Reliable & Safe Travel.',
      image: require('../../assets/images/image3.png'),
      description:
        'Connect with verified drivers across Sedans, SUVs, 7-Seaters, and Travellers in seconds.',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / screenWidth);
    if (
      currentIndex !== activeSlide &&
      currentIndex >= 0 &&
      currentIndex < slides.length
    ) {
      setActiveSlide(currentIndex);
    }
  };

  const scrollToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setActiveSlide(index);
  };

  const handleGetStarted = () => {
    storageService.setString('has_completed_onboarding', 'true');
    navigation.reset({
      index: 0,
      routes: [{ name: 'PhoneLogin' }],
    });
  };

  const handleNextPress = () => {
    if (activeSlide < slides.length - 1) {
      scrollToSlide(activeSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header with Skip Action */}
      <View className="flex-row justify-end px-6 pt-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleGetStarted}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ backgroundColor: colors.surface }}
          className="py-1 px-3 rounded-full"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable FlatList Slider */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={screenWidth}
        snapToAlignment="center"
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
        renderItem={({ item }) => (
          <View
            style={{ width: screenWidth }}
            className="flex-1 justify-center items-center px-6"
          >
            {/* Slide Illustration Image from Assets */}
            <View className="items-center justify-center mb-6">
              <Image
                source={item.image}
                style={{
                  width: Math.min(screenWidth - 48, 340),
                  height: 240,
                }}
                resizeMode="contain"
              />
            </View>

            {/* Slide Title & Description */}
            <View className="items-center px-4">
              <Text style={{ color: colors.text }} className="text-2xl font-extrabold text-center tracking-tight">
                {item.title}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm font-normal text-center mt-2.5 leading-relaxed">
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls Area */}
      <View className="px-6 pb-10">
        {/* Interactive Pagination Dots */}
        <View className="flex-row justify-center items-center mb-8">
          {slides.map((_, index) => {
            const isActive = activeSlide === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => scrollToSlide(index)}
                style={{
                  backgroundColor: isActive ? colors.primary : colors.border,
                }}
                className={`h-2.5 rounded-full mx-1 ${isActive ? 'w-7' : 'w-2.5'}`}
              />
            );
          })}
        </View>

        {/* Primary Progression Button */}
        <Button
          title={activeSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          variant="primary"
          size="lg"
          onPress={handleNextPress}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
};
