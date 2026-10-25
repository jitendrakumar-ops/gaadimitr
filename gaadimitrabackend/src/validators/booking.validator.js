import { z } from 'zod';

const locationObjectSchema = z.object({
  type: z.literal('Point').default('Point').optional(),
  coordinates: z.array(z.number()).optional(),
  address: z.string({ required_error: 'Address string is required' }).min(1),
  title: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const createBookingSchema = z.object({
  body: z.object({
    driverId: z.string({ required_error: 'driverId is required' }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid Driver ID'),
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Service ID').optional(),
    vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Vehicle ID').optional(),
    pickupLocation: z.union([z.string(), locationObjectSchema], { required_error: 'pickupLocation is required' }),
    dropLocation: z.union([z.string(), locationObjectSchema], { required_error: 'dropLocation is required' }),
    fare: z.number().min(0).optional(),
    tokenMoney: z.number().min(0).optional(),
    paymentMethod: z.enum(['cash', 'card', 'upi', 'wallet']).default('cash')
  })
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters')
  })
});

export const bookingIdParamSchema = z.object({
  params: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Booking ID')
  })
});
