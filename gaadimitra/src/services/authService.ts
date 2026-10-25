import { Platform } from 'react-native';
import { apiClient } from './api';
import { storageService } from './storage';
import {
  ApiResponse,
  SendOtpPayload,
  SendOtpResponseData,
  VerifyOtpPayload,
  VerifyOtpResponseData,
  RegisterPayload,
  User,
  AuthTokens,
} from '../types/auth';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  AUTH_USER: 'auth_user',
  DEVICE_TOKEN: 'device_token',
};

/**
 * Normalizes phone number with country code (+91)
 */
export const formatPhoneNumber = (phone: string, defaultCode = '+91'): string => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return `${defaultCode}${cleaned}`;
  }
  return cleaned;
};

/**
 * Checks whether a JWT token is expired based on its 'exp' claim
 */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = '';
    for (let i = 0; i < base64.length; i += 4) {
      const enc1 = chars.indexOf(base64.charAt(i));
      const enc2 = chars.indexOf(base64.charAt(i + 1));
      const enc3 = chars.indexOf(base64.charAt(i + 2));
      const enc4 = chars.indexOf(base64.charAt(i + 3));

      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;

      str += String.fromCharCode(chr1);
      if (enc3 !== 64 && enc3 !== -1) str += String.fromCharCode(chr2);
      if (enc4 !== 64 && enc4 !== -1) str += String.fromCharCode(chr3);
    }

    const payload = JSON.parse(str);
    if (!payload.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    // Expire 30 seconds early for safety
    return currentTime >= payload.exp - 30;
  } catch {
    return false;
  }
};

