import PackageService from '../services/package.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';

export const createPackage = async (req, res, next) => {
  try {
    const pkg = await PackageService.createPackage(req.body);
    return sendCreated(res, 'Package created successfully', pkg);
  } catch (error) {
    next(error);
  }
};

export const getPackages = async (req, res, next) => {
  try {
    const { packages } = await PackageService.getPackages(req.query);
    return sendSuccess(res, 'Packages retrieved successfully', packages);
  } catch (error) {
    next(error);
  }
};

export const getPackageById = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const pkg = await PackageService.getPackageById(packageId);
    return sendSuccess(res, 'Package details retrieved', pkg);
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const updated = await PackageService.updatePackage(packageId, req.body);
    return sendSuccess(res, 'Package updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    await PackageService.deletePackage(packageId);
    return sendSuccess(res, 'Package deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export const buyPackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const purchased = await PackageService.buyPackage(req.user.id, packageId, req.body);
    return sendCreated(res, 'Package purchased successfully', purchased);
  } catch (error) {
    next(error);
  }
};

export const getMyPackages = async (req, res, next) => {
  try {
    const packages = await PackageService.getMyPackages(req.user.id);
    return sendSuccess(res, 'User packages retrieved successfully', packages);
  } catch (error) {
    next(error);
  }
};

export const getAllUserPackages = async (req, res, next) => {
  try {
    const packages = await PackageService.getAllUserPackages(req.query);
    return sendSuccess(res, 'All user package purchases retrieved successfully', Array.isArray(packages) ? packages : (packages.items || []));
  } catch (error) {
    next(error);
  }
};

export const updateUserPackageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await PackageService.updateUserPackageStatus(id, status);
    return sendSuccess(res, 'User package status updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export default {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  buyPackage,
  getMyPackages,
  getAllUserPackages,
  updateUserPackageStatus
};
