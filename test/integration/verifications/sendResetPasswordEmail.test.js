import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import db from '../../../models/index.js';
const { User, Verification } = db;
import { Op } from 'sequelize';
import emailService from '../../../lib/email.js';
import app from '../../../app.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('POST /verifications/reset-pwd', () => {
  let user;
  beforeEach(async () => {
    user = await User.create({
      id: 1,
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      isPhoneVerified: true,
      isEmailVerified: false
    });
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    await Verification.destroy({ where: {}, truncate: true });
    await user.destroy();
    sinon.restore();
  });

  it('正常情況: Verification model要建立一筆新資料並回傳200', async () => {
    const payload = { phone: user.phone, email: user.email };
    const now = dayjs();

    sinon.stub(emailService, 'sendMail').resolves();

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/reset-pwd')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    // 要建立一筆Verification資料
    const verification = await Verification.findOne({
      where: {
        userId: user.id,
        type: 'reset_pwd',
        [Op.and]: [
          { expiresAt: { [Op.gte]: now.toDate() } },
          { expiresAt: { [Op.lte]: now.add(30, 'minute').toDate() } }
        ]
      }
    });

    expect(response.body).to.deep.equal({ success: true, message: 'Reset password email sent' });
    expect(verification).to.deep.include({
      userId: user.id,
      type: 'reset_pwd',
      target: user.email,
      expiresAt: verification.expiresAt
    });
  });

  it('異常情況: 未提供email跟phone，回傳400', async () => {
    const payload = {};

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/reset-pwd')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        email: 'Please enter a valid email',
        phone: 'Please enter a valid phone number'
      }
    });
  });

  it('異常情況: phone或email不存在，回傳404', async () => {
    const payload = { phone: '0911123123', email: 'test123@test.com' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/reset-pwd')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).to.deep.equal({
      success: false,
      status: 404,
      message: 'User not found'
    });
  });
});
