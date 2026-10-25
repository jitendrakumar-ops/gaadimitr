import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vehicle title is required'],
      trim: true,
      index: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true
    },
    image: {
      type: String,
      trim: true,
      default: null
    },
    seat: {
      type: Number,
      default: null
   

    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      trim: true,
      default: 'sedan',
      index: true
    },
    fee: {
      type: Number,
      required: [true, 'Fee is required'],
      default: 0,
      min: [0, 'Fee must be positive']
    },
    platformCharge: {
      type: Number,
      default: 0,
      min: [0, 'Platform charge must be positive']
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

// Virtual aliases
vehicleSchema.virtual('platform_charge')
  .get(function () {
    return this.platformCharge;
  })
  .set(function (val) {
    this.platformCharge = val;
  });

vehicleSchema.virtual('seating')
  .get(function () {
    return this.seat;
  })
  .set(function (val) {
    this.seat = val;
  });

vehicleSchema.virtual('vehicleType')
  .get(function () {
    return this.type;
  })
  .set(function (val) {
    this.type = val;
  });

vehicleSchema.virtual('vehicleImage')
  .get(function () {
    return this.image;
  })
  .set(function (val) {
    this.image = val;
  });

vehicleSchema.index({ serviceId: 1, type: 1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
