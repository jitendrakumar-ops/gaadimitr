export interface User {
  id: string;
  name: string;
  phoneNumber?: string;
  phone?: string;
  countryCode?: string;
  email?: string;
  role?: 'buyer' | 'seller' | 'dealer' | 'admin' | 'driver' | string;
  avatarUrl?: string;
  profileImage?: string | null;
  gender?: 'male' | 'female' | 'other' | string;
  address?: string;
  emergencyContact?: any;
  pin?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface LoginCredentials {
  countryCode: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: User;
}

export interface ValidationError {
  phoneNumber?: string;
  password?: string;
  general?: string;
}

export interface SendOtpPayload {
  phone: string;
  role: string;
}

export interface SendOtpResponse {
  success?: boolean;
  message?: string;
  otp?: string;
  data?: any;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface DriverProfile {
  id?: string;
  onlineStatus?: string;
  serviceId?: string;
  vehicleId?: string;
  vehicleModel?: string;
  vehicleNo?: string;
  manufacturingYear?: string;
  seating?: number;
  type?: string;
  color?: string;
  vehicleImages?: string[];
  [key: string]: any;
}

export interface VerifyOtpData {
  user?: User;
  driver?: DriverProfile | null;
  tokens?: Tokens;
  [key: string]: any;
}

export interface VerifyOtpResponse {
  success?: boolean;
  message?: string;
  data?: VerifyOtpData;
  // Direct fallbacks
  tokens?: Tokens;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  driver?: DriverProfile | null;
}

export interface RegisterDriverPayload {
  name: string;
  phone: string;
  address: string;
  emergencyContact: string | { name?: string; phone?: string; relation?: string };
  email?: string;
  gender?: 'male' | 'female' | 'other';
  deviceToken?: string;
  platform?: 'ios' | 'android' | 'web';
  profileImageUri?: string | null;
}

export interface RegisterDriverData {
  user?: User;
  pin?: string;
  driver?: DriverProfile | null;
  tokens?: Tokens;
  [key: string]: any;
}

export interface RegisterDriverResponse {
  success?: boolean;
  message?: string;
  data?: RegisterDriverData;
  tokens?: Tokens;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  driver?: DriverProfile | null;
  pin?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

export interface UpdateProfileResponse {
  success?: boolean;
  message?: string;
  data?: User;
}

export interface DeviceTokenPayload {
  deviceToken: string;
  platform?: 'ios' | 'android' | 'web';
}

export interface DeviceTokenResponse {
  success?: boolean;
  message?: string;
  data?: {
    deviceToken?: string;
    devicePlatform?: string;
    [key: string]: any;
  };
}
