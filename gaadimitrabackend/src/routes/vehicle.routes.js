import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMyVehicle
} from '../controllers/vehicle.controller.js';
import { authenticate, requireAdmin, requireDriver } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  getVehicleSchema,
  queryVehiclesSchema
} from '../validators/vehicle.validator.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// ==================== Driver Assigned Vehicle Route ====================
router.get('/me', authenticate, requireDriver, getMyVehicle);

// ==================== Public Vehicle Catalog Routes ====================
router.get('/', validate(queryVehiclesSchema), getVehicles);
router.get('/:vehicleId', validate(getVehicleSchema), getVehicleById);

// ==================== Admin Vehicle Management Routes ====================
router.post('/', authenticate, requireAdmin, upload.single('image'), validate(createVehicleSchema), createVehicle);
router.patch('/:vehicleId', authenticate, requireAdmin, upload.single('image'), validate(updateVehicleSchema), updateVehicle);
router.delete('/:vehicleId', authenticate, requireAdmin, validate(getVehicleSchema), deleteVehicle);

export default router;
