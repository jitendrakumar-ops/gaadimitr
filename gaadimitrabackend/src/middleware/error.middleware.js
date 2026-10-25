import { ZodError } from 'zod';
import { AppError } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let data = err.details || null;

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    data = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }
  // 2. Mongoose CastError (invalid ObjectId, etc.)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
    data = null;
  }
  // 3. Mongoose Duplicate Key Error (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
    data = null;
  }
  // 4. Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const firstKey = Object.keys(err.errors || {})[0];
    message = firstKey ? err.errors[firstKey].message : 'Validation error';
    data = null;
  }
  // 5. JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
    data = null;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
    data = null;
  }

  // Log 5xx errors
  if (statusCode >= 500) {
    logger.error({
      err: {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
        code: err.code
      },
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    }, 'Unhandled Server Error');
  }

  // Clean response
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    data: data || null
  });
};

export const notFoundHandler = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
    data: null
  });
};
