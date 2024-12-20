const nodemailer = require('nodemailer');

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
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
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
      console.error('Email service initialization failed:', error);
      throw error;
    }
  }

  async sendmail(mailOptions) {
    try {
      await this.initPromise;
      if (!this.transporter) {
        throw new Error('Transporter not initialized');
      }
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email verification failed:', error);
      throw new Error('Failed to send verification email');
    }
  }
}

module.exports = new EmailService();