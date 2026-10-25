import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path } from 'react-native-svg';

export const TermsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();

  const termsSections = [
    {
      id: '1',
      title: '1. Driver Eligibility & Document Verification',
      content:
        'To operate on GaadiMitra, all driver partners must possess a valid Commercial Driving Licence (DL), Vehicle Registration Certificate (RC), valid Commercial Insurance, and State/AITP Permit. Any forged or expired documents will lead to immediate account suspension.',
    },
    {
      id: '2',
      title: '2. 100% Direct Customer Fares (0% Commission)',
      content:
        'Under GaadiMitra subscription plans, drivers keep 100% of the customer fare. GaadiMitra charges zero commission per ride. Drivers must maintain an active monthly subscription to receive ride bookings.',
    },
    {
      id: '3',
      title: '3. Fare Collection & Payment Terms',
      content:
        'Drivers are authorized to collect cash or direct UPI payments from customers as displayed on the trip meter. Any overcharging beyond the quoted fare is strictly prohibited.',
    },
    {
      id: '4',
      title: '4. Passenger Safety & Vehicle Standards',
      content:
        'Drivers must maintain vehicle roadworthiness, cleanliness, and functional AC. Drivers must adhere strictly to traffic safety guidelines, seatbelt usage, and passenger safety protocols at all times.',
    },
    {
      id: '5',
      title: '5. Cancellation & Acceptance Guidelines',
      content:
        'Frequent cancellations without valid reasons disrupt passenger trust. Repeated unexcused trip cancellations or passenger refusals may impact driver priority and account standing.',
    },
    {
      id: '6',
      title: '6. Privacy & Location Tracking',
      content:
        'GaadiMitra collects real-time background and foreground GPS location data strictly when the driver is marked "Online" to dispatch nearby rides and ensure passenger safety. Your data is encrypted under the Information Technology Act 2000.',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="px-4 py-3.5 border-b flex-row items-center justify-between "
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
          Terms & Conditions
        </Text>

        <View
          style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
          }}
          className="px-2 py-1 rounded-full"
        >
          <Text style={{ color: colors.primary }} className="text-[10px] font-bold">v2.4</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-3.5 "
        >
          <View className="flex-row items-center mb-2">
            <View
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              }}
              className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                  stroke={colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                  stroke={colors.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.text }} className="text-sm font-black">
                Driver Partner Agreement
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-medium">
                Last Updated: January 2025
              </Text>
            </View>
          </View>

          <Text style={{ color: colors.textSecondary }} className="text-xs leading-relaxed font-normal mt-1">
            Please read these terms and conditions carefully. By registering and accepting ride requests on the GaadiMitra platform, you agree to comply with all guidelines stated herein.
          </Text>
        </View>

        {/* Terms Sections List */}
        <View className="space-y-3">
          {termsSections.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="rounded-xl border p-4 mb-3 "
            >
              <Text style={{ color: colors.text }} className="text-xs font-black mb-1.5">
                {item.title}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs leading-relaxed font-normal">
                {item.content}
              </Text>
            </View>
          ))}
        </View>

        {/* Legal Trust Footer */}
        <View
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          className="mt-2 p-4 border rounded-xl flex-row items-center"
        >
          <View
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            }}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke={colors.textMuted}
                strokeWidth="1.8"
              />
            </Svg>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              Legal Compliance & Contact
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5">
              Questions regarding these terms? Email: legal@gaadimitra.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const DriverTermsScreen = TermsScreen;
export default TermsScreen;
