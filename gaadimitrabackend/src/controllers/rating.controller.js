import Rating from '../models/Rating.js';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import NotificationService from '../services/notification.service.js';
import { BOOKING_STATUS } from '../constants/booking.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import { AppError } from '../utils/helpers.js';

export const rateDriver = async (req, res, next) => {
  try {
    const { bookingId, rating, review } = req.body;

    const booking = await Booking.findById(bookingId).populate('driverId');
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.userId.toString() !== req.user.id.toString()) {
      throw new AppError('Only the passenger can rate this ride', 403, 'FORBIDDEN');
    }

    if (booking.status !== BOOKING_STATUS.TRIP_COMPLETED) {
      throw new AppError('You can only rate completed trips', 400, 'TRIP_NOT_COMPLETED');
    }

    // Check duplicate
    const existing = await Rating.findOne({ bookingId });
    if (existing) {
      throw new AppError('You have already rated this trip', 409, 'RATING_ALREADY_EXISTS');
    }

    const ratingDoc = await Rating.create({
      bookingId: booking._id,
      fromUserId: req.user.id,
      toUserId: booking.driverId.userId,
      driverId: booking.driverId._id,
      rating: Number(rating),
      review: review || ''
    });

    // Save rating on Booking
    booking.rating = Number(rating);
    await booking.save();

    // Recalculate Driver average rating
    const driver = await Driver.findById(booking.driverId._id);
    if (driver) {
      const currentCount = driver.totalRatingsCount || 0;
      const currentAvg = driver.rating || 5.0;
      const newCount = currentCount + 1;
      const newAvg = Math.round(((currentAvg * currentCount + Number(rating)) / newCount) * 10) / 10;

      driver.rating = newAvg;
      driver.totalRatingsCount = newCount;
      await driver.save();
    }

    // Send push notification to Driver
    await NotificationService.sendPushNotification(booking.driverId.userId, {
      title: 'New Rating Received',
      body: `You received a ${rating}★ rating from your passenger!`,
      type: 'rating_received',
      data: { rating: rating.toString(), bookingId: booking._id.toString() }
    });

    return sendCreated(res, 'Rating submitted successfully', ratingDoc);
  } catch (error) {
    next(error);
  }
};

export const getDriverRatings = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Rating.find({ driverId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('fromUserId', 'name profileImage')
        .lean(),
      Rating.countDocuments({ driverId })
    ]);

    return sendPaginated(res, 'Ratings retrieved', items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getAllRatings = async (req, res, next) => {
  try {
    const { search, rating, driverId, fromUserId } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (driverId) filter.driverId = driverId;
    if (fromUserId) filter.fromUserId = fromUserId;
    if (rating) filter.rating = Number(rating);

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const matchedUsers = await User.find({
        $or: [
          { name: searchRegex },
          { phone: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');

      const userIds = matchedUsers.map((u) => u._id);

      filter.$or = [
        { review: searchRegex },
        { fromUserId: { $in: userIds } },
        { toUserId: { $in: userIds } }
      ];
    }

    const [items, total] = await Promise.all([
      Rating.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('fromUserId', 'name phone email profileImage')
        .populate('toUserId', 'name phone email profileImage')
        .populate({
          path: 'driverId',
          select: 'vehicleModel vehicleNo type rating totalRatingsCount userId',
          populate: {
            path: 'userId',
            select: 'name phone email profileImage'
          }
        })
        .populate('bookingId', 'bookingNumber status pickupAddress destinationAddress')
        .lean(),
      Rating.countDocuments(filter)
    ]);

    return sendPaginated(res, 'Ratings retrieved', items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export default { rateDriver, getDriverRatings, getAllRatings };
