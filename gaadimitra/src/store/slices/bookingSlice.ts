import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookingService, CreateBookingPayload, GetBookingsParams } from '../../services/bookingService';
import { BookedRide, RideStatus, ridesService } from '../../services/rides';

export interface BookingState {
  currentBooking: any | null;
  activeBooking: any | null;
  selectedBooking: any | null;
  activeRide: BookedRide | null;
  bookingsList: any[];
  bookingsMeta: { page: number; limit: number; total: number; hasMore: boolean };
  isLoading: boolean;
  isLoadingBookings: boolean;
  isLoadingBookingDetail: boolean;
  error: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  activeBooking: null,
  selectedBooking: null,
  activeRide: ridesService.getActiveRide() || null,
  bookingsList: [],
  bookingsMeta: { page: 1, limit: 10, total: 0, hasMore: false },
  isLoading: false,
  isLoadingBookings: false,
  isLoadingBookingDetail: false,
  error: null,
};

/**
 * Async Thunk: Create booking via POST /bookings/
 */
export const createBooking = createAsyncThunk<
  any,
  CreateBookingPayload,
  { rejectValue: string }
>('bookings/createBooking', async (payload, { rejectWithValue }) => {
  try {
    const data = await bookingService.createBooking(payload);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create booking');
  }
});

/**
 * Async Thunk: Fetch active booking via GET /bookings/active
 */
export const fetchActiveBooking = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>('bookings/fetchActiveBooking', async (_, { rejectWithValue }) => {
  try {
    const data = await bookingService.getActiveBooking();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch active booking');
  }
});

/**
 * Async Thunk: Fetch bookings list via GET /bookings/?page=&limit=&status=
 */
export const fetchBookings = createAsyncThunk<
  any,
  GetBookingsParams & { reset?: boolean },
  { rejectValue: string }
>('bookings/fetchBookings', async (params, { rejectWithValue }) => {
  try {
    const data = await bookingService.getBookings(params);
    return { data, reset: params.reset ?? true };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch bookings');
  }
});

/**
 * Async Thunk: Fetch single booking detail via GET /bookings/:bookingId
 */
export const fetchBookingById = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>('bookings/fetchBookingById', async (bookingId, { rejectWithValue }) => {
  try {
    const data = await bookingService.getBookingById(bookingId);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch booking details');
  }
});

/**
 * Async Thunk: Cancel booking via POST /bookings/:bookingId/cancel
 */
export const cancelBooking = createAsyncThunk<
  any,
  { bookingId: string; reason: string },
  { rejectValue: string }
>('bookings/cancelBooking', async ({ bookingId, reason }, { rejectWithValue }) => {
  try {
    const data = await bookingService.cancelBooking(bookingId, reason);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to cancel booking');
  }
});

/**
 * Async Thunk: Pay booking token via POST /bookings/:bookingId/payment
 */
export const payBookingToken = createAsyncThunk<
  any,
  { bookingId: string; paymentMethod?: string; amount?: number; transactionId?: string; [key: string]: any },
  { rejectValue: string }
>('bookings/payBookingToken', async ({ bookingId, ...payload }, { rejectWithValue }) => {
  try {
    const data = await bookingService.payBooking(bookingId, payload);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to process booking payment');
  }
});

export const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setActiveBooking: (state, action: PayloadAction<any>) => {
      state.activeBooking = action.payload;
    },
    setSelectedBooking: (state, action: PayloadAction<any>) => {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    setActiveRide: (state, action: PayloadAction<BookedRide | null>) => {
      state.activeRide = action.payload;
    },
    updateActiveRideStatus: (state, action: PayloadAction<{ bookingId?: string; status: RideStatus }>) => {
      if (state.activeRide && (!action.payload.bookingId || state.activeRide.bookingId === action.payload.bookingId)) {
        state.activeRide.status = action.payload.status;
        if (action.payload.status === 'completed' || action.payload.status === 'cancelled') {
          state.activeRide = null;
        }
      }
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    resetBookingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(createBooking.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.currentBooking = action.payload;
      state.error = null;
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to create booking';
    });
    builder.addCase(fetchActiveBooking.fulfilled, (state, action: PayloadAction<any>) => {
      state.activeBooking = action.payload;
    });
    builder.addCase(fetchActiveBooking.rejected, (state) => {
      state.activeBooking = null;
    });
    // fetchBookings
    builder.addCase(fetchBookings.pending, (state) => {
      state.isLoadingBookings = true;
      state.error = null;
    });
    builder.addCase(fetchBookings.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoadingBookings = false;
      const { data, reset } = action.payload;
      // API shape: { data: { items: [], pagination: { total, page, limit, hasNextPage } } }
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.bookings)
        ? data.bookings
        : [];
      const pagination = data?.pagination ?? {};
      const total: number = pagination.total ?? data?.total ?? list.length;
      const page: number = pagination.page ?? data?.page ?? 1;
      const limit: number = pagination.limit ?? data?.limit ?? 10;
      const hasMore: boolean = pagination.hasNextPage ?? (list.length > 0 && list.length < total);
      state.bookingsList = reset ? list : [...state.bookingsList, ...list];
      state.bookingsMeta = { page, limit, total, hasMore };
    });
    builder.addCase(fetchBookings.rejected, (state, action) => {
      state.isLoadingBookings = false;
      state.error = action.payload || 'Failed to fetch bookings';
    });
    // fetchBookingById
    builder.addCase(fetchBookingById.pending, (state) => {
      state.isLoadingBookingDetail = true;
      state.error = null;
    });
    builder.addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoadingBookingDetail = false;
      const data = action.payload;
      state.selectedBooking = data?.booking ?? data?.data ?? data;
    });
    builder.addCase(fetchBookingById.rejected, (state, action) => {
      state.isLoadingBookingDetail = false;
      state.error = action.payload || 'Failed to fetch booking details';
    });
    // cancelBooking
    builder.addCase(cancelBooking.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cancelBooking.fulfilled, (state) => {
      state.isLoading = false;
      state.activeBooking = null;
      state.activeRide = null;
      if (state.selectedBooking) {
        state.selectedBooking.status = 'cancelled';
      }
    });
    builder.addCase(cancelBooking.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to cancel booking';
    });
    // payBookingToken
    builder.addCase(payBookingToken.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(payBookingToken.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const data = action.payload?.booking || action.payload?.data || action.payload;
      if (data) {
        state.currentBooking = data;
        state.activeBooking = data;
      }
    });
    builder.addCase(payBookingToken.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to process booking payment';
    });
  },
});

export const {
  setActiveBooking,
  setSelectedBooking,
  clearSelectedBooking,
  setActiveRide,
  updateActiveRideStatus,
  clearBookingError,
  resetBookingState,
} = bookingSlice.actions;
export default bookingSlice.reducer;
