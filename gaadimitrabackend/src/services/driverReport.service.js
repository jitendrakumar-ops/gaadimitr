import Driver from '../models/Driver.js';
import DriverReport from '../models/DriverReport.js';
import User from '../models/User.js';
import { AppError } from '../utils/helpers.js';

class DriverReportService {
  static async createDriverReport({ userId, driverId, reason }) {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
    }

    const report = await DriverReport.create({
      userId,
      driverId,
      reason
    });

    return report;
  }

  static async getAllReports({ search, driverId, userId, page = 1, limit = 10 } = {}) {
    const filter = {};

    if (driverId) filter.driverId = driverId;
    if (userId) filter.userId = userId;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const matchedUsers = await User.find({
        $or: [
          { name: searchRegex },
          { phone: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');

      const userIds = matchedUsers.map((u) => u._id);

      const matchedDrivers = await Driver.find({ userId: { $in: userIds } }).select('_id');
      const driverIds = matchedDrivers.map((d) => d._id);

      filter.$or = [
        { reason: searchRegex },
        { userId: { $in: userIds } },
        { driverId: { $in: driverIds } }
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      DriverReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name phone email profileImage role')
        .populate({
          path: 'driverId',
          select: 'vehicleModel vehicleNo type rating totalRatingsCount userId',
          populate: {
            path: 'userId',
            select: 'name phone email profileImage'
          }
        })
        .lean(),
      DriverReport.countDocuments(filter)
    ]);

    return { reports, total, page: pageNum, limit: limitNum };
  }
}

export default DriverReportService;
