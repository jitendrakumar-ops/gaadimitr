import React, { useEffect } from 'react';
import { Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RideTabIcon,
  MyRidesTabIcon,
  ContactedTabIcon,
  ProfileTabIcon,
} from '../assets/icons/Icons';

import { HomeDashboardScreen } from '../screens/home/HomeDashboardScreen';
import { MyRidesScreen } from '../screens/rides/MyRidesScreen';
import { ContactedDriversScreen } from '../screens/contacted/ContactedDriversScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { setSystemNavigationBarColor } from '../utils/navigationBar';

export type MainTabParamList = {
  Ride: {
    selectedCity?: string;
  } | undefined;
  MyRides: undefined;
  Contact: undefined;
  MyProfile: undefined;
};

import { useTheme } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Sync phone's bottom button navigation bar color with bottom tab bar background
  useEffect(() => {
    setSystemNavigationBarColor(colors.card, !isDark);
  }, [colors.card, isDark]);

  // Handle Android 3-button navigation, gesture pill, and iOS Home Indicator
  const bottomInset = insets.bottom;
  const tabHeight = bottomInset > 0 ? 58 + bottomInset : 64;
  const paddingBottom = bottomInset > 0 ? bottomInset + 2 : 8;

  return (
    <Tab.Navigator
      initialRouteName="Ride"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: tabHeight,
          paddingBottom: paddingBottom,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        // Default tab button shows an Android ripple/shadow on press; disable it.
        tabBarButton: (props) => (
          <Pressable {...(props as any)} android_ripple={{ color: 'transparent', foreground: false }} />
        ),
      }}
    >
      {/* 1. Ride (Home Dashboard Booking Screen) */}
      <Tab.Screen
        name="Ride"
        component={HomeDashboardScreen}
        options={{
          tabBarLabel: 'Ride',
          tabBarIcon: ({ color }) => (
            <RideTabIcon size={22} color={color} />
          ),
        }}
      />

      {/* 2. My Ride (Active, Pending, Completed, Cancelled) */}
      <Tab.Screen
        name="MyRides"
        component={MyRidesScreen}
        options={{
          tabBarLabel: 'My Ride',
          tabBarIcon: ({ color }) => (
            <MyRidesTabIcon size={22} color={color} />
          ),
        }}
      />

      {/* 3. Contact (Contacted Drivers) */}
      <Tab.Screen
        name="Contact"
        component={ContactedDriversScreen}
        options={{
          tabBarLabel: 'Contact',
          tabBarIcon: ({ color }) => (
            <ContactedTabIcon size={22} color={color} />
          ),
        }}
      />

      {/* 4. My Profile (Profile & Settings) */}
      <Tab.Screen
        name="MyProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'My Profile',
          tabBarIcon: ({ color }) => (
            <ProfileTabIcon size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
