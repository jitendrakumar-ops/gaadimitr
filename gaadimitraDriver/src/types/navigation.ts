import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export interface DriverProfileData {
  fullName: string;
  phoneNumber: string;
  profilePhotoUri?: string;
  city?: string;
  address: string;
  emergencyContact: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  driverId?: string;
  userId?: string;
  pin?: string;
}

export interface VehicleOption {
  id: string;
  name: string;
  category: string;
  iconType: string;
  isPopular?: boolean;
  image?: string;
  seat?: number;
  fee?: number;
  type?: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
}

export interface VehicleDetailsData {
  model: string;
  number: string;
  year: string;
  capacity: string;
  acType: string;
  color: string;
}

export type RootStackParamList = {
  // Screen 01: Splash Screen
  Splash: undefined;
  
  // Screen 02: Intro & Opportunity
  DriverOnboarding: undefined;
  
  // Screen 03: Phone Input / Account Creation
  DriverPhoneLogin: undefined;
  
  // Screen 04: OTP Verification
  DriverVerifyOtp: {
    phoneNumber: string;
    countryCode?: string;
  };
  
  // Screen 05: Personal Details Form
  DriverPersonalDetails: {
    phoneNumber?: string;
  };
  
  // Screen: Select Service (Daily Rides, Rental, Outstation, Goods, etc.)
  DriverServiceSelect: {
    driverData?: DriverProfileData;
  };

  // Screen 06: Vehicle Selection 3x3 Grid
  DriverVehicleSelect: {
    driverData?: DriverProfileData;
    selectedService?: ServiceOption;
  };

  // Screen 07: Vehicle details
  DriverVehicleDetails: {
    driverData?: DriverProfileData;
    selectedService?: ServiceOption;
    selectedVehicle?: VehicleOption;
  };

  // Screen 08: Add vehicle photos
  DriverAddVehiclePhotos: {
    driverData?: DriverProfileData;
    selectedService?: ServiceOption;
    selectedVehicle?: VehicleOption;
    vehicleDetails?: VehicleDetailsData;
  };

  // Screen 09: Verify your documents
  DriverVerifyDocuments: {
    driverData?: DriverProfileData;
    selectedService?: ServiceOption;
    selectedVehicle?: VehicleOption;
    vehicleDetails?: VehicleDetailsData;
    updatedDoc?: {
      id: string;
      docNumber?: string;
      extraInfo?: string;
      frontImageUri?: string | null;
      backImageUri?: string | null;
      documentImageUri?: string | null;
    };
  };

  // Sub-screens for Document Details (matching backend API fields)
  UploadDrivingLicence: {
    initialData?: {
      docNumber?: string;
      dlType?: string;
      frontImageUri?: string | null;
      backImageUri?: string | null;
    };
  };

  UploadRc: {
    initialData?: {
      docNumber?: string;
      frontImageUri?: string | null;
      backImageUri?: string | null;
    };
  };

  UploadInsurance: {
    initialData?: {
      policyNumber?: string;
      documentImageUri?: string | null;
    };
  };

  UploadPermit: {
    initialData?: {
      permitNumber?: string;
      permitType?: string;
      documentImageUri?: string | null;
    };
  };

  UploadIdProof: {
    initialData?: {
      cardNo?: string;
      frontImageUri?: string | null;
      backImageUri?: string | null;
    };
  };

  // Screen 10: Activate your listing / Subscription Plan
  DriverSubscription: {
    driverData?: DriverProfileData;
    selectedService?: ServiceOption;
    selectedVehicle?: VehicleOption;
  };

  // Screen 13: Driver Home Dashboard (after subscription)
  DriverHome: {
    driverData?: DriverProfileData;
    selectedVehicle?: VehicleOption;
  };

  // Completed / Success Dashboard (alias)
  DriverSuccess: {
    driverData?: DriverProfileData;
    selectedVehicle?: VehicleOption;
  };

  // Screen 15: Ride Request Preview / Review Trip
  DriverRideRequestPreview: {
    requestId?: string;
  } | undefined;

  // Screen 17: Ride Accepted (Waiting for Customer Token)
  DriverRideAccepted: {
    requestId?: string;
  } | undefined;
  WaitingToken: {
    requestId?: string;
  } | undefined;

  // Screen 18: Ride Confirmed (Customer Paid Token)
  DriverRideConfirmed: {
    requestId?: string;
  } | undefined;

  // Driver Documents Management Screen (Showing all documents)
  DriverDocuments: undefined;

  // Driver Vehicle Profile (Read-only vehicle details screen)
  DriverVehicleProfile: undefined;

  // Driver Settings Screen (Theme, Notifications, Language, etc.)
  DriverSettings: undefined;

  // Driver Terms & Conditions Screen
  DriverTerms: undefined;

  // Driver Help & Support Screen (Details + FAQs)
  DriverHelpSupport: undefined;

  // Driver Live Support Chat Screen
  DriverSupportChat: undefined;

  // Driver Refer and Earn Screen
  DriverReferEarn: undefined;

  // Driver Profile Details (View personal & partner details)
  DriverProfileDetails: undefined;

  // Ride Details Screen
  RideDetails: {
    ride: {
      id: string;
      bookingId: string;
      customer: string;
      phone?: string;
      from: string;
      to: string;
      date: string;
      fare: string;
      token?: string;
      paymentMode?: string;
      vehicle?: string;
      status: 'Completed' | 'Cancelled' | 'Active' | string;
      reason?: string;
      distance?: string;
      duration?: string;
      baseFare?: string;
      distanceFare?: string;
      customerRating?: string;
    };
  };

  // Compatibility alias
  DriverRideDetails?: {
    ride: any;
  };

  // Aliases for compatibility
  Onboarding?: undefined;
  PhoneLogin?: undefined;
  VerifyOtp?: {
    phoneNumber: string;
    countryCode?: string;
  };
};

