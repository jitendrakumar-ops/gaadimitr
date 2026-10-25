import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  driverService,
  NearbyDriverItem,
  QueryNearbyDriversParams,
  ReportDriverPayload,
} from '../../services/driverService';

export interface DriverState {
  nearbyDrivers: NearbyDriverItem[];
  selectedDriver: NearbyDriverItem | null;
  driverMe: NearbyDriverItem | null;
  isLoading: boolean;
  isReporting: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: DriverState = {
  nearbyDrivers: [],
  selectedDriver: null,
  driverMe: null,
  isLoading: false,
  isReporting: false,
  error: null,
  lastFetchedAt: null,
};

/**
 * Async Thunk: Fetch nearby drivers from POST /drivers/nearby
 */
export const fetchNearbyDrivers = createAsyncThunk<
  NearbyDriverItem[],
  QueryNearbyDriversParams,
  { rejectValue: string }
>('drivers/fetchNearbyDrivers', async (params, { rejectWithValue }) => {
  try {
    const data = await driverService.getNearbyDrivers(params);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch nearby drivers.');
  }
});

/**
 * Async Thunk: Fetch authenticated driver profile from GET /drivers/me
 */
export const fetchDriverMe = createAsyncThunk<
  NearbyDriverItem,
  void,
  { rejectValue: string }
>('drivers/fetchDriverMe', async (_, { rejectWithValue }) => {
  try {
    const data = await driverService.getDriverMe();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch driver profile.');
  }
});

/**
 * Async Thunk: Fetch single driver by ID from GET /drivers/:driverId
 */
export const fetchDriverById = createAsyncThunk<
  NearbyDriverItem,
  string,
  { rejectValue: string }
>('drivers/fetchDriverById', async (driverId, { rejectWithValue }) => {
  try {
    const data = await driverService.getDriverById(driverId);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch driver details.');
  }
});

/**
 * Async Thunk: Report a driver via POST /drivers/report
 * Body payload: { driverId, reason, details }
 */
export const reportDriver = createAsyncThunk<
  any,
  ReportDriverPayload,
  { rejectValue: string }
>('drivers/reportDriver', async (payload, { rejectWithValue }) => {
  try {
    const data = await driverService.reportDriver(payload);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to submit report');
  }
});

const normalizeDriverPin = (driver: NearbyDriverItem | null | undefined): NearbyDriverItem | null => {
  if (!driver) return null;

  const apiPin = (driver as any)?.pin ?? (driver.userId as any)?.pin ?? (driver as any)?.user?.pin ?? '';
  const userId = driver.userId ?? {} as any;
  const normalizedUser: NearbyDriverItem['userId'] = {
    _id: userId._id,
    id: userId.id,
    name: userId.name ?? 'Driver',
    phone: userId.phone ?? '',
    profileImage: userId.profileImage ?? null,
    pin: (userId as any)?.pin ?? apiPin,
    experienceYears: userId.experienceYears ?? null,
  };

  return {
    ...driver,
    pin: apiPin,
    userId: normalizedUser,
  };
};

export const driverSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    setSelectedDriver: (state, action: PayloadAction<NearbyDriverItem | string | null>) => {
      if (typeof action.payload === 'string') {
        state.selectedDriver = normalizeDriverPin(state.nearbyDrivers.find(d => (d._id || d.id) === action.payload) || null);
      } else {
        state.selectedDriver = normalizeDriverPin(action.payload);
      }
    },
    setDriverMe: (state, action: PayloadAction<NearbyDriverItem | null>) => {
      state.driverMe = action.payload;
    },
    clearDriverError: (state) => {
      state.error = null;
    },
    resetDriverState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNearbyDrivers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNearbyDrivers.fulfilled, (state, action: PayloadAction<NearbyDriverItem[]>) => {
      state.isLoading = false;
      state.nearbyDrivers = action.payload.map(normalizeDriverPin).filter(Boolean) as NearbyDriverItem[];
      state.lastFetchedAt = Date.now();
      state.error = null;
    });
    builder.addCase(fetchNearbyDrivers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load nearby drivers';
    });

    // fetchDriverMe (GET /drivers/me)
    builder.addCase(fetchDriverMe.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDriverMe.fulfilled, (state, action: PayloadAction<NearbyDriverItem>) => {
      state.isLoading = false;
      state.driverMe = action.payload;
      state.error = null;
    });
    builder.addCase(fetchDriverMe.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load driver profile';
    });

    // fetchDriverById (GET /drivers/:driverId)
    builder.addCase(fetchDriverById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDriverById.fulfilled, (state, action: PayloadAction<NearbyDriverItem>) => {
      state.isLoading = false;
      state.selectedDriver = normalizeDriverPin(action.payload);
      state.error = null;
    });
    builder.addCase(fetchDriverById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load driver details';
    });

    // reportDriver (POST /drivers/report)
    builder.addCase(reportDriver.pending, (state) => {
      state.isReporting = true;
      state.error = null;
    });
    builder.addCase(reportDriver.fulfilled, (state) => {
      state.isReporting = false;
      state.error = null;
    });
    builder.addCase(reportDriver.rejected, (state, action) => {
      state.isReporting = false;
      state.error = action.payload || 'Failed to report driver';
    });
  },
});

export const {
  setSelectedDriver,
  setDriverMe,
  clearDriverError,
  resetDriverState,
} = driverSlice.actions;

export default driverSlice.reducer;
