import crypto from 'crypto';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import OtpService from './otp.service.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken
} from '../utils/jwt.js';
import { normalizePhone, AppError } from '../utils/helpers.js';
import { USER_ROLES } from '../constants/booking.js';

export class AuthService {
  static async generateUniqueUserCode() {
    const prefix = 'GDM';
    let code = '';
    let attempts = 0;

    do {
      const randomNumber = crypto.randomInt(100000, 999999).toString();
      code = `${prefix}${randomNumber}`;
      attempts += 1;
    } while (attempts < 10 && await User.exists({ code }));

    if (await User.exists({ code })) {
      const fallback = `${prefix}${Date.now().toString(36).slice(-6).toUpperCase()}`;
      const finalCode = await User.exists({ code: fallback }) ? `${prefix}${crypto.randomUUID().slice(0, 6).toUpperCase()}` : fallback;
      return finalCode;
    }

    return code;
  }

  static async resolveReferralUserId(referralCode) {
    if (!referralCode) return null;

    const normalizedCode = referralCode.trim().toUpperCase();
    if (!normalizedCode) return null;

    const referrer = await User.findOne({ code: normalizedCode }).select('_id').lean();
    return referrer?._id || null;
  }

  /**
   * Register a new user with phone, name, and gender, and generate a 4-digit PIN
   */
  static async register({ phone, name, gender, email, role = USER_ROLES.USER, deviceToken, platform = 'android', reqInfo = {}, code } = {}) {
    const normalizedPhone = normalizePhone(phone);

    // 1. Check if user already exists
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      throw new AppError('User with this phone number is already registered. Please login.', 409, 'USER_ALREADY_EXISTS');
    }

    // 2. Generate 4-digit PIN and unique referral code
    const pin = crypto.randomInt(1000, 10000).toString();
    const uniqueCode = await this.generateUniqueUserCode();
    const referralUserId = await this.resolveReferralUserId(code);

    // 3. Create user with generated PIN
    const user = await User.create({
      phone: normalizedPhone,
      name: name.trim(),
      gender: gender.toLowerCase(),
      email: email ? email.trim().toLowerCase() : null,
      code: uniqueCode,
      referralCode: referralUserId || null,
      role: role || USER_ROLES.USER,
      pin,
      deviceToken: deviceToken || null,
      devicePlatform: platform || 'android',
      isPhoneVerified: false,
      lastLoginAt: new Date()
    });

    // 4. If driver role, create Driver profile
    let driver = null;
    if (user.role === USER_ROLES.DRIVER) {
      driver = await Driver.create({
        userId: user._id
      });
    }

