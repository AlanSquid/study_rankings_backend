const smsService = require('../config/sms.js');
const emailService = require('../config/email.js');
const dayjs = require('dayjs');
const { User, Verification } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class BaseVerification {
  async updateUserVerificationStatus(userId, type) {
    const verificationFields = {
      phone: 'isPhoneVerified',
      email: 'isEmailVerified'
    };

    const fieldToUpdate = verificationFields[type];
    if (!fieldToUpdate) {
      throw new Error('Invalid verification type');
    }

    await User.update(
      { [fieldToUpdate]: true },
      { where: { id: userId } }
    );
  }
}

class SMSVerification extends BaseVerification {
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationSMS(phone) {
    try {
      let code = '';
      const expiresAt = dayjs().add(3, 'minute').toDate();

      // 生成不重複的驗證碼
      let existingCode;
      const maxRetries = 5;
      let retries = 0;

      do {
        if (retries >= maxRetries) {
          throw new Error('Failed to generate unique verification code. Please try again later.');
        }

        code = this.generateCode();
        existingCode = await Verification.findOne({
          where: {
            type: 'phone',
            target: phone,
            code,
            expiresAt: { [Op.gt]: new Date() },
            isUsed: false,
          }
        });
        retries++;
      } while (existingCode);

      // 建立驗證記錄
      await Verification.create({
        type: 'phone',
        target: phone,
        code,
        expiresAt,
        isUsed: false
      });

      // 發送簡訊
      await smsService.postSMS(phone, code);
      return code;
    } catch (error) {
      console.error('SMS verification failed:', error);
      throw new Error('Failed to send verification code');
    }
  }

  async testSendVerificationSMS(phone) {
    try {
      let code = '';
      const expiresAt = dayjs().add(3, 'minute').toDate();

      // 生成不重複的驗證碼
      let existingCode;
      const maxRetries = 5;
      let retries = 0;

      do {
        if (retries >= maxRetries) {
          throw new Error('Failed to generate unique verification code. Please try again later.');
        }

        code = this.generateCode();
        existingCode = await Verification.findOne({
          where: {
            target: phone,
            code,
            type: 'phone',
            expiresAt: { [Op.gt]: new Date() },
            isUsed: false,
          }
        });
        retries++;
      } while (existingCode);

      // 建立驗證記錄
      await Verification.create({
        type: 'phone',
        target: phone,
        code,
        expiresAt,
        isUsed: false
      });

      // 發送簡訊
      console.log('Test SMS verification code:', code);

      return code;
    } catch (error) {
      console.error('SMS verification failed:', error);
      throw new Error('Failed to send verification code');
    }
  }

  async verifyCode(userId, code) {
    try {
      const user = await User.findByPk(userId);
      const verification = await Verification.findOne({
        where: {
          target: user.phone,
          code,
          type: 'phone',
          isUsed: false,
          expiresAt: { [Op.gt]: new Date() }
        }
      });

      if (!verification) {
        throw new Error('Invalid or expired verification code');
      }

      await verification.update({ userId: user.id, isUsed: true });
      await this.updateUserVerificationStatus(userId, 'phone');
      user.isPhoneVerified = true;
      await user.save();

      return true;
    } catch (error) {
      throw new Error('Verification failed');
    }
  }
}

class EmailVerification extends BaseVerification {
  generateCode() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error('User not found');

      const code = this.generateCode();
      const expiresAt = dayjs().add(1, 'day').toDate();

      // 檢查是否已有相同的驗證碼
      let existingCode;
      const maxRetries = 5;
      let retries = 0;

      do {
        if (retries >= maxRetries) {
          throw new Error('Failed to generate unique verification code. Please try again later.');
        }

        existingCode = await Verification.findOne({
          where: {
            type: 'email',
            userId: user.id,
            target: email,
            code,
            expiresAt: { [Op.gt]: new Date() },
            isUsed: false,
          }
        });
        retries++;
      } while (existingCode);

      // 建立驗證記錄
      await Verification.create({
        userId: user.id,
        type: 'email',
        target: email,
        code,
        expiresAt,
        isUsed: false
      });

      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?code=${code}`;


      // 郵件內容
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: '電子郵件驗證',
        html: `
                <h1>驗證您的電子郵件</h1>
                <p>請點擊以下連結驗證您的電子郵件：</p>
                <a href="${verificationLink}">${verificationLink}</a>
            `
      };

      // 發送郵件
      await emailService.sendmail(mailOptions);

      return verificationLink;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async verifyEmail(code) {
    try {
      const verification = await Verification.findOne({
        where: {
          code,
          type: 'email',
          isUsed: false,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
      if (!verification) {
        throw new Error('Invalid or expired verification code');
      }
      const user = await User.findByPk(verification.userId);
      if (!user) {
        throw new Error('User not found');
      }

      await verification.update({ isUsed: true });
      await this.updateUserVerificationStatus(user.id, 'email');
      return true;
    } catch (error) {
      throw new Error('Verification failed');
    }
  }
}

module.exports = {
  smsVerification: new SMSVerification(),
  emailVerification: new EmailVerification()
};