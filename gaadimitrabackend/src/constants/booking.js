/**
 * Booking Status Constants and State Transition Rules
 */

export const BOOKING_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driverArriving',
  DRIVER_ARRIVED: 'driverArrived',
  TRIP_STARTED: 'tripStarted',
  TRIP_COMPLETED: 'tripCompleted',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const CANCELLED_BY = {
  USER: 'user',
  DRIVER: 'driver',
  SYSTEM: 'system',
  ADMIN: 'admin'
};

export const DRIVER_ONLINE_STATUS = {
  OFFLINE: 'offline',
  ONLINE: 'online',
  BUSY: 'busy'
};

export const DRIVER_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const USER_ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

/**
 * Allowed transitions from a current booking status
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  [BOOKING_STATUS.REQUESTED]: [
    BOOKING_STATUS.ACCEPTED,
    BOOKING_STATUS.REJECTED,
    BOOKING_STATUS.CANCELLED,
    BOOKING_STATUS.EXPIRED
  ],
  [BOOKING_STATUS.ACCEPTED]: [
    BOOKING_STATUS.DRIVER_ARRIVING,
    BOOKING_STATUS.CANCELLED
  ],
  [BOOKING_STATUS.DRIVER_ARRIVING]: [
    BOOKING_STATUS.DRIVER_ARRIVED,
    BOOKING_STATUS.CANCELLED
  ],
  [BOOKING_STATUS.DRIVER_ARRIVED]: [
    BOOKING_STATUS.TRIP_STARTED,
    BOOKING_STATUS.CANCELLED
  ],
  [BOOKING_STATUS.TRIP_STARTED]: [
    BOOKING_STATUS.TRIP_COMPLETED,
    BOOKING_STATUS.CANCELLED // Emergency or mid-trip cancellation
  ],
  [BOOKING_STATUS.TRIP_COMPLETED]: [], // Terminal state
  [BOOKING_STATUS.CANCELLED]: [],      // Terminal state
  [BOOKING_STATUS.REJECTED]: [],       // Terminal state
  [BOOKING_STATUS.EXPIRED]: []         // Terminal state
};

/**
 * Checks if a status transition is valid
 */
export const isValidTransition = (currentStatus, newStatus) => {
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
};
