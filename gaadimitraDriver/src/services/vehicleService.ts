import { apiClient } from './api';

export interface VehicleServiceRef {
  _id?: string;
  id?: string;
  title?: string;
  image?: string;
}

export interface BackendVehicleItem {
  id: string;
  _id?: string;
  title: string;
  serviceId?: string | VehicleServiceRef | any;
  image?: string | null;
  seat?: number | null;
  type?: string;
  fee?: number;
  platformCharge?: number;
  platform_charge?: number;
  seating?: number;
  vehicleType?: string;
  vehicleImage?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface GetVehiclesPagination {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface GetVehiclesResponse {
  success?: boolean;
  message?: string;
  data?:
    | BackendVehicleItem[]
    | {
        items?: BackendVehicleItem[];
        pagination?: GetVehiclesPagination;
      };
}

export class VehicleService {
  /**
   * Fetch vehicles from GET /vehicles with optional serviceId filter
   */
  async getVehicles(serviceId?: string): Promise<BackendVehicleItem[]> {
    const endpoint = serviceId
      ? `/vehicles?serviceId=${encodeURIComponent(serviceId)}`
      : '/vehicles';

    const response = await apiClient.get<any>(endpoint);

    let rawList: any[] = [];
    if (response?.data?.items && Array.isArray(response.data.items)) {
      rawList = response.data.items;
    } else if (response?.data && Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response?.items && Array.isArray(response.items)) {
      rawList = response.items;
    } else if (Array.isArray(response)) {
      rawList = response;
    }

    return rawList.map((item: any) => ({
      ...item,
      id: item.id || item._id || '',
    }));
  }
}

export const vehicleService = new VehicleService();

