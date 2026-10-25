import { apiClient } from './api';
import {
  PackagesResponse,
  SinglePackageResponse,
  BuyPackageResponse,
  MyPurchasesResponse,
  BuyPackagePayload,
} from '../types/package';

export class PackageService {
  /**
   * Fetch packages list with optional query params
   */
  async getPackages(params?: {
    serviceId?: string;
    dayType?: string;
    isActive?: boolean | string;
  }): Promise<PackagesResponse> {
    const queryParts: string[] = [];
    if (params?.serviceId) {
      queryParts.push(`serviceId=${encodeURIComponent(params.serviceId)}`);
    }
    if (params?.dayType) {
      queryParts.push(`dayType=${encodeURIComponent(params.dayType)}`);
    }
    if (params?.isActive !== undefined) {
      queryParts.push(`isActive=${encodeURIComponent(String(params.isActive))}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return await apiClient.get<PackagesResponse>(`/packages${queryString}`);
  }

  /**
   * Get single package details by ID
   */
  async getPackageById(packageId: string): Promise<SinglePackageResponse> {
    return await apiClient.get<SinglePackageResponse>(`/packages/${packageId}`);
  }

  /**
   * Purchase / Buy a subscription package
   */
  async buyPackage(
    packageId: string,
    payload?: BuyPackagePayload
  ): Promise<BuyPackageResponse> {
    return await apiClient.post<BuyPackageResponse>(
      `/packages/${packageId}/buy`,
      payload || {}
    );
  }

  /**
   * Get all packages purchased by currently authenticated user/driver
   */
  async getMyPurchasedPackages(): Promise<MyPurchasesResponse> {
    return await apiClient.get<MyPurchasesResponse>('/packages/my/purchases');
  }
}

export const packageService = new PackageService();
export default packageService;
