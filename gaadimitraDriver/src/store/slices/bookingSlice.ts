import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookingService } from '../../services/bookingService';
import {
  BookingItem,
  BookingsPagination,
  BookingsQueryParams,
  BookingsResponse,
  BookingSummaryData,
  BookingSummaryResponse,
} from '../../types/booking';

interface BookingState {
  bookings: BookingItem[];
  pagination: BookingsPagination | null;
  page: number;
  limit: number;
  status: string | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // Booking Summary State
  summary: BookingSummaryData | null;
  isSummaryLoading: boolean;
  isSummaryRefreshing: boolean;
  summaryError: string | null;
  summaryRange: 'today' | 'week' | 'month';

  // Active Booking State
  activeBooking: BookingItem | null;
  isActiveBookingLoading: boolean;
  activeBookingError: string | null;

  // Single Current Booking Details State (GET /bookings/:bookingId)
  currentBooking: BookingItem | null;
  isCurrentBookingLoading: boolean;
  currentBookingError: string | null;
}

const initialState: BookingState = {
  bookings: [],
  pagination: null,
  page: 1,
  limit: 10,
  status: undefined,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,

  // Booking Summary Initial State
  summary: null,
  isSummaryLoading: false,
  isSummaryRefreshing: false,
  summaryError: null,
  summaryRange: 'today',

  // Active Booking Initial State
  activeBooking: null,
  isActiveBookingLoading: false,
  activeBookingError: null,

  // Single Current Booking Details Initial State
  currentBooking: null,
  isCurrentBookingLoading: false,
  currentBookingError: null,
};

/**
 * Fetch bookings with pagination and status query
 * GET /bookings?page=X&limit=Y&status=Z
 */
export const fetchBookings = createAsyncThunk<
  BookingsResponse,
  BookingsQueryParams | undefined,
  { rejectValue: string }
>('booking/fetchBookings', async (params, { rejectWithValue }) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const status = params?.status;

    const response = await bookingService.getBookings({ page, limit, status });
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch bookings.';
    return rejectWithValue(message);
  }
});

/**
 * Refresh bookings (always fetches page 1 without clearing list before finish)
 */
export const refreshBookings = createAsyncThunk<
  BookingsResponse,
  { limit?: number; status?: string } | undefined,
  { rejectValue: string }
>('booking/refreshBookings', async (params, { rejectWithValue }) => {
  try {
    const limit = params?.limit ?? 10;
    const status = params?.status;

    const response = await bookingService.getBookings({ page: 1, limit, status });
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to refresh bookings.';
    return rejectWithValue(message);
  }
});

/**
 * Fetch booking summary (totals & completed rides)
 * GET /bookings/summary?range=today|week|month
 */
export const fetchBookingSummary = createAsyncThunk<
  BookingSummaryResponse,
  { range?: 'today' | 'week' | 'month'; isRefresh?: boolean } | 'today' | 'week' | 'month' | undefined,
  { rejectValue: string }
>('booking/fetchBookingSummary', async (arg, { rejectWithValue }) => {
  try {
    const range = typeof arg === 'string' ? arg : (arg?.range || 'today');
    const response = await bookingService.getBookingSummary(range);
    return response;
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch booking summary.';
    return rejectWithValue(message);
  }
});

/**
 * Fetch active booking for current driver
 * GET /bookings/driver/active
 */
export const fetchActiveBooking = createAsyncThunk<
  BookingItem | null,
  void,
  { rejectValue: string }
>('booking/fetchActiveBooking', async (_, { rejectWithValue }) => {
  try {
    const response = await bookingService.getActiveBooking();
    if (!response) return null;
    const data: any = response.data;
    if (!data) return null;
    if (data.booking) {
      return data.booking;
    }
    return data;
  } catch (err: any) {
    // 404 or "No active ride found" is expected when driver has no ongoing ride
    if (err?.status === 404 || err?.code === 'BOOKING_NOT_FOUND') {
      return null;
    }
    const message = err?.message || 'Failed to fetch active booking.';
    return rejectWithValue(message);
  }
});

/**
 * Fetch single booking details by booking ID
 * GET /bookings/:bookingId
 */
