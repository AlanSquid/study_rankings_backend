const { expect } = require('chai');
const sinon = require('sinon');
const { User } = require('../../models');
const authServices = require('../../services/auth-services');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

describe('auth-services Unit Test', () => {
  describe('verifyJWT', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應回傳使用者資料', async () => {
      const mockUser = {
        id: 1,
        name: 'test'
      };
      const req = { user: mockUser };

      const data = await authServices.verifyJWT(req);

      expect(data.success).to.be.true;
      expect(data.user).to.deep.equal(mockUser);
    });
  });

  describe('refresh', () => {
    afterEach(() => {
      sinon.restore(); 
    });

    it('正常情境：應回傳新的access token', async () => {
      const mockUser = { id: 1 };
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

      sinon.stub(jwt, 'sign').returns(mockAccessToken);

      const data = await authServices.refresh(req);

      expect(data.success).to.be.true;
      expect(data.accessToken).to.equal(mockAccessToken);
      expect(jwt.verify.calledWith(mockRefreshToken, process.env.JWT_REFRESH_SECRET)).to.be.true;
      expect(jwt.sign.calledWith(
        { id: mockUser.id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      )).to.be.true;
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
        expect(jwt.verify.calledWith(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET)).to.be.true;
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
        body: {
          phone: '0912345678',
          password: 'password123'
        }
      };
  
      sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
        return () => callback(null, mockUser);
      });
  
      sinon.stub(jwt, 'sign')
        .onFirstCall().returns(mockAccessToken)
        .onSecondCall().returns(mockRefreshToken);
  
      const data = await authServices.login(req);
  
      expect(data.success).to.be.true;
      expect(data.user).to.deep.equal(mockUser);
      expect(data.accessToken).to.equal(mockAccessToken);
      expect(data.refreshToken).to.equal(mockRefreshToken);
      expect(jwt.sign.calledWith(
        { id: mockUser.id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      )).to.be.true;
      expect(jwt.sign.calledWith(
        { id: mockUser.id }, 
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )).to.be.true;
    });
  
    it('異常情境：登入失敗應拋出401錯誤', async () => {
      const req = {
        body: {
          phone: 'wrongPhone',
          password: 'wrongPassword'  
        }
      };
  
      sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
        return () => callback(null, false, { message: 'Login failed' });
      });
  
      try {
        await authServices.login(req);
        expect.fail('預期應拋出401錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(401);
        expect(error.message).to.equal('Login failed');
      }
    });
  
    it('異常情境：驗證出現錯誤應拋出500錯誤', async () => {
      const req = {
        body: {
          phone: '0912345678',
          password: 'password123'
        }
      };
  
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
          password: 'password123'
        }
      };

      const mockHashedPassword = 'hashedPassword123';
      const mockAccessToken = 'access.token';
      const mockRefreshToken = 'refresh.token';

      // 模擬找不到已存在用戶
      sinon.stub(User, 'findOne').resolves(null);
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
      // 模擬產生 token
      sinon.stub(jwt, 'sign')
        .onFirstCall().returns(mockAccessToken)
        .onSecondCall().returns(mockRefreshToken);

      const data = await authServices.register(mockReq);

      expect(data.success).to.be.true;
      expect(data.user).to.deep.equal({
        id: 1,
        name: mockReq.body.name,
        phone: mockReq.body.phone,
        email: mockReq.body.email
      });
      expect(data.accessToken).to.equal(mockAccessToken);
      expect(data.refreshToken).to.equal(mockRefreshToken);
      expect(User.findOne.calledWith({
        where: {
          phone: mockReq.body.phone,
          isPhoneVerified: true
        }
      })).to.be.true;
      expect(bcrypt.hash.calledWith(mockReq.body.password, 10)).to.be.true;
      expect(jwt.sign.calledWith(
        { id: 1 },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      )).to.be.true;
      expect(jwt.sign.calledWith(
        { id: 1 },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )).to.be.true;
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
        expect(User.findOne.calledWith({
          where: {
            phone: mockReq.body.phone,
            isPhoneVerified: true
          }
        })).to.be.true;
      }
    });

    it('異常情境：密碼加密失敗應拋出錯誤', async () => {
      const mockReq = {
        body: {
          name: 'test',
          phone: '0912345678',
          email: 'test@example.com',
          password: 'password123'
        }
      };

      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(bcrypt, 'hash').rejects(new Error('Hash failed'));

      try {
        await authServices.register(mockReq);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Hash failed');
      }
    });
  });
});