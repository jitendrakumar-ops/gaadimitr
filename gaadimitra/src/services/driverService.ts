import { apiClient } from './api';

export interface PickupLocationParam {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface QueryNearbyDriversParams {
  serviceId?: string | null;
  vehicleId?: string | null;
  pickuplocation: PickupLocationParam | { lat: number; lng: number } | [number, number];
  distance?: number;
}

export interface NearbyDriverUser {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  profileImage?: string | null;
  pin?: string;
  experienceYears?: number | null;
}

export interface NearbyDriverService {
  _id?: string;
  id?: string;
  title: string;
  image?: string | null;
}

export interface NearbyDriverVehicle {
  _id?: string;
  id?: string;
  title: string;
  type?: string;
  seat?: number;
  fee?: number;
  platformCharge?: number;
  image?: string | null;
}

export interface NearbyDriverItem {
  _id: string;
  id?: string;
  pin?: string;
  userId?: NearbyDriverUser;
  serviceId?: NearbyDriverService | string | null;
  vehicleId?: NearbyDriverVehicle | string | null;
  vehicleModel?: string;
  vehicleNo?: string;
  manufacturingYear?: number | null;
  seating?: number | null;
  type?: string;
  color?: string;
  vehicleImages?: string[];
  rating?: number;
  totalRatingsCount?: number;
  totalTripsCount?: number;
  onlineStatus?: string;
  isVerified?: boolean;
  experienceYears?: number | null;
  currentLocation?: {
    type?: string;
    coordinates: [number, number]; // [longitude, latitude]
    heading?: number;
  };
  distanceKm?: number;
}

export interface NearbyDriversApiResponse {
  success: boolean;
  message: string;
  data: NearbyDriverItem[];
}

export const driverService = {
  /**
   * Fetch nearby online drivers via POST /drivers/nearby
   * Body payload: { serviceId, vehicleId, pickuplocation, distance }
   */
  getNearbyDrivers: async (params: QueryNearbyDriversParams): Promise<NearbyDriverItem[]> => {
    const payload: Record<string, any> = {
      pickuplocation: params.pickuplocation,
      distance: params.distance ?? 10,
    };

    if (params.serviceId && /^[0-9a-fA-F]{24}$/.test(params.serviceId)) {
      payload.serviceId = params.serviceId;
    }
    if (params.vehicleId && /^[0-9a-fA-F]{24}$/.test(params.vehicleId)) {
      payload.vehicleId = params.vehicleId;
    }

    const response = await apiClient.post<NearbyDriversApiResponse>('/drivers/nearby', payload);
    return response?.data || [];
  },

  /**
   * Fetch single driver by ID via GET /drivers/:driverId
   */
  getDriverById: async (driverId: string): Promise<NearbyDriverItem> => {
    const response = await apiClient.get<{ success: boolean; data: NearbyDriverItem }>(`/drivers/${driverId}`);
    return (response as any)?.data || response;
  },

  /**
   * Fetch authenticated driver profile via GET /drivers/me
   */
  getDriverMe: async (): Promise<NearbyDriverItem> => {
    const response = await apiClient.get<{ success: boolean; data: NearbyDriverItem }>('/drivers/me');
    return response.data;
  },

  /**
   * Report a driver via POST /drivers/report
   * Body payload: { driverId, reason, details }
   */
  reportDriver: async (payload: ReportDriverPayload): Promise<ReportDriverApiResponse> => {
    const response = await apiClient.post<ReportDriverApiResponse>('/drivers/report', payload);
    return response;
  },
};

export interface ReportDriverPayload {
  driverId: string;
  reason: string;
  details?: string;
}

export interface ReportDriverApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

