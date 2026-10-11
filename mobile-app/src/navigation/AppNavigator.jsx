import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House as Home, Bookmark, User, Compass, Sparkles } from 'lucide-react-native';

import { COLORS } from '../theme/colors';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import LocationPermissionScreen from '../screens/LocationPermissionScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchLocationScreen from '../screens/SearchLocationScreen';
import RouteCalculatingScreen from '../screens/RouteCalculatingScreen';
import RouteOptionsScreen from '../screens/RouteOptionsScreen';
import CompareRoutesScreen from '../screens/CompareRoutesScreen';
import RouteDetailsScreen from '../screens/RouteDetailsScreen';
import FullRouteMapScreen from '../screens/FullRouteMapScreen';
import MetroDetailsScreen from '../screens/MetroDetailsScreen';
import NavigationScreen from '../screens/NavigationScreen';
import TripCompletedScreen from '../screens/TripCompletedScreen';
import MyTripsScreen from '../screens/MyTripsScreen';
import SavedPlacesScreen from '../screens/SavedPlacesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TravelModeScreen from '../screens/TravelModeScreen';
import CityPilotRidesComingSoonScreen from '../screens/CityPilotRidesComingSoonScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OreoChatScreen from '../screens/OreoChatScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={MyTripsScreen}
        options={{
          tabBarLabel: 'My Trips',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="OreoTab"
        component={OreoChatScreen}
        options={{
          tabBarLabel: 'Oreo AI',
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color="#0A84FF" />,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedPlacesScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SearchLocation" component={SearchLocationScreen} />
        <Stack.Screen name="RouteCalculating" component={RouteCalculatingScreen} />
        <Stack.Screen name="RouteOptions" component={RouteOptionsScreen} />
        <Stack.Screen name="CompareRoutes" component={CompareRoutesScreen} />
        <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
        <Stack.Screen name="FullRouteMap" component={FullRouteMapScreen} />
        <Stack.Screen name="MetroDetails" component={MetroDetailsScreen} />
        <Stack.Screen name="Navigation" component={NavigationScreen} />
        <Stack.Screen name="TripCompleted" component={TripCompletedScreen} />
        <Stack.Screen name="MyTrips" component={MyTripsScreen} />
        <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="TravelMode" component={TravelModeScreen} />
        <Stack.Screen name="CityPilotRidesComingSoon" component={CityPilotRidesComingSoonScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="OreoChat" component={OreoChatScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
