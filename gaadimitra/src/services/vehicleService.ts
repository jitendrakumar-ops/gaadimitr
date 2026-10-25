import { apiClient } from './api';

export interface VehicleServiceParent {
  id: string;
  title: string;
  image?: string | null;
}

export interface VehicleItem {
  id: string;
  title: string;
  serviceId?: VehicleServiceParent | string | null;
  image?: string | null;
  seat?: number;
  type?: string;
  fee?: number;
  platformCharge?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehiclesPaginatedData {
  items: VehicleItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface VehiclesApiResponse {
  success: boolean;
  message: string;
  data: VehiclesPaginatedData;
}

export interface SingleVehicleApiResponse {
  success: boolean;
  message: string;
  data: VehicleItem;
}

export interface QueryVehiclesParams {
  serviceId?: string;
  type?: string;
  isActive?: boolean;
}

export const vehicleService = {
  /**
   * Fetch vehicles list from backend GET /vehicles
   * Query params: serviceId, type, isActive
   */
  getVehicles: async (params?: QueryVehiclesParams): Promise<VehicleItem[]> => {
    const queryParts: string[] = [];

    if (params?.serviceId) {
      queryParts.push(`serviceId=${encodeURIComponent(params.serviceId)}`);
    }
    if (params?.type) {
      queryParts.push(`type=${encodeURIComponent(params.type)}`);
    }
    if (params?.isActive !== undefined) {
      queryParts.push(`isActive=${params.isActive}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await apiClient.get<VehiclesApiResponse>(`/vehicles${queryString}`);

    // API returns paginated shape: { data: { items: [...], pagination: {} } }
    const raw = response?.data?.items;
    if (!Array.isArray(raw)) return [];

    // Normalize _id -> id (MongoDB uses _id)
    return raw.map((v: any) => ({ ...v, id: v.id ?? v._id }));
  },

  /**
   * Fetch single vehicle by ID from backend GET /vehicles/:vehicleId
   */
  getVehicleById: async (vehicleId: string): Promise<VehicleItem> => {
    const response = await apiClient.get<SingleVehicleApiResponse>(`/vehicles/${vehicleId}`);
    const v: any = response.data;
    return { ...v, id: v.id ?? v._id };
  },
};
