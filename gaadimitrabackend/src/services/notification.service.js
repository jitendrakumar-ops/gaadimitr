import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getFirebaseAdmin, isFirebaseReady } from '../config/firebase.js';
import logger from '../utils/logger.js';

export class NotificationService {
  /**
   * Send push notification to all active device tokens of a user/driver
   */
  static async sendPushNotification(recipientUserId, { title, body, type = 'general', data = {} }) {
    try {
      // 1. Always record in Notification history
      const record = await Notification.create({
        recipientId: recipientUserId,
        title,
        body,
        type,
        data,
        isRead: false
      });

      // 2. Query user's active deviceToken
      const recipient = await User.findById(recipientUserId).select('deviceToken isActive isBlocked').lean();

      if (!recipient || !recipient.deviceToken || !recipient.isActive || recipient.isBlocked) {
        logger.debug({ recipientUserId, type }, 'No active device token found for push');
        return record;
      }

      const tokens = [recipient.deviceToken];

      // 3. If Firebase is not configured (dev/test), log mock push
      if (!isFirebaseReady()) {
        logger.info(
          { recipientUserId, title, body, tokensCount: tokens.length },
          '[FCM Mock] Push notification dispatched'
        );
        return record;
      }

      // 4. Send via Firebase Admin SDK
      const admin = getFirebaseAdmin();
      const stringifiedData = {};
      for (const [key, value] of Object.entries(data)) {
        stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }

      const messagePayload = {
        tokens,
        notification: {
          title,
          body
        },
        data: {
          ...stringifiedData,
          type,
          notificationId: record._id.toString()
        }
      };

      const response = await admin.messaging().sendEachForMulticast(messagePayload);

      // 5. Clean up expired/invalid tokens
      if (response.failureCount > 0) {
        const hasInvalidToken = response.responses.some((resp) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            return (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            );
          }
          return false;
        });

        if (hasInvalidToken) {
          await User.findByIdAndUpdate(recipientUserId, { deviceToken: null });
          logger.info({ recipientUserId }, 'Deactivated invalid FCM device token for user');
        }
      }

      return record;
    } catch (error) {
      logger.error({ error: error.message, recipientUserId }, 'Failed to send push notification');
      // Do not rethrow - notifications should not crash critical business transaction paths
      return null;
    }
  }

  /**
   * Get user's notifications list
   */
  static async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientId: userId })
    ]);

    return { items, total, page, limit };
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(userId, notificationId = null) {
    const filter = { recipientId: userId };
    if (notificationId) filter._id = notificationId;
    await Notification.updateMany(filter, { isRead: true });
    return true;
  }

  /**
   * Admin: Send push notification to all users, specific role, or specific users
   */
  static async sendAdminNotification({
    title,
    body,
    type = 'general',
    target,
    role,
    userId,
    recipientId,
    userIds,
    data = {}
  }) {
    const filter = { isActive: true, isBlocked: false };

    const singleId = recipientId || userId;
    if (singleId) {
      filter._id = singleId;
    } else if (Array.isArray(userIds) && userIds.length > 0) {
      filter._id = { $in: userIds };
    } else if (target === 'drivers' || target === 'driver' || role === 'driver') {
      filter.role = 'driver';
    } else if (target === 'users' || target === 'user' || role === 'user') {
      filter.role = 'user';
    }

    const recipients = await User.find(filter).select('_id deviceToken name phone role').lean();

    if (recipients.length === 0) {
      return {
        targetedCount: 0,
        deviceTokensCount: 0,
        successPushCount: 0,
        failedPushCount: 0,
        title,
        body,
        type,
        message: 'No active users found matching target criteria'
      };
    }

    // Insert In-app notifications in batches
    const notificationDocs = recipients.map((user) => ({
      recipientId: user._id,
      title,
      body,
      type,
      data,
      isRead: false
    }));

    const batchSize = 1000;
    for (let i = 0; i < notificationDocs.length; i += batchSize) {
      const batch = notificationDocs.slice(i, i + batchSize);
      await Notification.insertMany(batch, { ordered: false });
    }

    // Extract valid device tokens
    const validRecipients = recipients.filter(
      (u) => u.deviceToken && typeof u.deviceToken === 'string' && u.deviceToken.trim().length > 0
    );
    const tokens = validRecipients.map((u) => u.deviceToken.trim());

    if (tokens.length === 0) {
      return {
        targetedCount: recipients.length,
        deviceTokensCount: 0,
        successPushCount: 0,
        failedPushCount: 0,
        title,
        body,
        type,
        message: 'In-app notifications saved, but no registered device tokens found'
      };
    }

    if (!isFirebaseReady()) {
      logger.info(
        { targetedCount: recipients.length, deviceTokensCount: tokens.length, title, body },
        '[FCM Mock] Admin push notification dispatched'
      );
      return {
        targetedCount: recipients.length,
        deviceTokensCount: tokens.length,
        successPushCount: tokens.length,
        failedPushCount: 0,
        title,
        body,
        type,
        mode: 'mock'
      };
    }

    const admin = getFirebaseAdmin();
    const stringifiedData = {};
    for (const [key, value] of Object.entries(data || {})) {
      stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }

    let successPushCount = 0;
    let failedPushCount = 0;
    const invalidTokenUserIds = [];

    const fcmBatchSize = 500;
    for (let i = 0; i < validRecipients.length; i += fcmBatchSize) {
      const currentBatchRecipients = validRecipients.slice(i, i + fcmBatchSize);
      const currentBatchTokens = currentBatchRecipients.map((u) => u.deviceToken.trim());

      try {
        const messagePayload = {
          tokens: currentBatchTokens,
          notification: {
            title,
            body
          },
          data: {
            ...stringifiedData,
            type,
            title,
            body
          }
        };

        const response = await admin.messaging().sendEachForMulticast(messagePayload);
        successPushCount += response.successCount;
        failedPushCount += response.failureCount;

        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errCode = resp.error?.code;
              if (
                errCode === 'messaging/invalid-registration-token' ||
                errCode === 'messaging/registration-token-not-registered'
              ) {
                invalidTokenUserIds.push(currentBatchRecipients[idx]._id);
              }
            }
          });
        }
      } catch (err) {
        logger.error({ error: err.message }, 'Failed sending FCM multicast batch');
        failedPushCount += currentBatchTokens.length;
      }
    }

    if (invalidTokenUserIds.length > 0) {
      await User.updateMany({ _id: { $in: invalidTokenUserIds } }, { deviceToken: null });
      logger.info({ count: invalidTokenUserIds.length }, 'Cleaned up invalid FCM tokens');
    }

    return {
      targetedCount: recipients.length,
      deviceTokensCount: tokens.length,
      successPushCount,
      failedPushCount,
      title,
      body,
      type,
      mode: 'fcm'
    };
  }

  /**
   * Admin: List all notifications with optional filters and pagination
   */
  static async getAllNotifications({ search, type, isRead, page = 1, limit = 10 } = {}) {
    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true' || isRead === true;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('recipientId', 'name phone email role profileImage')
        .lean(),
      Notification.countDocuments(filter)
    ]);

    return { items, total, page: pageNum, limit: limitNum };
  }
}

export default NotificationService;
