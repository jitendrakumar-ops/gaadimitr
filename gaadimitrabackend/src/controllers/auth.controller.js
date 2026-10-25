import AuthService from '../services/auth.service.js';
import User from '../models/User.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { AppError } from '../utils/helpers.js';
import Driver from '../models/Driver.js';

export const register = async (req, res, next) => {
  try {
    const { phone, name, gender, email, role, deviceToken, platform, code } = req.body;
    const reqInfo = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };

    const result = await AuthService.register({
      phone,
      name,
      gender,
      email,
      role,
      deviceToken,
      platform,
      code,
      reqInfo
    });

    return sendCreated(res, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req, res, next) => {
  try {
    const { phone, role } = req.body;
    const result = await AuthService.sendOtp(phone, role);
    return sendSuccess(res, 'OTP sent successfully', result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, role, deviceToken, platform } = req.body;
    const reqInfo = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };

    const result = await AuthService.verifyOtp({
      phone,
      otp,
      role,
      deviceToken,
      platform,
      reqInfo
    });

    return sendSuccess(res, 'Authentication successful', result);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const reqInfo = {
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    };

    const result = await AuthService.refreshTokens(refreshToken, reqInfo);
    return sendSuccess(res, 'Token refreshed successfully', result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    await AuthService.logout(req.user?.id, refreshToken);
    return sendSuccess(res, 'Logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

export const updateDeviceToken = async (req, res, next) => {
  try {
    const { deviceToken, platform = 'android' } = req.body;
    const trimmedToken = typeof deviceToken === 'string' ? deviceToken.trim() : '';

    if (!trimmedToken) {
      throw new AppError('Device token is required', 400, 'DEVICE_TOKEN_REQUIRED');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        deviceToken: trimmedToken,
        devicePlatform: platform
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }


if (req.user.role === 'driver') {
  const driver = await Driver.findOne({ userId: req.user.id });

  if (driver) {
    const now = new Date();

    if (
      driver.subscriptionExpiry &&
      new Date(driver.subscriptionExpiry) < now
    ) {
      driver.subscriptionStatus = 'inactive';
      await driver.save();
    }
  }
}

    return sendSuccess(res, 'Device token updated successfully', {
      deviceToken: user.deviceToken,
      devicePlatform: user.devicePlatform
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, gender } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (gender !== undefined) updateData.gender = gender ? gender.toLowerCase() : null;

    if (Object.keys(updateData).length === 0) {
      throw new AppError('At least one field is required to update the profile', 400, 'INVALID_UPDATE_PAYLOAD');
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    }).select('-__v');

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

export default { register, sendOtp, verifyOtp, refreshToken, logout, updateDeviceToken, updateProfile };
