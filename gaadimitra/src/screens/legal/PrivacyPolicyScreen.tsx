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
import { PrivacyPolicyScreenNavigationProp } from '../../types/navigation';
import {
  ChevronLeftIcon,
  ShieldCheckmarkIcon,
  LockIcon,
  PhoneIcon,
  LocationMarkerIcon,
} from '../../assets/icons/Icons';
import { useTheme } from '../../theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<PrivacyPolicyScreenNavigationProp>();

  const handleCallSupport = () => {
    Linking.openURL('tel:180012042234').catch(() => { });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:privacy@gaadimitra.com').catch(() => { });
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
            Privacy Policy
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-[10.5px] font-semibold text-center">
            GaadiMitra • Updated August 2026
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View>
          {/* Trust Seal Banner */}
          <View
            style={{
              backgroundColor: `${colors.primary}15`,
              borderColor: `${colors.primary}35`,
            }}
            className="border rounded-xl p-4 mb-3.5"
          >
            <View className="flex-row items-center mb-1">
              <LockIcon size={16} color={colors.primary} />
              <Text style={{ color: colors.primary }} className="text-xs font-black uppercase tracking-wider ml-1.5">
                Data Protection & Privacy
              </Text>
            </View>
            <Text style={{ color: colors.text }} className="text-xs font-medium leading-relaxed">
              Your personal data, geolocation, and direct communications are strictly confidential and protected by end-to-end security standards.
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
              1. Information We Collect
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed mb-2.5">
              We collect your phone number during sign-in to authenticate your user account, along with voluntary profile information such as your name and emergency contacts.
            </Text>
            <View className="flex-row items-start">
              <ShieldCheckmarkIcon size={14} color="#10B981" />
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold ml-2 flex-1 leading-4">
                We do not sell or monetize personal customer records with third-party advertisers.
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
              2. Geolocation Permissions
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed mb-2">
              Location data is requested strictly while the app is in the foreground to discover nearby vehicle operators and compute accurate pickup routing.
            </Text>
            <View className="flex-row items-start">
              <LocationMarkerIcon size={14} color={colors.primary} />
              <Text style={{ color: colors.textSecondary }} className="text-xs font-medium ml-2 flex-1 leading-4">
                You may choose to select your city manually at any time without granting GPS permissions.
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
              3. Communication Security
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed">
              When calling a driver, phone numbers are routed securely. Call records and recordings are never stored on GaadiMitra servers without explicit statutory mandate.
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
              4. Data Retention & Account Deletion
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-normal leading-relaxed">
              You retain the right to delete your profile and trip history at any time through Account Settings or by reaching out to grievance@gaadimitra.com.
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
              Our safety and legal grievance cell is available round the clock for all passenger and driver inquiries.
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
                  Email Legal Team
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
