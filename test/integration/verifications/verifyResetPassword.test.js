import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User, Verification } = db;
import { Op } from 'sequelize';
import app from '../../../app.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('POST /verifications/reset-pwd/verify', () => {
  let user, verification;
  beforeEach(async () => {
    user = await User.create({
      id: 1,
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      isPhoneVerified: true,
      isEmailVerified: true
    });
    verification = await Verification.create({
      userId: user.id,
      type: 'reset_pwd',
      target: user.email,
      code: '123456',
      expiresAt: dayjs().add(30, 'minute').toDate()
    });
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    await Verification.destroy({ where: {}, truncate: true });
    await user.destroy();
  });

  it('正常情況: 驗證reset password成功，回傳200', async () => {
    const payload = { code: '123456' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/reset-pwd/verify')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    const checkVerification = await Verification.findOne({
      where: { userId: user.id, expiresAt: { [Op.gt]: dayjs().toDate() } }
    });

    expect(checkVerification).to.not.be.null;
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Reset password verification successful'
    });
  });

  it('異常情況: 驗證碼錯誤，回傳400', async () => {
    const payload = { code: '654321' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/reset-pwd/verify')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    const checkVerification = await Verification.findOne({
      where: { userId: user.id, expiresAt: { [Op.gt]: dayjs().toDate() } }
    });

    expect(checkVerification).to.not.be.null;
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Invalid or expired verification code'
    });
  });

  it('錯誤情況: 驗證碼過期，回傳400', async () => {
    verification.expiresAt = dayjs().subtract(1, 'minute').toDate();
    await verification.save();

    const payload = { code: '123456' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/reset-pwd/verify')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    const checkVerification = await Verification.findOne({
      where: { userId: user.id, expiresAt: { [Op.gt]: dayjs().toDate() } }
    });

    expect(checkVerification).to.be.null;
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Invalid or expired verification code'
    });
  });
});
