
const { expect } = require('chai');
const sinon = require('sinon');
const { User } = require('../../models');
const { smsVerification, emailVerification, resetPwdEmailVerification } = require('../../lib/verification');
const verificationServices = require('../../services/verification-services');
const createError = require('http-errors');

describe('verification-services Unit Test', () => {
  describe('sendPhoneVerification', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應成功發送簡訊驗證碼', async () => {
      const req = {
        body: { phone: '0912345678' }
      };
      const mockCode = '123456';

      sinon.stub(smsVerification, 'sendVerificationSMS').resolves(mockCode);

      const data = await verificationServices.sendPhoneVerification(req);

      expect(data.success).to.be.true;
      expect(smsVerification.sendVerificationSMS.calledWith(req.body.phone)).to.be.true;
    });

    it('異常情境：SMS服務失敗時應拋出502錯誤', async () => {
      const req = {
        body: { phone: '0912345678' }
      };

      sinon.stub(smsVerification, 'sendVerificationSMS')
        .rejects(new Error('SMS service error occurred'));

      try {
        await verificationServices.sendPhoneVerification(req);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('SMS service error occurred');
        expect(smsVerification.sendVerificationSMS.calledWith(req.body.phone)).to.be.true;
      }
    });
  });

  describe('sendEmailVerification', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應成功發送驗證信', async () => {
      const req = {
        user: { id: 1 },
        body: { email: 'test@example.com' }
      };
      const mockUrl = 'http://test.com/verify?code=123456';
      const mockUser = { email: 'test@example.com' };

      sinon.stub(User, 'findByPk').resolves(mockUser);
      sinon.stub(emailVerification, 'sendVerificationEmail').resolves(mockUrl);

      const data = await verificationServices.sendEmailVerification(req);

      expect(data.success).to.be.true;
      expect(data.verificationUrl).to.equal(mockUrl);
      expect(User.findByPk.calledWith(req.user.id)).to.be.true;
      expect(emailVerification.sendVerificationEmail.calledWith(
        req.user.id,
        req.body.email
      )).to.be.true;
    });

    it('異常情境：使用者不存在時應拋出404錯誤', async () => {
      const req = {
        user: { id: 999 },
        body: { email: 'test@example.com' }
      };

      sinon.stub(User, 'findByPk').resolves(null);

      try {
        await verificationServices.sendEmailVerification(req);
        expect.fail('預期應拋出404錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(404);
        expect(error.message).to.equal('User not found');
      }
    });

    it('異常情境：Email不符合時應拋出400錯誤', async () => {
      const req = {
        user: { id: 1 },
        body: { email: 'different@example.com' }
      };
      const mockUser = { email: 'original@example.com' };

      sinon.stub(User, 'findByPk').resolves(mockUser);

      try {
        await verificationServices.sendEmailVerification(req);
        expect.fail('預期應拋出400錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Email verification failed: The provided email does not match the registered email address');
      }
    });

    it('異常情境：Email服務失敗時應拋出502錯誤', async () => {
      const req = {
        user: { id: 1 },
        body: { email: 'test@example.com' }
      };
      const mockUser = { email: 'test@example.com' };

      sinon.stub(User, 'findByPk').resolves(mockUser);
      sinon.stub(emailVerification, 'sendVerificationEmail')
        .rejects(new Error('Failed to send verification email'));

      try {
        await verificationServices.sendEmailVerification(req);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Failed to send verification email');
      }
    });
  });

  describe('verifyEmail', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：應成功驗證信箱', async () => {
      const req = {
        body: { code: 'test-code' }
      };

      sinon.stub(emailVerification, 'verifyEmail').resolves(true);

      const data = await verificationServices.verifyEmail(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Email verification successful');
      expect(emailVerification.verifyEmail.calledWith(req.body.code)).to.be.true;
    });

    it('異常情境：驗證碼無效時應拋出錯誤', async () => {
      const req = {
        body: { code: 'invalid-code' }
      };

      sinon.stub(emailVerification, 'verifyEmail').rejects(new Error('Invalid or expired verification code'));

      try {
        await verificationServices.verifyEmail(req);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Invalid or expired verification code');
        expect(emailVerification.verifyEmail.calledWith(req.body.code)).to.be.true;
      }
    });
  });

  describe('sendResetPasswordEmail', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：成功發送重置密碼郵件', async () => {
      const req = {
        body: {
          phone: '0912345678',
          email: 'test@example.com'
        }
      };

      sinon.stub(resetPwdEmailVerification, 'sendResetPasswordEmail').resolves();

      const data = await verificationServices.sendResetPasswordEmail(req);

      expect(data.success).to.be.true;
      expect(data.message).to.equal('Reset password email sent');
      expect(resetPwdEmailVerification.sendResetPasswordEmail.calledWith(
        req.body.phone,
        req.body.email
      )).to.be.true;
    });

    it('異常情境：寄送重置密碼郵件失敗時應拋出錯誤', async () => {
      const req = {
        body: {
          phone: '0912345678',
          email: 'test@example.com'
        }
      };

      sinon.stub(resetPwdEmailVerification, 'sendResetPasswordEmail')
        .rejects(new Error('Failed to send email'));

      try {
        await verificationServices.sendResetPasswordEmail(req);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Failed to send email');
      }
    });
  });

  describe('verifyResetPassword', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('正常情境：驗證碼驗證成功', async () => {
      const req = {
        body: {
          code: 'valid-code'
        }
      };

      sinon.stub(resetPwdEmailVerification, 'verifyResetPassword').resolves(true);

      const result = await verificationServices.verifyResetPassword(req);

      expect(result.success).to.be.true;
      expect(result.message).to.equal('Reset password verification successful');
      expect(resetPwdEmailVerification.verifyResetPassword.calledWith(req.body.code)).to.be.true;
    });

    it('異常情境：無效的驗證碼應拋出400錯誤', async () => {
      const req = {
        body: {
          code: 'invalid-code'
        }
      };

      sinon.stub(resetPwdEmailVerification, 'verifyResetPassword')
        .rejects(createError(400, 'Invalid or expired verification code'));

      try {
        await verificationServices.verifyResetPassword(req);
        expect.fail('預期應拋出 400 錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.status).to.equal(400);
        expect(error.message).to.equal('Invalid or expired verification code');
      }
    });
  });
});