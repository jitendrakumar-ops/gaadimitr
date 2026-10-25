import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import S3Service from './s3.service.js';
import NotificationService from './notification.service.js';
import { AppError } from '../utils/helpers.js';

let socketEmitter = null;
export const setChatSocketEmitter = (emitter) => {
  socketEmitter = emitter;
};

export class ChatService {
  /**
   * Find or initialize a chat for a specific booking
   */
  static async getOrCreateChat(bookingId, requestingUserId) {
    const booking = await Booking.findById(bookingId).populate('driverId');
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const driverUserId = booking.driverId.userId.toString();
    const passengerUserId = booking.userId.toString();

    if (requestingUserId.toString() !== driverUserId && requestingUserId.toString() !== passengerUserId) {
      throw new AppError('Unauthorized to access this chat', 403, 'FORBIDDEN');
    }

    let chat = await Chat.findOne({ bookingId });
    if (!chat) {
      chat = await Chat.create({
        bookingId: booking._id,
        userId: booking.userId,
        driverId: booking.driverId._id
      });
    }

    return chat;
  }

  /**
   * Send a message (text or media) within a booking's chat
   */
  static async sendMessage({ bookingId, senderId, senderRole, content, file }) {
    const booking = await Booking.findById(bookingId).populate('driverId');
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const isPassenger = booking.userId.toString() === senderId.toString();
    const isDriver = booking.driverId.userId.toString() === senderId.toString();

    if (!isPassenger && !isDriver) {
      throw new AppError('You are not a participant in this booking', 403, 'FORBIDDEN');
    }

    const receiverId = isPassenger ? booking.driverId.userId : booking.userId;

    let chat = await Chat.findOne({ bookingId });
    if (!chat) {
      chat = await Chat.create({
        bookingId: booking._id,
        userId: booking.userId,
        driverId: booking.driverId._id
      });
    }

    // Media upload if file provided
    let mediaUrl = null;
    let messageType = 'text';

    if (file) {
      const uploadResult = await S3Service.uploadFile(file, 'chat');
      mediaUrl = uploadResult.url;
      messageType = file.mimetype.startsWith('image/') ? 'image' : 'file';
    }

    const message = await Message.create({
      chatId: chat._id,
      bookingId: booking._id,
      senderId,
      senderRole,
      receiverId,
      type: messageType,
      content: content || (messageType === 'image' ? 'Sent an image' : 'Sent a file'),
      mediaUrl,
      status: 'sent'
    });

    // Update chat last message
    chat.lastMessage = message.content;
    chat.lastMessageAt = new Date();
    if (isPassenger) {
      chat.unreadCountDriver += 1;
    } else {
      chat.unreadCountUser += 1;
    }
    await chat.save();

    // Real-time socket emission
    if (socketEmitter) {
      socketEmitter.emitToUser(receiverId.toString(), 'chat:message', {
        messageId: message._id,
        bookingId,
        senderId,
        content: message.content,
        mediaUrl: message.mediaUrl,
        type: message.type,
        createdAt: message.createdAt
      });
    }

    // Push notification
    await NotificationService.sendPushNotification(receiverId, {
      title: 'New Message',
      body: message.content.slice(0, 100),
      type: 'new_message',
      data: {
        bookingId: booking._id.toString(),
        chatId: chat._id.toString()
      }
    });

    return message;
  }

  /**
   * Get chat messages history with pagination
   */
  static async getMessages(bookingId, requestingUserId, page = 1, limit = 30) {
    const chat = await this.getOrCreateChat(bookingId, requestingUserId);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ chatId: chat._id })
    ]);

    return {
      messages: messages.reverse(), // chronologically ascending for UI chat
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(bookingId, readerUserId) {
    const chat = await Chat.findOne({ bookingId });
    if (!chat) return;

    await Message.updateMany(
      {
        chatId: chat._id,
        receiverId: readerUserId,
        status: { $ne: 'read' }
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );

    const isPassenger = chat.userId.toString() === readerUserId.toString();
    if (isPassenger) {
      chat.unreadCountUser = 0;
    } else {
      chat.unreadCountDriver = 0;
    }
    await chat.save();

    // Socket read receipt
    if (socketEmitter) {
      const otherUserId = isPassenger ? chat.driverId : chat.userId;
      socketEmitter.emitToUser(otherUserId.toString(), 'chat:read', {
        bookingId,
        readBy: readerUserId
      });
    }

    return true;
  }
}

export default ChatService;
