import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminApi from "../api";

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getServiceFromResponse = (response) => {
  const data = response?.data ?? response;
  return data?.service || data?.item || data?.data || data || null;
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
   GET ALL SERVICES
   GET /services
========================================================= */

export const getServices = createAsyncThunk(
  "service/getServices",
  async ({ search = "", isActive } = {}, { rejectWithValue }) => {
    try {
      const params = {};

      if (search?.trim()) {
        params.search = search.trim();
      }

      if (isActive !== undefined && isActive !== "" && isActive !== "all") {
        params.isActive = String(isActive);
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
   GET SERVICE BY ID
   GET /services/:serviceId
========================================================= */

export const getServiceById = createAsyncThunk(
  "service/getServiceById",
  async (serviceId, { rejectWithValue }) => {
    try {
      if (!serviceId) return rejectWithValue("Service ID is required");

      const response = await adminApi.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch service details"),
      );
    }
  },
);

/* =========================================================
   CREATE SERVICE
   POST /services
========================================================= */

export const createService = createAsyncThunk(
  "service/createService",
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await adminApi.post(
        "/services",
        serviceData,
        serviceData instanceof FormData
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
        getErrorMessage(error, "Failed to create service"),
      );
    }
  },
);

/* =========================================================
   UPDATE SERVICE
   PATCH /services/:serviceId
========================================================= */

export const updateService = createAsyncThunk(
  "service/updateService",
  async ({ serviceId, serviceData }, { rejectWithValue }) => {
    try {
      if (!serviceId) return rejectWithValue("Service ID is required");

      const response = await adminApi.patch(
        `/services/${serviceId}`,
        serviceData,
        serviceData instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : undefined,
      );

      return {
        serviceId,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update service"),
      );
    }
  },
);

/* =========================================================
   DELETE SERVICE
   DELETE /services/:serviceId
========================================================= */

export const deleteService = createAsyncThunk(
  "service/deleteService",
  async (serviceId, { rejectWithValue }) => {
    try {
      if (!serviceId) return rejectWithValue("Service ID is required");

      const response = await adminApi.delete(`/services/${serviceId}`);

      return {
        serviceId,
        response: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete service"),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  services: [],
  selectedService: null,

  loading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  error: null,
  detailsError: null,
  createError: null,
  updateError: null,
  deleteError: null,

  success: false,
  message: null,
  status: "idle",
};

/* =========================================================
   SLICE
========================================================= */

const serviceSlice = createSlice({
  name: "service",
  initialState,

  reducers: {
    clearServiceError: (state) => {
      state.error = null;
      state.detailsError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },

    clearSelectedService: (state) => {
      state.selectedService = null;
    },

    clearServiceSuccess: (state) => {
      state.success = false;
      state.message = null;
    },

    resetServiceState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       GET SERVICES
    ===================================================== */
    builder
      .addCase(getServices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.services = getItemsFromResponse(action.payload);
      })
      .addCase(getServices.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Failed to fetch services";
      });

    /* =====================================================
       GET SERVICE BY ID
    ===================================================== */
    builder
      .addCase(getServiceById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.selectedService = null;
      })
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedService = getServiceFromResponse(action.payload);
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload || "Failed to fetch service details";
      });

    /* =====================================================
       CREATE SERVICE
    ===================================================== */
    builder
      .addCase(createService.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.success = false;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.message =
          action.payload?.message || "Service created successfully";

        const newService = getServiceFromResponse(action.payload);
        if (newService) {
          state.services.unshift(newService);
        }
      })
      .addCase(createService.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create service";
        state.success = false;
      });

    /* =====================================================
       UPDATE SERVICE
    ===================================================== */
    builder
      .addCase(updateService.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.success = false;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.message =
          action.payload?.data?.message || "Service updated successfully";

        const updatedService = getServiceFromResponse(action.payload?.data);
        const updatedId =
          action.payload?.serviceId ||
          updatedService?._id ||
          updatedService?.id;

        if (updatedId) {
          const index = state.services.findIndex(
            (s) => s?._id === updatedId || s?.id === updatedId,
          );

          if (index !== -1 && updatedService) {
            state.services[index] = updatedService;
          }
        }

        if (
          state.selectedService?._id === updatedId ||
          state.selectedService?.id === updatedId
        ) {
          state.selectedService = updatedService || state.selectedService;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update service";
        state.success = false;
      });

    /* =====================================================
       DELETE SERVICE
    ===================================================== */
    builder
      .addCase(deleteService.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.success = false;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.message =
          action.payload?.response?.message || "Service deleted successfully";

        const serviceId = action.payload?.serviceId;

        state.services = state.services.filter(
          (s) => s?._id !== serviceId && s?.id !== serviceId,
        );

        if (
          state.selectedService?._id === serviceId ||
          state.selectedService?.id === serviceId
        ) {
          state.selectedService = null;
        }
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete service";
        state.success = false;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearServiceError,
  clearSelectedService,
  clearServiceSuccess,
  resetServiceState,
} = serviceSlice.actions;

const EMPTY_SERVICES = [];
export const selectServices = (state) => state.service?.services || EMPTY_SERVICES;

export const selectSelectedService = (state) =>
  state.service?.selectedService || null;

export const selectServicesLoading = (state) =>
  state.service?.loading || false;

export const selectServiceDetailsLoading = (state) =>
  state.service?.detailsLoading || false;

export const selectServiceCreateLoading = (state) =>
  state.service?.createLoading || false;

export const selectServiceUpdateLoading = (state) =>
  state.service?.updateLoading || false;

export const selectServiceDeleteLoading = (state) =>
  state.service?.deleteLoading || false;

export const selectServiceError = (state) => state.service?.error || null;

export const selectServicesError = (state) => state.service?.error || null;

export const selectServiceDetailsError = (state) =>
  state.service?.detailsError || null;

export const selectServiceCreateError = (state) =>
  state.service?.createError || null;

export const selectServiceUpdateError = (state) =>
  state.service?.updateError || null;

export const selectServiceDeleteError = (state) =>
  state.service?.deleteError || null;

export const selectServiceSuccess = (state) =>
  state.service?.success || false;

export const selectServiceMessage = (state) =>
  state.service?.message || null;

export default serviceSlice.reducer;
