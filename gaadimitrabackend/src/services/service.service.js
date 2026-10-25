import Service from '../models/Service.js';
import { AppError } from '../utils/helpers.js';

export class ServiceService {
  /**
   * Create a new service
   */
  static async createService(data) {
    return await Service.create({
      title: data.title,
      image: data.image || null,
      description: data.description || '',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  /**
   * Get list of services with optional filters
   */
  static async getServices(filters = {}) {
    const query = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    return await Service.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get single service by ID
   */
  static async getServiceById(serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
    }
    return service;
  }

  /**
   * Update service
   */
  static async updateService(serviceId, data) {
    const updated = await Service.findByIdAndUpdate(serviceId, data, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
    }

    return updated;
  }

  /**
   * Delete service
   */
  static async deleteService(serviceId) {
    const deleted = await Service.findByIdAndDelete(serviceId);
    if (!deleted) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
    }
    return true;
  }
}

export default ServiceService;
