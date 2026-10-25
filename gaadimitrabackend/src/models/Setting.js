import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'app_settings',
      unique: true,
      index: true
    },
    userPromotionImage: {
      type: String,
      default: null
    },
    driverPromotionImage: {
      type: String,
      default: null
    },
    isUserPromotionActive: {
      type: Boolean,
      default: true
    },
    isDriverPromotionActive: {
      type: Boolean,
      default: true
    },
    extraSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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

/**
 * Static method to retrieve the singleton settings document,
 * or create one with default values if it doesn't exist yet.
 */
settingSchema.statics.getOrCreate = async function () {
  let settings = await this.findOne({ key: 'app_settings' });
  if (!settings) {
    settings = await this.create({ key: 'app_settings' });
  }
  return settings;
};

export const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
