import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import {
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  RegisterDriverPayload,
  RegisterDriverResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
  User,
  DriverProfile,
} from '../../types/auth';

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  sendOtpSuccess: boolean;
  phone: string | null;
  role: string;
  otpResponse: SendOtpResponse | null;

  isVerifying: boolean;
  verifyError: string | null;
  verifyOtpSuccess: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  driver: DriverProfile | null;
  verifyResponse: VerifyOtpResponse | null;
}

import { storageService } from '../../services/storage';
import { isAccessTokenExpired } from '../../utils/token';

const rawToken = storageService.getString('auth_token') || null;
const rawRefreshToken = storageService.getString('refresh_token') || null;
const isAccessExpired = isAccessTokenExpired(rawToken);
const isRefreshExpired = isAccessTokenExpired(rawRefreshToken);

if (isAccessExpired && isRefreshExpired && (rawToken || rawRefreshToken)) {
  // Only clear session if BOTH tokens are expired
  storageService.delete('auth_token');
  storageService.delete('refresh_token');
  storageService.delete('user_data');
  storageService.delete('driver_data');
}

const storedToken = !isAccessExpired ? rawToken : null;
const storedRefreshToken = !isRefreshExpired ? rawRefreshToken : null;
const hasValidSession = !isAccessExpired || !isRefreshExpired;
const storedUser = hasValidSession ? (storageService.getObject<User>('user_data') || null) : null;
const storedDriver = hasValidSession ? (storageService.getObject<DriverProfile>('driver_data') || null) : null;

const initialState: AuthState = {
  isLoading: false,
  error: null,
  sendOtpSuccess: false,
  phone: (storedUser as any)?.phone || (storedUser as any)?.phoneNumber || null,
  role: 'driver',
  otpResponse: null,

  isVerifying: false,
  verifyError: null,
  verifyOtpSuccess: !!storedToken,
  token: storedToken,
  refreshToken: storedRefreshToken,
  user: storedUser,
  driver: storedDriver,
  verifyResponse: null,
};


/**
 * Async Thunk to send OTP via /auth/send-otp
 * Body parameters: { phone: string, role: string }
 */
export const sendOtp = createAsyncThunk<
  SendOtpResponse,
  SendOtpPayload,
  { rejectValue: string }
>('auth/sendOtp', async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.sendOtp(payload);
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to send OTP. Please try again.';
    return rejectWithValue(message);
  }
});

export interface VerifyOtpError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Async Thunk to verify OTP via /auth/verify-otp
 * Body parameters: { phone: string, otp: string, role: string }
 */
export const verifyOtp = createAsyncThunk<
  VerifyOtpResponse,
  VerifyOtpPayload,
  { rejectValue: VerifyOtpError }
>('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.verifyOtp(payload);
    return response;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.message || 'Failed to verify OTP. Please try again.',
      code: err?.code,
      status: err?.status,
    });
  }
});

/**
 * Async Thunk to register driver via POST /drivers/register
 */
export const registerDriver = createAsyncThunk<
  RegisterDriverResponse,
  RegisterDriverPayload,
  { rejectValue: string }
>('auth/registerDriver', async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.registerDriver(payload);
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to register driver. Please try again.';
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk to update user profile via PATCH /auth/profile
 */
export const updateAuthProfile = createAsyncThunk<
  UpdateProfileResponse,
  UpdateProfilePayload,
  { rejectValue: string }
>('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.updateProfile(payload);
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to update profile. Please try again.';
    return rejectWithValue(message);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.sendOtpSuccess = false;
      state.error = null;
      state.isLoading = false;
    },
    clearVerifyError: (state) => {
      state.verifyError = null;
    },
    resetVerifyState: (state) => {
      state.isVerifying = false;
      state.verifyError = null;
      state.verifyOtpSuccess = false;
    },
    setDriverPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        storageService.setObject('user_data', action.payload);
      }
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.driver = null;
      state.phone = null;
      state.verifyOtpSuccess = false;
      state.sendOtpSuccess = false;
      state.otpResponse = null;
      state.verifyResponse = null;
      state.error = null;
      state.verifyError = null;
      storageService.delete('auth_token');
      storageService.delete('refresh_token');
      storageService.delete('user_data');
      storageService.delete('driver_data');
    },
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      state.token = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.verifyOtpSuccess = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.sendOtpSuccess = false;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sendOtpSuccess = true;
        state.phone = action.meta.arg.phone;
        state.role = action.meta.arg.role;
        state.otpResponse = action.payload;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.sendOtpSuccess = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to send OTP';
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isVerifying = true;
        state.verifyError = null;
        state.verifyOtpSuccess = false;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.verifyOtpSuccess = true;
        state.verifyError = null;
        state.verifyResponse = action.payload;

        const payload = action.payload;
        const accessToken =
          payload?.data?.tokens?.accessToken ||
          payload?.tokens?.accessToken ||
          payload?.data?.token ||
          payload?.token ||
          payload?.accessToken ||
          null;

        const refreshToken =
          payload?.data?.tokens?.refreshToken ||
          payload?.tokens?.refreshToken ||
          payload?.data?.refreshToken ||
          payload?.refreshToken ||
          null;

        const user = payload?.data?.user || payload?.user || null;
        const driver = payload?.data?.driver || payload?.driver || null;

        state.token = accessToken;
        state.refreshToken = refreshToken;
        state.user = user;
        state.driver = driver;
      })

      .addCase(verifyOtp.rejected, (state, action) => {
        state.isVerifying = false;
        state.verifyOtpSuccess = false;
        const payload = action.payload;
        if (payload?.code === 'USER_NOT_FOUND') {
          // If user not registered yet, we don't treat it as a hard error banner on screen
          state.verifyError = null;
        } else {
          state.verifyError = payload?.message || action.error.message || 'Failed to verify OTP';
        }
      })
      // Register Driver
      .addCase(registerDriver.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const payload = action.payload;
        const accessToken =
          payload?.data?.tokens?.accessToken ||
          payload?.tokens?.accessToken ||
          payload?.data?.token ||
          payload?.token ||
          payload?.accessToken ||
          null;

        const refreshToken =
          payload?.data?.tokens?.refreshToken ||
          payload?.tokens?.refreshToken ||
          payload?.data?.refreshToken ||
          payload?.refreshToken ||
          null;

        const user = payload?.data?.user || payload?.user || null;
        const driver = payload?.data?.driver || payload?.driver || null;

        if (accessToken) state.token = accessToken;
        if (refreshToken) state.refreshToken = refreshToken;
        if (user) state.user = user;
        if (driver) state.driver = driver;
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to register driver';
      })
      // Update User Profile via /auth/profile
      .addCase(updateAuthProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAuthProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedUser = action.payload?.data || (action.payload as any)?.user;
        if (updatedUser) {
          state.user = {
            ...(state.user || {}),
            ...updatedUser,
          } as User;
        }
      })
      .addCase(updateAuthProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to update profile';
      });
  },
});

export const {
  clearAuthError,
  resetOtpState,
  clearVerifyError,
  resetVerifyState,
  setDriverPhone,
  setAuthUser,
  logout,
  updateTokens,
} = authSlice.actions;
export default authSlice.reducer;

