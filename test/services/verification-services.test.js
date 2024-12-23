
const { expect } = require('chai');
const sinon = require('sinon');
const { smsVerification, emailVerification } = require('../../lib/verification');
const verificationServices = require('../../services/verification-services');

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
      expect(data.code).to.equal(mockCode);
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

      sinon.stub(emailVerification, 'sendVerificationEmail').resolves(mockUrl);

      const data = await verificationServices.sendEmailVerification(req);

      expect(data.success).to.be.true;
      expect(data.verificationUrl).to.equal(mockUrl);
      expect(emailVerification.sendVerificationEmail.calledWith(
        req.user.id,
        req.body.email
      )).to.be.true;
    });

    it('異常情境：Email服務失敗時應拋出502錯誤', async () => {
      const req = {
        user: { id: 1 },
        body: { email: 'test@example.com' }
      };

      sinon.stub(emailVerification, 'sendVerificationEmail')
        .rejects(new Error('Failed to send verification email'));

      try {
        await verificationServices.sendEmailVerification(req);
        expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      } catch (error) {
        expect(error.message).to.equal('Failed to send verification email');
        expect(emailVerification.sendVerificationEmail.calledWith(
          req.user.id,
          req.body.email
        )).to.be.true;
      }
    });

      // it('異常情境：缺少使用者ID時應拋出錯誤', async () => {
      //   const req = {
      //     body: { email: 'test@example.com' }
      //   };
  
      //   try {
      //     await verificationServices.sendEmailVerification(req);
      //     expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      //   } catch (error) {
      //     expect(error.message).to.equal('User ID is required');
      //   }
      // });
  
      // it('異常情境：缺少email時應拋出錯誤', async () => {
      //   const req = {
      //     user: { id: 1 },
      //     body: {}
      //   };
  
      //   try {
      //     await verificationServices.sendEmailVerification(req);
      //     expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
      //   } catch (error) {
      //     expect(error.message).to.equal('Email is required');
      //   }
      // });
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

    // it('異常情境：缺少驗證碼時應拋出錯誤', async () => {
    //   const req = {
    //     body: {}
    //   };

    //   try {
    //     await verificationServices.verifyEmail(req);
    //     expect.fail('預期應拋出錯誤，但沒有拋出任何錯誤');
    //   } catch (error) {
    //     expect(error.message).to.equal('Verification code is required');
    //   }
    // });
  });
});