export class AuthService {
  /**
   * Request OTP from backend (/auth/send-otp)
   */
  async sendOtp(payload: SendOtpPayload): Promise<SendOtpResponseData> {
    const normalizedPhone = formatPhoneNumber(payload.phone);

    const response = await apiClient.post<ApiResponse<SendOtpResponseData>>(
      '/auth/send-otp',
      {
        phone: normalizedPhone,
        role: payload.role || 'user',
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to send OTP');
    }

    return response.data;
  }

  /**
   * Verify OTP with backend (/auth/verify-otp)
   * If user not registered yet, seamlessly register as a standard user
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponseData> {
    const normalizedPhone = formatPhoneNumber(payload.phone);

    try {
      const response = await apiClient.post<ApiResponse<VerifyOtpResponseData>>(
        '/auth/verify-otp',
        {
          phone: normalizedPhone,
          otp: payload.otp,
          role: payload.role || 'user',
          platform: payload.platform || 'android',
          deviceToken: payload.deviceToken,
        }
      );

      if (response.success && response.data) {
        this.persistAuth(response.data.tokens, response.data.user);
        return response.data;
      }

      throw new Error(response.message || 'Verification failed');
    } catch (error: any) {
      // If user not registered in DB yet (404 / USER_NOT_FOUND), automatically register
      if (error?.status === 404 || error?.code === 'USER_NOT_FOUND') {
        return await this.register({
          phone: normalizedPhone,
          name: 'GaadiMitra User',
          gender: 'other',
          role: payload.role || 'user',
          platform: payload.platform || 'android',
        });
      }
      throw error;
    }
  }

  /**
   * Register a user (/auth/register)
   */
  async register(payload: RegisterPayload): Promise<VerifyOtpResponseData> {
    const normalizedPhone = formatPhoneNumber(payload.phone);

    const response = await apiClient.post<ApiResponse<VerifyOtpResponseData>>(
      '/auth/register',
      {
        phone: normalizedPhone,
        name: payload.name || 'GaadiMitra User',
        gender: payload.gender || 'other',
        email: payload.email || undefined,
        role: payload.role || 'user',
        platform: payload.platform || 'android',
        deviceToken: payload.deviceToken,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }

    this.persistAuth(response.data.tokens, response.data.user);
    return response.data;
  }

  /**
   * Fetch current user profile (/users/me) using stored access token
   */
  async getProfile(): Promise<User> {
    await storageService.ready();
    const token = storageService.getString(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await apiClient.get<ApiResponse<User>>('/users/me', {
      token,
    });

    if (response.success && response.data) {
      storageService.setObject(STORAGE_KEYS.AUTH_USER, response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch user profile');
  }

  /**
   * Update current user profile (/users/me)
   */
  async updateProfile(payload: {
    name?: string;
    email?: string | null;
    gender?: string | null;
    emergencyPhone?: string | null;
    emergencyContact?: string | null;
    emergencyName?: string | null;
    emergencyRelation?: string | null;
    [key: string]: any;
  }): Promise<User> {
    await storageService.ready();
    const token = storageService.getString(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await apiClient.patch<ApiResponse<User>>('/users/me', payload, {
      token,
    });

    if (response.success && response.data) {
      // Merge with existing cached user data
      const existingUser = storageService.getObject<User>(STORAGE_KEYS.AUTH_USER) || {};
      const updatedUser = { ...existingUser, ...response.data };
      storageService.setObject(STORAGE_KEYS.AUTH_USER, updatedUser);
      return updatedUser;
    }

    throw new Error(response.message || 'Failed to update profile');
  }

  /**
   * Upload user profile image (/users/me/profile-image)
   */
  async uploadProfileImage(
    fileUri: string,
    fileType: string = 'image/jpeg',
    fileName: string = 'profile.jpg'
  ): Promise<string> {
    await storageService.ready();
    const token = storageService.getString(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      throw new Error('No access token available');
    }

    const cleanUri =
      Platform.OS === 'android' ? fileUri : fileUri.replace('file://', '');

    const formData = new FormData();
    formData.append('profileImage', {
      uri: cleanUri,
      type: fileType || 'image/jpeg',
      name: fileName || `profile_${Date.now()}.jpg`,
    } as any);

    const response = await apiClient.post<ApiResponse<{ profileImage: string }>>(
      '/users/me/profile-image',
      formData,
      { token }
    );

    if (response.success && response.data?.profileImage) {
      const newImageUrl = response.data.profileImage;
      const currentUser = storageService.getObject<User>(STORAGE_KEYS.AUTH_USER);
      if (currentUser) {
        currentUser.profileImage = newImageUrl;
        storageService.setObject(STORAGE_KEYS.AUTH_USER, currentUser);
      }
      return newImageUrl;
    }

    throw new Error(response.message || 'Failed to upload profile photo');
  }

  /**
   * Store session credentials into storage
   */
  persistAuth(tokens: AuthTokens, user: User) {
    try {
      if (tokens.accessToken) {
        storageService.setString(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      }
      if (tokens.refreshToken) {
        storageService.setString(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }
      if (user) {
        storageService.setObject(STORAGE_KEYS.AUTH_USER, user);
      }
    } catch (e) {
      console.warn('Failed to persist auth to storage:', e);
    }
  }

  /**
   * Clear session credentials from MMKV
   */
  clearStoredAuth() {
    storageService.delete(STORAGE_KEYS.ACCESS_TOKEN);
    storageService.delete(STORAGE_KEYS.REFRESH_TOKEN);
    storageService.delete(STORAGE_KEYS.AUTH_USER);
  }

  /**
   * Retrieve cached session credentials from MMKV
   */
  getStoredAuth(): { accessToken: string | null; refreshToken: string | null; user: User | null } {
    try {
      const accessToken = storageService.getString(STORAGE_KEYS.ACCESS_TOKEN) || null;
      const refreshToken = storageService.getString(STORAGE_KEYS.REFRESH_TOKEN) || null;
      const user = storageService.getObject<User>(STORAGE_KEYS.AUTH_USER) || null;

      // If accessToken is present and expired, but refreshToken is still valid, keep them for silent refresh
      if (accessToken && isTokenExpired(accessToken)) {
        if (!refreshToken || isTokenExpired(refreshToken)) {
          this.clearStoredAuth();
          return { accessToken: null, refreshToken: null, user: null };
        }
      }

      return { accessToken, refreshToken, user };
    } catch {
      return { accessToken: null, refreshToken: null, user: null };
    }
  }

  /**
   * Silently refresh access token using refresh token
   */
  async refreshAuthToken(): Promise<string | null> {
    const refreshToken = storageService.getString(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken || isTokenExpired(refreshToken)) {
      this.clearStoredAuth();
      return null;
    }

    try {
      const response = await apiClient.post<ApiResponse<{ tokens: AuthTokens }>>(
        '/auth/refresh-token',
        { refreshToken }
      );

      if (response.success && response.data?.tokens) {
        storageService.setString(STORAGE_KEYS.ACCESS_TOKEN, response.data.tokens.accessToken);
        if (response.data.tokens.refreshToken) {
          storageService.setString(STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens.refreshToken);
        }
        return response.data.tokens.accessToken;
      }
    } catch (e) {
      console.warn('Failed to refresh token:', e);
      this.clearStoredAuth();
    }
    return null;
  }

  /**
   * Log out and invalidate refresh token
   */
  async logout(): Promise<void> {
    const refreshToken = storageService.getString(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.warn('Logout request failed:', e);
    } finally {
      this.clearStoredAuth();
    }
  }

  /**
   * Save / register device token with backend (/auth/device-token)
   * Sends deviceToken & platform when user is authenticated
   */
  async updateDeviceToken(deviceToken: string): Promise<any> {
    if (!deviceToken) return null;

    try {
      await storageService.ready();
      storageService.setString(STORAGE_KEYS.DEVICE_TOKEN, deviceToken);
    } catch { }

    const token = storageService.getString(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      if (__DEV__) {
        console.log('ℹ️ [AuthService] User not logged in yet. Device token cached locally.');
      }
      return null;
    }

    try {
      const response = await apiClient.patch<ApiResponse<any>>(
        '/auth/device-token',
        {
          deviceToken,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        },
        { token }
      );

      if (__DEV__) {
        console.log('✅ [AuthService] /auth/device-token success:', response);
      }
      return response;
    } catch (error: any) {
      if (__DEV__) {
        console.warn('⚠️ [AuthService] /auth/device-token failed:', error?.message || error);
      }
      return null;
    }
  }

  /**
   * Legacy phone login compatibility method
   */
  async loginWithPhone(credentials: { countryCode: string; phoneNumber: string; password?: string }) {
    const fullPhone = `${credentials.countryCode}${credentials.phoneNumber}`;
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: 'user_default',
        phone: fullPhone,
        name: 'GaadiMitra User',
        role: 'user',
        isPhoneVerified: true,
      },
    };
  }

  /**
   * Legacy social login compatibility method
   */
  async loginWithSocial(provider: 'google' | 'apple') {
    return {
      success: true,
      message: `${provider} login successful`,
      user: {
        id: 'user_social',
        phone: '+919999999999',
        name: `${provider} User`,
        role: 'user',
        isPhoneVerified: true,
      },
    };
  }
}

export const authService = new AuthService();

