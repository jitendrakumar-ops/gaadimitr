import { apiClient } from './api';
import { UpdateDriverPayload, UpdateDriverResponse, GetDriverProfileResponse } from '../types/driver';

export class DriverService {
  /**
   * Update driver vehicle and profile details via PATCH /drivers/update
   * Body fields:
   * - serviceId (ObjectId string)
   * - vehicleId (ObjectId string)
   * - vehicleModel (string)
   * - vehicleNo (string)
   * - manufacturingYear (number)
   * - seating (number)
   * - type (string, e.g. AC / Non-AC)
   * - color (string)
   * - experienceYears (number)
   * - vehicleImages (string[])
   */
  async updateDriver(payload: UpdateDriverPayload): Promise<UpdateDriverResponse> {
    try {
      const response = await apiClient.patch<UpdateDriverResponse>('/drivers/update', payload);
      return response;
    } catch (err: any) {
      // If /drivers/update returns 404, fallback to /drivers/me
      if (err?.status === 404) {
        return await apiClient.patch<UpdateDriverResponse>('/drivers/me', payload);
      }
      throw err;
    }
  }

  /**
   * Upload vehicle photos via PATCH /drivers/me/vehicle-images
   * Accepts multipart FormData with 'vehicleImages' files
   */
  async uploadVehicleImages(formData: FormData): Promise<any> {
    try {
      return await apiClient.patchFormData<any>('/drivers/me/vehicle-images', formData);
    } catch (err: any) {
      if (err?.status === 404) {
        return await apiClient.postFormData<any>('/drivers/me/vehicle-images', formData);
      }
      throw err;
    }
  }

  /**
   * Get driver profile via GET /drivers/me
   */
  async getDriverProfile(): Promise<GetDriverProfileResponse> {
    return await apiClient.get<GetDriverProfileResponse>('/drivers/me');
  }

  /**
   * Update driver online status via PATCH /drivers/status
   * Body: { status: 'online' | 'offline' }
   */
  async updateStatus(status: 'online' | 'offline'): Promise<any> {
    return await apiClient.patch<any>('/drivers/status', { status });
  }

  /**
   * Update driver GPS location via PATCH /drivers/location
   * Body: { latitude: number, longitude: number, heading?: number }
   */
  async updateLocation(payload: { latitude: number; longitude: number; heading?: number }): Promise<any> {
    return await apiClient.patch<any>('/drivers/location', payload);
  }
}

export const driverService = new DriverService();
