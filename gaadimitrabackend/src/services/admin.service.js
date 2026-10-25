import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import Document from '../models/Document.js';
import UserPackage from '../models/UserPackage.js';
import { AppError, normalizePhone } from '../utils/helpers.js';
import { USER_ROLES, BOOKING_STATUS, PAYMENT_STATUS } from '../constants/booking.js';
import OtpService from './otp.service.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken
} from '../utils/jwt.js';

export class AdminService {

  static async createAccount({ phone, name, gender, email, role, address, isActive }) {
    // 1. Check phone uniqueness
    const existing = await User.findOne({ phone });
    if (existing) {
      throw new AppError(
        'An account with this phone number already exists',
        409,
        'PHONE_ALREADY_EXISTS'
      );
    }

    // 2. Build the new user document
    const newUser = await User.create({
      phone,
      name: name.trim(),
      gender: gender ? gender.toLowerCase() : undefined,
      email: email ? email.trim().toLowerCase() : null,
      role: role || USER_ROLES.USER,
      address: address ? address.trim() : null,
      isActive: isActive !== undefined ? isActive : true,
      isPhoneVerified: true  // Admin-created accounts are pre-verified
    });

    return newUser;
  }

  static async updateAccount(id, payload, requestingUserId) {
    const { phone, name, email, gender, role, address, isActive, isBlocked } = payload;

    const updateData = {};

    if (name !== undefined)      updateData.name = name.trim();
    if (email !== undefined)     updateData.email = email ? email.trim().toLowerCase() : null;
    if (gender !== undefined)    updateData.gender = gender ? gender.toLowerCase() : null;
    if (role !== undefined)      updateData.role = role;
    if (address !== undefined)   updateData.address = address ? address.trim() : null;
    if (isActive !== undefined)  updateData.isActive = isActive;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

    // If phone is being changed, ensure it is not already taken by another account
    if (phone !== undefined) {
      const phoneConflict = await User.findOne({ phone, _id: { $ne: id } }).lean();
      if (phoneConflict) {
        throw new AppError(
          'This phone number is already registered with another account',
          409,
          'PHONE_ALREADY_EXISTS'
        );
      }
      updateData.phone = phone;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError(
        'At least one field is required to update the account',
        400,
        'INVALID_UPDATE_PAYLOAD'
      );
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).select('-__v -refreshToken');

    if (!user) {
      throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  static async deleteAccount(id, requestingUserId) {
    if (id === requestingUserId) {
      throw new AppError(
        'You cannot delete your own admin account',
        400,
        'SELF_DELETE_FORBIDDEN'
      );
    }

    const user = await User.findById(id).lean();
    if (!user) {
      throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
    }

    await User.findByIdAndDelete(id);

    return { deletedId: id };
  }

  static async getAllAccounts({ role, isActive, isBlocked, search, page = 1, limit = 10 }) {
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true' || isBlocked === true;

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-__v -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    return { items, total, page: pageNum, limit: limitNum };
  }

  static async getAccountById(id) {
    const user = await User.findById(id).select('-__v -refreshToken').lean();
    if (!user) {
      throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  static async sendLoginOtp(phone) {
    const normalizedPhone = normalizePhone(phone);

    const admin = await User.findOne({ phone: normalizedPhone, role: USER_ROLES.ADMIN }).lean();
    if (!admin) {
      // Generic message — don't reveal if number is registered
      throw new AppError('No admin account found with this phone number', 404, 'ADMIN_NOT_FOUND');
    }

    if (!admin.isActive) {
      throw new AppError('Your account has been deactivated. Contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    if (admin.isBlocked) {
      throw new AppError('Your account has been suspended. Contact support.', 403, 'ACCOUNT_BLOCKED');
    }

    return OtpService.sendOtp(normalizedPhone);
  }

  static async login({ phone, otp, deviceToken, platform = 'android' }) {
    const normalizedPhone = normalizePhone(phone);

    // 1. Verify OTP via Redis
    await OtpService.verifyOtp(normalizedPhone, otp);

    // 2. Fetch the admin
    const admin = await User.findOne({ phone: normalizedPhone, role: USER_ROLES.ADMIN });
    if (!admin) {
      throw new AppError('Admin account not found', 404, 'ADMIN_NOT_FOUND');
    }

    if (!admin.isActive) {
      throw new AppError('Your account has been deactivated. Contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    if (admin.isBlocked) {
      throw new AppError('Your account has been suspended. Contact support.', 403, 'ACCOUNT_BLOCKED');
    }

    // 3. Generate JWT token pair
    const tokenPayload = {
      userId: admin._id.toString(),
      role:   admin.role,
      phone:  admin.phone
    };

    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 4. Persist hashed refresh token + update login metadata
    admin.refreshToken    = hashToken(refreshToken);
    admin.lastLoginAt     = new Date();
    admin.isPhoneVerified = true;

    if (deviceToken) {
      admin.deviceToken    = deviceToken;
      admin.devicePlatform = platform || 'android';
    }

    await admin.save();

    return {
      admin: {
        id:              admin._id,
        phone:           admin.phone,
        name:            admin.name,
        email:           admin.email,
        role:            admin.role,
        profileImage:    admin.profileImage,
        isPhoneVerified: admin.isPhoneVerified,
        lastLoginAt:     admin.lastLoginAt
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  static async refreshTokens(rawRefreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const admin = await User.findById(decoded.userId).select('+refreshToken');

    if (!admin || admin.role !== USER_ROLES.ADMIN) {
      throw new AppError('Admin account not found', 404, 'ADMIN_NOT_FOUND');
    }

    if (!admin.isActive || admin.isBlocked) {
      throw new AppError('Account is inactive or suspended', 403, 'ACCOUNT_INACTIVE');
    }

    if (!admin.refreshToken || admin.refreshToken !== tokenHash) {
      admin.refreshToken = null;
      await admin.save();
      throw new AppError('Invalid or revoked token. Please login again.', 401, 'SUSPICIOUS_TOKEN_REUSE');
    }

    const tokenPayload = {
      userId: admin._id.toString(),
      role:   admin.role,
      phone:  admin.phone
    };

    const newAccessToken  = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    admin.refreshToken = hashToken(newRefreshToken);
    await admin.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(adminId) {
    if (adminId) {
      await User.findByIdAndUpdate(adminId, { refreshToken: null });
    }
    return true;
  }

  static resolveDateRange(range = '30day') {
    const normalized = String(range || '30day').trim().toLowerCase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const presets = {
      today: {
        from: todayStart,
        to: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        label: 'Today',
        seriesType: 'day'
      },
      '7day': {
        from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
        to: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        label: '7 Days',
        seriesType: 'day'
      },
      '30day': {
        from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29),
        to: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        label: '30 Days',
        seriesType: 'day'
      },
      '3month': {
        from: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        to: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        label: '3 Months',
        seriesType: 'month'
      },
      '1year': {
        from: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        to: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        label: '1 Year',
        seriesType: 'month'
      }
    };

    return presets[normalized] || presets['30day'];
  }

  static async getOverview({ range = '30day' } = {}) {
    const dateRange = this.resolveDateRange(range);
    const now = new Date();
    const baseMatch = { createdAt: { $gte: dateRange.from, $lt: dateRange.to } };

    const [
      totalUsers,
      activeDrivers,
      totalRides,
      totalRevenueResult,
      newUsers,
      newDrivers,
      pendingDocuments,
      todayRechargeResult,
      monthlyRevenue,
      weeklyRideSeries,
      weeklyGrowthSeries
    ] = await Promise.all([
      User.countDocuments({ role: USER_ROLES.USER }),
      Driver.countDocuments({
        $or: [
          { onlineStatus: 'online' },
          { onlineStatus: 'busy' },
          { subscriptionStatus: 'active' }
        ]
      }),
      Booking.countDocuments(baseMatch),
      Booking.aggregate([
        {
          $match: {
            ...baseMatch,
            status: BOOKING_STATUS.TRIP_COMPLETED,
            paymentStatus: PAYMENT_STATUS.PAID
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $add: ['$fare', '$tokenMoney'] } }
          }
        }
      ]),
      User.countDocuments({
        role: USER_ROLES.USER,
        ...baseMatch
      }),
      User.countDocuments({
        role: USER_ROLES.DRIVER,
        ...baseMatch
      }),
      Document.countDocuments({ status: 'pending' }),
      UserPackage.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            ...baseMatch
          }
        },
        {
          $group: {
            _id: null,
            totalRecharge: { $sum: '$finalAmount' }
          }
        }
      ]),
      this.getMonthlyRevenueSeries(dateRange),
      this.getWeeklyRideSeries(dateRange),
      this.getWeeklyGrowthSeries(dateRange)
    ]);

    const totalRevenue = Number(totalRevenueResult[0]?.totalRevenue || 0);
    const todayRecharge = Number(todayRechargeResult[0]?.totalRecharge || 0);

    return {
      range: {
        value: String(range || '30day').trim().toLowerCase(),
        label: dateRange.label,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      },
      summary: {
        totalUsers,
        activeDrivers,
        totalRides,
        totalRevenue,
        newUsers,
        newDrivers,
        pendingDocuments,
        todayRecharge
      },
      financialOverview: monthlyRevenue,
      weeklyRide: weeklyRideSeries,
      userDriverGrowth: weeklyGrowthSeries
    };
  }

  static async getMonthlyRevenueSeries(dateRange = this.resolveDateRange('30day')) {
    const now = new Date();
    const start = new Date(dateRange.from);
    const end = new Date(dateRange.to);
    const monthLabels = [];
    const monthStartDates = [];

    if (dateRange.seriesType === 'month') {
      const monthsBack = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      for (let i = monthsBack; i >= 0; i -= 1) {
        const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
        monthLabels.push(date.toLocaleString('en-US', { month: 'short' }));
        monthStartDates.push(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    } else {
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        monthLabels.push(date.toLocaleString('en-US', { month: 'short' }));
        monthStartDates.push(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    }

    const monthlyData = await Booking.aggregate([
      {
        $match: {
          status: BOOKING_STATUS.TRIP_COMPLETED,
          paymentStatus: PAYMENT_STATUS.PAID,
          createdAt: { $gte: dateRange.from, $lt: dateRange.to }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: { $add: ['$fare', '$tokenMoney'] } }
        }
      }
    ]);

    const groupKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const revenueMap = new Map();

    for (const item of monthlyData) {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      revenueMap.set(key, Number((revenueMap.get(key) || 0) + Number(item.revenue || 0)));
    }

    return monthStartDates.map((date, index) => ({
      month: monthLabels[index],
      revenue: Number(revenueMap.get(groupKey(date)) || 0)
    }));
  }

  static async getWeeklyRideSeries(dateRange = this.resolveDateRange('30day')) {
    const start = new Date(dateRange.from);
    const end = new Date(dateRange.to);
    const points = [];

    if (dateRange.seriesType === 'month') {
      const monthCount = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
      for (let i = monthCount - 1; i >= 0; i -= 1) {
        const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
        points.push({
          key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          label: date.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    } else {
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i - 1);
        points.push({
          key: date.toISOString().slice(0, 10),
          label: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
    }

    const rides = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.from, $lt: dateRange.to }
        }
      },
      {
        $group: {
          _id: dateRange.seriesType === 'month'
            ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
            : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          rides: { $sum: 1 }
        }
      }
    ]);

    const rideMap = new Map(rides.map((item) => [item._id, item.rides]));

    return points.map((point) => ({
      day: point.label,
      rides: Number(rideMap.get(point.key) || 0)
    }));
  }

  static async getWeeklyGrowthSeries(dateRange = this.resolveDateRange('30day')) {
    const start = new Date(dateRange.from);
    const end = new Date(dateRange.to);
    const points = [];

    if (dateRange.seriesType === 'month') {
      const monthCount = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
      for (let i = monthCount - 1; i >= 0; i -= 1) {
        const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
        points.push({
          key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          label: date.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    } else {
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i - 1);
        points.push({
          key: date.toISOString().slice(0, 10),
          label: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
    }

    const [userGrowth, driverGrowth] = await Promise.all([
      User.aggregate([
        {
          $match: {
            role: USER_ROLES.USER,
            createdAt: { $gte: dateRange.from, $lt: dateRange.to }
          }
        },
        {
          $group: {
            _id: dateRange.seriesType === 'month'
              ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
              : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            users: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $match: {
            role: USER_ROLES.DRIVER,
            createdAt: { $gte: dateRange.from, $lt: dateRange.to }
          }
        },
        {
          $group: {
            _id: dateRange.seriesType === 'month'
              ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
              : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            drivers: { $sum: 1 }
          }
        }
      ])
    ]);

    const userMap = new Map(userGrowth.map((item) => [item._id, item.users]));
    const driverMap = new Map(driverGrowth.map((item) => [item._id, item.drivers]));

    return points.map((point) => ({
      day: point.label,
      users: Number(userMap.get(point.key) || 0),
      drivers: Number(driverMap.get(point.key) || 0)
    }));
  }
}

export default AdminService;
