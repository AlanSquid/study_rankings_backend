import { expect } from 'chai';
import sinon from 'sinon';
import models from '../../models/index.js';
const { User, Verification } = models;
import { Op } from 'sequelize';
import smsService from '../../lib/sms.js';
import emailService from '../../lib/email.js';
import {
  smsVerification,
  emailVerification,
  resetPwdEmailVerification
} from '../../lib/verification.js';
import crypto from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('Verification Library Unit Test', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('BaseVerification', () => {
    describe('generateUniqueCode', () => {
      it('應成功生成email驗證碼', async () => {
        const mockHex = 'mock-hex-code';
        sinon.stub(crypto, 'randomBytes').returns({
          toString: () => mockHex
        });
        sinon.stub(Verification, 'findOne').resolves(null);

        const code = await smsVerification.generateUniqueCode('email', 'test@example.com');

        expect(code).to.equal(mockHex);
        expect(Verification.findOne.calledOnce).to.be.true;
      });

      it('應成功生成phone驗證碼', async () => {
        const mockCode = '123456';
        sinon.stub(crypto, 'randomInt').returns(mockCode);
        sinon.stub(Verification, 'findOne').resolves(null);

        const code = await smsVerification.generateUniqueCode('phone', '0912345678');

        expect(code).to.equal(mockCode);
        expect(Verification.findOne.calledOnce).to.be.true;
      });

      it('當驗證碼重複時應重試生成', async () => {
        const mockCode1 = '123456';
        const mockCode2 = '654321';
        const randomInt = sinon.stub(crypto, 'randomInt');
        randomInt.onFirstCall().returns(mockCode1);
        randomInt.onSecondCall().returns(mockCode2);

        const findOne = sinon.stub(Verification, 'findOne');
        findOne.onFirstCall().resolves({ code: mockCode1 });
        findOne.onSecondCall().resolves(null);

        const code = await smsVerification.generateUniqueCode('phone', '0912345678');

        expect(code).to.equal(mockCode2);
        expect(Verification.findOne.calledTwice).to.be.true;
      });

      it('無效的驗證類型應拋出錯誤', async () => {
        try {
          await smsVerification.generateUniqueCode('invalid', '0912345678');
          expect.fail('應拋出錯誤');
        } catch (error) {
          expect(error.message).to.equal('Invalid verification type');
          expect(error.status).to.equal(400);
        }
      });
    });

    describe('generateVerificationData', () => {
      it('應成功建立驗證資料', async () => {
        sinon.stub(Verification, 'destroy').resolves();
        sinon.stub(Verification, 'create').resolves();

        await smsVerification.generateVerificationData('phone', '0912345678', '123456', 1);

        expect(Verification.destroy.calledOnce).to.be.true;
        expect(Verification.create.calledOnce).to.be.true;
      });
    });

    describe('clearExpiredVerifications', () => {
      it('應成功清理過期的驗證記錄', async () => {
        const mockDeletedCount = 5;
        const destroyStub = sinon.stub(Verification, 'destroy').resolves(mockDeletedCount);

        await smsVerification.clearExpiredVerifications();

        expect(destroyStub.calledOnce).to.be.true;
        expect(destroyStub.firstCall.args[0]).to.deep.include({
          where: {
            expiresAt: {
              [Op.lt]: dayjs().format()
            }
          }
        });
      });

      it('清理失敗時應拋出錯誤', async () => {
        const mockError = new Error('Database error');
        sinon.stub(Verification, 'destroy').rejects(mockError);

        try {
          await smsVerification.clearExpiredVerifications();
          expect.fail('應拋出錯誤');
        } catch (error) {
          expect(error).to.equal(mockError);
        }
      });
    });

    describe('updateUserVerificationStatus', () => {
      it('應成功更新使用者驗證狀態', async () => {
        sinon.stub(User, 'update').resolves();

        await smsVerification.updateUserVerificationStatus(1, 'phone');

        expect(User.update.calledWith({ isPhoneVerified: true }, { where: { id: 1 } })).to.be.true;
      });
    });
  });

  describe('SMSVerification', () => {
    describe('sendVerificationSMS', () => {
      it('應成功發送簡訊驗證碼', async () => {
        const mockCode = '123456';
        sinon.stub(smsVerification, 'generateUniqueCode').resolves(mockCode);
        sinon.stub(smsVerification, 'generateVerificationData').resolves();
        sinon.stub(smsService, 'postSMS').resolves();

        process.env.NODE_ENV = 'production';
        const code = await smsVerification.sendVerificationSMS('0912345678');

        expect(smsService.postSMS.calledOnce).to.be.true;
      });
    });

    describe('verifyPhone', () => {
      it('應成功驗證手機號碼', async () => {
        const mockVerification = {
          destroy: sinon.stub().resolves()
        };
        sinon.stub(Verification, 'findOne').resolves(mockVerification);

        const result = await smsVerification.verifyPhone('0912345678', '123456');

        expect(result).to.be.true;
        expect(mockVerification.destroy.calledOnce).to.be.true;
      });

      it('驗證失敗時應拋出錯誤', async () => {
        sinon.stub(Verification, 'findOne').resolves(null);

        try {
          await smsVerification.verifyPhone('0912345678', '123456');
          expect.fail('應拋出錯誤');
        } catch (error) {
          expect(error.message).to.equal('Verification failed');
          expect(error.status).to.equal(400);
        }
      });
    });
  });

  describe('EmailVerification', () => {
    describe('sendVerificationEmail', () => {
      it('應成功發送驗證信', async () => {
        const mockCode = 'mock-hex-code';
        sinon.stub(emailVerification, 'generateUniqueCode').resolves(mockCode);
        sinon.stub(emailVerification, 'generateVerificationData').resolves();
        sinon.stub(emailService, 'sendMail').resolves();

        const verificationLink = await emailVerification.sendVerificationEmail(
          1,
          'test@example.com'
        );

        expect(verificationLink).to.include(mockCode);
        expect(emailService.sendMail.calledOnce).to.be.true;
      });
    });

    describe('verifyEmail', () => {
      it('應成功驗證信箱', async () => {
        const mockVerification = {
          userId: 1,
          destroy: sinon.stub().resolves()
        };
        sinon.stub(Verification, 'findOne').resolves(mockVerification);
        sinon.stub(emailVerification, 'updateUserVerificationStatus').resolves();

        const result = await emailVerification.verifyEmail('mock-code');

        expect(result).to.be.true;
        expect(mockVerification.destroy.calledOnce).to.be.true;
      });

      it('驗證碼無效時應拋出錯誤', async () => {
        sinon.stub(Verification, 'findOne').resolves(null);

        try {
          await emailVerification.verifyEmail('invalid-code');
          expect.fail('應拋出錯誤');
        } catch (error) {
          expect(error.message).to.equal('Invalid or expired verification code');
          expect(error.status).to.equal(400);
        }
      });
    });
  });

  describe('resetPwdEmailVerification', () => {
    describe('sendResetPasswordEmail', () => {
      it('應成功發送重置密碼信', async () => {
        const mockUser = { id: 1, email: 'test@example.com' };
        const mockCode = 'mock-hex-code';

        sinon.stub(User, 'findOne').resolves(mockUser);
        sinon.stub(resetPwdEmailVerification, 'generateUniqueCode').resolves(mockCode);
        sinon.stub(resetPwdEmailVerification, 'generateVerificationData').resolves();
        sinon.stub(emailService, 'sendMail').resolves();

        const resetLink = await resetPwdEmailVerification.sendResetPasswordEmail(
          '0912345678',
          'test@example.com'
        );

        expect(resetLink).to.include(mockCode);
        expect(
          User.findOne.calledWith({
            where: { phone: '0912345678', email: 'test@example.com' }
          })
        ).to.be.true;
        expect(emailService.sendMail.calledOnce).to.be.true;
      });

      it('使用者不存在時應拋出錯誤', async () => {
        sinon.stub(User, 'findOne').resolves(null);

        try {
          await resetPwdEmailVerification.sendResetPasswordEmail('0912345678', 'test@example.com');
          expect.fail('應拋出錯誤');
        } catch (error) {
          expect(error.message).to.equal('User not found');
          expect(error.status).to.equal(404);
        }
      });
    });

    describe('verifyResetPassword', () => {
      it('應成功驗證重置密碼碼', async () => {
        const mockVerification = {
          code: 'valid-code',
          type: 'reset_pwd'
        };

        sinon.stub(Verification, 'findOne').resolves(mockVerification);

        const result = await resetPwdEmailVerification.verifyResetPassword('valid-code');
        expect(result).to.be.true;
      });

      it('驗證碼無效時應拋出錯誤', async () => {
        sinon.stub(Verification, 'findOne').resolves(null);

        try {
          await resetPwdEmailVerification.verifyResetPassword('invalid-code');
          expect.fail('應拋出錯誤');
        } catch (error) {
          expect(error.message).to.equal('Invalid or expired verification code');
          expect(error.status).to.equal(400);
        }
      });
    });
  });
});