    // 5. Generate JWT tokens
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 6. Store hashed refresh token on User document
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    return {
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        gender: user.gender,
        email: user.email,
        code: user.code,
        referralCode: user.referralCode ? user.referralCode.toString() : null,
        profileImage: user.profileImage,
        role: user.role,
        pin: user.pin,
        isPhoneVerified: user.isPhoneVerified,
        deviceToken: user.deviceToken,
        devicePlatform: user.devicePlatform
      },
      pin,
      driver: driver
        ? {
          id: driver._id,
          onlineStatus: driver.onlineStatus,
          serviceId: driver.serviceId,
          vehicleId: driver.vehicleId,
          vehicleModel: driver.vehicleModel,
          vehicleNo: driver.vehicleNo,
          manufacturingYear: driver.manufacturingYear,
          seating: driver.seating,
          type: driver.type,
          color: driver.color,
          vehicleImages: driver.vehicleImages
        }
        : null,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }


  static async registerDriver({
    name,
    phone,
    profileImage = null,
    address,
    emergencyContact,
    email = null,
    gender = null,
    deviceToken = null,
    platform = 'android',
    reqInfo = {},
    code
  }) {
    const normalizedPhone = normalizePhone(phone);

    // 1. Check if user already exists
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      throw new AppError('A user or driver with this phone number is already registered. Please login.', 409, 'USER_ALREADY_EXISTS');
    }

    // 2. Generate 4-digit PIN and unique referral code
    const pin = crypto.randomInt(1000, 10000).toString();
    const uniqueCode = await this.generateUniqueUserCode();
    const referralUserId = await this.resolveReferralUserId(code);

    // 3. Create user with role DRIVER and save fields directly on User model
    const user = await User.create({
      phone: normalizedPhone,
      name: name.trim(),
      gender: gender ? gender.toLowerCase() : null,
      email: email ? email.trim().toLowerCase() : null,
      code: uniqueCode,
      referralCode: referralUserId || null,
      profileImage: profileImage || null,
      address: address ? address.trim() : null,
      emergencyContact: emergencyContact || null,
      role: USER_ROLES.DRIVER,
      pin,
      deviceToken: deviceToken || null,
      devicePlatform: platform || 'android',
      isPhoneVerified: false,
      lastLoginAt: new Date()
    });

    // 4. Create Driver profile linked to User
    const driver = await Driver.create({
      userId: user._id
    });

    // 5. Generate JWT tokens
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 6. Store hashed refresh token on User document
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    return {
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        gender: user.gender,
        email: user.email,
        code: user.code,
        referralCode: user.referralCode ? user.referralCode.toString() : null,
        profileImage: user.profileImage,
        address: user.address,
        emergencyContact: user.emergencyContact,
        role: user.role,
        pin: user.pin,
        isPhoneVerified: user.isPhoneVerified,
        deviceToken: user.deviceToken,
        devicePlatform: user.devicePlatform
      },
      pin,
      driver: {
        id: driver._id,
        onlineStatus: driver.onlineStatus,
        serviceId: driver.serviceId,
        vehicleId: driver.vehicleId,
        vehicleModel: driver.vehicleModel,
        vehicleNo: driver.vehicleNo,
        manufacturingYear: driver.manufacturingYear,
        seating: driver.seating,
        type: driver.type,
        color: driver.color,
        vehicleImages: driver.vehicleImages
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * Request OTP for login / registration
   */
  static async sendOtp(phone, role = USER_ROLES.USER) {
    const normalizedPhone = normalizePhone(phone);
    return await OtpService.sendOtp(normalizedPhone);
  }

  /**
   * Verify OTP and issue JWT access and refresh tokens
   */
  static async verifyOtp({ phone, otp, role, deviceToken, platform = 'android', reqInfo = {} }) {
    const normalizedPhone = normalizePhone(phone);

    // 1 & 2. Verify OTP and look up the User concurrently (independent operations)
    const [, user] = await Promise.all([
      OtpService.verifyOtp(normalizedPhone, otp),
      User.findOne({ phone: normalizedPhone })
    ]);

    if (!user) {
      throw new AppError('User not registered. Please complete registration first.', 404, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    if (user.isBlocked) {
      throw new AppError('Your account has been suspended. Please contact support.', 403, 'ACCOUNT_BLOCKED');
    }

    // 3. Mark user phone as verified & update last login
    user.isPhoneVerified = true;
    user.lastLoginAt = new Date();
    user.role=role;

    // If driver role, find existing Driver profile (do not auto-create)
    let driver = null;
    if (role === USER_ROLES.DRIVER) {
      driver = await Driver.findOne({ userId: user._id });
    }

    // 4. Generate JWT Tokens
    const tokenPayload = {
      userId: user._id.toString(),
      role: role,
      phone: user.phone
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 5. Store hashed refresh token & deviceToken on User document
    user.refreshToken = hashToken(refreshToken);

    if (deviceToken) {
      user.deviceToken = deviceToken;
      user.devicePlatform = platform || 'android';
    }

    await user.save();

    return {
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        gender: user.gender,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        deviceToken: user.deviceToken,
        devicePlatform: user.devicePlatform
      },
      driver: driver
        ? {
          id: driver._id,
          onlineStatus: driver.onlineStatus,
          serviceId: driver.serviceId,
          vehicleId: driver.vehicleId,
          vehicleModel: driver.vehicleModel,
          vehicleNo: driver.vehicleNo,
          manufacturingYear: driver.manufacturingYear,
          seating: driver.seating,
          type: driver.type,
          color: driver.color,
          vehicleImages: driver.vehicleImages
        }
        : null,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * Rotate refresh token and issue new token pair
   */
  static async refreshTokens(rawRefreshToken, reqInfo = {}) {
    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || !user.isActive || user.isBlocked) {
      throw new AppError('User is not authorized or account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    if (!user.refreshToken || user.refreshToken !== tokenHash) {
      // Suspected token reuse or revoked token: clear stored token
      user.refreshToken = null;
      await user.save();
      throw new AppError('Invalid or revoked token. Please login again.', 401, 'SUSPICIOUS_TOKEN_REUSE');
    }

    // Issue new pair
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Invalidate refresh token on logout
   */
  static async logout(userId, rawRefreshToken) {
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    } else if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await User.findOneAndUpdate({ refreshToken: tokenHash }, { refreshToken: null });
    }
    return true;
  }
}

export default AuthService;
