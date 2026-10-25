import { z } from 'zod';
import { USER_ROLES } from '../constants/booking.js';

const phoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number cannot exceed 15 characters')
  .regex(/^\+?[0-9]{10,14}$/, 'Invalid phone number format');

/**
 * Schema: Create Account (Admin)
 */
export const createAccountSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    gender: z
      .enum(['male', 'female', 'other'], {
        required_error: 'Gender is required',
        invalid_type_error: 'Gender must be male, female, or other'
      })
      .optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    role: z
      .enum(Object.values(USER_ROLES), {
        invalid_type_error: `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`
      })
      .default(USER_ROLES.USER),
    address: z.string().trim().max(200, 'Address cannot exceed 200 characters').optional().nullable(),
    isActive: z.boolean().default(true)
  })
});

/**
 * Schema: Update Account (Admin)
 */
export const updateAccountSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Account ID is required')
  }),
  body: z
    .object({
      phone: phoneSchema.optional(),
      name: z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .optional(),
      gender: z
        .enum(['male', 'female', 'other'], {
          invalid_type_error: 'Gender must be male, female, or other'
        })
        .optional()
        .nullable(),
      email: z.string().email('Invalid email address').optional().nullable(),
      role: z
        .enum(Object.values(USER_ROLES), {
          invalid_type_error: `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`
        })
        .optional(),
      address: z.string().trim().max(200, 'Address cannot exceed 200 characters').optional().nullable(),
      isActive: z.boolean().optional(),
      isBlocked: z.boolean().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required to update the account'
    })
});

/**
 * Schema: Delete / Get Account by ID
 */
export const accountIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Account ID is required')
  })
});

/**
 * Schema: List Accounts query params
 */
export const listAccountsSchema = z.object({
  query: z.object({
    role: z.enum(Object.values(USER_ROLES)).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    isBlocked: z.enum(['true', 'false']).optional(),
    search: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
  })
});

// ─── Admin Login Schemas ────────────────────────────────────────────────────────

/**
 * Schema: Step 1 — Send OTP for admin login
 */
export const adminSendOtpSchema = z.object({
  body: z.object({
    phone: phoneSchema
  })
});

/**
 * Schema: Step 2 — Verify OTP and login
 */
export const adminLoginSchema = z.object({
  body: z.object({
    phone: phoneSchema,
    otp: z
      .string({ required_error: 'OTP is required' })
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain numbers only'),
    deviceToken: z.string().optional(),
    platform: z.enum(['ios', 'android', 'web']).optional()
  })
});

/**
 * Schema: Refresh admin tokens
 */
export const adminRefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' })
  })
});

/**
 * Schema: Admin Send Push Notification
 */
export const sendPushNotificationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title cannot be empty')
      .max(150, 'Title cannot exceed 150 characters'),
    body: z
      .string({ required_error: 'Body/message is required' })
      .trim()
      .min(1, 'Body cannot be empty')
      .max(1500, 'Body cannot exceed 1500 characters'),
    type: z
      .enum([
        'booking_request',
        'booking_accepted',
        'booking_rejected',
        'driver_arriving',
        'driver_arrived',
        'trip_started',
        'trip_completed',
        'booking_cancelled',
        'new_message',
        'rating_received',
        'promotion',
        'announcement',
        'admin_alert',
        'general'
      ])
      .optional()
      .default('general'),
    target: z.enum(['all', 'users', 'drivers', 'user', 'driver']).optional(),
    role: z.enum(['user', 'driver', 'admin']).optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional(),
    recipientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid recipient ID').optional(),
    userIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
    data: z.record(z.any()).optional().default({})
  })
});

/**
 * Schema: Admin List Notifications
 */
export const listNotificationsSchema = z.object({
  query: z.object({
    type: z.string().optional(),
    isRead: z.enum(['true', 'false']).optional(),
    search: z.string().trim().optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
  })
});
