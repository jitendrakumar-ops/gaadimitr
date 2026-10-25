import DriverService from '../services/driver.service.js';
import AuthService from '../services/auth.service.js';
import S3Service from '../services/s3.service.js';
import DriverReportService from '../services/driverReport.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';


export const registerDriver = async (req, res, next) => {
  try {
    let profileImageUrl = req.body.profileImage || null;

    if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, 'driver-profiles');
      profileImageUrl = uploadResult.url;
    }

    let emergencyContact = req.body.emergencyContact;
    if (typeof emergencyContact === 'string') {
      try {
        const parsed = JSON.parse(emergencyContact);
        if (typeof parsed === 'object' && parsed !== null) {
          emergencyContact = parsed;
        }
      } catch {
        // keep as plain string
      }
    }

    const result = await AuthService.registerDriver({
      name: req.body.name,
      phone: req.body.phone,
      profileImage: profileImageUrl,
      address: req.body.address,
      emergencyContact,
      email: req.body.email,
      gender: req.body.gender,
      deviceToken: req.body.deviceToken,
      platform: req.body.platform,
      code: req.body.code,
      reqInfo: {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    return sendCreated(res, 'Driver registered successfully', result);
  } catch (error) {
    next(error);
  }
};


export const getNearbyDrivers = async (req, res, next) => {
  try {
    const data = Object.keys(req.body || {}).length > 0 ? req.body : req.query;
    const { serviceId, vehicleId, pickuplocation, distance } = data;
  

    const drivers = await DriverService.getNearbyDrivers({
      serviceId,
      vehicleId,
      pickuplocation,
      distance
    });

    return sendSuccess(res, 'Nearby drivers retrieved successfully', drivers);
  } catch (error) {
    next(error);
  }
};

export const getDriverProfile = async (req, res, next) => {
  try {
    // req.driver is populated by requireDriver middleware
    return sendSuccess(res, 'Driver profile retrieved successfully', req.driver);
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await DriverService.getDriverById(driverId);
    return sendSuccess(res, 'Driver details retrieved', driver);
  } catch (error) {
    next(error);
  }
};

export const updateDriverProfile = async (req, res, next) => {
  try {
    const result = await DriverService.updateProfile(req.driver._id, req.body);
    return sendSuccess(res, 'Driver profile updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateDriverVehicleImages = async (req, res, next) => {
  try {
    const bodyImages = req.body?.vehicleImages;
    const incomingImages = [];

    if (Array.isArray(bodyImages)) {
      incomingImages.push(...bodyImages);
    } else if (typeof bodyImages === 'string') {
      try {
        const parsed = JSON.parse(bodyImages);
        if (Array.isArray(parsed)) {
          incomingImages.push(...parsed);
        } else if (parsed) {
          incomingImages.push(parsed);
        }
      } catch {
        incomingImages.push(bodyImages);
      }
    }

    if (req.files && req.files.length > 0) {
      const uploaded = await Promise.all(
        req.files.map((file) => S3Service.uploadFile(file, 'driver-vehicle-images'))
      );
      incomingImages.push(...uploaded.map((item) => item.url));
    }

    const result = await DriverService.updateVehicleImages(req.driver._id, incomingImages);
    return sendSuccess(res, 'Driver vehicle images updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await DriverService.updateStatus(req.driver._id, status);
    return sendSuccess(res, `Driver status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, heading } = req.body;
    const updated = await DriverService.updateLocation(req.driver._id, {
      latitude,
      longitude,
      heading
    });

    return sendSuccess(res, 'Driver location updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const createDriverReport = async (req, res, next) => {
  try {
    const { driverId, reason } = req.body;
    const report = await DriverReportService.createDriverReport({
      userId: req.user._id,
      driverId,
      reason
    });

    return sendCreated(res, 'Driver report created successfully', report);
  } catch (error) {
    next(error);
  }
};

export const getAllDriverReports = async (req, res, next) => {
  try {
    const { search, driverId, userId, page, limit } = req.query;
    const { reports, total, page: pageNum, limit: limitNum } = await DriverReportService.getAllReports({
      search,
      driverId,
      userId,
      page,
      limit
    });

    return sendPaginated(res, 'Driver reports retrieved successfully', reports, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

export default {
  registerDriver,
  getNearbyDrivers,
  getDriverProfile,
  getDriverById,
  updateDriverProfile,
  updateDriverVehicleImages,
  updateStatus,
  updateLocation,
  createDriverReport,
  getAllDriverReports
};
