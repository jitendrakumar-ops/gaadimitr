import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { AppError } from '../utils/helpers.js';

const isValidSupportParticipant = (role) => ['user', 'driver'].includes(role);

export class SupportService {
  static async createTicket({ participantId, participantRole, subject, message, category = 'other', priority = 'medium' }) {
    if (!participantId) {
      throw new AppError('Participant is required', 400, 'PARTICIPANT_REQUIRED');
    }

    if (!isValidSupportParticipant(participantRole)) {
      throw new AppError('Only users and drivers can open support tickets', 403, 'INVALID_SUPPORT_ROLE');
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (participant.role !== participantRole) {
      throw new AppError('Participant role does not match the authenticated account', 400, 'INVALID_PARTICIPANT_ROLE');
    }

    let driverId = null;
    if (participantRole === 'driver') {
      const driver = await Driver.findOne({ userId: participantId });
      if (!driver) {
        throw new AppError('Driver profile not found. Please complete onboarding first.', 404, 'DRIVER_NOT_FOUND');
      }
      driverId = driver._id;
    }

    const cleanSubject = subject?.trim();
    const cleanMessage = message?.trim();

    if (!cleanSubject || cleanSubject.length < 3) {
      throw new AppError('Support subject is required', 400, 'INVALID_SUBJECT');
    }

    if (!cleanMessage || cleanMessage.length < 3) {
      throw new AppError('Support message is required', 400, 'INVALID_MESSAGE');
    }

    const ticket = await SupportTicket.create({
      participantId,
      participantRole,
      driverId,
      subject: cleanSubject,
      category,
      priority,
      lastMessage: cleanMessage,
      lastMessageAt: new Date(),
      status: 'open',
      messages: [{
        senderId: participantId,
        senderRole: participantRole,
        content: cleanMessage,
        type: 'text'
      }]
    });

    return ticket.toJSON();
  }

  static async getTicketsForUser(viewerId, viewerRole) {
    const filter = viewerRole === 'admin'
      ? {}
      : { participantId: viewerId, participantRole: viewerRole };

    const tickets = await SupportTicket.find(filter).sort({ updatedAt: -1 }).lean();

    return tickets.map((ticket) => ({
      ...ticket,
      id: ticket._id,
      messages: ticket.messages || []
    }));
  }

  static async getTicketById(ticketId, viewerId, viewerRole) {
    const ticket = await SupportTicket.findById(ticketId).lean();
    if (!ticket) {
      throw new AppError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
    }

    const isParticipant = ticket.participantId.toString() === viewerId.toString();
    if (viewerRole !== 'admin' && !isParticipant) {
      throw new AppError('You are not allowed to access this support ticket', 403, 'FORBIDDEN');
    }

    return {
      ...ticket,
      id: ticket._id,
      messages: ticket.messages || []
    };
  }

  static async addMessage({ ticketId, senderId, senderRole, message }) {
    const cleanMessage = message?.trim();
    if (!cleanMessage || cleanMessage.length < 1) {
      throw new AppError('Message content is required', 400, 'INVALID_MESSAGE');
    }

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket || !ticket.isActive) {
      throw new AppError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
    }

    const isAdmin = senderRole === 'admin';
    const isParticipant = ticket.participantId.toString() === senderId.toString() && ticket.participantRole === senderRole;

    if (!isAdmin && !isParticipant) {
      throw new AppError('You are not allowed to reply in this support ticket', 403, 'FORBIDDEN');
    }

    const newMessage = {
      senderId,
      senderRole,
      content: cleanMessage,
      type: 'text'
    };

    ticket.messages.push(newMessage);
    ticket.lastMessage = cleanMessage;
    ticket.lastMessageAt = new Date();
    ticket.status = isAdmin ? 'pending' : 'open';

    await ticket.save();
    return { ...newMessage, createdAt: new Date(), updatedAt: new Date() };
  }

  static async adminGetAllTickets({ status, category, priority, participantRole, search, page = 1, limit = 20 }) {
    const filter = {};

    if (status)          filter.status          = status;
    if (category)        filter.category        = category;
    if (priority)        filter.priority        = priority;
    if (participantRole) filter.participantRole = participantRole;

    if (search) {
      filter.subject = { $regex: search, $options: 'i' };
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate('participantId', 'name phone email profileImage role')
        .populate('adminAssigned', 'name phone')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SupportTicket.countDocuments(filter)
    ]);

    return { tickets, total, page: pageNum, limit: limitNum };
  }

  static async adminUpdateStatus(ticketId, status, adminId) {
    const allowed = ['open', 'pending', 'resolved', 'closed'];
    if (!allowed.includes(status)) {
      throw new AppError(`Status must be one of: ${allowed.join(', ')}`, 400, 'INVALID_STATUS');
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status, adminAssigned: adminId },
      { new: true, runValidators: true }
    ).populate('participantId', 'name phone email profileImage');

    if (!ticket) {
      throw new AppError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
    }

    return ticket;
  }

  static async adminDeleteTicket(ticketId) {
    const ticket = await SupportTicket.findById(ticketId).lean();
    if (!ticket) {
      throw new AppError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
    }

    await SupportTicket.findByIdAndDelete(ticketId);
    return { deletedId: ticketId };
  }
}

export default SupportService;
