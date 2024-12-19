const smsService = require('../config/sms.js');
const dayjs = require('dayjs');
const { User, Verification } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

class BaseVerification {
  async updateUserVerificationStatus(userId, type) {
    const verificationFields = {
      phone: 'is_phone_verified',
      email: 'is_email_verified'
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
  generateToken(userId) {
    return jwt.sign(
      { userId, type: 'email_verification' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '24h' }
    );
  }

  async sendVerificationEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error('User not found');

      const token = this.generateToken(user.id);
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      // TODO: 實作發送 email 的服務
      // await emailService.send({
      //   to: email,
      //   subject: '信箱驗證',
      //   html: `請點擊以下連結驗證您的信箱：<a href="${verificationLink}">${verificationLink}</a>`
      // });

      return true;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async verifyEmailToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      if (decoded.type !== 'email_verification') {
        throw new Error('Invalid verification link');
      }

      await this.updateUserVerificationStatus(decoded.userId, 'email');
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