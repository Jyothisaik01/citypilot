import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import OreoAiAvatar from '../components/OreoAiAvatar';
import UserAvatar from '../components/UserAvatar';
import {
  MapPin,
  ArrowUpDown,
  Navigation,
  Bell,
  User,
  Search,
  Sparkles,
  Bike,
  Car,
  TrainFront as Train,
  Footprints,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  CircleCheck as CheckCircle2,
  Scale,
  Leaf,
  IndianRupee,
  Armchair,
} from 'lucide-react-native';
import CityPilotLogo from '../components/CityPilotLogo';
import CityPilotRideBookingModal from '../components/CityPilotRideBookingModal';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const TRANSPORT_MODES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'bike', label: 'Bike', icon: Bike },
  { id: 'auto', label: 'Auto', icon: Car },
  { id: 'car', label: 'Cab', icon: Car },
  { id: 'metro', label: 'Metro', icon: Train },
  { id: 'walk', label: 'Walk', icon: Footprints },
];

const PREFERENCES = [
  {
    id: 'balanced',
    title: 'Best Balance',
    desc: 'Time + Cost + Comfort',
    icon: Scale,
    badge: 'SMART',
    color: colors.primary,
  },
  {
    id: 'cheapest',
    title: 'Cheapest',
    desc: 'Save ₹70+ with Metro',
    icon: IndianRupee,
    badge: 'SAVE',
    color: colors.teal,
  },
  {
    id: 'fastest',
    title: 'Fastest',
    desc: 'Direct Cab / Bike express',
    icon: Zap,
    badge: 'FAST',
    color: colors.yellowDark,
  },
  {
    id: 'comfort',
    title: 'Comfortable',
    desc: 'AC transit, min walk',
    icon: Armchair,
    badge: 'EASY',
    color: colors.navy,
  },
  {
    id: 'eco',
    title: 'Eco Friendly',
    desc: 'Lowest CO2 emissions',
    icon: Leaf,
    badge: 'ECO',
    color: '#059669',
  },
  {
    id: 'direct',
    title: 'Direct Only',
    desc: 'Zero transfers cab/bike',
    icon: Navigation,
    badge: 'DIRECT',
    color: '#7C3AED',
  },
];

