import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminApi from "../api";

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getDataFromResponse = (response) => {
  const data = response?.data ?? response;
  if (data?.data !== undefined) return data.data;
  return data;
};

/* =========================================================
   ASYNC THUNKS
========================================================= */

/**
 * GET /settings
 * Get full app settings including user/driver promotion banners
 */
export const getSettings = createAsyncThunk(
  "setting/getSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/settings");
      return getDataFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load app settings"),
      );
    }
  },
);

/**
 * PATCH /settings
 * Update settings with FormData (images) or JSON
 */
export const updateSettings = createAsyncThunk(
  "setting/updateSettings",
  async (formDataOrPayload, { rejectWithValue }) => {
    try {
      const isFormData = formDataOrPayload instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const response = await adminApi.patch("/settings", formDataOrPayload, {
        headers,
      });

      return {
        data: getDataFromResponse(response),
        message:
          response?.data?.message || "Settings updated successfully",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update settings"),
      );
    }
  },
);

/**
 * GET /settings/promotions/user
 * Get user promotion banner
 */
export const getUserPromotion = createAsyncThunk(
  "setting/getUserPromotion",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/settings/promotions/user");
      return getDataFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch user promotion"),
      );
    }
  },
);

/**
 * GET /settings/promotions/driver
 * Get driver promotion banner
 */
export const getDriverPromotion = createAsyncThunk(
  "setting/getDriverPromotion",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get("/settings/promotions/driver");
      return getDataFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch driver promotion"),
      );
    }
  },
);

/**
 * DELETE /settings/promotions/:target
 * Target: 'user' | 'driver'
 */
export const removePromotionImage = createAsyncThunk(
  "setting/removePromotionImage",
  async (target, { rejectWithValue }) => {
    try {
      const response = await adminApi.delete(`/settings/promotions/${target}`);
      return {
        target,
        data: getDataFromResponse(response),
        message:
          response?.data?.message ||
          `${target === "user" ? "User" : "Driver"} promotion removed successfully`,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, `Failed to remove ${target} promotion`),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  settings: null,
  userPromotion: null,
  driverPromotion: null,

  loading: false,
  error: null,
  success: false,
  message: null,

  updateLoading: false,
  updateSuccess: false,
  updateError: null,

  deleteLoading: false,
  deleteSuccess: false,
  deleteError: null,
};

/* =========================================================
   SLICE
========================================================= */

const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    clearSettingError: (state) => {
      state.error = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearSettingSuccess: (state) => {
      state.success = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.message = null;
    },
    resetSettingState: () => initialState,
  },
  extraReducers: (builder) => {
    // -------------------------------------------------------
    // getSettings
    // -------------------------------------------------------
    builder
      .addCase(getSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // -------------------------------------------------------
    // updateSettings
    // -------------------------------------------------------
    builder
      .addCase(updateSettings.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.updateError = null;
        state.settings = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      });

    // -------------------------------------------------------
    // getUserPromotion
    // -------------------------------------------------------
    builder
      .addCase(getUserPromotion.fulfilled, (state, action) => {
        state.userPromotion = action.payload;
      });

    // -------------------------------------------------------
    // getDriverPromotion
    // -------------------------------------------------------
    builder
      .addCase(getDriverPromotion.fulfilled, (state, action) => {
        state.driverPromotion = action.payload;
      });

    // -------------------------------------------------------
    // removePromotionImage
    // -------------------------------------------------------
    builder
      .addCase(removePromotionImage.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(removePromotionImage.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        state.deleteError = null;
        state.settings = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(removePromotionImage.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteSuccess = false;
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const {
  clearSettingError,
  clearSettingSuccess,
  resetSettingState,
} = settingSlice.actions;

export const selectSettings = (state) => state.setting?.settings;
export const selectSettingsLoading = (state) => state.setting?.loading;
export const selectSettingsError = (state) => state.setting?.error;
export const selectSettingUpdateLoading = (state) => state.setting?.updateLoading;
export const selectSettingUpdateSuccess = (state) => state.setting?.updateSuccess;
export const selectSettingDeleteLoading = (state) => state.setting?.deleteLoading;
export const selectSettingDeleteSuccess = (state) => state.setting?.deleteSuccess;
export const selectSettingMessage = (state) => state.setting?.message;

export default settingSlice.reducer;
