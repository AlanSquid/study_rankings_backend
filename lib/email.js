const nodemailer = require('nodemailer');
const createError = require('http-errors')

// 單例模式的EmailService
class EmailService {
  // 使用static儲存唯一實例
  static instance = null;

  constructor() {
    // 如果實例已存在，直接返回該實例
    if (EmailService.instance) {
      return EmailService.instance;
    }
    // 否則創建新實例
    this.transporter = null;
    this.initPromise = this.initialize();
    EmailService.instance = this;
  }

  // 初始化Email服務
  async initialize() {
    try {
      if (process.env.NODE_ENV === 'production') {
        this.transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }
    } catch (error) {
      console.error(error);
      throw createError(502, 'Email service initialization failed');;
    }
  }

  // 發送郵件
  // mailOptions = { from, to, subject, text }
  async sendMail(mailOptions) {
    try {
      await this.initPromise;
      if (!this.transporter) {
        throw createError(502, 'Email transporter not initialized');
      }
      try {
        const info = await this.transporter.sendMail(mailOptions);

        // 非生產環境下，印出預覽連結
        if (process.env.NODE_ENV !== 'production') {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return info;
      } catch (err) {
        throw createError(502, 'Failed to send verification email');
      }

    } catch (error) {
      throw error
    }
  }
}

module.exports = new EmailService();