import Setting from '../models/Setting.js';
import S3Service from './s3.service.js';
import { AppError } from '../utils/helpers.js';

class SettingService {
  /**
   * Get app settings (creates default document if none exists)
   */
  static async getSettings() {
    return await Setting.getOrCreate();
  }

  /**
   * Update app settings with optional uploaded images or URLs
   */
  static async updateSettings(body = {}, files = {}) {
    const settings = await Setting.getOrCreate();

    // 1. Handle single user promotion image file
    if (files?.userPromotionImage?.[0]) {
      const uploadResult = await S3Service.uploadFile(files.userPromotionImage[0], 'promotions');
      settings.userPromotionImage = uploadResult.url;
    } else if (body.userPromotionImage !== undefined) {
      settings.userPromotionImage = body.userPromotionImage || null;
    }

    // 2. Handle single driver promotion image file
    if (files?.driverPromotionImage?.[0]) {
      const uploadResult = await S3Service.uploadFile(files.driverPromotionImage[0], 'promotions');
      settings.driverPromotionImage = uploadResult.url;
    } else if (body.driverPromotionImage !== undefined) {
      settings.driverPromotionImage = body.driverPromotionImage || null;
    }

    // 3. Active flags & extra settings
    if (body.isUserPromotionActive !== undefined) {
      settings.isUserPromotionActive = body.isUserPromotionActive === 'true' || body.isUserPromotionActive === true;
    }
    if (body.isDriverPromotionActive !== undefined) {
      settings.isDriverPromotionActive = body.isDriverPromotionActive === 'true' || body.isDriverPromotionActive === true;
    }
    if (body.extraSettings !== undefined) {
      if (typeof body.extraSettings === 'string') {
        try {
          settings.extraSettings = JSON.parse(body.extraSettings);
        } catch {
          // keep as string if not valid JSON
          settings.extraSettings = body.extraSettings;
        }
      } else {
        settings.extraSettings = body.extraSettings;
      }
    }

    await settings.save();
    return settings;
  }

  /**
   * Remove a promotion image by target ('user' or 'driver')
   */
  static async removePromotionImage(target) {
    const settings = await Setting.getOrCreate();

    if (target === 'user') {
      settings.userPromotionImage = null;
    } else if (target === 'driver') {
      settings.driverPromotionImage = null;
    } else {
      throw new AppError('Target must be either "user" or "driver"', 400, 'INVALID_TARGET');
    }

    await settings.save();
    return settings;
  }
}

export default SettingService;
