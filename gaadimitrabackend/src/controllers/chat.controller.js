import ChatService from '../services/chat.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getMessages = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;

    const data = await ChatService.getMessages(bookingId, req.user.id, page, limit);
    return sendSuccess(res, 'Messages retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    const file = req.file;

    const message = await ChatService.sendMessage({
      bookingId,
      senderId: req.user.id,
      senderRole: req.user.role,
      content,
      file
    });

    return sendCreated(res, 'Message sent successfully', message);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    await ChatService.markAsRead(bookingId, req.user.id);
    return sendSuccess(res, 'Messages marked as read', null);
  } catch (error) {
    next(error);
  }
};

export default { getMessages, sendMessage, markAsRead };
