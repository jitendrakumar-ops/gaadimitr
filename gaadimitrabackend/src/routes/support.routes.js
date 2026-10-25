import { Router } from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketById,
  addSupportMessage,
  adminGetAllTickets,
  adminReplyToTicket,
  adminUpdateTicketStatus,
  adminDeleteTicket
} from '../controllers/support.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createSupportTicketSchema,
  addSupportMessageSchema,
  adminUpdateStatusSchema,
  adminListTicketsSchema
} from '../validators/support.validator.js';

const router = Router();

router.use(authenticate);

router.post('/tickets', validate(createSupportTicketSchema), createSupportTicket);
router.get('/tickets', getSupportTickets);
router.get('/tickets/:ticketId', getSupportTicketById);
router.post('/tickets/:ticketId/messages', validate(addSupportMessageSchema), addSupportMessage);

router.get('/admin/tickets', requireAdmin, validate(adminListTicketsSchema), adminGetAllTickets);
router.post('/admin/tickets/:ticketId/reply', requireAdmin, validate(addSupportMessageSchema), adminReplyToTicket);
router.patch('/admin/tickets/:ticketId/status', requireAdmin, validate(adminUpdateStatusSchema), adminUpdateTicketStatus);
router.delete('/admin/tickets/:ticketId', requireAdmin, adminDeleteTicket);

export default router;
