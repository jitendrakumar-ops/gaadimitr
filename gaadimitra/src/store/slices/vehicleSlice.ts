import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  vehicleService,
  VehicleItem,
  QueryVehiclesParams,
} from '../../services/vehicleService';

export interface VehicleState {
  vehicles: VehicleItem[];
  selectedVehicle: VehicleItem | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: VehicleState = {
  vehicles: [],
  selectedVehicle: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

/**
 * Async Thunk: Fetch vehicles from GET /vehicles (supports query: serviceId, type, isActive)
 */
export const fetchVehicles = createAsyncThunk<
  VehicleItem[],
  QueryVehiclesParams | undefined,
  { rejectValue: string }
>('vehicles/fetchVehicles', async (params, { rejectWithValue }) => {
  try {
    const data = await vehicleService.getVehicles(params);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch vehicles.');
  }
});

/**
 * Async Thunk: Fetch single vehicle by ID
 */
export const fetchVehicleById = createAsyncThunk<
  VehicleItem,
  string,
  { rejectValue: string }
>('vehicles/fetchVehicleById', async (vehicleId, { rejectWithValue }) => {
  try {
    const data = await vehicleService.getVehicleById(vehicleId);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch vehicle details.');
  }
});

export const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setSelectedVehicle: (state, action: PayloadAction<VehicleItem | string | null>) => {
      if (typeof action.payload === 'string') {
        state.selectedVehicle = state.vehicles.find(v => v.id === action.payload) || null;
      } else {
        state.selectedVehicle = action.payload;
      }
    },
    clearVehicleError: (state) => {
      state.error = null;
    },
    resetVehicleState: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchVehicles
    builder.addCase(fetchVehicles.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<VehicleItem[]>) => {
      state.isLoading = false;
      state.vehicles = action.payload;
      state.lastFetchedAt = Date.now();
      state.error = null;
    });
    builder.addCase(fetchVehicles.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load vehicles';
    });

    // fetchVehicleById
    builder.addCase(fetchVehicleById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchVehicleById.fulfilled, (state, action: PayloadAction<VehicleItem>) => {
      state.isLoading = false;
      state.selectedVehicle = action.payload;
      state.error = null;
    });
    builder.addCase(fetchVehicleById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load vehicle details';
    });
  },
});

export const {
  setSelectedVehicle,
  clearVehicleError,
  resetVehicleState,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
