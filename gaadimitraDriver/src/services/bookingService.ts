import { apiClient } from './api';
import {
  BookingsQueryParams,
  BookingsResponse,
  BookingItem,
  BookingSummaryResponse,
} from '../types/booking';

export const bookingService = {
  /**
   * Fetch paginated bookings with query parameters: page, limit, status
   * GET /bookings?page=1&limit=10&status=...
   */
  getBookings: async (params?: BookingsQueryParams): Promise<BookingsResponse> => {
    const queryParts: string[] = [];

    if (params?.page !== undefined) {
      queryParts.push(`page=${encodeURIComponent(params.page)}`);
    }
    if (params?.limit !== undefined) {
      queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
    }
    if (params?.status && params.status.trim() !== '') {
      queryParts.push(`status=${encodeURIComponent(params.status.trim())}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const endpoint = `/bookings${queryString}`;

    return await apiClient.get<BookingsResponse>(endpoint);
  },

  /**
   * Get driver booking summary (totals and completed bookings list)
   * GET /bookings/summary?range=today|week|month
   */
  getBookingSummary: async (
    range: 'today' | 'week' | 'month' = 'today'
  ): Promise<BookingSummaryResponse> => {
    return await apiClient.get<BookingSummaryResponse>(
      `/bookings/summary?range=${encodeURIComponent(range)}`
    );
  },

  /**
   * Get single booking by ID
   * GET /bookings/:bookingId
   */
  getBookingById: async (bookingId: string): Promise<{ success: boolean; data: BookingItem }> => {
    return await apiClient.get<{ success: boolean; data: BookingItem }>(`/bookings/${bookingId}`);
  },
  fetchBookingById: async (bookingId: string): Promise<{ success: boolean; data: BookingItem }> => {
    return await apiClient.get<{ success: boolean; data: BookingItem }>(`/bookings/${bookingId}`);
  },
  fetchbookingbyid: async (bookingId: string): Promise<{ success: boolean; data: BookingItem }> => {
    return await apiClient.get<{ success: boolean; data: BookingItem }>(`/bookings/${bookingId}`);
  },

  /**
   * Get currently active booking for the authenticated driver
   * GET /bookings/driver/active
   */
  getActiveBooking: async (): Promise<{ success: boolean; data: BookingItem | null; message?: string }> => {
    return await apiClient.get<{ success: boolean; data: BookingItem | null; message?: string }>(
      '/bookings/driver/active'
    );
  },

  /**
   * Accept a booking request
   * POST /bookings/:bookingId/accept
   */
  acceptBooking: async (bookingId: string): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    return await apiClient.post<{ success: boolean; data: BookingItem; message?: string }>(
      `/bookings/${bookingId}/accept`
    );
  },

  /**
   * Reject a booking request
   * POST /bookings/:bookingId/reject
   */
  rejectBooking: async (bookingId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    return await apiClient.post<{ success: boolean; data?: any; message?: string }>(
      `/bookings/${bookingId}/reject`
    );
  },

  /**
   * Mark driver as arriving
   * POST /bookings/:bookingId/arriving
   */
  driverArriving: async (bookingId: string): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    return await apiClient.post<{ success: boolean; data: BookingItem; message?: string }>(
      `/bookings/${bookingId}/arriving`
    );
  },

  /**
   * Mark driver as arrived at pickup
   * POST /bookings/:bookingId/arrived
   */
  driverArrived: async (bookingId: string): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    return await apiClient.post<{ success: boolean; data: BookingItem; message?: string }>(
      `/bookings/${bookingId}/arrived`
    );
  },

  /**
   * Start the trip
   * POST /bookings/:bookingId/start
   */
  startTrip: async (
    bookingId: string,
    otp?: string
  ): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    return await apiClient.post<{ success: boolean; data: BookingItem; message?: string }>(
      `/bookings/${bookingId}/start`,
      otp ? { otp } : {}
    );
  },

  /**
   * Complete the trip
   * POST /bookings/:bookingId/complete
   */
  completeTrip: async (bookingId: string): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    return await apiClient.post<{ success: boolean; data: BookingItem; message?: string }>(
      `/bookings/${bookingId}/complete`
    );
  },

  /**
   * Cancel booking
   * POST /bookings/:bookingId/cancel
   */
  cancelBooking: async (
    bookingId: string,
    reason?: string
  ): Promise<{ success: boolean; data: BookingItem; message?: string }> => {
    return await apiClient.post<{ success: boolean; data: BookingItem; message?: string }>(
      `/bookings/${bookingId}/cancel`,
      { reason }
    );
  },
};

export default bookingService;
