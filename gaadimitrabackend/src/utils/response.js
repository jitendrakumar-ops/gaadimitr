/**
 * Standard API Response Utilities
 */

export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendCreated = (res, message = 'Resource created successfully', data = null) => {
  return sendSuccess(res, message, data, 201);
};

export const sendError = (
  res,
  message = 'An error occurred',
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  data = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    data
  });
};

export const sendPaginated = (
  res,
  message = 'Success',
  items = [],
  total = 0,
  page = 1,
  limit = 10
) => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  });
};
