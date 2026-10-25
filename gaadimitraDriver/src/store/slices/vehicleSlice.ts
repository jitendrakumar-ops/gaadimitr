import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { vehicleService, BackendVehicleItem } from '../../services/vehicleService';

interface VehicleState {
  vehicles: BackendVehicleItem[];
  isLoading: boolean;
  error: string | null;
  selectedVehicle: BackendVehicleItem | null;
}

const initialState: VehicleState = {
  vehicles: [],
  isLoading: false,
  error: null,
  selectedVehicle: null,
};

export const fetchVehicles = createAsyncThunk(
  'vehicle/fetchVehicles',
  async (serviceId: string | undefined, { rejectWithValue }) => {
    try {
      const data = await vehicleService.getVehicles(serviceId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch vehicles');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    setSelectedVehicle: (state, action: PayloadAction<BackendVehicleItem | null>) => {
      state.selectedVehicle = action.payload;
    },
    clearVehicleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = (action.payload || []).filter((v) => v.isActive !== false);
        state.error = null;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Unable to load vehicles';
      });
  },
});

export const { setSelectedVehicle, clearVehicleError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
