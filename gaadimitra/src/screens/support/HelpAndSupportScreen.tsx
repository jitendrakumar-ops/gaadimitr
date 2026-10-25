import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  HelpAndSupportScreenNavigationProp,
} from '../../types/navigation';
import {
  CarFrontIcon,
  UserSingleIcon,
  ShieldCheckAltIcon,
  RupeeCircleIcon,
  PhoneCallWaveIcon,
  UserCircleIcon,
  ChevronRightIcon,
  ChatBubbleIcon,
} from '../../assets/icons/Icons';
import { HeaderBar } from '../../components/common/HeaderBar';
import { useTheme } from '../../theme';
import { confirmDialog } from '../../components/common/CustomAlertModal';

interface HelpCategory {
  id: string;
  title: string;
  icon: (color: string) => React.ReactNode;
  description: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const HelpAndSupportScreen: React.FC = () => {
  const navigation = useNavigation<HelpAndSupportScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const helpCategories: HelpCategory[] = [
    {
      id: 'ride_issues',
      title: 'Ride & Trip Issues',
      icon: (c) => <CarFrontIcon size={32} color={c} />,
      description: 'Route disputes, driver delays, or vehicle condition problems.',
    },
    {
      id: 'payments',
      title: 'Payments & Fare',
      icon: (c) => <RupeeCircleIcon size={32} color={c} />,
      description: 'Extra charges, fare calculation, or payment method queries.',
    },
    {
      id: 'safety',
      title: 'Safety & Emergency',
      icon: (c) => <ShieldCheckAltIcon size={32} color={c} />,
      description: 'Report misconduct, lost items, or security concerns.',
    },
    {
      id: 'account',
      title: 'Account & App',
      icon: (c) => <UserCircleIcon size={32} color={c} />,
      description: 'Profile updates, OTP verification, or privacy settings.',
    },
  ];

  const handleCategoryPress = (cat: HelpCategory) => {
    confirmDialog.show({
      title: cat.title,
      message: `${cat.description}\n\nWould you like to connect with a GaadiMitra support executive?`,
      confirmText: 'Call Support',
      cancelText: 'Cancel',
      icon: 'phone',
      onConfirm: () => {
        Linking.openURL('tel:18001234567').catch(() => {});
      },
    });
  };

  const handleContactSupport = () => {
    confirmDialog.show({
      title: 'GaadiMitra 24x7 Support',
      message: 'Need instant assistance with your ride?\n\nHelpline: 1800-123-4567\nEmail: support@gaadimitra.com',
      confirmText: 'Call Helpline',
      cancelText: 'Cancel',
      icon: 'phone',
      onConfirm: () => {
        Linking.openURL('tel:18001234567').catch(() => {});
      },
    });
  };

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(prev => (prev === faqId ? null : faqId));
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header Bar */}
      <HeaderBar
        onBackPress={() => navigation.goBack()}
        title="How can we help?"
        className="border-b"
        style={{ borderBottomColor: colors.border }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 28,
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* 2x3 Grid of Help Category Cards */}
          <View className="flex-row flex-wrap justify-between mb-6">
            {helpCategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => handleCategoryPress(cat)}
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
                className="w-[48%] rounded-xl border p-5 items-center justify-center mb-3.5 shadow-sm"
              >
                <View className="mb-3 items-center justify-center">
                  {cat.icon(colors.primary)}
                </View>
                <Text style={{ color: colors.text }} className="text-xs font-extrabold text-center">
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Frequently asked questions Section */}
          <View className="mb-6">
            <Text style={{ color: colors.text }} className="text-sm font-black mb-2.5 px-1">
              Frequently asked questions
            </Text>

            <View
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              className="rounded-xl border overflow-hidden"
            >
              {/* FAQ 1 */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleFaq('faq_1')}
                style={{ borderBottomColor: colors.border }}
                className="p-4 border-b"
              >
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: colors.text }} className="text-xs font-bold flex-1 pr-2">
                    How do I contact my driver?
                  </Text>
                  <ChevronRightIcon size={16} color={colors.disabled} />
                </View>
                {expandedFaq === 'faq_1' && (
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium mt-2 leading-relaxed">
                    You can tap the Call Driver button on your Ride Details, Live Tracking, or Contacted Drivers screen to initiate a direct call with your driver.
                  </Text>
                )}
              </TouchableOpacity>

              {/* FAQ 2 */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleFaq('faq_2')}
                className="p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: colors.text }} className="text-xs font-bold flex-1 pr-2">
                    How are fares decided?
                  </Text>
                  <ChevronRightIcon size={16} color={colors.disabled} />
                </View>
                {expandedFaq === 'faq_2' && (
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium mt-2 leading-relaxed">
                    GaadiMitra connects you directly with local drivers so you can discuss and enter the mutually agreed fare with 0% middleman commission.
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom CTA: Contact Support */}
        <View className="pt-2">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContactSupport}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
          >
            <ChatBubbleIcon size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-extrabold tracking-wide ml-2.5">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
