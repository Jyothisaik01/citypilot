import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
    StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  Bike,
  TrainFront as Train,
  Car,
  Footprints,
  CircleCheck as CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import colors from '../theme/colors';
import { mobilityAPI } from '../services/api';

const PROGRESS_STEPS = [
  'Checking road routes',
  'Checking metro routes',
  'Comparing ride options (Uber, Rapido)',
  'Analyzing best combinations',
  'Calculating time and cost',
  'Ranking best combinations',
];

export default function RouteCalculatingScreen({ route, navigation }) {
  const { origin, destination, preference, mode, maxWalkingKm = 6.0 } = route.params || {};
  const [completedSteps, setCompletedSteps] = useState([0]);

  useEffect(() => {
    // 1. Trigger progressive step animations
    const stepInterval = setInterval(() => {
      setCompletedSteps((prev) => {
        if (prev.length < PROGRESS_STEPS.length) {
          return [...prev, prev.length];
        }
        return prev;
      });
    }, 380);

    // 2. Fetch real routes from backend with safe invocation
    let isMounted = true;
    const calculate = typeof mobilityAPI?.calculateRoutes === 'function' ? mobilityAPI.calculateRoutes : null;

    if (calculate) {
      calculate(origin, destination, preference, mode, maxWalkingKm)
        .then((data) => {
          if (isMounted) {
            setTimeout(() => {
              navigation.replace('RouteOptions', {
                routesData: data,
                origin,
                destination,
                preference,
                mode,
                maxWalkingKm,
              });
            }, 1800);
          }
        })
        .catch(() => {
          if (isMounted) {
            setTimeout(() => {
              navigation.replace('RouteOptions', {
                origin,
                destination,
                preference,
                mode,
                maxWalkingKm,
              });
            }, 1800);
          }
        });
    } else {
      setTimeout(() => {
        if (isMounted) {
          navigation.replace('RouteOptions', {
            origin,
            destination,
            preference,
            mode,
            maxWalkingKm,
          });
        }
      }, 1800);
    }

    return () => {
      isMounted = false;
      clearInterval(stepInterval);
    };
  }, [navigation, origin, destination, preference, mode, maxWalkingKm]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar showing Origin -> Destination */}
      <View style={styles.topBar}>
        <Text style={styles.journeyText} numberOfLines={1}>
          {origin?.name || 'Gachibowli'} → {destination?.name || 'Ameerpet'}
        </Text>
      </View>

      <View style={styles.container}>
        {/* Animated Transit Chain Visual */}
        <View style={styles.transitVisualBox}>
          <View style={styles.iconsRow}>
            <View style={[styles.modeCircle, { backgroundColor: colors.yellowLight }]}>
              <Bike size={22} color={colors.yellowDark} />
            </View>
            <View style={styles.lineConnector} />
            <View style={[styles.modeCircle, { backgroundColor: colors.tealLight }]}>
              <Train size={24} color={colors.teal} />
            </View>
            <View style={styles.lineConnector} />
            <View style={[styles.modeCircle, { backgroundColor: colors.primaryLight }]}>
              <Footprints size={20} color={colors.primary} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Finding the best ways for you...</Text>
        <Text style={styles.subtitle}>
          CityPilot is analyzing multiple transit corridors, comparing fares, and calculating multimodal combinations.
        </Text>

        {/* Step-by-Step Progress Checklist */}
        <View style={styles.checklist}>
          {PROGRESS_STEPS.map((stepText, idx) => {
            const isCompleted = completedSteps.includes(idx);
            return (
              <View key={idx} style={styles.stepItem}>
                <View style={[styles.stepIcon, isCompleted && styles.stepIconCompleted]}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} color={colors.teal} />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>
                <Text style={[styles.stepText, isCompleted && styles.stepTextCompleted]}>
                  {stepText}
                </Text>
              </View>
            );
          })}
        </View>

        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
  },
  journeyText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    alignItems: 'center',
  },
  transitVisualBox: {
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineConnector: {
    width: 24,
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  checklist: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
  },
  stepIconCompleted: {},
  pendingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.border,
  },
  stepText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  stepTextCompleted: {
    color: colors.navy,
    fontWeight: '700',
  },
});

