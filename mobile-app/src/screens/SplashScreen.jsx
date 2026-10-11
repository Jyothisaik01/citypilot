import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Images from '../assets/images';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Onboarding');
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [navigation, isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Brand Center */}
      <View style={styles.logoCenter}>
        <Image
          source={require('../../assets/branding/citypilot_pin_icon.png')}
          style={styles.pinIcon}
          resizeMode="contain"
        />
        <View style={styles.brandRow}>
          <Text style={styles.brandCity}>City</Text>
          <Text style={styles.brandPilot}>Pilot</Text>
        </View>
        <Text style={styles.tagline}>Find the smartest way there</Text>
      </View>

      {/* Badges footer matching user's Image 1 Screen 1 */}
      <View style={styles.footer}>
        <View style={styles.modesRow}>
          <Text style={styles.modeBadge}>🚗 Ride</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.modeBadge}>🚇 Metro</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.modeBadge}>🚌 Bus</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.modeBadge}>🚶 Walk</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.modeBadge}>More</Text>
        </View>
        <Text style={styles.versionText}>Hyderabad Mobility Intelligence • v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCenter: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pinIcon: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  brandCity: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  brandPilot: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0A84FF',
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
  },
  modesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  dot: {
    color: '#64748B',
    fontSize: 12,
  },
  versionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 10,
  },
});
