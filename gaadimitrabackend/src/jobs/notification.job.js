import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import NotificationService from '../services/notification.service.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'notification-queue';
let notificationQueue = null;
let notificationWorker = null;

export const initNotificationQueue = () => {
  const redis = getRedisClient();

  if (!redis) {
    logger.warn('Redis unavailable, skipping notification BullMQ queue');
    return null;
  }

  const connection = {
    host: redis.options.host || 'localhost',
    port: redis.options.port || 6379,
    password: redis.options.password
  };

  try {
    notificationQueue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000
        },
        removeOnComplete: true
      }
    });

    notificationWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        const { recipientId, payload } = job.data;
        await NotificationService.sendPushNotification(recipientId, payload);
      },
      { connection }
    );

    notificationWorker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, error: err.message }, 'Notification job failed');
    });

    logger.info('Notification BullMQ queue & worker initialized');
    return { queue: notificationQueue, worker: notificationWorker };
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to initialize BullMQ notification queue');
    return null;
  }
};

export const enqueueNotification = async (recipientId, payload) => {
  if (notificationQueue) {
    try {
      await notificationQueue.add('send-notification', { recipientId, payload });
      return true;
    } catch {
      // Direct fallback if queue is unavailable
      return await NotificationService.sendPushNotification(recipientId, payload);
    }
  }
  return await NotificationService.sendPushNotification(recipientId, payload);
};

export const closeNotificationQueue = async () => {
  if (notificationWorker) await notificationWorker.close();
  if (notificationQueue) await notificationQueue.close();
};

export default { initNotificationQueue, enqueueNotification, closeNotificationQueue };
