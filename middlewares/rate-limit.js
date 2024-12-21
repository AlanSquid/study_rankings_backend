const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 每 30 分鐘
  max: 5, // 只允許 5 次請求
  message: {
    success: false,
    status: 429,
    message: "Too many requests, please try again later.",
  }
});

const smsLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 每 30 分鐘
  max: 5, // 只允許 5 次請求
  message: {
    success: false,
    status: 429,
    message: "Too many requests, please try again later.",
  }
});

module.exports = {
  emailLimiter,
  smsLimiter
}