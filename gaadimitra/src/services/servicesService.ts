import { apiClient } from './api';

export interface ServiceItem {
  id: string;
  title: string;
  image?: string | null;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicesApiResponse {
  success: boolean;
  message: string;
  data: ServiceItem[];
}

export interface SingleServiceApiResponse {
  success: boolean;
  message: string;
  data: ServiceItem;
}

export interface QueryServicesParams {
  isActive?: boolean;
  search?: string;
}

export const servicesService = {
  /**
   * Fetch services list from backend GET /services
   */
  getServices: async (params?: QueryServicesParams): Promise<ServiceItem[]> => {
    const queryParts: string[] = [];

    if (params?.isActive !== undefined) {
      queryParts.push(`isActive=${params.isActive}`);
    }
    if (params?.search && params.search.trim()) {
      queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await apiClient.get<ServicesApiResponse>(`/services${queryString}`);

    return response?.data || [];
  },

  /**
   * Fetch single service by ID from backend GET /services/:serviceId
   */
  getServiceById: async (serviceId: string): Promise<ServiceItem> => {
    const response = await apiClient.get<SingleServiceApiResponse>(`/services/${serviceId}`);
    return response.data;
  },
};
