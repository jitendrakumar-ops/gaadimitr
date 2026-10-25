import Vehicle from '../models/Vehicle.js';
import { AppError } from '../utils/helpers.js';

export class VehicleService {
  /**
   * Create a new vehicle category/type
   */
  static async createVehicle(data) {
    const platformCharge = data.platformCharge !== undefined ? data.platformCharge : (data.platform_charge || 0);

    return await Vehicle.create({
      title: data.title,
      serviceId: data.serviceId || null,
      image: data.image || null,
      seat: data.seat || null,
      type: data.type,
      fee: data.fee,
      platformCharge,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  /**
   * Get list of vehicles with optional filters
   */
  static async getVehicles(filters = {}) {
    const query = {};

    if (filters.serviceId) query.serviceId = filters.serviceId;
    if (filters.type)      query.type      = filters.type;

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    const pageNum  = Math.max(1, Number(filters.page  || 1));
    const limitNum = Math.min(100, Math.max(1, Number(filters.limit || 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('serviceId', 'title image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Vehicle.countDocuments(query)
    ]);

    return { vehicles, total, page: pageNum, limit: limitNum };
  }

  /**
   * Get vehicle by ID
   */
  static async getVehicleById(vehicleId) {
    const vehicle = await Vehicle.findById(vehicleId).populate('serviceId', 'title image');
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }
    return vehicle;
  }

  /**
   * Update vehicle by ID
   */
  static async updateVehicle(vehicleId, data) {
    const updateData = { ...data };
    if (updateData.platform_charge !== undefined && updateData.platformCharge === undefined) {
      updateData.platformCharge = updateData.platform_charge;
    }

    const updated = await Vehicle.findByIdAndUpdate(vehicleId, updateData, {
      new: true,
      runValidators: true
    }).populate('serviceId', 'title image');

    if (!updated) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }

    return updated;
  }

  /**
   * Delete vehicle by ID
   */
  static async deleteVehicle(vehicleId) {
    const deleted = await Vehicle.findByIdAndDelete(vehicleId);
    if (!deleted) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }
    return true;
  }
}

export default VehicleService;
