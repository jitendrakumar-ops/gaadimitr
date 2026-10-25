import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import BookingService, { setBookingQueueScheduler } from '../services/booking.service.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'booking-queue';
let bookingQueue = null;
let bookingWorker = null;

export const initBookingQueue = () => {
  const redis = getRedisClient();

  if (!redis) {
    logger.warn('Redis unavailable, skipping booking BullMQ queue');
    return null;
  }

  // BullMQ connection options matching ioredis instance options
  const connection = {
    host: redis.options.host || 'localhost',
    port: redis.options.port || 6379,
    password: redis.options.password
  };

  try {
    bookingQueue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    bookingWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        logger.info({ jobId: job.id, name: job.name, data: job.data }, 'Processing booking background job');

        if (job.name === 'expire-booking') {
          const { bookingId } = job.data;
          await BookingService.expireBooking(bookingId);
        }
      },
      { connection }
    );

    bookingWorker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, error: err.message }, 'Booking background job failed');
    });

    bookingWorker.on('completed', (job) => {
      logger.debug({ jobId: job.id }, 'Booking background job completed');
    });

    // Wire up scheduler into BookingService
    const scheduler = {
      scheduleBookingExpiration: async (bookingId, delaySeconds = 60) => {
        if (!bookingQueue) return;
        try {
          await bookingQueue.add(
            'expire-booking',
            { bookingId },
            {
              delay: delaySeconds * 1000,
              jobId: `expire-${bookingId}` // Idempotent job id
            }
          );
        } catch (err) {
          logger.error({ err: err.message, bookingId }, 'Failed to schedule booking expiration job');
        }
      }
    };

    setBookingQueueScheduler(scheduler);

    logger.info('Booking BullMQ queue & worker initialized');
    return { queue: bookingQueue, worker: bookingWorker };
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to initialize BullMQ booking queue');
    return null;
  }
};

export const closeBookingQueue = async () => {
  if (bookingWorker) await bookingWorker.close();
  if (bookingQueue) await bookingQueue.close();
};

export default { initBookingQueue, closeBookingQueue };
