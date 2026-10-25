import { Router } from 'express';
import {
  createAccount,
  updateAccount,
  deleteAccount,
  getAllAccounts,
  getAccountById,
  sendLoginOtp,
  login,
  refreshAdminTokens,
  adminLogout,
  sendPushNotification,
  getAdminNotifications,
  getOverview
} from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createAccountSchema,
  updateAccountSchema,
  accountIdParamSchema,
  listAccountsSchema,
  adminSendOtpSchema,
  adminLoginSchema,
  adminRefreshTokenSchema,
  sendPushNotificationSchema,
  listNotificationsSchema
} from '../validators/admin.validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/auth/send-otp', authRateLimiter, validate(adminSendOtpSchema), sendLoginOtp);
router.post('/auth/login', authRateLimiter, validate(adminLoginSchema), login);
router.post('/auth/refresh-token', validate(adminRefreshTokenSchema), refreshAdminTokens);

router.use(authenticate, requireAdmin);

router.post('/auth/logout', adminLogout);
router.get('/accounts', validate(listAccountsSchema), getAllAccounts);
router.get('/accounts/:id', validate(accountIdParamSchema), getAccountById);
router.post('/accounts', validate(createAccountSchema), createAccount);
router.patch('/accounts/:id', validate(updateAccountSchema), updateAccount);
router.delete('/accounts/:id', validate(accountIdParamSchema), deleteAccount);
router.post('/notifications/send', validate(sendPushNotificationSchema), sendPushNotification);
router.post('/send-notification', validate(sendPushNotificationSchema), sendPushNotification);
router.get('/notifications', validate(listNotificationsSchema), getAdminNotifications);
router.get('/overview', getOverview);

export default router;
