import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBookingSummary, setSummaryRange } from '../store/slices/bookingSlice';
import { BookingItem } from '../types/booking';

type PeriodFilter = 'Today' | 'This Week' | 'This Month';

const PERIOD_TO_RANGE: Record<PeriodFilter, 'today' | 'week' | 'month'> = {
  Today: 'today',
  'This Week': 'week',
  'This Month': 'month',
};

export const EarningsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('Today');
  const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);

  const {
    summary,
    isSummaryLoading,
    isSummaryRefreshing,
    summaryError,
  } = useAppSelector((state) => state.booking);

  const loadSummaryData = useCallback(
    (period: PeriodFilter, isRefresh = false) => {
      const range = PERIOD_TO_RANGE[period];
      dispatch(setSummaryRange(range));
      dispatch(fetchBookingSummary({ range, isRefresh }));
    },
    [dispatch]
  );

  useEffect(() => {
    loadSummaryData(selectedPeriod, false);
  }, [selectedPeriod, loadSummaryData]);

  const onRefresh = useCallback(() => {
    loadSummaryData(selectedPeriod, true);
  }, [selectedPeriod, loadSummaryData]);

  const handlePeriodTabPress = (period: PeriodFilter) => {
    setSelectedPeriod(period);
  };

  const handleApplyFilterOption = (period: PeriodFilter) => {
    setSelectedPeriod(period);
    setShowFilterSheet(false);
  };

  const formatRideTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      if (isToday) {
        return `Today, ${timeStr}`;
      }
      const day = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
      return `${day}, ${timeStr}`;
    } catch {
      return 'Recent';
    }
  };

  const formatPeriodDates = (from?: string, to?: string) => {
    if (!from || !to) return '';
    try {
      const f = new Date(from);
      const t = new Date(to);
      const fStr = f.toLocaleDateString([], { day: 'numeric', month: 'short' });
      const tStr = t.toLocaleDateString([], { day: 'numeric', month: 'short' });
      return `${fStr} - ${tStr}`;
    } catch {
      return '';
    }
  };

  const handleRidePress = (trip: BookingItem) => {
    const customerName =
      typeof trip.userId === 'object' && trip.userId?.name
        ? trip.userId.name
        : 'Customer';

    const customerPhone =
      typeof trip.userId === 'object' && trip.userId?.phone
        ? trip.userId.phone
        : '';

    const vehicleName =
      typeof trip.vehicleId === 'object' && trip.vehicleId?.title
        ? trip.vehicleId.title
        : 'Assigned Vehicle';

    const pickupAddress =
      trip.pickupLocation?.title || trip.pickupLocation?.address || 'Pickup Point';

    const dropAddress =
      trip.dropLocation?.title || trip.dropLocation?.address || 'Drop Point';

    const fareNumeric = Number(trip.fare) || 0;
    const tokenNumeric = Number(trip.tokenMoney) || Math.round(fareNumeric * 0.1);

    navigation.navigate('RideDetails', {
      ride: {
        id: trip._id,
        bookingId: `#${trip.bookingNumber || trip._id.slice(-6).toUpperCase()}`,
        customer: customerName,
        phone: customerPhone,
        from: pickupAddress,
        to: dropAddress,
        date: formatRideTime(trip.completedAt || trip.createdAt),
        fare: `₹${fareNumeric.toLocaleString('en-IN')}`,
        token: `₹${tokenNumeric.toLocaleString('en-IN')}`,
        paymentMode:
          trip.paymentMethod === 'cash'
            ? 'Cash at Drop'
            : trip.paymentMethod?.toUpperCase() || 'Cash',
        vehicle: vehicleName,
        status: 'Completed',
        distance: trip.distance ? `${trip.distance} km` : '12.5 km',
        duration: '30 mins',
        baseFare: `₹${Math.min(100, fareNumeric || 100)}`,
        distanceFare: `₹${Math.max(0, fareNumeric - 100)}`,
        customerRating: trip.rating ? `${trip.rating}` : '5.0',
      },
    });
  };

  const periods: PeriodFilter[] = ['Today', 'This Week', 'This Month'];

  const periodLabelMap: Record<PeriodFilter, string> = {
    Today: "Today's Total Earnings",
    'This Week': "This Week's Total Earnings",
    'This Month': "This Month's Total Earnings",
  };

  const totalEarning = summary?.totalEarning ?? 0;
  const completedTrips = summary?.totalCompletedTrips ?? 0;
  const tokenMoney = summary?.totalTokenMoney ?? 0;
  const totalFare = summary?.totalFare ?? 0;
  const ridesList = summary?.list || [];

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <View>
          <Text style={[s.headerTitle, { color: colors.text }]}>Earnings</Text>
          <Text style={[s.headerSub, { color: colors.textSecondary }]}>
            Track your payouts, tokens & ride income
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setShowFilterSheet(true)}
          style={[
            s.filterPill,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
            },
          ]}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 5 }}>
            <Rect x="3" y="4" width="18" height="18" rx="2" stroke={colors.primary} strokeWidth="2" />
            <Path d="M16 2V6M8 2V6M3 10H21" stroke={colors.primary} strokeWidth="2" />
          </Svg>
          <Text style={[s.filterPillText, { color: colors.primary }]}>{selectedPeriod}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isSummaryRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Period Chips */}
        <View style={s.chipRow}>
          {periods.map((period) => {
            const isActive = selectedPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                activeOpacity={0.75}
                onPress={() => handlePeriodTabPress(period)}
                style={[
                  s.chip,
                  isActive
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    isActive ? s.chipTextActive : { color: colors.textSecondary },
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loading Spinner */}
        {isSummaryLoading && !isSummaryRefreshing ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[s.loadingText, { color: colors.textSecondary }]}>
              Fetching summary data...
            </Text>
          </View>
        ) : summaryError ? (
          /* Error State */
          <View style={[s.errorCard, { backgroundColor: colors.surface, borderColor: '#EF4444' }]}>
            <Text style={s.errorTitle}>Unable to load summary</Text>
            <Text style={[s.errorSub, { color: colors.textSecondary }]}>{summaryError}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => loadSummaryData(selectedPeriod, false)}
              style={s.retryBtn}
            >
              <Text style={s.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Hero Card */}
            <View style={s.heroCard}>
              <View style={s.heroGlow1} />
              <View style={s.heroGlow2} />
              <View style={s.heroLeft}>
                <View style={s.periodBadge}>
                  <Text style={s.periodBadgeText}>{periodLabelMap[selectedPeriod]}</Text>
                </View>
                <Text style={s.heroAmount}>₹{totalEarning.toLocaleString('en-IN')}</Text>
                <Text style={s.heroSub}>
                  Total Collected ({completedTrips} completed trip{completedTrips === 1 ? '' : 's'})
                </Text>
                {summary?.from && summary?.to ? (
                  <Text style={s.heroDateRange}>
                    {formatPeriodDates(summary.from, summary.to)}
                  </Text>
                ) : null}
              </View>
              <View style={s.heroRight}>
                <View style={s.coin1}><Text style={s.coinText}>₹</Text></View>
                <View style={s.coin2}><Text style={s.coinText2}>₹</Text></View>
                <View style={s.wallet}>
                  <View style={s.walletTop} />
                  <View style={s.walletDot}><View style={s.walletDotInner} /></View>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={s.statsRow}>
              <View style={[s.statCard, { marginRight: 8, backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.statIcon, { backgroundColor: '#10B981' }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Rect x="4" y="4" width="16" height="16" rx="2" stroke="#FFFFFF" strokeWidth="2.5" />
                    <Path d="M9 12L11 14L15 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>Trips Done</Text>
                <Text style={[s.statValue, { color: colors.text }]}>{completedTrips}</Text>
              </View>

              <View style={[s.statCard, { marginRight: 8, backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.statIcon, { backgroundColor: colors.primary }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="8" stroke="#FFFFFF" strokeWidth="2.5" />
                    <Path d="M12 8V12L15 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  </Svg>
                </View>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>Token Adv.</Text>
                <Text style={[s.statValue, { color: colors.text }]}>₹{tokenMoney.toLocaleString('en-IN')}</Text>
              </View>

              <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.statIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  </Svg>
                </View>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>Fare / Cash</Text>
                <Text style={[s.statValue, { color: colors.text }]}>₹{totalFare.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Recent Rides List */}
            <View style={s.recentHeader}>
              <Text style={[s.recentTitle, { color: colors.text }]}>Recent Completed Rides</Text>
              <View style={[s.recentBadge, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[s.recentBadgeText, { color: colors.textSecondary }]}>
                  {ridesList.length} trip{ridesList.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            {ridesList.length === 0 ? (
              <View style={[s.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.emptyIconCircle, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}>
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={colors.primary} strokeWidth="2" />
                    <Path d="M16 2V6M8 2V6M3 10H21" stroke={colors.primary} strokeWidth="2" />
                    <Path d="M9 14H15" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                </View>
                <Text style={[s.emptyTitle, { color: colors.text }]}>No Completed Rides</Text>
                <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                  No rides were completed for {selectedPeriod.toLowerCase()}. Completed trips will appear here automatically.
                </Text>
              </View>
            ) : (
              ridesList.map((ride) => {
                const customerName =
                  typeof ride.userId === 'object' && ride.userId?.name
                    ? ride.userId.name
                    : 'Customer';
                const avatar =
                  typeof ride.userId === 'object' && ride.userId?.profileImage
                    ? ride.userId.profileImage
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                const pickupAddress =
                  ride.pickupLocation?.title || ride.pickupLocation?.address || 'Pickup Point';
                const dropAddress =
                  ride.dropLocation?.title || ride.dropLocation?.address || 'Drop Point';
                const paymentMode =
                  ride.paymentMethod === 'cash'
                    ? 'Cash at Drop'
                    : ride.paymentMethod
                    ? `${ride.paymentMethod.toUpperCase()} at Drop`
                    : 'Cash at Drop';
                const formattedTime = formatRideTime(ride.completedAt || ride.createdAt);
                const fareFormatted = `₹${(ride.fare || 0).toLocaleString('en-IN')}`;

                return (
                  <TouchableOpacity
                    key={ride._id}
                    activeOpacity={0.82}
                    onPress={() => handleRidePress(ride)}
                    style={[
                      s.rideCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={s.rideLeft}>
                      <Image
                        source={{ uri: avatar }}
                        style={[s.avatar, { borderColor: colors.border }]}
                      />
                      <View style={{ flex: 1, paddingRight: 4 }}>
                        <Text style={[s.rideName, { color: colors.text }]} numberOfLines={1}>
                          {customerName}
                        </Text>
                        <Text style={[s.rideRoute, { color: colors.textSecondary }]} numberOfLines={1}>
                          {pickupAddress} ➔ {dropAddress}
                        </Text>
                        <Text style={[s.rideMode, { color: colors.textMuted }]}>
                          {paymentMode}
                        </Text>
                      </View>
                    </View>
                    <View style={s.rideRight}>
                      <Text style={[s.rideTime, { color: colors.textMuted }]}>{formattedTime}</Text>
                      <Text style={s.rideAmount}>{fareFormatted}</Text>
                      <View style={s.completedBadge}>
                        <Text style={s.completedBadgeText}>Completed</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Sheet Filter */}
      {showFilterSheet && (
        <View style={[s.overlay, { backgroundColor: colors.modalBackdrop }]}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowFilterSheet(false)} style={{ flex: 1 }} />
          <View style={[s.sheet, { backgroundColor: colors.surface }]}>
            <View style={[s.sheetHeader, { borderBottomColor: colors.borderLight }]}>
              <Text style={[s.sheetTitle, { color: colors.text }]}>Filter Earnings by Period</Text>
              <TouchableOpacity
                onPress={() => setShowFilterSheet(false)}
                style={[s.sheetClose, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[s.sheetCloseText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { title: 'Today' as PeriodFilter, sub: "Today's rides & daily summary" },
              { title: 'This Week' as PeriodFilter, sub: "This week's rides & weekly summary" },
              { title: 'This Month' as PeriodFilter, sub: "This month's rides & monthly summary" },
            ].map((option) => (
              <TouchableOpacity
                key={option.title}
                activeOpacity={0.8}
                onPress={() => handleApplyFilterOption(option.title)}
                style={[
                  s.optionRow,
                  {
                    backgroundColor:
                      selectedPeriod === option.title
                        ? isDark
                          ? 'rgba(59, 130, 246, 0.2)'
                          : '#EFF6FF'
                        : colors.surfaceSecondary,
                    borderColor:
                      selectedPeriod === option.title ? colors.primary : colors.border,
                  },
                ]}
              >
                <View>
                  <Text
                    style={[
                      s.optionTitle,
                      { color: selectedPeriod === option.title ? colors.primary : colors.text },
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text style={[s.optionSub, { color: colors.textSecondary }]}>
                    {option.sub}
                  </Text>
                </View>
                {selectedPeriod === option.title && (
                  <View style={s.checkMarkCircle}>
                    <Text style={s.checkMarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setShowFilterSheet(false)}
              style={[s.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[s.closeBtnText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPillText: { fontSize: 11, fontWeight: '700' },
  scrollContent: { flexGrow: 1, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 12 },
  chipRow: { flexDirection: 'row', marginBottom: 12 },
  chip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 4,
  },
  errorSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  heroCard: {
    backgroundColor: '#1350F2',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  heroGlow1: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroGlow2: {
    position: 'absolute',
    left: -40,
    top: -40,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroLeft: { flex: 1, paddingRight: 8, zIndex: 1 },
  periodBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  periodBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroAmount: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  heroSub: { fontSize: 11, color: '#DBEAFE', fontWeight: '500', marginTop: 3 },
  heroDateRange: { fontSize: 10, color: '#BFDBFE', fontWeight: '600', marginTop: 2 },
  heroRight: {
    width: 85,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coin1: {
    position: 'absolute',
    top: -4,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FBBF24',
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  coin2: {
    position: 'absolute',
    top: 3,
    right: 34,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  coinText: { fontSize: 11, fontWeight: '900', color: '#78350F' },
  coinText2: { fontSize: 9, fontWeight: '900', color: '#78350F' },
  wallet: {
    width: 70,
    height: 48,
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#60A5FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    overflow: 'hidden',
  },
  walletTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 12, backgroundColor: '#172554' },
  walletDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  walletDotInner: { width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: '#1E40AF' },
  statsRow: { flexDirection: 'row', marginBottom: 14 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 13 },
  statValue: { fontSize: 13, fontWeight: '900', marginTop: 2 },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recentTitle: { fontSize: 14, fontWeight: '800' },
  recentBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  recentBadgeText: { fontSize: 10, fontWeight: '700' },
  emptyContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 17,
  },
  rideCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 11,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rideLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  rideName: { fontSize: 13, fontWeight: '700' },
  rideRoute: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  rideMode: { fontSize: 10, marginTop: 1 },
  rideRight: { alignItems: 'flex-end' },
  rideTime: { fontSize: 10, fontWeight: '500' },
  rideAmount: { fontSize: 14, fontWeight: '900', color: '#059669', marginTop: 1 },
  completedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  completedBadgeText: { fontSize: 9, fontWeight: '800', color: '#065F46' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 14, fontWeight: '800' },
  sheetClose: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseText: { fontWeight: '700', fontSize: 13 },
  optionRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionTitle: { fontSize: 13, fontWeight: '700' },
  optionSub: { fontSize: 11, marginTop: 2 },
  checkMarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1350F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  closeBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closeBtnText: { fontWeight: '700', fontSize: 13 },
});

export default EarningsScreen;
