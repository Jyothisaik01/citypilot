import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Compass,
  ArrowRight,
  TrendingDown,
  Navigation,
  Leaf,
  Calendar,
  Clock,
  RotateCcw,
  MapPin,
  ChevronRight,
  TrainFront as Train,
  Bike,
  Car,
  Footprints,
  CircleCheck as CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import colors, { COLORS } from '../theme/colors';
import { mobilityAPI, tripsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyTripsScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'multimodal' | 'savings'
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSavings: 0,
    tripsCount: 0,
    co2Saved: '0 kg',
  });

  const fetchTripsData = async () => {
    try {
      const userParams = {
        userId: user?.id || user?._id,
        phone: user?.phone,
        email: user?.email,
      };

      const [tripsRes, statsRes] = await Promise.all([
        tripsAPI.getTrips(userParams),
        tripsAPI.getStats(userParams),
      ]);

      setTrips(Array.isArray(tripsRes) ? tripsRes : []);

      if (statsRes) {
        setStats({
          totalSavings: statsRes.totalSavings || 0,
          tripsCount: statsRes.totalTrips || (Array.isArray(tripsRes) ? tripsRes.length : 0),
          co2Saved: `${statsRes.totalCo2SavedKg || 0} kg`,
        });
      }
    } catch (err) {
      console.warn('Error loading user trips:', err.message);
      setTrips([]);
    }
  };

  useEffect(() => {
    fetchTripsData();
  }, [user?.id, user?.phone]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTripsData();
    setRefreshing(false);
  };

  const handleRebook = (trip) => {
    navigation.navigate('RouteCalculating', {
      origin: trip.origin,
      destination: trip.destination,
      preference: 'balanced',
      mode: 'normal',
    });
  };

  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'multimodal') return t.routeTitle.includes('→');
    if (activeTab === 'savings') return t.savedVsCab >= 60;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Trips</Text>
          <Text style={styles.headerSub}>Multimodal journey history & savings</Text>
        </View>
        <View style={styles.headerBadge}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={styles.headerBadgeText}>{stats.tripsCount} Completed</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Cumulative Savings Summary Card */}
        <View style={styles.savingsCard}>
          <Text style={styles.savingsCardLabel}>SMART MOBILITY IMPACT</Text>
          <View style={styles.savingsRow}>
            <View style={styles.savingsCol}>
              <View style={styles.savingsIconCircle}>
                <TrendingDown size={20} color={colors.teal} />
              </View>
              <Text style={styles.savingsValue}>₹{stats.totalSavings}</Text>
              <Text style={styles.savingsCaption}>Saved vs direct cabs</Text>
            </View>

            <View style={styles.savingsDivider} />

            <View style={styles.savingsCol}>
              <View style={[styles.savingsIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Leaf size={20} color="#059669" />
              </View>
              <Text style={styles.savingsValue}>{stats.co2Saved}</Text>
              <Text style={styles.savingsCaption}>CO₂ emissions avoided</Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeTab === 'all' && styles.filterPillActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.filterText, activeTab === 'all' && styles.filterTextActive]}>
              All Trips ({trips.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeTab === 'multimodal' && styles.filterPillActive]}
            onPress={() => setActiveTab('multimodal')}
          >
            <Text style={[styles.filterText, activeTab === 'multimodal' && styles.filterTextActive]}>
              Multimodal Combos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeTab === 'savings' && styles.filterPillActive]}
            onPress={() => setActiveTab('savings')}
          >
            <Text style={[styles.filterText, activeTab === 'savings' && styles.filterTextActive]}>
              Top Savers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trips List */}
        <View style={styles.tripsList}>
          {filteredTrips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Compass size={38} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Trips on this Account</Text>
              <Text style={styles.emptySubtitle}>
                You haven't completed any multimodal journeys with this account yet. Search a destination to start saving!
              </Text>
              <TouchableOpacity
                style={styles.emptyPlanBtn}
                onPress={() => navigation.navigate('HomeTab')}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyPlanBtnText}>Plan a Smart Journey</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            filteredTrips.map((item) => (
              <View key={item.id} style={styles.tripCard}>
                {/* Trip Card Header */}
                <View style={styles.tripCardHeader}>
                  <View style={styles.dateTimeRow}>
                    <Calendar size={13} color={colors.textSecondary} />
                    <Text style={styles.tripDateText}>{item.date}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <CheckCircle2 size={12} color="#059669" />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                {/* Origin to Destination Route */}
                <View style={styles.routePointsBox}>
                  <View style={styles.routePointItem}>
                    <View style={styles.dotOrigin} />
                    <Text style={styles.routePointText} numberOfLines={1}>
                      {item.origin.name}
                    </Text>
                  </View>
                  <View style={styles.routeVerticalDashed} />
                  <View style={styles.routePointItem}>
                    <View style={styles.dotDest} />
                    <Text style={[styles.routePointText, { fontWeight: '800' }]} numberOfLines={1}>
                      {item.destination.name}
                    </Text>
                  </View>
                </View>

                {/* Multimodal Segments Bar */}
                <View style={styles.modeSequenceBar}>
                  <View style={styles.modeTitleRow}>
                    <Text style={styles.modeTitle}>{item.routeTitle}</Text>
                    <Text style={styles.modeDuration}>{item.durationMinutes} min total</Text>
                  </View>
                  <View style={styles.segmentPillsRow}>
                    {item.segments?.map((seg, idx) => (
                      <View key={idx} style={styles.segMiniBadge}>
                        {seg.mode === 'bike' && <Bike size={11} color={colors.navy} />}
                        {seg.mode === 'metro' && <Train size={11} color={colors.teal} />}
                        {seg.mode === 'auto' && <Car size={11} color={colors.yellowDark} />}
                        {seg.mode === 'walk' && <Footprints size={11} color={colors.textSecondary} />}
                        <Text style={styles.segMiniText}>{seg.duration}m</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Pricing & Savings Banner */}
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.tripCost}>₹{item.cost}</Text>
                    <Text style={styles.tripCostSub}>multimodal fare</Text>
                  </View>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>Saved ₹{item.savedVsCab} vs cab</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.rebookBtn}
                    onPress={() => handleRebook(item)}
                    activeOpacity={0.85}
                  >
                    <RotateCcw size={14} color="#FFFFFF" />
                    <Text style={styles.rebookBtnText}>Re-Plan This Route</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewMapBtn}
                    onPress={() =>
                      navigation.navigate('FullRouteMap', {
                        routeData: item,
                        origin: item.origin,
                        destination: item.destination,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Navigation size={14} color={colors.primary} />
                    <Text style={styles.viewMapBtnText}>Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  savingsCard: {
    backgroundColor: colors.navy,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  savingsCardLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 14,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsCol: {
    flex: 1,
    alignItems: 'center',
  },
  savingsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(20, 195, 142, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingsValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  savingsCaption: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  savingsDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  tripsList: {
    gap: 16,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDateText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  routePointsBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  routePointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  dotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  routeVerticalDashed: {
    width: 2,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginLeft: 3,
    marginVertical: 3,
  },
  routePointText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    flex: 1,
  },
  modeSequenceBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  modeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  modeDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  segmentPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segMiniText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.navy,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tripCost: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.navy,
  },
  tripCostSub: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveBadge: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  saveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.tealDark,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rebookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  rebookBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  viewMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  viewMapBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyPlanBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
