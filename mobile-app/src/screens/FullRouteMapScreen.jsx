import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Navigation } from 'lucide-react-native';
import Real3rdPartyMap from '../components/Real3rdPartyMap';
import colors from '../theme/colors';

import { formatDuration, formatFare, formatDistance, getWalkingDistanceMeters } from '../utils/routeFormatters';

export default function FullRouteMapScreen({ route, navigation }) {
  const { routeData, origin, destination } = route.params || {};
  const insets = useSafeAreaInsets();

  const durationText = formatDuration(
    routeData?.totalDurationSeconds || (routeData?.durationMinutes ? routeData?.durationMinutes * 60 : 0)
  );
  const fareText = formatFare(routeData?.estimatedFare ?? routeData?.estimatedCost ?? 52);
  const walkMeters = getWalkingDistanceMeters(routeData);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top Floating Header with Safe Area Inset */}
      <View style={[styles.header, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Full Route Map</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {origin?.name || 'Gachibowli'} → {destination?.name || 'Ameerpet'}
          </Text>
        </View>
      </View>

      {/* Full-Screen Real Google Maps Streets */}
      <View style={styles.mapWrap}>
        <Real3rdPartyMap
          origin={origin || { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 }}
          destination={destination || { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 }}
          route={routeData}
          height="100%"
          interactive={true}
          showLegend={false}
          style={{ flex: 1, borderRadius: 0, borderWidth: 0 }}
        />
      </View>

      {/* Bottom Route Summary Card with Safe Area Inset */}
      <View style={[styles.bottomCard, { bottom: insets.bottom + 12 }]}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryTitle}>{routeData?.title || 'Bike → Metro → Walk'}</Text>
            <Text style={styles.summaryMetrics}>
              {durationText} • {fareText} • {formatDistance(walkMeters)} walk
            </Text>
          </View>
          <View style={styles.badgeRecommended}>
            <Text style={styles.badgeText}>RECOMMENDED</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startNavBtn}
          onPress={() =>
            navigation.navigate('Navigation', {
              routeData,
              origin,
              destination,
            })
          }
          activeOpacity={0.88}
        >
          <Navigation size={18} color="#FFFFFF" />
          <Text style={styles.startNavText}>Start Live Navigation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mapWrap: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  summaryMetrics: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  badgeRecommended: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.tealDark,
  },
  startNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  startNavText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
