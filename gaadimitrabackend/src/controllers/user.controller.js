import User from '../models/User.js';
import Driver from '../models/Driver.js';
import S3Service from '../services/s3.service.js';
import NotificationService from '../services/notification.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { AppError } from '../utils/helpers.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v').lean();
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return sendSuccess(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, gender,emergencyContact } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (gender !== undefined) updateData.gender = gender ? gender.toLowerCase() : null;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    }).select('-__v');

    return sendSuccess(res, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No image file provided', 400, 'FILE_MISSING');
    }

    const uploadResult = await S3Service.uploadFile(req.file, 'profiles');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: uploadResult.url },
      { new: true }
    );

    return sendSuccess(res, 'Profile image updated successfully', {
      profileImage: user.profileImage
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeviceToken = async (req, res, next) => {
  try {
    const { token, platform = 'android' } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      deviceToken: token,
      devicePlatform: platform
    });

    return sendSuccess(res, 'Device token updated successfully', null);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    user.role = role;
    await user.save();

    if (role === 'driver') {
      const existingDriver = await Driver.findOne({ userId: user._id });
      if (!existingDriver) {
        await Driver.create({ userId: user._id });
      }
    }

    return sendSuccess(res, 'User role updated successfully', {
      id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { items, total } = await NotificationService.getUserNotifications(req.user.id, page, limit);
    return sendPaginated(res, 'Notifications retrieved', items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await NotificationService.markAsRead(req.user.id, notificationId);
    return sendSuccess(res, 'Notification marked as read', null);
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  uploadProfileImage,
  updateDeviceToken,
  updateUserRole,
  getNotifications,
  markNotificationRead
};
