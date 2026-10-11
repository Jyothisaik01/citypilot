import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { X, ExternalLink, ArrowRight, ShieldCheck, CircleAlert as AlertCircle, Car, Bike } from 'lucide-react-native';
import colors from '../theme/colors';

export default function ExternalProviderHandoffSheet({
  visible,
  onClose,
  pickup,
  destination,
  initialVehicle = 'cab',
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicle);

  const safePickupName = pickup?.name || 'Gachibowli, Hyderabad';
  const safeDestName = destination?.name || 'Ameerpet, Hyderabad';

  // Handle Uber Deep Link Launch
  const handleOpenUber = async () => {
    const pLat = pickup?.lat || 17.44;
    const pLng = pickup?.lng || 78.3489;
    const dLat = destination?.lat || 17.4375;
    const dLng = destination?.lng || 78.4483;

    const universalLink = `https://m.uber.com/ul/?action=setPickup&client_id=CityPilot-Transit-V1&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[nickname]=${encodeURIComponent(
      safePickupName
    )}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${encodeURIComponent(
      safeDestName
    )}`;

    const nativeScheme = `uber://?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}`;

    try {
      const canOpenNative = await Linking.canOpenURL(nativeScheme);
      if (canOpenNative) {
        await Linking.openURL(nativeScheme);
      } else {
        await Linking.openURL(universalLink);
      }
    } catch (e) {
      await Linking.openURL(universalLink);
    }
  };

  // Handle Rapido Link Launch
  const handleOpenRapido = async () => {
    const pLat = pickup?.lat || 17.44;
    const pLng = pickup?.lng || 78.3489;
    const dLat = destination?.lat || 17.4375;
    const dLng = destination?.lng || 78.4483;

    const nativeScheme = `rapido://ride?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&service=bike`;
    const universalLink = `https://www.rapido.bike`;

    try {
      const canOpen = await Linking.canOpenURL(nativeScheme);
      if (canOpen) {
        await Linking.openURL(nativeScheme);
      } else {
        await Linking.openURL(universalLink);
      }
    } catch (e) {
      await Linking.openURL(universalLink);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Take this Ride</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {safePickupName} → {safeDestName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Vehicle Type Tabs */}
          <View style={styles.vehicleTabs}>
            {['cab', 'bike', 'auto'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedVehicle(tab)}
                style={[styles.tabButton, selectedVehicle === tab && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, selectedVehicle === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Uber Card */}
            <View style={styles.providerCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.brandIconUber}>
                  <Text style={styles.uberBrandText}>Uber</Text>
                </View>
                <View style={styles.brandInfo}>
                  <Text style={styles.providerName}>Uber</Text>
                  <Text style={styles.providerDesc}>Open in Uber app to book this ride.</Text>
                </View>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.fareAmount}>
                  {selectedVehicle === 'bike' ? '₹70 – ₹95' : selectedVehicle === 'auto' ? '₹140 – ₹180' : '₹310 – ₹350'}
                </Text>
                <Text style={styles.etaText}>
                  {selectedVehicle === 'bike' ? '24 min' : '28 min'}
                </Text>
              </View>

              <Text style={styles.disclaimerText}>
                Estimated fare • Live pricing will be shown in Uber app
              </Text>

              <TouchableOpacity style={styles.uberButton} onPress={handleOpenUber} activeOpacity={0.88}>
                <Text style={styles.uberButtonText}>Open in Uber</Text>
                <ExternalLink size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Rapido Card */}
            <View style={styles.providerCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.brandIconRapido}>
                  <Bike size={20} color="#000000" />
                </View>
                <View style={styles.brandInfo}>
                  <Text style={styles.providerName}>Rapido</Text>
                  <Text style={styles.providerDesc}>Open in Rapido app to book this ride.</Text>
                </View>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.fareAmount}>
                  {selectedVehicle === 'cab' ? '₹290 – ₹330' : selectedVehicle === 'auto' ? '₹120 – ₹160' : '₹80 – ₹110'}
                </Text>
                <Text style={styles.etaText}>
                  {selectedVehicle === 'bike' ? '22 min' : '32 min'}
                </Text>
              </View>

              <Text style={styles.disclaimerText}>
                Estimated fare • Live pricing in Rapido app
              </Text>

              <TouchableOpacity style={styles.rapidoButton} onPress={handleOpenRapido} activeOpacity={0.88}>
                <Text style={styles.rapidoButtonText}>Open Rapido</Text>
                <ExternalLink size={16} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Important Transparent Booking Disclaimer */}
            <View style={styles.infoBox}>
              <AlertCircle size={15} color={colors.textSecondary} style={{ marginTop: 2 }} />
              <Text style={styles.infoText}>
                CityPilot calculates the smartest routes and redirects you to the respective provider with your pickup and drop-off coordinates prefilled.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    maxWidth: 260,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleTabs: {
    flexDirection: 'row',
    backgroundColor: colors.cardMuted,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.navy,
    fontWeight: '800',
  },
  scrollContent: {
    marginBottom: 10,
  },
  providerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandIconUber: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uberBrandText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  brandIconRapido: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFC857',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInfo: {
    marginLeft: 12,
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  providerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  fareAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  disclaimerText: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginBottom: 12,
  },
  uberButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uberButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  rapidoButton: {
    backgroundColor: '#FFC857',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  rapidoButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
});

