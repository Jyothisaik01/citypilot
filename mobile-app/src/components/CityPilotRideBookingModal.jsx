import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import CustomPopupModal from './CustomPopupModal';
import {
  Bike,
  Car,
  Star,
  Phone,
  Shield,
  CircleCheck as CheckCircle2,
  Clock,
  X,
  Navigation,
  MessageCircle,
  Copy,
  ChevronRight,
  Sparkles,
  MapPin,
  Check,
  ThumbsUp,
  HeartHandshake,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import SimulationPilotMap from './SimulationPilotMap';
import PilotChatModal from './PilotChatModal';
import { pilotRidesAPI } from '../services/api';

export default function CityPilotRideBookingModal({
  visible,
  onClose,
  vehicleType = 'CityPilot Bike',
  fare = 28,
  pickup = 'Gachibowli Junction',
  destination = 'Raidurg Metro Station Gate 2',
  originCoords = { lat: 17.4401, lng: 78.3489, name: 'Gachibowli' },
  destinationCoords = { lat: 17.4428, lng: 78.3772, name: 'Raidurg Metro' },
  onRideCompleted,
}) {
  // Simulation Steps:
  // 'searching' -> 'found' -> 'accepted' -> 'arriving' -> 'arrived_otp' -> 'navigating' -> 'ended_rating'
  const [step, setStep] = useState('searching');
  const [etaMinutes, setEtaMinutes] = useState(3);
  const [chatVisible, setChatVisible] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const [speed, setSpeed] = useState(34);
  const [remainingDistKm, setRemainingDistKm] = useState(3.2);

  // Radar Animation for Searching Step
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Rating State
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Smooth ride', 'Clean helmet']);
  const [selectedTip, setSelectedTip] = useState(0);

  // Vehicle type selection ('bike' | 'auto' | 'cab')
  const initialMode = vehicleType?.toLowerCase()?.includes('auto')
    ? 'auto'
    : vehicleType?.toLowerCase()?.includes('cab') || vehicleType?.toLowerCase()?.includes('car')
    ? 'cab'
    : 'bike';

  const [selectedVehicle, setSelectedVehicle] = useState(initialMode);

  const VEHICLE_FLEET = {
    bike: {
      type: 'bike',
      name: 'CityPilot Bike',
      fare: fare || 28,
      driver: {
        name: 'Ramesh Kumar',
        avatarInitial: 'RK',
        rating: 4.9,
        trips: '1,420 trips',
        vehicle: 'TVS Raider 125 • TS 09 UB 4821',
        plateNumber: 'TS 09 UB 4821',
        phone: '+91 98490 12345',
        otp: '4821',
      },
    },
    auto: {
      type: 'auto',
      name: 'CityPilot Auto',
      fare: Math.round((fare || 28) * 1.5),
      driver: {
        name: 'Satyanarayana M.',
        avatarInitial: 'SM',
        rating: 4.8,
        trips: '2,150 trips',
        vehicle: 'Bajaj RE Auto • TS 08 EA 6543',
        plateNumber: 'TS 08 EA 6543',
        phone: '+91 98491 54321',
        otp: '3652',
      },
    },
    cab: {
      type: 'cab',
      name: 'CityPilot Cab',
      fare: Math.round((fare || 28) * 3.2),
      driver: {
        name: 'Venkat Rao',
        avatarInitial: 'VR',
        rating: 4.9,
        trips: '3,480 trips',
        vehicle: 'Maruti Dzire Sedan • TS 07 CD 8765',
        plateNumber: 'TS 07 CD 8765',
        phone: '+91 98492 87654',
        otp: '8914',
      },
    },
  };

  const activeFleet = VEHICLE_FLEET[selectedVehicle] || VEHICLE_FLEET.bike;
  const pilot = matchedPilot
    ? {
        name: matchedPilot.name,
        avatarInitial: matchedPilot.avatarInitial || matchedPilot.name.slice(0, 2).toUpperCase(),
        rating: matchedPilot.rating || 4.9,
        trips: `${matchedPilot.totalTrips || '1,420'} trips`,
        vehicle:
          matchedPilot.vehicle ||
          `${matchedPilot.vehicleModel || 'Vehicle'} • ${matchedPilot.plateNumber || 'TS 09 UB 4821'}`,
        plateNumber: matchedPilot.plateNumber || 'TS 09 UB 4821',
        phone: matchedPilot.phone || '+91 98490 12345',
        otp: currentOtp || '4821',
        id: matchedPilot.id || matchedPilot._id,
      }
    : activeFleet.driver;
  const currentFare = activeFleet.fare;

  const feedbackTags = [
    'Smooth ride',
    'Polite pilot',
    'Clean helmet',
    'Safe driving',
    'On time pickup',
  ];

  // Dynamic matched driver from MongoDB pool
  const [matchedPilot, setMatchedPilot] = useState(null);
  const [currentRideId, setCurrentRideId] = useState('cpride_' + Date.now());
  const [currentOtp, setCurrentOtp] = useState('4821');

  // Lifecycle state machine with realistic pacing
  useEffect(() => {
    let t1, t2, t3;
    if (visible) {
      setStep('searching');
      setOtpVerified(false);
      setNavProgress(0);
      setEtaMinutes(3);
      setRemainingDistKm(3.2);

      // Radar pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Fetch randomly matched real driver from MongoDB pool
      pilotRidesAPI
        .requestRide({
          pickup,
          destination,
          vehicleType: selectedVehicle,
          fare: currentFare,
        })
        .then((res) => {
          if (res?.ride) {
            if (res.ride.id) setCurrentRideId(res.ride.id);
            if (res.ride.otp) setCurrentOtp(res.ride.otp);
            if (res.ride.driver) setMatchedPilot(res.ride.driver);
          }
        })
        .catch(() => {});

      // Paced Step 1: Searching for rider -> Found after 6.0s
      t1 = setTimeout(() => {
        setStep('found');
      }, 6000);

      // Paced Step 2: Found -> Accepted after 5.0s (11s total)
      t2 = setTimeout(() => {
        setStep('accepted');
      }, 11000);

      // Paced Step 3: Accepted -> Arriving after 4.5s (15.5s total)
      t3 = setTimeout(() => {
        setStep('arriving');
      }, 15500);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, selectedVehicle]);

  // Handle countdown during arriving phase
  useEffect(() => {
    let etaTimer;
    if (step === 'arriving' && etaMinutes > 0) {
      etaTimer = setInterval(() => {
        setEtaMinutes((prev) => {
          if (prev <= 1) {
            clearInterval(etaTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 5000);
    }
    return () => clearInterval(etaTimer);
  }, [step, etaMinutes]);

  // Handle speed and distance jitter during navigation
  useEffect(() => {
    let navInterval;
    if (step === 'navigating') {
      navInterval = setInterval(() => {
        setSpeed(Math.round(30 + Math.random() * 8));
        setRemainingDistKm((prev) => Math.max(0.1, Number((prev - 0.25).toFixed(1))));
      }, 1500);
    }
    return () => clearInterval(navInterval);
  }, [step]);

  const handleSimulateArriveAtPickup = () => {
    setStep('arrived_otp');
  };

  const handleVerifyOtp = async () => {
    setOtpVerified(true);
    try {
      await pilotRidesAPI.verifyOtp(currentRideId, pilot.otp);
    } catch (e) {}

    setTimeout(() => {
      setStep('navigating');
    }, 1400);
  };

  const handleEndRide = () => {
    setStep('ended_rating');
  };

  const handleCompleteRating = async () => {
    try {
      await pilotRidesAPI.submitRating({
        rideId: currentRideId,
        driverId: pilot?.id || null,
        driverName: pilot?.name,
        vehicleType: selectedVehicle,
        rating,
        feedbackTags: selectedTags,
        tip: selectedTip,
      });
    } catch (e) {}

    onClose();
    if (onRideCompleted) {
      onRideCompleted();
    }
  };

  const toggleTag = (t) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const [callModalVisible, setCallModalVisible] = useState(false);

  const copyOtp = () => {
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  const handleCallPilot = () => {
    setCallModalVisible(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <View style={styles.liveDot} />
                <Text style={styles.badgeText}>CITYPILOT FLEET (MODE 2)</Text>
              </View>
              <Text style={styles.headerTitle}>
                {step === 'searching' && 'Finding nearest pilot...'}
                {step === 'found' && 'Pilot Match Found!'}
                {step === 'accepted' && 'Ride Accepted!'}
                {step === 'arriving' && `Pilot Arriving in ${etaMinutes > 0 ? `${etaMinutes} min` : '1 min'}`}
                {step === 'arrived_otp' && 'Pilot at Pickup • Share OTP'}
                {step === 'navigating' && 'Trip in Progress'}
                {step === 'ended_rating' && 'Trip Completed!'}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* STEP 1: SEARCHING */}
          {step === 'searching' && (
            <View style={styles.searchingContainer}>
              <Animated.View
                style={[
                  styles.radarCircle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {selectedVehicle === 'cab' ? (
                  <Car size={32} color="#0A84FF" />
                ) : selectedVehicle === 'auto' ? (
                  <Navigation size={32} color="#16A34A" />
                ) : (
                  <Bike size={32} color="#0A84FF" />
                )}
              </Animated.View>
              <Text style={styles.searchingTitle}>
                Contacting nearby {activeFleet.name}s...
              </Text>
              <Text style={styles.searchingSubtext}>
                Searching within 2 km of {pickup.split(',')[0]}
              </Text>

              {/* Mode Switcher */}
              <View style={styles.vehicleSelectRow}>
                {['bike', 'auto', 'cab'].map((vKey) => {
                  const isCur = selectedVehicle === vKey;
                  const item = VEHICLE_FLEET[vKey];
                  return (
                    <TouchableOpacity
                      key={vKey}
                      style={[
                        styles.vehicleSelectBtn,
                        isCur && styles.vehicleSelectBtnActive,
                      ]}
                      onPress={() => setSelectedVehicle(vKey)}
                    >
                      {vKey === 'bike' ? (
                        <Bike size={14} color={isCur ? '#FFFFFF' : '#64748B'} />
                      ) : vKey === 'auto' ? (
                        <Navigation size={14} color={isCur ? '#FFFFFF' : '#64748B'} />
                      ) : (
                        <Car size={14} color={isCur ? '#FFFFFF' : '#64748B'} />
                      )}
                      <Text
                        style={[
                          styles.vehicleSelectText,
                          isCur && styles.vehicleSelectTextActive,
                        ]}
                      >
                        {vKey.toUpperCase()} ₹{item.fare}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.fareLockBox}>
                <Text style={styles.fareLockLabel}>Fixed Fare</Text>
                <Text style={styles.fareLockAmount}>₹{currentFare}</Text>
              </View>
            </View>
          )}

          {/* STEP 2: FOUND */}
          {step === 'found' && (
            <View style={styles.foundContainer}>
              <View style={styles.matchIconBox}>
                <CheckCircle2 size={38} color="#10B981" />
              </View>
              <Text style={styles.matchTitle}>{activeFleet.name} Found!</Text>
              <Text style={styles.matchSub}>{pilot.name} is accepting your request...</Text>
              <ActivityIndicator size="small" color="#0A84FF" style={{ marginTop: 12 }} />
            </View>
          )}

          {/* STEP 3: ACCEPTED */}
          {step === 'accepted' && (
            <View style={styles.acceptedContainer}>
              <View style={styles.acceptedBanner}>
                <Sparkles size={16} color="#0A84FF" />
                <Text style={styles.acceptedBannerText}>{activeFleet.name} Accepted Your Ride!</Text>
              </View>
              {renderPilotCard(pilot)}
              <Text style={styles.arrivingHint}>Preparing route to pickup location...</Text>
            </View>
          )}

          {/* STEP 4: ARRIVING */}
          {step === 'arriving' && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              {/* Live Interactive Map showing pilot coming to user */}
              <View style={styles.mapWrapper}>
                <SimulationPilotMap
                  phase="arriving"
                  vehicleType={selectedVehicle}
                  origin={originCoords}
                  destination={destinationCoords}
                  height={190}
                  onProgress={(data) => {
                    if (data?.type === 'completed') {
                      handleSimulateArriveAtPickup();
                    }
                  }}
                />
              </View>

              {/* Pilot Card */}
              {renderPilotCard(pilot)}

              {/* Start OTP Card */}
              <View style={styles.otpCard}>
                <View style={styles.otpHeaderRow}>
                  <Text style={styles.otpPrompt}>RIDE START OTP</Text>
                  <TouchableOpacity onPress={copyOtp} style={styles.copyBtn}>
                    <Copy size={13} color="#0A84FF" />
                    <Text style={styles.copyText}>{otpCopied ? 'Copied' : 'Copy'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.otpDigitRow}>
                  {pilot.otp.split('').map((digit, idx) => (
                    <View key={idx} style={styles.digitBox}>
                      <Text style={styles.digitText}>{digit}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.otpSecurityHint}>
                  Share only when pilot Ramesh arrives at your pickup point
                </Text>
              </View>

              {/* Action Buttons: Chat & Call */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => setChatVisible(true)}
                >
                  <MessageCircle size={18} color="#FFFFFF" />
                  <Text style={styles.chatButtonText}>Chat with Pilot</Text>
                  <View style={styles.aiPill}>
                    <Sparkles size={10} color="#FFFFFF" />
                    <Text style={styles.aiPillText}>Gemini AI</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.callButton} onPress={handleCallPilot}>
                  <Phone size={18} color="#0F172A" />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.simulateArriveBtn}
                  onPress={handleSimulateArriveAtPickup}
                >
                  <ChevronRight size={18} color="#0A84FF" />
                  <Text style={styles.simulateArriveText}>Pilot Arrived</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* STEP 5: ARRIVED & OTP VERIFICATION */}
          {step === 'arrived_otp' && (
            <View style={styles.otpVerifyContainer}>
              <View style={styles.arrivedBanner}>
                <MapPin size={20} color="#10B981" />
                <Text style={styles.arrivedBannerText}>
                  Ramesh has arrived at {pickup.split(',')[0]}!
                </Text>
              </View>

              {renderPilotCard(pilot)}

              <View style={styles.verificationBox}>
                <Text style={styles.verifyTitle}>VERIFY START OTP</Text>
                <View style={styles.otpDigitRow}>
                  {pilot.otp.split('').map((digit, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.digitBox,
                        otpVerified && { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.digitText,
                          otpVerified && { color: '#047857' },
                        ]}
                      >
                        {digit}
                      </Text>
                    </View>
                  ))}
                </View>

                {otpVerified ? (
                  <View style={styles.verifiedSuccess}>
                    <CheckCircle2 size={24} color="#10B981" />
                    <Text style={styles.verifiedText}>OTP Verified! Helmets On. Starting Ride...</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.verifyConfirmBtn}
                    onPress={handleVerifyOtp}
                  >
                    <Check size={18} color="#FFFFFF" />
                    <Text style={styles.verifyConfirmText}>Share & Start Ride</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.chatLinkRow}
                onPress={() => setChatVisible(true)}
              >
                <MessageCircle size={15} color="#0A84FF" />
                <Text style={styles.chatLinkText}>Need directions? Message Ramesh</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 6: NAVIGATING */}
          {step === 'navigating' && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              <View style={styles.mapWrapper}>
                <SimulationPilotMap
                  phase="navigating"
                  vehicleType={selectedVehicle}
                  origin={originCoords}
                  destination={destinationCoords}
                  height={190}
                  onProgress={(data) => {
                    if (data?.type === 'step') {
                      setNavProgress(data.percent);
                    }
                    if (data?.type === 'completed') {
                      handleEndRide();
                    }
                  }}
                />
              </View>

              {/* Live Telemetry Card */}
              <View style={styles.telemetryCard}>
                <View style={styles.telemetryCol}>
                  <Text style={styles.telemetryVal}>{speed} km/h</Text>
                  <Text style={styles.telemetryLabel}>Speed</Text>
                </View>
                <View style={styles.telemetryDivider} />
                <View style={styles.telemetryCol}>
                  <Text style={styles.telemetryVal}>{remainingDistKm} km</Text>
                  <Text style={styles.telemetryLabel}>Remaining</Text>
                </View>
                <View style={styles.telemetryDivider} />
                <View style={styles.telemetryCol}>
                  <Text style={styles.telemetryVal}>
                    {Math.max(1, Math.round(remainingDistKm * 2))} min
                  </Text>
                  <Text style={styles.telemetryLabel}>ETA</Text>
                </View>
              </View>

              {/* Destination Dropoff Info */}
              <View style={styles.destStrip}>
                <MapPin size={18} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.destStripLabel}>Drop-off Location</Text>
                  <Text style={styles.destStripValue} numberOfLines={1}>
                    {destination}
                  </Text>
                </View>
              </View>

              {/* Chat & End Simulation Buttons */}
              <View style={styles.navActionsRow}>
                <TouchableOpacity
                  style={styles.navChatBtn}
                  onPress={() => setChatVisible(true)}
                >
                  <MessageCircle size={16} color="#0A84FF" />
                  <Text style={styles.navChatText}>Chat Pilot</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.endRideBtn}
                  onPress={handleEndRide}
                >
                  <Text style={styles.endRideText}>Complete Ride Simulation</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* STEP 7: TRIP ENDED & RATING */}
          {step === 'ended_rating' && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              <View style={styles.ratingHeader}>
                <View style={styles.ratingCheckCircle}>
                  <CheckCircle2 size={36} color="#10B981" />
                </View>
                <Text style={styles.ratingTitle}>You Have Arrived Safely!</Text>
                <Text style={styles.ratingSubtitle}>
                  Dropped at {destination.split(',')[0]} • ₹{fare} paid
                </Text>
              </View>

              {/* Star Rating Selector */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <TouchableOpacity
                    key={starVal}
                    onPress={() => setRating(starVal)}
                    style={styles.starBtn}
                  >
                    <Star
                      size={32}
                      color={starVal <= rating ? '#F59E0B' : '#CBD5E1'}
                      fill={starVal <= rating ? '#F59E0B' : 'none'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ratingPrompt}>Rate your ride with {pilot.name}</Text>

              {/* Feedback Badges */}
              <View style={styles.tagsContainer}>
                {feedbackTags.map((tag, idx) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.tagChip,
                        isSelected && styles.tagChipSelected,
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text
                        style={[
                          styles.tagChipText,
                          isSelected && styles.tagChipTextSelected,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tip Selection */}
              <View style={styles.tipBox}>
                <Text style={styles.tipLabel}>Add a tip for Ramesh?</Text>
                <View style={styles.tipRow}>
                  {[0, 10, 20, 50].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.tipBtn,
                        selectedTip === amount && styles.tipBtnSelected,
                      ]}
                      onPress={() => setSelectedTip(amount)}
                    >
                      <Text
                        style={[
                          styles.tipBtnText,
                          selectedTip === amount && styles.tipBtnTextSelected,
                        ]}
                      >
                        {amount === 0 ? 'No Tip' : `₹${amount}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit & Return */}
              <TouchableOpacity
                style={styles.submitRatingBtn}
                onPress={handleCompleteRating}
              >
                <Text style={styles.submitRatingText}>Submit & Continue</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Gemini AI Pilot Chat Modal */}
          <PilotChatModal
            visible={chatVisible}
            onClose={() => setChatVisible(false)}
            pilot={pilot}
            pickup={pickup}
            destination={destination}
            etaMinutes={etaMinutes}
            status={step}
          />

          {/* Branded In-App Call Dialog */}
          <CustomPopupModal
            visible={callModalVisible}
            type="info"
            title={`Calling Pilot ${pilot?.name || 'Partner'}`}
            message={`Dialing ${pilot?.phone || '+91 98490 12345'}...\n\n"Namaste! I am on the way and reaching your pickup point in 2 minutes."`}
            confirmText="OK"
            onConfirm={() => setCallModalVisible(false)}
          />
        </View>
      </View>
    </Modal>
  );

  function renderPilotCard(p) {
    const isCab = selectedVehicle === 'cab';
    const isAuto = selectedVehicle === 'auto';
    return (
      <View style={styles.pilotCard}>
        <View
          style={[
            styles.pilotAvatar,
            isCab && { backgroundColor: '#0F172A' },
            isAuto && { backgroundColor: '#16A34A' },
          ]}
        >
          <Text style={styles.pilotAvatarText}>{p.avatarInitial}</Text>
        </View>
        <View style={styles.pilotDetails}>
          <View style={styles.pilotNameRow}>
            <Text style={styles.pilotNameText}>{p.name}</Text>
            <View style={styles.ratingBadge}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingBadgeText}>{p.rating}</Text>
            </View>
            <Text style={styles.tripsText}>• {p.trips}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            {isCab ? (
              <Car size={13} color="#0F172A" />
            ) : isAuto ? (
              <Navigation size={13} color="#16A34A" />
            ) : (
              <Bike size={13} color="#0A84FF" />
            )}
            <Text style={styles.vehicleText}>{p.vehicle}</Text>
          </View>
          <View style={styles.verifiedRow}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.verifiedText}>
              {isCab
                ? 'Verified AC Cab • Sanitized'
                : isAuto
                ? 'Verified Auto • Meter Fair'
                : 'Verified CityPilot • Helmet Equipped'}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  radarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  searchingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchingSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  fareLockBox: {
    marginTop: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  fareLockLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  fareLockAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  vehicleSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 4,
  },
  vehicleSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleSelectBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  vehicleSelectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  vehicleSelectTextActive: {
    color: '#FFFFFF',
  },
  foundContainer: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  matchIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  matchSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  acceptedContainer: {
    paddingVertical: 12,
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  acceptedBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  arrivingHint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 14,
  },
  scrollArea: {
    maxHeight: 520,
  },
  mapWrapper: {
    marginBottom: 14,
  },
  pilotCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  pilotAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pilotAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  pilotDetails: {
    flex: 1,
  },
  pilotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pilotNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  tripsText: {
    fontSize: 11,
    color: '#64748B',
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  otpCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  otpPrompt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyText: {
    fontSize: 11,
    color: '#0A84FF',
    fontWeight: '700',
  },
  otpDigitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  digitBox: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  otpSecurityHint: {
    fontSize: 11,
    color: '#3B82F6',
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chatButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  callButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  simulateArriveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 2,
  },
  simulateArriveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A84FF',
  },
  otpVerifyContainer: {
    paddingVertical: 8,
  },
  arrivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  arrivedBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
    flex: 1,
  },
  verificationBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  verifyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  verifyConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
  },
  verifyConfirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  verifiedSuccess: {
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  chatLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  chatLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A84FF',
  },
  telemetryCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  telemetryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  telemetryDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  destStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  destStripLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  destStripValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  navChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  navChatText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A84FF',
  },
  endRideBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  endRideText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  ratingHeader: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  ratingCheckCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 12,
  },
  starBtn: {
    padding: 4,
  },
  ratingPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0A84FF',
  },
  tagChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  tagChipTextSelected: {
    color: '#0A84FF',
    fontWeight: '700',
  },
  tipBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    textAlign: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  tipBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipBtnSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  tipBtnTextSelected: {
    color: '#FFFFFF',
  },
  submitRatingBtn: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitRatingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
