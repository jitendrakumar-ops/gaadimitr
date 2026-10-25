import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  servicesService,
  ServiceItem,
  QueryServicesParams,
} from '../../services/servicesService';

export interface ServicesState {
  services: ServiceItem[];
  selectedService: ServiceItem | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: ServicesState = {
  services: [],
  selectedService: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

/**
 * Async Thunk: Fetch all active services from GET /services
 */
export const fetchServices = createAsyncThunk<
  ServiceItem[],
  QueryServicesParams | undefined,
  { rejectValue: string }
>('services/fetchServices', async (params = { isActive: true }, { rejectWithValue }) => {
  try {
    const data = await servicesService.getServices(params);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch services. Please try again.');
  }
});

/**
 * Async Thunk: Fetch a single service by ID from GET /services/:serviceId
 */
export const fetchServiceById = createAsyncThunk<
  ServiceItem,
  string,
  { rejectValue: string }
>('services/fetchServiceById', async (serviceId, { rejectWithValue }) => {
  try {
    const data = await servicesService.getServiceById(serviceId);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch service details.');
  }
});

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setSelectedService: (state, action: PayloadAction<ServiceItem | string | null>) => {
      if (typeof action.payload === 'string') {
        state.selectedService = state.services.find(s => s.id === action.payload) || null;
      } else {
        state.selectedService = action.payload;
      }
    },
    clearServicesError: (state) => {
      state.error = null;
    },
    resetServicesState: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchServices
    builder.addCase(fetchServices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServices.fulfilled, (state, action: PayloadAction<ServiceItem[]>) => {
      state.isLoading = false;
      state.services = action.payload;
      state.lastFetchedAt = Date.now();
      state.error = null;
    });
    builder.addCase(fetchServices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load services';
    });

    // fetchServiceById
    builder.addCase(fetchServiceById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServiceById.fulfilled, (state, action: PayloadAction<ServiceItem>) => {
      state.isLoading = false;
      state.selectedService = action.payload;
      state.error = null;
    });
    builder.addCase(fetchServiceById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load service detail';
    });
  },
});

export const {
  setSelectedService,
  clearServicesError,
  resetServicesState,
} = servicesSlice.actions;

export default servicesSlice.reducer;
