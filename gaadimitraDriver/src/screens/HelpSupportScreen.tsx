import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path, Circle } from 'react-native-svg';

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('1');

  const faqs = [
    {
      id: '1',
      question: 'How do I collect 100% fare with 0% commission?',
      answer:
        'With your active GaadiMitra subscription, you collect 100% of the customer fare directly via cash or UPI. GaadiMitra does not deduct any commission from your rides.',
    },
    {
      id: '2',
      question: 'How do I renew my Driver Subscription plan?',
      answer:
        'Go to Profile > Subscription to choose from Daily, Weekly, or Monthly unlimited ride plans and pay easily with UPI or Net Banking.',
    },
    {
      id: '3',
      question: 'What if a passenger cancels or creates an issue?',
      answer:
        'If a customer cancels after you reach the pick-up location, a cancellation compensation is credited to your wallet. For urgent on-trip issues, tap the SOS button or use live chat.',
    },
    {
      id: '4',
      question: 'How do I update expired vehicle or DL documents?',
      answer:
        'Navigate to Profile > Document. You can view the status of all your government verified documents and reach out to support for re-verification.',
    },
  ];

  const handleCallSupport = () => {
    Alert.alert('Call Helpline', 'Call GaadiMitra 24x7 Driver Partner Helpline: 1800-123-4567?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call Now',
        onPress: () => Linking.openURL('tel:18001234567').catch(() => { }),
      },
    ]);
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gaadimitra.com?subject=Driver%20Partner%20Support%20Request').catch(() => { });
  };

  const ChevronRight = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={colors.textMuted}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

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
          Help & Support
        </Text>

        <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
          <Text className="text-[10px] font-bold text-emerald-600">24x7 Online</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Live Chat Highlight Hero Card */}
        <View
          style={{ backgroundColor: colors.primary }}
          className="rounded-xl p-4 mb-4 "
        >
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-base">
                Instant Live Support
              </Text>
              <Text className="text-blue-100 text-xs font-medium">
                Chat directly with our partner support team
              </Text>
            </View>
          </View>

          <Text className="text-blue-100 text-xs leading-relaxed mb-3.5">
            Get instant resolution for fares, ride issues, document approvals, or subscription queries.
          </Text>

          {/* CHAT NOW BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('DriverSupportChat')}
            style={{ backgroundColor: colors.surface }}
            className="py-3.5 px-4 rounded-xl items-center justify-center flex-row "
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
              <Path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={{ color: colors.primary }} className="font-black text-sm">
              Chat with Support Now 💬
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Direct Helpline & Email Options */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Direct Contact Options
          </Text>

          {/* Phone Call */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCallSupport}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-2.5 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 items-center justify-center mr-3">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    stroke="#10B981"
                    strokeWidth="1.8"
                  />
                </Svg>
              </View>
              <View>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  24x7 Toll-Free Helpline
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium mt-0.5">
                  1800 123 4567 (Toll Free)
                </Text>
              </View>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Email Support */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleEmailSupport}
            style={{ borderBottomColor: colors.borderLight }}
            className="flex-row items-center justify-between py-2.5 border-b"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="w-9 h-9 rounded-xl border items-center justify-center mr-3"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke={colors.primary}
                    strokeWidth="1.8"
                  />
                  <Path d="M22 6l-10 7L2 6" stroke={colors.primary} strokeWidth="1.8" />
                </Svg>
              </View>
              <View>
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  Email Support
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium mt-0.5">
                  support@gaadimitra.com
                </Text>
              </View>
            </View>
            <ChevronRight />
          </TouchableOpacity>

          {/* Emergency SOS */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Emergency Helpline', 'Connect to Emergency Services (112)?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call 112', onPress: () => Linking.openURL('tel:112').catch(() => { }) },
              ])
            }
            className="flex-row items-center justify-between py-2.5"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/20 items-center justify-center mr-3">
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="#E11D48"
                    strokeWidth="1.8"
                  />
                </Svg>
              </View>
              <View>
                <Text className="text-xs font-bold text-rose-500">
                  Emergency / SOS Helpline
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium mt-0.5">
                  24x7 Driver Safety Hotline
                </Text>
              </View>
            </View>
            <ChevronRight />
          </TouchableOpacity>
        </View>

        {/* 3. Frequently Asked Questions (FAQ) */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Frequently Asked Questions
          </Text>

          <View className="space-y-2.5">
            {faqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <TouchableOpacity
                  key={faq.id}
                  activeOpacity={0.8}
                  onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3 mb-2"
                >
                  <View className="flex-row items-center justify-between">
                    <Text style={{ color: colors.text }} className="text-xs font-bold flex-1 mr-2">
                      {faq.question}
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="font-bold text-base">
                      {isExpanded ? '−' : '+'}
                    </Text>
                  </View>

                  {isExpanded && (
                    <Text
                      style={{
                        color: colors.textSecondary,
                        borderTopColor: colors.borderLight,
                      }}
                      className="text-[11px] leading-relaxed mt-2 pt-2 border-t font-normal"
                    >
                      {faq.answer}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Partner Hub Address */}
        <View
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          className="p-4 border rounded-xl flex-row items-center"
        >
          <View
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            }}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                stroke={colors.textMuted}
                strokeWidth="1.8"
              />
              <Circle cx="12" cy="10" r="3" stroke={colors.textMuted} strokeWidth="1.8" />
            </Svg>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              GaadiMitra Partner Hub
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5">
              Patna Driver Suvidha Kendra (Mon-Sat, 9:00 AM - 7:00 PM)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const DriverHelpSupportScreen = HelpSupportScreen;
export default HelpSupportScreen;
