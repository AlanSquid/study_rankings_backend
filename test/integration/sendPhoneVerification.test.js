import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import db from '../../models/index.js';
const { User, Verification } = db;
import { Op } from 'sequelize';
import smsService from '../../lib/sms.js';
import { smsLimiter, smsLimiterMax } from '../../middlewares/rate-limit.js';
import app from '../../app.js';
import createError from 'http-errors';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

// 本地端IP
const LOCAL_IP = '::ffff:127.0.0.1';

describe('POST /verifications/phone', () => {
  let user;
  beforeEach(async () => {
    sinon.restore();
    // 重置速率限制
    smsLimiter.resetKey(LOCAL_IP);
    smsLimiterMax.resetKey(LOCAL_IP);
  });
  afterEach(async () => {
    // 清理資料庫中的資料
    await Verification.destroy({ where: {}, truncate: true });
    if (user) await user.destroy();
    // 恢復 sinon
    sinon.restore();
  });
  it('正常情況: Verification model要建立一筆新資料並回傳200', async () => {
    // 模擬簡訊發送
    const smsServiceMock = sinon.mock(smsService);
    smsServiceMock
      .expects('postSMS')
      .once()
      .resolves({ code: '00000', text: 'Success', msgid: 123456789 });

    const payload = { phone: '0989889889' };
    const now = dayjs();

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/phone')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    // 要建立一筆Verification資料
    const verification = await Verification.findOne({
      where: { target: payload.phone, type: 'phone', expiresAt: { [Op.gt]: now } },
      raw: true
    });

    smsServiceMock.verify();
    expect(verification).to.deep.include({
      target: payload.phone,
      type: 'phone',
      expiresAt: verification.expiresAt
    });
    // 驗證碼要是六位數字
    expect(verification.code).to.match(/^\d{6}$/);
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Verification SMS sent'
    });
  });

  it('異常情況: 手機號沒填寫要回傳400', async () => {
    // 模擬簡訊發送
    const smsServiceMock = sinon.mock(smsService);
    // 不應該發送簡訊
    smsServiceMock.expects('postSMS').never();

    const payload = { phone: '' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/phone')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    smsServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        phone: 'Phone number is required'
      }
    });
  });

  it('異常情況: 手機號格式錯誤要回傳400', async () => {
    // 模擬簡訊發送
    const smsServiceMock = sinon.mock(smsService);
    // 不應該發送簡訊
    smsServiceMock.expects('postSMS').never();

    const payload = { phone: '1234' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/phone')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    smsServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        phone: 'Please enter a valid phone number'
      }
    });
  });

  it('異常情況: 手機號已經註冊過要回傳400', async () => {
    // 模擬簡訊發送
    const smsServiceMock = sinon.mock(smsService);
    // 不應該發送簡訊
    smsServiceMock.expects('postSMS').never();

    const payload = { phone: '0989889889' };

    // 建立一筆使用者資料
    user = await User.create({
      name: 'test',
      phone: payload.phone,
      email: 'test@test.com',
      password: '12345678',
      isPhoneVerified: true,
      isEmailVerified: true
    });

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/phone')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    smsServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        phone: 'Phone number is already registered'
      }
    });
  });

  it('異常情況: 簡訊發送失敗要回傳502', async () => {
    // 模擬簡訊發送
    const smsServiceMock = sinon.mock(smsService);
    smsServiceMock
      .expects('postSMS')
      .once()
      .rejects(createError(502, 'SMS service error occurred'));

    const payload = { phone: '0989889889' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/phone')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(502);

    smsServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 502,
      message: 'SMS service error occurred'
    });
  });

  it('異常情況: 頻繁發送簡訊要回傳429', async () => {
    // 模擬簡訊發送
    const smsServiceMock = sinon.mock(smsService);
    // 不應該發送簡訊
    smsServiceMock.expects('postSMS').once();

    const payload = { phone: '0989889889' };

    // 第一次請求
    await request(app).post('/api/v1/verifications/phone').send(payload).expect(200);
    // 第二次請求
    const response = await request(app)
      .post('/api/v1/verifications/phone')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(429);

    smsServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 429,
      message: 'Too many requests, please try again later.'
    });
  });
});
