import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Clock,
  Footprints,
  ChevronRight,
  CheckCircle2,
  Shuffle,
} from 'lucide-react-native';
import ModeSequence from './ModeSequence';
import {
  formatDistance,
  formatDuration,
  formatFare,
  getWalkingDistanceMeters,
  getRecommendationReasons,
} from '../utils/routeFormatters';
import colors from '../theme/colors';

/**
 * Redesigned, compact CityPilot RouteCard
 * Pure data-driven, validated, responsive layout
 */
export default function RouteCard({
  route,
  allRoutes = [],
  onSelect,
  isSelected = false,
}) {
  if (!route) return null;

  const isRecommended = Boolean(
    route.isRecommended || route.category === 'BEST_BALANCE'
  );
  const isCheapest = route.category === 'CHEAPEST';
  const isFastest = route.category === 'FASTEST';

  // Badge styling
  let badgeLabel = 'OPTION';
  let badgeBg = '#F1F5F9';
  let badgeText = '#475569';

  if (isRecommended || route.isAiRecommended) {
    badgeLabel = '✨ OREO AI RECOMMENDED';
    badgeBg = '#EFF6FF';
    badgeText = '#1D4ED8';
  } else if (isCheapest) {
    badgeLabel = 'CHEAPEST';
    badgeBg = '#ECFDF5';
    badgeText = '#059669';
  } else if (isFastest) {
    badgeLabel = 'FASTEST';
    badgeBg = '#FEF3C7';
    badgeText = '#D97706';
  } else if (route.modeBadge) {
    badgeLabel = route.modeBadge.replace(/[^\w\s✨]/gi, '').trim().toUpperCase();
  }

  // Purely computed metrics using normalized standard units
  const durationText = formatDuration(
    route.totalDurationSeconds || (route.durationMinutes ? route.durationMinutes * 60 : 0)
  );

  const walkingMeters = getWalkingDistanceMeters(route);
  const walkingText = formatDistance(walkingMeters);

  const fareText = formatFare(route.estimatedFare ?? route.estimatedCost);

  // Transfers count
  const transfersCount = route.transfers !== undefined ? Number(route.transfers) : 0;
  const transferText =
    transfersCount === 0
      ? '0 transfers'
      : transfersCount === 1
      ? '1 transfer'
      : `${transfersCount} transfers`;

  // Dynamic recommendation reasons derived from actual route comparison
  const recommendationReasons = useMemo(() => {
    if (!isRecommended && !route.isAiRecommended) return [];
    return getRecommendationReasons(route, allRoutes);
  }, [route, allRoutes, isRecommended, route.isAiRecommended]);

  // Pricing label
  const isOfficial = route.costType === 'OFFICIAL_TRANSIT_FARE';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onSelect && onSelect(route)}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        (isRecommended || route.isAiRecommended) && styles.cardRecommended,
      ]}
    >
      {/* Top Header: Badge + Fare */}
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeText }]}>{badgeLabel}</Text>
        </View>
        <Text style={styles.fareText}>{fareText}</Text>
      </View>

      {/* Mode Sequence Chain */}
      <View style={styles.sequenceRow}>
        <ModeSequence segments={route.segments} iconSize={16} />
      </View>

      {/* Key Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Clock size={13} color={colors.textSecondary} />
          <Text style={styles.metricValue}>{durationText}</Text>
        </View>

        <Text style={styles.dot}>•</Text>

        <View style={styles.metricItem}>
          <Footprints size={13} color={colors.textSecondary} />
          <Text style={styles.metricValue}>{walkingText}</Text>
        </View>

        <Text style={styles.dot}>•</Text>

        <View style={styles.metricItem}>
          <Shuffle size={13} color={colors.textSecondary} />
          <Text style={styles.metricValue}>{transferText}</Text>
        </View>
      </View>

      {/* Why Recommended by Oreo AI */}
      {(isRecommended || route.isAiRecommended) && recommendationReasons.length > 0 && (
        <View style={styles.whyBox}>
          <View style={styles.whyHeaderRow}>
            <Text style={styles.whyTitle}>WHY OREO RECOMMENDS THIS</Text>
            <View style={styles.oreoPill}>
              <Text style={styles.oreoPillText}>Oreo AI</Text>
            </View>
          </View>
          {recommendationReasons.map((reason, idx) => (
            <View key={idx} style={styles.reasonRow}>
              <CheckCircle2 size={12} color="#059669" style={styles.checkIcon} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer: Fare classification + View Route CTA */}
      <View style={styles.footerRow}>
        <Text style={styles.fareTypeLabel} numberOfLines={1}>
          {isOfficial ? '✓ Official Metro transit fare' : 'CityPilot estimated fare'}
        </Text>
        <View style={styles.viewRouteBtn}>
          <Text style={styles.viewRouteText}>View Route</Text>
          <ChevronRight size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F8FAFC',
  },
  cardRecommended: {
    borderColor: '#10B981',
    backgroundColor: '#FCFDFE',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  fareText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.navy,
  },
  sequenceRow: {
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dot: {
    marginHorizontal: 8,
    color: '#CBD5E1',
    fontSize: 12,
  },
  whyBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  whyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  whyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  oreoPill: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  oreoPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  checkIcon: {
    marginTop: 1,
  },
  reasonText: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  fareTypeLabel: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  viewRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewRouteText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.primary,
  },
});
