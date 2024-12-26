const { expect } = require('chai');
const sinon = require('sinon');
const { User, Verification } = require('../../models');
const userServices = require('../../services/user-services');
const bcrypt = require('bcryptjs');
const loginAttemptManager = require('../../lib/login-attempt');

describe('user-services Unit Test', () => {
  describe('getUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應回傳使用者資料', async () => {
      // 模擬req
      const req = { user: { id: 1 } };

      // 假user資料
      const mockUser = {
        id: 1,
        name: 'test',
        email: 'test@gmail.com',
        phone: '0989889889',
        isPhoneVerified: 1,
        isEmailVerified: 1
      };
      // 模擬User.findOne() 回傳假資料
      sinon.stub(User, 'findOne').resolves(mockUser);

      const data = await userServices.getUser(req);

      expect(data.success).to.be.true;
      expect(data.user).to.deep.equal(mockUser);
      expect(User.findOne.calledWith({
        where: { id: 1 },
        attributes: ['id', 'name', 'email', 'phone', 'isPhoneVerified', 'isEmailVerified'],
        raw: true
      })).to.be.true;
    })

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      // 模擬req，傳入不存在的使用者id
      const req = { user: { id: 999 } };

      // 模擬User.findOne() 找不到資料回傳null
      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userServices.getUser(req);
        expect.fail('預期應拋出 404 User not found 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
        expect(User.findOne.calledWith({
          where: { id: req.user.id },
          attributes: ['id', 'name', 'email', 'phone', 'isPhoneVerified', 'isEmailVerified'],
          raw: true
        })).to.be.true;
      }
    });
  })

  describe('updatePassword', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：密碼更新成功', async () => {
      // 模擬req
      const req = {
        user: { id: 1 },
        body: {
          oldPassword: 'oldPassword',
          newPassword: 'newPassword'
        }
      };
      // 假user資料
      const mockUser = {
        id: 1,
        name: 'test',
        email: 'test@gmail.com',
        phone: '0989889889',
        password: 'hashedOldPassword',
        isPhoneVerified: 1,
        isEmailVerified: 1,
        save: sinon.stub().resolves()
      };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(bcrypt, 'hash').resolves('hashedNewPassword');

      const data = await userServices.updatePassword(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Password updated');
      expect(User.findOne.calledWith({
        where: { id: req.user.id }
      })).to.be.true;

      expect(bcrypt.compare.calledOnce).to.be.true;
      expect(bcrypt.compare.firstCall.args[0]).to.equal('oldPassword');
      expect(bcrypt.compare.firstCall.args[1]).to.equal('hashedOldPassword');
      expect(bcrypt.hash.calledWith(req.body.newPassword, 10)).to.be.true;
      expect(mockUser.save.called).to.be.true;
    });

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      const req = {
        user: { id: 999 },
        body: {
          oldPassword: 'oldPassword',
          newPassword: 'newPassword'
        }
      };

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userServices.updatePassword(req);
        expect.fail('預期應拋出 404 User not found 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
      }
    });

    it('異常情境：舊密碼錯誤時應拋出400錯誤', async () => {
      const req = {
        user: { id: 1 },
        body: {
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword'
        }
      };

      const mockUser = {
        id: 1,
        password: 'hashedOldPassword'
      };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(false);

      try {
        await userServices.updatePassword(req);
        expect.fail('預期應拋出 400 Old password is incorrect 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Old password is incorrect');
        expect(bcrypt.compare.calledWith(req.body.oldPassword, mockUser.password)).to.be.true;
      }
    });
  });

  describe('resetPassword', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：密碼重置成功', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          newPassword: 'newPassword123',
          code: 'valid-code'
        }
      };

      const mockVerification = {
        userId: 1,
        destroy: sinon.stub().resolves()
      };

      sinon.stub(bcrypt, 'hash').resolves('hashedNewPassword');
      sinon.stub(Verification, 'findOne').resolves(mockVerification);
      sinon.stub(User, 'update').resolves();
      sinon.stub(loginAttemptManager, 'reset').resolves();

      const result = await userServices.resetPassword(req);

      expect(result.success).to.be.true;
      expect(result.message).to.equal('Password updated');
      expect(bcrypt.hash.calledWith(req.body.newPassword, 10)).to.be.true;
      expect(User.update.calledWith(
        { password: 'hashedNewPassword' },
        { where: { id: mockVerification.userId } }
      )).to.be.true;
      expect(loginAttemptManager.reset.calledWith(
        req.ip,
        mockVerification.phone
      )).to.be.true;
      expect(mockVerification.destroy.called).to.be.true;
    });

    it('異常情境：無效或過期的驗證碼應拋出400錯誤', async () => {
      const req = {
        ip: '127.0.0.1',
        body: {
          newPassword: 'newPassword123',
          code: 'invalid-code'
        }
      };

      sinon.stub(bcrypt, 'hash').resolves('hashedNewPassword');
      sinon.stub(Verification, 'findOne').resolves(null);
      sinon.stub(loginAttemptManager, 'reset').resolves();

      try {
        await userServices.resetPassword(req);
        expect.fail('預期應拋出 400 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Invalid or expired verification code');
        expect(loginAttemptManager.reset.called).to.be.false;
      }
    });
  });

  describe('updateEmail', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：email更新成功', async () => {
      const req = {
        user: { id: 1 },
        body: { newEmail: 'new@example.com' }
      };

      const mockUser = {
        id: 1,
        email: 'old@example.com',
        save: sinon.stub().resolves()
      };

      sinon.stub(User, 'findOne').resolves(mockUser);

      const data = await userServices.updateEmail(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Email updated. Please verify your new email');
      expect(User.findOne.calledWith({
        where: { id: req.user.id }
      })).to.be.true;
      expect(mockUser.isEmailVerified).to.be.false;
      expect(mockUser.save.called).to.be.true;
    });

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      const req = {
        user: { id: 999 },
        body: { newEmail: 'new@example.com' }
      };

      sinon.stub(User, 'findOne').resolves(null);

      try {
        await userServices.updateEmail(req);
        expect.fail('預期應拋出404錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
      }
    });

    it('異常情境：新舊email相同時應拋出400錯誤', async () => {
      const req = {
        user: { id: 1 },
        body: { newEmail: 'same@example.com' }
      };

      const mockUser = {
        id: 1,
        email: 'same@example.com'
      };

      sinon.stub(User, 'findOne').resolves(mockUser);

      try {
        await userServices.updateEmail(req);
        expect.fail('預期應拋出400錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Email update failed: New email cannot be the same as current email');
      }
    });
});
});