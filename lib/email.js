import nodemailer from 'nodemailer';
import createError from 'http-errors';

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
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
          }
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: process.env.TEST_EMAIL_HOST,
          port: process.env.TEST_EMAIL_PORT,
          auth: {
            user: process.env.TEST_EMAIL_USER,
            pass: process.env.TEST_EMAIL_PASS
          }
        });
      }
    } catch (error) {
      console.error(error);
      throw createError(502, 'Email service initialization failed');
    }
  }

  // 發送郵件
  // mailOptions = { from, to, subject, text }
  async sendMail(mailOptions) {
    await this.initPromise;
    if (!this.transporter) {
      throw createError(502, 'Email transporter not initialized');
    }
    try {
      const info = await this.transporter.sendMail(mailOptions);

      // 開發環境下，印出預覽連結
      if (process.env.NODE_ENV === 'development') {
        console.info('Preview URL: %s', 'https://mailtrap.io/inboxes');
      }
      return info;
    } catch (err) {
      console.error(err);
      throw createError(502, 'Failed to send verification email');
    }
  }
}

export default new EmailService();
