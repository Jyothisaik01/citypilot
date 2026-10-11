import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  Share,
} from 'react-native';
import {
  Navigation as NavIcon,
  MapPin,
  ArrowRight,
  Compass,
  Volume2,
  VolumeX,
  X,
  Bike,
  TrainFront as Train,
  Footprints,
  Car,
  CircleCheck as CheckCircle2,
  MessageCircle,
  QrCode,
  ExternalLink,
  Share2,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import DynamicRouteMap from '../components/DynamicRouteMap';
import * as Location from 'expo-location';
import { formatDuration, formatDistance, formatFare } from '../utils/routeFormatters';

export default function NavigationScreen({ navigation, route }) {
  const { routeData, origin, destination } = route.params || {};

  const metroSeg = routeData?.segments?.find((s) => s.mode?.toLowerCase() === 'metro');
  const metroOrigin = metroSeg?.metroDetails?.originStation?.name || 'Raidurg';
  const metroDest = metroSeg?.metroDetails?.destStation?.name || 'Ameerpet';

  const originName = origin?.name || routeData?.origin?.name || 'Gachibowli';
  const destinationName = destination?.name || routeData?.destination?.name || 'Ameerpet';

  // Construct clear turn-by-turn steps without any undefined values
  const steps = React.useMemo(() => {
    if (routeData?.segments && routeData.segments.length > 0) {
      return routeData.segments.map((seg, idx) => {
        const m = (seg.mode || 'bike').toLowerCase();
        let mainText = '';
        let sub = '';

        if (m === 'bike' || m === 'auto' || m === 'cab') {
          mainText = seg.instruction || `Ride to Raidurg Metro Station Gate 2`;
          sub = `Take Old Mumbai Hwy • Park at Gate 2 Stand (${seg.distanceKm || 3.2} km)`;
        } else if (m === 'metro') {
          mainText = seg.instruction || `Board Blue Line towards Ameerpet Interchange`;
          sub = `Platform 1 • 9 Stations • Deboard at Ameerpet Exit C`;
        } else if (m === 'walk') {
          mainText = seg.instruction || `Walk to destination (${destinationName.split(',')[0]})`;
          sub = `Exit C • Follow Ameerpet Main Rd • ~${seg.distanceKm ? Math.round(seg.distanceKm * 1000) : 400}m remaining`;
        } else {
          mainText = seg.title || seg.instruction || 'Continue on route';
          sub = 'Follow turn-by-turn road guidance';
        }

        return {
          id: `step_${idx}`,
          mode: m,
          instruction: mainText,
          distance: seg.distanceKm ? `${seg.distanceKm} km` : `${seg.distanceMeters || 600}m`,
          time: `${seg.durationMinutes || 10} min`,
          subtext: sub,
        };
      });
    }

    return [
      {
        id: 's1',
        mode: 'bike',
        instruction: 'BIKE: Ride to Raidurg Metro Station (3.2 km)',
        distance: '3.2 km',
        time: '7 min',
        subtext: 'Head northeast on Old Mumbai Hwy • Park at Gate 2',
      },
      {
        id: 's2',
        mode: 'metro',
        instruction: 'METRO: Board Blue Line towards Ameerpet Hub',
        distance: '10.8 km',
        time: '24 min',
        subtext: 'Next train in 3 min • 9 stops • Deboard Platform 1',
      },
      {
        id: 's3',
        mode: 'walk',
        instruction: `WALK: Walk 400m to ${destinationName.split(',')[0]}`,
        distance: '400m',
        time: '5 min',
        subtext: 'Exit C • Destination is 400m ahead on left',
      },
    ];
  }, [routeData, destinationName]);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [speed, setSpeed] = useState(26);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCoord, setCurrentCoord] = useState(null);

  const currentStep = steps[activeStepIndex] || steps[0];

  // Real device GPS speed & location tracking (Strict: No simulation for walking)
  useEffect(() => {
    let watchSub = null;
    let fallbackTimer = null;

    const setupLiveGps = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          watchSub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 1500,
              distanceInterval: 1,
            },
            (location) => {
              if (location?.coords) {
                setCurrentCoord({
                  lat: location.coords.latitude,
                  lng: location.coords.longitude,
                });
                const spd = location.coords.speed;
                if (spd !== null && spd !== undefined && spd >= 0) {
                  setSpeed(Math.round(spd * 3.6)); // exact real-time GPS speed in km/h
                } else {
                  setSpeed(0);
                }
              }
            }
          );
        }
      } catch (e) {
        console.log('Live GPS watcher note:', e.message);
      }
    };

    setupLiveGps();

    // For vehicular steps (bike/auto/cab) when indoors without GPS fix, provide indicative cruising speed
    const currentMode = steps[activeStepIndex]?.mode;
    if (currentMode !== 'walk') {
      fallbackTimer = setInterval(() => {
        setSpeed((prev) => {
          if (prev > 0) return prev; // If real GPS has speed, keep it
          let baseSpeed = currentMode === 'metro' ? 45 : 28;
          const jitter = Math.random() * 4 - 2;
          return Math.max(0, Math.round(baseSpeed + jitter));
        });
      }, 2500);
    } else {
      // Walking mode: strictly 0 if no real movement detected
      setSpeed(0);
    }

    return () => {
      if (watchSub) watchSub.remove();
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [activeStepIndex, steps]);

  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      navigation.replace('TripCompleted', { routeData });
    }
  };

  const toggleAudio = () => {
    setIsMuted((prev) => !prev);
    Alert.alert(
      isMuted ? 'Voice Guidance Enabled' : 'Voice Guidance Muted',
      isMuted
        ? 'Turn-by-turn multimodal voice instructions are now active.'
        : 'Audio prompts muted.'
    );
  };

  const handleShareLiveLocation = async () => {
    const lat = currentCoord?.lat || origin?.lat || 17.44;
    const lng = currentCoord?.lng || origin?.lng || 78.3489;
    const liveUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const textMsg = encodeURIComponent(
      `📍 My Live Trip on CityPilot:\n` +
      `Heading to: ${destinationName}\n` +
      `Current Mode: ${currentStep.mode.toUpperCase()}\n` +
      `Live Coordinates: ${liveUrl}\n` +
      `Estimated Time: ${currentStep.time} remaining\n` +
      `Track my journey in real-time!`
    );
    const whatsappUrl = `whatsapp://send?text=${textMsg}`;
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({
          message: `📍 My Live Trip on CityPilot:\nHeading to: ${destinationName}\nLive Location: ${liveUrl}`,
        });
      }
    } catch (e) {
      Share.share({
        message: `📍 My Live Trip on CityPilot:\nHeading to: ${destinationName}\nLive Location: ${liveUrl}`,
      });
    }
  };

  const handleShareRoutePlan = async () => {
    const stepsSummary = steps.map((s, i) => `${i + 1}. [${s.mode.toUpperCase()}] ${s.instruction} (${s.time})`).join('\n');
    const textMsg = encodeURIComponent(
      `🗺️ CityPilot Route Plan:\n` +
      `From: ${originName}\n` +
      `To: ${destinationName}\n` +
      `Total Fare: ${formatFare(routeData?.estimatedFare ?? routeData?.estimatedCost ?? 52)}\n\n` +
      `Transit Steps:\n${stepsSummary}\n\n` +
      `Smart multimodal navigation via CityPilot Hyderabad`
    );
    const whatsappUrl = `whatsapp://send?text=${textMsg}`;
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({
          message: `🗺️ CityPilot Route Plan: ${originName} → ${destinationName}\n${stepsSummary}`,
        });
      }
    } catch (e) {
      Share.share({
        message: `🗺️ CityPilot Route Plan: ${originName} → ${destinationName}`,
      });
    }
  };

  const handleWhatsAppMetro = async () => {
    const textMsg = encodeURIComponent(
      `Hi! Book metro ticket from ${metroOrigin} to ${metroDest}`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=918341143211&text=${textMsg}`;
    try {
      await Linking.openURL(whatsappUrl);
    } catch (e) {
      Alert.alert('Metro Ticket Bot', 'Official L&T Metro WhatsApp: +91 83411 43211');
    }
  };

  const handlePhonePeMetro = async () => {
    try {
      const supported = await Linking.canOpenURL('phonepe://metro');
      if (supported) {
        await Linking.openURL('phonepe://metro');
      } else {
        await Linking.openURL('https://www.phonepe.com/');
      }
    } catch (e) {
      Alert.alert('PhonePe Metro', `Select ${metroOrigin} → ${metroDest} in PhonePe Metro.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* Top GPS Turn-by-Turn Guidance Banner */}
      <View style={styles.topHud}>
        <View style={styles.hudHeader}>
          <View style={styles.maneuverBadge}>
            <NavIcon size={24} color="#FFFFFF" />
          </View>
          <View style={styles.hudTextContainer}>
            <Text style={styles.hudDistance}>{currentStep.distance}</Text>
            <Text style={styles.hudInstruction} numberOfLines={2}>
              {currentStep.instruction}
            </Text>
          </View>
          <TouchableOpacity style={styles.audioButton} onPress={toggleAudio}>
            {isMuted ? (
              <VolumeX size={20} color="#94A3B8" />
            ) : (
              <Volume2 size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.hudSubtext} numberOfLines={1}>
          {currentStep.subtext}
        </Text>
      </View>

      {/* Map Guidance Area */}
      <View style={styles.mapContainer}>
        <DynamicRouteMap
          origin={origin || routeData?.origin || { name: originName, lat: 17.44, lng: 78.3489 }}
          destination={destination || routeData?.destination || { name: destinationName, lat: 17.4375, lng: 78.4483 }}
          route={routeData}
          driverLocation={currentCoord}
          style={{ height: '100%', borderRadius: 0, borderWidth: 0 }}
        />

        {/* Speedometer Overlay */}
        <View style={styles.speedOverlay}>
          <Text style={styles.speedValue}>{speed}</Text>
          <Text style={styles.speedUnit}>KM/H</Text>
        </View>

        {/* Step Indicator Badge */}
        <View style={styles.modeBadgeOverlay}>
          <Compass size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.modeBadgeText}>
            Step {activeStepIndex + 1} of {steps.length} • {currentStep.mode.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Bottom Live Navigation Dashboard */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <View style={styles.etaRow}>
          <View>
            <Text style={styles.etaTime}>
              {formatDuration(routeData?.totalDurationSeconds || (routeData?.durationMinutes ? routeData.durationMinutes * 60 : 37 * 60))} left
            </Text>
            <Text style={styles.etaDistance}>
              {formatDistance(routeData?.totalDistanceMeters || (routeData?.totalDistanceKm ? routeData.totalDistanceKm * 1000 : 14800))} • On time
            </Text>
          </View>
          <View style={styles.costPill}>
            <Text style={styles.costPillText}>
              {formatFare(routeData?.estimatedFare ?? routeData?.estimatedCost ?? 52)}
            </Text>
          </View>
        </View>

        {/* Step Progression Badges */}
        <View style={styles.stepProgressContainer}>
          {steps.map((st, i) => {
            const isActive = i === activeStepIndex;
            const isCompleted = i < activeStepIndex;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveStepIndex(i)}
                style={[
                  styles.stepProgressPill,
                  isActive && styles.stepProgressPillActive,
                  isCompleted && styles.stepProgressPillCompleted,
                ]}
              >
                {st.mode === 'bike' ? (
                  <Bike size={13} color={isActive ? '#FFFFFF' : '#64748B'} />
                ) : st.mode === 'metro' ? (
                  <Train size={13} color={isActive ? '#FFFFFF' : '#64748B'} />
                ) : (
                  <Footprints size={13} color={isActive ? '#FFFFFF' : '#64748B'} />
                )}
                <Text
                  style={[
                    styles.stepProgressPillText,
                    isActive && styles.stepProgressPillTextActive,
                    isCompleted && styles.stepProgressPillTextCompleted,
                  ]}
                >
                  {st.mode.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Metro Quick Action Card when active step is Metro */}
        {currentStep.mode === 'metro' && (
          <View style={styles.metroQuickCard}>
            <View style={styles.metroQuickTop}>
              <View style={styles.metroIconSmall}>
                <Train size={16} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metroQuickTitle}>
                  {metroOrigin} → {metroDest} (HMR)
                </Text>
                <Text style={styles.metroQuickSub}>
                  Skip queues • Instant QR entry
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('MetroDetails', { routeData })}
                style={styles.metroDetailsLink}
              >
                <Text style={styles.metroDetailsLinkText}>Stops</Text>
                <ExternalLink size={12} color="#0284C7" />
              </TouchableOpacity>
            </View>

            <View style={styles.metroQuickActions}>
              <TouchableOpacity
                style={styles.metroBtnWhatsApp}
                onPress={handleWhatsAppMetro}
                activeOpacity={0.85}
              >
                <MessageCircle size={15} color="#FFFFFF" />
                <Text style={styles.metroBtnWhatsAppText}>WhatsApp QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metroBtnPhonePe}
                onPress={handlePhonePeMetro}
                activeOpacity={0.85}
              >
                <QrCode size={15} color="#5F259F" />
                <Text style={styles.metroBtnPhonePeText}>PhonePe Metro</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* WhatsApp & Live Sharing Controls */}
        <View style={styles.shareRow}>
          <TouchableOpacity
            style={styles.shareLiveBtn}
            onPress={handleShareLiveLocation}
            activeOpacity={0.8}
          >
            <Share2 size={14} color="#10B981" />
            <Text style={styles.shareLiveText}>Share Live Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sharePlanBtn}
            onPress={handleShareRoutePlan}
            activeOpacity={0.8}
          >
            <MessageCircle size={14} color="#0A84FF" />
            <Text style={styles.sharePlanText}>Share Route Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <X size={18} color={COLORS.textSecondary} />
            <Text style={styles.cancelButtonText}>Exit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.advanceButton}
            onPress={handleNextStep}
            activeOpacity={0.88}
          >
            <Text style={styles.advanceButtonText}>
              {activeStepIndex === steps.length - 1 ? 'Finish Trip' : 'Next Step'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  topHud: {
    backgroundColor: '#0F1E36',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    zIndex: 10,
  },
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  maneuverBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  hudTextContainer: {
    flex: 1,
  },
  hudDistance: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  hudInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 2,
    lineHeight: 18,
  },
  hudSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    paddingLeft: 58,
  },
  audioButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  speedOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  speedValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  modeBadgeOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  etaTime: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  etaDistance: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  costPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  costPillText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A84FF',
  },
  stepProgressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepProgressPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  stepProgressPillActive: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  stepProgressPillCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  stepProgressPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
  },
  stepProgressPillTextActive: {
    color: '#FFFFFF',
  },
  stepProgressPillTextCompleted: {
    color: '#059669',
  },
  shareRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  shareLiveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  shareLiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  sharePlanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sharePlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  advanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  advanceButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  metroQuickCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  metroQuickTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metroIconSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metroQuickTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  metroQuickSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  metroDetailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  metroDetailsLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  metroQuickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  metroBtnWhatsApp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 9,
    borderRadius: 10,
  },
  metroBtnWhatsAppText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  metroBtnPhonePe: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    paddingVertical: 9,
    borderRadius: 10,
  },
  metroBtnPhonePeText: {
    color: '#5F259F',
    fontSize: 12,
    fontWeight: '800',
  },
});
