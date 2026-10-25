import { z } from 'zod';

const optionalObjectId = z
  .union([z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format'), z.literal(''), z.null()])
  .optional()
  .transform((val) => (val === '' ? null : val));

export const createVehicleSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Vehicle title is required' }).min(1, 'Vehicle title cannot be empty'),
    serviceId: optionalObjectId,
    image: z.string().nullable().optional(),

    type: z.string({ required_error: 'Vehicle type is required' }).min(1, 'Vehicle type cannot be empty'),
    fee: z.coerce.number({ required_error: 'Fee is required' }).min(0, 'Fee must be positive'),
    platformCharge: z.coerce.number().min(0, 'Platform charge must be positive').optional().default(0),
    isActive: z.preprocess(
      (val) => (val === 'true' ? true : val === 'false' ? false : val),
      z.boolean().optional().default(true)
    )
  })
});

export const updateVehicleSchema = z.object({
  params: z.object({
    vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID format')
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    serviceId: optionalObjectId,
    image: z.string().nullable().optional(),
    seat: z.coerce.number().min(1).optional(),
    type: z.string().min(1).optional(),
    fee: z.coerce.number().min(0).optional(),
    platformCharge: z.coerce.number().min(0).optional(),
    isActive: z.preprocess(
      (val) => (val === 'true' ? true : val === 'false' ? false : val),
      z.boolean().optional()
    )
  })
});

export const getVehicleSchema = z.object({
  params: z.object({
    vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID format')
  })
});

export const queryVehiclesSchema = z.object({
  query: z.object({
    serviceId: z.string().optional(),
    type:      z.string().optional(),
    isActive:  z.string().optional(),
    page:      z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit:     z.string().regex(/^\d+$/, 'Limit must be a number').optional()
  })
});
