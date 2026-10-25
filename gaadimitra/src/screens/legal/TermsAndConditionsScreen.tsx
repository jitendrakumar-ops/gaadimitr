import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  TermsAndConditionsScreenNavigationProp,
} from '../../types/navigation';
import {
  ChevronLeftIcon,
  ShieldCheckmarkIcon,
  LockIcon,
  CheckCircleIcon,
  PhoneIcon,
} from '../../assets/icons/Icons';
import { useTheme } from '../../theme';

export const TermsAndConditionsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<TermsAndConditionsScreenNavigationProp>();

  const handleCallSupport = () => {
    Linking.openURL('tel:180012042234').catch(() => { });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gaadimitra.com').catch(() => { });
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1 justify-between">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }}
        className="flex-row items-center justify-between px-4 py-2.5 border-b"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="w-10 h-10 rounded-xl items-center justify-center border"
        >
          <ChevronLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>

        <View className="items-center flex-1 mx-2">
          <Text style={{ color: colors.text }} className="text-base font-black text-center">
            Terms & Conditions
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-[10.5px] font-semibold text-center">
            GaadiMitra • Updated August 2026
          </Text>
        </View>

        <View className="w-10" />
      </View>

      {/* Main Scrollable Policy Content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View>
          {/* Highlight Banner */}
          <View
            style={{
              backgroundColor: `${colors.primary}15`,
              borderColor: `${colors.primary}35`,
            }}
            className="border rounded-xl p-4 mb-3.5"
          >
            <View className="flex-row items-center mb-1">
              <ShieldCheckmarkIcon size={16} color={colors.primary} />
              <Text style={{ color: colors.primary }} className="text-xs font-black uppercase tracking-wider ml-1.5">
                Zero Commission Platform
              </Text>
            </View>
            <Text style={{ color: colors.text }} className="text-xs font-medium leading-relaxed">
              GaadiMitra operates as a decentralized marketplace connecting riders directly with verified independent commercial vehicle operators.
            </Text>
          </View>

          {/* Section 1 */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mb-3"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-1.5">
              1. Nature of the Service
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed mb-2.5">
              GaadiMitra is a technology-enabled aggregator providing direct call and discovery services between commuters and vehicle drivers. We are not a taxi fleet operator, nor do we employ drivers.
            </Text>
            <View className="flex-row items-start">
              <CheckCircleIcon size={14} color="#10B981" />
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold ml-2 flex-1 leading-4">
                All fare quotes are negotiated directly between passenger and vehicle owner.
              </Text>
            </View>
          </View>

          {/* Section 2 */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mb-3"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-1.5">
              2. Private Calls & Direct Booking
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed mb-2">
              Calls made through the application initiate private phone negotiations. A booking is legally recognized only when confirmed in-app through the "Finalize Ride" workflow.
            </Text>
            <View className="flex-row items-start">
              <LockIcon size={13} color={colors.placeholder} />
              <Text style={{ color: colors.placeholder }} className="text-xs font-medium ml-2 flex-1 leading-4">
                Phone numbers are masked when possible or transmitted solely for direct contact purposes.
              </Text>
            </View>
          </View>

          {/* Section 3 */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mb-3"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-1.5">
              3. Token Amount & Fare Adjustments
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed">
              When a booking token is required, it guarantees driver dispatch and is deducted from the total agreed trip fare. The remaining balance is payable directly to the driver upon completion.
            </Text>
          </View>

          {/* Section 4 */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mb-3"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-1.5">
              4. Safety & Driver Verification
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed">
              Every registered commercial vehicle operator on GaadiMitra is verified through government identity documents (Aadhaar, Driving Licence, Commercial RC). Passengers are encouraged to inspect vehicle plates before boarding.
            </Text>
          </View>

          {/* Section 5 */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mb-3"
          >
            <Text style={{ color: colors.text }} className="text-sm font-extrabold mb-1.5">
              5. Cancellation & Refunds
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed">
              Rides cancelled within 5 minutes of driver confirmation or in instances where the driver fails to arrive at the agreed location qualify for a complete token refund.
            </Text>
          </View>

          {/* Contact Support Tile */}
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
            className="rounded-xl border p-4 mt-1"
          >
            <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-2">
              Have Questions or Need Help?
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs mb-3 leading-4">
              Our safety and grievance cell is available round the clock for all passenger and driver inquiries.
            </Text>

            <View className="flex-row items-center">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCallSupport}
                style={{
                  backgroundColor: `${colors.primary}15`,
                  borderColor: `${colors.primary}35`,
                }}
                className="flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-xl border mr-2"
              >
                <PhoneIcon size={14} color={colors.primary} />
                <Text style={{ color: colors.primary }} className="text-xs font-bold ml-1.5">
                  Call Helpline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleEmailSupport}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-xl border ml-2"
              >
                <Text style={{ color: colors.text }} className="text-xs font-bold">
                  Email Support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={{
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        }}
        className="px-4 py-3 border-t"
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: colors.primary }}
          className="w-full py-3.5 px-4 rounded-xl flex-row items-center justify-center shadow-md"
        >
          <Text className="text-white text-base font-extrabold tracking-wide">
            I Understand & Agree
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
