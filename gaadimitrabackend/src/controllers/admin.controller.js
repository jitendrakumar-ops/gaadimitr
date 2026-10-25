import AdminService from '../services/admin.service.js';
import NotificationService from '../services/notification.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';

export const createAccount = async (req, res, next) => {
  try {
    const { phone, name, gender, email, role, address, isActive } = req.body;

    const newUser = await AdminService.createAccount({
      phone,
      name,
      gender,
      email,
      role,
      address,
      isActive
    });

    return sendCreated(res, 'Account created successfully', newUser);
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await AdminService.updateAccount(id, req.body, req.user.id);

    return sendSuccess(res, 'Account updated successfully', user);
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    await AdminService.deleteAccount(id, req.user.id);

    return sendSuccess(res, 'Account deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export const getAllAccounts = async (req, res, next) => {
  try {
    const { role, isActive, isBlocked, search, page, limit } = req.query;

    const { items, total, page: pageNum, limit: limitNum } = await AdminService.getAllAccounts({
      role,
      isActive,
      isBlocked,
      search,
      page,
      limit
    });

    return sendPaginated(res, 'Accounts fetched successfully', items, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

export const getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await AdminService.getAccountById(id);

    return sendSuccess(res, 'Account fetched successfully', user);
  } catch (error) {
    next(error);
  }
};


export const sendLoginOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await AdminService.sendLoginOtp(phone);
    return sendSuccess(res, 'OTP sent successfully', result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phone, otp, deviceToken, platform } = req.body;
    const result = await AdminService.login({ phone, otp, deviceToken, platform });
    return sendSuccess(res, 'Admin login successful', result);
  } catch (error) {
    next(error);
  }
};

export const refreshAdminTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AdminService.refreshTokens(refreshToken);
    return sendSuccess(res, 'Tokens refreshed successfully', tokens);
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    await AdminService.logout(req.user?.id);
    return sendSuccess(res, 'Logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

export const sendPushNotification = async (req, res, next) => {
  try {
    const { title, body, type, target, role, userId, recipientId, userIds, data } = req.body;
    const result = await NotificationService.sendAdminNotification({
      title,
      body,
      type,
      target,
      role,
      userId,
      recipientId,
      userIds,
      data
    });

    return sendSuccess(res, 'Push notification sent successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getAdminNotifications = async (req, res, next) => {
  try {
    const { search, type, isRead, page, limit } = req.query;
    const { items, total, page: pageNum, limit: limitNum } = await NotificationService.getAllNotifications({
      search,
      type,
      isRead,
      page,
      limit
    });

    return sendPaginated(res, 'Notifications retrieved successfully', items, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

export const getOverview = async (req, res, next) => {
  try {
    const range = req.query.range || req.query.date || '30day';
    const overview = await AdminService.getOverview({ range });
    return sendSuccess(res, 'Dashboard overview fetched successfully', overview);
  } catch (error) {
    next(error);
  }
};
