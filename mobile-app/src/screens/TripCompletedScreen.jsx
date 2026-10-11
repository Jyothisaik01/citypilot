import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
    StatusBar,
  ScrollView,
} from 'react-native';
import {
  CircleCheck as CheckCircle2,
  TrendingDown,
  Leaf,
  Clock,
  Star,
  MapPin,
  Share2,
  House as Home,
  Receipt,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function TripCompletedScreen({ navigation, route }) {
  const { routeData } = route.params || {};

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Fast transfer', 'Saved money']);

  const feedbackTags = [
    'Fast transfer',
    'Saved money',
    'Accurate timing',
    'Clean metro',
    'Seamless handoff',
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const tripFare = routeData?.estimatedFare || 52;
  const cabEquivalent = routeData?.cabBaselineFare || 320;
  const savings = Math.max(0, cabEquivalent - tripFare);
  const duration = routeData?.durationMinutes || 38;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Success Icon & Header */}
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <CheckCircle2 size={44} color={COLORS.teal} />
          </View>
          <Text style={styles.title}>Trip Completed!</Text>
          <Text style={styles.subtitle}>You reached Ameerpet right on schedule</Text>
        </View>

        {/* Savings Hero Card */}
        <View style={styles.savingsCard}>
          <View style={styles.savingsHeader}>
            <TrendingDown size={22} color={COLORS.teal} />
            <Text style={styles.savingsLabel}>CityPilot Smart Savings</Text>
          </View>
          <Text style={styles.savingsAmount}>₹{savings}</Text>
          <Text style={styles.savingsSubtext}>
            Saved compared to a direct cab ride (₹{cabEquivalent})
          </Text>

          <View style={styles.ecoRow}>
            <Leaf size={16} color={COLORS.teal} />
            <Text style={styles.ecoText}>1.8 kg CO₂ footprint avoided by using Metro</Text>
          </View>
        </View>

        {/* Journey Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeading}>Journey Summary</Text>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Fare</Text>
              <Text style={styles.metricValue}>₹{tripFare}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Time</Text>
              <Text style={styles.metricValue}>{duration} min</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{routeData?.distanceKm || '12.4'} km</Text>
            </View>
          </View>

          <View style={styles.routeRouteBox}>
            <View style={styles.pointRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.pointText}>{routeData?.origin?.name || 'Gachibowli Circle'}</Text>
            </View>
            <View style={styles.verticalDash} />
            <View style={styles.pointRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.teal }]} />
              <Text style={styles.pointText}>{routeData?.destination?.name || 'Ameerpet Metro Hub'}</Text>
            </View>
          </View>
        </View>

        {/* Experience Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was your multimodal journey?</Text>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Star
                  size={36}
                  color={star <= rating ? COLORS.yellow : '#CBD5E1'}
                  fill={star <= rating ? COLORS.yellow : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tagsContainer}>
            {feedbackTags.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagPill, active && styles.tagPillActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              try {
                const { tripsAPI } = require('../services/api');
                await tripsAPI.createTrip({
                  routeTitle: routeData?.title || 'Bike → Metro → Walk',
                  costPaid: tripFare,
                  durationMinutes: duration,
                  rating: rating,
                  routeCategory: routeData?.category || 'BEST_BALANCE',
                });
              } catch (e) {}
              navigation.navigate('MainTabs');
            }}
          >
            <Home size={20} color={COLORS.cardBackground} />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  savingsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    alignItems: 'center',
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  savingsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savingsAmount: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.teal,
    lineHeight: 52,
  },
  savingsSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  ecoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 14,
  },
  ecoText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  routeRouteBox: {
    paddingTop: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pointText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  verticalDash: {
    width: 2,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
    marginVertical: 4,
  },
  ratingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tagTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  ctaContainer: {
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.cardBackground,
  },
});

