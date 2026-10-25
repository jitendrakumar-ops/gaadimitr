import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { driverService } from '../../services/driverService';
import { storageService } from '../../services/storage';
import {
  UpdateDriverPayload,
  UpdateDriverResponse,
  DriverProfileData,
  GetDriverProfileResponse,
} from '../../types/driver';

interface DriverState {
  isLoading: boolean;
  fetchError: string | null;
  isUpdating: boolean;
  updateSuccess: boolean;
  error: string | null;
  driverProfile: DriverProfileData | null;
  isUploadingImages: boolean;
  uploadImagesSuccess: boolean;
  uploadImagesError: string | null;
  isUpdatingStatus: boolean;
  statusError: string | null;
}

const initialState: DriverState = {
  isLoading: false,
  fetchError: null,
  isUpdating: false,
  updateSuccess: false,
  error: null,
  driverProfile: storageService.getObject<DriverProfileData>('driver_data') || null,
  isUploadingImages: false,
  uploadImagesSuccess: false,
  uploadImagesError: null,
  isUpdatingStatus: false,
  statusError: null,
};

/**
 * Async Thunk to fetch driver profile via GET /drivers/me
 */
export const fetchDriverProfile = createAsyncThunk<
  GetDriverProfileResponse,
  void,
  { rejectValue: string }
>('driver/fetchDriverProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await driverService.getDriverProfile();
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch driver profile. Please try again.';
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk to update driver vehicle & profile details via /drivers/update
 */
export const updateDriverProfile = createAsyncThunk<
  UpdateDriverResponse,
  UpdateDriverPayload,
  { rejectValue: string }
>('driver/updateDriverProfile', async (payload, { rejectWithValue }) => {
  try {
    const response = await driverService.updateDriver(payload);
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to update driver details. Please try again.';
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk to upload driver vehicle images via /drivers/me/vehicle-images
 */
export const uploadVehicleImages = createAsyncThunk<
  any,
  FormData,
  { rejectValue: string }
>('driver/uploadVehicleImages', async (formData, { rejectWithValue }) => {
  try {
    const response = await driverService.uploadVehicleImages(formData);
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to upload vehicle photos. Please try again.';
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk to update driver online status via PATCH /drivers/status
 */
export const updateDriverStatus = createAsyncThunk<
  any,
  'online' | 'offline',
  { rejectValue: string }
>('driver/updateDriverStatus', async (status, { rejectWithValue }) => {
  try {
    const response = await driverService.updateStatus(status);
    return response;
  } catch (err: any) {
    const message = err?.message || `Failed to update status to ${status}.`;
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk to update driver GPS location via PATCH /drivers/location
 */
export const updateDriverLocation = createAsyncThunk<
  any,
  { latitude: number; longitude: number; heading?: number },
  { rejectValue: string }
>('driver/updateDriverLocation', async (payload, { rejectWithValue }) => {
  try {
    const response = await driverService.updateLocation(payload);
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to update location.';
    return rejectWithValue(message);
  }
});

export const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setDriverProfile: (state, action: PayloadAction<DriverProfileData | null>) => {
      state.driverProfile = action.payload;
      if (action.payload) {
        storageService.setObject('driver_data', action.payload);
      }
    },
    clearDriverProfile: (state) => {
      state.driverProfile = null;
      storageService.delete('driver_data');
    },
    resetDriverUpdateState: (state) => {
      state.isUpdating = false;
      state.updateSuccess = false;
      state.error = null;
    },
    clearDriverError: (state) => {
      state.error = null;
      state.fetchError = null;
    },
    resetUploadImagesState: (state) => {
      state.isUploadingImages = false;
      state.uploadImagesSuccess = false;
      state.uploadImagesError = null;
    },
    clearUploadImagesError: (state) => {
      state.uploadImagesError = null;
    },
    clearStatusError: (state) => {
      state.statusError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Driver Profile (GET /drivers/me)
      .addCase(fetchDriverProfile.pending, (state) => {
        state.isLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fetchError = null;
        const profile =
          action.payload?.data?.driver ||
          action.payload?.driver ||
          action.payload?.data ||
          action.payload;
        if (profile) {
          state.driverProfile = profile;
          storageService.setObject('driver_data', profile);
        }
      })
      .addCase(fetchDriverProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.fetchError = action.payload || 'Failed to fetch driver profile';
      })

      // Update Driver Profile
      .addCase(updateDriverProfile.pending, (state) => {
        state.isUpdating = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateDriverProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        state.error = null;
        if (action.payload?.data) {
          state.driverProfile = {
            ...(state.driverProfile || {}),
            ...action.payload.data,
          };
          storageService.setObject('driver_data', state.driverProfile);
        }
      })
      .addCase(updateDriverProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = false;
        state.error = action.payload || 'Failed to update vehicle details';
      })

      // Upload Vehicle Images
      .addCase(uploadVehicleImages.pending, (state) => {
        state.isUploadingImages = true;
        state.uploadImagesSuccess = false;
        state.uploadImagesError = null;
      })
      .addCase(uploadVehicleImages.fulfilled, (state, action) => {
        state.isUploadingImages = false;
        state.uploadImagesSuccess = true;
        state.uploadImagesError = null;
        if (action.payload?.data) {
          state.driverProfile = {
            ...(state.driverProfile || {}),
            ...action.payload.data,
          };
          storageService.setObject('driver_data', state.driverProfile);
        }
      })
      .addCase(uploadVehicleImages.rejected, (state, action) => {
        state.isUploadingImages = false;
        state.uploadImagesSuccess = false;
        state.uploadImagesError = action.payload || 'Failed to upload vehicle photos';
      })

      // Update Driver Status (PATCH /drivers/status)
      .addCase(updateDriverStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.statusError = null;
      })
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        state.statusError = null;
        const newStatus = action.meta.arg;
        if (state.driverProfile) {
          state.driverProfile = {
            ...state.driverProfile,
            onlineStatus: newStatus,
          };
          storageService.setObject('driver_data', state.driverProfile);
        }
      })
      .addCase(updateDriverStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.statusError = action.payload || 'Failed to update status';
      })

      // Update Driver Location (PATCH /drivers/location)
      .addCase(updateDriverLocation.fulfilled, (state, action) => {
        const payload = action.meta.arg;
        if (state.driverProfile) {
          state.driverProfile = {
            ...state.driverProfile,
            currentLocation: {
              type: 'Point',
              coordinates: [payload.longitude, payload.latitude],
              heading: payload.heading || 0,
            },
          };
          storageService.setObject('driver_data', state.driverProfile);
        }
      });
  },
});

export const {
  setDriverProfile,
  clearDriverProfile,
  resetDriverUpdateState,
  clearDriverError,
  resetUploadImagesState,
  clearUploadImagesError,
  clearStatusError,
} = driverSlice.actions;
export default driverSlice.reducer;
