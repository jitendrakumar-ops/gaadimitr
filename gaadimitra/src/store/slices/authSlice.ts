import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  User,
  SendOtpPayload,
  SendOtpResponseData,
  VerifyOtpPayload,
  VerifyOtpResponseData,
} from '../../types/auth';
import { authService, isTokenExpired } from '../../services/authService';
import { storageService } from '../../services/storage';
import { notificationService } from '../../services/notificationService';

// Reasons that indicate a truly invalid/expired session (not just network failure)
const SESSION_INVALID_REASONS = [
  'No active session',
  'Session expired',
  'Token expired',
  'Session verification failed',
];

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  phone: string | null;
  devOtp: string | null;
  otpSent: boolean;
  cooldownSeconds: number;
  deviceToken: string | null;
}

// Synchronously recover session from MMKV for instant zero-flicker initialization
const initialStored = authService.getStoredAuth();
const isInitiallyValid = Boolean(
  initialStored.accessToken &&
  initialStored.user &&
  !isTokenExpired(initialStored.accessToken)
);

const initialState: AuthState = {
  user: isInitiallyValid ? initialStored.user : null,
  accessToken: isInitiallyValid ? initialStored.accessToken : null,
  refreshToken: isInitiallyValid ? initialStored.refreshToken : null,
  isAuthenticated: isInitiallyValid,
  isLoading: false,
  error: null,
  phone: null,
  devOtp: null,
  otpSent: false,
  cooldownSeconds: 60,
  deviceToken: storageService.getString('device_token') || null,
};

// Async Thunk: Send OTP
export const sendOtp = createAsyncThunk<
  SendOtpResponseData,
  SendOtpPayload,
  { rejectValue: string }
>('auth/sendOtp', async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.sendOtp(payload);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to send OTP. Please try again.');
  }
});

// Async Thunk: Verify OTP
export const verifyOtp = createAsyncThunk<
  VerifyOtpResponseData,
  VerifyOtpPayload,
  { rejectValue: string }
>('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.verifyOtp(payload);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Invalid or expired OTP. Please try again.');
  }
});

// Async Thunk: Restore cached authentication from storage on launch & auto-refresh if needed
export const restoreAuth = createAsyncThunk<
  { accessToken: string | null; refreshToken: string | null; user: User | null }
>('auth/restoreAuth', async () => {
  try {
    await storageService.ready();
  } catch {}
  const stored = authService.getStoredAuth();
  if (stored.accessToken && isTokenExpired(stored.accessToken) && stored.refreshToken) {
    const newToken = await authService.refreshAuthToken();
    if (newToken) {
      stored.accessToken = newToken;
    }
  }

  // When app opens: if user has a valid active session, sync device token to /auth/device-token
  if (stored.accessToken && stored.user) {
    notificationService.syncDeviceToken().catch(() => {});
  }

  return stored;
});

// Async Thunk: Live session check with backend (/users/me)
export const checkAuthSession = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/checkAuthSession', async (_, { rejectWithValue }) => {
  try {
    await storageService.ready();
    const stored = authService.getStoredAuth();

    if (!stored.accessToken) {
      return rejectWithValue('No active session');
    }

    // If token is expired, try refreshing
    if (isTokenExpired(stored.accessToken)) {
      if (stored.refreshToken) {
        const refreshed = await authService.refreshAuthToken();
        if (!refreshed) {
          authService.clearStoredAuth();
          return rejectWithValue('Session expired');
        }
      } else {
        authService.clearStoredAuth();
        return rejectWithValue('Token expired');
      }
    }

    // Live call to backend /users/me
    const userProfile = await authService.getProfile();

    // User confirmed logged in: save FCM token via /auth/device-token
    notificationService.syncDeviceToken().catch(() => {});

    return userProfile;
  } catch (err: any) {
    if (err?.status === 401) {
      authService.clearStoredAuth();
    }
    return rejectWithValue(err?.message || 'Session verification failed');
  }
});

// Async Thunk: Sync device token to backend (/auth/device-token)
export const syncDeviceToken = createAsyncThunk<
  string | null,
  string | undefined,
  { rejectValue: string }
>('auth/syncDeviceToken', async (explicitToken, { rejectWithValue }) => {
  try {
    const token = explicitToken || (await notificationService.syncDeviceToken());
    return token;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to sync device token');
  }
});

// Async Thunk: Update Profile
export const updateProfile = createAsyncThunk<
  User,
  {
    name?: string;
    email?: string | null;
    gender?: string | null;
    emergencyPhone?: string | null;
    emergencyContact?: string | null;
    emergencyName?: string | null;
    emergencyRelation?: string | null;
    [key: string]: any;
  },
  { rejectValue: string }
>('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const updated = await authService.updateProfile(payload);
    return updated;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update profile');
  }
});

// Async Thunk: Upload Profile Image
export const uploadProfileImage = createAsyncThunk<
  string,
  { uri: string; type?: string; name?: string },
  { rejectValue: string }
>('auth/uploadProfileImage', async ({ uri, type, name }, { rejectWithValue }) => {
  try {
    const imageUrl = await authService.uploadProfileImage(uri, type, name);
    return imageUrl;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to upload profile photo');
  }
});

// Async Thunk: Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    // Send OTP
    builder.addCase(sendOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.otpSent = true;
      state.phone = action.payload.phone;
      state.devOtp = action.payload.devOtp || null;
      state.cooldownSeconds = action.payload.cooldownSeconds || 60;
    });
    builder.addCase(sendOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to send OTP';
      state.otpSent = false;
    });

    // Verify OTP
    builder.addCase(verifyOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.error = null;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to verify OTP';
    });

    // Restore Auth
    builder.addCase(restoreAuth.fulfilled, (state, action) => {
      const { accessToken, refreshToken, user } = action.payload;
      if (accessToken && user && !isTokenExpired(accessToken)) {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.user = user;
        state.isAuthenticated = true;
      } else {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    });

    // Sync Device Token
    builder.addCase(syncDeviceToken.fulfilled, (state, action) => {
      if (action.payload) {
        state.deviceToken = action.payload;
      }
    });

    // Check Auth Session (Live /users/me verification)
    builder.addCase(checkAuthSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuthSession.fulfilled, (state, action) => {
      state.user = action.payload;
      state.accessToken = storageService.getString('access_token') || state.accessToken;
      state.refreshToken = storageService.getString('refresh_token') || state.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(checkAuthSession.rejected, (state, action) => {
      state.isLoading = false;
      const reason = action.payload as string;

      // Only clear auth on explicit session failures (no token, 401, expired)
      // Network errors / server unreachable should NOT force logout
      const isDefinitelyInvalid = SESSION_INVALID_REASONS.some((r) =>
        reason?.includes(r)
      );

      if (isDefinitelyInvalid) {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      }
      // else: network error — preserve existing stored session
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to update profile';
    });

    // Upload Profile Image
    builder.addCase(uploadProfileImage.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(uploadProfileImage.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.user) {
        state.user.profileImage = action.payload;
      }
      state.error = null;
    });
    builder.addCase(uploadProfileImage.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to upload photo';
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.devOtp = null;
      state.error = null;
    });
  },
});

export const { setPhone, setUser, clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
