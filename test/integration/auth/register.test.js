import { expect } from 'chai';
import request from 'supertest';
import db from '../../../models/index.js';
const { User, Verification } = db;
import sinon from 'sinon';
import emailService from '../../../lib/email.js';
import app from '../../../app.js';
import generateJWT from '../../../lib/utils/generateJWT.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Taipei');

describe('POST /auth/register', () => {
  let user, verification;
  beforeEach(async () => {
    verification = await Verification.create({
      id: 1,
      type: 'phone',
      target: '0989889889',
      code: '123456',
      expiresAt: dayjs().add(3, 'minute').toDate()
    });
  });

  afterEach(async () => {
    await verification.destroy();
    if (user) await user.destroy();
    sinon.restore();
  });

  it('正常情況: 註冊成功，回傳200，且cookie要有refreshToken', async () => {
    sinon.stub(generateJWT, 'getAccessToken').resolves('fakeAccessToken');
    sinon.stub(generateJWT, 'getRefreshToken').returns('fakeRefreshToken');
    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').once().resolves();

    const payload = {
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      confirmPassword: '12345678',
      verificationCode: '123456'
    };
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200);

    user = await User.findOne({ where: { phone: '0989889889' } });

    const cookies = response.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((cookie) => cookie.includes('refreshToken'));
    const verification = await Verification.findOne({
      where: { userId: user.id, target: user.email }
    });

    emailServiceMock.verify();
    expect(verification).to.not.be.null;
    expect(refreshTokenCookie).to.include('fakeRefreshToken');
    expect(response.body).to.deep.equal({
      success: true,
      accessToken: 'fakeAccessToken'
    });
  });

  it('錯誤情況: 驗證碼錯誤，回傳400', async () => {
    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    const payload = {
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      confirmPassword: '12345678',
      verificationCode: '654321'
    };
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        verificationCode: 'Verification failed'
      }
    });
  });

  it('錯誤情況: 驗證碼過期，回傳400', async () => {
    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    const payload = {
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      confirmPassword: '12345678',
      verificationCode: '123456'
    };
    verification.expiresAt = dayjs().subtract(1, 'minute').toDate();
    await verification.save();

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        verificationCode: 'Verification failed'
      }
    });
  });

  it('錯誤情況: 密碼不一致，回傳400', async () => {
    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    const payload = {
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      confirmPassword: '123456789',
      verificationCode: '123456'
    };
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 400,
      message: 'Validation error',
      errors: {
        confirmPassword: 'Passwords do not match'
      }
    });
  });

  it('錯誤情況: 手機已經被註冊，回傳400', async () => {
    const emailServiceMock = sinon.mock(emailService);
    emailServiceMock.expects('sendMail').never();

    user = await User.create({
      name: 'test',
      email: 'test@test.com',
      phone: '0989889889',
      password: '12345678',
      isPhoneVerified: true,
      isEmailVerified: true
    });

    const payload = {
      name: 'test',
      email: 'test123@test.com',
      phone: '0989889889',
      password: '12345678',
      confirmPassword: '12345678',
      verificationCode: '123456'
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(409);

    emailServiceMock.verify();
    expect(response.body).to.deep.equal({
      success: false,
      status: 409,
      message: 'Phone number already registered'
    });
  });
});
