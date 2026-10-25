import { apiClient } from './api';

export interface LocationPoint {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  title: string;
}

export interface CreateBookingPayload {
  driverId: string;
  pickupLocation: LocationPoint;
  dropLocation: LocationPoint;
  fare: number;
}

export interface BookingApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const bookingService = {
  createBooking: async (payload: CreateBookingPayload): Promise<any> => {
    const response = await apiClient.post<BookingApiResponse>('/bookings/', payload);
    return (response as any)?.data || response;
  },
  getActiveBooking: async (): Promise<any> => {
    const response = await apiClient.get<BookingApiResponse>('/bookings/active');
    return (response as any)?.data !== undefined ? (response as any).data : response;
  },
  getBookings: async ({ page = 1, limit = 10, status }: GetBookingsParams = {}): Promise<any> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status && status !== 'all') params.append('status', status);
    const response = await apiClient.get<BookingApiResponse>(`/bookings/?${params.toString()}`);
    return (response as any)?.data !== undefined ? (response as any).data : response;
  },
  /**
   * Get single booking detail via GET /bookings/:bookingId
   */
  getBookingById: async (bookingId: string): Promise<any> => {
    const response = await apiClient.get<BookingApiResponse>(`/bookings/${bookingId}`);
    return (response as any)?.data !== undefined ? (response as any).data : response;
  },

  /**
   * Cancel booking via POST /bookings/:bookingId/cancel
   */
  cancelBooking: async (bookingId: string, reason: string): Promise<any> => {
    try {
      const response = await apiClient.post<BookingApiResponse>(`/bookings/${bookingId}/cancel`, { reason });
      return (response as any)?.data || response;
    } catch (err: any) {
      const response = await apiClient.post<BookingApiResponse>(`/${bookingId}/cancel`, { reason });
      return (response as any)?.data || response;
    }
  },

  /**
   * Process booking token payment via POST /bookings/:bookingId/payment
   */
  payBooking: async (
    bookingId: string,
    payload?: { paymentMethod?: string; amount?: number; transactionId?: string; [key: string]: any }
  ): Promise<any> => {
    const response = await apiClient.post<BookingApiResponse>(`/bookings/${bookingId}/payment`, payload || {});
    return (response as any)?.data !== undefined ? (response as any).data : response;
  },
};