export type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

export type DriverOnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverOnboarding'
>;

export type DriverPhoneLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverPhoneLogin'
>;

export type DriverVerifyOtpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverVerifyOtp'
>;
export type DriverVerifyOtpScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverVerifyOtp'
>;

export type DriverPersonalDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverPersonalDetails'
>;
export type DriverPersonalDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverPersonalDetails'
>;

export type DriverServiceSelectScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverServiceSelect'
>;
export type DriverServiceSelectScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverServiceSelect'
>;

export type DriverVehicleSelectScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverVehicleSelect'
>;
export type DriverVehicleSelectScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverVehicleSelect'
>;

// Screen 07
export type DriverVehicleDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverVehicleDetails'
>;
export type DriverVehicleDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverVehicleDetails'
>;

// Screen 08
export type DriverAddVehiclePhotosScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverAddVehiclePhotos'
>;
export type DriverAddVehiclePhotosScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverAddVehiclePhotos'
>;

// Screen 09
export type DriverVerifyDocumentsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverVerifyDocuments'
>;
export type DriverVerifyDocumentsScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverVerifyDocuments'
>;

// Document Detail Screens
export type UploadDrivingLicenceNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UploadDrivingLicence'
>;
export type UploadDrivingLicenceRouteProp = RouteProp<
  RootStackParamList,
  'UploadDrivingLicence'
>;

export type UploadRcNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UploadRc'
>;
export type UploadRcRouteProp = RouteProp<
  RootStackParamList,
  'UploadRc'
>;

export type UploadInsuranceNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UploadInsurance'
>;
export type UploadInsuranceRouteProp = RouteProp<
  RootStackParamList,
  'UploadInsurance'
>;

export type UploadPermitNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UploadPermit'
>;
export type UploadPermitRouteProp = RouteProp<
  RootStackParamList,
  'UploadPermit'
>;

export type UploadIdProofNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UploadIdProof'
>;
export type UploadIdProofRouteProp = RouteProp<
  RootStackParamList,
  'UploadIdProof'
>;

// Screen 12
export type DriverSubscriptionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverSubscription'
>;
export type DriverSubscriptionScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverSubscription'
>;

// Success / Dashboard
export type DriverSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverSuccess'
>;
export type DriverSuccessScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverSuccess'
>;

export type DriverHomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverHome'
>;
export type DriverHomeScreenRouteProp = RouteProp<
  RootStackParamList,
  'DriverHome'
>;

export type HomeScreenNavigationProp = DriverHomeScreenNavigationProp;
export type HomeScreenRouteProp = DriverHomeScreenRouteProp;

// Ride Flow Props
export type DriverRideRequestPreviewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverRideRequestPreview'
>;
export type DriverRideRequestPreviewRouteProp = RouteProp<
  RootStackParamList,
  'DriverRideRequestPreview'
>;
export type RideRequestPreviewNavigationProp = DriverRideRequestPreviewNavigationProp;
export type RideRequestPreviewRouteProp = DriverRideRequestPreviewRouteProp;

export type DriverRideAcceptedNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverRideAccepted'
>;
export type DriverRideAcceptedRouteProp = RouteProp<
  RootStackParamList,
  'DriverRideAccepted'
>;
export type RideAcceptedNavigationProp = DriverRideAcceptedNavigationProp;
export type RideAcceptedRouteProp = DriverRideAcceptedRouteProp;
export type WaitingTokenNavigationProp = DriverRideAcceptedNavigationProp;
export type WaitingTokenRouteProp = DriverRideAcceptedRouteProp;

export type DriverRideConfirmedNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverRideConfirmed'
>;
export type DriverRideConfirmedRouteProp = RouteProp<
  RootStackParamList,
  'DriverRideConfirmed'
>;
export type RideConfirmedNavigationProp = DriverRideConfirmedNavigationProp;
export type RideConfirmedRouteProp = DriverRideConfirmedRouteProp;

export type DriverDocumentsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverDocuments'
>;
export type DriverDocumentsRouteProp = RouteProp<
  RootStackParamList,
  'DriverDocuments'
>;

export type DriverVehicleProfileNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverVehicleProfile'
>;
export type DriverVehicleProfileRouteProp = RouteProp<
  RootStackParamList,
  'DriverVehicleProfile'
>;

export type DriverSettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverSettings'
>;
export type DriverSettingsRouteProp = RouteProp<
  RootStackParamList,
  'DriverSettings'
>;

export type DriverTermsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverTerms'
>;
export type DriverTermsRouteProp = RouteProp<
  RootStackParamList,
  'DriverTerms'
>;

export type DriverHelpSupportNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverHelpSupport'
>;
export type DriverHelpSupportRouteProp = RouteProp<
  RootStackParamList,
  'DriverHelpSupport'
>;

export type DriverSupportChatNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverSupportChat'
>;
export type DriverSupportChatRouteProp = RouteProp<
  RootStackParamList,
  'DriverSupportChat'
>;

export type DriverReferEarnNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverReferEarn'
>;
export type DriverReferEarnRouteProp = RouteProp<
  RootStackParamList,
  'DriverReferEarn'
>;

export type DriverProfileDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DriverProfileDetails'
>;
export type DriverProfileDetailsRouteProp = RouteProp<
  RootStackParamList,
  'DriverProfileDetails'
>;

