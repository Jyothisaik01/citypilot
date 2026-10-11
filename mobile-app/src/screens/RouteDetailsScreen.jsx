import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Share,
} from 'react-native';
import {
  ArrowLeft,
  Navigation,
  Map,
  Share2,
  ChevronRight,
  ShieldCheck,
  Bike,
  TrainFront as Train,
  Footprints,
  Car,
} from 'lucide-react-native';
import RouteTimeline from '../components/RouteTimeline';
import Real3rdPartyMap from '../components/Real3rdPartyMap';
import ExternalProviderHandoffSheet from '../components/ExternalProviderHandoffSheet';
import CityPilotRideBookingModal from '../components/CityPilotRideBookingModal';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

import {
  formatDistance,
  formatDuration,
  formatFare,
  getWalkingDistanceMeters,
} from '../utils/routeFormatters';

export default function RouteDetailsScreen({ route, navigation }) {
  const { routeData, origin, destination } = route.params || {};
  const { appMode } = useAuth();

  const [showHandoff, setShowHandoff] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const safeTitle = routeData?.title || 'Bike → Metro → Walk';
  const safeCost = formatFare(routeData?.estimatedFare ?? routeData?.estimatedCost ?? 52);
  const safeDuration = formatDuration(
    routeData?.totalDurationSeconds || (routeData?.durationMinutes ? routeData?.durationMinutes * 60 : 0)
  );
  const walkMeters = getWalkingDistanceMeters(routeData);
  const safeWalking = formatDistance(walkMeters);
  const isMultimodal = routeData?.type === 'MULTIMODAL' || routeData?.id?.includes('multimodal');

  const handlePrimaryAction = () => {
    if (appMode === 'full') {
      // In Full Mode: Native ride booking for first-mile or direct ride
      setShowBookingModal(true);
    } else {
      // In Normal Mode: External provider handoff sheet or direct navigation
      if (routeData?.type === 'DIRECT' || isMultimodal) {
        setShowHandoff(true);
      } else {
        navigation.navigate('Navigation', { routeData, origin, destination });
      }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `CityPilot Route: ${safeTitle}`,
        message: `🚀 CityPilot Smart Route: ${safeTitle}\n📍 ${origin?.name || 'Origin'} → ${destination?.name || 'Destination'}\n⏱ ${safeDuration} min • 💰 ${safeCost}\nFind the smartest way to travel across Hyderabad with CityPilot!`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Route Details</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
          <Share2 size={18} color={colors.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Route Hero Summary */}
        <View style={styles.heroBox}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {routeData?.modeBadge || '🏆 BEST BALANCE'}
              </Text>
            </View>
            <Text style={styles.costHero}>{safeCost}</Text>
          </View>

          <Text style={styles.routeHeroTitle}>{safeTitle}</Text>

          <View style={styles.quickMetricsRow}>
            <Text style={styles.quickMetricText}>{safeDuration}</Text>
            <Text style={styles.metricDot}>•</Text>
            <Text style={styles.quickMetricText}>{safeWalking} walking</Text>
            <Text style={styles.metricDot}>•</Text>
            <Text style={[styles.quickMetricText, { color: colors.tealDark, fontWeight: '700' }]}>
              {appMode === 'full' ? '🚕 Native Booking' : '⚡ Smart Aggregator'}
            </Text>
          </View>
        </View>

        {/* Real 3rd Party Map Preview */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Route Preview</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('FullRouteMap', {
                  routeData,
                  origin,
                  destination,
                })
              }
              style={styles.expandMapBtn}
            >
              <Map size={14} color={colors.primary} />
              <Text style={styles.expandMapText}>View Full Map</Text>
            </TouchableOpacity>
          </View>
          <Real3rdPartyMap
            origin={origin || { name: 'Gachibowli', lat: 17.44, lng: 78.3489 }}
            destination={destination || { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 }}
            route={routeData}
            height={220}
            interactive={true}
          />
        </View>

        {/* Action Button to Open Metro Segments Detail */}
        {isMultimodal && (
          <TouchableOpacity
            style={styles.metroGuideCard}
            onPress={() => navigation.navigate('MetroDetails', { routeData })}
            activeOpacity={0.88}
          >
            <View style={styles.metroGuideLeft}>
              <View style={styles.metroGuideIcon}>
                <Train size={20} color={colors.teal} />
              </View>
              <View>
                <Text style={styles.metroGuideTitle}>View Hyderabad Metro Details</Text>
                <Text style={styles.metroGuideSub}>Raidurg → Ameerpet • 9 Stops • Timings & Fares</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Step-by-Step Breakdown Timeline */}
        <Text style={styles.sectionTitle}>Journey Steps</Text>
        <RouteTimeline segments={routeData?.segments} />

        {/* Cost & Verification Breakdown */}
        <View style={styles.costBox}>
          <Text style={styles.costBoxTitle}>Fare Breakdown</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>First-Mile (Bike)</Text>
            <Text style={styles.costVal}>₹28</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Metro Fare (HMR Official)</Text>
            <Text style={styles.costVal}>₹20</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Last-Mile Walk</Text>
            <Text style={[styles.costVal, { color: colors.tealDark }]}>Free</Text>
          </View>
          <View style={styles.costDivider} />
          <View style={styles.costRow}>
            <Text style={styles.costTotalLabel}>Total Journey Cost</Text>
            <Text style={styles.costTotalVal}>{safeCost}</Text>
          </View>
          <Text style={styles.savingsNotice}>
            🎉 Saves ₹68 compared to direct cab rides!
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() =>
            navigation.navigate('FullRouteMap', {
              routeData,
              origin,
              destination,
            })
          }
          activeOpacity={0.85}
        >
          <Map size={18} color={colors.navy} />
          <Text style={styles.mapBtnText}>View on Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryActionBtn, appMode === 'full' && styles.fullModeBtn]}
          onPress={handlePrimaryAction}
          activeOpacity={0.88}
        >
          {appMode === 'full' ? (
            <>
              <Bike size={18} color="#FFFFFF" />
              <Text style={styles.navBtnText}>
                {isMultimodal ? 'Book First Mile (Bike) ₹28' : 'Book CityPilot Ride'}
              </Text>
            </>
          ) : (
            <>
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.navBtnText}>
                {isMultimodal ? 'Open in Uber / Rapido' : 'Start Navigation'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Normal Mode External Provider Handoff Bottom Sheet */}
      <ExternalProviderHandoffSheet
        visible={showHandoff}
        onClose={() => setShowHandoff(false)}
        pickup={origin}
        destination={destination}
      />

      {/* Full Mode Native Booking Modal */}
      <CityPilotRideBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        vehicleType={isMultimodal ? 'CityPilot Bike (First Mile)' : 'CityPilot Ride'}
        fare={isMultimodal ? 28 : (routeData?.estimatedFare || 52)}
        pickup={origin?.name || 'Gachibowli Junction'}
        destination={isMultimodal ? 'Raidurg Metro Station Gate 2' : (destination?.name || 'Ameerpet')}
        originCoords={origin || { lat: 17.4401, lng: 78.3489, name: 'Gachibowli' }}
        destinationCoords={destination || { lat: 17.4375, lng: 78.4483, name: 'Ameerpet' }}
        onRideCompleted={() => {
          setShowBookingModal(false);
          navigation.navigate('TripCompleted', { routeData });
        }}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.navy,
  },
  shareBtn: {
    padding: 6,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  heroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.tealDark,
  },
  costHero: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.navy,
  },
  routeHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 8,
  },
  quickMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickMetricText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricDot: {
    color: colors.textMuted,
  },
  mapSection: {
    marginBottom: 16,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  expandMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandMapText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  metroGuideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.teal,
    marginBottom: 16,
  },
  metroGuideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metroGuideIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metroGuideTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  metroGuideSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 10,
  },
  costBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  costBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 10,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  costLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  costVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  costDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
  costTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  costTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  savingsNotice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.tealDark,
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: colors.tealLight,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 12,
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardMuted,
    borderRadius: 14,
    height: 50,
    gap: 8,
  },
  mapBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
  primaryActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    gap: 8,
  },
  fullModeBtn: {
    backgroundColor: colors.primary,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
