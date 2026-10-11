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
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserAvatar from '../components/UserAvatar';
import EditProfileModal from '../components/EditProfileModal';
import CustomPopupModal from '../components/CustomPopupModal';
import {
  User,
  SlidersHorizontal as Sliders,
  TrendingDown,
  Navigation2,
  ChevronRight,
  Shield,
  CircleHelp as HelpCircle,
  Settings,
  Bell,
  Award,
  Layers,
  LogOut,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Footprints,
  Pencil,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { tripsAPI } from '../services/api';
import colors from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, appMode, toggleAppMode, logout } = useAuth();
  const [trips, setTrips] = useState([]);
  const [maxWalkKm, setMaxWalkKm] = useState(6.0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalSavings: 0,
    totalTrips: 0,
    totalCo2SavedKg: 0,
  });

  // Branded CityPilot Popup Modal state
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const showPopup = (opts) => {
    setPopup({
      visible: true,
      title: opts.title || 'Notification',
      message: opts.message || '',
      type: opts.type || 'info',
      confirmText: opts.confirmText || 'OK',
      cancelText: opts.cancelText || 'Cancel',
      onConfirm: opts.onConfirm || (() => setPopup((p) => ({ ...p, visible: false }))),
      onCancel: opts.onCancel || (() => setPopup((p) => ({ ...p, visible: false }))),
    });
  };

  const closePopup = () => setPopup((p) => ({ ...p, visible: false }));

  useEffect(() => {
    loadUserData();
    loadWalkPreference();
  }, [user?.id, user?.phone, user?.email]);

  const loadWalkPreference = async () => {
    try {
      const val = await AsyncStorage.getItem('user_max_walk_km');
      if (val) setMaxWalkKm(parseFloat(val));
    } catch (e) {
      console.log('Error reading walk preference:', e);
    }
  };

  const handleSelectWalkLimit = async (km) => {
    setMaxWalkKm(km);
    await AsyncStorage.setItem('user_max_walk_km', String(km));
    showPopup({
      type: 'success',
      title: 'Walking Distance Updated',
      message: `Maximum walking distance set to ${km} km per trip. For longer connections, CityPilot will suggest an auto or bike taxi!`,
      confirmText: 'Great',
    });
  };

  const loadUserData = async () => {
    try {
      const userParams = {
        userId: user?.id,
        phone: user?.phone,
        email: user?.email,
      };
      const [tList, sData] = await Promise.all([
        tripsAPI.getTrips(userParams),
        tripsAPI.getStats(userParams),
      ]);
      if (tList) setTrips(tList);
      if (sData) setStats(sData);
    } catch (e) {
      console.warn('Error loading user profile stats:', e);
    }
  };

  const handleToggleMode = async (value) => {
    const newMode = value ? 'full' : 'normal';
    await toggleAppMode(newMode);
    showPopup({
      type: 'info',
      title: 'Travel Mode Updated',
      message: value
        ? '🚕 Direct Ride Booking is on! You can now book CityPilot bike, auto, and cab rides with live driver tracking.'
        : '⚡ Smart Transit Mode is on! CityPilot will find the fastest & cheapest routes combining Metro, cabs, and bikes.',
      confirmText: 'Understood',
    });
  };

  const handleLogout = () => {
    showPopup({
      type: 'danger',
      title: 'Sign Out',
      message: 'Are you sure you want to log out of CityPilot?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closePopup();
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <UserAvatar
            name={user?.name || 'Anusha Maram'}
            size={58}
            backgroundColor="#0A84FF"
            style={{ marginRight: 14 }}
          />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'Anusha'}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.userPhone}>{user?.phone || '+91 98765 43210'}</Text>
            {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
            <View style={styles.tierPill}>
              <Award size={13} color={colors.teal} />
              <Text style={styles.tierText}>Top 5% Smart Saver in Hyderabad</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.7}
          >
            <Pencil size={14} color={colors.primary} />
            <Text style={styles.editProfileBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Impact Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Multimodal Savings</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.tealLight }]}>
                <TrendingDown size={18} color={colors.teal} />
              </View>
              <Text style={styles.statNumber}>₹{stats.totalSavings ?? 0}</Text>
              <Text style={styles.statCaption}>Saved vs Cabs</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Navigation2 size={18} color={colors.primary} />
              </View>
              <Text style={styles.statNumber}>{stats.totalTrips ?? trips.length ?? 0}</Text>
              <Text style={styles.statCaption}>Smart Trips</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Sparkles size={18} color="#059669" />
              </View>
              <Text style={styles.statNumber}>{stats.totalCo2SavedKg ?? 0} kg</Text>
              <Text style={styles.statCaption}>CO₂ Saved</Text>
            </View>
          </View>
        </View>

        {/* Operational Mode Toggle Card */}
        <Text style={styles.sectionHeader}>Operating Mode</Text>
        <View style={styles.modeToggleCard}>
          <View style={styles.modeToggleRow}>
            <View style={styles.modeTextContainer}>
              <View style={styles.modeBadgeRow}>
                <Text style={styles.modeCardTitle}>
                  {appMode === 'full' ? '🚕 Full Ride Booking Mode' : '⚡ Normal Aggregator Mode'}
                </Text>
                <View
                  style={[
                    styles.modeIndicatorBadge,
                    appMode === 'full' ? styles.badgeFull : styles.badgeNormal,
                  ]}
                >
                  <Text style={styles.modeIndicatorText}>
                    {appMode === 'full' ? 'ACTIVE' : 'DEFAULT'}
                  </Text>
                </View>
              </View>
              <Text style={styles.modeCardDesc}>
                {appMode === 'full'
                  ? 'CityPilot native vehicle booking enabled for first-mile bike rides and direct rides with live pilots.'
                  : 'CityPilot smart route optimizer with deep link handoffs to Uber, Rapido & Hyderabad Metro.'}
              </Text>
            </View>
            <Switch
              value={appMode === 'full'}
              onValueChange={handleToggleMode}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Maximum Walking Distance Preference Card */}
        <Text style={styles.sectionHeader}>Maximum Walking Distance per Trip</Text>
        <View style={styles.walkPreferenceCard}>
          <View style={styles.walkPreferenceHeader}>
            <View style={styles.walkPrefIconWrap}>
              <Footprints size={20} color={colors.primary} />
            </View>
            <View style={styles.walkPrefTextWrap}>
              <Text style={styles.walkPrefTitle}>Walking Distance Threshold</Text>
              <Text style={styles.walkPrefSub}>
                Connections exceeding this limit will automatically switch from walking to an Auto or Bike taxi.
              </Text>
            </View>
          </View>

          <View style={styles.walkChipsRow}>
            {[
              { val: 1.5, label: '1.5 km', note: 'Short Walk' },
              { val: 3.0, label: '3.0 km', note: 'Moderate' },
              { val: 6.0, label: '6.0 km', note: 'Default' },
              { val: 8.0, label: '8.0 km', note: 'Extended' },
            ].map((opt) => {
              const isSelected = maxWalkKm === opt.val;
              return (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => handleSelectWalkLimit(opt.val)}
                  style={[
                    styles.walkChip,
                    isSelected && styles.walkChipSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.walkChipVal,
                      isSelected && styles.walkChipValSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.walkChipNote,
                      isSelected && styles.walkChipNoteSelected,
                    ]}
                  >
                    {opt.note}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Navigation & App Settings */}
        <Text style={styles.sectionHeader}>App & Preferences</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setEditModalVisible(true)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
              <User size={18} color="#4F46E5" />
            </View>
            <View style={styles.menuLabelContainer}>
              <Text style={styles.menuLabel}>Personal Details & Verification</Text>
              <Text style={styles.menuSubtext}>Update your name, mobile number & email</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SavedPlaces')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={styles.menuLabelContainer}>
              <Text style={styles.menuLabel}>Saved Places</Text>
              <Text style={styles.menuSubtext}>Home, Office, Ameerpet & Raidurg Metro</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('TravelMode')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.tealLight }]}>
              <Layers size={18} color={colors.teal} />
            </View>
            <View style={styles.menuLabelContainer}>
              <Text style={styles.menuLabel}>Mode Configuration</Text>
              <Text style={styles.menuSubtext}>Ranking weights, transit providers, rules</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications', { initialTab: 'settings' })}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Bell size={18} color="#D97706" />
            </View>
            <View style={styles.menuLabelContainer}>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Text style={styles.menuSubtext}>Metro line alerts & fare updates</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpSupport')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#F1F5F9' }]}>
              <HelpCircle size={18} color={colors.navy} />
            </View>
            <View style={styles.menuLabelContainer}>
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Text style={styles.menuSubtext}>Frequently asked questions & contact</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Recent Trips from MongoDB */}
        <Text style={styles.sectionHeader}>Recent Trips</Text>
        <View style={styles.menuGroup}>
          {trips.slice(0, 3).map((t, idx) => (
            <View key={t.id || idx} style={styles.tripItem}>
              <View style={styles.tripLeft}>
                <View style={styles.tripBadge}>
                  <Text style={styles.tripBadgeText}>{t.modeBadge || '🏆 BEST BALANCE'}</Text>
                </View>
                <Text style={styles.tripRoute}>{t.routeTitle || 'Multimodal Trip'}</Text>
                <Text style={styles.tripMeta}>
                  {t.durationMinutes || 39} min • Saved ₹{t.savingsVsCab || 268} vs cab
                </Text>
              </View>
              <View style={styles.tripRight}>
                <Text style={styles.tripCost}>₹{t.costPaid || 52}</Text>
                <Text style={styles.tripDate}>{t.date || 'Recent'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Log Out of CityPilot</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CityPilot Hyderabad • v1.0.0</Text>
          <Text style={styles.footerSubtext}>Don't just book a ride. Find the smartest way there.</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />

      {/* Branded Custom Popup Dialog */}
      <CustomPopupModal
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText={popup.confirmText}
        cancelText={popup.cancelText}
        onConfirm={popup.onConfirm}
        onCancel={popup.onCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  proBadge: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.navy,
  },
  userPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tealDark,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  statCaption: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  modeToggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  modeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  modeIndicatorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeFull: {
    backgroundColor: '#EFF6FF',
  },
  badgeNormal: {
    backgroundColor: '#F0FDF4',
  },
  modeIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  modeCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  walkPreferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  walkPreferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  walkPrefIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walkPrefTextWrap: {
    flex: 1,
  },
  walkPrefTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 2,
  },
  walkPrefSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  walkChipsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  walkChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkChipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  walkChipVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  walkChipValSelected: {
    color: colors.primary,
  },
  walkChipNote: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  walkChipNoteSelected: {
    color: colors.primary,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabelContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
  },
  menuSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tripLeft: {
    flex: 1,
  },
  tripBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  tripBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.tealDark,
  },
  tripRoute: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  tripMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tripRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tripCost: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.navy,
  },
  tripDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
