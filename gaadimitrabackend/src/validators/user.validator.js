import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    emergencyContact: z.string().trim().min(2, 'Emergency contact must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    profileImage: z.string().url('Profile image must be a valid URL').optional().nullable()
  })
});

export const updateDeviceTokenSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'Device token is required' }),
    platform: z.enum(['ios', 'android', 'web']).default('android')
  })
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'driver', 'admin'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be one of user, driver, admin'
    })
  })
});
