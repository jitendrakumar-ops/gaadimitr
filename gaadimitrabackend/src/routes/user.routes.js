import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  updateDeviceToken,
  updateUserRole,
  getNotifications,
  markNotificationRead
} from '../controllers/user.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema, updateDeviceTokenSchema, updateUserRoleSchema } from '../validators/user.validator.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', validate(updateProfileSchema), updateProfile);
router.post('/me/profile-image', upload.single('profileImage'), uploadProfileImage);
router.post('/me/device-token', validate(updateDeviceTokenSchema), updateDeviceToken);
router.patch('/:userId/role', requireAdmin, validate(updateUserRoleSchema), updateUserRole);

router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);

export default router;
