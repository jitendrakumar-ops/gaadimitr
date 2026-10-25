import { z } from 'zod';
import { DRIVER_ONLINE_STATUS } from '../constants/booking.js';

export const registerDriverSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format. Must be E.164 or 10 digits'),
    profileImage: z.string().optional(),
    address: z
      .string({ required_error: 'Address is required' })
      .min(3, 'Address must be at least 3 characters'),
    emergencyContact: z.union([
      z.string().min(3, 'Emergency contact must be at least 3 characters'),
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        relation: z.string().optional()
      })
    ], { required_error: 'Emergency contact is required' }),
    email: z.string().email('Invalid email address').optional(),
    code: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    deviceToken: z.string().optional(),
    platform: z.enum(['ios', 'android', 'web']).optional()
  })
});

export const updateDriverProfileSchema = z.object({
  body: z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format').optional().nullable(),
    vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID format').optional().nullable(),
    vehicleModel: z.string().trim().min(2, 'Vehicle model must be at least 2 characters').max(100).optional().nullable(),
    vehicleNo: z.string().trim().min(2, 'Vehicle number must be at least 2 characters').max(50).optional().nullable(),
    manufacturingYear: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional().nullable(),
    seating: z.number().int().min(1).max(20).optional().nullable(),
    type: z.string().trim().min(2, 'Vehicle type must be at least 2 characters').max(50).optional().nullable(),
    color: z.string().trim().min(2, 'Vehicle color must be at least 2 characters').max(50).optional().nullable(),
    experienceYears: z.number().min(0).max(60).optional().nullable(),
    vehicleImages: z.array(z.string().url('Vehicle image must be a valid URL')).optional().nullable()
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one driver field is required to update the profile',
    path: []
  })
});

export const updateDriverStatusSchema = z.object({
  body: z.object({
    status: z.enum([DRIVER_ONLINE_STATUS.ONLINE, DRIVER_ONLINE_STATUS.OFFLINE], {
      required_error: 'Online status is required and must be online or offline'
    })
  })
});

export const updateDriverLocationSchema = z.object({
  body: z.object({
    latitude: z
      .number({ required_error: 'Latitude is required' })
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: z
      .number({ required_error: 'Longitude is required' })
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
    heading: z.number().min(0).max(360).optional().default(0)
  })
});

export const createDriverReportSchema = z.object({
  body: z.object({
    driverId: z.string({ required_error: 'driverId is required' }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid Driver ID'),
    reason: z.string({ required_error: 'reason is required' }).min(3, 'Reason must be at least 3 characters').max(1000, 'Reason must be less than 1000 characters')
  })
});

export const getNearbyDriversSchema = z.object({
  body: z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format').optional().nullable(),
    vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID format').optional().nullable(),
    pickuplocation: z.union([
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().optional()
      }),
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
      }),
      z.array(z.number()).length(2)
    ]).optional(),
    pickupLocation: z.union([
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().optional()
      }),
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
      }),
      z.array(z.number()).length(2)
    ]).optional(),
    distance: z.number().positive().optional().default(10)
  }).refine((data) => data.pickuplocation || data.pickupLocation, {
    message: 'pickuplocation is required with latitude and longitude',
    path: ['pickuplocation']
  })
});

