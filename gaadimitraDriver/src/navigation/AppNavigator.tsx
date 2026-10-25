import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme';

// Screen components (01 to 12)
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PhoneLoginScreen } from '../screens/PhoneLoginScreen';
import { VerifyOtpScreen } from '../screens/VerifyOtpScreen';
import { PersonalDetailsScreen } from '../screens/PersonalDetailsScreen';
import { ServiceSelectScreen } from '../screens/ServiceSelectScreen';
import { VehicleSelectScreen } from '../screens/VehicleSelectScreen';
import { VehicleDetailsScreen } from '../screens/VehicleDetailsScreen';
import { AddVehiclePhotosScreen } from '../screens/AddVehiclePhotosScreen';
import { VerifyDocumentsScreen } from '../screens/VerifyDocumentsScreen';
import { UploadDrivingLicenceScreen } from '../screens/UploadDrivingLicenceScreen';
import { UploadRcScreen } from '../screens/UploadRcScreen';
import { UploadInsuranceScreen } from '../screens/UploadInsuranceScreen';
import { UploadPermitScreen } from '../screens/UploadPermitScreen';
import { UploadIdProofScreen } from '../screens/UploadIdProofScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { RideRequestPreviewScreen } from '../screens/RideRequestPreviewScreen';
import { WaitingTokenScreen } from '../screens/WaitingTokenScreen';
import { RideConfirmedScreen } from '../screens/RideConfirmedScreen';
import { RideDetailsScreen } from '../screens/RideDetailsScreen';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { VehicleProfileScreen } from '../screens/VehicleProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { SupportChatScreen } from '../screens/SupportChatScreen';
import { ReferEarnScreen } from '../screens/ReferEarnScreen';
import { ProfileDetailsScreen } from '../screens/ProfileDetailsScreen';

import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { colors, navigationTheme } = useTheme();

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
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
          name="DriverOnboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />

        {/* Screen 03: Create Account (Phone Entry) */}
        <Stack.Screen
          name="DriverPhoneLogin"
          component={PhoneLoginScreen}
        />

        {/* Screen 04: Verify Number (6-digit OTP) */}
        <Stack.Screen
          name="DriverVerifyOtp"
          component={VerifyOtpScreen}
        />

        {/* Screen 05: Personal Details */}
        <Stack.Screen
          name="DriverPersonalDetails"
          component={PersonalDetailsScreen}
        />

        {/* Screen: Service Selection (Daily Rides, Outstation, Rental, Cargo, etc.) */}
        <Stack.Screen
          name="DriverServiceSelect"
          component={ServiceSelectScreen}
        />

        {/* Screen 06: Vehicle Selection */}
        <Stack.Screen
          name="DriverVehicleSelect"
          component={VehicleSelectScreen}
        />

        {/* Screen 07: Vehicle details */}
        <Stack.Screen
          name="DriverVehicleDetails"
          component={VehicleDetailsScreen}
        />

        {/* Screen 08: Add vehicle photos */}
        <Stack.Screen
          name="DriverAddVehiclePhotos"
          component={AddVehiclePhotosScreen}
        />

        {/* Screen 09: Verify your documents */}
        <Stack.Screen
          name="DriverVerifyDocuments"
          component={VerifyDocumentsScreen}
        />

        {/* Document Detail Upload Screens */}
        <Stack.Screen
          name="UploadDrivingLicence"
          component={UploadDrivingLicenceScreen}
        />
        <Stack.Screen
          name="UploadRc"
          component={UploadRcScreen}
        />
        <Stack.Screen
          name="UploadInsurance"
          component={UploadInsuranceScreen}
        />
        <Stack.Screen
          name="UploadPermit"
          component={UploadPermitScreen}
        />
        <Stack.Screen
          name="UploadIdProof"
          component={UploadIdProofScreen}
        />

        {/* Screen 10: Activate your listing / Subscription */}
        <Stack.Screen
          name="DriverSubscription"
          component={SubscriptionScreen}
        />

        {/* Screen 13: Driver Home Dashboard / Main Tabs (Home, Inquiries, Rides, Profile) */}
        <Stack.Screen
          name="DriverHome"
          component={MainTabNavigator}
          options={{ animation: 'fade' }}
        />

        {/* Screen 15: Ride Request Preview */}
        <Stack.Screen
          name="DriverRideRequestPreview"
          component={RideRequestPreviewScreen}
        />

        {/* Screen 17: Waiting for Token */}
        <Stack.Screen
          name="DriverRideAccepted"
          component={WaitingTokenScreen}
        />
        <Stack.Screen
          name="WaitingToken"
          component={WaitingTokenScreen}
        />

        {/* Screen 18: Ride Confirmed (Token Paid) */}
        <Stack.Screen
          name="DriverRideConfirmed"
          component={RideConfirmedScreen}
        />

        {/* Screen: Ride Details (Full Summary, Route, Fare, Receipt) */}
        <Stack.Screen
          name="RideDetails"
          component={RideDetailsScreen}
        />

        {/* Screen: Driver Documents Overview (All Documents) */}
        <Stack.Screen
          name="DriverDocuments"
          component={DocumentsScreen}
        />

        {/* Screen: Driver Vehicle Profile (Read-only vehicle info) */}
        <Stack.Screen
          name="DriverVehicleProfile"
          component={VehicleProfileScreen}
        />

        {/* Screen: Driver Settings (Theme, Notifications, Language, etc.) */}
        <Stack.Screen
          name="DriverSettings"
          component={SettingsScreen}
        />

        {/* Screen: Driver Terms & Conditions */}
        <Stack.Screen
          name="DriverTerms"
          component={TermsScreen}
        />

        {/* Screen: Driver Help & Support */}
        <Stack.Screen
          name="DriverHelpSupport"
          component={HelpSupportScreen}
        />

        {/* Screen: Driver Support Live Chat */}
        <Stack.Screen
          name="DriverSupportChat"
          component={SupportChatScreen}
        />

        {/* Screen: Driver Refer & Earn */}
        <Stack.Screen
          name="DriverReferEarn"
          component={ReferEarnScreen}
        />

        {/* Screen: Driver Profile Details */}
        <Stack.Screen
          name="DriverProfileDetails"
          component={ProfileDetailsScreen}
        />

        {/* Dashboard / Summary (Compatibility alias) */}
        <Stack.Screen
          name="DriverSuccess"
          component={MainTabNavigator}
          options={{ animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};



