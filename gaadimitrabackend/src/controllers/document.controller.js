import DocumentService from '../services/document.service.js';
import S3Service from '../services/s3.service.js';
import { sendSuccess } from '../utils/response.js';


export const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await DocumentService.getDriverDocuments(req.driver._id);
    return sendSuccess(res, 'Driver documents retrieved successfully', documents);
  } catch (error) {
    next(error);
  }
};

export const getDriverDocuments = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const documents = await DocumentService.getDriverDocuments(driverId);
    return sendSuccess(res, 'Driver documents retrieved successfully', documents);
  } catch (error) {
    next(error);
  }
};

export const updateDocuments = async (req, res, next) => {
  try {
    let payload = { ...req.body };

    // If body came as JSON string in multipart form, parse nested objects if needed
    for (const key of ['drivingLicense', 'rc', 'insurance', 'permit', 'aadharCard']) {
      if (typeof payload[key] === 'string') {
        try {
          payload[key] = JSON.parse(payload[key]);
        } catch {
          // ignore if plain string
        }
      }
    }

    // Process file uploads if multipart/form-data was used
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploadResult = await S3Service.uploadFile(file, 'driver-documents');
        const field = file.fieldname;

        if (field === 'dlFrontPhoto') {
          payload.drivingLicense = { ...payload.drivingLicense, frontPhoto: uploadResult.url };
        } else if (field === 'dlBackPhoto') {
          payload.drivingLicense = { ...payload.drivingLicense, backPhoto: uploadResult.url };
        } else if (field === 'rcFrontPhoto') {
          payload.rc = { ...payload.rc, frontPhoto: uploadResult.url };
        } else if (field === 'rcBackPhoto') {
          payload.rc = { ...payload.rc, backPhoto: uploadResult.url };
        } else if (field === 'insurancePhoto') {
          payload.insurance = { ...payload.insurance, photo: uploadResult.url };
        } else if (field === 'permitPhoto') {
          payload.permit = { ...payload.permit, photo: uploadResult.url };
        } else if (field === 'aadharFrontPhoto') {
          payload.aadharCard = { ...payload.aadharCard, frontPhoto: uploadResult.url };
        } else if (field === 'aadharBackPhoto') {
          payload.aadharCard = { ...payload.aadharCard, backPhoto: uploadResult.url };
        }
      }
    }

    const updated = await DocumentService.updateDocuments(req.driver._id, req.user._id, payload);
    return sendSuccess(res, 'Driver documents updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const updateSpecificDocument = async (req, res, next) => {
  try {
    const { docType } = req.params;
    const docData = { ...req.body };

    // Process files if uploaded
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploadResult = await S3Service.uploadFile(file, `driver-documents/${docType}`);
        if (file.fieldname === 'frontPhoto' || file.fieldname === 'front') {
          docData.frontPhoto = uploadResult.url;
        } else if (file.fieldname === 'backPhoto' || file.fieldname === 'back') {
          docData.backPhoto = uploadResult.url;
        } else if (file.fieldname === 'photo' || file.fieldname === 'document') {
          docData.photo = uploadResult.url;
          // also set frontPhoto if docType expects frontPhoto
          if (['drivingLicense', 'rc', 'aadharCard', 'aadhar'].includes(docType) && !docData.frontPhoto) {
            docData.frontPhoto = uploadResult.url;
          }
        }
      }
    } else if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, `driver-documents/${docType}`);
      if (['drivingLicense', 'rc', 'aadharCard', 'aadhar'].includes(docType)) {
        docData.frontPhoto = uploadResult.url;
      } else {
        docData.photo = uploadResult.url;
      }
    }

    const updated = await DocumentService.updateSpecificDocument(
      req.driver._id,
      req.user._id,
      docType,
      docData
    );

    return sendSuccess(res, `${docType} document updated successfully`, updated);
  } catch (error) {
    next(error);
  }
};

export const verifyDocuments = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { status, rejectionReason, itemVerifications } = req.body;

    const updated = await DocumentService.verifyDocuments(driverId, {
      status,
      rejectionReason,
      itemVerifications
    });

    return sendSuccess(res, `Driver documents verification status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

export const getAllDriverDocuments = async (req, res, next) => {
  try {
    const drivers = await DocumentService.getAllDriverDocuments({
      search: req.query.search
    });
    return sendSuccess(res, 'Driver documents retrieved successfully', drivers);
  } catch (error) {
    next(error);
  }
};

export default {
  getMyDocuments,
  getDriverDocuments,
  updateDocuments,
  updateSpecificDocument,
  verifyDocuments,
  getAllDriverDocuments
};
