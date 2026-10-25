
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';

import NotificationService from './notification.service.js';
import {
  BOOKING_STATUS,
  DRIVER_ONLINE_STATUS,
  PAYMENT_STATUS,
  CANCELLED_BY,
  isValidTransition
} from '../constants/booking.js';
import {
  calculateDistanceKm,
  generateBookingNumber,
  AppError
} from '../utils/helpers.js';

// Socket event dispatcher reference (injected or imported)
let socketEmitter = null;
export const setBookingSocketEmitter = (emitter) => {
  socketEmitter = emitter;
};

// Queue scheduler reference (injected)
let bookingQueueScheduler = null;
export const setBookingQueueScheduler = (scheduler) => {
  bookingQueueScheduler = scheduler;
};

export class BookingService {
  /**
   * Create a direct booking request for a specific driver
   */
  static async createBooking(
    userId,
    {
      driverId,
      serviceId,
      vehicleId,
      pickupLocation,
      dropLocation,
      fare,
      tokenMoney=0,
      paymentMethod = 'cash'
    }
  ) {
    // 1. Check if user already has an active ongoing booking
    const existingUserBooking = await Booking.findOne({
      userId,
      status: {
        $in: [
          BOOKING_STATUS.REQUESTED,
          BOOKING_STATUS.ACCEPTED,
          BOOKING_STATUS.DRIVER_ARRIVING,
          BOOKING_STATUS.DRIVER_ARRIVED,
          BOOKING_STATUS.TRIP_STARTED
        ]
      }
    });

    if (existingUserBooking) {
      throw new AppError(
        'You already have an active booking in progress',
        409,
        'ACTIVE_BOOKING_EXISTS',
        { bookingId: existingUserBooking._id }
      );
    }

    // 2. Validate Driver Availability
    const driver = await Driver.findById(driverId).populate('vehicleId');
    if (!driver) {
      throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
    }

    // if (driver.approvalStatus && driver.approvalStatus !== DRIVER_APPROVAL_STATUS.APPROVED) {
    //   throw new AppError('Selected driver is not approved yet', 400, 'DRIVER_NOT_APPROVED');
    // }

    if (driver.onlineStatus !== DRIVER_ONLINE_STATUS.ONLINE) {
      throw new AppError(
        `Driver is currently ${driver.onlineStatus} and unavailable for booking`,
        400,
        'DRIVER_UNAVAILABLE'
      );
    }

    // Check if driver is already tied to an active booking
    const activeDriverBooking = await Booking.findOne({
      driverId,
      status: {
        $in: [
          BOOKING_STATUS.REQUESTED,
          BOOKING_STATUS.ACCEPTED,
          BOOKING_STATUS.DRIVER_ARRIVING,
          BOOKING_STATUS.DRIVER_ARRIVED,
          BOOKING_STATUS.TRIP_STARTED
        ]
      }
    });

    if (activeDriverBooking) {
      throw new AppError('Driver is currently busy with another booking', 409, 'DRIVER_BUSY');
    }

    // 3. Resolve IDs & Fare from Driver
    const finalVehicleId = vehicleId || driver.vehicleId?._id || driver.vehicleId || null;
    const finalServiceId = serviceId || driver.serviceId || driver.vehicleId?.serviceId || null;

    // 4. Format Location & Distance
    const formatLocation = (loc) => ({
      type: 'Point',
      coordinates: Array.isArray(loc?.coordinates)
        ? loc.coordinates
        : [loc?.longitude || 0, loc?.latitude || 0],
      address: loc?.address || (typeof loc === 'string' ? loc : ''),
      title: loc?.title || loc?.address || (typeof loc === 'string' ? loc : '')
    });

    const pickup = formatLocation(pickupLocation);
    const drop = formatLocation(dropLocation);

    let distanceKm = 0;
    if (pickup.coordinates[0] !== 0 && drop.coordinates[0] !== 0) {
      distanceKm = calculateDistanceKm(
        pickup.coordinates[1],
        pickup.coordinates[0],
        drop.coordinates[1],
        drop.coordinates[0]
      );
    }

    const baseDistanceFare = Number(driver.vehicleId?.fee || 0);
    const estimatedFare = Number(
      (distanceKm > 0 ? distanceKm * (baseDistanceFare || 25) : (baseDistanceFare || 25))
    );
    const bookingFare = Number(fare ?? estimatedFare);

    // Vehicle fee represents the percentage for token money (e.g. 10 means 10% of fare)
    const feePercentage = Number(driver.vehicleId?.fee || 0);
    const explicitTokenMoney = Number(tokenMoney ?? 0);

    const calculatedTokenMoney = explicitTokenMoney > 0
      ? Number(explicitTokenMoney.toFixed(2))
      : feePercentage > 0
        ? Number(((bookingFare * feePercentage) / 100).toFixed(2))
        : 0;

    // 5. Create Booking
    const booking = await Booking.create({
      bookingNumber: generateBookingNumber(),
      serviceId: finalServiceId,
      userId,
      driverId: driver._id,
      vehicleId: finalVehicleId,
      pickupLocation: pickup,
      dropLocation: drop,
      distance: distanceKm,
      fare: bookingFare,
      tokenMoney: calculatedTokenMoney,
      status: BOOKING_STATUS.REQUESTED,
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod
    });

    // 6. Notify Driver via Socket.IO
    if (socketEmitter) {
      socketEmitter.emitToDriver(driver._id.toString(), 'booking:request', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        serviceId: booking.serviceId,
        vehicleId: booking.vehicleId,
        pickupLocation: booking.pickupLocation,
        dropLocation: booking.dropLocation,
        distance: booking.distance,
        fare: booking.fare,
        tokenMoney: booking.tokenMoney,
        userId
      });
    }

