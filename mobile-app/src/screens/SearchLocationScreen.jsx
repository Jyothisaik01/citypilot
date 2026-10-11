import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ArrowLeft, Search, MapPin, TrainFront as Train, X, Navigation, Building2, Landmark } from 'lucide-react-native';
import colors from '../theme/colors';
import { mobilityAPI } from '../services/api';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local instant database of 50+ Hyderabad places
const LOCAL_HYDERABAD_HUBS = [
  { id: 'h1', name: 'Gachibowli', subtitle: 'Financial District & ORR, Hyderabad', lat: 17.4400, lng: 78.3489, category: 'hub' },
  { id: 'h2', name: 'Ameerpet Metro Interchange', subtitle: 'Blue & Red Line Hub, Hyderabad', lat: 17.4375, lng: 78.4483, category: 'metro' },
  { id: 'h3', name: 'Raidurg Metro Station', subtitle: 'Mindspace IT Park, Hitec City', lat: 17.4428, lng: 78.3772, category: 'metro' },
  { id: 'h4', name: 'Hitec City', subtitle: 'Cyber Towers & Madhapur, Hyderabad', lat: 17.4475, lng: 78.3845, category: 'hub' },
  { id: 'h5', name: 'Madhapur', subtitle: 'Durgam Cheruvu & Ayyappa Society, Hyderabad', lat: 17.4385, lng: 78.3995, category: 'hub' },
  { id: 'h6', name: 'Kondapur', subtitle: 'Near Botanical Gardens, Hyderabad', lat: 17.4682, lng: 78.3578, category: 'residential' },
  { id: 'h7', name: 'Financial District', subtitle: 'Nanakramguda, Waverock, Hyderabad', lat: 17.4162, lng: 78.3427, category: 'hub' },
  { id: 'h8', name: 'Secunderabad Junction Station', subtitle: 'Secunderabad, Hyderabad', lat: 17.4344, lng: 78.5015, category: 'transit' },
  { id: 'h9', name: 'Jubilee Hills Check Post', subtitle: 'Blue Line, Road No. 36, Hyderabad', lat: 17.4285, lng: 78.4190, category: 'metro' },
  { id: 'h10', name: 'Banjara Hills', subtitle: 'Road No. 1, 10 & 12, Hyderabad', lat: 17.4156, lng: 78.4435, category: 'hub' },
  { id: 'h11', name: 'Begumpet Metro Station', subtitle: 'Airport Road, Hyderabad', lat: 17.4440, lng: 78.4600, category: 'metro' },
  { id: 'h12', name: 'KPHB Colony / Kukatpally', subtitle: 'Red Line Corridor, Hyderabad', lat: 17.4870, lng: 78.4010, category: 'metro' },
  { id: 'h13', name: 'Miyapur Metro Station', subtitle: 'Red Line Terminal, Hyderabad', lat: 17.4965, lng: 78.3615, category: 'metro' },
  { id: 'h14', name: 'Inorbit Mall', subtitle: 'Durgam Cheruvu Road, Madhapur', lat: 17.4334, lng: 78.3869, category: 'mall' },
  { id: 'h15', name: 'IKEA Hyderabad', subtitle: 'Raidurg, Hitec City', lat: 17.4395, lng: 78.3755, category: 'landmark' },
  { id: 'h16', name: 'DLF Cyber City', subtitle: 'Gachibowli Gate 2, Hyderabad', lat: 17.4485, lng: 78.3590, category: 'hub' },
  { id: 'h17', name: 'Manikonda', subtitle: 'Puppalaguda & Lanco Hills, Hyderabad', lat: 17.4042, lng: 78.3756, category: 'residential' },
  { id: 'h18', name: 'Tolichowki', subtitle: 'Mehdipatnam Road, Hyderabad', lat: 17.3995, lng: 78.4124, category: 'residential' },
  { id: 'h19', name: 'Charminar', subtitle: 'Old City, Hyderabad', lat: 17.3616, lng: 78.4747, category: 'landmark' },
  { id: 'h20', name: 'Rajiv Gandhi International Airport', subtitle: 'Shamshabad, Hyderabad', lat: 17.2403, lng: 78.4294, category: 'transit' },
];

