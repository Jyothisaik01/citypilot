import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react-native';
import Images from '../assets/images';
import colors from '../theme/colors';
import CityPilotLogo from '../components/CityPilotLogo';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    image: Images.slide1,
    badge: 'MULTIMODAL INTELLIGENCE',
    title: "Don't just book a ride.\nFind the smartest way there.",
    subtitle: 'CityPilot connects electric bikes, Hyderabad Metro, and walking to beat traffic jams and cut commute fares by up to 60%.',
    accentColor: colors.primary,
  },
  {
    id: 2,
    image: Images.slide2,
    badge: 'DECISION ENGINE',
    title: 'Compare time + cost +\nconvenience in 1-tap.',
    subtitle: 'Choose what matters most: Best Balance, Cheapest, Fastest, Maximum Comfort, or Eco-Friendly minimal footprint.',
    accentColor: '#10B981',
  },
  {
    id: 3,
    image: Images.slide3,
    badge: 'HYDERABAD MOBILITY',
    title: 'Integrated Metro,\nCabs, Autos & Pilots.',
    subtitle: 'Live Metro station tracking, WhatsApp & PhonePe 1-tap QR tickets, and direct CityPilot rides all in one app.',
    accentColor: '#7C3AED',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fade transition between slides
  const transitionToSlide = (nextIndex) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveSlide(nextIndex);
  };

  const handleNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      transitionToSlide(activeSlide + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const current = SLIDES[activeSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header & Skip */}
      <View style={styles.topHeader}>
        <CityPilotLogo size={32} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Illustration with Fade Transition */}
      <Animated.View style={[styles.visualContainer, { opacity: fadeAnim }]}>
        <View style={styles.imageCard}>
          <Image
            source={current.image}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      {/* Content Section */}
      <Animated.View style={[styles.contentBox, { opacity: fadeAnim }]}>
        <View style={[styles.badgePill, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
          <Sparkles size={13} color={colors.primary} />
          <Text style={styles.badgePillText}>{current.badge}</Text>
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        {/* Carousel Indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => transitionToSlide(idx)}
              style={[
                styles.dot,
                activeSlide === idx && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleNext} activeOpacity={0.88}>
          <Text style={styles.actionBtnText}>
            {activeSlide === SLIDES.length - 1 ? 'Get Started' : 'Next Step'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoTop: {
    width: 120,
    height: 36,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  imageCard: {
    width: width - 40,
    height: (width - 40) * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  contentBox: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
