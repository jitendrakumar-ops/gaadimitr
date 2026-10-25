import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import adminApi from "../api";

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getVehicleFromResponse = (response) => {
  const data = response?.data ?? response;
  return data?.vehicle || data?.item || data?.data || data || null;
};

const getItemsFromResponse = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.services)) return response.services;

  return [];
};

/* =========================================================
   SERVICES
   GET /services
========================================================= */

export const getServices = createAsyncThunk(
  "vehicle/getServices",
  async (
    { page = 1, limit = 100, search = "", status, isActive } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, limit };

      if (search?.trim()) {
        params.search = search.trim();
      }

      if (status !== undefined && status !== "") {
        params.status = status;
      }

      if (isActive !== undefined && isActive !== "") {
        params.isActive = isActive;
      }

      const response = await adminApi.get("/services", { params });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch services"),
      );
    }
  },
);

/* =========================================================
   CREATE VEHICLE
   POST /vehicles
========================================================= */

export const createVehicle = createAsyncThunk(
  "vehicle/createVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await adminApi.post(
        "/vehicles",
        vehicleData,
        vehicleData instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : undefined,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create vehicle"),
      );
    }
  },
);

/* =========================================================
   GET VEHICLES
   GET /vehicles
========================================================= */

export const getVehicles = createAsyncThunk(
  "vehicle/getVehicles",
  async (
    { page = 1, limit = 10, search = "", status, type, serviceId } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = {
        page,
        limit,
      };

      if (search?.trim()) params.search = search.trim();
      if (status !== undefined && status !== "") params.isActive = status;
      if (type && type !== "all") params.type = type;
      if (serviceId && serviceId !== "all") params.serviceId = serviceId;

      const response = await adminApi.get("/vehicles", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch vehicles"),
      );
    }
  },
);

/* =========================================================
   GET VEHICLE BY ID
   GET /vehicles/:vehicleId
========================================================= */

export const getVehicleById = createAsyncThunk(
  "vehicle/getVehicleById",
  async (vehicleId, { rejectWithValue }) => {
    try {
      if (!vehicleId) return rejectWithValue("Vehicle ID is required");

      const response = await adminApi.get(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch vehicle details"),
      );
    }
  },
);

/* =========================================================
   UPDATE VEHICLE
   PATCH /vehicles/:vehicleId
========================================================= */

export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async ({ vehicleId, vehicleData }, { rejectWithValue }) => {
    try {
      if (!vehicleId) return rejectWithValue("Vehicle ID is required");

      const response = await adminApi.patch(
        `/vehicles/${vehicleId}`,
        vehicleData,
        vehicleData instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : undefined,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update vehicle"),
      );
    }
  },
);

/* =========================================================
   DELETE VEHICLE
   DELETE /vehicles/:vehicleId
========================================================= */

export const deleteVehicle = createAsyncThunk(
  "vehicle/deleteVehicle",
  async (vehicleId, { rejectWithValue }) => {
    try {
      if (!vehicleId) return rejectWithValue("Vehicle ID is required");

      const response = await adminApi.delete(`/vehicles/${vehicleId}`);

      return {
        vehicleId,
        response: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete vehicle"),
      );
    }
  },
);

/* =========================================================
   GET MY VEHICLE
   GET /vehicles/me
========================================================= */

export const getMyVehicle = createAsyncThunk(
  "vehicle/getMyVehicle",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/vehicles/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch assigned vehicle"),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  vehicles: [],
  services: [],
  selectedVehicle: null,
  myVehicle: null,

  totalVehicles: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,

  servicesLoading: false,
  servicesError: null,

  loading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  myVehicleLoading: false,

  error: null,
  detailsError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  myVehicleError: null,

  status: "idle",
};

