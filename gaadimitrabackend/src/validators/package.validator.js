import { z } from 'zod';

export const createPackageSchema = z.object({
  body: z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format').optional(),
    dayType: z.string({ required_error: 'Day type is required' }).min(1, 'Day type cannot be empty'),
    price: z.number({ required_error: 'Price is required' }).min(0, 'Price must be positive'),
    off: z.number().min(0, 'Discount must be positive').optional().default(0),
    badgeName: z.string().optional(),
    bedgeName: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

export const updatePackageSchema = z.object({
  params: z.object({
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid package ID format')
  }),
  body: z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format').optional(),
    dayType: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    off: z.number().min(0).optional(),
    badgeName: z.string().nullable().optional(),
    bedgeName: z.string().nullable().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

export const getPackageSchema = z.object({
  params: z.object({
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid package ID format')
  })
});

export const queryPackagesSchema = z.object({
  query: z.object({
    serviceId: z.string().optional(),
    dayType: z.string().optional(),
    isActive: z.string().optional()
  })
});

export const buyPackageSchema = z.object({
  params: z.object({
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid package ID format')
  }),
  body: z.object({
    vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID format').optional(),
    paymentMethod: z.enum(['upi', 'card', 'netbanking', 'wallet', 'cash']).optional().default('upi'),
    transactionId: z.string().optional()
  }).optional()
});
