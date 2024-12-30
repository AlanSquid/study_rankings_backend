const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const createError = require('http-errors');
const { emailVerification } = require('../lib/verification');
const loginAttemptManager = require('../lib/login-attempt');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

const authServices = {
  verifyJWT: async (req) => {
    const user = req.user;
    return { success: true, user };
  },
  refresh: async (req) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw createError(401, 'Unauthorized: Please login or token expired');
    }

    const user = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
          return reject(createError(401, 'Unauthorized: Please login or token expired'));
        }
        resolve(user);
      });
    });

    // 產生新的 access token
    const accessToken = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m'
    });

    return { success: true, accessToken };
  },
  login: async (req) => {
    const { phone } = req.body;

    // 登入嘗試管理
    if (loginAttemptManager.isLocked(req.ip, phone)) {
      const { lockUntil } = loginAttemptManager.getAttemptInfo(req.ip, phone);
      const lockMinutes = Math.ceil(dayjs(lockUntil).diff(dayjs(), 'minute', true));
      throw createError(
        429,
        `Account is locked. Please try again after ${lockMinutes} ${lockMinutes <= 1 ? 'minute' : 'minutes'}`
      );
    }

    const user = await new Promise((resolve, reject) => {
      passport.authenticate('local', { session: false }, (err, user) => {
        if (err) {
          return reject(createError(500, err.message));
        }
        if (!user) {
          const { remainingAttempts, lockMinutes } = loginAttemptManager.recordFailedAttempt(
            req.ip,
            phone
          );
          const message =
            lockMinutes > 0
              ? `Login failed. Account locked for ${lockMinutes} minutes`
              : `Login failed. ${remainingAttempts} attempts remaining`;
          return reject(createError(401, message));
        }
        loginAttemptManager.reset(req.ip, phone);
        resolve(user);
      })(req);
    });

    // 產生 tokens
    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign({ id: user.id, name: user.name }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m'
      }),
      jwt.sign({ id: user.id, name: user.name }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
      })
    ]);

    // accessToken回傳json給前端，refreshToken回傳httpOnly cookie
    return { success: true, user, accessToken, refreshToken };
  },
  logout: async (req) => {
    return { success: true, message: 'Logged out' };
  },
  register: async (req) => {
    const { name, phone, email, password } = req.body;

    // 檢查使用者是否已存在
    const existingUser = await User.findOne({
      where: {
        phone,
        isPhoneVerified: true
      }
    });
    if (existingUser) {
      throw createError(409, 'Phone number already registered');
    }

    // 密碼雜湊
    const hashedPassword = await bcrypt.hash(password, 10);

    // 建立新使用者
    const newUser = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      isPhoneVerified: true,
      isEmailVerified: false
    });

    const user = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email
    };

    // 產生 tokens
    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign({ id: user.id, name: user.name }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m'
      }),
      jwt.sign({ id: user.id, name: user.name }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
      })
    ]);

    // 註冊成功寄送email驗證信
    const verificationLink = await emailVerification.sendVerificationEmail(user.id, email);

    // accessToken回傳json給前端，refreshToken回傳httpOnly cookie
    return { success: true, user, verificationLink, accessToken, refreshToken };
  }
};

module.exports = authServices;