/* =========================================================
   SLICE
========================================================= */

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,

  reducers: {
    clearVehicleError: (state) => {
      state.error = null;
      state.detailsError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.myVehicleError = null;
      state.servicesError = null;
    },

    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
    },

    clearMyVehicle: (state) => {
      state.myVehicle = null;
    },

    resetVehicleState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       SERVICES
    ===================================================== */

    builder
      .addCase(getServices.pending, (state) => {
        state.servicesLoading = true;
        state.servicesError = null;
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.servicesLoading = false;
        state.services = getItemsFromResponse(action.payload);
      })
      .addCase(getServices.rejected, (state, action) => {
        state.servicesLoading = false;
        state.servicesError = action.payload || "Failed to fetch services";
      });

    /* =====================================================
       GET VEHICLES
    ===================================================== */

    builder
      .addCase(getVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";

        const response = action.payload;
        const data = response?.data;

        if (Array.isArray(data?.items)) {
          state.vehicles = data.items;
        } else if (Array.isArray(data)) {
          state.vehicles = data;
        } else if (Array.isArray(data?.vehicles)) {
          state.vehicles = data.vehicles;
        } else if (Array.isArray(response?.vehicles)) {
          state.vehicles = response.vehicles;
        } else {
          state.vehicles = [];
        }

        const pagination = data?.pagination || {};

        state.totalVehicles = pagination.total ?? state.vehicles.length;
        state.currentPage = pagination.page ?? 1;
        state.limit = pagination.limit ?? 10;
        state.totalPages =
          pagination.totalPages ??
          Math.max(1, Math.ceil(state.totalVehicles / state.limit));
        state.hasNextPage = pagination.hasNextPage ?? false;
        state.hasPrevPage = pagination.hasPrevPage ?? false;
      })
      .addCase(getVehicles.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Failed to fetch vehicles";
      });

    /* =====================================================
       GET VEHICLE BY ID
    ===================================================== */

    builder
      .addCase(getVehicleById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.selectedVehicle = null;
      })
      .addCase(getVehicleById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedVehicle = getVehicleFromResponse(action.payload);
      })
      .addCase(getVehicleById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || "Failed to fetch vehicle details";
      });

    /* =====================================================
       CREATE VEHICLE
    ===================================================== */

    builder
      .addCase(createVehicle.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.createLoading = false;

        const vehicle = getVehicleFromResponse(action.payload);

        if (vehicle) {
          state.vehicles.unshift(vehicle);
          state.totalVehicles += 1;
        }
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create vehicle";
      });

    /* =====================================================
       UPDATE VEHICLE
    ===================================================== */

    builder
      .addCase(updateVehicle.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.updateLoading = false;

        const updatedVehicle = getVehicleFromResponse(action.payload);
        if (!updatedVehicle) return;

        const updatedId = updatedVehicle?._id || updatedVehicle?.id;

        const index = state.vehicles.findIndex(
          (vehicle) => vehicle?._id === updatedId || vehicle?.id === updatedId,
        );

        if (index !== -1) {
          state.vehicles[index] = updatedVehicle;
        }

        if (
          state.selectedVehicle?._id === updatedId ||
          state.selectedVehicle?.id === updatedId
        ) {
          state.selectedVehicle = updatedVehicle;
        }

        if (
          state.myVehicle?._id === updatedId ||
          state.myVehicle?.id === updatedId
        ) {
          state.myVehicle = updatedVehicle;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update vehicle";
      });

    /* =====================================================
       DELETE VEHICLE
    ===================================================== */

    builder
      .addCase(deleteVehicle.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.deleteLoading = false;

        const vehicleId = action.payload?.vehicleId;

        state.vehicles = state.vehicles.filter(
          (vehicle) => vehicle?._id !== vehicleId && vehicle?.id !== vehicleId,
        );

        if (
          state.selectedVehicle?._id === vehicleId ||
          state.selectedVehicle?.id === vehicleId
        ) {
          state.selectedVehicle = null;
        }

        if (
          state.myVehicle?._id === vehicleId ||
          state.myVehicle?.id === vehicleId
        ) {
          state.myVehicle = null;
        }

        state.totalVehicles = Math.max(0, state.totalVehicles - 1);
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete vehicle";
      });

    /* =====================================================
       GET MY VEHICLE
    ===================================================== */

    builder
      .addCase(getMyVehicle.pending, (state) => {
        state.myVehicleLoading = true;
        state.myVehicleError = null;
      })
      .addCase(getMyVehicle.fulfilled, (state, action) => {
        state.myVehicleLoading = false;
        state.myVehicle = getVehicleFromResponse(action.payload);
      })
      .addCase(getMyVehicle.rejected, (state, action) => {
        state.myVehicleLoading = false;
        state.myVehicleError =
          action.payload || "Failed to fetch assigned vehicle";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearVehicleError,
  clearSelectedVehicle,
  clearMyVehicle,
  resetVehicleState,
} = vehicleSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectVehicles = (state) => state.vehicle?.vehicles || [];

export const selectServices = (state) => state.vehicle?.services || [];

export const selectSelectedVehicle = (state) =>
  state.vehicle?.selectedVehicle || null;

export const selectMyVehicle = (state) => state.vehicle?.myVehicle || null;

export const selectVehicleLoading = (state) => state.vehicle?.loading || false;

export const selectVehicleDetailsLoading = (state) =>
  state.vehicle?.detailsLoading || false;

export const selectVehicleCreateLoading = (state) =>
  state.vehicle?.createLoading || false;

export const selectVehicleUpdateLoading = (state) =>
  state.vehicle?.updateLoading || false;

export const selectVehicleDeleteLoading = (state) =>
  state.vehicle?.deleteLoading || false;

export const selectMyVehicleLoading = (state) =>
  state.vehicle?.myVehicleLoading || false;

export const selectServicesLoading = (state) =>
  state.vehicle?.servicesLoading || false;

export const selectVehicleError = (state) => state.vehicle?.error || null;

export const selectVehicleDetailsError = (state) =>
  state.vehicle?.detailsError || null;

export const selectVehicleCreateError = (state) =>
  state.vehicle?.createError || null;

export const selectVehicleUpdateError = (state) =>
  state.vehicle?.updateError || null;

export const selectVehicleDeleteError = (state) =>
  state.vehicle?.deleteError || null;

export const selectMyVehicleError = (state) =>
  state.vehicle?.myVehicleError || null;

export const selectServicesError = (state) =>
  state.vehicle?.servicesError || null;

export const selectVehiclePagination = createSelector(
  [(state) => state.vehicle],
  (vehicle) => ({
    totalVehicles: vehicle?.totalVehicles || 0,
    currentPage: vehicle?.currentPage || 1,
    totalPages: vehicle?.totalPages || 1,
    limit: vehicle?.limit || 10,
    hasNextPage: vehicle?.hasNextPage || false,
    hasPrevPage: vehicle?.hasPrevPage || false,
  })
);

export default vehicleSlice.reducer;