    // 7. Send Push Notification to Driver via FCM

    await NotificationService.sendPushNotification(driver.userId, {
      title: 'New Ride Request!',
      body: `Pickup from ${pickup.address}. Estimated fare: ₹${booking.fare}`,
      type: 'booking_request',
      data: {
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingNumber
      }
    });


    return booking;
  }


  static async acceptBooking(bookingId, driverId) {
    // Atomic update to ensure no race condition on status
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        driverId,
        status: BOOKING_STATUS.REQUESTED
      },
      {
        $set: {
          status: BOOKING_STATUS.ACCEPTED,
          acceptedAt: new Date()
        }
      },
      { new: true }
    ).populate('userId', 'name phone profileImage');

    if (!booking) {
      // Check why it failed
      const existing = await Booking.findById(bookingId);
      if (!existing) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      if (existing.driverId.toString() !== driverId.toString()) {
        throw new AppError('This booking was not assigned to you', 403, 'FORBIDDEN');
      }
      throw new AppError(
        `Cannot accept booking. Current status is ${existing.status}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Mark driver as busy
    await Driver.findByIdAndUpdate(driverId, { onlineStatus: DRIVER_ONLINE_STATUS.BUSY });

    // Real-time Socket.IO emission to User
    if (socketEmitter) {
      socketEmitter.emitToUser(booking.userId._id.toString(), 'booking:accepted', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        driverId
      });
    }

    // Push notification to User
    await NotificationService.sendPushNotification(booking.userId._id, {
      title: 'Booking Accepted!',
      body: 'Your driver has accepted the ride and is on the way.',
      type: 'booking_accepted',
      data: { bookingId: booking._id.toString() }
    });

    return booking;
  }

  /**
   * Driver rejects a requested booking
   */
  static async rejectBooking(bookingId, driverId, reason = 'Driver declined request') {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        driverId,
        status: BOOKING_STATUS.REQUESTED
      },
      {
        $set: {
          status: BOOKING_STATUS.REJECTED,
          cancellationReason: reason,
          cancelledAt: new Date()
        }
      },
      { new: true }
    );

    if (!booking) {
      throw new AppError(
        'Cannot reject booking. Booking does not exist or has already been updated.',
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Ensure driver is back to online
    await Driver.findByIdAndUpdate(driverId, { onlineStatus: DRIVER_ONLINE_STATUS.ONLINE });

    // Notify User
    if (socketEmitter) {
      socketEmitter.emitToUser(booking.userId.toString(), 'booking:rejected', {
        bookingId: booking._id,
        reason
      });
    }

    await NotificationService.sendPushNotification(booking.userId, {
      title: 'Booking Rejected',
      body: 'The driver was unable to accept your request. Please choose another driver.',
      type: 'booking_rejected',
      data: { bookingId: booking._id.toString() }
    });

    return booking;
  }

  /**
   * Driver marks status as arriving at pickup
   */
  static async driverArriving(bookingId, driverId) {
    return await this.updateBookingStatus(bookingId, driverId, BOOKING_STATUS.DRIVER_ARRIVING, {
      socketEvent: 'driver:arriving',
      userTitle: 'Driver on the way',
      userBody: 'Your driver is heading towards your pickup location.'
    });
  }

  /**
   * Driver marks arrival at pickup location
   */
  static async driverArrived(bookingId, driverId) {
    return await this.updateBookingStatus(
      bookingId,
      driverId,
      BOOKING_STATUS.DRIVER_ARRIVED,
      {
        socketEvent: 'driver:arrived',
        userTitle: 'Driver Arrived!',
        userBody: 'Your driver has arrived at the pickup location.',
        extraFields: { driverArrivedAt: new Date() }
      }
    );
  }

  /**
   * Driver starts the trip
   */
  static async startTrip(bookingId, driverId) {
    return await this.updateBookingStatus(bookingId, driverId, BOOKING_STATUS.TRIP_STARTED, {
      socketEvent: 'trip:started',
      userTitle: 'Trip Started',
      userBody: 'Have a safe journey! Your ride has officially started.',
      extraFields: { startedAt: new Date() }
    });
  }

  /**
   * Driver completes the trip
   */
  static async completeTrip(bookingId, driverId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    if (booking.driverId.toString() !== driverId.toString()) {
      throw new AppError('Unauthorized driver for this booking', 403, 'FORBIDDEN');
    }

    if (!isValidTransition(booking.status, BOOKING_STATUS.TRIP_COMPLETED)) {
      throw new AppError(
        `Invalid status transition from ${booking.status} to tripCompleted`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    booking.status = BOOKING_STATUS.TRIP_COMPLETED;
    booking.completedAt = new Date();
    booking.paymentStatus = PAYMENT_STATUS.PAID;
    await booking.save();


    // Update driver: set to online, increment completed rides and earnings
    await Driver.findByIdAndUpdate(driverId, {
      onlineStatus: DRIVER_ONLINE_STATUS.ONLINE,

    });

    // Real-time socket event
    if (socketEmitter) {
      socketEmitter.emitToUser(booking.userId.toString(), 'trip:completed', {
        bookingId: booking._id,
        fare: booking.fare
      });
    }

    // Push notification
    await NotificationService.sendPushNotification(booking.userId, {
      title: 'Trip Completed!',
      body: `You have reached your destination. Total fare: ₹${booking.fare}`,
      type: 'trip_completed',
      data: {
        bookingId: booking._id.toString(),
        totalFare: (booking.fare || 0).toString()
      }
    });

    return booking;
  }

  static async updateBookingStatus(bookingId, driverId, targetStatus, { socketEvent, userTitle, userBody, extraFields = {} }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    if (booking.driverId.toString() !== driverId.toString()) {
      throw new AppError('Unauthorized driver for this booking', 403, 'FORBIDDEN');
    }

    if (!isValidTransition(booking.status, targetStatus)) {
      throw new AppError(
        `Invalid status transition from ${booking.status} to ${targetStatus}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    booking.status = targetStatus;
    Object.assign(booking, extraFields);
    await booking.save();

    // Socket
    if (socketEmitter && socketEvent) {
      socketEmitter.emitToUser(booking.userId.toString(), socketEvent, {
        bookingId: booking._id,
        status: targetStatus
      });
    }

    // Push
    if (userTitle && userBody) {
      await NotificationService.sendPushNotification(booking.userId, {
        title: userTitle,
        body: userBody,
        type: socketEvent.replace(':', '_'),
        data: { bookingId: booking._id.toString() }
      });
    }

    return booking;
  }


  static async cancelBooking(bookingId, actorId, actorRole, reason = '') {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    // Terminal states cannot be cancelled
    if ([BOOKING_STATUS.TRIP_COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.EXPIRED].includes(booking.status)) {
      throw new AppError(`Cannot cancel booking with current status: ${booking.status}`, 400, 'CANNOT_CANCEL');
    }

    let cancelledBy = CANCELLED_BY.USER;
    let recipientUserId = null;

    if (actorRole === 'driver') {
      const driver = await Driver.findOne({ userId: actorId });
      if (!driver || booking.driverId.toString() !== driver._id.toString()) {
        throw new AppError('Unauthorized to cancel this booking', 403, 'FORBIDDEN');
      }
      cancelledBy = CANCELLED_BY.DRIVER;
      recipientUserId = booking.userId;
    } else if (actorRole === 'admin') {
      cancelledBy = CANCELLED_BY.ADMIN;
      recipientUserId = booking.userId;
    } else {
      if (booking.userId.toString() !== actorId.toString()) {
        throw new AppError('Unauthorized to cancel this booking', 403, 'FORBIDDEN');
      }
      cancelledBy = CANCELLED_BY.USER;
      // Driver's user account is the notification recipient
      const driverDoc = await Driver.findById(booking.driverId).select('userId').lean();
      recipientUserId = driverDoc?.userId;
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancellationReason = reason || 'Cancelled by ' + cancelledBy;
    booking.cancelledAt = new Date();
    await booking.save();

    // Free the driver back to online
    await Driver.findByIdAndUpdate(booking.driverId, { onlineStatus: DRIVER_ONLINE_STATUS.ONLINE });

    // Real-time Socket Event to both sides
    if (socketEmitter) {
      socketEmitter.emitToUser(booking.userId.toString(), 'booking:cancelled', {
        bookingId: booking._id,
        cancelledBy,
        reason
      });
      socketEmitter.emitToDriver(booking.driverId.toString(), 'booking:cancelled', {
        bookingId: booking._id,
        cancelledBy,
        reason
      });
    }

    // Push notification to the other party
    if (recipientUserId) {
      await NotificationService.sendPushNotification(recipientUserId, {
        title: 'Booking Cancelled',
        body: `Ride ${booking.bookingNumber} was cancelled by ${cancelledBy}.`,
        type: 'booking_cancelled',
        data: { bookingId: booking._id.toString() }
      });
    }

    return booking;
  }

  static async expireBooking(bookingId) {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: BOOKING_STATUS.REQUESTED
      },
      {
        $set: {
          status: BOOKING_STATUS.EXPIRED,
          cancellationReason: 'Driver did not respond within time limit',
          cancelledAt: new Date()
        }
      },
      { new: true }
    );

    if (!booking) return null; // Already accepted or processed

    // Notify User
    if (socketEmitter) {
      socketEmitter.emitToUser(booking.userId.toString(), 'booking:rejected', {
        bookingId: booking._id,
        reason: 'Booking request timed out. Please try another driver.'
      });
    }

    await NotificationService.sendPushNotification(booking.userId, {
      title: 'Booking Expired',
      body: 'Driver did not accept the request in time. Please choose another driver.',
      type: 'booking_rejected',
      data: { bookingId: booking._id.toString() }
    });

    return booking;
  }

  /**
   * Get booking by ID with details
   */
  static async getBookingById(bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name phone profileImage')
      .populate('serviceId', 'title image description')
      .populate('vehicleId', 'title type image fee platformCharge seat')
      .populate({
        path: 'driverId',
        select: 'name phone profileImage rating vehicleId currentLocation vehicleModel vehicleNo',
       
      })
      .lean();

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }



    return booking;
  }

  /**
   * Return the single most recent booking for a user that is not completed or cancelled.
   * This endpoint is user-scoped and intentionally returns one document only.
   */
  static async getActiveBookingForUser(userId) {
    const booking = await Booking.findOne({
      userId,
      status: {
        $nin: [BOOKING_STATUS.TRIP_COMPLETED, BOOKING_STATUS.CANCELLED]
      }
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone profileImage')
      .populate('serviceId', 'title image description')
      .populate('vehicleId', 'title type image fee platformCharge seat')
      .populate({
        path: 'driverId',
       
        populate: { path: 'vehicleId' }
      })
      .lean();

    if (!booking) {
      throw new AppError('No active booking found for this user', 404, 'BOOKING_NOT_FOUND');
    }

    return booking;
  }

  static async getActiveBookingForDriver(driverId) {
    const booking = await Booking.findOne({
      driverId,
      status: {
        $nin: [
          BOOKING_STATUS.TRIP_COMPLETED,
          BOOKING_STATUS.CANCELLED,
          BOOKING_STATUS.REJECTED,
          BOOKING_STATUS.EXPIRED
        ]
      }
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone profileImage')
      .populate('serviceId', 'title image description')
      .populate('vehicleId', 'title type image fee platformCharge seat')
      .populate({
        path: 'driverId',
        populate: { path: 'vehicleId' }
      })
      .lean();

    if (!booking) {
      throw new AppError('No active ride found for this driver', 404, 'BOOKING_NOT_FOUND');
    }

    return booking;
  }

  /**
   * List bookings for user or driver with pagination
   */
  static async listBookings({ userId, driverId, status, page = 1, limit = 10, search }) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (driverId) filter.driverId = driverId;
    if (status && status !== 'all') filter.status = status;

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      const orConditions = [
        { bookingNumber: regex },
        { 'pickupLocation.address': regex },
        { 'dropLocation.address': regex },
        { 'pickupLocation.title': regex },
        { 'dropLocation.title': regex },
        { cancellationReason: regex },
        { paymentMethod: regex }
      ];

      try {
        const [matchingUsers, matchingDrivers] = await Promise.all([
          User.find({ $or: [{ name: regex }, { phone: regex }] }).select('_id').lean(),
          Driver.find({ $or: [{ name: regex }, { phone: regex }] }).select('_id').lean()
        ]);

        if (matchingUsers.length > 0) {
          orConditions.push({ userId: { $in: matchingUsers.map((u) => u._id) } });
        }
        if (matchingDrivers.length > 0) {
          orConditions.push({ driverId: { $in: matchingDrivers.map((d) => d._id) } });
        }
      } catch (err) {
        // Fallback gracefully
      }

      filter.$or = orConditions;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name phone profileImage')
        .populate('serviceId', 'title image description')
        .populate('vehicleId', 'title type image fee platformCharge seat')
        .populate({
          path: 'driverId',
          select: 'name phone profileImage rating vehicleId',
          populate: { path: 'vehicleId' }
        })
        .lean(),
      Booking.countDocuments(filter)
    ]);

    return { items, total, page, limit };
  }

  static async getDriverBookingSummary({ driverId, range = 'today' }) {
    const normalizedRange = String(range || 'today').toLowerCase();
    const validRanges = ['today', 'week', 'month'];

    if (!validRanges.includes(normalizedRange)) {
      throw new AppError('Invalid range. Use today, week, or month.', 400, 'INVALID_RANGE');
    }

    const now = new Date();
    let startDate = new Date(now);

    if (normalizedRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (normalizedRange === 'week') {
      const day = startDate.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      startDate.setDate(startDate.getDate() + diff);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filter = {
      driverId,
      status: BOOKING_STATUS.TRIP_COMPLETED,
      completedAt: { $gte: startDate, $lte: now }
    };
  

    const [totals, list] = await Promise.all([
      Booking.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalCompletedTrips: { $sum: 1 },
            totalFare: { $sum: { $ifNull: ['$fare', 0] } },
            totalTokenMoney: { $sum: { $ifNull: ['$tokenMoney', 0] } }
          }
        }
      ]),
      Booking.find(filter)
        .sort({ completedAt: -1, createdAt: -1 })
        .limit(20)
        .populate('userId', 'name phone profileImage')
        .populate('serviceId', 'title image description')
        .populate('vehicleId', 'title type image fee platformCharge seat')
        .lean()
    ]);

    const summary = totals?.[0] || {
      totalCompletedTrips: 0,
      totalFare: 0,
      totalTokenMoney: 0
    };

    return {
      range: normalizedRange,
      from: startDate.toISOString(),
      to: now.toISOString(),
      totalCompletedTrips: Number(summary.totalCompletedTrips || 0),
      totalFare: Number(summary.totalFare || 0),
      totalTokenMoney: Number(summary.totalTokenMoney || 0),
      totalEarning: Number((summary.totalFare || 0) + (summary.totalTokenMoney || 0)),
      list
    };
  }
}

export default BookingService;
