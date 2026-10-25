import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import adminApi from "../api";

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getPackageFromResponse = (response) => {
  const data = response?.data ?? response;
  return data?.package || data?.item || data?.data || data || null;
};

const getItemsFromResponse = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.packages)) return data.packages;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.packages)) return response.packages;

  return [];
};

/* =========================================================
   CREATE PACKAGE
   POST /packages
========================================================= */

export const createPackage = createAsyncThunk(
  "package/createPackage",
  async (packageData, { rejectWithValue }) => {
    try {
      const response = await adminApi.post("/packages", packageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create package"),
      );
    }
  },
);

/* =========================================================
   GET PACKAGES
   GET /packages
========================================================= */

export const getPackages = createAsyncThunk(
  "package/getPackages",
  async (
    { page = 1, limit = 10, search = "", serviceId, isActive, dayType } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, limit };

      if (search?.trim()) params.search = search.trim();
      if (serviceId && serviceId !== "all") params.serviceId = serviceId;
      if (isActive !== undefined && isActive !== "") params.isActive = isActive;
      if (dayType && dayType !== "all") params.dayType = dayType;

      const response = await adminApi.get("/packages", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch packages"),
      );
    }
  },
);

/* =========================================================
   GET PACKAGE BY ID
   GET /packages/:packageId
========================================================= */