export default function SearchLocationScreen({ route, navigation }) {
  const target = route.params?.target || 'destination'; // 'origin' | 'destination'
  const [query, setQuery] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Live debounced search querying real geocoded backend + OpenStreetMap
  useEffect(() => {
    let active = true;
    const cleanQ = query.trim();

    if (!cleanQ) {
      setApiResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await mobilityAPI.searchPlaces(cleanQ);
        if (active) {
          setApiResults(Array.isArray(res) ? res : []);
          setIsSearching(false);
        }
      } catch (err) {
        if (active) {
          setIsSearching(false);
        }
      }
    }, 280);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [query]);

  // Combined fast instant search results (matching curated hubs + real geocoded results)
  const displayedResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return LOCAL_HYDERABAD_HUBS.slice(0, 8);
    }

    const localMatches = LOCAL_HYDERABAD_HUBS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );

    // Merge backend real geocoded results without duplicates
    const combined = [...localMatches];
    if (apiResults && apiResults.length > 0) {
      for (const item of apiResults) {
        if (!combined.some((c) => c.name.toLowerCase() === item.name.toLowerCase())) {
          combined.push(item);
        }
      }
    }

    return combined;
  }, [query, apiResults]);

  const handleSelect = async (place) => {
    const selectedPlaceData = {
      target,
      place: {
        name: place.name + (place.subtitle && !place.name.includes(',') ? `, ${place.subtitle.split(',')[0]}` : ''),
        lat: parseFloat(place.lat || 17.4400),
        lng: parseFloat(place.lng || 78.3489),
      },
    };

    // Store in AsyncStorage for fast persistence
    if (target === 'origin') {
      await AsyncStorage.setItem('user_last_location', JSON.stringify(selectedPlaceData.place));
    }

    // Navigate to HomeTab within MainTabs and merge params
    navigation.navigate('MainTabs', {
      screen: 'HomeTab',
      params: { selectedPlace: selectedPlaceData },
    });

    // Also navigate to 'Home' stack route if mounted
    navigation.navigate('Home', { selectedPlace: selectedPlaceData });
  };

  const handleUseCurrentGps = async () => {
    try {
      setGpsLoading(true);

      // Check if system location services toggle is enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'GPS is currently turned off on your device. Please turn on Location in Android settings to use your live position.',
          [
            {
              text: 'Use Gachibowli Default',
              onPress: () =>
                handleSelect({
                  name: 'Current location (Gachibowli)',
                  subtitle: 'Hyderabad',
                  lat: 17.4400,
                  lng: 78.3489,
                }),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'CityPilot needs location access to find closest pickup points.',
          [
            {
              text: 'Use Gachibowli',
              onPress: () =>
                handleSelect({
                  name: 'Current location (Gachibowli)',
                  subtitle: 'Hyderabad',
                  lat: 17.4400,
                  lng: 78.3489,
                }),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Try last known position first (fast & reliable)
      let pos = await Location.getLastKnownPositionAsync();
      if (!pos) {
        pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
      }

      if (pos) {
        let name = 'Current GPS Location';
        try {
          const rev = await Location.reverseGeocodeAsync({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (rev && rev.length > 0) {
            const p = rev[0];
            const parts = [p.name || p.street, p.subregion || p.district || p.city].filter(Boolean);
            if (parts.length > 0) name = parts.join(', ');
          }
        } catch (e) {}

        handleSelect({
          name: name,
          subtitle: 'Current Location',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } else {
        handleSelect({
          name: 'Current location (Gachibowli)',
          subtitle: 'Hyderabad',
          lat: 17.4400,
          lng: 78.3489,
        });
      }
    } catch (e) {
      console.log('GPS note:', e.message);
      // Graceful fallback without LogBox red/yellow warning banner
      handleSelect({
        name: 'Current location (Gachibowli)',
        subtitle: 'Hyderabad',
        lat: 17.4400,
        lng: 78.3489,
      });
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Search Input Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={target === 'origin' ? 'Search pickup location or address...' : 'Where do you want to go?'}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {isSearching ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 4 }} />
          ) : query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Current Location Option */}
      <TouchableOpacity
        style={styles.currentLocationRow}
        onPress={handleUseCurrentGps}
        disabled={gpsLoading}
        activeOpacity={0.7}
      >
        <View style={styles.currentLocIcon}>
          {gpsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Navigation size={18} color={colors.primary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.currentLocTitle}>
            {gpsLoading ? 'Locating your position...' : 'Your Current Location'}
          </Text>
          <Text style={styles.currentLocSub}>Tap to set pickup at your current location</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.sectionDivider} />

      <Text style={styles.listHeader}>
        {query ? (isSearching ? 'Searching places...' : `Search Results (${displayedResults.length})`) : 'Popular Transit Hubs & Destinations'}
      </Text>

      {/* Places List */}
      <FlatList
        data={displayedResults}
        keyExtractor={(item, index) => item.id || `loc_${index}`}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={
          !isSearching && query.trim() ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
              <MapPin size={34} color="#94A3B8" style={{ marginBottom: 10 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 }}>No places found</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
                We couldn't find locations matching "{query}". Try checking the spelling or searching a nearby street or town.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.placeItem}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.placeIconCircle, item.category === 'metro' && { backgroundColor: '#E0F2FE' }]}>
              {item.category === 'metro' ? (
                <Train size={18} color={colors.teal} />
              ) : item.category === 'transit' ? (
                <Landmark size={18} color={colors.primary} />
              ) : (
                <MapPin size={18} color={colors.primary} />
              )}
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.placeSub} numberOfLines={1}>{item.subtitle || 'India'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#F8FAFC',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: colors.navy,
    fontWeight: '600',
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  currentLocIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  currentLocTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
  },
  currentLocSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionDivider: {
    height: 6,
    backgroundColor: '#F8FAFC',
  },
  listHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  placeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
  },
  placeSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
