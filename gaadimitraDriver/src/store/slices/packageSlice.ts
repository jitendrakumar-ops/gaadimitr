import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { packageService } from '../../services/packageService';
import {
  BackendPackageItem,
  UserPurchasedPackage,
  BuyPackagePayload,
} from '../../types/package';

interface PackageState {
  packages: BackendPackageItem[];
  selectedPackage: BackendPackageItem | null;
  activePurchase: UserPurchasedPackage | null;
  myPurchases: UserPurchasedPackage[];
  isLoading: boolean;
  isPurchasing: boolean;
  purchaseSuccess: boolean;
  error: string | null;
  purchaseError: string | null;
}

const initialState: PackageState = {
  packages: [],
  selectedPackage: null,
  activePurchase: null,
  myPurchases: [],
  isLoading: false,
  isPurchasing: false,
  purchaseSuccess: false,
  error: null,
  purchaseError: null,
};

export const fetchPackages = createAsyncThunk(
  'package/fetchPackages',
  async (
    params: { serviceId?: string; dayType?: string; isActive?: boolean | string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await packageService.getPackages(params);
      let list = response.data || [];
      // If serviceId filter returned empty list, fallback to all packages so the user has plans available
      if (list.length === 0 && params?.serviceId) {
        const fallbackResponse = await packageService.getPackages();
        list = fallbackResponse.data || [];
      }
      return list;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch packages');
    }
  }
);

export const buyPackage = createAsyncThunk(
  'package/buyPackage',
  async (
    { packageId, payload }: { packageId: string; payload?: BuyPackagePayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await packageService.buyPackage(packageId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to purchase package');
    }
  }
);

export const fetchMyPurchases = createAsyncThunk(
  'package/fetchMyPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await packageService.getMyPurchasedPackages();
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchased packages');
    }
  }
);

const packageSlice = createSlice({
  name: 'package',
  initialState,
  reducers: {
    setSelectedPackage: (state, action: PayloadAction<BackendPackageItem | null>) => {
      state.selectedPackage = action.payload;
    },
    resetPurchaseSuccess: (state) => {
      state.purchaseSuccess = false;
      state.purchaseError = null;
    },
    clearPackageError: (state) => {
      state.error = null;
      state.purchaseError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPackages
      .addCase(fetchPackages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.packages = (action.payload || []).filter((p) => p.isActive !== false);
        state.error = null;
        if (state.packages.length > 0 && !state.selectedPackage) {
          state.selectedPackage = state.packages[0];
        }
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Unable to load packages';
      })

      // buyPackage
      .addCase(buyPackage.pending, (state) => {
        state.isPurchasing = true;
        state.purchaseSuccess = false;
        state.purchaseError = null;
      })
      .addCase(buyPackage.fulfilled, (state, action) => {
        state.isPurchasing = false;
        state.purchaseSuccess = true;
        state.activePurchase = action.payload;
        state.purchaseError = null;
      })
      .addCase(buyPackage.rejected, (state, action) => {
        state.isPurchasing = false;
        state.purchaseSuccess = false;
        state.purchaseError = (action.payload as string) || 'Failed to complete package purchase';
      })

      // fetchMyPurchases
      .addCase(fetchMyPurchases.fulfilled, (state, action) => {
        state.myPurchases = action.payload;
      });
  },
});

export const { setSelectedPackage, resetPurchaseSuccess, clearPackageError } =
  packageSlice.actions;
export default packageSlice.reducer;
