const nodemailer = require('nodemailer');
const createError = require('http-errors')

class EmailService {
  static instance = null;

  constructor() {
    if (EmailService.instance) {
      return EmailService.instance;
    }
    this.transporter = null;
    this.initPromise = this.initialize();
    EmailService.instance = this;
  }

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

  async sendMail(mailOptions) {
    try {
      await this.initPromise;
      if (!this.transporter) {
        throw createError(502, 'Email transporter not initialized');
      }
      const info = await this.transporter.sendMail(mailOptions);
      
      // 非生產環境下，印出預覽連結
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error(error);
      throw createError(502, 'Failed to send verification email');
    }
  }
}

module.exports = new EmailService();