const rateLimit = require('express-rate-limit');

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

module.exports = {
  emailLimiter,
  smsLimiter,
  smsLimiterMax
};
