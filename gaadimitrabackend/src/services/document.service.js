import Document from '../models/Document.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { AppError } from '../utils/helpers.js';

export class DocumentService {
  /**
   * Get or initialize documents for a driver (supports driverId or userId)
   */
  static async getDriverDocuments(driverId) {
    let document = await Document.findOne({
      $or: [{ driverId }, { userId: driverId }]
    });

    if (!document) {
      let driver = await Driver.findById(driverId);
      if (!driver) {
        // Also check if driverId passed is actually the userId of a driver
        driver = await Driver.findOne({ userId: driverId });
      }

      if (!driver) {
        // Check if user exists with role === 'driver' and auto-create Driver profile
        const user = await User.findOne({ _id: driverId, role: 'driver' });
        if (user) {
          driver = await Driver.create({ userId: user._id });
        }
      }

      if (!driver) {
        throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
      }

      document = await Document.findOne({ driverId: driver._id });
      if (!document) {
        document = await Document.create({
          driverId: driver._id,
          userId: driver.userId
        });
      }
    }
    return document;
  }

  /**
   * Update or upsert full or partial driver documents
   */
  static async updateDocuments(driverId, userId, data = {}) {
    let document = await Document.findOne({ driverId });

    if (!document) {
      document = new Document({
        driverId,
        userId
      });
    }

    if (data.drivingLicense) {
      document.drivingLicense = {
        ...document.drivingLicense?.toObject?.() || document.drivingLicense,
        ...data.drivingLicense
      };
    }

    if (data.rc) {
      document.rc = {
        ...document.rc?.toObject?.() || document.rc,
        ...data.rc
      };
    }

    if (data.insurance) {
      document.insurance = {
        ...document.insurance?.toObject?.() || document.insurance,
        ...data.insurance
      };
    }

    if (data.permit) {
      document.permit = {
        ...document.permit?.toObject?.() || document.permit,
        ...data.permit
      };
    }

    if (data.aadharCard) {
      document.aadharCard = {
        ...document.aadharCard?.toObject?.() || document.aadharCard,
        ...data.aadharCard
      };
    }

    // Reset status to pending upon document update
    document.status = 'pending';
    document.rejectionReason = null;

    await document.save();
    return document;
  }

  /**
   * Update a specific document category (e.g. drivingLicense, rc, insurance, permit, aadharCard)
   */
  static async updateSpecificDocument(driverId, userId, docType, docData) {
    const validDocTypes = ['drivingLicense', 'rc', 'insurance', 'permit', 'aadharCard', 'aadhar'];
    const normalizedType = docType === 'aadhar' ? 'aadharCard' : docType;

    if (!validDocTypes.includes(docType)) {
      throw new AppError(
        `Invalid document type '${docType}'. Must be one of: drivingLicense, rc, insurance, permit, aadharCard`,
        400,
        'INVALID_DOC_TYPE'
      );
    }

    const payload = {};
    payload[normalizedType] = docData;
    return await this.updateDocuments(driverId, userId, payload);
  }

  /**
   * Admin verifies or rejects driver documents
   */
  static async verifyDocuments(driverId, { status, rejectionReason, itemVerifications = {} }) {
    let document = await Document.findOne({
      $or: [{ driverId }, { userId: driverId }]
    });

    if (!document) {
      document = await this.getDriverDocuments(driverId);
    }

    if (!document) {
      throw new AppError('Documents not found for this driver', 404, 'DOCUMENTS_NOT_FOUND');
    }

    if (status) {
      document.status = status;
    }

    if (rejectionReason !== undefined) {
      document.rejectionReason = rejectionReason;
    }

    if (itemVerifications.drivingLicense !== undefined) {
      document.drivingLicense.isVerified = itemVerifications.drivingLicense;
    }
    if (itemVerifications.rc !== undefined) {
      document.rc.isVerified = itemVerifications.rc;
    }
    if (itemVerifications.insurance !== undefined) {
      document.insurance.isVerified = itemVerifications.insurance;
    }
    if (itemVerifications.permit !== undefined) {
      document.permit.isVerified = itemVerifications.permit;
    }
    if (itemVerifications.aadharCard !== undefined) {
      document.aadharCard.isVerified = itemVerifications.aadharCard;
    }

    await document.save();
    return document;
  }

