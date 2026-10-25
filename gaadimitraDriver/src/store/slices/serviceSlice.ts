import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { serviceService, BackendServiceItem } from '../../services/serviceService';

interface ServiceState {
  services: BackendServiceItem[];
  isLoading: boolean;
  error: string | null;
  selectedService: BackendServiceItem | null;
}

const initialState: ServiceState = {
  services: [],
  isLoading: false,
  error: null,
  selectedService: null,
};

export const fetchServices = createAsyncThunk(
  'service/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const data = await serviceService.getServices();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch services');
    }
  }
);

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setSelectedService: (state, action: PayloadAction<BackendServiceItem | null>) => {
      state.selectedService = action.payload;
    },
    clearServiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = (action.payload || []).filter((s) => s.isActive !== false);
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Unable to load services';
      });
  },
});

export const { setSelectedService, clearServiceError } = serviceSlice.actions;
export default serviceSlice.reducer;
