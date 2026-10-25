import { z } from 'zod';

const booleanPreprocess = z.preprocess((val) => {
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return val;
}, z.boolean().optional());

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Service title is required' }).min(1, 'Service title cannot be empty'),
    image: z.string().nullable().optional(),
    description: z.string().optional(),
    isActive: booleanPreprocess
  })
});

export const updateServiceSchema = z.object({
  params: z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format')
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    image: z.string().nullable().optional(),
    description: z.string().optional(),
    isActive: booleanPreprocess
  })
});

export const getServiceSchema = z.object({
  params: z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID format')
  })
});

export const queryServicesSchema = z.object({
  query: z.object({
    isActive: z.string().optional(),
    search: z.string().optional()
  })
});
