import { z } from 'zod';

export const createSupportTicketSchema = z.object({
  body: z.object({
    subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200, 'Subject too long'),
    message: z.string().trim().min(3, 'Message must be at least 3 characters'),
    category: z.enum(['account', 'booking', 'payment', 'driver', 'vehicle', 'technical', 'other']).optional().default('other'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium')
  })
});

export const addSupportMessageSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, 'Message is required')
  })
});

// Admin schemas
export const adminUpdateStatusSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required')
  }),
  body: z.object({
    status: z.enum(['open', 'pending', 'resolved', 'closed'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be one of: open, pending, resolved, closed'
    })
  })
});

export const adminListTicketsSchema = z.object({
  query: z.object({
    status:          z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
    category:        z.enum(['account', 'booking', 'payment', 'driver', 'vehicle', 'technical', 'other']).optional(),
    priority:        z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    participantRole: z.enum(['user', 'driver']).optional(),
    search:          z.string().trim().optional(),
    page:            z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit:           z.string().regex(/^\d+$/, 'Limit must be a number').optional()
  })
});

