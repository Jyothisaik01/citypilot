import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
    StatusBar,
} from 'react-native';
import { ArrowLeft, Clock, IndianRupee, Footprints, CircleCheck as CheckCircle2, ChevronRight } from 'lucide-react-native';
import colors from '../theme/colors';

export default function CompareRoutesScreen({ route, navigation }) {
  const { routes = [], origin, destination } = route.params || {};

  const handleSelect = (r) => {
    navigation.navigate('RouteDetails', {
      routeData: r,
      origin,
      destination,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Compare Routes</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.colHeader, { flex: 2 }]}>Route</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Time</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Cost</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>Walk</Text>
        </View>

        {/* Comparison Rows */}
        {routes.map((item, idx) => {
          const isBest = item.category === 'BEST_BALANCE' || item.isRecommended;

          return (
            <TouchableOpacity
              key={item.id || idx}
              style={[styles.tableRow, isBest && styles.tableRowBest]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.88}
            >
              <View style={{ flex: 2 }}>
                {isBest && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>RECOMMENDED</Text>
                  </View>
                )}
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>
                  {item.transfers === 0 ? 'Direct ride' : `${item.transfers} transfers`}
                </Text>
              </View>

              <Text style={[styles.rowVal, { flex: 1, textAlign: 'center' }]}>
                {item.durationMinutes}m
              </Text>

              <Text style={[styles.rowValCost, { flex: 1, textAlign: 'center' }]}>
                ₹{item.estimatedCost}
              </Text>

              <Text style={[styles.rowVal, { flex: 1, textAlign: 'right' }]}>
                {item.walkingDistanceMeters > 999
                  ? `${(item.walkingDistanceMeters / 1000).toFixed(1)}km`
                  : `${item.walkingDistanceMeters}m`}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Strategic Intelligence Card */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Why is Multimodal Recommended?</Text>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color={colors.teal} style={{ marginTop: 2 }} />
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: '800' }}>Save vs Cab: </Text>Dedicated metro rail corridor avoids peak road traffic with predictable 3–5 min train intervals.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color={colors.teal} style={{ marginTop: 2 }} />
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: '800' }}>First-Mile Convenience:</Text> Fast bike taxi drops you directly at Raidurg Metro boarding gate.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <CheckCircle2 size={14} color={colors.teal} style={{ marginTop: 2 }} />
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: '800' }}>Minimal Walking:</Text> Destination is within 600m from Ameerpet Metro exit.
            </Text>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.navy,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.cardMuted,
    borderRadius: 12,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRowBest: {
    borderColor: colors.teal,
    backgroundColor: colors.tealLight,
    borderWidth: 1.5,
  },
  bestBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  bestBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
  },
  rowSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.navy,
  },
  rowValCost: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
});

