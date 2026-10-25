export interface BookingLocation {
  type?: string;
  coordinates?: number[];
  address?: string;
  title?: string;
}

export interface BookingUser {
  _id: string;
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface BookingDriver {
  _id: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  rating?: number;
  vehicleId?: any;
}

export interface BookingServiceInfo {
  _id: string;
  title?: string;
  image?: string;
  description?: string;
}

export interface BookingVehicleInfo {
  _id: string;
  title?: string;
  type?: string;
  image?: string;
  fee?: number;
  platformCharge?: number;
  seat?: number;
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'driverArriving'
  | 'driverArrived'
  | 'tripStarted'
  | 'tripCompleted'
  | 'cancelled'
  | 'rejected'
  | 'expired'
  | string;

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | string;

export interface BookingItem {
  _id: string;
  id?: string;
  bookingNumber: string;
  serviceId?: BookingServiceInfo | string | null;
  userId?: BookingUser | string | null;
  driverId?: BookingDriver | string | null;
  vehicleId?: BookingVehicleInfo | string | null;
  pickupLocation: BookingLocation;
  dropLocation: BookingLocation;
  distance?: number;
  fare: number;
  tokenMoney?: number;
  rating?: number | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'wallet' | string;
  cancellationReason?: string | null;
  acceptedAt?: string | null;
  driverArrivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BookingsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface BookingsResponse {
  success: boolean;
  message: string;
  data: {
    items: BookingItem[];
    pagination: BookingsPagination;
  };
}

export interface BookingSummaryData {
  range: 'today' | 'week' | 'month' | string;
  from: string;
  to: string;
  totalCompletedTrips: number;
  totalFare: number;
  totalTokenMoney: number;
  totalEarning: number;
  list: BookingItem[];
}

export interface BookingSummaryResponse {
  success: boolean;
  message: string;
  data: BookingSummaryData;
}
