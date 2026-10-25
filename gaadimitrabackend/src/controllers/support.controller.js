import SupportService from '../services/support.service.js';
import { sendCreated, sendSuccess, sendPaginated } from '../utils/response.js';
import { AppError } from '../utils/helpers.js';

export const createSupportTicket = async (req, res, next) => {
  try {
    const { subject, message, category, priority } = req.body;
    const participantRole = req.user.role === 'driver' ? 'driver' : 'user';

    if (participantRole === 'user' && req.user.role !== 'user') {
      throw new AppError('Only users and drivers can open support tickets', 403, 'INVALID_SUPPORT_ROLE');
    }

    const data = await SupportService.createTicket({
      participantId: req.user.id,
      participantRole,
      subject,
      message,
      category,
      priority
    });

    return sendCreated(res, 'Support ticket created successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportService.getTicketsForUser(req.user.id, req.user.role);
    return sendSuccess(res, 'Support tickets retrieved successfully', tickets);
  } catch (error) {
    next(error);
  }
};

export const getSupportTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportService.getTicketById(ticketId, req.user.id, req.user.role);
    return sendSuccess(res, 'Support ticket retrieved successfully', ticket);
  } catch (error) {
    next(error);
  }
};

export const addSupportMessage = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const messageData = await SupportService.addMessage({
      ticketId,
      senderId: req.user.id,
      senderRole: req.user.role,
      message
    });

    return sendCreated(res, 'Support message sent successfully', messageData);
  } catch (error) {
    next(error);
  }
};

export const adminGetAllTickets = async (req, res, next) => {
  try {
    const { status, category, priority, participantRole, search, page, limit } = req.query;
    const { tickets, total, page: pageNum, limit: limitNum } = await SupportService.adminGetAllTickets({
      status,
      category,
      priority,
      participantRole,
      search,
      page,
      limit
    });
    return sendPaginated(res, 'Support tickets fetched successfully', tickets, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

export const adminReplyToTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const messageData = await SupportService.addMessage({
      ticketId,
      senderId: req.user.id,
      senderRole: 'admin',
      message
    });
    return sendCreated(res, 'Reply sent successfully', messageData);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const ticket = await SupportService.adminUpdateStatus(ticketId, status, req.user.id);
    return sendSuccess(res, 'Ticket status updated successfully', ticket);
  } catch (error) {
    next(error);
  }
};

export const adminDeleteTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    await SupportService.adminDeleteTicket(ticketId);
    return sendSuccess(res, 'Support ticket deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export default {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketById,
  addSupportMessage,
  adminGetAllTickets,
  adminReplyToTicket,
  adminUpdateTicketStatus,
  adminDeleteTicket
};
