const smsService = require('./sms.js');
const emailService = require('./email.js');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { User, Verification } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const createError = require('http-errors')

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

class BaseVerification {
  // 產出唯一值的code (type: 'phone' | 'email')
  async generateUniqueCode(type, target) {
    const maxRetries = 5;

    for (let i = 0; i < maxRetries; i++) {
      let code;

      switch (type) {
        case 'email':
          code = crypto.randomBytes(32).toString('hex');
          break;
        case 'phone':
          code = crypto.randomInt(100000, 1000000).toString();
          break;
        default:
          throw createError(400, 'Invalid verification type');
      }

      // 檢查code有沒有重複
      const existingCode = await Verification.findOne({
        where: {
          type,
          target,
          code,
          expiresAt: { [Op.gt]: new Date() },
        }
      });

      if (!existingCode) {
        return code;
      }
    }

    throw createError(500, 'Failed to generate unique verification code');
  }

  // 建立Verification Model資料 (type: 'phone' | 'email') (target: 依照type不同傳入手機號碼或email)
  async generateVerificationData(type, target, code, userId) {
    // 創新前先刪除舊的，讓一個手機號碼或email就留一個紀錄
    await Verification.destroy({
      where: {
        type,
        target,
        expiresAt: { [Op.gt]: new Date() },
      }
    });

    let expiresAt
    switch (type) {
      case 'phone':
        expiresAt = dayjs().add(3, 'minute').toDate();
        break;
      case 'email':
        expiresAt = dayjs().add(24, 'hour').toDate();
        break;
      default:
        throw createError(400, 'Invalid verification type');
    }

    // 建立驗證記錄
    await Verification.create({
      type,
      target,
      code,
      userId: userId || null,
      expiresAt,
    })
  }

  // 更新使用者手機或email驗證的狀態 (type: 'phone' | 'email')
  async updateUserVerificationStatus(userId, type) {
    const verificationFields = {
      phone: 'isPhoneVerified',
      email: 'isEmailVerified'
    };

    const fieldToUpdate = verificationFields[type];
    if (!fieldToUpdate) {
      throw createError(400, 'Invalid verification type');
    }

    await User.update(
      { [fieldToUpdate]: true },
      { where: { id: userId } }
    );
  }
}

class SMSVerification extends BaseVerification {
  async sendVerificationSMS(phone) {
    // 手機號如果已有使用則不能發送驗證碼
    const user = await User.findOne({ where: { phone } })
    if (user) throw createError(409, 'Phone number is already registered')

    // 產出六位亂數數字
    const code = await this.generateUniqueCode('phone', phone)

    // 創建驗證紀錄
    await this.generateVerificationData('phone', phone, code)

    if (process.env.NODE_ENV === 'production') {
      // 發送簡訊
      await smsService.postSMS(phone, code);

    } else {
      // 測試用，不發真實簡訊
      console.log('Test SMS verification code:', code);
    }

    return code;
  }

  async verifyPhone(phone, code) {
    const verification = await Verification.findOne({
      where: {
        target: phone,
        code,
        type: 'phone',
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!verification) {
      throw createError(400, 'Verification failed');
    }

    // 驗證完即可刪除
    await verification.destroy();

    return true;
  }
}

class EmailVerification extends BaseVerification {
  async sendVerificationEmail(userId, email) {
    // 產出六位亂數數字
    const code = await this.generateUniqueCode('email', email)

    // 紀錄驗證表單
    await this.generateVerificationData('email', email, code, userId)

    // 驗證連結代入code
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
    await emailService.sendMail(mailOptions);

    return verificationLink;
  }

  async verifyEmail(code) {
      const verification = await Verification.findOne({
        where: {
          code,
          type: 'email',
          expiresAt: { [Op.gt]: new Date() }
        }
      });
      if (!verification) {
        throw createError(400, 'Invalid or expired verification code');
      }

      await this.updateUserVerificationStatus(verification.userId, 'email');
      await verification.destroy()
      return true;
  }
}

module.exports = {
  smsVerification: new SMSVerification(),
  emailVerification: new EmailVerification()
};