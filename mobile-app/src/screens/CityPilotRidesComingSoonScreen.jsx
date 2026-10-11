import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
    StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Car,
  Bike,
  Sparkles,
  ShieldCheck,
  Zap,
  CircleCheck as CheckCircle2,
  Clock,
  Send,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function CityPilotRidesComingSoonScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleJoinWaitlist = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Please enter a valid email', 'We will notify you when CityPilot Rides launch in your sector.');
      return;
    }
    setSubscribed(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CityPilot Rides</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Badge & Icon */}
        <View style={styles.heroCenter}>
          <View style={styles.heroIconCircle}>
            <Car size={40} color={COLORS.teal} />
          </View>
          <View style={styles.tagPill}>
            <Clock size={12} color="#D97706" />
            <Text style={styles.tagPillText}>IN DEVELOPMENT • PHASE 2</Text>
          </View>
          <Text style={styles.heroTitle}>Direct CityPilot Fleet</Text>
          <Text style={styles.heroSubtitle}>
            We're building an integrated driver network specifically optimized for Metro first-mile and last-mile connectivity.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.cardSection}>
          <View style={styles.featureItem}>
            <View style={[styles.itemIcon, { backgroundColor: COLORS.tealLight }]}>
              <Zap size={20} color={COLORS.teal} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Zero Surge Metro Guarantee</Text>
              <Text style={styles.itemSubtitle}>
                Flat, predictable per-kilometer pricing without rain or peak hour surges.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.itemIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Bike size={20} color={COLORS.primary} />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Dedicated Metro Station Pickups</Text>
              <Text style={styles.itemSubtitle}>
                Designated pick-and-drop bays right beside Hyderabad Metro entry gates.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.itemIcon, { backgroundColor: '#FEF3C7' }]}>
              <ShieldCheck size={20} color="#D97706" />
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>100% Background-Verified Pilots</Text>
              <Text style={styles.itemSubtitle}>
                Verified local drivers trained for customer safety and smooth transit transfers.
              </Text>
            </View>
          </View>
        </View>

        {/* Waitlist Box */}
        <View style={styles.waitlistBox}>
          {subscribed ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={32} color={COLORS.teal} />
              <Text style={styles.successTitle}>You're on the early access list!</Text>
              <Text style={styles.successSubtitle}>
                We'll send you an invitation and ₹100 credit when CityPilot Rides launch in Hyderabad.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.waitlistTitle}>Get early access & ₹100 credit</Text>
              <Text style={styles.waitlistSubtitle}>
                Be the first to book CityPilot Bikes and Autos in Hitec City, Gachibowli, and Ameerpet.
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleJoinWaitlist}
                >
                  <Send size={18} color={COLORS.cardBackground} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Back to Smart Travel */}
        <TouchableOpacity
          style={styles.backToSmartButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backToSmartText}>Continue using Smart Travel Mode</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCenter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 12,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  cardSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 18,
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  waitlistBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 20,
  },
  waitlistTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  waitlistSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.teal,
  },
  successSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  backToSmartButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  backToSmartText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

