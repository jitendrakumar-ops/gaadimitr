import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { registerBookingSocketHandlers } from './booking.socket.js';
import { registerLocationSocketHandlers } from './location.socket.js';
import { setBookingSocketEmitter } from '../services/booking.service.js';
import { setChatSocketEmitter } from '../services/chat.service.js';
import logger from '../utils/logger.js';

let ioInstance = null;

export const initSocketIO = (httpServer) => {
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000
  });

  // JWT Socket Handshake Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).lean();

      if (!user || !user.isActive || user.isBlocked) {
        return next(new Error('Authentication error: User not active or unauthorized'));
      }

      socket.user = {
        id: user._id.toString(),
        phone: user.phone,
        role: user.role
      };

      // If driver, attach driverId
      if (user.role === 'driver') {
        const driver = await Driver.findOne({ userId: user._id }).lean();
        if (driver) {
          socket.driverId = driver._id.toString();
        }
      }

      next();
    } catch (err) {
      logger.error({ err: err.message }, 'Socket authentication error');
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(
      { socketId: socket.id, userId: socket.user.id, role: socket.user.role },
      'Socket client connected'
    );

    // 1. Join personal user room
    socket.join(`user:${socket.user.id}`);

    // 2. If driver, join driver room
    if (socket.driverId) {
      socket.join(`driver:${socket.driverId}`);
      logger.debug({ driverId: socket.driverId }, 'Joined driver socket room');
    }

    // 3. Register modular socket handlers
    registerBookingSocketHandlers(io, socket);
    registerLocationSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, userId: socket.user.id, reason }, 'Socket disconnected');
    });
  });

  ioInstance = io;

  // Socket Dispatcher Interface for Services
  const socketEmitter = {
    emitToUser: (userId, event, data) => {
      io.to(`user:${userId}`).emit(event, data);
    },
    emitToDriver: (driverId, event, data) => {
      io.to(`driver:${driverId}`).emit(event, data);
    },
    emitToBooking: (bookingId, event, data) => {
      io.to(`booking:${bookingId}`).emit(event, data);
    }
  };

  // Wire up emitters to services
  setBookingSocketEmitter(socketEmitter);
  setChatSocketEmitter(socketEmitter);

  return io;
};

export const getSocketIO = () => {
  return ioInstance;
};

export default { initSocketIO, getSocketIO };
