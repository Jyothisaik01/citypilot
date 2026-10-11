import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Bell,
  TrainFront as Train,
  TrendingDown,
  AlertTriangle,
  Zap,
  Check,
  Settings,
  SlidersHorizontal,
  Volume2,
  Navigation2,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';

const STORAGE_KEY_SETTINGS = '@citypilot_notification_settings_v1';
const STORAGE_KEY_ALERTS = '@citypilot_notification_alerts_v1';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'metro',
    title: 'Hyderabad Metro Blue Line Update',
    message: 'Normal service frequency (every 3.5 mins) operating between Raidurg and Nagole stations.',
    time: '10 min ago',
    unread: true,
  },
  {
    id: 'n2',
    type: 'savings',
    title: 'Smart Savings Milestone! 🎉',
    message: 'You have saved ₹1,240 so far by choosing Multimodal combinations over direct cabs.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'n3',
    type: 'traffic',
    title: 'Peak Traffic Warning: HITEC City Junction',
    message: 'Heavy road congestion near Cyber Towers. Metro + Walking is currently 18 mins faster.',
    time: 'Today, 9:15 AM',
    unread: false,
  },
  {
    id: 'n4',
    type: 'pilot',
    title: 'CityPilot Full Mode Available',
    message: 'Native first-mile bike dispatch is active in Gachibowli, Madhapur, and Kondapur.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'n5',
    type: 'metro',
    title: 'Ameerpet Interchange Transfer Advisory',
    message: 'Red & Blue Line platforms operating normally with clear passenger wayfinding signage.',
    time: '2 days ago',
    unread: false,
  },
];

const DEFAULT_PREFERENCES = {
  pushEnabled: true,
  metroAlerts: true,
  trafficWarnings: true,
  savingsMilestones: true,
  navigationAlerts: true,
  soundVibration: true,
};