export const fetchBookingById = createAsyncThunk<
  BookingItem | null,
  string,
  { rejectValue: string }
>('booking/fetchBookingById', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await bookingService.getBookingById(bookingId);
    if (!response || !response.data) return null;
    return response.data;
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch booking details.';
    return rejectWithValue(message);
  }
});

// Aliases for compatibility
export const getBookingById = fetchBookingById;
export const fetchbookingbyid = fetchBookingById;

/**
 * Accept a booking
 * POST /bookings/:bookingId/accept
 */
export const acceptBookingAction = createAsyncThunk<
  BookingItem,
  string,
  { rejectValue: string }
>('booking/acceptBooking', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await bookingService.acceptBooking(bookingId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to accept booking');
  }
});

/**
 * Reject a booking
 * POST /bookings/:bookingId/reject
 */
export const rejectBookingAction = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('booking/rejectBooking', async (bookingId, { rejectWithValue }) => {
  try {
    await bookingService.rejectBooking(bookingId);
    return bookingId;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to reject booking');
  }
});

/**
 * Mark arriving at pickup
 * POST /bookings/:bookingId/arriving
 */
export const driverArrivingAction = createAsyncThunk<
  BookingItem,
  string,
  { rejectValue: string }
>('booking/driverArriving', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await bookingService.driverArriving(bookingId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to update arriving status');
  }
});

/**
 * Mark arrived at pickup
 * POST /bookings/:bookingId/arrived
 */
export const driverArrivedAction = createAsyncThunk<
  BookingItem,
  string,
  { rejectValue: string }
>('booking/driverArrived', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await bookingService.driverArrived(bookingId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to update arrived status');
  }
});

/**
 * Start the trip
 * POST /bookings/:bookingId/start
 */
export const startTripAction = createAsyncThunk<
  BookingItem,
  { bookingId: string; otp?: string },
  { rejectValue: string }
>('booking/startTrip', async ({ bookingId, otp }, { rejectWithValue }) => {
  try {
    const response = await bookingService.startTrip(bookingId, otp);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to start trip');
  }
});

/**
 * Complete the trip
 * POST /bookings/:bookingId/complete
 */
export const completeTripAction = createAsyncThunk<
  BookingItem,
  string,
  { rejectValue: string }
>('booking/completeTrip', async (bookingId, { rejectWithValue }) => {
  try {
    const response = await bookingService.completeTrip(bookingId);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to complete trip');
  }
});

/**
 * Cancel a booking
 * POST /bookings/:bookingId/cancel
 */
export const cancelBookingAction = createAsyncThunk<
  BookingItem,
  { bookingId: string; reason?: string },
  { rejectValue: string }
