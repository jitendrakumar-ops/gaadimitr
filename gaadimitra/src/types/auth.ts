export interface User {
  id?: string;
  _id?: string;
  phone: string;
  name: string;
  gender?: string;
  email?: string | null;
  profileImage?: string | null;
  role: 'user' | 'driver' | 'admin' | string;
  pin?: string;
  isPhoneVerified?: boolean;
  deviceToken?: string;
  devicePlatform?: string;
  emergencyPhone?: string | null;
  emergencyContact?: string | null;
  emergencyName?: string | null;
  emergencyRelation?: string | null;
  // Compatibility fields
  phoneNumber?: string;
  countryCode?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SendOtpPayload {
  phone: string;
  role?: 'user' | 'driver';
}

export interface SendOtpResponseData {
  phone: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
  devOtp?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  role?: 'user' | 'driver';
  deviceToken?: string;
  platform?: 'android' | 'ios' | 'web';
}

export interface VerifyOtpResponseData {
  user: User;
  driver?: any;
  tokens: AuthTokens;
}

export interface RegisterPayload {
  phone: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  role?: 'user' | 'driver';
  platform?: 'android' | 'ios' | 'web';
  deviceToken?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: any[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: User;
}

export interface LoginCredentials {
  countryCode: string;
  phoneNumber: string;
  password?: string;
}

export interface ValidationError {
  phoneNumber?: string;
  password?: string;
  general?: string;
}
