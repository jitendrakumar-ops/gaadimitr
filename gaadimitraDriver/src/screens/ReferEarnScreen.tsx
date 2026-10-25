import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export const ReferEarnScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const [isCopied, setIsCopied] = useState(false);

  const referralCode = 'JITEN500';

  const referralHistory = [
    {
      id: '1',
      name: 'Amit Kumar',
      phone: '+91 98350 •••••',
      vehicle: 'Swift Dzire (Commercial)',
      status: 'completed',
      reward: '+₹500',
      date: '28 Aug 2025',
    },
    {
      id: '2',
      name: 'Vikas Singh',
      phone: '+91 94312 •••••',
      vehicle: 'Bolero Pickup',
      status: 'completed',
      reward: '+₹500',
      date: '20 Aug 2025',
    },
    {
      id: '3',
      name: 'Suresh Yadav',
      phone: '+91 87091 •••••',
      vehicle: 'E-Rickshaw',
      status: 'pending',
      reward: '₹500 on 2 more trips',
      date: '01 Sep 2025',
    },
    {
      id: '4',
      name: 'Rajesh Verma',
      phone: '+91 70045 •••••',
      vehicle: 'WagonR (AC Taxi)',
      status: 'pending',
      reward: 'Document verification',
      date: '02 Sep 2025',
    },
  ];

  const handleCopyCode = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `🚗 Drive with GaadiMitra & Earn with 0% Commission! Keep 100% of your customer fare.\n\nUse my Referral Code: *${referralCode}* to get 7 Days Free Unlimited Subscription!\n\nDownload: https://gaadimitra.com/driver-app`,
      });
    } catch {
      // Ignored
    }
  };

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
          Refer & Earn
        </Text>

        <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          <Text className="text-[10px] font-black text-emerald-600 uppercase">
            ₹2,500 Earned
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Incentive Banner */}
        <View
          style={{ backgroundColor: colors.primary }}
          className="rounded-xl p-4 mb-4  relative overflow-hidden"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-2">
              <View className="bg-white/20 self-start px-2.5 py-0.5 rounded-full mb-2">
                <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Partner Referral Program
                </Text>
              </View>
              <Text className="text-xl font-black text-white leading-tight">
                Earn ₹500 per Driver Referral
              </Text>
            </View>

            <View className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 items-center justify-center">
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 12v10H4V12M2 7h20v5H2V7zm10-5v5m0 0a2.5 2.5 0 10-5 0 2.5 2.5 0 105 0zm0 0a2.5 2.5 0 115 0 2.5 2.5 0 11-5 0z"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>

          <Text className="text-blue-100 text-xs leading-relaxed">
            Invite fellow drivers to GaadiMitra. Your friend gets{' '}
            <Text className="font-bold text-white">7 Days Free Subscription</Text>, and you receive{' '}
            <Text className="font-bold text-emerald-300">₹500 Cash Reward</Text> upon their first 5 completed trips.
          </Text>
        </View>

        {/* 2. Professional Referral Voucher Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text style={{ color: colors.textMuted }} className="text-xs font-black uppercase tracking-wider mb-2">
            Your Personal Invite Code
          </Text>

          {/* Referral Code Box */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCopyCode}
            style={{
              backgroundColor: isCopied
                ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5')
                : colors.surfaceSecondary,
              borderColor: isCopied ? '#10B981' : colors.border,
            }}
            className="flex-row items-center justify-between p-4 rounded-xl border"
          >
            <View className="flex-row items-center">
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="w-9 h-9 rounded-xl border items-center justify-center mr-3"
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M7 7h10v10H7z"
                    stroke={colors.primary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M17 17l4 4M7 7L3 3"
                    stroke={colors.primary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <View>
                <Text style={{ color: colors.textMuted }} className="text-xs font-bold uppercase tracking-wider">
                  Tap to Copy
                </Text>
                <Text style={{ color: colors.text }} className="text-lg font-black tracking-widest font-mono">
                  {referralCode}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: isCopied ? '#059669' : colors.primary,
              }}
              className="w-10 h-10 rounded-xl items-center justify-center "
            >
              {isCopied ? (
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 6L9 17l-5-5"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : (
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>
          </TouchableOpacity>

          {/* Share Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShareInvite}
            style={{ backgroundColor: colors.primary }}
            className="w-full py-3.5 rounded-xl items-center justify-center flex-row shadow-md mt-3"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="mr-2">
              <Path
                d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text className="text-white font-black text-sm">
              Share Referral Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Performance Stats Dashboard */}
        <View className="flex-row space-x-2.5 mb-4">
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="flex-1 rounded-xl border p-3.5 items-center "
          >
            <Text style={{ color: colors.primary }} className="text-lg font-black">8</Text>
            <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase mt-0.5 tracking-wider">
              Invited
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="flex-1 rounded-xl border p-3.5 items-center  ml-2"
          >
            <Text className="text-lg font-black text-emerald-600">5</Text>
            <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase mt-0.5 tracking-wider">
              Onboarded
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="flex-1 rounded-xl border p-3.5 items-center  ml-2"
          >
            <Text className="text-lg font-black text-emerald-600">₹2,500</Text>
            <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase mt-0.5 tracking-wider">
              Earned
            </Text>
          </View>
        </View>

        {/* 4. How It Works Guide */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            How It Works
          </Text>

          <View className="space-y-3.5">
            <View className="flex-row items-start">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="w-7 h-7 rounded-xl border items-center justify-center mr-3 mt-0.5"
              >
                <Text style={{ color: colors.primary }} className="text-xs font-black">1</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  Share Your Code
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[11px] leading-relaxed mt-0.5">
                  Send your referral code {referralCode} or download link to driver partners.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                }}
                className="w-7 h-7 rounded-xl border items-center justify-center mr-3 mt-0.5"
              >
                <Text style={{ color: colors.primary }} className="text-xs font-black">2</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  Friend Registers & Verifies
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[11px] leading-relaxed mt-0.5">
                  They complete registration and get documents verified on GaadiMitra.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/20 items-center justify-center mr-3 mt-0.5">
                <Text className="text-xs font-black text-emerald-600">3</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  Receive ₹500 Reward
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-[11px] leading-relaxed mt-0.5">
                  Once they complete 5 rides, ₹500 is credited straight to your partner wallet.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Referral Activity */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border p-4 mb-4 "
        >
          <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-3">
            Referral Activity
          </Text>

          <View className="space-y-2.5">
            {referralHistory.map((item) => (
              <View
                key={item.id}
                style={{ borderBottomColor: colors.borderLight }}
                className="flex-row items-center justify-between py-2.5 border-b"
              >
                <View className="flex-1 mr-2">
                  <Text style={{ color: colors.text }} className="text-xs font-bold">{item.name}</Text>
                  <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5 font-medium">
                    {item.vehicle} • {item.date}
                  </Text>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-xs font-black ${item.status === 'completed' ? 'text-emerald-600' : 'text-amber-500'
                      }`}
                  >
                    {item.reward}
                  </Text>
                  <Text
                    className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${item.status === 'completed' ? 'text-emerald-600' : 'text-amber-500'
                      }`}
                  >
                    {item.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const DriverReferEarnScreen = ReferEarnScreen;
export default ReferEarnScreen;
