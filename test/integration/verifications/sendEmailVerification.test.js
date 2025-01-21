import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import db from '../../../models/index.js';
const { User, Verification } = db;
import { Op } from 'sequelize';
import { emailLimiter } from '../../../middlewares/rate-limit.js';
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import emailService from '../../../lib/email.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

// 本地端IP
const LOCAL_IP = '::ffff:127.0.0.1';

describe('POST /verifications/email', () => {
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
    // 重置速率限制
    emailLimiter.resetKey(LOCAL_IP);
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    await Verification.destroy({ where: {}, truncate: true });
    await user.destroy();
    sinon.restore();
  });

  it('正常情況: Verification model要建立一筆新資料並回傳200', async () => {
    const payload = { email: user.email };
    const now = dayjs();

    // 模擬使用者登入
    const accessToken = await generateJWT.getAccessToken(user);

    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').once().resolves();

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    // 要建立一筆Verification資料
    const verification = await Verification.findOne({
      where: {
        target: payload.email,
        type: 'email',
        userId: user.id,
        expiresAt: { [Op.gt]: now }
      },
      raw: true
    });

    emailServiceMock.verify();
    expect(verification).to.deep.include({
      target: payload.email,
      type: 'email',
      userId: user.id,
      expiresAt: verification.expiresAt,
      code: verification.code
    });
    expect(response.body).to.deep.equal({ success: true, message: 'Verification email sent' });
  });

  it('異常情況: 使用者未登入，應回傳401', async () => {
    const payload = { email: 'test@test.com' };

    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(401);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({ success: false, status: 401, message: 'Unauthorized' });
  });

  it('異常情況: 使用者已驗證信箱，應回傳400', async () => {
    user.isEmailVerified = true;
    await user.save();

    const payload = { email: user.email };
    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    // 模擬使用者登入
    const accessToken = await generateJWT.getAccessToken(user);

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    emailServiceMock.verify();
    expect(await Verification.findOne({ where: { target: payload.email, type: 'email' } })).to.be
      .null;
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Email already verified'
    });
  });

  it('異常情況: 信箱未填寫，應回傳400', async () => {
    const payload = {};

    // 模擬使用者登入
    const accessToken = await generateJWT.getAccessToken(user);

    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        email: 'Please enter a valid email'
      }
    });
  });

  it('異常情況: 信箱格式錯誤，應回傳400', async () => {
    const payload = { email: 'test123.com' };

    // 模擬使用者登入
    const accessToken = await generateJWT.getAccessToken(user);

    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        email: 'Please enter a valid email'
      }
    });
  });

  it('異常情況: 使用者輸入的信箱與本人信箱不符應回傳400', async () => {
    const payload = { email: 'test123@test.com' };

    // 模擬使用者登入
    const accessToken = await generateJWT.getAccessToken(user);

    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'The provided email does not match the registered email address'
    });
  });

  it('異常情況: 頻繁發送驗證信，應回傳429', async () => {
    const payload = { email: 'test@test.com' };

    // 模擬使用者登入
    const accessToken = await generateJWT.getAccessToken(user);

    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').exactly(5);

    // 模擬請求五次
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/verifications/email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200);
    }
    // 第六次請求
    const response = await request(app)
      .post('/api/v1/verifications/email')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(429);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 429,
      message: 'Too many requests, please try again later.'
    });
  });
});
