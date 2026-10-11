import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Bike,
  Car,
  TrainFront as Train,
  Footprints,
  Bus,
  ArrowRight,
} from 'lucide-react-native';
import colors from '../theme/colors';

/**
 * Reusable ModeSequence Component
 * Renders consistent icon sequence with directional arrows (e.g. 🚲 → 🚇 → 🚶)
 */
export default function ModeSequence({ segments = [], iconSize = 16, style }) {
  if (!segments || segments.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Bike size={iconSize} color={colors.yellowDark} />
      </View>
    );
  }

  const renderIcon = (mode, idx) => {
    const m = (mode || '').toUpperCase();
    if (m === 'METRO' || m === 'TRAIN') {
      return <Train key={`icon_${idx}`} size={iconSize} color={colors.teal} />;
    }
    if (m === 'BUS') {
      return <Bus key={`icon_${idx}`} size={iconSize} color="#059669" />;
    }
    if (m === 'AUTO') {
      return <Car key={`icon_${idx}`} size={iconSize} color="#A855F7" />;
    }
    if (m === 'CAB' || m === 'CAR') {
      return <Car key={`icon_${idx}`} size={iconSize} color={colors.primary} />;
    }
    if (m === 'BIKE') {
      return <Bike key={`icon_${idx}`} size={iconSize} color={colors.yellowDark} />;
    }
    return <Footprints key={`icon_${idx}`} size={iconSize} color={colors.textSecondary} />;
  };

  return (
    <View style={[styles.container, style]}>
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        return (
          <React.Fragment key={idx}>
            {renderIcon(seg.mode, idx)}
            {!isLast && (
              <ArrowRight
                size={iconSize - 4}
                color={colors.textMuted}
                style={styles.arrow}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrow: {
    marginHorizontal: 3,
  },
});

