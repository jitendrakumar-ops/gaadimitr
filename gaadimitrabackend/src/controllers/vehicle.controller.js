import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import VehicleService from '../services/vehicle.service.js';
import S3Service from '../services/s3.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import { AppError } from '../utils/helpers.js';

export const createVehicle = async (req, res, next) => {
  try {
    let imageUrl = req.body.image || null;

    if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, 'vehicles');
      imageUrl = uploadResult.url;
    }

    const payload = {
      ...req.body,
      image: imageUrl
    };

    const vehicle = await VehicleService.createVehicle(payload);
    return sendCreated(res, 'Vehicle created successfully', vehicle);
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req, res, next) => {
  try {
    const { vehicles, total, page, limit } = await VehicleService.getVehicles(req.query);
    return sendPaginated(res, 'Vehicles retrieved successfully', vehicles, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await VehicleService.getVehicleById(vehicleId);
    return sendSuccess(res, 'Vehicle details retrieved', vehicle);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const payload = { ...req.body };

    if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, 'vehicles');
      payload.image = uploadResult.url;
    }

    const updated = await VehicleService.updateVehicle(vehicleId, payload);
    return sendSuccess(res, 'Vehicle updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    await VehicleService.deleteVehicle(vehicleId);
    return sendSuccess(res, 'Vehicle deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export const getMyVehicle = async (req, res, next) => {
  try {
    if (!req.driver.vehicleId) {
      throw new AppError('No vehicle assigned to driver', 404, 'VEHICLE_NOT_FOUND');
    }
    const vehicle = await Vehicle.findById(req.driver.vehicleId);
    if (!vehicle) {
      throw new AppError('No active vehicle found for this driver', 404, 'VEHICLE_NOT_FOUND');
    }
    return sendSuccess(res, 'Vehicle details retrieved', vehicle);
  } catch (error) {
    next(error);
  }
};

export default {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMyVehicle
};
