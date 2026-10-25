import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/service.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
  getServiceSchema,
  queryServicesSchema
} from '../validators/service.validator.js';

const router = Router();

// Public routes
router.get('/', validate(queryServicesSchema), getServices);
router.get('/:serviceId', validate(getServiceSchema), getServiceById);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.single('image'), validate(createServiceSchema), createService);
router.patch('/:serviceId', authenticate, requireAdmin, upload.single('image'), validate(updateServiceSchema), updateService);
router.delete('/:serviceId', authenticate, requireAdmin, validate(getServiceSchema), deleteService);

export default router;
