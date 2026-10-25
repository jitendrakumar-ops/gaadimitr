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

const getBookingFromResponse = (response) => {
  const data = response?.data ?? response;
  return data?.booking || data?.item || data?.data || data || null;
};

const getItemsFromResponse = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.bookings)) return response.bookings;

  return [];
};

/* =========================================================
   GET ALL BOOKINGS / RIDES
   GET /bookings
========================================================= */

export const getBookings = createAsyncThunk(
  "booking/getBookings",
  async (
    { page = 1, limit = 10, search = "", status, userId, driverId } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, limit };

      if (search?.trim()) params.search = search.trim();
      if (status && status !== "all") params.status = status;
      if (userId) params.userId = userId;
      if (driverId) params.driverId = driverId;

      const response = await adminApi.get("/bookings", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch bookings"),
      );
    }
  },
);

/* =========================================================
   GET BOOKING BY ID
   GET /bookings/:bookingId
========================================================= */

export const getBookingById = createAsyncThunk(
  "booking/getBookingById",
  async (bookingId, { rejectWithValue }) => {
    try {
      if (!bookingId) return rejectWithValue("Booking ID is required");

      const response = await adminApi.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch booking details"),
      );
    }
  },
);

/* =========================================================
   CANCEL BOOKING
   POST /bookings/:bookingId/cancel
========================================================= */

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      if (!bookingId) return rejectWithValue("Booking ID is required");

      const response = await adminApi.post(`/bookings/${bookingId}/cancel`, {
        reason: reason?.trim() || "Cancelled by admin",
      });

      return {
        bookingId,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to cancel booking"),
      );
    }
  },
);

/* =========================================================
   CREATE BOOKING
   POST /bookings
========================================================= */

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await adminApi.post("/bookings", bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create booking"),
      );
    }
  },
);

/* =========================================================
   ACCEPT BOOKING
   POST /bookings/:bookingId/accept
========================================================= */

export const acceptBooking = createAsyncThunk(
  "booking/acceptBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      if (!bookingId) return rejectWithValue("Booking ID is required");

      const response = await adminApi.post(`/bookings/${bookingId}/accept`);
      return { bookingId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to accept booking"),
      );
    }
  },
);

/* =========================================================
   REJECT BOOKING
   POST /bookings/:bookingId/reject
========================================================= */

export const rejectBooking = createAsyncThunk(
  "booking/rejectBooking",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      if (!bookingId) return rejectWithValue("Booking ID is required");

      const response = await adminApi.post(`/bookings/${bookingId}/reject`, {
        reason,
      });
      return { bookingId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to reject booking"),
      );
    }
  },
);

/* =========================================================
   START TRIP
   POST /bookings/:bookingId/start
========================================================= */

export const startTrip = createAsyncThunk(
  "booking/startTrip",
  async (bookingId, { rejectWithValue }) => {
    try {
      if (!bookingId) return rejectWithValue("Booking ID is required");

      const response = await adminApi.post(`/bookings/${bookingId}/start`);
      return { bookingId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to start trip"),
      );
    }
  },
);

/* =========================================================
   COMPLETE TRIP
   POST /bookings/:bookingId/complete
========================================================= */

