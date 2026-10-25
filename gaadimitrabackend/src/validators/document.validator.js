import { z } from 'zod';

export const updateDocumentsSchema = z.object({
  body: z.object({
    drivingLicense: z
      .object({
        dlNo: z.string().optional(),
        dlType: z.string().optional(),
        frontPhoto: z.string().optional(),
        backPhoto: z.string().optional()
      })
      .optional(),
    rc: z
      .object({
        rcNo: z.string().optional(),
        frontPhoto: z.string().optional(),
        backPhoto: z.string().optional()
      })
      .optional(),
    insurance: z
      .object({
        insuranceNo: z.string().optional(),
        photo: z.string().optional()
      })
      .optional(),
    permit: z
      .object({
        permitNo: z.string().optional(),
        type: z.string().optional(),
        photo: z.string().optional()
      })
      .optional(),
    aadharCard: z
      .object({
        cardNo: z.string().optional(),
        frontPhoto: z.string().optional(),
        backPhoto: z.string().optional()
      })
      .optional()
  })
});

export const updateSpecificDocumentSchema = z.object({
  params: z.object({
    docType: z.enum(['drivingLicense', 'rc', 'insurance', 'permit', 'aadharCard', 'aadhar'])
  }),
  body: z.object({
    // drivingLicense fields
    dlNo: z.string().optional(),
    dlType: z.string().optional(),
    // rc fields
    rcNo: z.string().optional(),
    // insurance fields
    insuranceNo: z.string().optional(),
    // permit fields
    permitNo: z.string().optional(),
    type: z.string().optional(),
    // aadharCard fields
    cardNo: z.string().optional(),
    // common photo fields
    photo: z.string().optional(),
    frontPhoto: z.string().optional(),
    backPhoto: z.string().optional()
  })
});

export const verifyDocumentSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
    rejectionReason: z.string().optional(),
    itemVerifications: z
      .object({
        drivingLicense: z.boolean().optional(),
        rc: z.boolean().optional(),
        insurance: z.boolean().optional(),
        permit: z.boolean().optional(),
        aadharCard: z.boolean().optional()
      })
      .optional()
  })
});