  /**
   * Admin lists all drivers with their document status and details
   */
  static async getAllDriverDocuments({ search } = {}) {
    const drivers = await Driver.find()
      .populate('userId')
      .populate('vehicleId')
      .sort({ createdAt: -1 })
      .lean();

    const documents = await Document.find().lean();
    const docMap = new Map();
    documents.forEach((doc) => {
      if (doc.driverId) docMap.set(doc.driverId.toString(), doc);
      if (doc.userId) docMap.set(doc.userId.toString(), doc);
    });

    const driverUserIds = new Set(
      drivers.map((d) => d.userId?._id?.toString() || d.userId?.toString()).filter(Boolean)
    );

    const orphanUserFilter = {
      role: 'driver',
      _id: { $nin: Array.from(driverUserIds) }
    };

    const orphanUsers = await User.find(orphanUserFilter).lean();

    const formatDocs = (doc, fallbackVehicleNo = '') => [
      {
        id: 'doc-dl',
        key: 'drivingLicense',
        type: 'Driving Licence',
        number: doc?.drivingLicense?.dlNo || '',
        file: null,
        url: doc?.drivingLicense?.frontPhoto || doc?.drivingLicense?.backPhoto || '',
        status: doc?.drivingLicense?.isVerified ? 'approved' : 'pending',
        uploadedAt: doc?.updatedAt
          ? new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-'
      },
      {
        id: 'doc-rc',
        key: 'rc',
        type: 'Vehicle RC',
        number: doc?.rc?.rcNo || fallbackVehicleNo || '',
        file: null,
        url: doc?.rc?.frontPhoto || doc?.rc?.backPhoto || '',
        status: doc?.rc?.isVerified ? 'approved' : 'pending',
        uploadedAt: doc?.updatedAt
          ? new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-'
      },
      {
        id: 'doc-insurance',
        key: 'insurance',
        type: 'Vehicle Insurance',
        number: doc?.insurance?.insuranceNo || '',
        file: null,
        url: doc?.insurance?.photo || '',
        status: doc?.insurance?.isVerified ? 'approved' : 'pending',
        uploadedAt: doc?.updatedAt
          ? new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-'
      },
      {
        id: 'doc-permit',
        key: 'permit',
        type: 'Commercial Permit',
        number: doc?.permit?.permitNo || '',
        file: null,
        url: doc?.permit?.photo || '',
        status: doc?.permit?.isVerified ? 'approved' : 'pending',
        uploadedAt: doc?.updatedAt
          ? new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-'
      },
      {
        id: 'doc-aadhar',
        key: 'aadharCard',
        type: 'Aadhaar Card',
        number: doc?.aadharCard?.cardNo || '',
        file: null,
        url: doc?.aadharCard?.frontPhoto || doc?.aadharCard?.backPhoto || '',
        status: doc?.aadharCard?.isVerified ? 'approved' : 'pending',
        uploadedAt: doc?.updatedAt
          ? new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-'
      }
    ];

    const results = [];

    for (const d of drivers) {
      const user = d.userId || {};
      const doc = docMap.get(d._id.toString()) || docMap.get(user._id?.toString()) || null;

      results.push({
        id: d._id.toString(),
        driverId: d._id.toString(),
        userId: user.code || (user._id ? 'GM' + user._id.toString().slice(-5).toUpperCase() : 'GM' + d._id.toString().slice(-5).toUpperCase()),
        userMongoId: user._id?.toString() || null,
        name: user.name || 'Unnamed Driver',
        phone: user.phone || '-',
        email: user.email || '-',
        profileImage: user.profileImage || null,
        joined: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-',
        location: typeof user.address === 'string' ? user.address : user.address?.city || 'Delhi',
        vehicleModel: d.vehicleModel || '',
        vehicleNo: d.vehicleNo || '',
        overallStatus: doc?.status || 'pending',
        documents: formatDocs(doc, d.vehicleNo),
        rawDocument: doc
      });
    }

    for (const u of orphanUsers) {
      const doc = docMap.get(u._id.toString()) || null;
      results.push({
        id: u._id.toString(),
        driverId: u._id.toString(),
        userId: u.code || 'GM' + u._id.toString().slice(-5).toUpperCase(),
        userMongoId: u._id.toString(),
        name: u.name || 'Unnamed Driver',
        phone: u.phone || '-',
        email: u.email || '-',
        profileImage: u.profileImage || null,
        joined: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '-',
        location: typeof u.address === 'string' ? u.address : u.address?.city || 'Delhi',
        vehicleModel: '',
        vehicleNo: '',
        overallStatus: doc?.status || 'pending',
        documents: formatDocs(doc),
        rawDocument: doc
      });
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      return results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.userId.toLowerCase().includes(q) ||
          r.vehicleNo.toLowerCase().includes(q)
      );
    }

    return results;
  }
}

export default DocumentService;
