import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { User } from './auth';

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatarSeed?: string;
  avatarBg?: string;
  profileImage?: string | null;
  pin?: string;
  rating: string;
  totalRides: number;
  experienceYears?: number;
  distance: string;
  isVerified?: boolean;
  vehicleModel?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  vehicleNo?: string;
  hasAc?: any;
  seatingCapacity?: string | number;
  pricePerKm?: string;
  driverVehicleImg?: string[] | string;
  vehicleImage?: string | null;
}

export interface TripInfoData {
  pickupLocation: string;
  destination: string;
  date: string;
  pickupTime: string;
  passengers: string | number;
  vehicleModel: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PhoneLogin: undefined;
  VerifyOtp: {
    phoneNumber: string;
    countryCode?: string;
    devOtp?: string;
  };
  LocationPermission: {
    phoneNumber?: string;
  };
  HomeDashboard?: {
    user?: User;
    selectedCity?: string;
    screen?: string;
    params?: any;
  };
  MyRides?: {
    initialFilter?: string;
  };
  ContactedDrivers?: undefined;
  Profile?: undefined;
  // Screen 07: Choose vehicle category
  ChooseVehicle: {
    selectedCity?: string;
    serviceId?: string;
    serviceTitle?: string;
    initialCategoryId?: string;
  };
  // Screen 08: Nearby drivers for selected vehicle category
  NearbyDrivers: {
    categoryId?: string;
    categoryTitle?: string;
    selectedCity?: string;
    serviceId?: string;
    vehicleId?: string;
  };
  // Screen 09: Driver profile & contact
  DriverProfile: {
    driver?: DriverInfo;
    driverId?: string;
    selectedCity?: string;
  };

  // Screen 13: Did you finalize this ride?
  FinalizeRide: {
    driver?: DriverInfo;
    selectedCity?: string;
    tripInfo?: TripInfoData;
    pickupCoords?: { latitude: number; longitude: number };
    dropCoords?: { latitude: number; longitude: number };
  };

  // Screen 15: Enter agreed fare
  // Screen 16: Trip details
  TripDetails: {
    driver?: DriverInfo;
    agreedFare?: number;
    tripInfo?: TripInfoData;
    selectedCity?: string;
    bookingId?: string;
    pickupCoords?: { latitude: number; longitude: number };
    dropCoords?: { latitude: number; longitude: number };
  };

  // Screen 17: Driver accepted
  DriverAccepted: {
    driver?: DriverInfo;
    agreedFare?: number;
    tripInfo?: TripInfoData;
    bookingToken?: number;
    bookingId?: string;
    name?: string;
    phone?: string;
    status?: string;
  };

  // Screen 18: Ride confirmed
  RideConfirmed: {
    driver?: DriverInfo;
    pin?: string;
    agreedFare?: number;
    tripInfo?: TripInfoData;
    bookingToken?: number;
    bookingId?: string;
  };

  // Screen 25: How was your ride? (Rating & Experience)
  RateRide: {
    driver?: DriverInfo;
    bookingId?: string;
    tripInfo?: TripInfoData;
    agreedFare?: number;
  };

  // Screen 27: Ride details
  RideDetails: {
    driver?: DriverInfo;
    bookingId?: string;
    tripInfo?: TripInfoData;
    agreedFare?: number;
    status?: string;
  };

  // Screen 30: How can we help? (Help & Support)
  HelpAndSupport?: {
    initialCategory?: string;
  };

  // Profile Sub-screens
  PersonalDetails?: undefined;
  SavedLocations?: undefined;
  EmergencyContact?: undefined;
  Settings?: undefined;

  // Legal screens
  TermsAndConditions?: undefined;
  PrivacyPolicy?: undefined;

  // Legacy aliases
  Login?: undefined;
  Home?: {
    user?: User;
  };
};

export type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

export type FinalizeRideScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FinalizeRide'
>;
export type FinalizeRideScreenRouteProp = RouteProp<
  RootStackParamList,
  'FinalizeRide'
>;

export type TripDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TripDetails'
>;
export type TripDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'TripDetails'
>;

export type DriverAcceptedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverAccepted'
>;
export type DriverAcceptedScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverAccepted'
>;

export type RideConfirmedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RideConfirmed'
>;
export type RideConfirmedScreenRouteProp = RouteProp<
  RootStackParamList,
  'RideConfirmed'
>;

export type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

export type PhoneLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PhoneLogin'
>;

export type VerifyOtpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VerifyOtp'
>;

export type VerifyOtpScreenRouteProp = RouteProp<
  RootStackParamList,
  'VerifyOtp'
>;

export type LocationPermissionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LocationPermission'
>;

export type LocationPermissionRouteProp = RouteProp<
  RootStackParamList,
  'LocationPermission'
>;

export type HomeDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeDashboard'
>;

export type HomeDashboardRouteProp = RouteProp<
  RootStackParamList,
  'HomeDashboard'
>;

export type ChooseVehicleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChooseVehicle'
>;

export type ChooseVehicleScreenRouteProp = RouteProp<
  RootStackParamList,
  'ChooseVehicle'
>;

export type NearbyDriversScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NearbyDrivers'
>;

export type NearbyDriversScreenRouteProp = RouteProp<
  RootStackParamList,
  'NearbyDrivers'
>;

export type DriverProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverProfile'
>;

export type DriverProfileScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverProfile'
>;

export type TermsAndConditionsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TermsAndConditions'
>;

export type TermsAndConditionsScreenRouteProp = RouteProp<
  RootStackParamList,
  'TermsAndConditions'
>;

export type PrivacyPolicyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PrivacyPolicy'
>;

export type PrivacyPolicyScreenRouteProp = RouteProp<
  RootStackParamList,
  'PrivacyPolicy'
>;

// Screen 25
export type RateRideScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RateRide'
>;
export type RateRideScreenRouteProp = RouteProp<
  RootStackParamList,
  'RateRide'
>;

// Screen 27
export type RideDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RideDetails'
>;
export type RideDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'RideDetails'
>;

// Screen 30
export type HelpAndSupportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HelpAndSupport'
>;
export type HelpAndSupportScreenRouteProp = RouteProp<
  RootStackParamList,
  'HelpAndSupport'
>;

// Settings Screen
export type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;
export type SettingsScreenRouteProp = RouteProp<
  RootStackParamList,
  'Settings'
>;

// Backward compatibility aliases
export type LoginScreenNavigationProp = PhoneLoginScreenNavigationProp;
export type HomeScreenNavigationProp = HomeDashboardNavigationProp;
export type HomeScreenRouteProp = HomeDashboardRouteProp;
