import rateLimit from 'express-rate-limit';

const defaultWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 mins
const defaultMax = Number(process.env.RATE_LIMIT_MAX) || 200;

export const globalRateLimiter = rateLimit({
  windowMs: defaultWindowMs,
  max: defaultMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      code: 'TOO_MANY_REQUESTS',
      data: null
    });
  }
});

// Stricter rate limiting for sensitive auth routes (OTP send/verify)
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // max 15 requests per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 5 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      data: null
    });
  }
});
