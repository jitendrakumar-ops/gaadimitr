import ServiceService from '../services/service.service.js';
import S3Service from '../services/s3.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const createService = async (req, res, next) => {
  try {
    let imageUrl = req.body.image || null;

    if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, 'services');
      imageUrl = uploadResult.url;
    }

    const payload = {
      ...req.body,
      image: imageUrl
    };

    const service = await ServiceService.createService(payload);
    return sendCreated(res, 'Service created successfully', service);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req, res, next) => {
  try {
    const services = await ServiceService.getServices(req.query);
    return sendSuccess(res, 'Services retrieved successfully', services);
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const service = await ServiceService.getServiceById(serviceId);
    return sendSuccess(res, 'Service details retrieved', service);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const payload = { ...req.body };

    if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, 'services');
      payload.image = uploadResult.url;
    }

    const updated = await ServiceService.updateService(serviceId, payload);
    return sendSuccess(res, 'Service updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    await ServiceService.deleteService(serviceId);
    return sendSuccess(res, 'Service deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export default {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
};
