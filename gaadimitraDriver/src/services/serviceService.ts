import { apiClient } from './api';

export interface BackendServiceItem {
  id: string;
  _id?: string;
  title: string;
  image?: string | null;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetServicesResponse {
  success?: boolean;
  message?: string;
  data?:
    | BackendServiceItem[]
    | {
        items?: BackendServiceItem[];
        pagination?: any;
      };
}

export class ServiceService {
  /**
   * Fetch services list from GET /services
   */
  async getServices(): Promise<BackendServiceItem[]> {
    const response = await apiClient.get<any>('/services');
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

export const serviceService = new ServiceService();
