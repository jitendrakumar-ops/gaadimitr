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

const getItemsFromResponse = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.ratings)) return data.ratings;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.ratings)) return response.ratings;

  return [];
};

/* =========================================================
   GET ALL RATINGS
   GET /ratings
========================================================= */

export const getAllRatings = createAsyncThunk(
  "rating/getAllRatings",
  async (
    { page = 1, limit = 10, search = "", rating, driverId, fromUserId } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, limit };

      if (search?.trim()) {
        params.search = search.trim();
      }

      if (rating && rating !== "all") {
        params.rating = Number(rating);
      }

      if (driverId) {
        params.driverId = driverId;
      }

      if (fromUserId) {
        params.fromUserId = fromUserId;
      }

      const response = await adminApi.get("/ratings", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch ratings"),
      );
    }
  },
);

/* =========================================================
   GET DRIVER RATINGS
   GET /ratings/driver/:driverId
========================================================= */

export const getDriverRatings = createAsyncThunk(
  "rating/getDriverRatings",
  async ({ driverId, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      if (!driverId) return rejectWithValue("Driver ID is required");

      const response = await adminApi.get(`/ratings/driver/${driverId}`, {
        params: { page, limit },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch driver ratings"),
      );
    }
  },
);

/* =========================================================
   RATE DRIVER
   POST /ratings
========================================================= */

export const rateDriver = createAsyncThunk(
  "rating/rateDriver",
  async ({ bookingId, rating, review }, { rejectWithValue }) => {
    try {
      if (!bookingId) return rejectWithValue("Booking ID is required");
      if (!rating) return rejectWithValue("Rating is required");

      const response = await adminApi.post("/ratings", {
        bookingId,
        rating: Number(rating),
        review: review?.trim() || "",
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to submit rating"),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  ratings: [],
  selectedRating: null,

  totalRatings: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,

  loading: false,
  driverRatingsLoading: false,
  rateLoading: false,

  error: null,
  driverRatingsError: null,
  rateError: null,

  success: false,
  message: null,
  status: "idle",
};

/* =========================================================
   SLICE
========================================================= */

const ratingSlice = createSlice({
  name: "rating",
  initialState,

  reducers: {
    clearRatingError: (state) => {
      state.error = null;
      state.driverRatingsError = null;
      state.rateError = null;
    },

    clearSelectedRating: (state) => {
      state.selectedRating = null;
    },

    clearRatingSuccess: (state) => {
      state.success = false;
      state.message = null;
    },

    resetRatingState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       GET ALL RATINGS
    ===================================================== */
    builder
      .addCase(getAllRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(getAllRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";

        const response = action.payload;
        const data = response?.data;

        if (Array.isArray(data?.items)) {
          state.ratings = data.items;
        } else if (Array.isArray(data?.ratings)) {
          state.ratings = data.ratings;
        } else if (Array.isArray(data)) {
          state.ratings = data;
        } else {
          state.ratings = getItemsFromResponse(response);
        }

        const pagination = data?.pagination || response?.pagination || {};

        state.totalRatings =
          pagination.total ?? data?.total ?? state.ratings.length;
        state.currentPage = pagination.page ?? data?.page ?? 1;
        state.limit = pagination.limit ?? data?.limit ?? 10;
        state.totalPages =
          pagination.totalPages ??
          pagination.total_pages ??
          Math.max(1, Math.ceil(state.totalRatings / state.limit));
        state.hasNextPage = pagination.hasNextPage ?? false;
        state.hasPrevPage = pagination.hasPrevPage ?? false;
      })
      .addCase(getAllRatings.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Failed to fetch ratings";
      });

    /* =====================================================
       GET DRIVER RATINGS
    ===================================================== */
    builder
      .addCase(getDriverRatings.pending, (state) => {
        state.driverRatingsLoading = true;
        state.driverRatingsError = null;
      })
      .addCase(getDriverRatings.fulfilled, (state) => {
        state.driverRatingsLoading = false;
      })
      .addCase(getDriverRatings.rejected, (state, action) => {
        state.driverRatingsLoading = false;
        state.driverRatingsError =
          action.payload || "Failed to fetch driver ratings";
      });

    /* =====================================================
       RATE DRIVER
    ===================================================== */
    builder
      .addCase(rateDriver.pending, (state) => {
        state.rateLoading = true;
        state.rateError = null;
        state.success = false;
      })
      .addCase(rateDriver.fulfilled, (state, action) => {
        state.rateLoading = false;
        state.success = true;
        state.message =
          action.payload?.message || "Rating submitted successfully";
      })
      .addCase(rateDriver.rejected, (state, action) => {
        state.rateLoading = false;
        state.rateError = action.payload || "Failed to submit rating";
        state.success = false;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearRatingError,
  clearSelectedRating,
  clearRatingSuccess,
  resetRatingState,
} = ratingSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectRatings = (state) => state.rating?.ratings || [];

export const selectSelectedRating = (state) =>
  state.rating?.selectedRating || null;

export const selectRatingsLoading = (state) =>
  state.rating?.loading || false;

export const selectRatingsTotal = (state) =>
  state.rating?.totalRatings || 0;

export const selectRatingsError = (state) => state.rating?.error || null;

export const selectRatingsPagination = createSelector(
  [
    (state) => state.rating?.totalRatings || 0,
    (state) => state.rating?.currentPage || 1,
    (state) => state.rating?.totalPages || 1,
    (state) => state.rating?.limit || 10,
    (state) => state.rating?.hasNextPage || false,
    (state) => state.rating?.hasPrevPage || false,
  ],
  (totalRatings, currentPage, totalPages, limit, hasNextPage, hasPrevPage) => ({
    totalRatings,
    currentPage,
    totalPages,
    limit,
    hasNextPage,
    hasPrevPage,
  }),
);

export const selectRateLoading = (state) =>
  state.rating?.rateLoading || false;

export const selectRateSuccess = (state) =>
  state.rating?.success || false;

export const selectRateMessage = (state) =>
  state.rating?.message || null;

export default ratingSlice.reducer;
