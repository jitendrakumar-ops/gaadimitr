import BookingService from '../services/booking.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';

export const createBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.createBooking(req.user.id, req.body);
    return sendCreated(res, 'Booking requested successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await BookingService.getBookingById(
      bookingId
    );
    return sendSuccess(res, 'Booking retrieved successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const listBookings = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    const filter = { page, limit, status, search };
    if (req.user.role === 'driver') {
      filter.driverId = req.driver?._id;
    } else if (req.user.role === 'admin') {
      if (req.query.userId) filter.userId = req.query.userId;
      if (req.query.driverId) filter.driverId = req.query.driverId;
    } else {
      filter.userId = req.user.id;
    }

    const { items, total } = await BookingService.listBookings(filter);
    return sendPaginated(res, 'Bookings retrieved', items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getActiveBookingForUser = async (req, res, next) => {
  try {
    const booking = await BookingService.getActiveBookingForUser(req.user.id);
    return sendSuccess(res, 'Active booking retrieved successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const getActiveBookingForDriver = async (req, res, next) => {
  try {
    const booking = await BookingService.getActiveBookingForDriver(req.driver._id);
    return sendSuccess(res, 'Active ride retrieved successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const acceptBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await BookingService.acceptBooking(bookingId, req.driver._id);
    return sendSuccess(res, 'Booking accepted successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const rejectBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body || {};
    const booking = await BookingService.rejectBooking(bookingId, req.driver._id, reason);
    return sendSuccess(res, 'Booking rejected', booking);
  } catch (error) {
    next(error);
  }
};

export const driverArriving = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await BookingService.driverArriving(bookingId, req.driver._id);
    return sendSuccess(res, 'Driver marked as arriving', booking);
  } catch (error) {
    next(error);
  }
};

export const driverArrived = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await BookingService.driverArrived(bookingId, req.driver._id);
    return sendSuccess(res, 'Driver marked as arrived at pickup', booking);
  } catch (error) {
    next(error);
  }
};

export const startTrip = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await BookingService.startTrip(bookingId, req.driver._id);
    return sendSuccess(res, 'Trip started successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const completeTrip = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await BookingService.completeTrip(bookingId, req.driver._id);
    return sendSuccess(res, 'Trip completed successfully', booking);
  } catch (error) {
    next(error);
  }
};

export const getBookingSummary = async (req, res, next) => {
  try {
    const range = req.query.range || 'today';
    const summary = await BookingService.getDriverBookingSummary({
      driverId: req.driver?._id || req.user?._id,
      range
    });
    return sendSuccess(res, 'Booking summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body || {};
    const booking = await BookingService.cancelBooking(
      bookingId,
      req.user.id,
      req.user.role,
      reason
    );
    return sendSuccess(res, 'Booking cancelled', booking);
  } catch (error) {
    next(error);
  }
};

export default {
  createBooking,
  getBooking,
  listBookings,
  getActiveBookingForUser,
  getActiveBookingForDriver,
  acceptBooking,
  rejectBooking,
  driverArriving,
  driverArrived,
  startTrip,
  completeTrip,
  getBookingSummary,
  cancelBooking
};