export const completeTrip = createAsyncThunk(
  "booking/completeTrip",
  async (bookingId, { rejectWithValue }) => {
    try {
      if (!bookingId) return rejectWithValue("Booking ID is required");

      const response = await adminApi.post(`/bookings/${bookingId}/complete`);
      return { bookingId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to complete trip"),
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  bookings: [],
  selectedBooking: null,

  totalBookings: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,

  loading: false,
  detailsLoading: false,
  cancelLoading: false,
  actionLoading: false,

  error: null,
  detailsError: null,
  cancelError: null,
  actionError: null,

  success: false,
  message: null,
  status: "idle",
};

/* =========================================================
   SLICE
========================================================= */

const bookingSlice = createSlice({
  name: "booking",
  initialState,

  reducers: {
    clearBookingError: (state) => {
      state.error = null;
      state.detailsError = null;
      state.cancelError = null;
      state.actionError = null;
    },

    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },

    clearBookingSuccess: (state) => {
      state.success = false;
      state.message = null;
    },

    resetBookingState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       GET ALL BOOKINGS
    ===================================================== */

    builder
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";

        const response = action.payload;
        const data = response?.data;

        if (Array.isArray(data?.items)) {
          state.bookings = data.items;
        } else if (Array.isArray(data?.bookings)) {
          state.bookings = data.bookings;
        } else if (Array.isArray(data)) {
          state.bookings = data;
        } else {
          state.bookings = getItemsFromResponse(response);
        }

        const pagination = data?.pagination || response?.pagination || {};

        state.totalBookings =
          pagination.total ?? data?.total ?? state.bookings.length;
        state.currentPage = pagination.page ?? data?.page ?? 1;
        state.limit = pagination.limit ?? data?.limit ?? 10;
        state.totalPages =
          pagination.totalPages ??
          pagination.total_pages ??
          Math.max(1, Math.ceil(state.totalBookings / state.limit));
        state.hasNextPage = pagination.hasNextPage ?? false;
        state.hasPrevPage = pagination.hasPrevPage ?? false;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Failed to fetch bookings";
      });

    /* =====================================================
       GET BOOKING BY ID
    ===================================================== */

    builder
      .addCase(getBookingById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.selectedBooking = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedBooking = getBookingFromResponse(action.payload);
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || "Failed to fetch booking details";
      });

    /* =====================================================
       CANCEL BOOKING
    ===================================================== */

    builder
      .addCase(cancelBooking.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
        state.success = false;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.success = true;
        state.message =
          action.payload?.data?.message || "Booking cancelled successfully";

        const cancelledId = action.payload?.bookingId;
        const updatedBooking = getBookingFromResponse(action.payload?.data);

        const index = state.bookings.findIndex(
          (b) => b?._id === cancelledId || b?.id === cancelledId,
        );

        if (index !== -1) {
          if (updatedBooking) {
            state.bookings[index] = updatedBooking;
          } else {
            state.bookings[index].status = "cancelled";
          }
        }

        if (
          state.selectedBooking?._id === cancelledId ||
          state.selectedBooking?.id === cancelledId
        ) {
          if (updatedBooking) {
            state.selectedBooking = updatedBooking;
          } else {
            state.selectedBooking.status = "cancelled";
          }
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload || "Failed to cancel booking";
        state.success = false;
      });

    /* =====================================================
       ACCEPT BOOKING
    ===================================================== */

    builder
      .addCase(acceptBooking.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.success = false;
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.message =
          action.payload?.data?.message || "Booking accepted successfully";

        const bookingId = action.payload?.bookingId;
        const updated = getBookingFromResponse(action.payload?.data);

        const index = state.bookings.findIndex(
          (b) => b?._id === bookingId || b?.id === bookingId,
        );

        if (index !== -1 && updated) {
          state.bookings[index] = updated;
        }

        if (
          state.selectedBooking?._id === bookingId ||
          state.selectedBooking?.id === bookingId
        ) {
          state.selectedBooking = updated || state.selectedBooking;
        }
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to accept booking";
        state.success = false;
      });

    /* =====================================================
       REJECT BOOKING
    ===================================================== */

    builder
      .addCase(rejectBooking.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.success = false;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.message =
          action.payload?.data?.message || "Booking rejected";

        const bookingId = action.payload?.bookingId;
        const updated = getBookingFromResponse(action.payload?.data);

        const index = state.bookings.findIndex(
          (b) => b?._id === bookingId || b?.id === bookingId,
        );

        if (index !== -1 && updated) {
          state.bookings[index] = updated;
        }

        if (
          state.selectedBooking?._id === bookingId ||
          state.selectedBooking?.id === bookingId
        ) {
          state.selectedBooking = updated || state.selectedBooking;
        }
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to reject booking";
        state.success = false;
      });

    /* =====================================================
       START TRIP
    ===================================================== */

    builder
      .addCase(startTrip.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.success = false;
      })
      .addCase(startTrip.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.message =
          action.payload?.data?.message || "Trip started successfully";

        const bookingId = action.payload?.bookingId;
        const updated = getBookingFromResponse(action.payload?.data);

        const index = state.bookings.findIndex(
          (b) => b?._id === bookingId || b?.id === bookingId,
        );

        if (index !== -1 && updated) {
          state.bookings[index] = updated;
        }

        if (
          state.selectedBooking?._id === bookingId ||
          state.selectedBooking?.id === bookingId
        ) {
          state.selectedBooking = updated || state.selectedBooking;
        }
      })
      .addCase(startTrip.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to start trip";
        state.success = false;
      });

    /* =====================================================
       COMPLETE TRIP
    ===================================================== */

    builder
      .addCase(completeTrip.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.success = false;
      })
      .addCase(completeTrip.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.message =
          action.payload?.data?.message || "Trip completed successfully";

        const bookingId = action.payload?.bookingId;
        const updated = getBookingFromResponse(action.payload?.data);

        const index = state.bookings.findIndex(
          (b) => b?._id === bookingId || b?.id === bookingId,
        );

        if (index !== -1 && updated) {
          state.bookings[index] = updated;
        }

        if (
          state.selectedBooking?._id === bookingId ||
          state.selectedBooking?.id === bookingId
        ) {
          state.selectedBooking = updated || state.selectedBooking;
        }
      })
      .addCase(completeTrip.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Failed to complete trip";
        state.success = false;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearBookingError,
  clearSelectedBooking,
  clearBookingSuccess,
  resetBookingState,
} = bookingSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectBookings = (state) => state.booking?.bookings || [];

export const selectSelectedBooking = (state) =>
  state.booking?.selectedBooking || null;

export const selectBookingLoading = (state) =>
  state.booking?.loading || false;

export const selectBookingDetailsLoading = (state) =>
  state.booking?.detailsLoading || false;

export const selectBookingCancelLoading = (state) =>
  state.booking?.cancelLoading || false;

export const selectBookingActionLoading = (state) =>
  state.booking?.actionLoading || false;

export const selectBookingError = (state) => state.booking?.error || null;

export const selectBookingDetailsError = (state) =>
  state.booking?.detailsError || null;

export const selectBookingCancelError = (state) =>
  state.booking?.cancelError || null;

export const selectBookingActionError = (state) =>
  state.booking?.actionError || null;

export const selectBookingSuccess = (state) =>
  state.booking?.success || false;

export const selectBookingMessage = (state) =>
  state.booking?.message || null;

export const selectBookingPagination = createSelector(
  [
    (state) => state.booking?.totalBookings || 0,
    (state) => state.booking?.currentPage || 1,
    (state) => state.booking?.totalPages || 1,
    (state) => state.booking?.limit || 10,
    (state) => state.booking?.hasNextPage || false,
    (state) => state.booking?.hasPrevPage || false,
  ],
  (totalBookings, currentPage, totalPages, limit, hasNextPage, hasPrevPage) => ({
    totalBookings,
    currentPage,
    totalPages,
    limit,
    hasNextPage,
    hasPrevPage,
  }),
);

export default bookingSlice.reducer;
