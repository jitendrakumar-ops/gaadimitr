import { Router } from 'express';
import { register, sendOtp, verifyOtp, refreshToken, logout, updateDeviceToken, updateProfile } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, sendOtpSchema, verifyOtpSchema, refreshTokenSchema, updateDeviceTokenSchema, updateProfileSchema } from '../validators/auth.validator.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/send-otp', authRateLimiter, validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', authenticate, logout);
router.patch('/device-token', authenticate, validate(updateDeviceTokenSchema), updateDeviceToken);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
