import db from '../models/index.js';
const { User } = db;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import createError from 'http-errors';
import { emailVerification, smsVerification } from '../lib/verification.js';
import loginAttemptManager from '../lib/login-attempt.js';
import generateJWT from '../lib/utils/generateJWT.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

const authServices = {
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
    const accessToken = await generateJWT.getAccessToken(user);

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

    const accessToken = await generateJWT.getAccessToken(user);
    const refreshToken = generateJWT.getRefreshToken(user);

    // accessToken回傳json給前端，refreshToken回傳httpOnly cookie
    return { success: true, user, accessToken, refreshToken };
  },
  logout: async (req) => {
    return { success: true, message: 'Logged out' };
  },
  register: async (req) => {
    const { name, phone, email, password, verificationCode } = req.body;

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

    // 驗證手機號碼
    await smsVerification.verifyPhone(phone, verificationCode);

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

    const accessToken = await generateJWT.getAccessToken(user);
    const refreshToken = generateJWT.getRefreshToken(user);

    // 註冊成功寄送email驗證信
    await emailVerification.sendVerificationEmail(user.id, email);

    // accessToken回傳json給前端，refreshToken回傳httpOnly cookie
    return { success: true, accessToken, refreshToken };
  }
};

export default authServices;
