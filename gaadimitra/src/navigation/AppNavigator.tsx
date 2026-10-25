import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { PhoneLoginScreen } from '../screens/auth/PhoneLoginScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { LocationPermissionScreen } from '../screens/location/LocationPermissionScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { ChooseVehicleScreen } from '../screens/vehicle/ChooseVehicleScreen';
import { NearbyDriversScreen } from '../screens/drivers/NearbyDriversScreen';
import { DriverProfileScreen } from '../screens/drivers/DriverProfileScreen';
import { FinalizeRideScreen } from '../screens/booking/FinalizeRideScreen';
import { TripDetailsScreen } from '../screens/booking/TripDetailsScreen';
import { DriverAcceptedScreen } from '../screens/booking/DriverAcceptedScreen';
import { RideConfirmedScreen } from '../screens/booking/RideConfirmedScreen';
import { TermsAndConditionsScreen } from '../screens/legal/TermsAndConditionsScreen';
import { PrivacyPolicyScreen } from '../screens/legal/PrivacyPolicyScreen';

// Screens 19 - 27 (Post-confirmation active journey, rating & details)
import { RateRideScreen } from '../screens/journey/RateRideScreen';
import { RideDetailsScreen } from '../screens/journey/RideDetailsScreen';
import { HelpAndSupportScreen } from '../screens/support/HelpAndSupportScreen';
import { PersonalDetailsScreen } from '../screens/profile/PersonalDetailsScreen';
import { SavedLocationsScreen } from '../screens/profile/SavedLocationsScreen';
import { EmergencyContactScreen } from '../screens/profile/EmergencyContactScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

import { useTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { navigationTheme, colors } = useTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Screen 01: Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />

        {/* Screen 02: Onboarding Intro */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />

        {/* Screen 03: Welcome & Phone Entry */}
        <Stack.Screen
          name="PhoneLogin"
          component={PhoneLoginScreen}
        />

        {/* Screen 04: Verify OTP */}
        <Stack.Screen
          name="VerifyOtp"
          component={VerifyOtpScreen}
        />

        {/* Screen 05: Location Access */}
        <Stack.Screen
          name="LocationPermission"
          component={LocationPermissionScreen}
        />

        {/* Post-Login Main Shell with Persistent Bottom Navbar (Ride, My Rides, Contacted, Profile) */}
        <Stack.Screen
          name="HomeDashboard"
          component={MainTabNavigator}
          options={{ animation: 'fade' }}
        />

        {/* Screen 07: Choose Vehicle */}
        <Stack.Screen
          name="ChooseVehicle"
          component={ChooseVehicleScreen}
        />

        {/* Screen 08: Nearby Drivers */}
        <Stack.Screen
          name="NearbyDrivers"
          component={NearbyDriversScreen}
        />

        {/* Screen 09: Driver Detail Profile & Call */}
        <Stack.Screen
          name="DriverProfile"
          component={DriverProfileScreen}
        />

        {/* Screen 13: Finalize Ride / Post Call Decision */}
        <Stack.Screen
          name="FinalizeRide"
          component={FinalizeRideScreen}
        />

        {/* Screen 16: Trip Details */}
        <Stack.Screen
          name="TripDetails"
          component={TripDetailsScreen}
        />

        {/* Screen 17: Driver Accepted */}
        <Stack.Screen
          name="DriverAccepted"
          component={DriverAcceptedScreen}
        />

        {/* Screen 18: Ride Confirmed */}
        <Stack.Screen
          name="RideConfirmed"
          component={RideConfirmedScreen}
        />

        {/* Screen 25: How was your ride? (Rating & Experience) */}
        <Stack.Screen
          name="RateRide"
          component={RateRideScreen}
        />

        {/* Screen 27: Ride details */}
        <Stack.Screen
          name="RideDetails"
          component={RideDetailsScreen}
        />

        {/* Screen 30: How can we help? (Help & Support) */}
        <Stack.Screen
          name="HelpAndSupport"
          component={HelpAndSupportScreen}
        />

        {/* Profile Sub-screens */}
        <Stack.Screen
          name="PersonalDetails"
          component={PersonalDetailsScreen}
        />
        <Stack.Screen
          name="SavedLocations"
          component={SavedLocationsScreen}
        />
        <Stack.Screen
          name="EmergencyContact"
          component={EmergencyContactScreen}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />

        {/* Legal Screen: Terms & Privacy Policy */}
        <Stack.Screen
          name="TermsAndConditions"
          component={TermsAndConditionsScreen}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