export default function NotificationsScreen({ navigation, route }) {
  // If route params asks for settings tab directly, default to 'settings'
  const initialTab = route?.params?.initialTab === 'settings' ? 'settings' : 'alerts';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [list, setList] = useState(INITIAL_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    loadSettings();
    loadAlerts();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) {
        setPrefs(JSON.parse(data));
      }
    } catch {}
  };

  const loadAlerts = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_ALERTS);
      if (data) {
        setList(JSON.parse(data));
      }
    } catch {}
  };

  const updatePreference = async (key, val) => {
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch {}
  };

  const markAllRead = async () => {
    const updated = list.map((item) => ({ ...item, unread: false }));
    setList(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(updated));
    } catch {}
  };

  const clearAllAlerts = async () => {
    setList([]);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify([]));
    } catch {}
  };

  const toggleItemRead = async (id) => {
    const updated = list.map((item) =>
      item.id === id ? { ...item, unread: !item.unread } : item
    );
    setList(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(updated));
    } catch {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'metro':
        return <Train size={18} color="#0284C7" />;
      case 'savings':
        return <TrendingDown size={18} color="#059669" />;
      case 'traffic':
        return <AlertTriangle size={18} color="#D97706" />;
      default:
        return <Zap size={18} color={colors.primary} />;
    }
  };

  const filteredList = list.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Metro') return item.type === 'metro';
    if (selectedFilter === 'Traffic') return item.type === 'traffic';
    if (selectedFilter === 'Savings') return item.type === 'savings';
    if (selectedFilter === 'Pilots') return item.type === 'pilot';
    return true;
  });

  const unreadCount = list.filter((i) => i.unread).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread transit alerts` : 'All caught up'}
          </Text>
        </View>

        {activeTab === 'alerts' && unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn} activeOpacity={0.7}>
            <Text style={styles.readAllText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Top Segmented Tab Switch: Alerts vs Settings */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'alerts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('alerts')}
          activeOpacity={0.8}
        >
          <Bell size={15} color={activeTab === 'alerts' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>
            Transit Alerts
          </Text>
          {unreadCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={15} color={activeTab === 'settings' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            Notification Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'alerts' ? (
        /* TAB 1: Real-time Transit Alerts */
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['All', 'Metro', 'Traffic', 'Savings', 'Pilots'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Bell size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'All'
                  ? "You don't have any notifications right now."
                  : `No ${selectedFilter.toLowerCase()} alerts found.`}
              </Text>
            </View>
          ) : (
            filteredList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  item.unread && styles.notificationCardUnread,
                ]}
                onPress={() => toggleItemRead(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>{getIcon(item.type)}</View>
                <View style={styles.body}>
                  <View style={styles.topRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.cardMessage}>{item.message}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardTime}>{item.time}</Text>
                    <Text style={styles.cardHint}>Tap to toggle</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {list.length > 0 && (
            <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllAlerts} activeOpacity={0.7}>
              <Trash2 size={14} color="#EF4444" />
              <Text style={styles.clearAllText}>Clear All Alerts</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        /* TAB 2: Notification Preferences & Settings */
        <ScrollView style={styles.container} contentContainerStyle={styles.settingsContent} showsVerticalScrollIndicator={false}>
          {/* Master Push Switch Card */}
          <View style={styles.masterCard}>
            <View style={styles.masterTextWrap}>
              <Text style={styles.masterTitle}>Push Notifications</Text>
              <Text style={styles.masterDesc}>
                Allow CityPilot to send timely updates about your daily commute
              </Text>
            </View>
            <Switch
              value={prefs.pushEnabled}
              onValueChange={(val) => updatePreference('pushEnabled', val)}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={prefs.pushEnabled ? colors.primary : '#F1F5F9'}
            />
          </View>

          <Text style={styles.settingsSectionHeader}>Alert Preferences</Text>

          <View style={styles.settingsGroup}>
            {/* 1. Metro Line Alerts */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#E0F2FE' }]}>
                <Train size={18} color="#0284C7" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hyderabad Metro Alerts</Text>
                <Text style={styles.settingSub}>
                  Delay advisories, Blue/Red/Green line frequency updates & maintenance
                </Text>
              </View>
              <Switch
                value={prefs.metroAlerts && prefs.pushEnabled}
                disabled={!prefs.pushEnabled}
                onValueChange={(val) => updatePreference('metroAlerts', val)}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={prefs.metroAlerts && prefs.pushEnabled ? colors.primary : '#F1F5F9'}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* 2. Peak Traffic Warnings */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#FEF3C7' }]}>
                <AlertTriangle size={18} color="#D97706" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Traffic & Congestion Warnings</Text>
                <Text style={styles.settingSub}>
                  Major choke points around Cyber Towers, Madhapur & Gachibowli flyover
                </Text>
              </View>
              <Switch
                value={prefs.trafficWarnings && prefs.pushEnabled}
                disabled={!prefs.pushEnabled}
                onValueChange={(val) => updatePreference('trafficWarnings', val)}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={prefs.trafficWarnings && prefs.pushEnabled ? colors.primary : '#F1F5F9'}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* 3. Smart Savings & Fare Discounts */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#ECFDF5' }]}>
                <TrendingDown size={18} color="#059669" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Savings Milestones & Offers</Text>
                <Text style={styles.settingSub}>
                  Monthly rupees saved vs direct cabs and Hyderabad Metro card holiday deals
                </Text>
              </View>
              <Switch
                value={prefs.savingsMilestones && prefs.pushEnabled}
                disabled={!prefs.pushEnabled}
                onValueChange={(val) => updatePreference('savingsMilestones', val)}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={prefs.savingsMilestones && prefs.pushEnabled ? colors.primary : '#F1F5F9'}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* 4. Real-time Trip Navigation */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#EEF2FF' }]}>
                <Navigation2 size={18} color="#4F46E5" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Live Trip Navigation Alerts</Text>
                <Text style={styles.settingSub}>
                  Approaching station announcements and transfer instructions
                </Text>
              </View>
              <Switch
                value={prefs.navigationAlerts && prefs.pushEnabled}
                disabled={!prefs.pushEnabled}
                onValueChange={(val) => updatePreference('navigationAlerts', val)}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={prefs.navigationAlerts && prefs.pushEnabled ? colors.primary : '#F1F5F9'}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* 5. Sound & Vibration */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#F1F5F9' }]}>
                <Volume2 size={18} color={colors.navy} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound & Vibration</Text>
                <Text style={styles.settingSub}>Play subtle sound for high-priority transit alerts</Text>
              </View>
              <Switch
                value={prefs.soundVibration && prefs.pushEnabled}
                disabled={!prefs.pushEnabled}
                onValueChange={(val) => updatePreference('soundVibration', val)}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={prefs.soundVibration && prefs.pushEnabled ? colors.primary : '#F1F5F9'}
              />
            </View>
          </View>

          {/* Help Info Footer */}
          <View style={styles.settingsFooter}>
            <Text style={styles.settingsFooterText}>
              Preferences are automatically saved to your device. You can update these at any time.
            </Text>
          </View>
        </ScrollView>
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.navy,
  },
  subtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  readAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontWeight: '800',
    color: colors.navy,
  },
  tabBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  filterScroll: {
    gap: 8,
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notificationCardUnread: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  body: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.navy,
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTime: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  cardHint: {
    fontSize: 10,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 10,
  },
  clearAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  settingsContent: {
    padding: 16,
    paddingBottom: 40,
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  masterTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  masterTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 2,
  },
  masterDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  settingsSectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
  },
  settingsFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  settingsFooterText: {
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
