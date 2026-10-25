import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ToastNotification, ToastType } from '../components/common/ToastNotification';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverSubscriptionScreenNavigationProp,
  DriverSubscriptionScreenRouteProp,
} from '../types/navigation';
import {
  BackArrowIcon,
  ShieldLockIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPackages, buyPackage } from '../store/slices/packageSlice';
import { BackendPackageItem } from '../types/package';
import Svg, { Path, Rect } from 'react-native-svg';

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<DriverSubscriptionScreenNavigationProp>();
  const route = useRoute<DriverSubscriptionScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const { driverData, selectedService, selectedVehicle } = route.params || {};

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const dispatch = useAppDispatch();
  const {
    packages,
    isLoading: isPackagesLoading,
    isPurchasing,
    error: packagesError,
  } = useAppSelector((state) => state.package);

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPackages = async () => {
    const serviceId = selectedService?.id || (selectedService as any)?._id;
    await dispatch(fetchPackages(serviceId ? { serviceId } : undefined));
  };

  useEffect(() => {
    loadPackages();
  }, [dispatch, selectedService?.id]);

  useEffect(() => {
    if (packages.length > 0) {
      setSelectedPackageId((prev) => {
        const exists = packages.some((p) => (p._id || p.id) === prev);
        return exists ? prev : (packages[0]._id || packages[0].id || '');
      });
    } else {
      setSelectedPackageId('');
    }
  }, [packages]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPackages();
    setIsRefreshing(false);
  };

  const activePlan: BackendPackageItem | undefined =
    packages.find((p) => (p._id || p.id) === selectedPackageId) || packages[0];

  const getDiscountedPrice = (price: number, off?: number) => {
    if (!off || off <= 0) return price;
    const discount = Math.round(((price * off) / 100) * 100) / 100;
    return Math.max(0, price - discount);
  };

  const formatPackageDuration = (dayType: string) => {
    const lower = (dayType || '').toLowerCase();
    if (lower.includes('1') && lower.includes('day')) return 'Valid for 24 hours';
    if (lower.includes('3') || lower.includes('day')) return 'Valid for 3 days';
    if (lower.includes('7') || lower.includes('week')) return 'Valid for 7 days';
    if (lower.includes('30') || lower.includes('month') || lower === '1month') return 'Valid for 30 days';
    if (lower.includes('365') || lower.includes('year')) return 'Valid for 365 days';
    return `Valid for ${dayType}`;
  };

  const activeFinalPrice = activePlan
    ? getDiscountedPrice(activePlan.price, activePlan.off)
    : 0;

  const handlePayNow = () => {
    if (!activePlan) {
      showToast('Please select a membership plan to continue.', 'error');
      return;
    }
    setIsPaymentModalVisible(true);
  };

  const handleConfirmPayment = async () => {
    if (!activePlan) return;

    const packageId = activePlan._id || activePlan.id;
    if (!packageId) {
      showToast('Invalid package selected', 'error');
      return;
    }

    const vehicleId = selectedVehicle?.id || (selectedVehicle as any)?._id;

    const resultAction = await dispatch(
      buyPackage({
        packageId,
        payload: {
          paymentMethod: selectedPaymentMethod,
          vehicleId: vehicleId || undefined,
        },
      })
    );

    if (buyPackage.fulfilled.match(resultAction)) {
      setIsPaymentModalVisible(false);
      showToast(
        `Your ${activePlan.name || activePlan.dayType} membership has been activated successfully!`,
        'success'
      );
      setTimeout(() => {
        navigation.navigate('DriverSuccess', {
          driverData,
          selectedVehicle,
        });
      }, 1200);
    } else {
      const errorMsg =
        (resultAction.payload as string) || 'Failed to complete subscription payment';
      showToast(errorMsg, 'error');
    }
  };

  const benefits = [
    {
      title: '0% Ride Commission',
      desc: 'Keep 100% of all ride fares directly in your pocket.',
    },
    {
      title: 'Unlimited Direct Customer Calls',
      desc: 'Connect directly with nearby passengers without any broker.',
    },
    {
      title: 'Priority Search Visibility',
      desc: 'Your vehicle is shown on top in your operational area.',
    },
    {
      title: 'Direct UPI & Cash Payments',
      desc: 'Receive money straight into your personal UPI or hand.',
    },
    {
      title: '24/7 Dedicated Driver Support',
      desc: 'Instant help with ride requests, routes, and account assistance.',
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
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-base font-bold">
          Driver Membership
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View className="px-5 pt-4 pb-6 flex-1 justify-between">
          <View>
            {/* Title & Subtitle */}
            <View className="mb-4">
              <Text style={{ color: colors.text }} className="text-xl font-extrabold">
                Activate Your Listing
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-xs mt-1 font-normal leading-relaxed">
                Choose a plan to make your vehicle visible to customers with zero commission.
              </Text>
            </View>

            {/* Vehicle & Partner Tag */}
            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
              className="border rounded-xl p-3 flex-row items-center justify-between mb-5"
            >
              <View className="flex-1 mr-2">
                <Text style={{ color: colors.textMuted }} className="text-[11px] font-semibold uppercase tracking-wide">
                  Listing Vehicle
                </Text>
                <Text style={{ color: colors.text }} className="text-xs font-bold mt-1">
                  {selectedVehicle?.name || 'Commercial Vehicle'}
                </Text>
              </View>
              <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
                <Text className="text-[11px] font-bold text-emerald-600">
                  Verified Driver
                </Text>
              </View>
            </View>

            {/* Plan Tenure Selector */}
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-3 ml-1">
              Select Membership Plan
            </Text>

            {/* Loading State */}
            {isPackagesLoading && !isRefreshing && packages.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textMuted }} className="text-xs mt-3">
                  Loading membership plans...
                </Text>
              </View>
            ) : packages.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }}
                className="border rounded-xl p-6 items-center justify-center mb-5"
              >
                <Text style={{ color: colors.text }} className="text-sm font-bold text-center">
                  No Subscription Plans Found
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs text-center mt-1">
                  {packagesError || 'Please check back later or refresh.'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={loadPackages}
                  style={{ backgroundColor: colors.primary }}
                  className="mt-4 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white text-xs font-semibold">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-3 mb-5">
                {packages.map((pkg) => {
                  const pkgId = pkg._id || pkg.id || '';
                  const isSelected = selectedPackageId === pkgId;
                  const finalPrice = getDiscountedPrice(pkg.price, pkg.off);
                  const badge = pkg.badgeName || pkg.bedgeName || (pkg.off ? `${pkg.off}% OFF` : null);

                  return (
                    <TouchableOpacity
                      key={pkgId}
                      activeOpacity={0.75}
                      onPress={() => setSelectedPackageId(pkgId)}
                      style={{
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                          : colors.surface,
                      }}
                      className="rounded-xl border p-4 flex-row items-center justify-between mb-3"
                    >
                      {/* Left: Radio + Plan Name */}
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          style={{
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                          }}
                          className="w-5 h-5 rounded-full border items-center justify-center mr-3"
                        >
                          {isSelected && (
                            <View className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </View>

                        <View className="flex-1">
                          <View className="flex-row items-center flex-wrap">
                            <Text style={{ color: colors.text }} className="text-sm font-bold mr-2">
                              {pkg.name || pkg.dayType}
                            </Text>
                            {badge && (
                              <View
                                style={{
                                  backgroundColor: colors.primary,
                                }}
                                className="px-2 py-0.5 rounded"
                              >
                                <Text className="text-[10px] font-black text-white uppercase">
                                  {badge}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: colors.textMuted }} className="text-xs mt-1" numberOfLines={1}>
                            {pkg.description || formatPackageDuration(pkg.dayType)}
                          </Text>
                        </View>
                      </View>

                      {/* Right: Pricing */}
                      <View className="items-end">
                        <View className="flex-row items-baseline">
                          <Text style={{ color: colors.text }} className="text-base font-black">
                            ₹{finalPrice}
                          </Text>
                          {pkg.off && pkg.off > 0 ? (
                            <Text
                              style={{ color: colors.textMuted }}
                              className="text-xs font-normal line-through ml-1.5"
                            >
                              ₹{pkg.price}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium">
                          {formatPackageDuration(pkg.dayType)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Membership Benefits */}
            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
              className="border rounded-xl p-4 mb-2"
            >
              <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-3">
                Included with your membership
              </Text>

              <View className="space-y-3">
                {benefits.map((item, idx) => (
                  <View key={idx} className="flex-row items-start mb-3">
                    <View
                      style={{ backgroundColor: colors.primary }}
                      className="w-4 h-4 rounded-full items-center justify-center mr-3 mt-1"
                    >
                      <Svg width={9} height={9} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M5 13L9 17L19 7"
                          stroke="#FFFFFF"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: colors.text }} className="text-xs font-bold">
                        {item.title}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-[11px] mt-1">
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Footer */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
        }}
        className="px-5 pt-3 pb-3 border-t"
      >
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={!activePlan || isPackagesLoading}
          onPress={handlePayNow}
          style={{
            backgroundColor: activePlan ? colors.primary : colors.surfaceSecondary,
            opacity: activePlan ? 1 : 0.6,
          }}
          className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
        >
          <Text className="text-white font-bold text-base mr-2">
            {activePlan
              ? `Proceed to Pay ₹${activeFinalPrice}`
              : 'Select a Plan'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mt-3">
          <ShieldLockIcon size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted }} className="text-[11px] ml-2 font-medium">
            100% secure payment • Cancel anytime
          </Text>
        </View>
      </View>

      {/* Payment Selection Bottom Sheet Modal */}
      <Modal
        visible={isPaymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isPurchasing && setIsPaymentModalVisible(false)}
      >
        <View style={{ backgroundColor: colors.modalBackdrop }} className="flex-1 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => !isPurchasing && setIsPaymentModalVisible(false)}
            className="flex-1"
          />

          <View style={{ backgroundColor: colors.surface }} className="rounded-t-2xl p-5 pb-8 shadow-2xl">
            <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between items-center pb-3 border-b mb-4">
              <View>
                <Text style={{ color: colors.text }} className="text-base font-bold">
                  Select Payment Method
                </Text>
                {activePlan && (
                  <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
                    Total Amount: ₹{activeFinalPrice} ({activePlan.name || activePlan.dayType})
                  </Text>
                )}
              </View>
              <TouchableOpacity
                disabled={isPurchasing}
                onPress={() => setIsPaymentModalVisible(false)}
                style={{ backgroundColor: colors.surfaceSecondary }}
                className="w-7 h-7 rounded-full items-center justify-center"
              >
                <Text style={{ color: colors.textMuted }} className="text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            {isPurchasing ? (
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text }} className="text-sm font-semibold mt-3">
                  Processing your subscription...
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
                  Please do not press back or close the app
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {/* 1. UPI Option */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedPaymentMethod('upi')}
                  style={{
                    borderColor: selectedPaymentMethod === 'upi' ? colors.primary : colors.border,
                    backgroundColor: selectedPaymentMethod === 'upi'
                      ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                      : colors.surfaceSecondary,
                  }}
                  className="flex-row items-center border rounded-xl p-4"
                >
                  <View className="w-9 h-9 rounded-lg bg-emerald-500/15 items-center justify-center mr-3">
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M2 17L12 22L22 17" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M2 12L12 17L22 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold">
                      UPI (GPay / PhonePe / Paytm)
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">
                      Instant auto-approval with 0% extra fee
                    </Text>
                  </View>
                  <View
                    style={{
                      borderColor: selectedPaymentMethod === 'upi' ? colors.primary : colors.border,
                      backgroundColor: selectedPaymentMethod === 'upi' ? colors.primary : 'transparent',
                    }}
                    className="w-4 h-4 rounded-full border items-center justify-center"
                  >
                    {selectedPaymentMethod === 'upi' && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* 2. Card Option */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedPaymentMethod('card')}
                  style={{
                    borderColor: selectedPaymentMethod === 'card' ? colors.primary : colors.border,
                    backgroundColor: selectedPaymentMethod === 'card'
                      ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                      : colors.surfaceSecondary,
                  }}
                  className="flex-row items-center border rounded-xl p-4 mt-2"
                >
                  <View
                    style={{
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                    }}
                    className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Rect x="2" y="5" width="20" height="14" rx="2" stroke={colors.primary} strokeWidth="2" />
                      <Path d="M2 10H22" stroke={colors.primary} strokeWidth="2" />
                    </Svg>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold">
                      Debit / Credit Card
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">
                      Visa, MasterCard, RuPay
                    </Text>
                  </View>
                  <View
                    style={{
                      borderColor: selectedPaymentMethod === 'card' ? colors.primary : colors.border,
                      backgroundColor: selectedPaymentMethod === 'card' ? colors.primary : 'transparent',
                    }}
                    className="w-4 h-4 rounded-full border items-center justify-center"
                  >
                    {selectedPaymentMethod === 'card' && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* 3. Net Banking */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedPaymentMethod('netbanking')}
                  style={{
                    borderColor: selectedPaymentMethod === 'netbanking' ? colors.primary : colors.border,
                    backgroundColor: selectedPaymentMethod === 'netbanking'
                      ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                      : colors.surfaceSecondary,
                  }}
                  className="flex-row items-center border rounded-xl p-4 mt-2"
                >
                  <View
                    style={{
                      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
                    }}
                    className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M3 21H21M4 18H20M5 10V18M9 10V18M15 10V18M19 10V18M12 3L2 8V10H22V8L12 3Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-bold">
                      Net Banking
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">
                      All Indian banks supported
                    </Text>
                  </View>
                  <View
                    style={{
                      borderColor: selectedPaymentMethod === 'netbanking' ? colors.primary : colors.border,
                      backgroundColor: selectedPaymentMethod === 'netbanking' ? colors.primary : 'transparent',
                    }}
                    className="w-4 h-4 rounded-full border items-center justify-center"
                  >
                    {selectedPaymentMethod === 'netbanking' && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Confirm Pay Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  disabled={isPurchasing}
                  onPress={handleConfirmPayment}
                  style={{ backgroundColor: colors.primary }}
                  className="w-full py-4 rounded-xl items-center justify-center mt-4 shadow-md"
                >
                  <Text className="text-white font-bold text-base">
                    Pay ₹{activeFinalPrice} & Activate
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* In-app Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

export const DriverSubscriptionScreen = SubscriptionScreen;
export default SubscriptionScreen;
