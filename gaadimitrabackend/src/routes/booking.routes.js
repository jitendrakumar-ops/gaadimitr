import { Router } from 'express';
import {
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
  cancelBooking,
  getBookingSummary
} from '../controllers/booking.controller.js';
import { authenticate, requireUser, requireDriver } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  bookingIdParamSchema
} from '../validators/booking.validator.js';

const router = Router();

router.use(authenticate);

// List & Detail Bookings
router.get('/', listBookings);
router.get('/active', requireUser, getActiveBookingForUser);
router.get('/driver/active', requireDriver, getActiveBookingForDriver);
router.get('/summary', requireDriver, getBookingSummary);
router.get('/:bookingId', validate(bookingIdParamSchema), getBooking);

// User Booking Creation
router.post('/', requireUser, validate(createBookingSchema), createBooking);

// Driver Lifecycle Actions
router.post('/:bookingId/accept', requireDriver, validate(bookingIdParamSchema), acceptBooking);
router.post('/:bookingId/reject', requireDriver, validate(bookingIdParamSchema), rejectBooking);
router.post('/:bookingId/arriving', requireDriver, validate(bookingIdParamSchema), driverArriving);
router.post('/:bookingId/arrived', requireDriver, validate(bookingIdParamSchema), driverArrived);
router.post('/:bookingId/start', requireDriver, validate(bookingIdParamSchema), startTrip);
router.post('/:bookingId/complete', requireDriver, validate(bookingIdParamSchema), completeTrip);

// Cancellation (by either passenger or driver)
router.post('/:bookingId/cancel', validate(bookingIdParamSchema), validate(cancelBookingSchema), cancelBooking);

export default router;
