const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 每 1 分鐘
  max: 3, // 只允許 3 次請求
  message: "Too many requests, please try again later."
});

const smsLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 每 2 分鐘
  max: 1, // 只允許 1 次請求
  message: {
    message: "Too many requests, please try again later.",
  }
});

module.exports = {
  emailLimiter,
  smsLimiter
}