import SettingService from '../services/setting.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Get all app settings (including promotion images)
 * GET /api/v1/settings
 */
export const getSettings = async (req, res, next) => {
  try {
    const settings = await SettingService.getSettings();
    return sendSuccess(res, 'Settings retrieved successfully', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update app settings & upload promotion images (Admin only)
 * PATCH /api/v1/settings
 */
export const updateSettings = async (req, res, next) => {
  try {
    const updated = await SettingService.updateSettings(req.body, req.files);
    return sendSuccess(res, 'Settings updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user promotion banner
 * GET /api/v1/settings/promotions/user
 */
export const getUserPromotion = async (req, res, next) => {
  try {
    const settings = await SettingService.getSettings();
    return sendSuccess(res, 'User promotion retrieved successfully', {
      userPromotionImage: settings.userPromotionImage,
      isUserPromotionActive: settings.isUserPromotionActive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver promotion banner
 * GET /api/v1/settings/promotions/driver
 */
export const getDriverPromotion = async (req, res, next) => {
  try {
    const settings = await SettingService.getSettings();
    return sendSuccess(res, 'Driver promotion retrieved successfully', {
      driverPromotionImage: settings.driverPromotionImage,
      isDriverPromotionActive: settings.isDriverPromotionActive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove user or driver promotion image (Admin only)
 * DELETE /api/v1/settings/promotions/:target ('user' | 'driver')
 */
export const removePromotionImage = async (req, res, next) => {
  try {
    const { target } = req.params;
    const settings = await SettingService.removePromotionImage(target);
    return sendSuccess(res, `${target} promotion image removed successfully`, settings);
  } catch (error) {
    next(error);
  }
};

export default {
  getSettings,
  updateSettings,
  getUserPromotion,
  getDriverPromotion,
  removePromotionImage
};
