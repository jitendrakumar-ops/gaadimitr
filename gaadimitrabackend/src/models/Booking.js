import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/booking.js';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true
    },
    pickupLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      title: String
    },
    dropLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      title: String
    },
    distance: {
      type: Number, // in KM
      required: false,
      default: 0,
      min: 0
    },
    fare: {
      type: Number,
      default: 0,
      min: 0
    },
    tokenMoney: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: null,
      min: 1,
      max: 5
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.REQUESTED,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      default: 'cash'
    },
    cancellationReason: {
      type: String,
      default: null
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    driverArrivedAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound Indexes for fast queries
bookingSchema.index({ userId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ driverId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ serviceId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ vehicleId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' }, { sparse: true });
bookingSchema.index({ 'dropLocation.coordinates': '2dsphere' }, { sparse: true });

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
