import { expect } from 'chai';
import sinon from 'sinon';
import db from '../../../models/index.js';
const { User } = db;
import authServices from '../../../services/auth-services.js';
import { emailVerification, smsVerification } from '../../../lib/verification.js';
import loginAttemptManager from '../../../lib/login-attempt.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('auth-services Unit Test', () => {
  describe('refresh', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應回傳新的access token', async () => {
      const mockUser = { id: 1, name: 'test' };
      const mockRefreshToken = 'valid.refresh.token';
      const mockAccessToken = 'new.access.token';

      const req = {
        cookies: {
          refreshToken: mockRefreshToken
        }
      };

      sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        callback(null, mockUser);
      });

      sinon.stub(generateJWT, 'getAccessToken').resolves(mockAccessToken);

      const data = await authServices.refresh(req);

      expect(data.success).to.be.true;
      expect(data.accessToken).to.equal(mockAccessToken);
      expect(jwt.verify.calledWith(mockRefreshToken, process.env.JWT_REFRESH_SECRET)).to.be.true;
      expect(generateJWT.getAccessToken.calledOnce).to.be.true;
    });

    it('異常情境：未提供refresh token應拋出401錯誤', async () => {
      const req = { cookies: {} };

      try {
        await authServices.refresh(req);
        expect.fail('預期應拋出401錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.message).to.equal('Unauthorized: Please login or token expired');
      }
    });

    it('異常情境：無效的refresh token應拋出401錯誤', async () => {
      const req = {
        cookies: {
          refreshToken: 'invalid.token'
        }
      };

      sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        callback(new Error('Invalid token'));
      });

      try {
        await authServices.refresh(req);
        expect.fail('預期應拋出401錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.message).to.equal('Unauthorized: Please login or token expired');
        expect(jwt.verify.calledWith(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET)).to
          .be.true;
      }
    });
  });

  describe('login', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：登入成功應回傳tokens和使用者資料', async () => {
      const mockUser = {
        id: 1,
        name: 'test',
        email: 'test@example.com'
      };
      const mockAccessToken = 'access.token';
      const mockRefreshToken = 'refresh.token';
      const req = {
        ip: '127.0.0.1',
        body: {
          phone: '0912345678',
          password: 'password123'
        }
      };

      // 模擬 loginAttemptManager
      sinon.stub(loginAttemptManager, 'isLocked').returns(false);
      sinon.stub(loginAttemptManager, 'reset');

      sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
        return () => callback(null, mockUser);
      });

      sinon.stub(generateJWT, 'getAccessToken').resolves(mockAccessToken);
      sinon.stub(generateJWT, 'getRefreshToken').returns(mockRefreshToken);

      const data = await authServices.login(req);

      expect(data.success).to.be.true;
      expect(data.user).to.deep.equal(mockUser);
      expect(data.accessToken).to.equal(mockAccessToken);
      expect(data.refreshToken).to.equal(mockRefreshToken);
      expect(loginAttemptManager.isLocked.calledWith(req.ip, req.body.phone)).to.be.true;
      expect(loginAttemptManager.reset.calledWith(req.ip, req.body.phone)).to.be.true;
      expect(generateJWT.getAccessToken.calledWith(mockUser)).to.be.true;
      expect(generateJWT.getRefreshToken.calledWith(mockUser)).to.be.true;
    });

    it('異常情境：帳號被鎖定時應拋出429錯誤', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          phone: '0912345678',
          password: 'password123'
        }
      };

      const mockLockUntil = dayjs().add(5, 'minutes');
      sinon.stub(loginAttemptManager, 'isLocked').returns(true);
      sinon.stub(loginAttemptManager, 'getAttemptInfo').returns({ lockUntil: mockLockUntil });

      try {
        await authServices.login(req);
        expect.fail('預期應拋出429錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(429);
        expect(error.message).to.include('Account is locked');
        expect(loginAttemptManager.isLocked.calledWith(req.ip, req.body.phone)).to.be.true;
        expect(loginAttemptManager.getAttemptInfo.calledWith(req.ip, req.body.phone)).to.be.true;
      }
    });

    it('異常情境：登入失敗應記錄失敗次數並拋出401錯誤', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          phone: '0912345678',
          password: 'wrongPassword'
        }
      };

      sinon.stub(loginAttemptManager, 'isLocked').returns(false);
      sinon.stub(loginAttemptManager, 'recordFailedAttempt').returns({
        remainingAttempts: 2,
        lockMinutes: 0
      });

      sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
        return () => callback(null, false);
      });

      try {
        await authServices.login(req);
        expect.fail('預期應拋出401錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.message).to.equal('Login failed. 2 attempts remaining');
        expect(loginAttemptManager.recordFailedAttempt.calledWith(req.ip, req.body.phone)).to.be
          .true;
      }
    });

    it('異常情境：登入失敗且需要鎖定時應拋出401錯誤', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          phone: '0912345678',
          password: 'wrongPassword'
        }
      };

      sinon.stub(loginAttemptManager, 'isLocked').returns(false);
      sinon.stub(loginAttemptManager, 'recordFailedAttempt').returns({
        remainingAttempts: 0,
        lockMinutes: 30
      });

      sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
        return () => callback(null, false);
      });

      try {
        await authServices.login(req);
        expect.fail('預期應拋出401錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.message).to.equal('Login failed. Account locked for 30 minutes');
        expect(loginAttemptManager.recordFailedAttempt.calledWith(req.ip, req.body.phone)).to.be
          .true;
      }
    });

    it('異常情境：驗證出現錯誤應拋出500錯誤', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          phone: '0912345678',
          password: 'password123'
        }
      };

      sinon.stub(loginAttemptManager, 'isLocked').returns(false);
      sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
        return () => callback(new Error('Authentication error'));
      });

      try {
        await authServices.login(req);
        expect.fail('預期應拋出500錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(500);
        expect(error.message).to.equal('Authentication error');
      }
    });
  });

  describe('logout', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：登出成功', async () => {
      const req = {};

      const data = await authServices.logout(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Logged out');
    });
  });

  describe('register', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：註冊成功應回傳tokens和使用者資料', async () => {
      const mockReq = {
        body: {
          name: 'test',
          phone: '0912345678',
          email: 'test@example.com',
          password: 'password123',
          verificationCode: '123456'
        }
      };

      const mockHashedPassword = 'hashedPassword123';
      const mockAccessToken = 'access.token';
      const mockRefreshToken = 'refresh.token';
      const mockVerificationUrl = 'http://www.example.com/verify-email/code=code123';

      // 模擬找不到已存在用戶
      sinon.stub(User, 'findOne').resolves(null);
      // 模擬手機證碼正確
      sinon.stub(smsVerification, 'verifyPhone').resolves(true);
      // 模擬密碼加密
      sinon.stub(bcrypt, 'hash').resolves(mockHashedPassword);
      // 模擬建立新用戶
      sinon.stub(User, 'create').resolves({
        id: 1,
        name: mockReq.body.name,
        phone: mockReq.body.phone,
        email: mockReq.body.email,
        password: mockHashedPassword
      });
      // 模擬發送驗證郵件
      sinon.stub(emailVerification, 'sendVerificationEmail').resolves(mockVerificationUrl);

      // 模擬產生 token
      sinon.stub(generateJWT, 'getAccessToken').resolves(mockAccessToken);
      sinon.stub(generateJWT, 'getRefreshToken').returns(mockRefreshToken);

      const data = await authServices.register(mockReq);

      expect(data.success).to.be.true;
      expect(data.accessToken).to.equal(mockAccessToken);
      expect(data.refreshToken).to.equal(mockRefreshToken);
      expect(
        User.findOne.calledWith({
          where: {
            phone: mockReq.body.phone,
            isPhoneVerified: true
          }
        })
      ).to.be.true;
      expect(bcrypt.hash.calledWith(mockReq.body.password, 10)).to.be.true;
      expect(generateJWT.getAccessToken.calledOnce).to.be.true;
      expect(generateJWT.getRefreshToken.calledOnce).to.be.true;
    });

    it('異常情境：手機號碼已註冊應拋出409錯誤', async () => {
      const mockReq = {
        body: {
          name: 'test',
          phone: '0912345678',
          email: 'test@example.com',
          password: 'password123'
        }
      };

      // 模擬找到已存在用戶
      sinon.stub(User, 'findOne').resolves({
        id: 1,
        phone: mockReq.body.phone
      });

      try {
        await authServices.register(mockReq);
        expect.fail('預期應拋出409錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(409);
        expect(error.message).to.equal('Phone number already registered');
        expect(
          User.findOne.calledWith({
            where: {
              phone: mockReq.body.phone,
              isPhoneVerified: true
            }
          })
        ).to.be.true;
      }
    });

    it('異常情境：密碼加密失敗應拋出錯誤', async () => {
      const mockReq = {
        body: {
          name: 'test',
          phone: '0912345678',
          email: 'test@example.com',
          password: 'password123',
          verificationCode: '123456'
        }
      };

      sinon.stub(smsVerification, 'verifyPhone').resolves(true);
      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(bcrypt, 'hash').rejects(new Error('Hash failed'));

      try {
        await authServices.register(mockReq);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Hash failed');
      }
    });

    it('異常情境：寄送驗證信失敗應拋出錯誤', async () => {
      const mockReq = {
        body: {
          name: 'test',
          phone: '0912345678',
          email: 'test@example.com',
          password: 'password123',
          verificationCode: '123456'
        }
      };

      // 模擬手機證碼正確
      sinon.stub(smsVerification, 'verifyPhone').resolves(true);
      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
      sinon.stub(User, 'create').resolves({
        id: 1,
        name: mockReq.body.name,
        phone: mockReq.body.phone,
        email: mockReq.body.email
      });
      sinon.stub(generateJWT, 'getAccessToken').resolves('token');
      // 模擬發送驗證郵件
      sinon
        .stub(emailVerification, 'sendVerificationEmail')
        .rejects(new Error('Failed to send verification email'));

      try {
        await authServices.register(mockReq);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Failed to send verification email');
      }
    });

    it('異常情境：驗證手機號碼失敗應拋出錯誤', async () => {
      const mockReq = {
        body: {
          name: 'test',
          phone: '0912345678',
          email: 'test@example.com',
          password: 'password123',
          verificationCode: '123456'
        }
      };
      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(smsVerification, 'verifyPhone').rejects(new Error('Verification failed'));
      try {
        await authServices.register(mockReq);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Verification failed');
      }
    });
  });
});
