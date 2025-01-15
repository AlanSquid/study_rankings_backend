import rateLimit from 'express-rate-limit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

export const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 每 30 分鐘
  max: 5, // 只允許 5 次請求
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

export const smsLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 每 2 分鐘
  max: 1, // 只允許 1 次請求
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  handler: (req, res, next, options) => {
    const resetTime = dayjs(req.rateLimit.resetTime);
    const now = dayjs();
    const retryAfter = resetTime.diff(now, 'second');
    res.setHeader('Access-Control-Expose-Headers', 'Retry-After', retryAfter);
    res.status(options.statusCode).json(options.message);
  }
});

export const smsLimiterMax = rateLimit({
  windowMs: 30 * 60 * 1000, // 每 30 分鐘
  max: 5, // 只允許 5 次請求
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

export const refreshTokenLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 分鐘
  max: 5, // 只允許 5 次請求
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});
