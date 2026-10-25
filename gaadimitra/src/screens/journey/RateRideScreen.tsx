import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  RateRideScreenNavigationProp,
  RateRideScreenRouteProp,
  DriverInfo,
  TripInfoData,
} from '../../types/navigation';
import {
  ArrowLeftIcon,
  ThumbsUpIcon,
  CarFrontIcon,
  ClockTimeIcon,
  SmileyFaceIcon,
  ShieldSafetyIcon,
  StarFilledGraphic,
} from '../../assets/icons/Icons';
import { HeaderBar } from '../../components/common/HeaderBar';
import { useTheme } from '../../theme';
import { ridesService } from '../../services/rides';
import { toast } from '../../components/common/ToastNotification';

interface ComplimentTag {
  id: string;
  label: string;
  icon: (isSelected: boolean) => React.ReactNode;
}

export const RateRideScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<RateRideScreenNavigationProp>();
  const route = useRoute<RateRideScreenRouteProp>();

  const driver: DriverInfo = route.params?.driver || {
    id: 'drv_1',
    name: 'Rahul Kumar',
    phone: '+919876543210',
    rating: '4.8',
    totalRides: 286,
    experienceYears: 5,
    distance: '1.2 km away',
    isVerified: true,
    vehicleModel: 'Maruti Dzire',
    vehicleType: 'Car',
    vehiclePlate: 'BR01AB1234',
    hasAc: true,
    seatingCapacity: '4 Seats',
    pricePerKm: '₹14 / km',
  };

  const bookingId = route.params?.bookingId || '#RIDE10245';
  const driverFirstName = driver.name.split(' ')[0] || 'Rahul';

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'good_driver',
    'clean_car',
    'on_time',
  ]);
  const [reviewText, setReviewText] = useState('');

  const complimentTags: ComplimentTag[] = [
    {
      id: 'good_driver',
      label: 'Good Driver',
      icon: (selected) => (
        <ThumbsUpIcon size={18} color={selected ? '#1D61E7' : '#2563EB'} />
      ),
    },
    {
      id: 'clean_car',
      label: 'Clean Car',
      icon: (selected) => (
        <CarFrontIcon size={18} color={selected ? '#1D61E7' : '#2563EB'} />
      ),
    },
    {
      id: 'on_time',
      label: 'On Time',
      icon: (selected) => (
        <ClockTimeIcon size={18} color={selected ? '#1D61E7' : '#2563EB'} />
      ),
    },
    {
      id: 'polite',
      label: 'Polite',
      icon: (selected) => (
        <SmileyFaceIcon size={18} color={selected ? '#1D61E7' : '#2563EB'} />
      ),
    },
    {
      id: 'safe_ride',
      label: 'Safe Ride',
      icon: (selected) => (
        <ShieldSafetyIcon size={18} color={selected ? '#1D61E7' : '#2563EB'} />
      ),
    },
  ];

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmitRating = () => {
    ridesService.updateRideStatus(bookingId, 'completed');
    toast.showSuccess(`Your rating for ${driver.name} has been submitted.`, 'Thank You!');
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeDashboard' }],
    });
  };

  const handleSkip = () => {
    ridesService.updateRideStatus(bookingId, 'completed');
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeDashboard' }],
    });
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header Bar */}
      <View
        style={{ borderBottomColor: colors.border }}
        className="px-5 py-3 border-b flex-row items-center"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center -ml-2"
        >
          <ArrowLeftIcon size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 28,
            flexGrow: 1,
            justifyContent: 'space-between',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Title & Subtitle */}
            <View className="items-center mb-6">
              <Text style={{ color: colors.text }} className="text-2xl font-black tracking-tight text-center">
                How was your ride?
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mt-1.5 text-center">
                Rate your experience with {driverFirstName}.
              </Text>
            </View>

            {/* 5 Big Blue Interactive Stars */}
            <View className="flex-row justify-center items-center mb-8">
              {[1, 2, 3, 4, 5].map(starIndex => {
                const isFilled = rating >= starIndex;
                return (
                  <TouchableOpacity
                    key={starIndex}
                    activeOpacity={0.75}
                    onPress={() => setRating(starIndex)}
                    className="p-1.5 mx-0.5"
                  >
                    <StarFilledGraphic
                      size={42}
                      color={isFilled ? colors.primary : colors.border}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* "What went well?" Section */}
            <View className="mb-6">
              <Text style={{ color: colors.text }} className="text-base font-extrabold">
                What went well?
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mt-0.5 mb-3.5">
                Select all that apply
              </Text>

              {/* Tag Chips Grid */}
              <View className="flex-row flex-wrap -mx-1">
                {complimentTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      activeOpacity={0.75}
                      onPress={() => toggleTag(tag.id)}
                      style={{
                        backgroundColor: isSelected ? `${colors.primary}18` : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}
                      className="m-1 px-4 py-2.5 rounded-xl flex-row items-center border"
                    >
                      {tag.icon(isSelected)}
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.text,
                        }}
                        className="text-xs font-extrabold ml-2"
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* "Tell us about your experience (optional)" */}
            <View className="mb-6">
              <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mb-2">
                Tell us about your experience <Text style={{ color: colors.placeholder }} className="font-normal">(optional)</Text>
              </Text>
              <View
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                }}
                className="rounded-xl border p-3.5 h-24"
              >
                <TextInput
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Write your review here..."
                  placeholderTextColor={colors.placeholder}
                  multiline
                  textAlignVertical="top"
                  style={{ color: colors.text }}
                  className="flex-1 text-sm font-medium p-0"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons: Submit Rating & Skip */}
          <View className="pt-2">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmitRating}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 px-6 rounded-xl items-center justify-center shadow-md mb-3"
            >
              <Text className="text-white text-base font-extrabold tracking-wide">
                Submit Rating
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSkip}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="w-full border py-4 px-6 rounded-xl items-center justify-center"
            >
              <Text style={{ color: colors.primary }} className="text-base font-extrabold tracking-wide">
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