export const getPackageById = createAsyncThunk(
  "package/getPackageById",
  async (packageId, { rejectWithValue }) => {
    try {
      if (!packageId) return rejectWithValue("Package ID is required");

      const response = await adminApi.get(`/packages/${packageId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch package details"),
      );
    }
  },
);

/* =========================================================
   UPDATE PACKAGE
   PATCH /packages/:packageId
========================================================= */

export const updatePackage = createAsyncThunk(
  "package/updatePackage",
  async ({ packageId, packageData }, { rejectWithValue }) => {
    try {
      if (!packageId) return rejectWithValue("Package ID is required");

      const response = await adminApi.patch(
        `/packages/${packageId}`,
        packageData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update package"),
      );
    }
  },
);

/* =========================================================
   DELETE PACKAGE
   DELETE /packages/:packageId
========================================================= */

export const deletePackage = createAsyncThunk(
  "package/deletePackage",
  async (packageId, { rejectWithValue }) => {
    try {
      if (!packageId) return rejectWithValue("Package ID is required");

      const response = await adminApi.delete(`/packages/${packageId}`);

      return {
        packageId,
        response: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete package"),
      );
    }
  },
);

/* =========================================================
   BUY PACKAGE
   POST /packages/:packageId/buy
========================================================= */

export const buyPackage = createAsyncThunk(
  "package/buyPackage",
  async ({ packageId, purchaseData = {} }, { rejectWithValue }) => {
    try {
      if (!packageId) return rejectWithValue("Package ID is required");

      const response = await adminApi.post(
        `/packages/${packageId}/buy`,
        purchaseData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to purchase package"),
      );
    }
  },
);

/* =========================================================
   GET MY PACKAGES (user's purchased packages)
   GET /packages/my/purchases
========================================================= */

export const getMyPackages = createAsyncThunk(
  "package/getMyPackages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/packages/my/purchases");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch your packages"),
      );
    }
  },
);

/* =========================================================
   GET ALL USER PACKAGES (Admin monitor user subscriptions)
   GET /packages/user-packages
========================================================= */

export const getAllUserPackages = createAsyncThunk(
  "package/getAllUserPackages",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (filters.status && filters.status !== "all") params.status = filters.status;
      if (filters.paymentStatus && filters.paymentStatus !== "all") params.paymentStatus = filters.paymentStatus;
      if (filters.userId) params.userId = filters.userId;
      if (filters.packageId) params.packageId = filters.packageId;
      if (filters.search?.trim()) params.search = filters.search.trim();

      const response = await adminApi.get("/packages/user-packages", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch user subscriptions"),
      );
    }
  },
);

/* =========================================================
   UPDATE USER PACKAGE STATUS
   PATCH /packages/user-packages/:id/status
========================================================= */

export const updateUserPackageStatus = createAsyncThunk(
  "package/updateUserPackageStatus",
  async ({ userPackageId, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.patch(
        `/packages/user-packages/${userPackageId}/status`,
        { status },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update subscription status"),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  packages: [],
  selectedPackage: null,
  myPackages: [],
  purchasedPackage: null,
  userPackages: [],

  totalPackages: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,

  loading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  buyLoading: false,
  myPackagesLoading: false,
  userPackagesLoading: false,
  updateUserPackageLoading: false,

  error: null,
  detailsError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  buyError: null,
  myPackagesError: null,
  userPackagesError: null,
  updateUserPackageError: null,

  success: false,
  message: null,
  status: "idle",
};

/* =========================================================
   SLICE
========================================================= */

const packageSlice = createSlice({
  name: "package",
  initialState,

  reducers: {
    clearPackageError: (state) => {
      state.error = null;
      state.detailsError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.buyError = null;
      state.myPackagesError = null;
      state.userPackagesError = null;
      state.updateUserPackageError = null;
    },

    clearUserPackagesError: (state) => {
      state.userPackagesError = null;
      state.updateUserPackageError = null;
    },

    clearUserPackages: (state) => {
      state.userPackages = [];
    },

    clearSelectedPackage: (state) => {
      state.selectedPackage = null;
    },

    clearPurchasedPackage: (state) => {
      state.purchasedPackage = null;
    },

    clearMyPackages: (state) => {
      state.myPackages = [];
    },

    clearPackageSuccess: (state) => {
      state.success = false;
      state.message = null;
    },

    resetPackageState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       CREATE PACKAGE
    ===================================================== */

    builder
      .addCase(createPackage.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.success = false;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.message = action.payload?.message || "Package created successfully";

        const pkg = getPackageFromResponse(action.payload);

        if (pkg) {
          state.packages.unshift(pkg);
          state.totalPackages += 1;
        }
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create package";
        state.success = false;
      });

    /* =====================================================
       GET PACKAGES
    ===================================================== */

    builder
      .addCase(getPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(getPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";

        const response = action.payload;
        const data = response?.data;

        if (Array.isArray(data?.items)) {
          state.packages = data.items;
        } else if (Array.isArray(data?.packages)) {
          state.packages = data.packages;
        } else if (Array.isArray(data)) {
          state.packages = data;
        } else if (Array.isArray(response?.packages)) {
          state.packages = response.packages;
        } else {
          state.packages = getItemsFromResponse(response);
        }

        const pagination = data?.pagination || response?.pagination || {};

        state.totalPackages = pagination.total ?? data?.total ?? state.packages.length;
        state.currentPage = pagination.page ?? data?.page ?? 1;
        state.limit = pagination.limit ?? data?.limit ?? 10;
        state.totalPages =
          pagination.totalPages ??
          pagination.total_pages ??
          Math.max(1, Math.ceil(state.totalPackages / state.limit));
        state.hasNextPage = pagination.hasNextPage ?? false;
        state.hasPrevPage = pagination.hasPrevPage ?? false;
      })
      .addCase(getPackages.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Failed to fetch packages";
      });

    /* =====================================================
       GET PACKAGE BY ID
    ===================================================== */

    builder
      .addCase(getPackageById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.selectedPackage = null;
      })
      .addCase(getPackageById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedPackage = getPackageFromResponse(action.payload);
      })
      .addCase(getPackageById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || "Failed to fetch package details";
      });

    /* =====================================================
       UPDATE PACKAGE
    ===================================================== */

    builder
      .addCase(updatePackage.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.success = false;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.message = action.payload?.message || "Package updated successfully";

        const updatedPkg = getPackageFromResponse(action.payload);
        if (!updatedPkg) return;

        const updatedId = updatedPkg?._id || updatedPkg?.id;

        const index = state.packages.findIndex(
          (pkg) => pkg?._id === updatedId || pkg?.id === updatedId,
        );

        if (index !== -1) {
          state.packages[index] = updatedPkg;
        }

        if (
          state.selectedPackage?._id === updatedId ||
          state.selectedPackage?.id === updatedId
        ) {
          state.selectedPackage = updatedPkg;
        }
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update package";
        state.success = false;
      });

    /* =====================================================
       DELETE PACKAGE
    ===================================================== */

    builder
      .addCase(deletePackage.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.success = false;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.message = action.payload?.response?.message || "Package deleted successfully";

        const packageId = action.payload?.packageId;

        state.packages = state.packages.filter(
          (pkg) => pkg?._id !== packageId && pkg?.id !== packageId,
        );

        if (
          state.selectedPackage?._id === packageId ||
          state.selectedPackage?.id === packageId
        ) {
          state.selectedPackage = null;
        }

        state.totalPackages = Math.max(0, state.totalPackages - 1);
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete package";
        state.success = false;
      });

    /* =====================================================
       BUY PACKAGE
    ===================================================== */

    builder
      .addCase(buyPackage.pending, (state) => {
        state.buyLoading = true;
        state.buyError = null;
        state.success = false;
      })
      .addCase(buyPackage.fulfilled, (state, action) => {
        state.buyLoading = false;
        state.success = true;
        state.message = action.payload?.message || "Package purchased successfully";
        state.purchasedPackage = getPackageFromResponse(action.payload);
      })
      .addCase(buyPackage.rejected, (state, action) => {
        state.buyLoading = false;
        state.buyError = action.payload || "Failed to purchase package";
        state.success = false;
      });

    /* =====================================================
       GET MY PACKAGES
    ===================================================== */

    builder
      .addCase(getMyPackages.pending, (state) => {
        state.myPackagesLoading = true;
        state.myPackagesError = null;
      })
      .addCase(getMyPackages.fulfilled, (state, action) => {
        state.myPackagesLoading = false;
        state.myPackages = getItemsFromResponse(action.payload);
      })
      .addCase(getMyPackages.rejected, (state, action) => {
        state.myPackagesLoading = false;
        state.myPackagesError =
          action.payload || "Failed to fetch your packages";
      });

    /* =====================================================
       GET ALL USER PACKAGES (Admin monitor user subscriptions)
    ===================================================== */

    builder
      .addCase(getAllUserPackages.pending, (state) => {
        state.userPackagesLoading = true;
        state.userPackagesError = null;
      })
      .addCase(getAllUserPackages.fulfilled, (state, action) => {
        state.userPackagesLoading = false;
        state.userPackagesError = null;

        const resData = action.payload?.data;
        if (Array.isArray(resData)) {
          state.userPackages = resData;
        } else if (Array.isArray(resData?.items)) {
          state.userPackages = resData.items;
        } else if (Array.isArray(action.payload)) {
          state.userPackages = action.payload;
        } else {
          state.userPackages = getItemsFromResponse(action.payload);
        }
      })
      .addCase(getAllUserPackages.rejected, (state, action) => {
        state.userPackagesLoading = false;
        state.userPackagesError =
          action.payload || "Failed to fetch user subscriptions";
      });

    /* =====================================================
       UPDATE USER PACKAGE STATUS
    ===================================================== */

    builder
      .addCase(updateUserPackageStatus.pending, (state) => {
        state.updateUserPackageLoading = true;
        state.updateUserPackageError = null;
      })
      .addCase(updateUserPackageStatus.fulfilled, (state, action) => {
        state.updateUserPackageLoading = false;
        state.updateUserPackageError = null;
        const updated = action.payload?.data || action.payload;
        if (!updated) return;
        const updatedId = updated._id || updated.id;
        const index = state.userPackages.findIndex(
          (up) => up._id === updatedId || up.id === updatedId,
        );
        if (index !== -1) {
          state.userPackages[index] = {
            ...state.userPackages[index],
            ...updated,
          };
        }
      })
      .addCase(updateUserPackageStatus.rejected, (state, action) => {
        state.updateUserPackageLoading = false;
        state.updateUserPackageError =
          action.payload || "Failed to update subscription status";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearPackageError,
  clearSelectedPackage,
  clearPurchasedPackage,
  clearMyPackages,
  clearUserPackages,
  clearUserPackagesError,
  clearPackageSuccess,
  resetPackageState,
} = packageSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectPackages = (state) => state.package?.packages || [];

export const selectSelectedPackage = (state) =>
  state.package?.selectedPackage || null;

export const selectMyPackages = (state) => state.package?.myPackages || [];

export const selectPurchasedPackage = (state) =>
  state.package?.purchasedPackage || null;

export const selectUserPackages = (state) =>
  state.package?.userPackages || [];

export const selectUserPackagesLoading = (state) =>
  state.package?.userPackagesLoading || false;

export const selectUserPackagesError = (state) =>
  state.package?.userPackagesError || null;

export const selectUpdateUserPackageLoading = (state) =>
  state.package?.updateUserPackageLoading || false;

export const selectUpdateUserPackageError = (state) =>
  state.package?.updateUserPackageError || null;

export const selectPackageLoading = (state) =>
  state.package?.loading || false;

export const selectPackageDetailsLoading = (state) =>
  state.package?.detailsLoading || false;

export const selectPackageCreateLoading = (state) =>
  state.package?.createLoading || false;

export const selectPackageUpdateLoading = (state) =>
  state.package?.updateLoading || false;

export const selectPackageDeleteLoading = (state) =>
  state.package?.deleteLoading || false;

export const selectPackageBuyLoading = (state) =>
  state.package?.buyLoading || false;

export const selectMyPackagesLoading = (state) =>
  state.package?.myPackagesLoading || false;

export const selectPackageError = (state) => state.package?.error || null;

export const selectPackageDetailsError = (state) =>
  state.package?.detailsError || null;

export const selectPackageCreateError = (state) =>
  state.package?.createError || null;

export const selectPackageUpdateError = (state) =>
  state.package?.updateError || null;

export const selectPackageDeleteError = (state) =>
  state.package?.deleteError || null;

export const selectPackageBuyError = (state) =>
  state.package?.buyError || null;

export const selectMyPackagesError = (state) =>
  state.package?.myPackagesError || null;

export const selectPackageSuccess = (state) =>
  state.package?.success || false;

export const selectPackageMessage = (state) =>
  state.package?.message || null;

export const selectPackagePagination = createSelector(
  [
    (state) => state.package?.totalPackages || 0,
    (state) => state.package?.currentPage || 1,
    (state) => state.package?.totalPages || 1,
    (state) => state.package?.limit || 10,
    (state) => state.package?.hasNextPage || false,
    (state) => state.package?.hasPrevPage || false,
  ],
  (totalPackages, currentPage, totalPages, limit, hasNextPage, hasPrevPage) => ({
    totalPackages,
    currentPage,
    totalPages,
    limit,
    hasNextPage,
    hasPrevPage,
  }),
);

export default packageSlice.reducer;
