import mongoose from 'mongoose';
import { DRIVER_ONLINE_STATUS } from '../constants/booking.js';

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true
    },
    vehicleModel: {
      type: String,
      trim: true,
      default: ''
    },
    vehicleNo: {
      type: String,
      trim: true,
      default: ''
    },
    manufacturingYear: {
      type: Number,
      default: null
    },
    seating: {
      type: Number,
      default: null
    },
    type: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    vehicleImages: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalRatingsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalTripsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    onlineStatus: {
      type: String,
      enum: Object.values(DRIVER_ONLINE_STATUS),
      default: DRIVER_ONLINE_STATUS.OFFLINE,
      index: true
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive'
    },
    subscriptionExpiry: {
      type: Date,
      default: null
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    

    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      heading: {
        type: Number,
        default: 0
      },

    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

driverSchema.index({ currentLocation: '2dsphere' });

export const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
