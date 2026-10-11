import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import colors from '../theme/colors';

/**
 * CityPilot Official Brand Logo Component
 * Rendered with the exact generated CityPilot pin identity asset
 */
export default function CityPilotLogo({ size = 38, showText = true, variant = 'color' }) {
  const isWhite = variant === 'white';
  const textColor = isWhite ? '#FFFFFF' : colors.navy;

  return (
    <View style={styles.container}>
      {/* Real Generated CityPilot Pin Icon */}
      <Image
        source={require('../../assets/branding/citypilot_pin_icon.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />

      {showText && (
        <View style={styles.textWrap}>
          <View style={styles.brandRow}>
            <Text style={[styles.brandCity, { color: textColor }]}>City</Text>
            <Text style={[styles.brandPilot, { color: isWhite ? '#FFFFFF' : colors.primary }]}>Pilot</Text>
          </View>
          <Text style={[styles.tagline, { color: isWhite ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
            Find the smartest way there
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWrap: {
    marginLeft: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandCity: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandPilot: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: -2,
    letterSpacing: 0.2,
  },
});