export default function HomeScreen({ route, navigation }) {
  const { appMode, toggleAppMode, user } = useAuth();
  const [origin, setOrigin] = useState({ name: 'Current location (Gachibowli)', lat: 17.4400, lng: 78.3489 });
  const [destination, setDestination] = useState({ name: 'Ameerpet, Hyderabad', lat: 17.4375, lng: 78.4483 });
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedPref, setSelectedPref] = useState('balanced');
  const [showPilotSimulation, setShowPilotSimulation] = useState(false);

  // 1. Load initial GPS location from storage if present
  useEffect(() => {
    const loadGpsLocation = async () => {
      try {
        const saved = await AsyncStorage.getItem('user_last_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name && parsed.lat) {
            setOrigin(parsed);
          }
        }
      } catch (e) {
        console.log('Error reading saved location:', e);
      }
    };
    loadGpsLocation();
  }, []);

  // 2. React to selectedPlace returned from SearchLocationScreen
  useEffect(() => {
    if (route?.params?.selectedPlace) {
      const { target, place } = route.params.selectedPlace;
      if (target === 'origin' && place) {
        setOrigin(place);
      } else if (target === 'destination' && place) {
        setDestination(place);
      }
    }
  }, [route?.params?.selectedPlace]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleFindRoutes = async () => {
    let maxWalkingKm = 6.0;
    try {
      const saved = await AsyncStorage.getItem('user_max_walk_km');
      if (saved) maxWalkingKm = parseFloat(saved);
    } catch (e) {}

    navigation.navigate('RouteCalculating', {
      origin,
      destination,
      preference: selectedPref,
      mode: appMode,
      maxWalkingKm,
    });
  };

  const handleSelectQuickDestination = (destName, lat, lng) => {
    setDestination({ name: destName, lat, lng });
  };

  const handleToggleMode = () => {
    const nextMode = appMode === 'full' ? 'normal' : 'full';
    toggleAppMode(nextMode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <CityPilotLogo size={38} showText={true} />

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Bell size={20} color={colors.navy} />
            <View style={styles.unreadDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <UserAvatar name={user?.name || 'Anusha Maram'} size={34} backgroundColor="#0A84FF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card: Where do you want to go? */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Where do you want to go?</Text>

          {/* Real-App Inspired Dual Location Inputs */}
          <View style={styles.realLocationCard}>
            {/* Visual connector with glowing pickup dot & destination pin */}
            <View style={styles.realRouteTimeline}>
              <View style={styles.realPickupDotOuter}>
                <View style={styles.realPickupDotInner} />
              </View>
              <View style={styles.realTimelineLine} />
              <View style={styles.realDestPinSquare}>
                <MapPin size={12} color="#FFFFFF" />
              </View>
            </View>

            {/* Two distinct tactile touch fields */}
            <View style={styles.realInputFieldsCol}>
              {/* Pickup field */}
              <TouchableOpacity
                style={styles.realFieldTouch}
                onPress={() => navigation.navigate('SearchLocation', { target: 'origin' })}
                activeOpacity={0.7}
              >
                <Text style={styles.realFieldTag}>PICKUP LOCATION</Text>
                <Text style={styles.realFieldMainText} numberOfLines={1}>{origin.name}</Text>
              </TouchableOpacity>

              <View style={styles.realFieldDivider} />

              {/* Destination field */}
              <TouchableOpacity
                style={styles.realFieldTouch}
                onPress={() => navigation.navigate('SearchLocation', { target: 'destination' })}
                activeOpacity={0.7}
              >
                <Text style={[styles.realFieldTag, { color: colors.primary }]}>DESTINATION</Text>
                <Text style={[styles.realFieldMainText, styles.realFieldDestText]} numberOfLines={1}>
                  {destination.name}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Floating circular Swap button with modern elevation */}
            <TouchableOpacity
              style={styles.realSwapBtn}
              onPress={handleSwap}
              activeOpacity={0.8}
            >
              <ArrowUpDown size={17} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Transportation Mode Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.transportScroll}
          >
            {TRANSPORT_MODES.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedMode === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedMode(item.id)}
                  style={[styles.transportPill, isSelected && styles.transportPillActive]}
                >
                  <IconComp
                    size={15}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text style={[styles.transportPillText, isSelected && styles.transportPillTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* What matters most? (3*2 Grid) */}
          <View style={styles.prefSection}>
            <View style={styles.prefHeaderRow}>
              <Text style={styles.prefHeading}>What matters most?</Text>
            </View>
            <Text style={styles.prefSubtitle}>Choose how CityPilot optimizes your commute</Text>

            <View style={styles.prefGrid}>
              {PREFERENCES.map((pref) => {
                const isSelected = selectedPref === pref.id;
                const IconComp = pref.icon;
                return (
                  <TouchableOpacity
                    key={pref.id}
                    onPress={() => setSelectedPref(pref.id)}
                    style={[
                      styles.prefCard,
                      isSelected && styles.prefCardActive,
                    ]}
                    activeOpacity={0.82}
                  >
                    <View style={styles.prefCardTop}>
                      <View
                        style={[
                          styles.prefIconCircle,
                          { backgroundColor: isSelected ? `${pref.color}15` : '#F1F5F9' },
                        ]}
                      >
                        <IconComp
                          size={17}
                          color={isSelected ? pref.color : '#64748B'}
                        />
                      </View>
                      <View
                        style={[
                          styles.prefBadge,
                          { backgroundColor: isSelected ? pref.color : '#F1F5F9' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.prefBadgeText,
                            { color: isSelected ? '#FFFFFF' : '#64748B' },
                          ]}
                        >
                          {pref.badge}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.prefCardTitle,
                        isSelected && { color: colors.navy, fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {pref.title}
                    </Text>
                    <Text style={styles.prefCardDesc} numberOfLines={1}>
                      {pref.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Primary CTA: Find Best Routes */}
          <TouchableOpacity
            style={styles.findBtn}
            onPress={handleFindRoutes}
            activeOpacity={0.88}
          >
            <Text style={styles.findBtnText}>Find Best Routes</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Destinations Row */}
        <View style={styles.quickSection}>
          <Text style={styles.quickSectionTitle}>Quick Destinations</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => handleSelectQuickDestination('Office (Hitech City)', 17.4475, 78.3845)}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Car size={18} color={colors.primary} />
              </View>
              <Text style={styles.quickName}>Office</Text>
              <Text style={styles.quickSub}>Hitech City</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => handleSelectQuickDestination('Ameerpet Metro', 17.4375, 78.4483)}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: colors.tealLight }]}>
                <Train size={18} color={colors.teal} />
              </View>
              <Text style={styles.quickName}>Metro</Text>
              <Text style={styles.quickSub}>Ameerpet Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => handleSelectQuickDestination('Home (Gachibowli)', 17.4400, 78.3489)}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: colors.yellowLight }]}>
                <Bike size={18} color={colors.yellowDark} />
              </View>
              <Text style={styles.quickName}>Home</Text>
              <Text style={styles.quickSub}>Gachibowli</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CityPilot Native Fleet Simulation Card */}
        <TouchableOpacity
          style={styles.pilotPromoCard}
          onPress={() => setShowPilotSimulation(true)}
          activeOpacity={0.88}
        >
          <View style={styles.pilotPromoLeft}>
            <View style={styles.pilotPromoBadge}>
              <View style={styles.pilotPromoDot} />
              <Text style={styles.pilotPromoBadgeText}>MODE 2 FLEET SIMULATION</Text>
            </View>
            <Text style={styles.pilotPromoTitle}>Experience CityPilot Ride & Gemini Chat</Text>
            <Text style={styles.pilotPromoSub}>
              Matching • Live map movement • Gemini AI chat • OTP verification • Rating
            </Text>
          </View>
          <View style={styles.pilotPromoAction}>
            <View style={styles.pilotPromoIconCircle}>
              <Bike size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.pilotPromoActionText}>Test Ride</Text>
          </View>
        </TouchableOpacity>

        {/* Oreo AI Transit & Cost Estimator Card */}
        <TouchableOpacity
          style={styles.oreoPromoCard}
          onPress={() => navigation.navigate('OreoChat')}
          activeOpacity={0.88}
        >
          <View style={styles.oreoPromoIconCircle}>
            <OreoAiAvatar size={44} useImage={true} />
          </View>
          <View style={styles.oreoPromoText}>
            <View style={styles.oreoPromoBadge}>
              <Text style={styles.oreoPromoBadgeText}>OREO AI COPILOT</Text>
            </View>
            <Text style={styles.oreoPromoTitle}>Ride Cost Estimations & Transit AI</Text>
            <Text style={styles.oreoPromoSub}>
              Ask Oreo for fare comparisons, fastest metro connections & traffic tips.
            </Text>
          </View>
          <ArrowRight size={18} color="#0A84FF" />
        </TouchableOpacity>

        {/* Feature Highlights Banner */}
        <View style={styles.smartBanner}>
          <View style={styles.smartBannerIcon}>
            <Sparkles size={20} color={colors.teal} />
          </View>
          <View style={styles.smartBannerText}>
            <Text style={styles.smartBannerTitle}>Smart Multimodal Engine Active</Text>
            <Text style={styles.smartBannerSub}>
              Compares Hyderabad Metro, Bike Taxis, and Cabs to save you up to 80% on commute costs.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CityPilot Ride Simulation Modal */}
      <CityPilotRideBookingModal
        visible={showPilotSimulation}
        onClose={() => setShowPilotSimulation(false)}
        vehicleType="CityPilot Bike"
        fare={28}
        pickup={origin?.name || 'Gachibowli Junction'}
        destination={destination?.name || 'Raidurg Metro Station'}
        originCoords={origin}
        destinationCoords={destination}
        onRideCompleted={() => setShowPilotSimulation(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smartModeBadge: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  smartModeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.tealDark,
  },
  headerIconBtn: {
    position: 'relative',
    padding: 6,
  },
  unreadDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.navy,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  realLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  realRouteTimeline: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
    paddingVertical: 4,
  },
  realPickupDotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  realPickupDotInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
  },
  realTimelineLine: {
    width: 2,
    height: 28,
    backgroundColor: '#CBD5E1',
    marginVertical: 3,
  },
  realDestPinSquare: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  realInputFieldsCol: {
    flex: 1,
    paddingRight: 38,
  },
  realFieldTouch: {
    paddingVertical: 4,
  },
  realFieldTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  realFieldMainText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
  },
  realFieldDestText: {
    color: colors.primary,
  },
  realFieldDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  realSwapBtn: {
    position: 'absolute',
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transportScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  transportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transportPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  transportPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  transportPillTextActive: {
    color: '#FFFFFF',
  },
  prefSection: {
    marginBottom: 22,
  },
  prefHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  prefHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 0.2,
  },
  prefSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  prefGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  prefCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  prefCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F8FAFC',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  prefCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prefIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  prefBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  prefCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 2,
  },
  prefCardDesc: {
    fontSize: 10.5,
    color: '#64748B',
  },
  findBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  findBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  quickSection: {
    marginBottom: 20,
  },
  quickSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: {
    width: (width - 48) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  quickSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  smartBanner: {
    flexDirection: 'row',
    backgroundColor: colors.tealLight,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 195, 142, 0.3)',
  },
  smartBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smartBannerText: {
    flex: 1,
  },
  smartBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.tealDark,
  },
  smartBannerSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  pilotPromoCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  pilotPromoLeft: {
    flex: 1,
    paddingRight: 12,
  },
  pilotPromoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pilotPromoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  pilotPromoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  pilotPromoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pilotPromoSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  pilotPromoAction: {
    alignItems: 'center',
    gap: 4,
  },
  pilotPromoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pilotPromoActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  oreoHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  oreoHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A84FF',
  },
  oreoPromoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  oreoPromoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  oreoPromoText: {
    flex: 1,
  },
  oreoPromoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  oreoPromoBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  oreoPromoTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  oreoPromoSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
});

