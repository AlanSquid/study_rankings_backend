import rateLimit from 'express-rate-limit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 每 30 分鐘
  max: 5, // 只允許 5 次請求
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

const smsLimiter = rateLimit({
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
    res.setHeader('Retry-After', retryAfter);
    res.status(options.statusCode).json(options.message);
  }
});

const smsLimiterMax = rateLimit({
  windowMs: 30 * 60 * 1000, // 每 30 分鐘
  max: 5, // 只允許 5 次請求
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

export default {
  emailLimiter,
  smsLimiter,
  smsLimiterMax
};
