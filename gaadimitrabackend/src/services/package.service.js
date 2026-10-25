import crypto from 'crypto';
import Package from '../models/Package.js';
import UserPackage from '../models/UserPackage.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { AppError } from '../utils/helpers.js';

export class PackageService {
  /**
   * Create a new package
   */
  static async createPackage(data) {
    const badgeName = data.badgeName || data.bedgeName || null;
    return await Package.create({
      serviceId: data.serviceId || null,
      dayType: data.dayType,
      price: data.price,
      off: data.off !== undefined ? data.off : 0,
      badgeName,
      name: data.name || '',
      description: data.description || '',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  /**
   * List packages with optional filters
   */
  static async getPackages(filters = {}) {
    const query = {};

    if (filters.serviceId) {
      query.serviceId = filters.serviceId;
    }

    if (filters.dayType) {
      query.dayType = filters.dayType;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    const pageNum = Math.max(1, Number(filters.page || 1));
    const limitNum = Math.min(100, Math.max(1, Number(filters.limit || 10)));
    const skip = (pageNum - 1) * limitNum;

    const [packages, total] = await Promise.all([
      Package.find(query)
        .sort({ price: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Package.countDocuments(query)
    ]);

    return { packages, total, page: pageNum, limit: limitNum };
  }

  /**
   * Get single package by ID
   */
  static async getPackageById(packageId) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    }
    return pkg;
  }

  /**
   * Update package
   */
  static async updatePackage(packageId, data) {
    const updateData = { ...data };
    if (updateData.bedgeName && !updateData.badgeName) {
      updateData.badgeName = updateData.bedgeName;
    }

    const updated = await Package.findByIdAndUpdate(packageId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    return updated;
  }

  /**
   * Delete package
   */
  static async deletePackage(packageId) {
    const deleted = await Package.findByIdAndDelete(packageId);
    if (!deleted) {
      throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    }
    return true;
  }

  /**
   * Buy a package
   */
  static async buyPackage(userId, packageId, { paymentMethod = 'upi', transactionId = null, vehicleId = null } = {}) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    if (!pkg.isActive) {
      throw new AppError('This package is currently inactive', 400, 'PACKAGE_INACTIVE');
    }

    // Check if user has an associated Driver profile
    const driver = await Driver.findOne({ userId });
    const driverId = driver ? driver._id : null;
    const resolvedVehicleId = vehicleId || (driver ? driver.vehicleId : null) || null;

    // Calculate pricing
    const discountAmount = Math.round(((pkg.price * (pkg.off || 0)) / 100) * 100) / 100;
    const finalAmount = Math.max(0, pkg.price - discountAmount);

    // Calculate expiry based on dayType
    const now = new Date();
    const lowerType = (pkg.dayType || '').toLowerCase();
    let expiryDate;

    if (lowerType.includes('1day')) {
      expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (lowerType.includes('week') || lowerType.includes('7 day')) {
      expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (lowerType.includes('month') || lowerType.includes('30 day')) {
      expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (lowerType.includes('year') || lowerType.includes('365 day')) {
      expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else {
      // Default 1 day for daily packages
      expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    const txnId = transactionId || `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const userPackage = await UserPackage.create({
      userId,
      driverId,
      packageId: pkg._id,
      serviceId: pkg.serviceId || null,
      vehicleId: resolvedVehicleId,
      dayType: pkg.dayType,
      finalAmount,
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: 'paid',
      transactionId: txnId,
      status: 'active',
      startDate: now,
      expiryDate
    });

    return userPackage;
  }

  /**
   * Get all packages purchased by a user
   */
  static async getMyPackages(userId) {
    return await UserPackage.find({ userId })
      .populate('packageId')
      .sort({ createdAt: -1 });
  }

  /**
   * Get all user package purchases for admin visibility
   */
  static async getAllUserPackages(filters = {}) {
    const query = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.packageId) {
      query.packageId = filters.packageId;
    }

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      const [matchedUsers, matchedPackages] = await Promise.all([
        User.find({
          $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }]
        }).select('_id').lean(),
        Package.find({
          $or: [{ name: searchRegex }, { dayType: searchRegex }, { badgeName: searchRegex }]
        }).select('_id').lean()
      ]);

      const userIds = matchedUsers.map(u => u._id);
      const pkgIds = matchedPackages.map(p => p._id);

      query.$or = [
        { userId: { $in: userIds } },
        { packageId: { $in: pkgIds } },
        { transactionId: searchRegex }
      ];
    }

    const items = await UserPackage.find(query)
      .populate('userId', 'name email phone profileImage role')
      .populate('packageId')
      .populate('vehicleId')
      .populate('driverId', 'name phone profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return items.map((item) => ({
      ...item,
      user: item.userId && typeof item.userId === 'object' ? item.userId : null,
      package: item.packageId && typeof item.packageId === 'object' ? item.packageId : null,
      vehicle: item.vehicleId && typeof item.vehicleId === 'object' ? item.vehicleId : null,
      driver: item.driverId && typeof item.driverId === 'object' ? item.driverId : null,
    }));
  }

  /**
   * Update status of user package (e.g. active, expired, cancelled)
   */
  static async updateUserPackageStatus(userPackageId, status) {
    const validStatuses = ['active', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status. Allowed: active, expired, cancelled', 400);
    }

    const updated = await UserPackage.findByIdAndUpdate(
      userPackageId,
      { status },
      { new: true }
    )
      .populate('userId', 'name email phone profileImage role')
      .populate('packageId')
      .populate('vehicleId')
      .populate('driverId', 'name phone profileImage')
      .lean();

    if (!updated) {
      throw new AppError('User package purchase record not found', 404);
    }

    return {
      ...updated,
      user: updated.userId && typeof updated.userId === 'object' ? updated.userId : null,
      package: updated.packageId && typeof updated.packageId === 'object' ? updated.packageId : null,
      vehicle: updated.vehicleId && typeof updated.vehicleId === 'object' ? updated.vehicleId : null,
      driver: updated.driverId && typeof updated.driverId === 'object' ? updated.driverId : null,
    };
  }
}

export default PackageService;
