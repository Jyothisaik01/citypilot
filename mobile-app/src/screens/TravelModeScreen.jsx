import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
    StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import CustomPopupModal from '../components/CustomPopupModal';
import {
  ArrowLeft,
  Compass,
  Car,
  CircleCheck as CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal as Sliders,
  Info,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { getFeatures, updateFeatures } from '../services/api';

export default function TravelModeScreen({ navigation }) {
  const [features, setFeatures] = useState({
    ownRideNetworkEnabled: false,
    externalProvidersEnabled: true,
  });
  const [selectedMode, setSelectedMode] = useState('smart_travel');
  const [loading, setLoading] = useState(false);

  // Custom Branded Popup Modal
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const f = await getFeatures();
      setFeatures(f);
      if (f.ownRideNetworkEnabled) {
        setSelectedMode('citypilot_rides');
      } else {
        setSelectedMode('smart_travel');
      }
    } catch (err) {
      console.log('Error fetching features:', err);
    }
  };

  const handleSelectMode = (mode) => {
    if (mode === 'citypilot_rides' && !features.ownRideNetworkEnabled) {
      navigation.navigate('CityPilotRidesComingSoon');
      return;
    }
    setSelectedMode(mode);
  };

  const toggleNetworkFlag = async (value) => {
    setLoading(true);
    try {
      const updated = await updateFeatures({ ownRideNetworkEnabled: value });
      setFeatures(updated);
      setSelectedMode(value ? 'citypilot_rides' : 'smart_travel');
      setPopup({
        visible: true,
        type: 'info',
        title: 'Travel Mode Updated',
        message: value
          ? 'Direct Ride Booking is active! You can now book CityPilot bike, auto, and cab rides with live driver tracking.'
          : 'Smart Transit Mode is active! CityPilot will find the fastest & cheapest routes combining Metro, cabs, and bikes.',
      });
    } catch (err) {
      setPopup({
        visible: true,
        type: 'danger',
        title: 'Update Failed',
        message: 'Could not update travel mode setting. Please check your connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.introHeading}>Choose your travel experience</Text>
        <Text style={styles.introSubtitle}>
          Select how CityPilot plans and executes your daily transit journeys in Hyderabad.
        </Text>

        {/* Option 1: Smart Travel (Recommended V1 Default) */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === 'smart_travel' && styles.modeCardSelected,
          ]}
          onPress={() => handleSelectMode('smart_travel')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
              <Compass size={24} color={COLORS.primary} />
            </View>
            <View style={styles.badgeContainer}>
              <View style={styles.recommendedBadge}>
                <CheckCircle2 size={13} color={COLORS.cardBackground} />
                <Text style={styles.recommendedBadgeText}>Recommended</Text>
              </View>
            </View>
          </View>

          <Text style={styles.modeTitle}>Smart Travel</Text>
          <Text style={styles.modeDescription}>
            Find the smartest multimodal route (Metro, Bike, Auto, Walk) and continue seamlessly with verified mobility providers like Uber and Rapido.
          </Text>

          <View style={styles.featurePoints}>
            <Text style={styles.featurePoint}>• Real Hyderabad Metro timetable & fares</Text>
            <Text style={styles.featurePoint}>• Uber & Rapido pre-filled deep links</Text>
            <Text style={styles.featurePoint}>• Save up to 75% on daily commute fares</Text>
          </View>

          {selectedMode === 'smart_travel' && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>Currently Active</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Option 2: CityPilot Rides */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === 'citypilot_rides' && styles.modeCardSelected,
            !features.ownRideNetworkEnabled && styles.modeCardDisabled,
          ]}
          onPress={() => handleSelectMode('citypilot_rides')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.tealLight }]}>
              <Car size={24} color={COLORS.teal} />
            </View>
            <View style={styles.badgeContainer}>
              {features.ownRideNetworkEnabled ? (
                <View style={[styles.recommendedBadge, { backgroundColor: COLORS.teal }]}>
                  <Sparkles size={13} color={COLORS.cardBackground} />
                  <Text style={styles.recommendedBadgeText}>Active</Text>
                </View>
              ) : (
                <View style={styles.comingSoonBadge}>
                  <Clock size={13} color="#D97706" />
                  <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.modeTitle}>CityPilot Rides</Text>
          <Text style={styles.modeDescription}>
            Book directly with CityPilot's own dedicated fleet of verified bike taxis, autos, and cabs with fixed multimodal transfer discounts.
          </Text>

          <View style={styles.featurePoints}>
            <Text style={styles.featurePoint}>• In-app driver dispatch & live tracking</Text>
            <Text style={styles.featurePoint}>• Fixed transparent fare without surge</Text>
            <Text style={styles.featurePoint}>• Station first-mile & last-mile lockers</Text>
          </View>

          {!features.ownRideNetworkEnabled ? (
            <View style={styles.comingSoonNotice}>
              <Info size={16} color="#64748B" />
              <Text style={styles.comingSoonNoticeText}>
                CityPilot Rides are rolling out soon across Hitec City & Gachibowli.
              </Text>
            </View>
          ) : selectedMode === 'citypilot_rides' ? (
            <View style={[styles.selectedIndicator, { backgroundColor: COLORS.tealLight }]}>
              <Text style={[styles.selectedIndicatorText, { color: COLORS.teal }]}>
                Currently Active
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Direct Ride Booking Setting */}
        <View style={styles.devCard}>
          <View style={styles.devHeader}>
            <Car size={18} color={COLORS.primary} />
            <Text style={styles.devTitle}>Direct Ride Booking</Text>
          </View>
          <Text style={styles.devDescription}>
            Toggle on to book CityPilot bike, auto, and cab rides directly alongside smart multimodal transit recommendations.
          </Text>
          <View style={styles.devToggleRow}>
            <Text style={styles.devToggleLabel}>
              Enable Direct Ride Booking
            </Text>
            <Switch
              value={features.ownRideNetworkEnabled}
              onValueChange={toggleNetworkFlag}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
              thumbColor={COLORS.cardBackground}
              disabled={loading}
            />
          </View>
        </View>

      </ScrollView>

      {/* Branded Custom Popup Dialog */}
      <CustomPopupModal
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onConfirm={() => setPopup((p) => ({ ...p, visible: false }))}
      />
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
  introHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  introSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  modeCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeCardSelected: {
    borderColor: COLORS.primary,
  },
  modeCardDisabled: {
    opacity: 0.9,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {},
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cardBackground,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  comingSoonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modeDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  featurePoints: {
    gap: 6,
    marginBottom: 14,
  },
  featurePoint: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedIndicator: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  comingSoonNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
  },
  comingSoonNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  devCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  devTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  devDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  devToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 12,
  },
  devToggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

