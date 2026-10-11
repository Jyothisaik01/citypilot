import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Bell, Navigation, ArrowRight, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import colors from '../theme/colors';

export default function LocationPermissionScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setLoading(true);

      // 1. Check existing permission or request foreground permission
      let permission = await Location.getForegroundPermissionsAsync().catch(() => null);
      if (!permission || permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync().catch(() => null);
      }

      if (permission && permission.status === 'granted') {
        let location = null;

        // 2. Fast: Try last known location first (instant, non-blocking)
        try {
          location = await Location.getLastKnownPositionAsync();
        } catch (e) {}

        // 3. If no cached position, check if device services are enabled and query with timeout
        if (!location) {
          try {
            const hasServices = await Location.hasServicesEnabledAsync().catch(() => false);
            if (hasServices) {
              location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 6000,
              });
            }
          } catch (e) {}
        }

        // 4. Resolve human-readable locality or default
        let placeName = 'Current Location (Gachibowli)';
        let lat = 17.4400;
        let lng = 78.3489;

        if (location?.coords) {
          lat = location.coords.latitude;
          lng = location.coords.longitude;
          try {
            const geocoded = await Location.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng,
            });
            if (geocoded && geocoded.length > 0) {
              const p = geocoded[0];
              const parts = [p.name || p.street, p.subregion || p.district || p.city].filter(Boolean);
              if (parts.length > 0) placeName = parts.join(', ');
            }
          } catch (e) {}
        }

        const userLocation = {
          name: placeName,
          lat,
          lng,
          isGps: Boolean(location?.coords),
        };

        await AsyncStorage.setItem('user_last_location', JSON.stringify(userLocation));
        navigation.replace('MainTabs', { userLocation });
      } else {
        // Fallback smoothly if permission not granted
        const defaultLoc = {
          name: 'Current location (Gachibowli)',
          lat: 17.4400,
          lng: 78.3489,
          isGps: false,
        };
        await AsyncStorage.setItem('user_last_location', JSON.stringify(defaultLoc));
        navigation.replace('MainTabs', { userLocation: defaultLoc });
      }
    } catch (err) {
      // Graceful fallback without crashing or throwing console warnings
      const defaultLoc = {
        name: 'Current location (Gachibowli)',
        lat: 17.4400,
        lng: 78.3489,
        isGps: false,
      };
      await AsyncStorage.setItem('user_last_location', JSON.stringify(defaultLoc)).catch(() => {});
      navigation.replace('MainTabs', { userLocation: defaultLoc });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedManually = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Radar Map Graphic */}
        <View style={styles.radarGraphic}>
          <View style={styles.radarOuter}>
            <View style={styles.radarMiddle}>
              <View style={styles.radarCenter}>
                <Navigation size={28} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>Enable your location</Text>
        <Text style={styles.subtitle}>
          Get better routes, nearby metro stations and live multimodal travel options tailored to where you are.
        </Text>

        {/* Feature List */}
        <View style={styles.featureBox}>
          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Nearby Stations</Text>
              <Text style={styles.featureDesc}>Instantly locate the closest metro boarding points</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Navigation size={18} color={colors.teal} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Precise Routes</Text>
              <Text style={styles.featureDesc}>Get accurate first-mile and walking connections</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Bell size={18} color={colors.yellowDark} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Live Travel Alerts</Text>
              <Text style={styles.featureDesc}>Receive real-time notifications on transit delays</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleRequestPermission}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Allow Location Access</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleProceedManually}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.secondaryBtnText}>Enter Location Manually</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarGraphic: {
    marginBottom: 32,
    alignItems: 'center',
  },
  radarOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarMiddle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(10, 132, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 30,
    paddingHorizontal: 12,
  },
  featureBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 13.5,
    fontWeight: '700',
  },
});