>('booking/cancelBooking', async ({ bookingId, reason }, { rejectWithValue }) => {
  try {
    const response = await bookingService.cancelBooking(bookingId, reason);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to cancel booking');
  }
});

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<string | undefined>) => {
      state.status = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    setSummaryRange: (state, action: PayloadAction<'today' | 'week' | 'month'>) => {
      state.summaryRange = action.payload;
    },
    clearSummaryError: (state) => {
      state.summaryError = null;
    },
    clearActiveBooking: (state) => {
      state.activeBooking = null;
      state.activeBookingError = null;
    },
    setCurrentBooking: (state, action: PayloadAction<BookingItem | null>) => {
      state.currentBooking = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.currentBookingError = null;
      state.isCurrentBookingLoading = false;
    },
    updateCurrentBookingStatus: (state, action: PayloadAction<string>) => {
      if (state.currentBooking) {
        state.currentBooking.status = action.payload as any;
      }
      if (state.activeBooking) {
        state.activeBooking.status = action.payload as any;
      }
    },
    resetBookingState: (state) => {
      state.bookings = [];
      state.pagination = null;
      state.page = 1;
      state.status = undefined;
      state.isLoading = false;
      state.isRefreshing = false;
      state.isLoadingMore = false;
      state.error = null;
      state.summary = null;
      state.isSummaryLoading = false;
      state.isSummaryRefreshing = false;
      state.summaryError = null;
      state.summaryRange = 'today';
      state.activeBooking = null;
      state.isActiveBookingLoading = false;
      state.activeBookingError = null;
      state.currentBooking = null;
      state.isCurrentBookingLoading = false;
      state.currentBookingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBookings
      .addCase(fetchBookings.pending, (state, action) => {
        const page = action.meta.arg?.page ?? 1;
        if (page > 1) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        const page = action.meta.arg?.page ?? 1;
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = null;

        const payload = action.payload?.data;
        const newItems = payload?.items || [];
        state.pagination = payload?.pagination || null;
        state.page = page;

        if (page > 1) {
          // Append while avoiding duplicate IDs
          const existingIds = new Set(state.bookings.map((b) => b._id));
          const uniqueItems = newItems.filter((b) => !existingIds.has(b._id));
          state.bookings = [...state.bookings, ...uniqueItems];
        } else {
          state.bookings = newItems;
        }
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })

      // refreshBookings
      .addCase(refreshBookings.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshBookings.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.error = null;

        const payload = action.payload?.data;
        state.bookings = payload?.items || [];
        state.pagination = payload?.pagination || null;
        state.page = 1;
      })
      .addCase(refreshBookings.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload || 'Failed to refresh bookings';
      })

      // fetchBookingSummary
      .addCase(fetchBookingSummary.pending, (state, action) => {
        const isRefresh = typeof action.meta.arg === 'object' && action.meta.arg?.isRefresh;
        if (isRefresh) {
          state.isSummaryRefreshing = true;
        } else {
          state.isSummaryLoading = true;
        }
        state.summaryError = null;
      })
      .addCase(fetchBookingSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.isSummaryRefreshing = false;
        state.summaryError = null;
        state.summary = action.payload?.data || null;
        const requestedRange = typeof action.meta.arg === 'string'
          ? action.meta.arg
          : action.meta.arg?.range || 'today';
        state.summaryRange = requestedRange;
      })
      .addCase(fetchBookingSummary.rejected, (state, action) => {
        state.isSummaryLoading = false;
        state.isSummaryRefreshing = false;
        state.summaryError = action.payload || 'Failed to fetch booking summary';
      })

      // fetchActiveBooking
      .addCase(fetchActiveBooking.pending, (state) => {
        state.isActiveBookingLoading = true;
        state.activeBookingError = null;
      })
      .addCase(fetchActiveBooking.fulfilled, (state, action) => {
        state.isActiveBookingLoading = false;
        state.activeBooking = action.payload;
        state.activeBookingError = null;
      })
      .addCase(fetchActiveBooking.rejected, (state, action) => {
        state.isActiveBookingLoading = false;
        state.activeBooking = null;
        state.activeBookingError = action.payload || null;
      })

      // fetchBookingById
      .addCase(fetchBookingById.pending, (state, action) => {
        state.isCurrentBookingLoading = true;
        state.currentBookingError = null;
        const requestedId = action.meta.arg;
        if (state.currentBooking && state.currentBooking._id !== requestedId) {
          state.currentBooking = null;
        }
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isCurrentBookingLoading = false;
        state.currentBooking = action.payload;
        state.currentBookingError = null;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isCurrentBookingLoading = false;
        state.currentBookingError = action.payload || 'Failed to fetch booking details';
      })

      // Driver booking actions updates
      .addCase(acceptBookingAction.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        state.activeBooking = action.payload;
      })
      .addCase(rejectBookingAction.fulfilled, (state) => {
        state.currentBooking = null;
      })
      .addCase(driverArrivingAction.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        state.activeBooking = action.payload;
      })
      .addCase(driverArrivedAction.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        state.activeBooking = action.payload;
      })
      .addCase(startTripAction.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        state.activeBooking = action.payload;
      })
      .addCase(completeTripAction.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        state.activeBooking = null;
      })
      .addCase(cancelBookingAction.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        state.activeBooking = null;
      });
  },
});

export const {
  setStatusFilter,
  setPage,
  clearBookingError,
  setSummaryRange,
  clearSummaryError,
  clearActiveBooking,
  setCurrentBooking,
  clearCurrentBooking,
  updateCurrentBookingStatus,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
