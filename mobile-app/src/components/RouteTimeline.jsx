import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bike, TrainFront as Train, Footprints, Car, ArrowDown, Check, Info } from 'lucide-react-native';
import colors from '../theme/colors';

export default function RouteTimeline({ segments, costBreakdown }) {
  if (!segments || segments.length === 0) return null;

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'BIKE':
        return <Bike size={18} color="#FFFFFF" />;
      case 'METRO':
        return <Train size={18} color="#FFFFFF" />;
      case 'WALK':
        return <Footprints size={18} color="#FFFFFF" />;
      case 'CAB':
      case 'CAR':
        return <Car size={18} color="#FFFFFF" />;
      default:
        return <Bike size={18} color="#FFFFFF" />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'BIKE':
        return colors.yellow;
      case 'METRO':
        return colors.teal;
      case 'WALK':
        return colors.textMuted;
      case 'CAB':
      case 'CAR':
        return colors.primary;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Journey Breakdown</Text>

      {/* Vertical Timeline */}
      <View style={styles.timelineList}>
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          const modeColor = getModeColor(seg.mode);

          return (
            <View key={idx} style={styles.stepContainer}>
              {/* Left Column: Icon Circle & Connecting Line */}
              <View style={styles.connectorCol}>
                <View style={[styles.modeCircle, { backgroundColor: modeColor }]}>
                  {getModeIcon(seg.mode)}
                </View>
                {!isLast && <View style={[styles.connectorLine, { backgroundColor: modeColor }]} />}
              </View>

              {/* Right Column: Step Content */}
              <View style={styles.stepDetails}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{seg.title}</Text>
                  <Text style={styles.stepDuration}>{seg.durationMinutes} min</Text>
                </View>

                <Text style={styles.stepInstruction}>{seg.instruction}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{seg.distanceKm} km</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{seg.providerName || seg.mode}</Text>
                  {seg.cost > 0 && (
                    <>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaCost}>₹{seg.cost}</Text>
                    </>
                  )}
                </View>

                {/* Metro intermediate stops pill if available */}
                {seg.metroDetails && (
                  <View style={styles.metroChip}>
                    <Text style={styles.metroChipText}>
                      Line: {seg.metroDetails.line} • {seg.metroDetails.stopCount} stops • Every 3-5 min
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Cost Breakdown Card */}
      <View style={styles.costBox}>
        <Text style={styles.costBoxTitle}>Cost Breakdown</Text>

        <View style={styles.costRow}>
          <Text style={styles.costLabel}>First-mile ride (est.)</Text>
          <Text style={styles.costVal}>₹28</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Hyderabad Metro fare (actual)</Text>
          <Text style={styles.costVal}>₹20</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Walking segment</Text>
          <Text style={[styles.costVal, { color: colors.teal }]}>Free</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total Estimated Cost</Text>
            <Text style={styles.totalSub}>Saves ~₹268 vs direct cab</Text>
          </View>
          <Text style={styles.totalVal}>₹52</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  timelineList: {
    paddingLeft: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  connectorCol: {
    alignItems: 'center',
    width: 36,
  },
  modeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  connectorLine: {
    width: 3,
    flex: 1,
    marginVertical: 4,
    borderRadius: 1.5,
    opacity: 0.6,
  },
  stepDetails: {
    flex: 1,
    marginLeft: 14,
    paddingBottom: 22,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  stepDuration: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepInstruction: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metaDot: {
    marginHorizontal: 6,
    color: colors.textMuted,
  },
  metaCost: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  metroChip: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  metroChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tealDark,
  },
  costBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  costVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.navy,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  totalSub: {
    fontSize: 11.5,
    color: colors.tealDark,
    fontWeight: '700',
    marginTop: 2,
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
  },
});

