import { Router } from 'express';
import {
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
} from '../controllers/driver.controller.js';
import { authenticate, requireDriver, requireUser } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import {
  registerDriverSchema,
  getNearbyDriversSchema,
  updateDriverProfileSchema,
  updateDriverStatusSchema,
  updateDriverLocationSchema,
  createDriverReportSchema
} from '../validators/driver.validator.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Public driver registration endpoint (before auth middleware)
router.post(
  '/register',
  authRateLimiter,
  upload.single('profileImage'),
  validate(registerDriverSchema),
  registerDriver
);

router.use(authenticate);

router.post('/report', requireUser, validate(createDriverReportSchema), createDriverReport);
router.get('/all-reports', getAllDriverReports);


// Search nearby drivers (Supports both POST and GET)
router.post('/nearby', validate(getNearbyDriversSchema), getNearbyDrivers);
router.get('/nearby', getNearbyDrivers);

// Driver profile & actions
router.get('/me', requireDriver, getDriverProfile);
router.patch('/me', requireDriver, validate(updateDriverProfileSchema), updateDriverProfile);
router.patch('/update', requireDriver, validate(updateDriverProfileSchema), updateDriverProfile);
router.patch('/me/vehicle-images', requireDriver, upload.array('vehicleImages', 5), updateDriverVehicleImages);
router.patch('/status', requireDriver, validate(updateDriverStatusSchema), updateStatus);
router.patch('/location', requireDriver, validate(updateDriverLocationSchema), updateLocation);

// Specific driver details
router.get('/:driverId', getDriverById);

export default router;
