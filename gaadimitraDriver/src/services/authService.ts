import {
  AuthResponse,
  LoginCredentials,
  User,
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  RegisterDriverPayload,
  RegisterDriverResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from '../types/auth';
import { Platform } from 'react-native';
import { validateIndianPhoneNumber, validatePassword } from '../utils/validation';
import { apiClient } from './api';
import { storageService } from './storage';

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Register Driver via POST /drivers/register
   */
  async registerDriver(payload: RegisterDriverPayload): Promise<RegisterDriverResponse> {
    let formattedPhone = payload.phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      const digitsOnly = formattedPhone.replace(/[^0-9]/g, '');
      if (digitsOnly.length === 10) {
        formattedPhone = `+91${digitsOnly}`;
      } else {
        formattedPhone = `+${digitsOnly}`;
      }
    }

    let response: RegisterDriverResponse;

    if (payload.profileImageUri) {
      const formData = new FormData();
      formData.append('name', payload.name.trim());
      formData.append('phone', formattedPhone);
      formData.append('address', payload.address.trim());
      formData.append(
        'emergencyContact',
        typeof payload.emergencyContact === 'string'
          ? payload.emergencyContact.trim()
          : JSON.stringify(payload.emergencyContact)
      );

      if (payload.email && payload.email.trim()) {
        formData.append('email', payload.email.trim().toLowerCase());
      }
      if (payload.gender) {
        formData.append('gender', payload.gender.toLowerCase());
      }
      if (payload.deviceToken) {
        formData.append('deviceToken', payload.deviceToken);
      }
      formData.append('platform', payload.platform || (Platform.OS === 'ios' ? 'ios' : 'android'));

      const uri = payload.profileImageUri;
      const filename = uri.split('/').pop() || `profile_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      formData.append('profileImage', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: mimeType,
      } as any);

      response = await apiClient.postFormData<RegisterDriverResponse>('/drivers/register', formData);
    } else {
      const jsonBody: Record<string, any> = {
        name: payload.name.trim(),
        phone: formattedPhone,
        address: payload.address.trim(),
        emergencyContact: payload.emergencyContact,
        platform: payload.platform || (Platform.OS === 'ios' ? 'ios' : 'android'),
      };
      if (payload.email && payload.email.trim()) {
        jsonBody.email = payload.email.trim().toLowerCase();
      }
      if (payload.gender) {
        jsonBody.gender = payload.gender.toLowerCase();
      }
      if (payload.deviceToken) {
        jsonBody.deviceToken = payload.deviceToken;
      }

      response = await apiClient.post<RegisterDriverResponse>('/drivers/register', jsonBody);
    }

    // Extract access & refresh tokens based on backend response shape
    const accessToken =
      response?.data?.tokens?.accessToken ||
      response?.tokens?.accessToken ||
      response?.data?.token ||
      response?.token ||
      response?.accessToken;

    const refreshToken =
      response?.data?.tokens?.refreshToken ||
      response?.tokens?.refreshToken ||
      response?.data?.refreshToken ||
      response?.refreshToken;

    const user = response?.data?.user || response?.user;
    const driver = response?.data?.driver || response?.driver;

    if (accessToken) {
      storageService.setString('auth_token', accessToken);
    }
    if (refreshToken) {
      storageService.setString('refresh_token', refreshToken);
    }
    if (user) {
      storageService.setObject('user_data', user);
    }
    if (driver) {
      storageService.setObject('driver_data', driver);
    }

    return response;
  }

  /**
   * Send OTP via /auth/send-otp
   */
  async sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
    const { phone, role = 'driver' } = payload;
    const cleanedPhone = phone.replace(/[^0-9]/g, '');

    return await apiClient.post<SendOtpResponse>('/auth/send-otp', {
      phone: cleanedPhone,
      role,
    });
  }

  /**
   * Verify OTP via /auth/verify-otp
   * Backend returns:
   * {
   *   success: true,
   *   message: 'Authentication successful',
   *   data: {
   *     user: { ... },
   *     driver: { ... } | null,
   *     tokens: { accessToken, refreshToken }
   *   }
   * }
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    const { phone, otp, role = 'driver' } = payload;
    const cleanedPhone = phone.replace(/[^0-9]/g, '');

    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', {
      phone: cleanedPhone,
      otp: otp.trim(),
      role,
    });

    // Extract access & refresh tokens based on backend response shape
    const accessToken =
      response?.data?.tokens?.accessToken ||
      response?.tokens?.accessToken ||
      response?.data?.token ||
      response?.token ||
      response?.accessToken;

    const refreshToken =
      response?.data?.tokens?.refreshToken ||
      response?.tokens?.refreshToken ||
      response?.data?.refreshToken ||
      response?.refreshToken;

    const user = response?.data?.user || response?.user;
    const driver = response?.data?.driver || response?.driver;

    if (accessToken) {
      storageService.setString('auth_token', accessToken);
    }
    if (refreshToken) {
      storageService.setString('refresh_token', refreshToken);
    }
    if (user) {
      storageService.setObject('user_data', user);
    }
    if (driver) {
      storageService.setObject('driver_data', driver);
    }

    return response;
  }

  /**
   * Refresh token via POST /auth/refresh-token
   */
  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    return await apiClient.refreshToken();
  }

  /**
   * Update user profile via PATCH /auth/profile
   * Body parameters: { name?: string, email?: string | null, gender?: 'male' | 'female' | 'other' | null }
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
    try {
      const response = await apiClient.patch<UpdateProfileResponse>('/auth/profile', payload);
      const updatedUser = response?.data || (response as any)?.user;
      if (updatedUser) {
        const currentUser = storageService.getObject<User>('user_data') || {};
        storageService.setObject('user_data', { ...currentUser, ...updatedUser });
      }
      return response;
    } catch (error: any) {
      if (error?.status === 404 || error?.status === 405) {
        const putResponse = await apiClient.patch<UpdateProfileResponse>('/auth/profile', payload);
        const updatedUser = putResponse?.data || (putResponse as any)?.user;
        if (updatedUser) {
          const currentUser = storageService.getObject<User>('user_data') || {};
          storageService.setObject('user_data', { ...currentUser, ...updatedUser });
        }
        return putResponse;
      }
      throw error;
    }
  }

  /**
   * Save / register device token with backend via PATCH /auth/device-token
   * Sends deviceToken & platform when driver is authenticated
   */
  async updateDeviceToken(deviceToken: string): Promise<any> {
    if (!deviceToken) return null;

    try {
      storageService.setString('device_token', deviceToken);
    } catch {}

    const token = storageService.getString('auth_token');
    if (!token) {
      if (__DEV__) {
        console.log('ℹ️ [AuthService] Driver not logged in yet. Device token cached locally.');
      }
      return null;
    }

    try {
      const response = await apiClient.patch<any>(
        '/auth/device-token',
        {
          deviceToken: deviceToken.trim(),
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        },
        { token }
      );

      if (__DEV__) {
        console.log('✅ [AuthService] /auth/device-token saved successfully:', response);
      }
      return response;
    } catch (error: any) {
      // If server route is configured as POST instead of PATCH, fallback
      if (error?.status === 404 || error?.status === 405) {
        try {
          const postResp = await apiClient.post<any>(
            '/auth/device-token',
            {
              deviceToken: deviceToken.trim(),
              platform: Platform.OS === 'ios' ? 'ios' : 'android',
            },
            { token }
          );
          if (__DEV__) {
            console.log('✅ [AuthService] /auth/device-token fallback success:', postResp);
          }
          return postResp;
        } catch (postErr) {
          if (__DEV__) {
            console.warn('❌ [AuthService] /auth/device-token fallback failed:', postErr);
          }
        }
      }
      if (__DEV__) {
        console.warn('❌ [AuthService] /auth/device-token failed:', error?.message || error);
      }
      return null;
    }
  }

  /**
   * Mock login with mobile number and password
   */
  async loginWithPhone(credentials: LoginCredentials): Promise<AuthResponse> {
    const { phoneNumber, password, countryCode } = credentials;

    // Simulate async network request delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));

    // Client-side validation check
    const phoneValidation = validateIndianPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.error || 'Invalid phone number');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error || 'Invalid password');
    }

    // Real network request to public API for live network inspection
    let networkStatus = 'OK';
    try {
      const apiResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber.replace(/\s+/g, ''),
          countryCode: countryCode || '+91',
          loginTime: new Date().toISOString(),
          app: 'GaadiMitra',
        }),
      });
      networkStatus = `HTTP ${apiResponse.status}`;
    } catch (e) {
      console.warn('Network request info:', e);
    }

    // Mock successful authentication response
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: 'Rohan Sharma',
      phoneNumber: phoneNumber.replace(/\s+/g, ''),
      countryCode: countryCode || '+91',
      email: 'rohan.sharma@example.com',
      role: 'buyer',
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: `Login successful (${networkStatus})`,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      user: mockUser,
    };
  }

  /**
   * Mock social login (Google/Apple)
   */
  async loginWithSocial(provider: 'google' | 'apple'): Promise<AuthResponse> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 600));

    const mockUser: User = {
      id: 'usr_social_' + Math.random().toString(36).substring(2, 9),
      name: provider === 'google' ? 'Google User' : 'Apple User',
      phoneNumber: '9876543210',
      countryCode: '+91',
      email: `${provider}.user@example.com`,
      role: 'buyer',
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: `Signed in with ${provider.toUpperCase()}`,
      token: `mock_social_${provider}_token`,
      user: mockUser,
    };
  }

  /**
   * Mock logout
   */
  async logout(): Promise<void> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
  }
}

export const authService = new AuthService();
