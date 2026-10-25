import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import { getRedisClient } from '../config/redis.js';
import { DRIVER_ONLINE_STATUS } from '../constants/booking.js';
import { AppError, calculateDistanceKm } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const DRIVER_GEO_KEY = 'drivers:locations';

export class DriverService {
  /**
   * Update driver online/offline availability
   */
  static async updateStatus(driverId, newStatus) {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
    }



    if (!driver.vehicleId && newStatus === DRIVER_ONLINE_STATUS.ONLINE) {
      throw new AppError('Please register a vehicle before going online', 400, 'VEHICLE_REQUIRED');
    }

    driver.onlineStatus = newStatus;
    await driver.save();

    // If driver goes offline, remove from Redis geo-set
    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        if (newStatus === DRIVER_ONLINE_STATUS.OFFLINE) {
          await redis.zrem(DRIVER_GEO_KEY, driverId.toString());
        }
      }
    } catch (err) {
      logger.error({ err }, 'Redis error removing offline driver from geo-set');
    }

    return driver;
  }

  /**
   * Update driver self profile details in the Driver record only
   */
  static async updateProfile(driverId, payload = {}) {
    const allowedDriverFields = [
      'serviceId',
      'vehicleId',
      'vehicleModel',
      'vehicleNo',
      'manufacturingYear',
      'seating',
      'type',
      'color',
      'vehicleImages',
      'experienceYears'
    ];

    const update = {};

    for (const key of allowedDriverFields) {
      if (payload[key] !== undefined) {
        update[key] = payload[key];
      }
    }

    if (Object.keys(update).length === 0) {
      throw new AppError('At least one driver field is required to update the profile', 400, 'INVALID_UPDATE_PAYLOAD');
    }

    const driver = await Driver.findByIdAndUpdate(driverId, update, {
      new: true,
      runValidators: true
    }).populate('userId', 'name phone profileImage role');

    if (!driver) {
      throw new AppError('Driver profile not found', 404, 'DRIVER_NOT_FOUND');
    }

    return driver;
  }

  static async updateVehicleImages(driverId, vehicleImages = []) {
    const normalized = Array.isArray(vehicleImages)
      ? vehicleImages
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [];

    if (normalized.length === 0) {
      throw new AppError('At least one vehicle image URL is required', 400, 'INVALID_VEHICLE_IMAGES');
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { vehicleImages: normalized },
      { new: true, runValidators: true }
    ).populate('userId', 'name phone profileImage role');

    if (!driver) {
      throw new AppError('Driver profile not found', 404, 'DRIVER_NOT_FOUND');
    }

    return driver;
  }

  /**
   * Update real-time location in DB
   */
  static async updateLocation(driverId, { latitude, longitude, heading = 0 }) {
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      {
        'currentLocation.coordinates': [longitude, latitude],
        'currentLocation.heading': heading,
        'currentLocation.updatedAt': new Date()
      },
      { new: true }
    ).select('onlineStatus currentLocation');

    return updatedDriver;
  }

  /**
   * Get driver details by ID
   */
  static async getDriverById(driverId) {
    const driver = await Driver.findById(driverId).populate('vehicleId').populate('userId', 'name phone profileImage').lean();
    if (!driver) {
      throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
    }
    return driver;
  }

  /**
   * Find nearby drivers based on serviceId, vehicleId, pickuplocation, and distance
   */
  static async getNearbyDrivers({ serviceId = null, vehicleId = null, pickuplocation, distance = 10 }) {
    let lat, lng;

    if (Array.isArray(pickuplocation)) {
      lng = Number(pickuplocation[0]);
      lat = Number(pickuplocation[1]);
    } else if (pickuplocation && typeof pickuplocation === 'object') {
      lat = Number(
        pickuplocation.latitude ??
        pickuplocation.lat ??
        (pickuplocation.coordinates ? pickuplocation.coordinates[1] : undefined)
      );
      lng = Number(
        pickuplocation.longitude ??
        pickuplocation.lng ??
        (pickuplocation.coordinates ? pickuplocation.coordinates[0] : undefined)
      );
    }

    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      throw new AppError('Valid latitude and longitude are required for pickuplocation', 400, 'INVALID_COORDINATES');
    }

    const radiusKm = Number(distance) || 10;
    const maxDistanceMeters = radiusKm * 1000;

    const query = {
      onlineStatus: DRIVER_ONLINE_STATUS.ONLINE,
      subscriptionStatus: 'active',
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    };

    if (serviceId) {
      query.serviceId = serviceId;
    }

    if (vehicleId) {
      query.vehicleId = vehicleId;
    }


    const drivers = await Driver.find(query).select('userId vehicleModel vehicleNo currentLocation seating type color rating experienceYears isVerified')
      .populate('userId', 'name phone profileImage')   
      .limit(50)
      .lean();
    return drivers
  }
}

export default DriverService;
