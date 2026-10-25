import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    drivingLicense: {
      dlNo: { type: String, trim: true, default: null },
      dlType: { type: String, trim: true, default: null },
      frontPhoto: { type: String, default: null },
      backPhoto: { type: String, default: null },
      isVerified: { type: Boolean, default: false }
    },
    rc: {
      rcNo: { type: String, trim: true, default: null },
      frontPhoto: { type: String, default: null },
      backPhoto: { type: String, default: null },
      isVerified: { type: Boolean, default: false }
    },
    insurance: {
      insuranceNo: { type: String, trim: true, default: null },
      photo: { type: String, default: null },
      isVerified: { type: Boolean, default: false }
    },
    permit: {
      permitNo: { type: String, trim: true, default: null },
      type: { type: String, trim: true, default: null },
      photo: { type: String, default: null },
      isVerified: { type: Boolean, default: false }
    },
    aadharCard: {
      cardNo: { type: String, trim: true, default: null },
      frontPhoto: { type: String, default: null },
      backPhoto: { type: String, default: null },
      isVerified: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    rejectionReason: {
      type: String,
      default: null
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

documentSchema.index({ driverId: 1, userId: 1 });

export const Document = mongoose.model('Document', documentSchema);
export default Document;
