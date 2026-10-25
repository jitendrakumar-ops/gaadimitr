import { z } from 'zod';
import { USER_ROLES } from '../constants/booking.js';

export const registerSchema = z.object({
  body: z.object({
    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number cannot exceed 15 characters')
      .regex(/^\+?[0-9]{10,14}$/, 'Invalid phone number format'),
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    gender: z
      .enum(['male', 'female', 'other'], {
        required_error: 'Gender is required',
        invalid_type_error: 'Gender must be male, female, or other'
      }),
    email: z.string().email('Invalid email address').optional().nullable(),
    code: z.string().trim().min(4, 'Referral code must be at least 4 characters').max(20, 'Referral code cannot exceed 20 characters').optional(),
    role: z
      .enum([USER_ROLES.USER, USER_ROLES.DRIVER])
      .default(USER_ROLES.USER),
    deviceToken: z.string().optional(),
    platform: z.enum(['ios', 'android', 'web']).optional()
  })
});

export const sendOtpSchema = z.object({
  body: z.object({
    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number cannot exceed 15 characters')
      .regex(/^\+?[0-9]{10,14}$/, 'Invalid phone number format'),
    role: z
      .enum([USER_ROLES.USER, USER_ROLES.DRIVER], {
        invalid_type_error: 'Role must be either user or driver'
      })
      .default(USER_ROLES.USER)
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number cannot exceed 15 characters'),
    otp: z
      .string({ required_error: 'OTP is required' })
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain numbers only'),
    role: z
      .enum([USER_ROLES.USER, USER_ROLES.DRIVER])
      .default(USER_ROLES.USER),
    deviceToken: z.string().optional(),
    platform: z.enum(['ios', 'android', 'web']).optional()
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' })
  })
});

export const updateDeviceTokenSchema = z.object({
  body: z.object({
    deviceToken: z.string({ required_error: 'Device token is required' }).trim().min(1, 'Device token is required'),
    platform: z.enum(['ios', 'android', 'web']).default('android').optional()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    gender: z.enum(['male', 'female', 'other'], {
      invalid_type_error: 'Gender must be male, female, or other'
    }).optional().nullable()
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update the profile',
    path: []
  })
});
