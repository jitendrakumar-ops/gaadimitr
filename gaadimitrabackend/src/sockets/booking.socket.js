import logger from '../utils/logger.js';

export const registerBookingSocketHandlers = (io, socket) => {
  // Join a specific booking room to receive real-time updates for that ride
  socket.on('booking:join', ({ bookingId }) => {
    if (bookingId) {
      socket.join(`booking:${bookingId}`);
      logger.debug({ socketId: socket.id, bookingId }, 'Socket joined booking room');
    }
  });

  socket.on('booking:leave', ({ bookingId }) => {
    if (bookingId) {
      socket.leave(`booking:${bookingId}`);
      logger.debug({ socketId: socket.id, bookingId }, 'Socket left booking room');
    }
  });
};

export default registerBookingSocketHandlers;
