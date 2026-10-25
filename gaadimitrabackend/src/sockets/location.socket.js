import DriverService from '../services/driver.service.js';
import logger from '../utils/logger.js';

export const registerLocationSocketHandlers = (io, socket) => {
  // 1. Driver Location Updates
  socket.on('driver:location:update', async (data) => {
    try {
      if (socket.user.role !== 'driver' || !socket.driverId) {
        return socket.emit('error', { message: 'Only authorized drivers can broadcast location' });
      }

      const { latitude, longitude, heading, bookingId } = data || {};

      // Validate coordinate bounds
      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return socket.emit('error', { message: 'Invalid GPS coordinates' });
      }

      // Fast update in Redis (non-blocking for socket tick)
      await DriverService.updateLocation(socket.driverId, {
        latitude,
        longitude,
        heading: heading || 0
      });

      const locationPayload = {
        driverId: socket.driverId,
        latitude,
        longitude,
        heading: heading || 0,
        timestamp: Date.now()
      };

      // Broadcast to active booking room if ride is ongoing
      if (bookingId) {
        io.to(`booking:${bookingId}`).emit('driver:location:update', locationPayload);
      }
    } catch (err) {
      logger.error({ err: err.message, socketId: socket.id }, 'Error processing location update socket event');
    }
  });

  // 2. Driver Online/Offline Quick Toggles
  socket.on('driver:online', async () => {
    try {
      if (socket.user.role === 'driver' && socket.driverId) {
        await DriverService.updateStatus(socket.driverId, 'online');
        socket.emit('driver:status', { status: 'online' });
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('driver:offline', async () => {
    try {
      if (socket.user.role === 'driver' && socket.driverId) {
        await DriverService.updateStatus(socket.driverId, 'offline');
        socket.emit('driver:status', { status: 'offline' });
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
};

export default registerLocationSocketHandlers;
