import { Router } from 'express';
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  buyPackage,
  getMyPackages,
  getAllUserPackages,
  updateUserPackageStatus
} from '../controllers/package.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createPackageSchema,
  updatePackageSchema,
  getPackageSchema,
  queryPackagesSchema,
  buyPackageSchema
} from '../validators/package.validator.js';

const router = Router();

// User purchased packages
router.get('/my/purchases', authenticate, getMyPackages);

// Admin: see all user package purchases and update status
router.get('/user-packages', authenticate, requireAdmin, getAllUserPackages);
router.patch('/user-packages/:id/status', authenticate, requireAdmin, updateUserPackageStatus);

// Public / client routes to list packages
router.get('/', validate(queryPackagesSchema), getPackages);
router.get('/:packageId', validate(getPackageSchema), getPackageById);

// Buy package endpoint
router.post('/:packageId/buy', authenticate, validate(buyPackageSchema), buyPackage);

// Admin routes to manage packages
router.post('/', authenticate, requireAdmin, validate(createPackageSchema), createPackage);
router.patch('/:packageId', authenticate, requireAdmin, validate(updatePackageSchema), updatePackage);
router.delete('/:packageId', authenticate, requireAdmin, validate(getPackageSchema), deletePackage);

export default router;
