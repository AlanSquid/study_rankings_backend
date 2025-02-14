import authServices from '../services/auth-services.js';
import formatResponse from '../lib/utils/formatResponse.js';
// import { google } from 'googleapis';

const authController = {
  refresh: async (req, res, next) => {
    try {
      const data = await authServices.refresh(req);
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      const data = await authServices.login(req);
      // 從data抽出refreshToken
      const { refreshToken, ...restData } = data;
      // 設定 refreshToken 為 HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
      });
      res.json(formatResponse(restData));
    } catch (err) {
      next(err);
    }
  },
  logout: async (req, res, next) => {
    try {
      const data = await authServices.logout(req);
      res.clearCookie('refreshToken');
      res.json(formatResponse(data));
    } catch (err) {
      next(err);
    }
  },
  register: async (req, res, next) => {
    try {
      const data = await authServices.register(req);
      // 從data抽出refreshToken
      const { refreshToken, ...restData } = data;
      // 設定 refresh token 為 HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
      });
      res.json(formatResponse(restData));
    } catch (err) {
      // 手機驗證碼錯誤特殊處理
      if (err.status === 400) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Validation error',
          errors: { verificationCode: err.message }
        });
      }
      next(err);
    }
  }
};

export default authController;
