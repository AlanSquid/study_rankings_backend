import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User, Verification } = db;
import app from '../../../app.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('POST /verifications/email/verify', () => {
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
    await Verification.create({
      type: 'email',
      target: user.email,
      code: '123456',
      userId: user.id,
      expiresAt: dayjs().add(24, 'hour').format()
    });
  });

  afterEach(async () => {
    // 清理資料庫中的資料
    await Verification.destroy({ where: {}, truncate: true });
    await user.destroy();
  });

  it('正常情況: 驗證email成功，回傳200', async () => {
    const payload = { code: '123456' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email/verify')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    const updatedUser = await User.findByPk(user.id);
    const verification = await Verification.findOne({ where: { userId: user.id } });

    expect(updatedUser.isEmailVerified).to.be.true;
    expect(verification).to.be.null;
    expect(response.body).to.deep.equal({
      success: true,
      message: 'Email verification successful'
    });
  });

  it('異常情況: 驗證碼錯誤，回傳400', async () => {
    const payload = { code: '654321' };

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email/verify')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    const updatedUser = await User.findByPk(user.id);
    const verification = await Verification.findOne({ where: { userId: user.id } });

    expect(updatedUser.isEmailVerified).to.be.false;
    expect(verification).to.not.be.null;
    expect(response.body).to.deep.equal({
      success: false,
      message: 'Invalid or expired verification code',
      status: 400
    });
  });

  it('異常情況: 驗證碼過期，回傳400', async () => {
    const payload = { code: '123456' };

    // 更新驗證碼的過期時間
    await Verification.update(
      { expiresAt: dayjs().subtract(1, 'hour').format() },
      { where: { userId: user.id } }
    );

    // 模擬請求
    const response = await request(app)
      .post('/api/v1/verifications/email/verify')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    const updatedUser = await User.findByPk(user.id);
    const verification = await Verification.findOne({ where: { userId: user.id } });

    expect(updatedUser.isEmailVerified).to.be.false;
    expect(verification).to.not.be.null;
    expect(response.body).to.deep.equal({
      success: false,
      message: 'Invalid or expired verification code',
      status: 400
    });
  });
});
