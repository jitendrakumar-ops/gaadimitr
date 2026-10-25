import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/booking.js';

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
      lowercase: true,
      trim: true
    },
    code: {
      type: String,
      trim: true,
      default: null
    },
    referralCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    profileImage: {
      type: String,
      default: null
    },
    address: {
      type: String,
      trim: true,
      default: null
    },
    emergencyContact: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      index: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    pin: {
      type: String,
      default: null,
      trim: true
    },
    deviceToken: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    devicePlatform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      default: 'android'
    },
    refreshToken: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.refreshToken;
        return ret;
      }
    }
  }
);

userSchema.index({ phone: 1, role: 1 });

export const User = mongoose.model('User', userSchema);
export default User;
