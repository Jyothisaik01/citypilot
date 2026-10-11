import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
} from 'react-native';
import {
  ArrowLeft,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';
import RouteCard from '../components/RouteCard';
import { normalizeRoute, validateRoute } from '../utils/routeFormatters';
import colors from '../theme/colors';

const TABS = [
  { id: 'balanced', label: 'Best Balance' },
  { id: 'cheapest', label: 'Cheapest' },
  { id: 'fastest', label: 'Fastest' },
  { id: 'comfort', label: 'Comfortable' },
  { id: 'eco', label: 'Eco Friendly' },
];

export default function RouteOptionsScreen({ route, navigation }) {
  const {
    routesData,
    origin,
    destination,
    preference = 'balanced',
    mode,
    maxWalkingKm,
  } = route.params || {};

  const [activeTab, setActiveTab] = useState(preference);

  const originName = (origin?.name || 'Gachibowli').split(',')[0].trim();
  const destName = (destination?.name || 'Ameerpet').split(',')[0].trim();

  // 1. Data Normalization & Validation Layer
  const { validRoutes, invalidCount } = useMemo(() => {
    const rawList = routesData?.allRoutes || [];
    const valid = [];
    let invalid = 0;

    for (const raw of rawList) {
      const normalized = normalizeRoute(raw, origin, destination);
      const validation = validateRoute(normalized);
      if (validation.isValid) {
        valid.push(normalized);
      } else {
        invalid++;
        console.warn('Rejected invalid route:', normalized?.title, validation.reason);
      }
    }

    return { validRoutes: valid, invalidCount: invalid };
  }, [routesData, origin, destination]);

  // 2. Tab filtering and sorting
  const displayedRoutes = useMemo(() => {
    if (!validRoutes || validRoutes.length === 0) return [];
    const copy = [...validRoutes];

    if (activeTab === 'cheapest') {
      return copy.sort((a, b) => a.estimatedFare - b.estimatedFare);
    }
    if (activeTab === 'fastest') {
      return copy.sort((a, b) => a.totalDurationSeconds - b.totalDurationSeconds);
    }
    if (activeTab === 'comfort') {
      return copy.sort((a, b) => a.walkingDistanceMeters - b.walkingDistanceMeters);
    }
    if (activeTab === 'eco') {
      return copy.sort((a, b) => (a.co2Grams || 200) - (b.co2Grams || 200));
    }
    // Best balance (default)
    return copy.sort((a, b) => (b.rankingScore || 80) - (a.rankingScore || 80));
  }, [validRoutes, activeTab]);

  const handleSelectRoute = (selectedRoute) => {
    navigation.navigate('RouteDetails', {
      routeData: selectedRoute,
      origin,
      destination,
    });
  };

  const handleRetry = () => {
    navigation.replace('RouteCalculating', {
      origin,
      destination,
      preference: activeTab,
      mode,
      maxWalkingKm,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Clean Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go Back"
        >
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.title}>Best Routes for You</Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {originName} → {destName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() =>
            navigation.navigate('CompareRoutes', {
              routes: displayedRoutes,
              origin,
              destination,
            })
          }
          accessibilityLabel="Compare routes side-by-side"
        >
          <SlidersHorizontal size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontally Scrollable Filter Tabs (No clipping) */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Routes List / Empty State */}
      {displayedRoutes.length > 0 ? (
        <FlatList
          data={displayedRoutes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              allRoutes={validRoutes}
              onSelect={handleSelectRoute}
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <AlertCircle size={32} color="#EF4444" />
          </View>
          <Text style={styles.emptyTitle}>Route Information Unavailable</Text>
          <Text style={styles.emptySub}>
            Unable to calculate verified transport combinations between these coordinates.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleRetry}
            activeOpacity={0.88}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Ask Oreo AI Consultation Button */}
      <View style={styles.oreoConsultationBar}>
        <TouchableOpacity
          style={styles.floatingOreoBtn}
          onPress={() =>
            navigation.navigate('OreoChat', {
              initialQuery: `Compare fares and routes from ${originName} to ${destName}`,
            })
          }
          activeOpacity={0.88}
        >
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.floatingOreoText}>Ask Oreo AI About Fares & Tips</Text>
        </TouchableOpacity>
      </View>
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
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.navy,
  },
  subTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 1,
  },
  filterBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F8FAFC',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.navy,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  oreoConsultationBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  floatingOreoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  floatingOreoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
