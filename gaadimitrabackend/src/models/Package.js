import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true
    },
    dayType: {
      type: String,
      required: [true, 'Day type is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    off: {
      type: Number,
      default: 0,
      min: [0, 'Discount must be positive']
    },
    badgeName: {
      type: String,
      trim: true,
      default: null
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
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

// Virtual alias so `bedgeName` and `badgeName` can be used interchangeably
packageSchema.virtual('bedgeName')
  .get(function () {
    return this.badgeName;
  })
  .set(function (val) {
    this.badgeName = val;
  });

packageSchema.index({ serviceId: 1, dayType: 1 });

export const Package = mongoose.model('Package', packageSchema);
export default Package;
