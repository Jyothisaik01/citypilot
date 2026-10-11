import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Bookmark,
  House as Home,
  Briefcase,
  TrainFront as Train,
  Plus,
  Clock,
  ArrowRight,
  TrendingDown,
  Navigation,
  ChevronRight,
  Trash2,
  X,
  CheckCircle2,
  Heart,
  MapPin,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { getSavedPlaces, addSavedPlace, removeSavedPlace, getPastTrips } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CustomPopupModal from '../components/CustomPopupModal';

const ICON_OPTIONS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'briefcase', label: 'Work', Icon: Briefcase },
  { id: 'train', label: 'Metro', Icon: Train },
  { id: 'bookmark', label: 'Favorite', Icon: Bookmark },
  { id: 'heart', label: 'Saved', Icon: Heart },
];

export default function SavedPlacesScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('places');
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Place Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('home');
  const [savingPlace, setSavingPlace] = useState(false);

  // Custom Confirmation Popup State
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
  });

  const showPopup = (opts) => {
    setPopup({
      visible: true,
      title: opts.title || 'Notice',
      message: opts.message || '',
      type: opts.type || 'info',
      confirmText: opts.confirmText || 'OK',
      cancelText: opts.cancelText || 'Cancel',
      onConfirm: opts.onConfirm || (() => setPopup((p) => ({ ...p, visible: false }))),
    });
  };

  const closePopup = () => setPopup((p) => ({ ...p, visible: false }));

  useEffect(() => {
    loadData();
  }, [user?.id, user?.phone, user?.email]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userParams = {
        userId: user?.id,
        phone: user?.phone,
        email: user?.email,
      };
      const [places, trips] = await Promise.all([
        getSavedPlaces(userParams),
        getPastTrips(userParams),
      ]);
      setSavedPlaces(places || []);
      setPastTrips(trips || []);
    } catch (err) {
      console.log('Error loading saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return <Home size={20} color={COLORS.primary} />;
      case 'briefcase':
        return <Briefcase size={20} color={COLORS.primary} />;
      case 'train':
        return <Train size={20} color={COLORS.teal} />;
      case 'heart':
        return <Heart size={20} color="#EF4444" />;
      default:
        return <Bookmark size={20} color={COLORS.primary} />;
    }
  };

  const handleSelectPlace = (place) => {
    navigation.navigate('SearchLocation', {
      searchType: 'to',
      preselected: place,
    });
  };

  const handleRepeatTrip = (trip) => {
    navigation.navigate('RouteCalculating', {
      origin: trip.origin,
      destination: trip.destination,
      preference: 'balanced',
    });
  };

  // Add New Favorite Place to MongoDB bound to current user
  const handleSaveNewPlace = async () => {
    if (!newName.trim()) {
      showPopup({
        title: 'Place Name Required',
        message: 'Please enter a name for this saved location (e.g., Home, Work, Gym).',
        type: 'danger',
      });
      return;
    }

    setSavingPlace(true);
    try {
      const payload = {
        userId: user?.id,
        userPhone: user?.phone,
        userEmail: user?.email,
        name: newName.trim(),
        label: newName.trim(),
        address: newAddress.trim() || `${newName.trim()}, Hyderabad`,
        lat: 17.4400, // Default Hyderabad center if manual text
        lng: 78.3489,
        icon: selectedIcon,
      };

      const res = await addSavedPlace(payload);
      if (res && res.success !== false) {
        setIsAddModalOpen(false);
        setNewName('');
        setNewAddress('');
        setSelectedIcon('home');
        await loadData();
        showPopup({
          title: 'Place Saved',
          message: `"${payload.name}" has been added to your favorites!`,
          type: 'success',
        });
      } else {
        showPopup({
          title: 'Save Failed',
          message: res?.error || 'Could not save this location. Please try again.',
          type: 'danger',
        });
      }
    } catch (e) {
      showPopup({
        title: 'Error',
        message: e.message || 'Network error while saving place',
        type: 'danger',
      });
    } finally {
      setSavingPlace(false);
    }
  };

  // Delete Place Confirmation Dialog
  const handleDeletePlace = (place) => {
    showPopup({
      title: 'Remove Saved Place',
      message: `Are you sure you want to remove "${place.name}" from your saved locations?`,
      type: 'danger',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closePopup();
        try {
          await removeSavedPlace(place.id, {
            userId: user?.id,
            phone: user?.phone,
            email: user?.email,
          });
          setSavedPlaces((prev) => prev.filter((p) => p.id !== place.id));
        } catch (e) {
          console.warn('Error removing place:', e);
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Places & Trips</Text>
        <Text style={styles.headerSubtitle}>
          Favorites and regular Hyderabad journeys for {user?.name || 'you'}
        </Text>
      </View>

      {/* Segmented Tab */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'places' && styles.tabButtonActive]}
          onPress={() => setActiveTab('places')}
        >
          <Text style={[styles.tabText, activeTab === 'places' && styles.tabTextActive]}>
            Saved Places ({savedPlaces.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'trips' && styles.tabButtonActive]}
          onPress={() => setActiveTab('trips')}
        >
          <Text style={[styles.tabText, activeTab === 'trips' && styles.tabTextActive]}>
            Trip History ({pastTrips.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentList} showsVerticalScrollIndicator={false}>
        {loading && savedPlaces.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your saved locations...</Text>
          </View>
        ) : activeTab === 'places' ? (
          <>
            {savedPlaces.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Bookmark size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Saved Places Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Save your home, office, or regular spots to quickly compare transit routes and book rides.
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setIsAddModalOpen(true)}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.emptyAddBtnText}>Add Your First Place</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedPlaces.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.placeCard}
                  onPress={() => handleSelectPlace(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.placeIconBox}>{getPlaceIcon(item.icon)}</View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{item.name}</Text>
                    <Text style={styles.placeAddress}>{item.address}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.goButton}
                      onPress={() => handleSelectPlace(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Navigation size={16} color={COLORS.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeletePlace(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {savedPlaces.length > 0 && (
              <TouchableOpacity
                style={styles.addPlaceButton}
                onPress={() => setIsAddModalOpen(true)}
                activeOpacity={0.85}
              >
                <Plus size={20} color={COLORS.primary} />
                <Text style={styles.addPlaceText}>Add New Favorite Place</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {pastTrips.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <TrendingDown size={32} color={COLORS.teal} />
                </View>
                <Text style={styles.emptyTitle}>No Trips Recorded</Text>
                <Text style={styles.emptySubtitle}>
                  Your completed rides and multimodal trips will appear here automatically with savings calculations.
                </Text>
              </View>
            ) : (
              pastTrips.map((trip) => (
                <View key={trip.id} style={styles.tripCard}>
                  <View style={styles.tripHeader}>
                    <View style={styles.tripDateRow}>
                      <Clock size={14} color={COLORS.textSecondary} />
                      <Text style={styles.tripDate}>{trip.date || 'Recent'}</Text>
                    </View>
                    <View style={styles.savingsBadge}>
                      <TrendingDown size={12} color={COLORS.teal} />
                      <Text style={styles.savingsBadgeText}>Saved ₹{trip.savedAmount || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.tripRoute}>
                    <Text style={styles.tripOrigin}>{trip.origin?.name || 'Pickup'}</Text>
                    <ArrowRight size={14} color={COLORS.textSecondary} style={{ marginHorizontal: 8 }} />
                    <Text style={styles.tripDest}>{trip.destination?.name || 'Dropoff'}</Text>
                  </View>

                  <View style={styles.tripFooter}>
                    <Text style={styles.tripMeta}>
                      {trip.modeSummary || 'Multimodal'} • ₹{trip.fare || 0} • {trip.duration || 15} min
                    </Text>
                    <TouchableOpacity
                      style={styles.repeatButton}
                      onPress={() => handleRepeatTrip(trip)}
                    >
                      <Text style={styles.repeatButtonText}>Repeat</Text>
                      <ChevronRight size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Add New Place Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Add Favorite Place</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(false)}
                style={styles.closeBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Save a location to your account for fast route calculations.
            </Text>

            <Text style={styles.inputLabel}>PLACE NAME</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. My Home, DLF Office, Cult Gym"
              placeholderTextColor="#94A3B8"
              value={newName}
              onChangeText={setNewName}
              autoFocus={true}
            />

            <Text style={styles.inputLabel}>ADDRESS / AREA</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Gachibowli, Hitec City, Madhapur"
              placeholderTextColor="#94A3B8"
              value={newAddress}
              onChangeText={setNewAddress}
            />

            <Text style={styles.inputLabel}>SELECT ICON</Text>
            <View style={styles.iconPickerRow}>
              {ICON_OPTIONS.map((opt) => {
                const isSelected = selectedIcon === opt.id;
                const IconCmp = opt.Icon;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.iconChoice, isSelected && styles.iconChoiceSelected]}
                    onPress={() => setSelectedIcon(opt.id)}
                  >
                    <IconCmp size={20} color={isSelected ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.iconChoiceLabel, isSelected && styles.iconChoiceLabelSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.saveSubmitBtn}
              onPress={handleSaveNewPlace}
              disabled={savingPlace}
              activeOpacity={0.85}
            >
              {savingPlace ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.saveSubmitBtnText}>Save to My Places</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Branded Custom Confirmation Popup Dialog */}
      <CustomPopupModal
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
        onConfirm={popup.onConfirm}
        onCancel={closePopup}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  contentList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  placeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginTop: 6,
    gap: 8,
    backgroundColor: '#FAFCFE',
  },
  addPlaceText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tripCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.teal,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripOrigin: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  tripDest: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  tripMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  repeatButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  iconPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  iconChoice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  iconChoiceSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  iconChoiceLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  iconChoiceLabelSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  saveSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
